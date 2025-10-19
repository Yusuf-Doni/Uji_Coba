<script setup>
// Vue Composition API
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import FileUpload from 'primevue/fileupload';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Textarea from 'primevue/textarea';

// Services
import RapatRUPSService from './service/RapatRUPSService';

// ==========================================
// COMPOSABLES & STORES
// ==========================================
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const route = useRoute();
const authStore = useAuth();

// ==========================================
// REACTIVE DATA
// ==========================================
const activeTab = ref(0);
const isLoading = ref(false);
const jadwalRapatId = ref(null);

// Attachment Document Data
const attachmentData = ref({
    file: null,
    fileName: '',
    fileSize: null,
    fileType: ''
});
const fileAlreadyUploaded = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewFileName = ref('Dokumen RUPS RKAP');

// Arahan & PIC Table Data
const arahanPICList = ref([]);
const showAddArahanDialog = ref(false);
const newArahanForm = ref({
    arahan: '',
    picId: null,
    arahanRUPS: 0,
    targetWaktu: null
});

// ==========================================
// OPTIONS & MAPPINGS
// ==========================================
const picOptions = ref([]);
const arahanRUPSOptions = ref([]);

// ==========================================
// TAB NAVIGATION
// ==========================================
const tabs = ref([
    {
        header: 'Attachment Document',
        icon: 'pi pi-file'
    },
    {
        header: 'Arahan & PIC',
        icon: 'pi pi-users'
    }
]);

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
const validateStep1 = () => {
    if (!attachmentData.value.file) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'File dokumen harus diupload',
            life: 3000
        });
        return false;
    }
    return true;
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
const uploadAttachmentAndNext = async () => {
    if (!jadwalRapatId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Jadwal rapat harus disimpan terlebih dahulu',
            life: 3000
        });
        return;
    }
    
    const isValid = validateStep1();
    if (isValid) {
        await uploadAttachment();
        // Auto navigate to next tab after successful upload
        activeTab.value = 1;
    }
};

const finishAndRedirect = () => {
    const tahun = route.query.tahun || new Date().getFullYear();
    router.push(`/transaction/rapat-rups-rkap/${tahun}/3`);
};

// ==========================================
// API FUNCTIONS
// ==========================================
const uploadAttachment = async () => {
    try {
        isLoading.value = true;
        
        if (!jadwalRapatId.value) {
            throw new Error('ID jadwal rapat tidak ditemukan');
        }
        
        const response = await RapatRUPSService.uploadFileKorporatRUPS(
            jadwalRapatId.value,
            'DOKUMEN_RUPS_RKAP',
            attachmentData.value.file
        );
        
        if (response.data.messages === 'File berhasil di upload') {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Dokumen berhasil diupload',
                life: 3000
            });
        } else {
            throw new Error(response.data?.messages || 'Gagal upload dokumen');
        }
    } catch (error) {
        console.error('Error uploading attachment:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.messages || error.messages || 'Terjadi kesalahan saat upload dokumen',
            life: 3000
        });
        throw error;
    } finally {
        isLoading.value = false;
    }
};

// ==========================================
// FILE UPLOAD FUNCTIONS
// ==========================================
const onFileSelect = (event) => {
    if (!jadwalRapatId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Jadwal rapat harus disimpan terlebih dahulu',
            life: 3000
        });
        return;
    }
    
    const file = event.files[0];
    if (file) {
        // Validate file type
        const allowedTypes = ['application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hanya file PDF yang diperbolehkan',
                life: 3000
            });
            return;
        }
        
        // Validate file size (10MB)
        if (file.size > 10000000) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ukuran file tidak boleh lebih dari 10MB',
                life: 3000
            });
            return;
        }
        
        attachmentData.value.file = file;
        attachmentData.value.fileName = file.name;
        attachmentData.value.fileSize = file.size;
        attachmentData.value.fileType = file.type;
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `File ${file.name} berhasil dipilih`,
            life: 2000
        });
    }
};

const removeFile = () => {
    attachmentData.value.file = null;
    attachmentData.value.fileName = '';
    attachmentData.value.fileSize = null;
    attachmentData.value.fileType = '';
    
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'File berhasil dihapus',
        life: 2000
    });
};

// ==========================================
// ARAHAN & PIC TABLE FUNCTIONS
// ==========================================
const loadArahanPICList = async () => {
    try {
        if (!jadwalRapatId.value) return;
        
        const response = await RapatRUPSService.getArahanByJadwalRapat(jadwalRapatId.value);
        if (response.data && response.data.success) {
            arahanPICList.value = response.data.data || [];
        }
    } catch (error) {
        console.error('Error loading arahan PIC list:', error);
    }
};

