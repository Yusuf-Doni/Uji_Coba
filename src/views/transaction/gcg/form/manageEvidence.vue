<script setup>
import GCGService from '../service/GCGService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores';

const evidenceList = ref([]);
const isLoading = ref(false);
const isUploading = ref(false);
const route = useRoute();
const router = useRouter();
const toast = useToast();

const gcgId = ref(route.params.id);
const parameterId = ref(route.query.parameterId);

// File upload state
const selectedFiles = ref([]);
const uploadProgress = ref(0);

// Allowed file types
const allowedFileTypes = ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

const loadEvidence = async () => {
    if (!gcgId.value) return;
    
    isLoading.value = true;
    try {
        const response = await GCGService.getEvidence(gcgId.value);
        if (response.data.code === 200) {
            evidenceList.value = response.data.data;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: response.data.message || 'Gagal memuat data evidence',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error loading evidence:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat memuat data evidence',
            life: 3000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isLoading.value = false;
    }
};

const validateFile = (file) => {
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedFileTypes.includes(fileExtension)) {
        toast.add({
            severity: 'error',
            summary: 'File tidak valid',
            detail: `File type ${fileExtension} tidak diperbolehkan. Gunakan PDF, Excel, Word, atau PowerPoint.`,
            life: 3000
        });
        return false;
    }
    
    if (file.size > maxFileSize) {
        toast.add({
            severity: 'error',
            summary: 'File terlalu besar',
            detail: `Ukuran file maksimal 10MB. File saat ini: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            life: 3000
        });
        return false;
    }
    
    return true;
};

const onFileSelect = (event) => {
    const files = Array.from(event.files);
    selectedFiles.value = files.filter(file => validateFile(file));
};

const uploadFiles = async () => {
    if (selectedFiles.value.length === 0) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Pilih file terlebih dahulu',
            life: 3000
        });
        return;
    }
    
    isUploading.value = true;
    uploadProgress.value = 0;
    
    try {
        const uploadPromises = selectedFiles.value.map(async (file, index) => {
            const response = await GCGService.uploadEvidence(gcgId.value, parameterId.value, file);
            
            // Update progress
            uploadProgress.value = Math.round(((index + 1) / selectedFiles.value.length) * 100);
            
            return response;
        });
        
        await Promise.all(uploadPromises);
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `${selectedFiles.value.length} file berhasil diupload`,
            life: 3000
        });
        
        // Clear selected files and reload evidence list
        selectedFiles.value = [];
        uploadProgress.value = 0;
        loadEvidence();
        
    } catch (error) {
        console.error('Error uploading files:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat mengupload file',
            life: 3000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isUploading.value = false;
    }
};

const deleteEvidence = async (evidenceId, fileName) => {
    try {
        const response = await GCGService.deleteEvidence(evidenceId);
        if (response.data.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `File ${fileName} berhasil dihapus`,
                life: 3000
            });
            loadEvidence();
        } else {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: response.data.message || 'Gagal menghapus file',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error deleting evidence:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat menghapus file',
            life: 3000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    }
};

const downloadFile = (evidence) => {
    // Create download link
    const link = document.createElement('a');
    link.href = evidence.downloadUrl || evidence.url;
    link.download = evidence.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf':
            return 'pi pi-file-pdf text-red-500';
        case 'xlsx':
        case 'xls':
            return 'pi pi-file-excel text-green-500';
        case 'docx':
        case 'doc':
            return 'pi pi-file-word text-blue-500';
        case 'pptx':
        case 'ppt':
            return 'pi pi-file text-orange-500';
        default:
            return 'pi pi-file text-gray-500';
    }
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const onClickKembali = () => {
    router.push('/gcg');
};

onMounted(() => {
    loadEvidence();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            Manajemen Evidence GCG
            <span class="text-sm text-gray-500 ml-2">
                (Parameter ID: {{ parameterId }})
            </span>
        </div>
        
        <div class="card">
            <div class="flex justify-end mb-4">
                <Button
                    class="w-max"
                    severity="warn"
                    type="button"
                    @click="onClickKembali"
                    :label="'Kembali'"
                />
            </div>
            
            <!-- Upload Section -->
            <Fieldset legend="Upload Evidence" class="mb-6">
                <div class="grid grid-cols-12 gap-4">
                    <div class="col-span-8">
                        <label class="block font-bold mb-2">
                            Pilih File Evidence
                        </label>
                        <FileUpload
                            mode="basic"
                            name="evidenceFiles"
                            :accept="'.pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt'"
                            :maxFileSize="maxFileSize"
                            :multiple="true"
                            @select="onFileSelect"
                            :auto="false"
                            chooseLabel="Pilih File"
                            class="w-full"
                        />
                        <small class="text-gray-500">
                            Format yang diperbolehkan: PDF, Excel, Word, PowerPoint. Maksimal 10MB per file.
                        </small>
                    </div>
                    
                    <div class="col-span-4 flex items-end">
                        <Button
                            label="Upload Files"
                            icon="pi pi-upload"
                            severity="success"
                            @click="uploadFiles"
                            :loading="isUploading"
                            :disabled="selectedFiles.length === 0"
                            class="w-full"
                        />
                    </div>
                </div>
                
                <!-- Upload Progress -->
                <div v-if="isUploading" class="mt-4">
                    <ProgressBar :value="uploadProgress" />
                    <small class="text-gray-500">Uploading... {{ uploadProgress }}%</small>
                </div>
                
                <!-- Selected Files Preview -->
                <div v-if="selectedFiles.length > 0" class="mt-4">
                    <h4 class="font-semibold mb-2">File yang akan diupload:</h4>
                    <div class="grid grid-cols-1 gap-2">
                        <div 
                            v-for="(file, index) in selectedFiles" 
                            :key="index"
                            class="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                            <div class="flex items-center gap-2">
                                <i :class="getFileIcon(file.name)"></i>
                                <span class="text-sm">{{ file.name }}</span>
                                <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Fieldset>
            
            <!-- Evidence List -->
            <Fieldset legend="Daftar Evidence">
                <div v-if="isLoading">
                    <Skeleton class="mb-2"></Skeleton>
                    <Skeleton class="mb-2"></Skeleton>
                    <Skeleton class="mb-2"></Skeleton>
                </div>
                
                <div v-else-if="evidenceList.length === 0" class="text-center py-8">
                    <i class="pi pi-file text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500">Belum ada evidence yang diupload</p>
                </div>
                
                <div v-else class="grid grid-cols-1 gap-4">
                    <div 
                        v-for="evidence in evidenceList" 
                        :key="evidence.id"
                        class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                        <div class="flex items-center gap-3">
                            <i :class="getFileIcon(evidence.fileName)" class="text-2xl"></i>
                            <div>
                                <h4 class="font-semibold">{{ evidence.fileName }}</h4>
                                <p class="text-sm text-gray-500">
                                    {{ formatFileSize(evidence.fileSize) }} • 
                                    Uploaded: {{ new Date(evidence.uploadedAt).toLocaleDateString('id-ID') }}
                                </p>
                                <p v-if="evidence.description" class="text-sm text-gray-600 mt-1">
                                    {{ evidence.description }}
                                </p>
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-2">
                            <Button
                                icon="pi pi-download"
                                severity="info"
                                text
                                rounded
                                size="small"
                                @click="downloadFile(evidence)"
                                v-tooltip.bottom="'Download'"
                            />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                text
                                rounded
                                size="small"
                                @click="deleteEvidence(evidence.id, evidence.fileName)"
                                v-tooltip.bottom="'Hapus'"
                            />
                        </div>
                    </div>
                </div>
            </Fieldset>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-fileupload) {
    .p-fileupload-buttonbar {
        background: transparent;
        border: none;
        padding: 0;
    }
    
    .p-button {
        width: 100%;
    }
}

:deep(.p-progressbar) {
    height: 8px;
    border-radius: 4px;
}
</style>
