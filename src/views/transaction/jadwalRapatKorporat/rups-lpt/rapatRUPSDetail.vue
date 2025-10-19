<script setup>
// Vue Composition API
import { onMounted, ref, computed, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import ImagePreview from '@/views/component/ImagePreview.vue';

// Services
import RapatRUPSService from './service/RapatRUPSService';
// import { useAuthStore } from '@/stores/authStore';

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
const rapatData = ref({});
const arahanList = ref([]);
const fileList = ref([]);
const showImagePreview = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');
const activeTab = ref(0);

// Approval Tindak Lanjut data
const approvalData = ref({
    jadwalRapatId: '',
    agenda: '',
    picId: '',
    statusApproval: 0,
    actionPlan: '',
    progress: 0,
    deskripsi: '',
    statusTindakLanjut: 0,
    jenisFile: '',
    fileName: '',
    contentType: '',
    path: ''
});
const approvalId = ref(null);
const statusTindakLanjutOptions = ref([]);
const picOptions = ref([]);
const jenisFileOptions = ref([]);
const isSubmittingApproval = ref(false);
const approvalForm = ref(null);
const showApprovalModal = ref(false);
const showQuickApprovalDialog = ref(false);
const showQuickRejectDialog = ref(false);
const selectedArahan = ref(null);
const uploadedFile = ref(null);
const quickApprovalData = ref({
    jadwalRapatId: '',
    agenda: '',
    picId: '',
    statusApproval: 1,
    actionPlan: '',
    progress: 0,
    deskripsi: '',
    statusTindakLanjut: 0
});
const quickRejectData = ref({
    jadwalRapatId: '',
    agenda: '',
    picId: '',
    statusApproval: 0,
    deskripsi: ''
});

// Arahan RUPS options from API
const arahanRUPSOptions = ref([
    { label: 'Dewan Komisaris', value: 1 },
    { label: 'Pemegang Saham', value: 2 }
]);

// Approval options
const statusApprovalOptions = ref([
    { label: 'Belum Diputuskan', value: 0 },
    { label: 'Setuju', value: 1 },
    { label: 'Tidak Setuju', value: 2 }
]);

const progressOptions = ref([
    { label: 'In Progress', value: 0 },
    { label: 'Selesai Berkelanjutan', value: 1 },
    { label: 'Selesai', value: 2 }
]);


// ==========================================
// COMPUTED PROPERTIES
// ==========================================
const isUserPIC = computed(() => {
    // Check if current user is in the PIC list by ID
    const currentUserId = authStore.userId || authStore.id;
    const isPIC = arahanList.value.some(arahan => arahan.picId === currentUserId);
    return isPIC;
});

// Computed property to calculate duration from start and end times
const calculatedDuration = computed(() => {
    if (!rapatData.value.tanggalRapatFrom || !rapatData.value.tanggalRapatTo) {
        return 0;
    }
    
    const startTime = new Date(rapatData.value.tanggalRapatFrom);
    const endTime = new Date(rapatData.value.tanggalRapatTo);
    
    if (endTime <= startTime) {
        return 0;
    }
    
    const diffInMs = endTime.getTime() - startTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    return diffInMinutes;
});

// Computed property for formatted duration display
const formattedDuration = computed(() => {
    const duration = calculatedDuration.value;
    if (!duration || duration <= 0) return '-';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
        return `${hours} jam ${minutes} menit`;
    } else if (hours > 0) {
        return `${hours} jam`;
    } else {
        return `${minutes} menit`;
    }
});

const canUserApproveReject = computed(() => {
    // Check if user is PIC AND hasn't approved/rejected yet
    if (!isUserPIC.value) return false;
    
    const currentUserId = authStore.userId || authStore.id;
    const userArahan = arahanList.value.find(arahan => arahan.picId === currentUserId);
    
    if (!userArahan) return false;
    
    // Check if user already has approval status (not pending)
    const statusApproval = getStatusApproval(userArahan);
    
    // If status is null/undefined, user can still approve/reject
    // If status is 0 (rejected) or 1 (approved), user cannot approve/reject anymore
    return statusApproval === null || statusApproval === undefined;
});

const modelRapatOptions = computed(() => [
    { label: 'Offline', value: 'offline' },
    { label: 'Online', value: 'online' },
    { label: 'Hybrid', value: 'hybrid' }
]);