const addArahanPIC = () => {
    if (!jadwalRapatId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Jadwal rapat harus disimpan terlebih dahulu',
            life: 3000
        });
        return;
    }
    
    showAddArahanDialog.value = true;
    newArahanForm.value = {
        arahan: '',
        picId: null,
        arahanRUPS: 0,
        targetWaktu: null
    };
};

const saveArahanPIC = async () => {
    try {
        if (!newArahanForm.value.arahan.trim()) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Arahan rapat harus diisi',
                life: 3000
            });
            return;
        }
        
        if (!newArahanForm.value.picId) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'PIC harus dipilih',
                life: 3000
            });
            return;
        }
        
        if (!newArahanForm.value.targetWaktu) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Target waktu harus diisi',
                life: 3000
            });
            return;
        }
        
        const payload = {
            jadwalRapatId: jadwalRapatId.value,
            arahan: newArahanForm.value.arahan,
            picId: [newArahanForm.value.picId],
            arahanRUPS: newArahanForm.value.arahanRUPS,
            targetWaktu: newArahanForm.value.targetWaktu
        };
        
        const response = await RapatRUPSService.saveArahanRapat(payload);
        if (response.data && response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Arahan rapat berhasil ditambahkan',
                life: 3000
            });
            
            showAddArahanDialog.value = false;
            await loadArahanPICList();
        } else {
            throw new Error(response.data?.message || 'Gagal menyimpan arahan rapat');
        }
    } catch (error) {
        console.error('Error saving arahan PIC:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan arahan rapat',
            life: 3000
        });
    }
};

const deleteArahanPIC = async (id) => {
    try {
        confirm.require({
            message: 'Apakah Anda yakin ingin menghapus arahan rapat ini?',
            header: 'Konfirmasi Hapus',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                const response = await RapatRUPSService.deleteArahanRapat(id);
                if (response.data && response.data.success) {
                    toast.add({
                        severity: 'success',
                        summary: 'Berhasil',
                        detail: 'Arahan rapat berhasil dihapus',
                        life: 3000
                    });
                    await loadArahanPICList();
                } else {
                    throw new Error(response.data?.message || 'Gagal menghapus arahan rapat');
                }
            }
        });
    } catch (error) {
        console.error('Error deleting arahan PIC:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menghapus arahan rapat',
            life: 3000
        });
    }
};

const getPICName = (picId) => {
    const pic = picOptions.value.find(p => p.value === picId);
    return pic ? pic.label : picId;
};

