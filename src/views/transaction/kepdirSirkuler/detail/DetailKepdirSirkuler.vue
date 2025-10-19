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
import Toast from 'primevue/toast';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Dialog from 'primevue/dialog';
import FileUpload from 'primevue/fileupload';

// Services
import DetailKepdirService from './Service/DetailKepdir.js';
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
const activeTab = ref(0);
const kepdirDetail = ref(null);
const kepdirId = ref('');

// Kajian files data (read-only)
const kajianFiles = ref([
    { id: 'kko', label: 'KKO', type: 'KKO', uploaded: false },
    { id: 'kkf', label: 'KKF', type: 'KKF', uploaded: false },
    { id: 'kr', label: 'KR', type: 'KR', uploaded: false },
    { id: 'fra', label: 'FRA', type: 'FRA', uploaded: false },
    { id: 'ctr', label: 'CTR', type: 'CTR', uploaded: false },
    { id: 'pakta-integritas', label: 'Pakta Integritas', type: 'PAKTA_INTEGRITAS', uploaded: false }
]);

const fileAlreadyUploaded = ref(false);
const showPreviewDialog = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');

// Form data for governance upload
const governanceForm = ref({
    judul: '',
    tanggalTerbit: new Date()
});

// Approve/Reject functionality
const showApprovalDialog = ref(false);
const showQuickApprovalDialog = ref(false);
const showQuickRejectDialog = ref(false);
const approvalForm = ref({
    statusApproval: null,
    alsanTolak: '',
    file: null
});
const quickApprovalData = ref({
    statusApproval: 1
});
const quickRejectData = ref({
    statusApproval: 2,
    deskripsi: ''
});
const isUploadingApproval = ref(false);
const uploadedFile = ref(null);

// Capture URL parameters
const tanggal = ref('');
const agenda = ref('');
const jadwalRapat = ref('');
const rapatId = ref('');

// Function to parse URL parameters
const parseUrlParams = () => {
    // Parse query parameters from route
    if (route.query) {
        rapatId.value = route.query.id || '';
        tanggal.value = route.query.tanggal || '';
        agenda.value = route.query.agenda || '';
        kepdirId.value = route.params.id || route.query.id || '';
    }
    
    // Extract JadwalRapat from path segments (it's encoded in the URL path)
    const pathSegments = route.path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    if (lastSegment && lastSegment !== kepdirId.value) {
        // Decode the encoded judul rapat from the path
        jadwalRapat.value = decodeURIComponent(lastSegment).replace(/-/g, ' ');
    }
    
    console.log('Parsed URL params:', {
        kepdirId: kepdirId.value,
        rapatId: rapatId.value,
        tanggal: tanggal.value,
        agenda: agenda.value,
        jadwalRapat: jadwalRapat.value
    });
};

// DISABLED - Tabel kedua dihapus
// const datas2 = ref([]);
// const search2 = ref(null);
// const loading2 = ref(null);
// const param2 = ref({
//     ...IParams
// });
// const totalRecords2 = ref(0);


// ==========================================
// COMPUTED PROPERTIES
// ==========================================
const showKajianTab = computed(() => {
    // Show kajian tab only if agenda is null or empty
    return !kepdirDetail.value?.agendaRapat;
});

const canApprove = computed(() => {
    // Show approve button only for users with role = 2 and statusApproval is null or 0
    const hasApprovalRights = authStore.role === '2' || authStore.role === 2;
    const isPending = kepdirDetail.value?.statusApproval === null || kepdirDetail.value?.statusApproval === 0;
    return hasApprovalRights && isPending;
});

const approvalStatus = computed(() => {
    if (!kepdirDetail.value?.statusApproval) return null;
    
    switch (kepdirDetail.value.statusApproval) {
        case 1:
            return { status: 'approved', label: 'Disetujui', severity: 'success' };
        case 2:
            return { status: 'rejected', label: 'Ditolak', severity: 'danger' };
        default:
            return null;
    }
});


// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================
const checkExistingFiles = async () => {
    if (!kepdirId.value) return;
    
    try {
        // Check each kajian file type if it exists
        for (let i = 0; i < kajianFiles.value.length; i++) {
            const kajianItem = kajianFiles.value[i];
            try {
                const response = await KepdirSirkulerService.viewKepdirFile({
                    kepdirId: kepdirId.value,
                    uploadFileType: kajianItem.type
                });
                
                if (response.data) {
                    kajianFiles.value[i].uploaded = true;
                }
            } catch (error) {
                // File doesn't exist yet
                kajianFiles.value[i].uploaded = false;
            }
        }
        
        // Check if Form Review Governance exists
        try {
            const governanceResponse = await KepdirSirkulerService.viewKepdirFile({
                kepdirId: kepdirId.value,
                uploadFileType: 'FORM_REVIEW_GOVERNENCE'
            });
            
            if (governanceResponse.data) {
                fileAlreadyUploaded.value = true;
            }
        } catch (error) {
            fileAlreadyUploaded.value = false;
        }
    } catch (error) {
        console.error('Error checking existing files:', error);
    }
};

const loadData = async () => {
    if (!kepdirId.value) {
        console.error('Kepdir ID not found');
        return;
    }

    isLoading.value = true;
    
    try {
        console.log('Fetching kepdir detail for ID:', kepdirId.value);
        const response = await DetailKepdirService.getKepdirById(kepdirId.value);
        console.log('Kepdir detail response:', response);
        
        if (response.data && response.data.code === 200) {
            kepdirDetail.value = response.data.data;
            
            // Fill governance form with kepdir data
            governanceForm.value.judul = kepdirDetail.value.judulKepdir || '';
            if (kepdirDetail.value.tanggalTerbit) {
                governanceForm.value.tanggalTerbit = new Date(kepdirDetail.value.tanggalTerbit);
            }
            
            console.log('Kepdir detail loaded:', kepdirDetail.value);
        } else {
            console.log('No data returned or code !== 200');
            kepdirDetail.value = null;
        }
    } catch (error) {
        console.error('Error fetching kepdir detail:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data kepdir detail',
            life: 3000
        });
        kepdirDetail.value = null;
    } finally {
        isLoading.value = false;
    }
};


// ==========================================
// KAJIAN FILE VIEW FUNCTIONS
// ==========================================

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
// GOVERNANCE FILE VIEW FUNCTIONS
// ==========================================

const viewGovernanceFile = async () => {
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
        previewFileName.value = 'Form Review Governance';
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

// ==========================================
// APPROVAL FUNCTIONS
// ==========================================
const openApprovalDialog = () => {
    showApprovalDialog.value = true;
    approvalForm.value = {
        statusApproval: null,
        alsanTolak: '',
        file: null
    };
};

const closeApprovalDialog = () => {
    showApprovalDialog.value = false;
    approvalForm.value = {
        statusApproval: null,
        alsanTolak: '',
        file: null
    };
};

const onApprovalFileSelect = (event) => {
    const file = event.files[0];
    if (file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hanya file PDF, DOC, atau DOCX yang diperbolehkan',
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
        
        approvalForm.value.file = file;
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `File ${file.name} berhasil dipilih`,
            life: 2000
        });
    }
};

const removeApprovalFile = () => {
    approvalForm.value.file = null;
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'File berhasil dihapus',
        life: 2000
    });
};

const submitApproval = async () => {
    try {
        if (!approvalForm.value.statusApproval) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Status approval harus dipilih',
                life: 3000
            });
            return;
        }
        
        if (approvalForm.value.statusApproval === 2 && !approvalForm.value.alsanTolak.trim()) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Alasan tolak harus diisi jika status adalah Reject',
                life: 3000
            });
            return;
        }
        
        if (approvalForm.value.statusApproval === 1 && !approvalForm.value.file) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'File harus diupload jika status adalah Approve',
                life: 3000
            });
            return;
        }
        
        isUploadingApproval.value = true;
        
        // Prepare form data for API
        const formData = new FormData();
        formData.append('kepdirId', kepdirId.value);
        formData.append('statusApproval', approvalForm.value.statusApproval);
        formData.append('alsanTolak', approvalForm.value.alsanTolak || '');
        
        if (approvalForm.value.file) {
            formData.append('file', approvalForm.value.file);
        }
        
        // Call API endpoint
        const response = await KepdirSirkulerService.approvalKepdirSekper(formData);
        
        if (response.status === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Approval berhasil disimpan',
                life: 3000
            });
            
            closeApprovalDialog();
            // Reload data to reflect changes
            await loadData();
        } else {
            throw new Error('Gagal menyimpan approval');
        }
        
    } catch (error) {
        console.error('Error submitting approval:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan approval',
            life: 3000
        });
    } finally {
        isUploadingApproval.value = false;
    }
};

