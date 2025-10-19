<script setup>
// Vue Composition API
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
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
const tahunParam = ref(route.params.tahun || new Date().getFullYear().toString());
const kepdirId = ref(route.query.id || '');

// Kajian form data
const kajianForm = ref({
    judul: '',
    tanggalTerbit: new Date(),
    tambahJenisFile: 'KKO'
});

// File upload tracking
const kajianFiles = ref([
    { id: 'kko', label: 'KKO', type: 'KKO', file: null, required: true, uploaded: false },
    { id: 'kkf', label: 'KKF', type: 'KKF', file: null, required: true, uploaded: false },
    { id: 'kr', label: 'KR', type: 'KR', file: null, required: true, uploaded: false },
    { id: 'fra', label: 'FRA', type: 'FRA', file: null, required: true, uploaded: false },
    { id: 'ctr', label: 'CTR', type: 'CTR', file: null, required: true, uploaded: false },
    { id: 'pakta-integritas', label: 'Pakta Integritas', type: 'PAKTA_INTEGRITAS', file: null, required: true, uploaded: false }
]);

const isUploading = ref({});
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');

// Approval/Rejection states
const showApprovalModal = ref(false);
const showRejectModal = ref(false);
const rejectionReason = ref('');
const isSubmittingApproval = ref(false);

// ==========================================
// ROLE MAPPING
// ==========================================
// Role ID Mapping:
// 1 = BOD (Board of Directors)
// 2 = Sekper (Sekretaris Perusahaan)
// 3 = Legal
// 4 = Risiko
// 5 = Kepatuhan

// ==========================================
// COMPUTED PROPERTIES
// ==========================================
const canApproveReject = computed(() => {
    const userRole = parseInt(authStore.roleType || authStore.role);
    console.log('User role:', userRole);
    console.log('route.query.approveSekper:', route.query.approveSekper);
    console.log('route.query.approveLegal:', route.query.approveLegal);
    console.log('route.query.approveRisiko:', route.query.approveRisiko);
    console.log('route.query.approveKepatuhan:', route.query.approveKepatuhan);
    
    // Role 2 = Sekper
    if (userRole === 2) {
        const approveSekper = route.query.approveSekper;
        console.log('Checking Sekper approval:', approveSekper);
        // Show buttons if approveSekper is null, undefined, or '0' (pending)
        return approveSekper === null || approveSekper === undefined || approveSekper === '0' || approveSekper === 0;
    }
    
    // Role 3 = Legal
    else if (userRole === 3) {
        const approveLegal = route.query.approveLegal;
        console.log('Checking Legal approval:', approveLegal);
        // Show buttons if approveLegal is null, undefined, or '0' (pending)
        return approveLegal === null || approveLegal === undefined || approveLegal === '0' || approveLegal === 0;
    }
    
    // Role 4 = Risiko
    else if (userRole === 4) {
        const approveRisiko = route.query.approveRisiko;
        console.log('Checking Risiko approval:', approveRisiko);
        // Show buttons if approveRisiko is null, undefined, or '0' (pending)
        return approveRisiko === null || approveRisiko === undefined || approveRisiko === '0' || approveRisiko === 0;
    }
    
    // Role 5 = Kepatuhan
    else if (userRole === 5) {
        const approveKepatuhan = route.query.approveKepatuhan;
        console.log('Checking Kepatuhan approval:', approveKepatuhan);
        // Show buttons if approveKepatuhan is null, undefined, or '0' (pending)
        return approveKepatuhan === null || approveKepatuhan === undefined || approveKepatuhan === '0' || approveKepatuhan === 0;
    }
    
    // Other roles (Role 1 = BOD, etc.) cannot approve/reject
    return false;
});
const showApprovalButtons = computed(() => {
    return canApproveReject.value;
});
const getApprovalStatusInfo = computed(() => {
    // Get current user role
    const userRole = parseInt(authStore.roleType || authStore.role);
    
    // Check approval status based on user role from query parameters
    let status = null;
    let reason = null;
    
    if (userRole === 2) {
        // Role 2 = Sekper - check approveSekper
        const approveSekper = route.query.approveSekper;
        if (approveSekper !== null && approveSekper !== undefined && approveSekper !== '0' && approveSekper !== 0) {
            status = parseInt(approveSekper);
        }
    } else if (userRole === 3) {
        // Role 3 = Legal - check approveLegal
        const approveLegal = route.query.approveLegal;
        if (approveLegal !== null && approveLegal !== undefined && approveLegal !== '0' && approveLegal !== 0) {
            status = parseInt(approveLegal);
        }
    } else if (userRole === 4) {
        // Role 4 = Risiko - check approveRisiko
        const approveRisiko = route.query.approveRisiko;
        if (approveRisiko !== null && approveRisiko !== undefined && approveRisiko !== '0' && approveRisiko !== 0) {
            status = parseInt(approveRisiko);
        }
    } else if (userRole === 5) {
        // Role 5 = Kepatuhan - check approveKepatuhan
        const approveKepatuhan = route.query.approveKepatuhan;
        if (approveKepatuhan !== null && approveKepatuhan !== undefined && approveKepatuhan !== '0' && approveKepatuhan !== 0) {
            status = parseInt(approveKepatuhan);
        }
    }
    
    // Get rejection reason if rejected
    if (status === 2) {
        reason = route.query.alasanTolak || '';
    }
    
    // If no status found (pending or null), return null
    if (status === null || status === 0) {
        return null;
    }
    
    return {
        isApproved: status === 1,
        isRejected: status === 2,
        reason: reason,
        roleId: userRole,
        statusText: status === 1 ? 'Disetujui' : status === 2 ? 'Ditolak' : 'Pending'
    };
});