// Tabs configuration
const tabs = ref([
    {
        header: 'Jadwal Rapat',
        icon: 'pi pi-calendar'
    },
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
// DATA LOADING FUNCTIONS
// ==========================================
const loadData = async (jadwalRapatId) => {
    try {
        isLoading.value = true;
        const response = await RapatRUPSService.getDetailRapatRUPS(jadwalRapatId);
        
        // Check if response has data property
        if (response.data && response.data.success === true && response.data.data) {
            rapatData.value = response.data.data;
            arahanList.value = response.data.data.arahanList || [];
            fileList.value = response.data.data.fileList || [];
        } else {
            console.error('No data in response:', response);
            throw new Error('Data tidak ditemukan');
        }
    } catch (error) {
        console.error('Error loading data:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data rapat RUPS: ' + error.message,
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// Load approval data and options
const loadApprovalData = async (jadwalRapatId) => {
    try {
        // Initialize approval data
        approvalData.value.jadwalRapatId = jadwalRapatId;
        approvalData.value.agenda = rapatData.value.jadwalAgenda || '';

        // Load status tindak lanjut options
        const statusResponse = await RapatRUPSService.getStatusTindakLanjutEnum();
        if (statusResponse.data && statusResponse.data.success) {
            statusTindakLanjutOptions.value = statusResponse.data.data.map(item => ({
                label: item.description,
                value: item.code
            }));
        }

        // Load PIC options
        // const picResponse = await RapatRUPSService.getPICOptions();
        // if (picResponse.data && picResponse.data.success) {
        //     // Map API response to dropdown format
        //     picOptions.value = picResponse.data.data.map(item => ({
        //         label: item.value, // Use 'value' field as label
        //         value: item.id     // Use 'id' field as value
        //     }));
        // }

        // Try to load existing approval data
        try {
            const existingApproval = await RapatRUPSService.getApprovalTindakLanjutByJadwalRapat(jadwalRapatId);
            if (existingApproval.data && existingApproval.data.success && existingApproval.data.data) {
                // Handle array response - get the first approval or find by PIC
                const approvalList = existingApproval.data.data;
                if (approvalList && approvalList.length > 0) {
                    // For now, use the first approval. In the future, you might want to filter by PIC
                    const approval = approvalList[0];
                    Object.assign(approvalData.value, approval);
                    approvalId.value = approval.id; // Store the approval ID for PUT requests
                }
            }
        } catch (error) {
        }

    } catch (error) {
        console.error('Error loading approval data:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data approval: ' + error.message,
            life: 3000
        });
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const getStatusDecisionLabel = (status) => {
    const option = statusDecisionOptions.value.find(opt => opt.value === status);
    return option ? option.label : 'Unknown';
};

const getStatusDecisionSeverity = (status) => {
    switch (status) {
        case 0: return 'info';     // Belum Diputuskan
        case 1: return 'success';   // Diputuskan
        case 2: return 'warning';  // Ditunda
        default: return 'secondary';
    }
};

const getModelRapatLabel = (model) => {
    const option = modelRapatOptions.value.find(opt => opt.value === model);
    return option ? option.label : model;
};

const getArahanRUPSLabel = (code) => {
    const option = arahanRUPSOptions.value.find(opt => opt.value === code);
    return option ? option.label : code;
};

const getStatusApproval = (arahan) => {
    // Check if tindakLanjutList exists and has items
    if (arahan.tindakLanjutList && arahan.tindakLanjutList.length > 0) {
        return arahan.tindakLanjutList[0].statusApproval;
    }
    // Fallback to null/undefined if no tindakLanjutList
    return null;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const formatDuration = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
        return `${hours} jam ${mins} menit`;
    }
    return `${mins} menit`;
};

const getDisplayRole = () => {
    const roleFromStorage = localStorage.getItem('role');
    const roleTypeFromStorage = localStorage.getItem('userRole');
    return authStore.roleType || roleFromStorage || roleTypeFromStorage;
};

// ==========================================
// APPROVAL FUNCTIONS
// ==========================================
const submitApproval = async () => {
    try {
        isSubmittingApproval.value = true;
        
        // Validate required fields
        if (!approvalData.value.picId) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'PIC harus dipilih',
                life: 3000
            });
            return;
        }

        if (approvalData.value.statusApproval === 1 && !approvalData.value.actionPlan) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'Action Plan harus diisi jika status approval adalah "Ya"',
                life: 3000
            });
            return;
        }

        if (approvalData.value.statusApproval === 0 && !approvalData.value.deskripsi) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'Alasan harus diisi jika status approval adalah "Tidak"',
                life: 3000
            });
            return;
        }

        // Submit approval using PUT endpoint (without file)
        const id = approvalId.value || selectedArahan.value?.id || 'new'; // Use approval ID or arahan ID
        const response = await RapatRUPSService.submitApprovalTindakLanjut(id, approvalData.value);
        
        // Upload file separately if provided
        if (uploadedFile.value) {
            const uploadFileType = 'MATERI_TINDAK_LANJUT'; // File type for approval tindak lanjut
            await RapatRUPSService.uploadApprovalTindakLanjutFile(id, uploadFileType, uploadedFile.value);
        }
        
        if (response.data && response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Approval tindak lanjut berhasil disimpan',
                life: 3000
            });
            
            // Close modal and reload data
            closeApprovalModal();
            await loadData(route.params.jadwalRapatId || route.params.id);
        } else {
            throw new Error(response.data?.message || 'Gagal menyimpan approval');
        }

    } catch (error) {
        console.error('Error submitting approval:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menyimpan approval: ' + error.message,
            life: 3000
        });
    } finally {
        isSubmittingApproval.value = false;
    }
};

