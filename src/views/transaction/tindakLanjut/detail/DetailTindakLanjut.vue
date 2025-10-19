<script setup>
import { ref, reactive, onMounted, computed } from 'vue'; 
import { useToast } from 'primevue/usetoast';
import { useRouter, useRoute } from 'vue-router';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import FileUpload from 'primevue/fileupload';
import TindakLanjutService from '../service/TindakLanjutService';
import ImagePreview from '@/views/component/ImagePreview.vue';
import { useAuth } from '@/stores';

const toast = useToast();
const router = useRouter();
const route = useRoute();
const dataTindakLanjut = ref();
const isLoadingDetail = ref(false);

// Get id from query parameters
const id = route.query.id;
const mode = route.query.mode;

// Computed property untuk menentukan apakah dalam mode view
const isViewMode = computed(() => {
    return mode === 'pic' || mode === 'view';
});

// Log untuk debugging
console.log('ID yang diterima:', id);
console.log('Mode:', mode);
console.log('Is View Mode:', isViewMode.value);

// Form data
const formData = reactive({
    id: '',
    jadwalRapatId: '',
    agenda: '',
    picId: '',
    namaPic: '',
    statusApproval: 0,
    actionPlan: '',
    progress: '',
    deskripsi: '',
    arahan: '',
    arahanId: '',
    jenisFile: 'materi tindak lanjut',
    fileName: '',
    contentType: '',
    path: ''
});

// Progress options
const progressOptions = [
    { label: 'Belum Dimulai', value: 0 },
    { label: 'Dalam Proses', value: 1 },
    { label: 'Selesai', value: 2 },
    { label: 'Menunggu Approval', value: 3 }
];

// File upload - Enhanced tracking
const selectedFile = ref(null);
const fileInput = ref(null);
const fileExists = ref(false); // Track if file already exists on server
const fileUploadMode = ref('upload'); // Track upload mode: 'upload' or 'update'
const isUploading = ref(false);
const uploadedFileUrl = ref('');
const showImagePreview = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');
const uploadFileType = ref('MATERI_TINDAK_LANJUT'); // Default file type

// Methods
const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        selectedFile.value = file;
        formData.fileName = file.name;
        formData.contentType = file.type;
        
        // When a file is selected, switch to upload mode
        fileUploadMode.value = 'upload';
        
        toast.add({
            severity: 'success',
            summary: 'File Selected',
            detail: `File ${file.name} berhasil dipilih`,
            life: 3000
        });
    }
};

// Function to check if file exists on server
const checkFileExists = async () => {
    try {
        if (!formData.id) return false;

        // Try to view the file to check if it exists
        await TindakLanjutService.viewFileTindakLanjut({
            id: formData.id,
            uploadFileType: uploadFileType.value
        });
        
        return true;
    } catch (error) {
        // If file doesn't exist, the API will return an error
        console.log(`File ${uploadFileType.value} does not exist on server`);
        return false;
    }
};