// ==========================================
// DATA LOADING FUNCTIONS (Check Existing Files)
// ==========================================
const checkExistingFiles = async () => {
    if (!kepdirId.value) return;
    
    try {
        // Check each file type if it exists
        for (let i = 0; i < kajianFiles.value.length; i++) {
            const kajianItem = kajianFiles.value[i];
            try {
                const response = await KepdirSirkulerService.viewKepdirFile({
                    kepdirId: kepdirId.value,
                    uploadFileType: kajianItem.type
                });
                
                // If response is successful, mark as uploaded
                if (response.data) {
                    kajianFiles.value[i].uploaded = true;
                    console.log(`File ${kajianItem.label} already exists`);
                }
            } catch (error) {
                // File doesn't exist yet, that's okay
                console.log(`File ${kajianItem.label} not uploaded yet`);
            }
        }
    } catch (error) {
        console.error('Error checking existing files:', error);
    }
};

// ==========================================
// FILE MANAGEMENT FUNCTIONS
// ==========================================
const addKajianFileType = () => {
    if (kajianForm.value.tambahJenisFile && !kajianFiles.value.find(file => file.type === kajianForm.value.tambahJenisFile)) {
        const fileType = kajianForm.value.tambahJenisFile;
        const fileTypeName = [
            { name: 'KKO', value: 'KKO' },
            { name: 'KKF', value: 'KKF' },
            { name: 'KR', value: 'KR' },
            { name: 'FRA', value: 'FRA' },
            { name: 'CTR', value: 'CTR' },
            { name: 'Pakta Integritas', value: 'PAKTA_INTEGRITAS' }
        ].find(option => option.value === fileType);
        
        kajianFiles.value.push({
            id: fileType.toLowerCase().replace('_', '-'),
            label: fileTypeName.name,
            type: fileType,
            file: null,
            required: true,
            uploaded: false
        });
        kajianForm.value.tambahJenisFile = '';
    }
};

const handleKajianFileChoose = (kajianItem, index) => {
    // Create a temporary file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (event) => {
        handleKajianFileSelect(event, index);
    };
    input.click();
};

const handleKajianFileSelect = (event, index) => {
    const file = event.target.files[0];
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
        
        kajianFiles.value[index].file = file;
        console.log('File selected:', file.name, 'for', kajianFiles.value[index].label);
    }
};