const resetApprovalForm = () => {
    approvalData.value = {
        jadwalRapatId: route.params.jadwalRapatId || route.params.id,
        agenda: rapatData.value.jadwalAgenda || '',
        picId: '',
        statusApproval: 0,
        actionPlan: '',
        progress: 0,
        deskripsi: '',
        statusTindakLanjut: 0,
        jenisFile: '',
        fileName: '',
        contentType: '',
        path: ''
    };
    approvalId.value = null;
    uploadedFile.value = null;
};

const openApprovalModal = async (arahan) => {
    selectedArahan.value = arahan;
    
    // Try to load existing approval data for this specific arahan
    try {
        const jadwalRapatId = route.params.jadwalRapatId || route.params.id;
        const existingApproval = await RapatRUPSService.getApprovalTindakLanjutByJadwalRapat(jadwalRapatId);
        
        if (existingApproval.data && existingApproval.data.success && existingApproval.data.data) {
            const approvalList = existingApproval.data.data;
            // Find approval by PIC ID
            const existingApprovalForPIC = approvalList.find(approval => approval.picId === arahan.picId);
            
            if (existingApprovalForPIC) {
                // Use existing approval data
                approvalData.value = {
                    jadwalRapatId: existingApprovalForPIC.jadwalRapatId,
                    agenda: existingApprovalForPIC.agenda || rapatData.value.jadwalAgenda || '',
                    picId: existingApprovalForPIC.picId,
                    statusApproval: existingApprovalForPIC.statusApproval,
                    actionPlan: existingApprovalForPIC.actionPlan || '',
                    progress: existingApprovalForPIC.progress || 0,
                    deskripsi: existingApprovalForPIC.deskripsi || '',
                    statusTindakLanjut: existingApprovalForPIC.statusTindakLanjut || 0,
                    jenisFile: existingApprovalForPIC.nameFile || '',
                    fileName: existingApprovalForPIC.fileName || '',
                    contentType: existingApprovalForPIC.contentType || '',
                    path: ''
                };
                approvalId.value = existingApprovalForPIC.id; // Store the approval ID for PUT requests
            } else {
                // No existing approval, use default values
    approvalData.value = {
        jadwalRapatId: route.params.jadwalRapatId || route.params.id,
        agenda: rapatData.value.jadwalAgenda || '',
        picId: arahan.picId,
                    statusApproval: getStatusApproval(arahan) !== null ? getStatusApproval(arahan) : 0,
        actionPlan: arahan.actionPlan || '',
        progress: arahan.progress || 0,
        deskripsi: arahan.deskripsi || '',
        statusTindakLanjut: arahan.statusTindakLanjut || 0,
        jenisFile: '',
        fileName: '',
        contentType: '',
        path: ''
    };
                approvalId.value = null; // No existing approval ID
            }
        } else {
            // No approval data found, use default values
            approvalData.value = {
                jadwalRapatId: route.params.jadwalRapatId || route.params.id,
                agenda: rapatData.value.jadwalAgenda || '',
                picId: arahan.picId,
                statusApproval: getStatusApproval(arahan) !== null ? getStatusApproval(arahan) : 0,
                actionPlan: arahan.actionPlan || '',
                progress: arahan.progress || 0,
                deskripsi: arahan.deskripsi || '',
                statusTindakLanjut: arahan.statusTindakLanjut || 0,
                jenisFile: '',
                fileName: '',
                contentType: '',
                path: ''
            };
            approvalId.value = null; // No existing approval ID
        }
    } catch (error) {
        console.error('Error loading approval data for modal:', error);
        // Use default values if error occurs
        approvalData.value = {
            jadwalRapatId: route.params.jadwalRapatId || route.params.id,
            agenda: rapatData.value.jadwalAgenda || '',
            picId: arahan.picId,
            statusApproval: arahan.statusApprove !== null ? arahan.statusApprove : 0,
            actionPlan: arahan.actionPlan || '',
            progress: arahan.progress || 0,
            deskripsi: arahan.deskripsi || '',
            statusTindakLanjut: arahan.statusTindakLanjut || 0,
            jenisFile: '',
            fileName: '',
            contentType: '',
            path: ''
        };
        approvalId.value = null; // No existing approval ID
    }
    
    showApprovalModal.value = true;
};

const closeApprovalModal = () => {
    showApprovalModal.value = false;
    selectedArahan.value = null;
    resetApprovalForm();
};

// Quick Approve/Reject functions
const openQuickApprovalDialog = () => {
    if (!canUserApproveReject.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Anda bukan PIC atau sudah melakukan approval/rejection untuk jadwal rapat ini',
            life: 3000
        });
        return;
    }
    
    // Get user's arahan data by ID
    const currentUserId = authStore.userId || authStore.id;
    const userArahan = arahanList.value.find(arahan => arahan.picId === currentUserId);
    
    if (userArahan) {
        quickApprovalData.value = {
            jadwalRapatId: route.params.jadwalRapatId || route.params.id,
            agenda: rapatData.value.jadwalAgenda || '',
            picId: userArahan.picId,
            statusApproval: 1,
            actionPlan: '',
            progress: 0,
            deskripsi: '',
            statusTindakLanjut: 0
        };
        
        showQuickApprovalDialog.value = true;
    }
};

