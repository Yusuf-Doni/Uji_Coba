<script setup>
// Vue Composition API
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import DatePicker from 'primevue/datepicker';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import Dialog from 'primevue/dialog';

// Services
import KepdirSirkulerService from '../service/KepdirSirkuler';

// ==========================================
// COMPOSABLES & STORES
// ==========================================
const toast = useToast();
const router = useRouter();
const route = useRoute();
const authStore = useAuth();

// ==========================================
// REACTIVE DATA
// ==========================================
const isLoading = ref(false);
const isLoadingUpload = ref(false);
const tahunParam = ref(route.params.tahun || new Date().getFullYear().toString());
const kepdirId = ref(route.query.id || '');
const selectedFile = ref(null);
const fileAlreadyUploaded = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewFileName = ref('Form Review Governance');

// Form data
const formData = ref({
    judul: '',
    tanggalTerbit: new Date()
});

// ==========================================
// FILE HANDLING
// ==========================================
const handleFileSelect = (event) => {
    const file = event.files[0];
    if (file) {
        // Validate file type
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'File harus berformat PDF',
                life: 3000
            });
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ukuran file maksimal 10MB',
                life: 3000
            });
            return;
        }
        
        selectedFile.value = file;
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `File ${file.name} berhasil dipilih`,
            life: 3000
        });
    }
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
const validateForm = () => {
    const { judul, tanggalTerbit } = formData.value;
    
    if (!judul.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Judul Kepdir Sirkuler harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!tanggalTerbit) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Tanggal Terbit Kepdir Sirkuler harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!selectedFile.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'File Form Review Governance harus dipilih',
            life: 3000
        });
        return false;
    }
    
    if (!kepdirId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Kepdir ID tidak ditemukan',
            life: 3000
        });
        return false;
    }
    
    return true;
};

// ==========================================
// SUBMIT FUNCTIONS
// ==========================================
const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }
    
    isLoadingUpload.value = true;
    
    try {
        console.log('Uploading Form Review Governance...');
        
        const response = await KepdirSirkulerService.uploadReviewGovernance({
            kepdirId: kepdirId.value,
            uploadFileType: 'FORM_REVIEW_GOVERNENCE',
            file: selectedFile.value
        });
        
        console.log('Upload response:', response);
        
        if (response.data && response.data.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Form Review Governance berhasil diupload!',
                life: 3000
            });
            
            setTimeout(() => {
                router.push(`/transaction/rapat-kepdir-sirkular/${tahunParam.value}`);
            }, 1500);
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: response.data?.message || 'Gagal mengupload file',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat mengupload file',
            life: 3000
        });
    } finally {
        isLoadingUpload.value = false;
    }
};

const handleCancel = () => {
    router.push(`/transaction/rapat-kepdir-sirkular/${tahunParam.value}`);
};

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================
const checkExistingFile = async () => {
    if (!kepdirId.value) return;
    
    try {
        const response = await KepdirSirkulerService.viewKepdirFile({
            kepdirId: kepdirId.value,
            uploadFileType: 'FORM_REVIEW_GOVERNENCE'
        });
        
        // If response is successful, file exists
        if (response.data) {
            fileAlreadyUploaded.value = true;
            console.log('Form Review Governance already uploaded');
        }
    } catch (error) {
        // File doesn't exist yet, that's okay
        fileAlreadyUploaded.value = false;
        console.log('Form Review Governance not uploaded yet');
    }
};

const loadKepdirData = async () => {
    if (!kepdirId.value) {
        console.log('No kepdir ID provided, skipping data load');
        return;
    }
    
    try {
        console.log('Loading kepdir data for ID:', kepdirId.value);
        const response = await KepdirSirkulerService.getById(kepdirId.value);
        console.log('Kepdir data response:', response);
        
        if (response.data && response.data.code === 200) {
            const kepdirData = response.data.data;
            console.log('Kepdir data loaded:', kepdirData);
            
            // Fill form with existing kepdir data
            formData.value.judul = kepdirData.judulKepdir || '';
            if (kepdirData.tanggalTerbit) {
                formData.value.tanggalTerbit = new Date(kepdirData.tanggalTerbit);
            }
            
            console.log('Form filled with:', formData.value);
        } else {
            console.log('No kepdir data found or invalid response');
        }
    } catch (error) {
        console.error('Error loading kepdir data:', error);
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Gagal memuat data kepdir, menggunakan data dari URL parameter',
            life: 3000
        });
        
        // Fallback to URL parameters if API fails
        if (route.query.judul) {
            formData.value.judul = route.query.judul;
        }
        if (route.query.tanggalTerbit) {
            formData.value.tanggalTerbit = new Date(route.query.tanggalTerbit);
        }
    }
};