const removeKajianFile = (kajianItem) => {
    const index = kajianFiles.value.findIndex(item => item.id === kajianItem.id);
    if (index > -1) {
        kajianFiles.value.splice(index, 1);
    }
};

const uploadKajianFile = async (kajianItem, index) => {
    const file = kajianItem.file;
    
    if (!file) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Pilih file terlebih dahulu',
            life: 3000
        });
        return;
    }
    
    if (!kepdirId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Kepdir ID tidak ditemukan',
            life: 3000
        });
        return;
    }
    
    isUploading.value[kajianItem.type] = true;
    
    try {
        console.log('Uploading file:', file.name, 'Type:', kajianItem.type, 'KepdirId:', kepdirId.value);
        
        const response = await KepdirSirkulerService.uploadKajianRapat({
            kepdirId: kepdirId.value,
            uploadFileType: kajianItem.type,
            file: file
        });
        
        console.log('Upload response:', response);
        
        if (response.data && response.data.code === 200) {
            kajianFiles.value[index].uploaded = true; // Mark as uploaded
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `File ${kajianItem.label} berhasil diupload!`,
                life: 3000
            });
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
        isUploading.value[kajianItem.type] = false;
    }
};

const viewKajianFile = async (kajianItem) => {
    toast.add({
        severity: 'info',
        summary: 'Loading',
        detail: 'Memuat file...',
        life: 2000
    });
    
    try {
        const response = await KepdirSirkulerService.viewKepdirFile({
            kepdirId: kepdirId.value,
            uploadFileType: kajianItem.type
        });
        
        // Create blob URL for preview in modal
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        previewUrl.value = url;
        previewFileName.value = kajianItem.label;
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
    previewFileName.value = '';
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
const validateKajianForm = () => {
    const { judul, tanggalTerbit } = kajianForm.value;
    
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
    
    // Check if all required files are uploaded
    const missingFiles = kajianFiles.value.filter(item => item.required && !item.uploaded);
    if (missingFiles.length > 0) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `File ${missingFiles.map(f => f.label).join(', ')} harus diupload terlebih dahulu`,
            life: 3000
        });
        return false;
    }
    
    return true;
};

// ==========================================
// SUBMIT FUNCTIONS
// ==========================================
const handleKajianSubmit = async () => {
    if (!validateKajianForm()) {
        return;
    }
    
    // All files already uploaded individually
    toast.add({
        severity: 'success',
        summary: 'Berhasil',
        detail: 'Semua file kajian rapat berhasil diupload!',
        life: 3000
    });
    
    setTimeout(() => {
        router.push(`/transaction/kepdir-sirkuler/${tahunParam.value}`);
    }, 1500);
};

const handleCancel = () => {
    router.push(`/transaction/kepdir-sirkuler/${tahunParam.value}`);
};

// ==========================================
// APPROVAL/REJECTION FUNCTIONS
// ==========================================
const openApprovalModal = () => {
    showApprovalModal.value = true;
};

const openRejectModal = () => {
    showRejectModal.value = true;
};

const handleApproval = async () => {
    if (!kepdirId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Kepdir ID tidak ditemukan',
            life: 3000
        });
        return;
    }

    isSubmittingApproval.value = true;
    
    try {
        const userRole = authStore.roleType || authStore.role;
        
        const approvalData = {
            kepdirId: kepdirId.value,
            roleId: parseInt(userRole),
            statusApproval: 1, // 1 = Approve
            alasan: '' // No reason needed for approval
        };

        console.log('Submitting approval:', approvalData);
        
        const response = await KepdirSirkulerService.approvalKajianRapat(approvalData);
        
        if (response.data && response.data.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Kajian rapat berhasil disetujui!',
                life: 3000
            });
            
            showApprovalModal.value = false;
            
            // Navigate back after success
            setTimeout(() => {
                router.push(`/transaction/kepdir-sirkuler/${tahunParam.value}`);
            }, 1500);
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: response.data?.message || 'Gagal menyetujui kajian rapat',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error approving kajian rapat:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menyetujui kajian rapat',
            life: 3000
        });
    } finally {
        isSubmittingApproval.value = false;
    }
};