const openQuickRejectDialog = () => {
    if (!canUserApproveReject.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Anda bukan PIC atau sudah melakukan approval/rejection untuk jadwal rapat ini',
            life: 3000
        });
        return;
    }
    
    // Get user's arahan data by ID
    const currentUserId = authStore.userId || authStore.id;
    const userArahan = arahanList.value.find(arahan => arahan.picId === currentUserId);
    
    if (userArahan) {
        quickRejectData.value = {
            jadwalRapatId: route.params.jadwalRapatId || route.params.id,
            agenda: rapatData.value.jadwalAgenda || '',
            picId: userArahan.picId,
            statusApproval: 0,
            deskripsi: ''
        };
        
        showQuickRejectDialog.value = true;
    }
};

const submitQuickApproval = async () => {
    try {
        isSubmittingApproval.value = true;
        
        // Validate required fields
        if (!quickApprovalData.value.actionPlan) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'Action Plan harus diisi',
                life: 3000
            });
            return;
        }
        
        // Get existing approval ID
        const existingApproval = await RapatRUPSService.getApprovalTindakLanjutByJadwalRapat(quickApprovalData.value.jadwalRapatId);
        let approvalId = 'new';
        
        if (existingApproval.data && existingApproval.data.success && existingApproval.data.data) {
            const approvalList = existingApproval.data.data;
            const existingApprovalForPIC = approvalList.find(approval => approval.picId === quickApprovalData.value.picId);
            
            if (existingApprovalForPIC) {
                approvalId = existingApprovalForPIC.id;
            }
        }
        
        const response = await RapatRUPSService.submitApprovalTindakLanjut(approvalId, quickApprovalData.value);
        
        // Upload file separately if provided
        if (uploadedFile.value) {
            const uploadFileType = 'MATERI_TINDAK_LANJUT'; // File type for approval tindak lanjut
            await RapatRUPSService.uploadApprovalTindakLanjutFile(approvalId, uploadFileType, uploadedFile.value);
        }
        
        if (response.data && response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Approval berhasil disimpan',
                life: 3000
            });
            
            showQuickApprovalDialog.value = false;
            await loadData(route.params.jadwalRapatId || route.params.id);
        } else {
            throw new Error(response.data?.message || 'Gagal menyimpan approval');
        }
    } catch (error) {
        console.error('Error submitting approval:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menyimpan approval: ' + error.message,
            life: 3000
        });
    } finally {
        isSubmittingApproval.value = false;
    }
};