const viewExistingFile = async () => {
    toast.add({
        severity: 'info',
        summary: 'Loading',
        detail: 'Memuat file...',
        life: 2000
    });
    
    try {
        const response = await KepdirSirkulerService.viewKepdirFile({
            kepdirId: kepdirId.value,
            uploadFileType: 'FORM_REVIEW_GOVERNENCE'
        });
        
        // Create blob URL for preview in modal
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        previewUrl.value = url;
        showPreviewDialog.value = true;
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'File berhasil dimuat',
            life: 2000
        });
    } catch (error) {
        console.error('Error viewing file:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat file: ' + (error.response?.data?.message || error.message || 'File tidak ditemukan'),
            life: 3000
        });
    }
};

const closePreviewDialog = () => {
    showPreviewDialog.value = false;
    if (previewUrl.value) {
        window.URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
    }
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(async () => {
    console.log('UploadFormReviewGovernance mounted');
    console.log('Route query:', route.query);
    console.log('kepdirId:', kepdirId.value);
    
    await loadKepdirData();
    await checkExistingFile();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Upload Form Review Governance
            <span v-if="tahunParam" class="text-lg text-gray-600 ml-2">
                - Tahun {{ tahunParam }}
            </span>
        </div>

        <!-- User Information -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ authStore.role || 'N/A' }}
                </span>
            </div>
        </div>

        <!-- Form Card -->
        <Card>
            <template #content>
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Judul Kepdir Sirkuler -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Judul Kepdir Sirkuler <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <InputText
                                v-model="formData.judul"
                                placeholder="Masukkan Judul Kepdir Sirkuler"
                                class="w-full"
                                :disabled="isLoading || isLoadingUpload"
                                readonly
                            />
                        </div>
                    </div>

                    <!-- Tanggal Terbit Kepdir Sirkuler -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Tanggal Terbit Kepdir Sirkuler <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <DatePicker
                                v-model="formData.tanggalTerbit"
                                dateFormat="dd/mm/yy"
                                placeholder="Calendar"
                                showIcon
                                class="w-full"
                                :disabled="isLoading || isLoadingUpload"
                                readonly
                            />
                        </div>
                    </div>

                    <!-- Form Review Governance Upload/Preview -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Form Review Governance <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <!-- If file already uploaded, show preview button -->
                            <div v-if="fileAlreadyUploaded" class="flex gap-2">
                                <InputText
                                    value="Form Review Governance telah diupload"
                                    readonly
                                    class="flex-1 bg-green-50"
                                    :disabled="isLoading"
                                />
                                <Button
                                    label="Preview"
                                    icon="pi pi-eye"
                                    severity="info"
                                    @click="viewExistingFile"
                                    :disabled="isLoading"
                                />
                            </div>
                            <!-- If file not uploaded yet, show upload UI -->
                            <div v-else class="flex gap-2">
                                <InputText
                                    :value="selectedFile ? selectedFile.name : ''"
                                    placeholder="Pilih Form Review Governance (PDF)"
                                    readonly
                                    class="flex-1"
                                    :disabled="isLoading || isLoadingUpload"
                                />
                                <FileUpload
                                    mode="basic"
                                    :auto="false"
                                    :multiple="false"
                                    accept=".pdf"
                                    :maxFileSize="10000000"
                                    @select="handleFileSelect"
                                    class="p-button-outlined"
                                    :disabled="isLoading || isLoadingUpload"
                                />
                            </div>
                            <small v-if="selectedFile" class="text-gray-600 mt-2 block">
                                <i class="pi pi-check-circle text-green-600"></i>
                                File terpilih: {{ selectedFile.name }} ({{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB)
                            </small>
                            <small v-if="fileAlreadyUploaded" class="text-green-600 mt-2 block">
                                <i class="pi pi-check-circle text-green-600"></i>
                                File telah diupload ke server
                            </small>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-4 justify-end">
                        <Button
                            label="Batal"
                            severity="secondary"
                            outlined
                            @click="handleCancel"
                            :disabled="isLoading || isLoadingUpload"
                        />
                        <Button
                            v-if="!fileAlreadyUploaded"
                            type="submit"
                            label="Upload Form Review Governance"
                            severity="success"
                            icon="pi pi-upload"
                            :loading="isLoadingUpload"
                            :disabled="!selectedFile || isLoadingUpload"
                        />
                    </div>
                </form>
            </template>
        </Card>
    </div>
    
    <!-- Preview Dialog -->
    <Dialog
        v-model:visible="showPreviewDialog"
        modal
        :header="previewFileName"
        :style="{ width: '90vw', height: '90vh' }"
        :closable="true"
        @hide="closePreviewDialog"
    >
        <div class="flex justify-center items-center" style="height: calc(90vh - 100px);">
            <iframe
                v-if="previewUrl"
                :src="previewUrl"
                style="width: 100%; height: 100%; border: none;"
                title="File Preview"
            />
        </div>
    </Dialog>

    <!-- Global Components -->
    <Toast />
</template>

<style scoped>
/* Custom styles if needed */
</style>