// Individual upload/update function for file
const uploadIndividualFile = async () => {
    if (!selectedFile.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Pilih file terlebih dahulu',
            life: 3000
        });
        return;
    }

    // Set loading state
    isUploading.value = true;

    try {
        const uploadParams = {
            id: formData.id,
            uploadFileType: uploadFileType.value,
            file: selectedFile.value
        };

        console.log('Uploading/updating file:', uploadParams);
        
        // Call appropriate API method based on whether file exists
        let response;
        const isUpdate = fileExists.value;
        
        if (isUpdate) {
            // Use PATCH for updating existing file
            response = await TindakLanjutService.updateMateriTindakLanjut(uploadParams);
            console.log('File updated using PATCH');
        } else {
            // Use POST for new file upload
            response = await TindakLanjutService.uploadMateriTindakLanjut(uploadParams);
            console.log('File uploaded using POST');
        }
        
        // Log response for debugging
        console.log('API Response received:', {
            status: response.status,
            data: response.data,
            fullResponse: response
        });
        
        // Check for success response - handle both status 200 and response.data.code === 200
        if ((response.status === 200 || response.data?.code === 200)) {
            const action = isUpdate ? 'diupdate' : 'diupload';
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `File ${selectedFile.value.name} berhasil ${action}`,
                life: 3000
            });
            
            // Store uploaded file URL for preview and mark as existing
            uploadedFileUrl.value = response.data?.data?.fileUrl || response.data?.fileUrl || `uploaded-${uploadFileType.value}`;
            fileExists.value = true;
            fileUploadMode.value = 'update'; // Switch to update mode for future uploads
            
            // Clear selected file after successful upload
            selectedFile.value = null;
        } else {
            throw new Error(response.data?.message || response.message || 'Upload/Update gagal');
        }
    } catch (error) {
        console.error('Upload/Update error:', error);
        const action = fileExists.value ? 'mengupdate' : 'mengupload';
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Gagal ${action} file: ${error.message}`,
            life: 3000
        });
    } finally {
        isUploading.value = false;
    }
};

// Preview uploaded file using viewFile API
const previewFile = async () => {
    try {
        if (!formData.id) {
            toast.add({
                severity: 'error',
                summary: 'Kesalahan',
                detail: 'ID tindak lanjut tidak ditemukan',
                life: 3000
            });
            return;
        }

        // Show loading state
        toast.add({
            severity: 'info',
            summary: 'Loading',
            detail: 'Memuat file...',
            life: 2000
        });

        console.log('Attempting to view file with:', {
            id: formData.id,
            uploadFileType: uploadFileType.value
        });

        // Call viewFile API
        const response = await TindakLanjutService.viewFileTindakLanjut({
            id: formData.id,
            uploadFileType: uploadFileType.value
        });

        console.log('API Response received:', {
            url: response.config.url,
            status: response.status,
            headers: response.headers,
            dataType: typeof response.data,
            dataSize: response.data?.size || 'unknown'
        });

        // Handle the blob response
        const blob = response.data;
        
        // Determine MIME type based on file extension or default to PDF
        let mimeType = blob.type;
        
        // If no MIME type or generic type, try to determine from filename
        if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'text/plain') {
            const fileName = formData.fileName || 'document';
            const extension = fileName.split('.').pop()?.toLowerCase();
            
            switch (extension) {
                case 'pdf':
                    mimeType = 'application/pdf';
                    break;
                case 'doc':
                case 'docx':
                    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
                case 'xls':
                case 'xlsx':
                    mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case 'ppt':
                case 'pptx':
                    mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
                    break;
                default:
                    mimeType = 'application/pdf'; // Default to PDF for tindak lanjut files
            }
            
            console.log('Determined MIME type:', mimeType, 'for file:', fileName);
        }
        
        // Create a new blob with the correct MIME type
        const typedBlob = new Blob([blob], { type: mimeType });
        const fileUrl = URL.createObjectURL(typedBlob);
        
        previewUrl.value = fileUrl;
        previewFileName.value = formData.fileName || 'Materi Tindak Lanjut';
        showImagePreview.value = true;

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'File berhasil dimuat',
            life: 2000
        });

    } catch (error) {
        console.error('Error viewing file:', error);
        
        let errorMessage = 'Tidak dapat memuat file. Pastikan file sudah diupload.';
        
        // Provide more specific error messages
        if (error.response) {
            const status = error.response.status;
            if (status === 404) {
                errorMessage = 'File tidak ditemukan di server.';
            } else if (status === 401) {
                errorMessage = 'Session expired. Silakan login kembali.';
                router.push('/auth/login');
            } else if (status === 403) {
                errorMessage = 'Anda tidak memiliki izin untuk melihat file ini.';
            } else if (status === 500) {
                errorMessage = 'Terjadi kesalahan pada server.';
            } else {
                errorMessage = error.response.data?.message || `Error ${status}: Tidak dapat memuat file.`;
            }
        } else if (error.request) {
            errorMessage = 'Tidak dapat terhubung ke server.';
        }
        
        // Fallback to existing uploaded file URL if API fails
        if (uploadedFileUrl.value) {
            previewUrl.value = uploadedFileUrl.value;
            previewFileName.value = formData.fileName || 'File';
            showImagePreview.value = true;
            
            toast.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Menggunakan file yang sudah diupload',
                life: 3000
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Kesalahan',
                detail: errorMessage,
                life: 3000
            });
        }
    }
};



const getDetail = async () => {
    if (id) {
        isLoadingDetail.value = true;
        console.log('Loading detail for ID:', id);
        
        try {
            const response = await TindakLanjutService.getById(id);
            console.log('Detail response:', response);
            
            if (response.data && response.data.code === 200) {
                dataTindakLanjut.value = response.data.data;
                const apiData = response.data.data;
                console.log('API Data:', apiData);
                
                // Map API data to form fields
                formData.agenda = apiData.agenda || '';
                formData.deskripsi = apiData.deskripsi || '';
                formData.arahan = apiData.arahan || '';
                formData.arahanId = apiData.arahanId || '';
                formData.path = apiData.path || ''; // TODO: Verify if path is correct field for target waktu
                formData.picId = apiData.picId || '';
                formData.namaPic = apiData.namaPic || '';
                formData.actionPlan = apiData.actionPlan || '';
                formData.progress = apiData.progress || 0;
                formData.fileName = apiData.fileName || '';
                formData.jenisFile = apiData.jenisFile || '';
                formData.contentType = apiData.contentType || '';
                formData.statusApproval = apiData.statusApproval || 0;
                formData.jadwalRapatId = apiData.jadwalRapatId || '';
                formData.id = apiData.id || '';
                
                console.log('Form data after mapping:', formData);
                
                // Check if file already exists on server
                if (formData.id) {
                    try {
                        const exists = await checkFileExists();
                        fileExists.value = exists;
                        fileUploadMode.value = exists ? 'update' : 'upload';
                        console.log('File exists:', exists);
                    } catch (error) {
                        console.error('Error checking file existence:', error);
                        fileExists.value = false;
                        fileUploadMode.value = 'upload';
                    }
                }
            } else {
                console.error('Failed to load detail:', response.data);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal memuat data detail',
                    life: 3000
                });
            }
        } catch (error) {
            console.error('Error loading detail:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal memuat data detail',
                life: 3000
            });
        } finally {
            isLoadingDetail.value = false;
        }
    } else {
        console.error('No ID provided for detail loading');
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'ID tidak ditemukan',
            life: 3000
        });
    }
};


const handleFileChoose = () => {
    fileInput.value.click();
};

const isLoadingSave = ref(false);

const handleSave = async () => {
    try {
        // Set loading state
        isLoadingSave.value = true;
        
        // Validate required fields
        if (!formData.actionPlan.trim()) {
            toast.add({
                severity: 'warn',
                summary: 'Validasi',
                detail: 'Action Plan harus diisi',
                life: 3000
            });
            return;
        }

        if (formData.progress === null || formData.progress === undefined) {
            toast.add({
                severity: 'warn',
                summary: 'Validasi',
                detail: 'Progress harus dipilih',
                life: 3000
            });
            return;
        }

        if (!formData.arahanId) {
            toast.add({
                severity: 'warn',
                summary: 'Validasi',
                detail: 'Arahan ID tidak ditemukan. Silakan refresh halaman dan coba lagi.',
                life: 3000
            });
            return;
        }

        // Check if ID exists
        if (!formData.id) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID tidak ditemukan. Silakan refresh halaman dan coba lagi.',
                life: 3000
            });
            return;
        }

        // Validate required fields for API
        if (!formData.jadwalRapatId) {
            toast.add({
                severity: 'warn',
                summary: 'Validasi',
                detail: 'Jadwal Rapat ID tidak ditemukan. Silakan refresh halaman dan coba lagi.',
                life: 3000
            });
            return;
        }

        if (!formData.picId) {
            toast.add({
                severity: 'warn',
                summary: 'Validasi',
                detail: 'PIC ID tidak ditemukan. Silakan refresh halaman dan coba lagi.',
                life: 3000
            });
            return;
        }

        // Check if action plan and progress already exist (for update scenario)
        const hasExistingData = formData.actionPlan && formData.progress !== undefined;
        console.log('Has existing action plan and progress:', hasExistingData);

        // Prepare data for API call according to API specification
        const saveData = {
            jadwalRapatId: formData.jadwalRapatId,
            arahanId: formData.arahanId,
            picId: formData.picId,
            statusApproval: formData.statusApproval,
            actionPlan: formData.actionPlan,
            progress: formData.progress,
            deskripsi: formData.deskripsi,
            statusTindaklanjut: formData.statusApproval // Map statusApproval to statusTindaklanjut as per API spec
        };

        console.log('=== SAVE DATA DEBUGGING ===');
        console.log('Form Data:', saveData);
        console.log('Selected File:', selectedFile.value);
        console.log('ID to update:', formData.id);
        console.log('Has existing data - proceeding with update:', hasExistingData);
        console.log('Arahan ID:', formData.arahanId);
        console.log('Jadwal Rapat ID:', formData.jadwalRapatId);
        console.log('PIC ID:', formData.picId);
        console.log('Status Approval:', formData.statusApproval);
        console.log('============================');

        // Check authentication before making the request
        const authStore = useAuth();
        console.log('Current token:', authStore.token);
        console.log('Is logged in:', authStore.isLoggedIn);
        console.log('Token from localStorage:', localStorage.getItem('token'));
        
        if (!authStore.token) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Session expired. Silakan login kembali.',
                life: 3000
            });
            console.log('Session expired, masuk sini');
            router.push('/auth/login');
            return;
        }

        // Call API to save data using PUT method
        // Note: File upload is now handled separately by uploadIndividualFile function
        console.log('Calling PUT API with data:', saveData);
        
        const response = await TindakLanjutService.put(formData.id, saveData);
        console.log('Response:', response);
        
        // Handle success response
        if (response.status === 200 || (response.data && response.data.code === 200)) {
            const successMessage = hasExistingData 
                ? 'Data tindak lanjut rapat berhasil diperbarui'
                : 'Data tindak lanjut rapat berhasil disimpan';
                
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: successMessage,
                life: 3000
            });

            // Navigate back after successful save
            setTimeout(() => {
                router.go(-1);
            }, 1500);
        } else {
            // Handle API error response
            const errorMessage = response.data?.message || response.data?.error || response.message || 'Gagal menyimpan data';
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: errorMessage,
                life: 3000
            });
            console.error('Save failed:', response.data || response);
        }
    } catch (error) {
        console.error('Save error details:', error);
        
        let errorMessage = 'Gagal menyimpan data tindak lanjut rapat';
        
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;
            
            console.error('Error response:', { status, data });
            
            if (status === 401) {
                errorMessage = 'Session expired. Silakan login kembali.';
                const authStore = useAuth();
                authStore.removeCredentials();
                router.push('/auth/login');
            } else if (status === 403) {
                errorMessage = 'Anda tidak memiliki izin untuk melakukan aksi ini.';
            } else if (status === 404) {
                errorMessage = 'Data tidak ditemukan.';
            } else if (status === 422) {
                errorMessage = data?.message || 'Data yang dikirim tidak valid.';
            } else if (status === 500) {
                errorMessage = 'Terjadi kesalahan pada server. Silakan coba lagi.';
            } else {
                errorMessage = data?.message || data?.error || `Error ${status}: Gagal menyimpan data`;
            }
        } else if (error.request) {
            // Request was made but no response received
            errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
            console.error('No response received:', error.request);
        } else {
            // Something else happened
            errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui.';
            console.error('Request setup error:', error.message);
        }
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        // Always reset loading state
        isLoadingSave.value = false;
    }
};

const handleCancel = () => {
    router.go(-1);
};

onMounted(() => {
    getDetail();
});
</script>

<template>
    <div class="w-full min-h-screen bg-gray-50 p-6">
        <!-- Form Container -->
        <div class="w-full bg-white border border-gray-200 rounded-lg p-8 shadow-lg">
            <!-- Title -->
            <!-- <div class="mb-6">
                <h1 class="text-2xl font-bold text-gray-900">
                    {{ isViewMode ? 'Detail Tindak Lanjut Rapat' : 'Input Tindak Lanjut Rapat' }}
                </h1>
                <div class="mt-2">
                    <span 
                        v-if="isViewMode" 
                        class="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-full"
                    >
                        <i class="pi pi-eye mr-1"></i> Mode: View
                    </span>
                    <span 
                        v-else 
                        class="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full"
                    >
                        <i class="pi pi-pencil mr-1"></i> Mode: Edit
                    </span>
                </div>
            </div> -->

            <!-- Form Fields -->
            <form @submit.prevent="handleSave" class="space-y-8">
                <!-- Agenda Rapat -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">Agenda Rapat</label>
                    </div>
                    <!--  -->
                    <div class="md:col-span-10">
                        <InputText
                            v-model="formData.agenda"
                            :disabled="true"
                            placeholder="Masukkan agenda rapat"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Arahan -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">Arahan</label>
                    </div>
                    <div class="md:col-span-10">
                        <Textarea
                            v-model="formData.arahan"
                            :disabled="true"
                            placeholder="Masukkan arahan"
                            rows="4"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Target Waktu -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">Target Waktu</label>
                    </div>
                    <div class="md:col-span-10">
                        <InputText
                            v-model="formData.path"
                            :disabled="true"
                            placeholder="Masukkan target waktu"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- PIC Tindak Lanjut -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">PIC Tindak Lanjut</label>
                    </div>
                    <div class="md:col-span-10">
                        <InputText
                            v-model="formData.namaPic"
                            :disabled="true"
                            placeholder="Masukkan PIC tindak lanjut"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Action Plan -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">Action Plan</label>
                    </div>
                    <div class="md:col-span-10">
                        <Textarea
                            v-model="formData.actionPlan"
                            :disabled="isViewMode"
                            placeholder="Masukkan action plan"
                            rows="4"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Progress -->
                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">Progress</label>
                    </div>
                    <div class="md:col-span-10">
                        <Select
                            v-model="formData.progress"
                            :disabled="isViewMode"
                            :options="progressOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih progress"
                            class="w-full"
                        />
                    </div>
                </div>

                <!-- Materi Tindak Lanjut -->
                <div v-if="!isViewMode" class="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                    <div class="md:col-span-2 flex items-center">
                        <label class="block font-semibold text-gray-700">Materi Tindak Lanjut</label>
                    </div>
                    <div class="md:col-span-10">
                        <div class="flex gap-2">
                            <InputText
                                :value="selectedFile ? selectedFile.name : (formData.fileName || '')"
                                placeholder="Pilih file untuk diupload"
                                readonly
                                class="flex-1 bg-gray-100"
                            />
                            <input
                                ref="fileInput"
                                type="file"
                                style="display: none"
                                @change="handleFileSelect"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            />
                            <Button
                                label="Choose"
                                icon="pi pi-folder-open"
                                severity="secondary"
                                @click="handleFileChoose"
                                class="px-4"
                            />
                            <!-- Show Upload/Update button when file is selected or doesn't exist -->
                            <Button
                                v-if="!fileExists || fileUploadMode === 'upload' || selectedFile"
                                :icon="fileExists ? 'pi pi-refresh' : 'pi pi-upload'"
                                :label="fileExists && !selectedFile ? 'Update' : 'Upload'"
                                severity="success"
                                :loading="isUploading"
                                :disabled="!selectedFile || isUploading"
                                @click="uploadIndividualFile"
                                class="px-4"
                            />
                            <!-- Show View button when file exists and not in upload mode -->
                            <Button
                                v-if="fileExists && fileUploadMode === 'update' && !selectedFile"
                                icon="pi pi-eye"
                                label="View"
                                severity="info"
                                @click="previewFile"
                                class="px-4"
                            />
                        </div>
                        <small v-if="fileExists" class="text-green-600 mt-1 block">
                            <i class="pi pi-check-circle"></i> File sudah ada di server
                        </small>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200">
                    <!-- View Mode - Hanya tampilkan tombol Kembali -->
                    <template v-if="isViewMode">
                        <Button
                            label="Kembali"
                            severity="secondary"
                            @click="handleCancel"
                            class="w-full sm:w-auto px-8 py-2"
                        />
                    </template>
                    
                    <!-- Edit Mode - Tampilkan tombol Batal dan Save -->
                    <template v-else>
                        <Button
                            label="Batal"
                            :disabled="isLoadingSave"
                            severity="secondary"
                            @click="handleCancel"
                            class="w-full sm:w-auto px-8 py-2"
                        />
                        <Button
                            :label="isLoadingSave ? 'Menyimpan...' : 'Save'"
                            :disabled="isLoadingSave"
                            type="submit"
                            severity="primary"
                            class="w-full sm:w-auto px-8 py-2"
                        />
                    </template>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Image Preview Component -->
    <ImagePreview
        v-model:isShow="showImagePreview"
        :url="previewUrl"
        :fileName="previewFileName"
        :isNeedToken="true"
        :isPopUp="true"
        label="Preview File"
        @onclose="showImagePreview = false"
    />
</template>

<style scoped>
.w-full {
    width: 100% !important;
}

/* Custom styling for form elements */
:deep(.p-inputtext),
:deep(.p-inputtextarea),
:deep(.p-dropdown) {
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

:deep(.p-inputtext:focus),
:deep(.p-inputtextarea:focus),
:deep(.p-dropdown:focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

:deep(.p-button) {
    border-radius: 6px;
    font-weight: 500;
}

:deep(.p-checkbox .p-checkbox-box) {
    border-radius: 4px;
}
</style>