const submitQuickReject = async () => {
    try {
        isSubmittingApproval.value = true;
        
        // Validate required fields
        if (!quickRejectData.value.deskripsi) {
            toast.add({
                severity: 'error',
                summary: 'Validasi Error',
                detail: 'Alasan penolakan harus diisi',
                life: 3000
            });
            return;
        }
        
        // Get existing approval ID
        const existingApproval = await RapatRUPSService.getApprovalTindakLanjutByJadwalRapat(quickRejectData.value.jadwalRapatId);
        let approvalId = 'new';
        
        if (existingApproval.data && existingApproval.data.success && existingApproval.data.data) {
            const approvalList = existingApproval.data.data;
            const existingApprovalForPIC = approvalList.find(approval => approval.picId === quickRejectData.value.picId);
            
            if (existingApprovalForPIC) {
                approvalId = existingApprovalForPIC.id;
            }
        }
        
        const response = await RapatRUPSService.submitApprovalTindakLanjut(approvalId, quickRejectData.value);
        
        if (response.data && response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Penolakan berhasil disimpan',
                life: 3000
            });
            
            showQuickRejectDialog.value = false;
            await loadData(route.params.jadwalRapatId || route.params.id);
        } else {
            throw new Error(response.data?.message || 'Gagal menyimpan penolakan');
        }
    } catch (error) {
        console.error('Error submitting reject:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menyimpan penolakan: ' + error.message,
            life: 3000
        });
    } finally {
        isSubmittingApproval.value = false;
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

// ==========================================
// FILE FUNCTIONS
// ==========================================
const previewFile = async (file) => {
    try {
        const jadwalRapatId = route.params.jadwalRapatId || route.params.id;
        
        if (!jadwalRapatId) {
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

        // Determine upload file type based on file properties or use default
        const uploadFileType = file.uploadFileType || 'DOKUMEN_RUPS_LPT';
        
        const response = await RapatRUPSService.viewFile(jadwalRapatId, uploadFileType);
        
        // Create blob URL for preview
        const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Use ImagePreview component for better file viewing
        previewUrl.value = url;
        previewFileName.value = file.originalFileName || 'File';
        showImagePreview.value = true;

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
            summary: 'Kesalahan',
            detail: 'Gagal membuka file: ' + (error.response?.data?.message || error.message || 'File tidak ditemukan'),
            life: 3000
        });
    }
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
// Tab navigation is handled automatically by TabView component

const goBack = () => {
    const tahun = route.query.tahun || new Date().getFullYear();
    const jenisRapat = route.query.jenisRapatParam || '4';
    router.push(`/transaction/rapat-rups-lpt/${tahun}/${jenisRapat}`);
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(async () => {
    
    // Try to get jadwalRapatId from params (new route) or id (old route)
    const jadwalRapatId = route.params.jadwalRapatId || route.params.id;
    
    if (jadwalRapatId) {
        await loadData(jadwalRapatId);
        
        // Load approval data if user is BOD-1
        if (getDisplayRole() === '1' || getDisplayRole() === 1 || authStore.role === '1' || authStore.role === 1) {
            await loadApprovalData(jadwalRapatId);
        }
    } else {
        console.error('No jadwalRapatId found in route params');
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'ID jadwal rapat tidak valid',
            life: 3000
        });
        goBack();
    }
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Detail Rapat RUPS LPT
        </div>
        
        <!-- User Information -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ getDisplayRole() }}
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
        <div v-else-if="rapatData && Object.keys(rapatData).length > 0" class="space-y-6">
            <!-- Header Card with Action Buttons -->
            <Card>
                <template #content>
                    <div class="flex justify-between items-start">
                        <div>
                            <h2 class="text-xl font-bold text-gray-800 mb-2">
                                {{ rapatData.jadwalAgenda || 'Rapat RUPS LPT' }}
                            </h2>
                            <p class="text-sm text-gray-600">
                                {{ rapatData.jadwalDeskripsi || 'Deskripsi rapat tidak tersedia' }}
                            </p>
                        </div>
                        
                        <div class="flex gap-2">
                            <Button
                                label="Kembali"
                                icon="pi pi-arrow-left"
                                severity="secondary"
                                @click="goBack"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Tab Content Card -->
            <Card>
                <template #content>
                    <TabView v-model:activeIndex="activeTab">
                        <!-- Tab 1: Meeting Schedule (Read-only) -->
                        <TabPanel>
                            <template #header>
                                <i class="pi pi-calendar mr-2"></i>
                                <span>Jadwal Rapat</span>
                </template>
                            
                            <div class="space-y-6">
                        <div class="text-left mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                <i class="pi pi-calendar mr-2"></i>
                                Informasi Jadwal Rapat
                            </h3>
                            <p class="text-sm text-gray-600">Detail informasi jadwal rapat RUPS LPT</p>
                        </div>

                            <div class="space-y-4">
                                <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Agenda Rapat <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="rapatData.jadwalAgenda"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Tanggal Rapat <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="formatDate(rapatData.tanggalRapatFrom || rapatData.tanggalRapat)"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div> -->

                                <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Waktu Mulai <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="formatDateTime(rapatData.tanggalRapatFrom || rapatData.tanggalRapat)"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Waktu Selesai <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="formatDateTime(rapatData.tanggalRapatTo || rapatData.tanggalRapat)"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Model Rapat <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <div class="flex gap-6">
                                            <div class="flex items-center">
                                                <RadioButton 
                                                    :modelValue="rapatData.modelRapat" 
                                                    inputId="offline" 
                                                    name="modelRapat" 
                                                    value="Offline"
                                                    disabled
                                                />
                                                <label for="offline" class="ml-2">Offline</label>
                                            </div>
                                            <div class="flex items-center">
                                                <RadioButton 
                                                    :modelValue="rapatData.modelRapat" 
                                                    inputId="online" 
                                                    name="modelRapat" 
                                                    value="Online"
                                                    disabled
                                                />
                                                <label for="online" class="ml-2">Online</label>
                                            </div>
                                            <div class="flex items-center">
                                                <RadioButton 
                                                    :modelValue="rapatData.modelRapat" 
                                                    inputId="hybrid" 
                                                    name="modelRapat" 
                                                    value="Hybrid"
                                                    disabled
                                                />
                                                <label for="hybrid" class="ml-2">Hybrid</label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Lokasi Rapat <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="rapatData.lokasi"
                                            disabled
                                            class="w-full"
                                        />
                                </div>
                            </div>

                                <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Durasi Rapat <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="formattedDuration || formatDuration(rapatData.durasi)"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- Link Meeting - only show for Online/Hybrid -->
                                <div v-if="rapatData.modelRapat === 'Online' || rapatData.modelRapat === 'Hybrid'" class="grid grid-cols-12 gap-2">
                                <label class="col-span-2 font-bold text-gray-700 self-center">
                                        Link Meeting <span class="text-red-500">*</span>
                                    </label>
                                <div class="col-span-10">
                                        <InputText 
                                            :value="rapatData.linkMeeting"
                                            disabled
                                            class="w-full"
                                        />
                                    </div>
                                </div>

                                <!-- Tahun field hidden - automatically set from parameter -->
                                <div class="hidden">
                                    <InputNumber 
                                        :modelValue="rapatData.tahun"
                                        disabled
                                    />
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="grid grid-cols-12 gap-2">
                            <label class="col-span-2 font-bold text-gray-700">
                                Deskripsi Rapat <span class="text-red-500">*</span>
                            </label>
                            <div class="col-span-10">
                                <Textarea
                                    :value="rapatData.jadwalDeskripsi"
                                    disabled
                                    class="w-full"
                                    rows="4"
                                />
                            </div>
                        </div>
                    </div>
                    </TabPanel>

                    <!-- Tab 2: Attachment Document (Read-only) -->
                    <TabPanel>
                        <template #header>
                            <i class="pi pi-file mr-2"></i>
                            <span>Attachment Document</span>
                        </template>
                        
                        <div class="space-y-6">
                        <div class="text-left mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">
                                <i class="pi pi-file mr-2"></i>
                                Attachment Document
                            </h3>
                            <p class="text-sm text-gray-600">Dokumen yang terlampir untuk rapat RUPS LPT</p>
                        </div>

                        <div v-if="fileList.length > 0" class="space-y-3">
                            <div 
                                v-for="(file, index) in fileList" 
                                :key="index"
                                class="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-file text-gray-500 text-lg"></i>
                                    <span class="font-medium text-gray-800">{{ file.originalFileName }}</span>
                                </div>
                                
                                <Button
                                    icon="pi pi-eye"
                                    label="Preview"
                                    severity="info"
                                    size="small"
                                    @click="previewFile(file)"
                                    class="text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
                                />
                            </div>
                        </div>
                        <div v-else class="text-center py-8">
                            <i class="pi pi-file text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600">Belum ada dokumen yang diupload</p>
                        </div>
                    </div>
                    </TabPanel>

                    <!-- Tab 3: Arahan & PIC (Read-only) -->
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
                            <p class="text-sm text-gray-600">Detail arahan rapat dan PIC (Person In Charge)</p>
                        </div>

                        <div v-if="arahanList.length > 0" class="border border-blue-200 rounded-lg p-4 bg-blue-50">
                            <h4 class="text-md font-semibold text-gray-700 mb-4">PIC & Arahan Rapat</h4>
                            
                            <div class="overflow-x-auto">
                                <table class="w-full border-collapse">
                                    <thead>
                                        <tr class="bg-gray-100">
                                            <th class="border border-gray-300 px-4 py-2 text-left font-bold">No</th>
                                            <th class="border border-gray-300 px-4 py-2 text-left font-bold">PIC</th>
                                            <th class="border border-gray-300 px-4 py-2 text-left font-bold">Arahan Rapat</th>
                                            <th class="border border-gray-300 px-4 py-2 text-left font-bold">Arahan RUPS</th>
                                            <th class="border border-gray-300 px-4 py-2 text-left font-bold">Target Waktu</th>
                                        <th class="border border-gray-300 px-4 py-2 text-center font-bold">Status Approval</th>
                                            <th v-if="getDisplayRole() === '1' || getDisplayRole() === 1 || authStore.role === '1' || authStore.role === 1" class="border border-gray-300 px-4 py-2 text-center font-bold hidden">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(arahan, index) in arahanList" :key="index" class="hover:bg-gray-50">
                                            <td class="border border-gray-300 px-4 py-2">{{ index + 1 }}</td>
                                            <td class="border border-gray-300 px-4 py-2">{{ arahan.namaPic || '-' }}</td>
                                            <td class="border border-gray-300 px-4 py-2">{{ arahan.arahan || '-' }}</td>
                                            <td class="border border-gray-300 px-4 py-2">{{ getArahanRUPSLabel(arahan.arahanRUPS) }}</td>
                                            <td class="border border-gray-300 px-4 py-2">{{ formatDate(arahan.targetWaktu) }}</td>
                                            
                                            <!-- Status Approval Column -->
                                            <td class="border border-gray-300 px-4 py-2 text-center">
                                                <!-- Status: Approved -->
                                                <div v-if="getStatusApproval(arahan) === 1" class="flex items-center justify-center gap-2">
                                                    <i class="pi pi-check-circle text-green-600"></i>
                                                    <span class="text-green-600 font-semibold text-sm">Approved</span>
                                                </div>
                                                
                                                <!-- Status: Rejected -->
                                                <div v-else-if="getStatusApproval(arahan) === 0" class="flex items-center justify-center gap-2">
                                                    <i class="pi pi-times-circle text-red-600"></i>
                                                    <span class="text-red-600 font-semibold text-sm">Rejected</span>
                                                </div>
                                                
                                                <!-- Status: Pending -->
                                                <div v-else class="flex items-center justify-center gap-2">
                                                    <i class="pi pi-clock text-orange-600"></i>
                                                    <span class="text-orange-600 font-semibold text-sm">Pending</span>
                                                </div>
                                            </td>
                                            
                                            <!-- Action Column (only for BOD role) -->
                                            <td v-if="getDisplayRole() === '1' || getDisplayRole() === 1 || authStore.role === '1' || authStore.role === 1" class="border border-gray-300 px-4 py-2 text-center hidden">
                                                <!-- Status: Approved - Show disabled button -->
                                                <div v-if="getStatusApproval(arahan) === 1" class="flex items-center justify-center">
                                                    <Button
                                                        icon="pi pi-check-circle"
                                                        label="Approved"
                                                        severity="success"
                                                        size="small"
                                                        disabled
                                                        class="opacity-50 cursor-not-allowed"
                                                    />
                                                </div>
                                                
                                                <!-- Status: Rejected - Show disabled button -->
                                                <div v-else-if="getStatusApproval(arahan) === 0" class="flex items-center justify-center">
                                                    <Button
                                                        icon="pi pi-times-circle"
                                                        label="Rejected"
                                                        severity="danger"
                                                        size="small"
                                                        disabled
                                                        class="opacity-50 cursor-not-allowed"
                                                    />
                                                </div>
                                                
                                                <!-- Status: Pending - Show active Approve Button -->
                                                <Button
                                                    v-else
                                                    icon="pi pi-check-circle"
                                                    label="Approve"
                                                    severity="success"
                                                    size="small"
                                                    @click="openApprovalModal(arahan)"
                                                    class="text-green-600 border-green-200 bg-green-50 hover:bg-green-100"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div v-else class="text-center py-8">
                            <i class="pi pi-users text-4xl text-gray-400 mb-4"></i>
                            <p class="text-gray-600">Belum ada arahan rapat yang ditambahkan</p>
                        </div>
                    </div>
                    </TabPanel>
                </TabView>
                </template>
            </Card>
            
            <!-- Quick Approve & Reject Buttons (Only show if user is PIC and hasn't approved/rejected yet) -->
            <div v-if="canUserApproveReject" class="mt-4 flex justify-end gap-4">
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
                    @click="goBack"
                />
            </div>
        </div>
    </div>
    
    <!-- Approval Modal -->
    <Dialog 
        v-model:visible="showApprovalModal" 
        modal 
        :header="selectedArahan?.statusApprove !== null ? 'Approval Tindak Lanjut Rapat' : 'Approval Tindak Lanjut Rapat'" 
        :style="{ width: '70rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="!isSubmittingApproval"
    >
        <form ref="approvalForm" @submit.prevent="submitApproval" class="space-y-6">
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
                                Agenda Rapat <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                v-model="approvalData.agenda"
                                disabled
                                class="w-full"
                                placeholder="Agenda rapat"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                PIC (Person In Charge) <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="selectedArahan?.namaPic || '-'"
                                disabled
                                class="w-full"
                                placeholder="PIC"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Approval Decision -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-question-circle text-orange-600"></i>
                        <span>Keputusan Approval</span>
                    </div>
                </template>
                <template #content>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-3">
                                Apakah Anda Menyetujui? <span class="text-red-500">*</span>
                            </label>
                            <div class="flex gap-6">
                                <div class="flex items-center">
                                    <RadioButton 
                                        v-model="approvalData.statusApproval" 
                                        inputId="approve_yes" 
                                        name="statusApproval" 
                                        :value="1"
                                        :disabled="isSubmittingApproval"
                                    />
                                    <label for="approve_yes" class="ml-2 text-green-700 font-semibold">Ya</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton 
                                        v-model="approvalData.statusApproval" 
                                        inputId="approve_no" 
                                        name="statusApproval" 
                                        :value="0"
                                        :disabled="isSubmittingApproval"
                                    />
                                    <label for="approve_no" class="ml-2 text-red-700 font-semibold">Tidak</label>
                                </div>
                            </div>
                        </div>

                        <!-- Action Plan (if approved) -->
                        <div v-if="approvalData.statusApproval === 1">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Action Plan Tindak Lanjut <span class="text-red-500">*</span>
                            </label>
                            <Textarea
                                v-model="approvalData.actionPlan"
                                placeholder="Masukkan action plan tindak lanjut..."
                                class="w-full"
                                rows="4"
                                :disabled="isSubmittingApproval"
                            />
                        </div>

                        <!-- Reason (if not approved) -->
                        <div v-if="approvalData.statusApproval === 0">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Alasan Penolakan <span class="text-red-500">*</span>
                            </label>
                            <Textarea
                                v-model="approvalData.deskripsi"
                                placeholder="Masukkan alasan penolakan..."
                                class="w-full"
                                rows="4"
                                :disabled="isSubmittingApproval"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Progress and Status (if approved) -->
            <Card v-if="approvalData.statusApproval === 1">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-chart-line text-green-600"></i>
                        <span>Progress dan Status</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Progress (%)
                            </label>
                            <InputNumber 
                                v-model="approvalData.progress"
                                :min="0"
                                :max="100"
                                suffix="%"
                                class="w-full"
                                :disabled="isSubmittingApproval"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Status Tindak Lanjut
                            </label>
                            <Dropdown 
                                v-model="approvalData.statusTindakLanjut"
                                :options="statusTindakLanjutOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih status"
                                class="w-full"
                                :disabled="isSubmittingApproval"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- File Upload (if approved) -->
            <Card v-if="approvalData.statusApproval === 1">
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-upload text-purple-600"></i>
                        <span>Upload Materi Tindak Lanjut</span>
                    </div>
                </template>
                <template #content>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            Upload File
                        </label>
                        <FileUpload
                            mode="basic"
                            name="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            :maxFileSize="10000000"
                            :disabled="isSubmittingApproval"
                            @upload="onFileUpload"
                            class="w-full"
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
                    @click="closeApprovalModal"
                    :disabled="isSubmittingApproval"
                />
                <Button
                    label="Reset"
                    icon="pi pi-refresh"
                    severity="secondary"
                    @click="resetApprovalForm"
                    :disabled="isSubmittingApproval"
                />
                <Button
                    label="Simpan Approval"
                    icon="pi pi-save"
                    severity="success"
                    @click="submitApproval"
                    :loading="isSubmittingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Quick Approval Dialog -->
    <Dialog 
        v-model:visible="showQuickApprovalDialog" 
        modal 
        header="Approval Tindak Lanjut Rapat" 
        :style="{ width: '70rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="!isSubmittingApproval"
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
                                Agenda Rapat <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                v-model="quickApprovalData.agenda"
                                disabled
                                class="w-full"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                PIC <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="authStore.name"
                                disabled
                                class="w-full"
                            />
                        </div>
                    </div>
                </template>
            </Card>

            <!-- Action Plan -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-list text-green-600"></i>
                        <span>Action Plan Tindak Lanjut</span>
                    </div>
                </template>
                <template #content>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            Action Plan <span class="text-red-500">*</span>
                        </label>
                        <Textarea
                            v-model="quickApprovalData.actionPlan"
                            placeholder="Masukkan action plan tindak lanjut..."
                            class="w-full"
                            rows="4"
                            :disabled="isSubmittingApproval"
                        />
                    </div>
                </template>
            </Card>

            <!-- Progress and Status -->
            <Card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <i class="pi pi-chart-line text-green-600"></i>
                        <span>Progress dan Status</span>
                    </div>
                </template>
                <template #content>
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Progress (%)
                            </label>
                            <InputNumber 
                                v-model="quickApprovalData.progress"
                                :min="0"
                                :max="100"
                                suffix="%"
                                class="w-full"
                                :disabled="isSubmittingApproval"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Status Tindak Lanjut
                            </label>
                            <Dropdown 
                                v-model="quickApprovalData.statusTindakLanjut"
                                :options="statusTindakLanjutOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih status"
                                class="w-full"
                                :disabled="isSubmittingApproval"
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
                        <span>Upload Materi Tindak Lanjut</span>
                    </div>
                </template>
                <template #content>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            Upload File
                        </label>
                        <FileUpload
                            mode="basic"
                            name="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                            :maxFileSize="10000000"
                            :disabled="isSubmittingApproval"
                            @upload="onFileUpload"
                            class="w-full"
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
                    @click="showQuickApprovalDialog = false"
                    :disabled="isSubmittingApproval"
                />
                <Button
                    label="Simpan Approval"
                    icon="pi pi-save"
                    severity="success"
                    @click="submitQuickApproval"
                    :loading="isSubmittingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Quick Reject Dialog -->
    <Dialog 
        v-model:visible="showQuickRejectDialog" 
        modal 
        header="Penolakan Tindak Lanjut Rapat" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
        :closable="!isSubmittingApproval"
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
                                Agenda Rapat <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                v-model="quickRejectData.agenda"
                                disabled
                                class="w-full"
                            />
                        </div>
                        
                        <div class="col-span-12 lg:col-span-6">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                PIC <span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                :value="authStore.name"
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
                            :disabled="isSubmittingApproval"
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
                    :disabled="isSubmittingApproval"
                />
                <Button
                    label="Simpan Penolakan"
                    icon="pi pi-save"
                    severity="danger"
                    @click="submitQuickReject"
                    :loading="isSubmittingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Global Components -->
    <Toast />
    
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

.grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
}

.grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
}

.col-span-2 {
    grid-column: span 2 / span 2;
}

.col-span-4 {
    grid-column: span 4 / span 4;
}

.col-span-8 {
    grid-column: span 8 / span 8;
}

.col-span-10 {
    grid-column: span 10 / span 10;
}

.col-span-12 {
    grid-column: span 12 / span 12;
}

@media (min-width: 768px) {
    .md\\:grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1024px) {
    .lg\\:col-span-6 {
        grid-column: span 6 / span 6;
    }
    
    .lg\\:grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
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
:deep(.p-inputnumber:disabled),
:deep(.p-textarea:disabled) {
    opacity: 1;
    background-color: #f3f4f6;
    color: #374151;
}
</style>