const handleRejection = async () => {
    if (!kepdirId.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Kepdir ID tidak ditemukan',
            life: 3000
        });
        return;
    }

    if (!rejectionReason.value.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Alasan penolakan harus diisi',
            life: 3000
        });
        return;
    }

    isSubmittingApproval.value = true;
    
    try {
        const userRole = authStore.roleType || authStore.role;
        
        const rejectionData = {
            kepdirId: kepdirId.value,
            roleId: parseInt(userRole),
            statusApproval: 2, // 2 = Reject
            alasan: rejectionReason.value.trim()
        };

        console.log('Submitting rejection:', rejectionData);
        
        const response = await KepdirSirkulerService.approvalKajianRapat(rejectionData);
        
        if (response.data && response.data.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Kajian rapat berhasil ditolak!',
                life: 3000
            });
            
            showRejectModal.value = false;
            rejectionReason.value = '';
            
            // Navigate back after success
            setTimeout(() => {
                router.push(`/transaction/kepdir-sirkuler/${tahunParam.value}`);
            }, 1500);
        } else {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: response.data?.message || 'Gagal menolak kajian rapat',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error rejecting kajian rapat:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menolak kajian rapat',
            life: 3000
        });
    } finally {
        isSubmittingApproval.value = false;
    }
};

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================
const loadKepdirDataFromQuery = () => {
    // Load kepdir data from query parameters passed from KepdirSirkuler.vue
    if (route.query.judul) {
        kajianForm.value.judul = route.query.judul;
        console.log('Loaded judul from query:', route.query.judul);
    }
    
    if (route.query.tanggalTerbit) {
        kajianForm.value.tanggalTerbit = new Date(route.query.tanggalTerbit);
        console.log('Loaded tanggalTerbit from query:', route.query.tanggalTerbit);
    }
    
    console.log('Kajian form filled from query parameters:', kajianForm.value);
    console.log('All query parameters:', route.query);
};


// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(async () => {
    console.log('UploadKajianKepdir mounted');
    console.log('Route query:', route.query);
    console.log('kepdirId:', kepdirId.value);
    
    // Load kepdir data from query parameters (passed from KepdirSirkuler.vue)
    loadKepdirDataFromQuery();
    
    // Check existing files
    await checkExistingFiles();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Upload Kajian Rapat Kepdir Sirkuler
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
                <form @submit.prevent="handleKajianSubmit" class="flex flex-col gap-6 w-full">
                    <div class="grid grid-cols-12 gap-6">
                        <!-- Left Column - Form Fields -->
                        <div class="col-span-8">
                            <!-- Judul Kepdir Sirkuler -->
                            <div class="mb-6">
                                <label
                                    for="judulKepdir"
                                    class="block font-bold mb-3 text-gray-700"
                                >
                                    Judul Kepdir Sirkuler<span class="text-red-500">*</span>
                                </label>
                                <InputText 
                                    autocomplete="off" 
                                    name="judulKepdir"
                                    type="text"
                                    placeholder="Judul Kepdir Sirkuler"
                                    class="w-full"
                                    v-model="kajianForm.judul"
                                    :disabled="isLoading"
                                    readonly
                                />
                            </div>

                            <!-- Tanggal Terbit Kepdir Sirkuler -->
                            <div class="mb-6">
                                <label
                                    for="tanggalTerbit"
                                    class="block font-bold mb-3 text-gray-700"
                                >
                                    Tanggal Terbit Kepdir Sirkuler<span class="text-red-500">*</span>
                                </label>
                                <DatePicker
                                    name="tanggalTerbit"
                                    placeholder="Calendar"
                                    class="w-full"
                                    :showIcon="true"
                                    dateFormat="dd/mm/yy"
                                    v-model="kajianForm.tanggalTerbit"
                                    :disabled="isLoading"
                                    readonly
                                />
                            </div>
                        </div>

                        <!-- Right Column - File Upload Section -->
                        <div class="col-span-4">
                            <!-- Tambah Jenis File -->
                            <div class="mb-6">
                                <label class="block font-bold mb-3 text-gray-700">
                                    Tambah Jenis File
                                </label>
                                <div class="flex gap-2">
                                    <Select
                                        v-model="kajianForm.tambahJenisFile"
                                        :options="[
                                            { name: 'KKO', value: 'KKO' },
                                            { name: 'KKF', value: 'KKF' },
                                            { name: 'KR', value: 'KR' },
                                            { name: 'FRA', value: 'FRA' },
                                            { name: 'CTR', value: 'CTR' },
                                            { name: 'Pakta Integritas', value: 'PAKTA_INTEGRITAS' }
                                        ]"
                                        optionLabel="name"
                                        optionValue="value"
                                        placeholder="KKO"
                                        class="flex-1"
                                        :disabled="isLoading"
                                    />
                                    <Button
                                        label="Add File"
                                        severity="secondary"
                                        @click="addKajianFileType"
                                        :disabled="!kajianForm.tambahJenisFile || isLoading"
                                        class="px-4"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- File Upload Fields -->
                    <div class="grid grid-cols-12 gap-6">
                        <div class="col-span-12">
                            <div 
                                v-for="(kajianItem, index) in kajianFiles" 
                                :key="index"
                                class="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                            >
                                <div class="flex items-center gap-3">
                                    <Button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        text
                                        rounded
                                        size="small"
                                        @click="removeKajianFile(kajianItem)"
                                        class="text-red-500 hover:bg-red-50"
                                        :disabled="isLoading"
                                    />
                                    <div class="flex-1">
                                        <label class="block font-bold mb-2 text-gray-700">
                                            {{ kajianItem.label }}<span class="text-red-500">*</span>
                                        </label>
                                        <div class="flex gap-2">
                                            <InputText
                                                :value="kajianItem.file ? kajianItem.file.name : ''"
                                                :placeholder="kajianItem.label"
                                                readonly
                                                class="flex-1 bg-gray-100"
                                                :disabled="isLoading"
                                            />
                                            <Button
                                                label="Choose File"
                                                icon="pi pi-upload"
                                                severity="secondary"
                                                @click="handleKajianFileChoose(kajianItem, index)"
                                                :disabled="isLoading"
                                            />
                                            <!-- Show Upload button when file is not uploaded yet -->
                                            <Button
                                                v-if="!kajianItem.uploaded"
                                                icon="pi pi-upload"
                                                label="Upload"
                                                severity="success"
                                                :loading="isUploading[kajianItem.type]"
                                                :disabled="!kajianItem.file || isUploading[kajianItem.type]"
                                                @click="uploadKajianFile(kajianItem, index)"
                                                class="px-4"
                                            />
                                            <!-- Show View button when file has been uploaded -->
                                            <Button
                                                v-if="kajianItem.uploaded"
                                                icon="pi pi-eye"
                                                label="View"
                                                severity="info"
                                                @click="viewKajianFile(kajianItem)"
                                                class="px-4"
                                            />
                                        </div>
                                        <small v-if="kajianItem.file" class="text-gray-600 mt-2 block">
                                            <i class="pi pi-check-circle text-green-600"></i>
                                            File terpilih: {{ kajianItem.file.name }} ({{ (kajianItem.file.size / 1024 / 1024).toFixed(2) }} MB)
                                        </small>
                                        <small v-if="kajianItem.uploaded" class="text-green-600 mt-2 block">
                                            <i class="pi pi-check-circle text-green-600"></i>
                                            File telah diupload ke server
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex gap-4 justify-end">
                        <Button
                            label="Batal"
                            severity="secondary"
                            outlined
                            @click="handleCancel"
                            :disabled="isLoading"
                        />
                        
                        <!-- Approval/Rejection Buttons (Role 2=Sekper, 3=Legal, 4=Risiko, 5=Kepatuhan) -->
                        <template v-if="showApprovalButtons">
                            <Button
                                label="Reject"
                                severity="danger"
                                outlined
                                @click="openRejectModal"
                                :disabled="isLoading"
                            />
                            <Button
                                label="Approve"
                                severity="success"
                                @click="openApprovalModal"
                                :disabled="isLoading"
                            />
                        </template>
                        
                        <!-- Regular Submit Button (Role 1=BOD) -->
                        <template v-else>
                            <Button
                                type="submit"
                                label="Selesai"
                                severity="success"
                                :loading="isLoading"
                            />
                        </template>
                    </div>
                </form>
            </template>
        </Card>

        <!-- Approval Status Information -->
        <Card v-if="getApprovalStatusInfo" class="mt-6">
            <template #content>
                <div class="space-y-4">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="pi pi-info-circle mr-2"></i>
                        Status Approval Kajian Rapat
                    </h3>
                    
                    <div class="grid grid-cols-12 gap-4">
                        <!-- Status -->
                        <div class="col-span-12 md:col-span-3">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <div class="flex items-center gap-2">
                                <span 
                                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                    :class="{
                                        'bg-green-100 text-green-800': getApprovalStatusInfo.isApproved,
                                        'bg-red-100 text-red-800': getApprovalStatusInfo.isRejected
                                    }"
                                >
                                    <i 
                                        class="pi mr-1"
                                        :class="{
                                            'pi-check-circle': getApprovalStatusInfo.isApproved,
                                            'pi-times-circle': getApprovalStatusInfo.isRejected
                                        }"
                                    ></i>
                                    {{ getApprovalStatusInfo.statusText }}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Role ID -->
                        <!-- <div class="col-span-12 md:col-span-3">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Role ID
                            </label>
                            <InputText
                                :value="getApprovalStatusInfo.roleId"
                                readonly
                                class="w-full bg-gray-100"
                            />
                        </div> -->
                        
                        <!-- Alasan (if rejected) -->
                        <div v-if="getApprovalStatusInfo.isRejected && getApprovalStatusInfo.reason" class="col-span-12 md:col-span-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">
                                Alasan Penolakan
                            </label>
                            <Textarea
                                :value="getApprovalStatusInfo.reason"
                                readonly
                                rows="3"
                                class="w-full bg-gray-100"
                            />
                        </div>
                    </div>
                </div>
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

    <!-- Approval Modal -->
    <Dialog
        v-model:visible="showApprovalModal"
        modal
        header="Konfirmasi Persetujuan"
        :style="{ width: '32rem' }"
    >
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <i class="pi pi-check-circle text-green-600 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-gray-800">Setujui Kajian Rapat?</h4>
                    <p class="text-sm text-gray-600">Apakah Anda yakin ingin menyetujui kajian rapat ini?</p>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    label="Batal"
                    severity="secondary"
                    text
                    @click="showApprovalModal = false"
                    :disabled="isSubmittingApproval"
                />
                <Button
                    label="Ya, Setujui"
                    severity="success"
                    @click="handleApproval"
                    :loading="isSubmittingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Rejection Modal -->
    <Dialog
        v-model:visible="showRejectModal"
        modal
        header="Konfirmasi Penolakan"
        :style="{ width: '32rem' }"
    >
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <i class="pi pi-times-circle text-red-600 text-2xl"></i>
                <div>
                    <h4 class="font-semibold text-gray-800">Tolak Kajian Rapat?</h4>
                    <p class="text-sm text-gray-600">Apakah Anda yakin ingin menolak kajian rapat ini?</p>
                </div>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan <span class="text-red-500">(*)</span>
                </label>
                <Textarea
                    v-model="rejectionReason"
                    placeholder="Masukkan alasan penolakan"
                    rows="4"
                    class="w-full"
                    :maxlength="500"
                />
                <div class="text-right text-sm text-gray-500 mt-1">
                    {{ rejectionReason.length }}/500
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button
                    label="Batal"
                    severity="secondary"
                    text
                    @click="showRejectModal = false; rejectionReason = ''"
                    :disabled="isSubmittingApproval"
                />
                <Button
                    label="Ya, Tolak"
                    severity="danger"
                    @click="handleRejection"
                    :loading="isSubmittingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Global Components -->
    <Toast />
</template>

<style scoped>
/* Custom styles if needed */
</style>