// Quick Approve/Reject functions
const openQuickApprovalDialog = () => {
    if (!canApprove.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Anda tidak memiliki hak untuk melakukan approval',
            life: 3000
        });
        return;
    }
    
    quickApprovalData.value = {
        statusApproval: 1
    };
    
    showQuickApprovalDialog.value = true;
};

const openQuickRejectDialog = () => {
    if (!canApprove.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Anda tidak memiliki hak untuk melakukan rejection',
            life: 3000
        });
        return;
    }
    
    quickRejectData.value = {
        statusApproval: 2,
        deskripsi: ''
    };
    
    showQuickRejectDialog.value = true;
};

const submitQuickApproval = async () => {
    try {
        isUploadingApproval.value = true;
        
        // Validate file upload is required for approval
        if (!uploadedFile.value) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'File harus diupload untuk approval',
                life: 3000
            });
            return;
        }
        
        // Prepare form data for API
        const formData = new FormData();
        formData.append('kepdirId', kepdirId.value);
        formData.append('statusApproval', quickApprovalData.value.statusApproval);
        formData.append('alsanTolak', ''); // Empty for approval
        formData.append('file', uploadedFile.value);
        
        // Call API endpoint
        const response = await KepdirSirkulerService.approvalKepdirSekper(formData);
        
        if (response.status === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Approval berhasil disimpan',
                life: 3000
            });
            
            showQuickApprovalDialog.value = false;
            await loadData();
        } else {
            throw new Error('Gagal menyimpan approval');
        }
        
    } catch (error) {
        console.error('Error submitting quick approval:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan approval',
            life: 3000
        });
    } finally {
        isUploadingApproval.value = false;
    }
};

const submitQuickReject = async () => {
    try {
        isUploadingApproval.value = true;
        
        // Validate required fields
        if (!quickRejectData.value.deskripsi.trim()) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'Alasan penolakan harus diisi',
                life: 3000
            });
            return;
        }
        
        // Prepare form data for API
        const formData = new FormData();
        formData.append('kepdirId', kepdirId.value);
        formData.append('statusApproval', quickRejectData.value.statusApproval);
        formData.append('alsanTolak', quickRejectData.value.deskripsi);
        
        // Call API endpoint
        const response = await KepdirSirkulerService.approvalKepdirSekper(formData);
        
        if (response.status === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Penolakan berhasil disimpan',
                life: 3000
            });
            
            showQuickRejectDialog.value = false;
            await loadData();
        } else {
            throw new Error('Gagal menyimpan penolakan');
        }
        
    } catch (error) {
        console.error('Error submitting quick reject:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan penolakan',
            life: 3000
        });
    } finally {
        isUploadingApproval.value = false;
    }
};

const onFileUpload = async (event) => {
    try {
        const file = event.files[0];
        if (!file) return;

        // Store file for later upload with approval
        uploadedFile.value = file;
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `File ${file.name} berhasil dipilih`,
            life: 3000
        });

    } catch (error) {
        console.error('Error selecting file:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memilih file: ' + error.message,
            life: 3000
        });
    }
};

const viewDraftKepdir = async () => {
    try {
        if (!kepdirId.value) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID kepdir tidak ditemukan',
                life: 3000
            });
            return;
        }

        toast.add({
            severity: 'info',
            summary: 'Loading',
            detail: 'Memuat draft kepdir...',
            life: 2000
        });

        // Get the draft kepdir using the correct uploadFileType
        const response = await KepdirSirkulerService.viewKepdirFile({
            kepdirId: kepdirId.value,
            uploadFileType: 'DRAFT_KEPDIR'
        });
        
        // Create blob URL for preview in modal
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        previewUrl.value = url;
        previewFileName.value = 'Draft Kepdir Sirkuler';
        showPreviewDialog.value = true;
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Draft kepdir berhasil dimuat',
            life: 2000
        });
    } catch (error) {
        console.error('Error viewing draft kepdir:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat draft kepdir: ' + (error.response?.data?.message || error.message || 'File tidak ditemukan'),
            life: 3000
        });
    }
};