const getArahanRUPSLabel = (code) => {
    const option = arahanRUPSOptions.value.find(opt => opt.value === code);
    return option ? option.label : code;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ==========================================
// FILE PREVIEW FUNCTIONS
// ==========================================
const checkExistingFile = async () => {
    if (!jadwalRapatId.value) return;
    
    try {
        const response = await RapatRUPSService.viewFile(jadwalRapatId.value, 'DOKUMEN_RUPS_RKAP');
        
        if (response.data) {
            fileAlreadyUploaded.value = true;
        }
    } catch (error) {
        fileAlreadyUploaded.value = false;
    }
};

const previewFile = async (uploadFileType) => {
    try {
        if (!jadwalRapatId.value) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID jadwal rapat tidak ditemukan',
                life: 3000
            });
            return;
        }

        toast.add({
            severity: 'info',
            summary: 'Loading',
            detail: 'Memuat file...',
            life: 2000
        });

        const response = await RapatRUPSService.viewFile(jadwalRapatId.value, uploadFileType);
        
        // Create blob URL for modal preview
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
        console.error('Error previewing file:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal membuka file: ' + (error.response?.data?.message || error.message || 'File tidak ditemukan'),
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
    // Get jadwal rapat ID from route params
    const meetingId = route.params.id;
    
    if (!meetingId) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'ID jadwal rapat tidak valid',
            life: 3000
        });
        router.push('/transaction/rapat-rups-rkap');
        return;
    }
    
    jadwalRapatId.value = meetingId;
    
    // Check existing file
    await checkExistingFile();
    
    // Load arahan PIC list
    await loadArahanPICList();
    
    // Load PIC options
    try {
        const picResponse = await RapatRUPSService.getPICOptions();
        if (picResponse.data && picResponse.data.success) {
            picOptions.value = picResponse.data.data.map(item => ({
                label: item.value,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('Error loading PIC options:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data PIC',
            life: 3000
        });
    }
    
    // Load Arahan RUPS options
    try {
        const arahanResponse = await RapatRUPSService.getArahanRUPSEnum();
        if (arahanResponse.data && arahanResponse.data.success) {
            arahanRUPSOptions.value = arahanResponse.data.data.map(item => ({
                label: item.description,
                value: item.code
            }));
        }
    } catch (error) {
        console.error('Error loading Arahan RUPS options:', error);
    }
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Edit Rapat RUPS RKAP - Upload & Arahan
        </div>
        
        <!-- User Information -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ authStore.role || 'User' }}
                </span>
            </div>
        </div>

        <!-- Tab Content -->
        <Card>
            <template #content>
                <TabView v-model:activeIndex="activeTab">
                    <!-- Tab 1: Attachment Document -->
                    <TabPanel>
                        <template #header>
                            <i class="pi pi-file mr-2"></i>
                            <span>Attachment Document</span>
                        </template>
                        
                        <div class="space-y-6">
                    <div class="text-left mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">
                            <i class="pi pi-file mr-2"></i>
                            Upload Attachment Document
                        </h3>
                        <p class="text-sm text-gray-600">Upload dokumen yang diperlukan untuk rapat RUPS RKAP</p>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <label class="block font-bold mb-2 text-gray-700">
                                    Upload Dokumen <span class="text-red-500">*</span>
                                </label>
                                
                                <!-- If file already uploaded, show preview button -->
                                <div v-if="fileAlreadyUploaded" class="flex gap-2">
                                    <InputText
                                        value="Dokumen telah diupload"
                                        readonly
                                        class="flex-1 bg-green-50"
                                    />
                                    <Button
                                        label="Preview"
                                        icon="pi pi-eye"
                                        severity="info"
                                        @click="previewFile('DOKUMEN_RUPS_RKAP')"
                                    />
                                </div>
                                
                                <!-- If file not uploaded yet, show upload UI -->
                                <div v-else>
                                    <div class="flex gap-2">
                                        <InputText
                                            :value="attachmentData.fileName"
                                            placeholder="Pilih file dokumen"
                                            readonly
                                            class="flex-1 bg-gray-100"
                                        />
                                        <Button
                                            v-if="attachmentData.file"
                                            icon="pi pi-trash"
                                            severity="danger"
                                            text
                                            rounded
                                            size="small"
                                            @click="removeFile"
                                            class="text-red-500 hover:bg-red-50"
                                            v-tooltip.top="'Hapus File'"
                                        />
                                        <FileUpload
                                            mode="basic"
                                            :auto="true"
                                            :multiple="false"
                                            accept=".pdf,.doc,.docx"
                                            :maxFileSize="10000000"
                                            :disabled="!jadwalRapatId"
                                            @select="onFileSelect"
                                            class="p-button-outlined"
                                        />
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500">
                                        Format yang diperbolehkan: PDF, DOC, DOCX (Max 10MB)
                                    </div>
                                </div>
                                
                                <small v-if="fileAlreadyUploaded" class="text-green-600 mt-2 block">
                                    <i class="pi pi-check-circle text-green-600"></i>
                                    File telah diupload ke server
                                </small>
                            </div>
                        </div>
                    </div>

                            <!-- Action Buttons -->
                    <div v-if="!fileAlreadyUploaded" class="flex justify-end pt-6">
                        <Button
                            label="Upload Dokumen"
                            icon="pi pi-upload"
                            severity="info"
                            :loading="isLoading"
                            :disabled="!attachmentData.file"
                            @click="uploadAttachmentAndNext"
                            class="px-8 py-3"
                        />
                    </div>
                        </div>
                    </TabPanel>

                    <!-- Tab 2: Meeting Directions and PIC -->
                    <TabPanel>
                        <template #header>
                            <i class="pi pi-users mr-2"></i>
                            <span>Arahan & PIC</span>
                        </template>
                        
                        <div class="space-y-6">
                    <div class="text-left mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">
                            <i class="pi pi-users mr-2"></i>
                            Arahan Rapat dan PIC
                        </h3>
                        <p class="text-sm text-gray-600">Kelola arahan rapat dan PIC (Person In Charge)</p>
                    </div>

                    <!-- Add Button -->
                    <div class="flex justify-end mb-4">
                        <Button
                            label="Tambah Arahan"
                            icon="pi pi-plus"
                            severity="primary"
                            :disabled="!jadwalRapatId"
                            @click="addArahanPIC"
                        />
                    </div>

                    <!-- Arahan & PIC Table -->
                    <div class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                        <h4 class="text-md font-semibold text-gray-700 mb-4">PIC & Arahan Rapat</h4>
                        
                        <div v-if="arahanPICList.length === 0" class="text-center py-12 text-gray-500">
                            <i class="pi pi-inbox text-6xl mb-4 text-gray-400"></i>
                            <p class="text-lg">Belum ada arahan rapat. Klik "Tambah Arahan" untuk menambahkan.</p>
                        </div>
                        
                        <div v-else class="overflow-x-auto">
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="border border-gray-300 px-4 py-2 text-left font-bold">No</th>
                                        <th class="border border-gray-300 px-4 py-2 text-left font-bold">PIC</th>
                                        <th class="border border-gray-300 px-4 py-2 text-left font-bold">Arahan Rapat</th>
                                        <th class="border border-gray-300 px-4 py-2 text-left font-bold">Arahan RUPS</th>
                                        <th class="border border-gray-300 px-4 py-2 text-left font-bold">Target Waktu</th>
                                        <th class="border border-gray-300 px-4 py-2 text-center font-bold">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in arahanPICList" :key="item.id" class="hover:bg-gray-50">
                                        <td class="border border-gray-300 px-4 py-2">{{ index + 1 }}</td>
                                        <td class="border border-gray-300 px-4 py-2">{{ item.namaPic || getPICName(item.picId) }}</td>
                                        <td class="border border-gray-300 px-4 py-2">{{ item.arahan }}</td>
                                        <td class="border border-gray-300 px-4 py-2">{{ item.arahanRUPS || getArahanRUPSLabel(item.arahanRUPS) }}</td>
                                        <td class="border border-gray-300 px-4 py-2">{{ formatDate(item.targetWaktu) }}</td>
                                        <td class="border border-gray-300 px-4 py-2 text-center">
                                            <Button
                                                icon="pi pi-trash"
                                                severity="danger"
                                                text
                                                rounded
                                                size="small"
                                                @click="deleteArahanPIC(item.id)"
                                                v-tooltip.top="'Hapus'"
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                            <!-- Finish Button -->
                            <div class="flex justify-end pt-6">
                                <Button
                                    label="Selesai"
                                    icon="pi pi-check"
                                    severity="success"
                                    :loading="isLoading"
                                    @click="finishAndRedirect"
                                    class="px-8 py-3"
                                />
                            </div>
                        </div>
                    </TabPanel>
                </TabView>
            </template>
        </Card>
    </div>
    
    <!-- Add Arahan Dialog -->
    <Dialog 
        v-model:visible="showAddArahanDialog" 
        modal 
        header="Tambah Arahan Rapat" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="space-y-4">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 lg:col-span-6">
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-4 font-bold text-gray-700 self-center">
                            PIC <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-8">
                            <Select 
                                v-model="newArahanForm.picId"
                                :options="picOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih PIC"
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div class="col-span-12 lg:col-span-6">
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-4 font-bold text-gray-700 self-center">
                            Arahan RUPS <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-8">
                            <Select 
                                v-model="newArahanForm.arahanRUPS"
                                :options="arahanRUPSOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih Arahan RUPS"
                                class="w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 lg:col-span-6">
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-4 font-bold text-gray-700 self-center">
                            Target Waktu <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-8">
                            <DatePicker 
                                v-model="newArahanForm.targetWaktu"
                                placeholder="Pilih target waktu"
                                class="w-full"
                                dateFormat="yy-mm-dd"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-12 gap-2">
                <label class="col-span-2 font-bold text-gray-700">
                    Arahan Rapat <span class="text-red-500">*</span>
                </label>
                <div class="col-span-10">
                    <Textarea
                        v-model="newArahanForm.arahan"
                        placeholder="Masukkan arahan rapat"
                        class="w-full"
                        rows="4"
                    />
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button 
                    label="Batal" 
                    severity="secondary" 
                    @click="showAddArahanDialog = false" 
                />
                <Button 
                    label="Simpan" 
                    severity="primary" 
                    @click="saveArahanPIC" 
                    :loading="isLoading"
                />
            </div>
        </template>
    </Dialog>
    
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
    <ConfirmDialog />
</template>

<style scoped lang="scss">
// Custom styles
.space-y-6 > * + * {
    margin-top: 1.5rem;
}

.space-y-4 > * + * {
    margin-top: 1rem;
}

// Tab component styling
:deep(.p-tabview) {
    .p-tabview-nav {
        .p-tabview-nav-link {
            transition: all 0.2s ease;
            
            &:hover {
                background-color: var(--primary-50);
            }
            
            &.p-tabview-nav-link-active {
                background-color: var(--primary-color);
                color: white;
            }
        }
    }
}

// Form styling
:deep(.p-inputtext),
:deep(.p-inputnumber),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-textarea) {
    width: 100%;
}

// File upload styling
:deep(.p-fileupload) {
    .p-button {
        padding: 0.5rem 1rem;
    }
}
</style>