const previewApprovedDocument = async () => {
    try {
        if (!kepdirId.value) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID kepdir tidak ditemukan',
                life: 3000
            });
            return;
        }

        toast.add({
            severity: 'info',
            summary: 'Loading',
            detail: 'Memuat dokumen...',
            life: 2000
        });

        // Get the approved document using the correct uploadFileType
        const response = await KepdirSirkulerService.viewKepdirFile({
            kepdirId: kepdirId.value,
            uploadFileType: 'DOKUMEN_KEPDIR_SIRKULER'
        });
        
        // Create blob URL for preview in modal
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        previewUrl.value = url;
        previewFileName.value = 'Dokumen Approval';
        showPreviewDialog.value = true;
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Dokumen berhasil dimuat',
            life: 2000
        });
    } catch (error) {
        console.error('Error viewing approved document:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat dokumen: ' + (error.response?.data?.message || error.message || 'Dokumen tidak ditemukan'),
            life: 3000
        });
    }
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
const handleBack = () => {
    const tahun = route.query.tahun || new Date().getFullYear();
    router.push({
        path: `/transaction/kepdir-sirkuler/${tahun}`
    });
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(async () => {
    parseUrlParams();
    await loadData();
    await checkExistingFiles();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Detail Kepdir Sirkuler
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

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
            <div class="text-center">
                <i class="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
                <p class="text-gray-600">Memuat data...</p>
            </div>
        </div>

        <!-- Detail Content -->
        <div v-else-if="kepdirDetail && Object.keys(kepdirDetail).length > 0" class="space-y-6">
            <!-- Header Card with Action Buttons -->
            <Card>
                <template #content>
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-xl font-bold text-gray-800 mb-2">
                                {{ kepdirDetail.judulKepdir || 'Kepdir Sirkuler' }}
                            </h2>
                            <p class="text-sm text-gray-600">
                                {{ formatDate(kepdirDetail.tanggalTerbit) }}
                            </p>
                        </div>
                        
                        <div class="flex gap-2">
                            <Button
                                label="Kembali"
                                icon="pi pi-arrow-left"
                                severity="secondary"
                                @click="handleBack"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Approval Status Display -->
            <Card v-if="approvalStatus" class="mb-4">
                <template #content>
                    <!-- Approved Status -->
                    <div v-if="approvalStatus.status === 'approved'" class="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-check-circle text-green-600 text-lg"></i>
                                <div>
                                    <h3 class="text-lg font-semibold text-green-800">
                                        {{ approvalStatus.label }}
                                    </h3>
                                </div>
                            </div>
                            
                            <Button
                                label="Preview Dokumen"
                                icon="pi pi-eye"
                                severity="success"
                                size="small"
                                @click="previewApprovedDocument"
                                class="px-4 py-2"
                            />
                        </div>
                    </div>

                    <!-- Rejected Status -->
                    <div v-else-if="approvalStatus.status === 'rejected'" class="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div class="flex items-center gap-3">
                            <i class="pi pi-times-circle text-red-600 text-lg"></i>
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-red-800 mb-2">
                                    {{ approvalStatus.label }}
                                </h3>
                                <p v-if="kepdirDetail?.alasanTolak" class="text-sm text-gray-600">
                                    <strong>Alasan:</strong> {{ kepdirDetail.alasanTolak }}
                                </p>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Tab Content Card -->
            <Card>
                <template #content>
                    <TabView v-model:activeIndex="activeTab">
                        <!-- Tab 1: Kepdir Information (Read-only) -->
                        <TabPanel>
                            <template #header>
                                <i class="pi pi-info-circle mr-2"></i>
                                <span>Informasi Kepdir</span>
                            </template>
                            
                            <div class="space-y-6">
                                <div class="text-left mb-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                        <i class="pi pi-info-circle mr-2"></i>
                                        Informasi Kepdir Sirkuler
                                    </h3>
                                    <p class="text-sm text-gray-600">Detail informasi kepdir sirkuler</p>
                                </div>

                                <!-- Jenis Input Kepdir -->
                                <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Jenis Input Kepdir <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <div class="flex gap-6">
                                            <div class="flex items-center">
                                                <RadioButton 
                                                    :modelValue="kepdirDetail.jadwalRapatId ? 'berdasarkan-agenda' : 'tanpa-agenda'"
                                                    inputId="berdasarkan-agenda" 
                                                    name="jenisInput" 
                                                    value="berdasarkan-agenda"
                                                    disabled
                                                />
                                                <label for="berdasarkan-agenda" class="ml-2">Berdasarkan Agenda Rapat</label>
                                            </div>
                                            <div class="flex items-center">
                                                <RadioButton 
                                                    :modelValue="kepdirDetail.jadwalRapatId ? 'berdasarkan-agenda' : 'tanpa-agenda'"
                                                    inputId="tanpa-agenda" 
                                                    name="jenisInput" 
                                                    value="tanpa-agenda"
                                                    disabled
                                                />
                                                <label for="tanpa-agenda" class="ml-2">Tanpa Agenda Rapat</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Agenda Rapat (conditional) -->
                                <div v-if="kepdirDetail.jadwalRapatId" class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Agenda Rapat <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <InputText 
                                            :value="kepdirDetail.agendaRapat || '-'"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- Judul Kepdir Sirkuler -->
                                <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Judul Kepdir Sirkuler <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <InputText 
                                            :value="kepdirDetail.judulKepdir || '-'"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- Draft Kepdir -->
                                <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Draft Kepdir <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <div class="flex gap-2">
                                            <InputText
                                                value="Draft Kepdir tersedia"
                                                readonly
                                                class="flex-1 bg-green-50 text-green-800"
                                                :disabled="isLoading"
                                            />
                                            <Button
                                                label="Preview"
                                                icon="pi pi-eye"
                                                severity="info"
                                                @click="viewDraftKepdir"
                                                :disabled="isLoading"
                                            />
                                        </div>
                                        <small class="text-green-600 mt-2 block">
                                            <i class="pi pi-check-circle text-green-600"></i>
                                            File tersedia dan dapat di-preview
                                        </small>
                                    </div>
                                </div>

                                <!-- Tanggal Terbit -->
                                <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Tanggal Terbit <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <InputText 
                                            :value="formatDate(kepdirDetail.tanggalTerbit)"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- Status -->
                                <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Status <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <InputText 
                                            :value="kepdirDetail.statusApproval || 'Berjalan'"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- Tahun -->
                                <!-- <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Tahun <span class="text-red-500">*</span>
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <InputText 
                                            :value="kepdirDetail.tahun || '-'"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div> -->
                            </div>
                        </TabPanel>

                        <!-- Tab 2: Kajian Rapat (Conditional) -->
                        <TabPanel v-if="showKajianTab">
                            <template #header>
                                <i class="pi pi-file mr-2"></i>
                                <span>Kajian Rapat</span>
                            </template>
                            
                            <div class="space-y-6">
                                <div class="text-left mb-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                        <i class="pi pi-file mr-2"></i>
                                        Kajian Rapat
                                    </h3>
                                    <p class="text-sm text-gray-600">File kajian rapat kepdir sirkuler (read-only)</p>
                                </div>

                                <!-- Kajian Files -->
                                <div class="space-y-4">
                                    <div 
                                        v-for="(kajianItem, index) in kajianFiles" 
                                        :key="index"
                                        class="p-4 border border-gray-200 rounded-lg bg-gray-50"
                                    >
                                        <div class="flex items-center gap-3">
                                            <div class="flex-1">
                                                <label class="block font-bold mb-2 text-gray-700">
                                                    {{ kajianItem.label }}
                                                </label>
                                                <div class="flex gap-2">
                                                    <InputText
                                                        :value="kajianItem.uploaded ? `${kajianItem.label} tersedia` : `${kajianItem.label} tidak tersedia`"
                                                        readonly
                                                        :class="kajianItem.uploaded ? 'flex-1 bg-green-50 text-green-800' : 'flex-1 bg-red-50 text-red-800'"
                                                        :disabled="isLoading"
                                                    />
                                                    <!-- Show View button only when file has been uploaded -->
                                                    <Button
                                                        v-if="kajianItem.uploaded"
                                                        icon="pi pi-eye"
                                                        label="Preview"
                                                        severity="info"
                                                        @click="viewKajianFile(kajianItem)"
                                                        class="px-4"
                                                        :disabled="isLoading"
                                                    />
                                                    <!-- Show disabled button when file is not uploaded -->
                                                    <Button
                                                        v-else
                                                        icon="pi pi-eye"
                                                        label="Preview"
                                                        severity="secondary"
                                                        class="px-4"
                                                        disabled
                                                    />
                                                </div>
                                                <small v-if="kajianItem.uploaded" class="text-green-600 mt-2 block">
                                                    <i class="pi pi-check-circle text-green-600"></i>
                                                    File tersedia dan dapat di-preview
                                                </small>
                                                <small v-else class="text-red-600 mt-2 block">
                                                    <i class="pi pi-times-circle text-red-600"></i>
                                                    File belum diupload
                                                </small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>

                        <!-- Tab 3: Form Review Governance -->
                        <TabPanel>
                            <template #header>
                                <i class="pi pi-file-check mr-2"></i>
                                <span>Form Review Governance</span>
                            </template>
                            
                            <div class="space-y-6">
                                <div class="text-left mb-6">
                                    <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                        <i class="pi pi-file-check mr-2"></i>
                                        Form Review Governance
                                    </h3>
                                    <p class="text-sm text-gray-600">Form review governance kepdir sirkuler (read-only)</p>
                                </div>

                                <div class="grid grid-cols-12 gap-4">
                                    <div class="col-span-12 lg:col-span-6">
                                        <label class="block text-sm font-bold text-gray-700 mb-2">
                                            Judul Kepdir Sirkuler <span class="text-red-500">*</span>
                                        </label>
                                        <InputText 
                                            v-model="governanceForm.judul"
                                            placeholder="Masukkan Judul Kepdir Sirkuler"
                                            class="w-full"
                                            :disabled="isLoading || isUploadingGovernance"
                                            readonly
                                        />
                                    </div>
                                    
                                    <div class="col-span-12 lg:col-span-6">
                                        <label class="block text-sm font-bold text-gray-700 mb-2">
                                            Tanggal Terbit Kepdir Sirkuler <span class="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            v-model="governanceForm.tanggalTerbit"
                                            dateFormat="dd/mm/yy"
                                            placeholder="Calendar"
                                            showIcon
                                            class="w-full"
                                            :disabled="isLoading || isUploadingGovernance"
                                            readonly
                                        />
                                    </div>
                                </div>

                                <!-- Form Review Governance Preview Only -->
                                <div class="grid grid-cols-12 gap-4">
                                    <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                                        Form Review Governance
                                    </label>
                                    <div class="col-span-12 md:col-span-9">
                                        <!-- If file already uploaded, show preview button -->
                                        <div v-if="fileAlreadyUploaded" class="flex gap-2">
                                            <InputText
                                                value="Form Review Governance tersedia"
                                                readonly
                                                class="flex-1 bg-green-50 text-green-800"
                                                :disabled="isLoading"
                                            />
                                            <Button
                                                label="Preview"
                                                icon="pi pi-eye"
                                                severity="info"
                                                @click="viewGovernanceFile"
                                                :disabled="isLoading"
                                            />
                                        </div>
                                        <!-- If file not uploaded yet, show not available message -->
                                        <div v-else class="flex gap-2">
                                            <InputText
                                                value="Form Review Governance tidak tersedia"
                                                readonly
                                                class="flex-1 bg-red-50 text-red-800"
                                                :disabled="isLoading"
                                            />
                                            <Button
                                                label="Preview"
                                                icon="pi pi-eye"
                                                severity="secondary"
                                                disabled
                                            />
                                        </div>
                                        <small v-if="fileAlreadyUploaded" class="text-green-600 mt-2 block">
                                            <i class="pi pi-check-circle text-green-600"></i>
                                            File tersedia dan dapat di-preview
                                        </small>
                                        <small v-else class="text-red-600 mt-2 block">
                                            <i class="pi pi-times-circle text-red-600"></i>
                                            File belum diupload
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </template>
            </Card>
            
            <!-- Quick Approve & Reject Buttons (Only show if user can approve) -->
            <div v-if="canApprove" class="mt-4 flex justify-end gap-4">
                <Button
                    label="Reject"
                    icon="pi pi-times-circle"
                    severity="danger"
                    @click="openQuickRejectDialog"
                    class="px-6 py-3"
                />
                <Button
                    label="Approve"
                    icon="pi pi-check-circle"
                    severity="success"
                    @click="openQuickApprovalDialog"
                    class="px-6 py-3"
                />
            </div>
        </div>

        <!-- Error State -->
        <div v-else class="flex justify-center items-center h-64">
            <div class="text-center">
                <i class="pi pi-exclamation-triangle text-4xl text-red-600 mb-4"></i>
                <p class="text-gray-600 mb-4">Data tidak ditemukan</p>
                <Button
                    label="Kembali ke List"
                    icon="pi pi-arrow-left"
                    severity="secondary"
                    @click="handleBack"
                />
            </div>
        </div>
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

    <!-- Approval Dialog -->
    <Dialog
        v-model:visible="showApprovalDialog"
        modal
        header="Approval Kepdir Sirkuler"
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="space-y-4">
            <!-- Status Approval -->
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-4 font-bold text-gray-700 self-center">
                            Status Approval <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-8">
                            <div class="flex gap-6">
                                <div class="flex items-center">
                                    <RadioButton 
                                        v-model="approvalForm.statusApproval"
                                        inputId="approve" 
                                        name="statusApproval" 
                                        :value="1"
                                    />
                                    <label for="approve" class="ml-2">Approve</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton 
                                        v-model="approvalForm.statusApproval"
                                        inputId="reject" 
                                        name="statusApproval" 
                                        :value="2"
                                    />
                                    <label for="reject" class="ml-2">Reject</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Alasan Tolak (only show when Reject is selected) -->
            <div v-if="approvalForm.statusApproval === 2" class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-4 font-bold text-gray-700 self-center">
                            Alasan Tolak <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-8">
                            <Textarea
                                v-model="approvalForm.alsanTolak"
                                placeholder="Masukkan alasan penolakan"
                                class="w-full"
                                rows="3"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- File Upload (only show when Approve is selected) -->
            <div v-if="approvalForm.statusApproval === 1" class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-4 font-bold text-gray-700 self-center">
                            Upload File <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-8">
                            <div class="flex gap-2">
                                <InputText
                                    :value="approvalForm.file ? approvalForm.file.name : 'Pilih file'"
                                    readonly
                                    class="flex-1 bg-gray-100"
                                />
                                <Button
                                    v-if="approvalForm.file"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    rounded
                                    size="small"
                                    @click="removeApprovalFile"
                                    class="text-red-500 hover:bg-red-50"
                                    v-tooltip.top="'Hapus File'"
                                />
                                <FileUpload
                                    mode="basic"
                                    :auto="true"
                                    :multiple="false"
                                    accept=".pdf,.doc,.docx"
                                    :maxFileSize="10000000"
                                    @select="onApprovalFileSelect"
                                    class="p-button-outlined"
                                />
                            </div>
                            <div class="mt-2 text-xs text-gray-500">
                                Format yang diperbolehkan: PDF, DOC, DOCX (Max 10MB)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button 
                    label="Batal" 
                    severity="secondary" 
                    @click="closeApprovalDialog" 
                />
                <Button 
                    label="Simpan" 
                    severity="primary" 
                    @click="submitApproval" 
                    :loading="isUploadingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Quick Approval Dialog -->
    <Dialog 
        v-model:visible="showQuickApprovalDialog" 
        modal 
        header="Approval Kepdir Sirkuler" 
        :style="{ width: '70rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="!isUploadingApproval"
    >
        <form @submit.prevent="submitQuickApproval" class="space-y-6">
            <!-- Basic Information -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-info-circle text-blue-600"></i>
                        <span>Informasi Dasar</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Judul Kepdir <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="kepdirDetail?.judulKepdir || '-'"
                                disabled
                                class="w-full"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Tanggal Terbit <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="formatDate(kepdirDetail?.tanggalTerbit)"
                                disabled
                                class="w-full"
                            />
                        </div>
                    </div>
                </template>
            </Card>


            <!-- File Upload -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-upload text-purple-600"></i>
                        <span>Upload File Approval</span>
                    </div>
                </template>
                <template #content>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            Upload File <span class="text-red-500">*</span>
                        </label>
                        <FileUpload
                            mode="basic"
                            name="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            :maxFileSize="10000000"
                            :disabled="isUploadingApproval"
                            @upload="onFileUpload"
                            class="w-full"
                        />
                        <div class="mt-2 text-xs text-gray-500">
                            File wajib diupload untuk approval
                        </div>
                    </div>
                </template>
            </Card>
        </form>

        <template #footer>
            <div class="flex justify-end gap-3">
                <Button
                    label="Batal"
                    icon="pi pi-times"
                    severity="secondary"
                    @click="showQuickApprovalDialog = false"
                    :disabled="isUploadingApproval"
                />
                <Button
                    label="Simpan Approval"
                    icon="pi pi-save"
                    severity="success"
                    @click="submitQuickApproval"
                    :loading="isUploadingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Quick Reject Dialog -->
    <Dialog 
        v-model:visible="showQuickRejectDialog" 
        modal 
        header="Penolakan Kepdir Sirkuler" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="!isUploadingApproval"
    >
        <form @submit.prevent="submitQuickReject" class="space-y-6">
            <!-- Basic Information -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-info-circle text-blue-600"></i>
                        <span>Informasi Dasar</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Judul Kepdir <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="kepdirDetail?.judulKepdir || '-'"
                                disabled
                                class="w-full"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Tanggal Terbit <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="formatDate(kepdirDetail?.tanggalTerbit)"
                                disabled
                                class="w-full"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Rejection Reason -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-times-circle text-red-600"></i>
                        <span>Alasan Penolakan</span>
                    </div>
                </template>
                <template #content>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            Alasan Penolakan <span class="text-red-500">*</span>
                        </label>
                        <Textarea
                            v-model="quickRejectData.deskripsi"
                            placeholder="Masukkan alasan penolakan..."
                            class="w-full"
                            rows="4"
                            :disabled="isUploadingApproval"
                        />
                    </div>
                </template>
            </Card>
        </form>

        <template #footer>
            <div class="flex justify-end gap-3">
                <Button
                    label="Batal"
                    icon="pi pi-times"
                    severity="secondary"
                    @click="showQuickRejectDialog = false"
                    :disabled="isUploadingApproval"
                />
                <Button
                    label="Simpan Penolakan"
                    icon="pi pi-save"
                    severity="danger"
                    @click="submitQuickReject"
                    :loading="isUploadingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Global Components -->
    <Toast />
</template>

<style scoped lang="scss">
// Custom styles for the detail page
.space-y-6 > * + * {
    margin-top: 1.5rem;
}

.space-y-4 > * + * {
    margin-top: 1rem;
}

// Card styling
:deep(.p-card) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-card-title) {
    font-size: 1.1rem;
    font-weight: 600;
    color: #374151;
}

// Grid styling
.grid {
    display: grid;
}

.grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
}

.col-span-4 {
    grid-column: span 4 / span 4;
}

.col-span-8 {
    grid-column: span 8 / span 8;
}

.col-span-12 {
    grid-column: span 12 / span 12;
}

@media (min-width: 768px) {
    .md\:col-span-3 {
        grid-column: span 3 / span 3;
    }
    
    .md\:col-span-9 {
        grid-column: span 9 / span 9;
    }
}

@media (min-width: 1024px) {
    .lg\:col-span-6 {
        grid-column: span 6 / span 6;
    }
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

// Disabled input styling
:deep(.p-inputtext:disabled),
:deep(.p-datepicker:disabled) {
    opacity: 1;
    background-color: #f3f4f6;
    color: #374151;
}
</style>
