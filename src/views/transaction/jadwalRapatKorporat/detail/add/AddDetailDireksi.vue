<script setup>
import RoleService from '@/service/RoleService';
import FileApiService from '@/service/FileApiService';
import DetailRapatKomisDireksidankomiteService from '../service/DetailRapatKomisDireksidankomite';
import ArahanPIC from '../service/ArahanPIC';
import ImagePreview from '@/views/component/ImagePreview.vue';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { object, string } from 'yup';
import { useAuth } from '@/stores/authStore';

// PrimeVue Components
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import Divider from 'primevue/divider';
import ConfirmDialog from 'primevue/confirmdialog';

const isLoadingSave = ref(false);
const isLoadingApprove = ref(false);
const isLoadingReject = ref(false);
const formUmumRef = ref();
const confirmSave = useConfirm();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuth();
const activeTab = ref(0);
const isApproved = ref(false);
const approvalReason = ref('');
const rejectionReason = ref('');
const showApprovalModalKajian = ref(false);
const showRejectionModalKajian = ref(false);
const showApprovalModalPIC = ref(false);
const showRejectionModalPIC = ref(false);

const Role1 = computed(() => {
    return authStore.role === '1';
});

const Role2 = computed(() => {
    return authStore.role === '2';
});

// Computed property to check if approve/reject buttons should be shown
const shouldShowApprovalButtons = computed(() => {
    // Tidak tampil jika bukan mode approval
    if (queryParams.value.mode !== 'approval') {
        return false;
    }

    const userRole = authStore.role;
    
    // Role 1: Sekper - hide jika approveSekper = 1
    if (userRole === '1' && (queryParams.value.approveSekper === '1' || queryParams.value.approveSekper === 1)) {
        return false;
    }
    
    // Role 2: Sekper - hide jika approveSekper = 1
    if (userRole === '2' && (queryParams.value.approveSekper === '1' || queryParams.value.approveSekper === 1)) {
        return false;
    }
    
    // Role 3: Legal - hide jika approveLegal = 1
    if (userRole === '3' && (queryParams.value.approveLegal === '1' || queryParams.value.approveLegal === 1)) {
        return false;
    }
    
    // Role 4: Risiko - hide jika approveRisiko = 1
    if (userRole === '4' && (queryParams.value.approveRisiko === '1' || queryParams.value.approveRisiko === 1)) {
        return false;
    }
    
    // Role 5: Kepatuhan - hide jika approveKepatuhan = 1
    if (userRole === '5' && (queryParams.value.approveKepatuhan === '1' || queryParams.value.approveKepatuhan === 1)) {
        return false;
    }
    
    // Tampilkan tombol jika role sesuai dan belum approve
    return (userRole === '1' || userRole === '2' || userRole === '3' || userRole === '4' || userRole === '5');
});

// Tab configuration
const tabs = computed(() => {
    const availableTabs = [
        { label: 'Add', value: 'add', icon: 'pi pi-plus' },
        { label: 'Approve', value: 'approve', icon: 'pi pi-check' },
        { label: 'Upload', value: 'upload', icon: 'pi pi-upload' },
        { label: 'PIC', value: 'pic', icon: 'pi pi-user' }
    ];
    
    // Filter tabs based on user role, mode, and flagapprove
    return availableTabs.filter(tab => {
        switch (tab.value) {
            case 'add':
                // Tab Add hanya bisa dilihat oleh role 1 dan mode add
                return Role1.value && queryParams.value.mode === 'add';
            
            case 'approve':
                // Tab Approve hanya bisa dilihat oleh mode approval
                return queryParams.value.mode === 'approval';
            
            case 'upload':
                // Tab Upload hanya bisa dilihat oleh flagapprove done, mode upload, dan role 1
                return queryParams.value.flagapprove === 'done' && 
                       queryParams.value.mode === 'upload' && 
                       Role1.value;
            
            case 'pic':
                // Tab PIC hanya bisa dilihat oleh mode PIC dan role 2
                return queryParams.value.mode === 'pic' && Role2.value;
            
            default:
                return false;
        }
    });
});

const currentMode = computed(() => {
    return tabs.value[activeTab.value]?.value || 'add';
});


const queryParams = ref({
    id: '',
    judulRapat: '',
    tanggal: '',
    durasi: '',
    lokasi: '',
    modelRapat: '',
    peserta: '',
    agenda: '',
    jenisRapat: '',
    jenisRapatId: '',
    status: '',
    mode: '',
    flagapprove: '',
    statusDecision: ''
});


const fileTypeOptions = computed(() => {
    // For upload mode, only show Form Review Governance option
    if (currentMode.value === 'upload') {
        return [{ name: 'FORM_REVIEW_GOVERNENCE', value: 'FORM_REVIEW_GOVERNENCE' }];
    }
    
    const baseOptions = [
        { name: 'KKO', value: 'KKO' },
        { name: 'KKF', value: 'KKF' },
        { name: 'KR', value: 'KR' },
        { name: 'CTR', value: 'CTR' },
        { name: 'PAKTA_INTEGRITAS', value: 'PAKTA_INTEGRITAS' },
    ];
    
    // Add Form Review Governance when flagapprove is 'done'
    if (queryParams.value.flagapprove === 'done') {
        baseOptions.push({ name: 'FORM_REVIEW_GOVERNENCE', value: 'FORM_REVIEW_GOVERNENCE' });
    }
    
    return baseOptions;
});


const selectedFileType = ref('');
const uploadedFiles = ref([]);
const isUploading = ref({});
const uploadedFileUrls = ref({});
const showImagePreview = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');
const fileExists = ref({}); // Track if file already exists on server
const fileUploadMode = ref({}); // Track upload mode: 'upload' or 'update'

// PIC Form State
const lampiranRapat = ref(null);
const arahanRapat = ref('');
const selectedPIC = ref('');
const targetWaktu = ref('');
const picOptions = ref([]);
const isLoadingPIC = ref(false);

// State untuk melacak upload status lampiran rapat
const isLampiranRapatUploaded = ref(false);

// State untuk loading dan data dari Swagger API
const isLoadingSwaggerData = ref(false);
const swaggerData = ref(null);

// State untuk arahan rapat list dari API
const arahanRapatList = ref([]);
const isLoadingArahanRapatList = ref(false);

const resolver = computed(() => {
    const baseSchema = {
        judulKepdir: string().required('Judul Kepdir Sirkuler harus diisi'),
        tanggalTerbit: string().required('Tanggal Terbit Kepdir Sirkuler harus diisi')
    };

    // Add PIC form validation when in PIC mode and approved
    if (currentMode.value === 'pic' && isApproved.value) {
        baseSchema.lampiranRapat = object().nullable().test('file-required', 'Lampiran rapat harus diisi', function(value) {
            return lampiranRapat.value !== null;
        });
        baseSchema.arahanRapat = string().required('Arahan rapat harus diisi');
        baseSchema.selectedPIC = string().required('PIC harus dipilih');
        baseSchema.targetWaktu = string().required('Target waktu harus diisi');
    } else {
        baseSchema.lampiranRapat = object().nullable();
        baseSchema.arahanRapat = string();
        baseSchema.selectedPIC = string();
        baseSchema.targetWaktu = string();
    }

    return yupResolver(object().shape(baseSchema));
});


const addFileType = () => {
    if (selectedFileType.value && !uploadedFiles.value.find(file => file.type === selectedFileType.value)) {
        const fileType = fileTypeOptions.value.find(option => option.value === selectedFileType.value);
        uploadedFiles.value.push({
            type: selectedFileType.value,
            name: fileType.name,
            file: null,
            placeholder: getPlaceholder(selectedFileType.value)
        });
        selectedFileType.value = '';
    }
};

const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1);
};

const onFileSelect = (event, index) => {
    const file = event.files[0];
    if (file) {
        uploadedFiles.value[index].file = file;
        const fileType = uploadedFiles.value[index].type;
        
        // When a file is selected, switch to upload mode
        fileUploadMode.value[fileType] = 'upload';
    }
};

// Function to check if file exists on server
const checkFileExists = async (fileType) => {
    try {
        const jadwalRapatId = queryParams.value.id;
        if (!jadwalRapatId) return false;

        // Try to view the file to check if it exists
        await FileApiService.viewFile({
            jadwalRapatId: jadwalRapatId,
            uploadFileType: fileType
        });
        
        return true;
    } catch (error) {
        return false;
    }
};

// Individual upload/update function for each file type
const uploadIndividualFile = async (fileType, index) => {
    const file = uploadedFiles.value[index].file;
    if (!file) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Pilih file terlebih dahulu',
            life: 3000
        });
        return;
    }

    // Set loading state for this specific file
    isUploading.value[fileType] = true;

    try {
        const uploadParams = {
            jadwalRapatId: queryParams.value.id || 'hardcoded-uuid-123',
            uploadFileType: fileType,
            file: file
        };
        
        // Call appropriate API method based on file type and whether file exists
        let response;
        const isUpdate = fileExists.value[fileType];
        
        // Special handling for FORM_REVIEW_GOVERNENCE - use dedicated uploadReviewGovernence endpoint
        if (fileType === 'FORM_REVIEW_GOVERNENCE') {
            response = await FileApiService.uploadReviewGovernence(uploadParams);
        } else {
            // Standard handling for other file types
            if (isUpdate) {
                // Use PATCH for updating existing file - try dedicated updateKajianRapat endpoint first
                try {
                    response = await FileApiService.updateKajianRapat(uploadParams);
                } catch (updateError) {
                    // Fallback to uploadFileKorporat with PATCH method
                    response = await FileApiService.updateFileKorporat(uploadParams);
                }
            } else {
                // Use POST for new file upload
                response = await FileApiService.uploadMateriRapat(uploadParams);
            }
        }
        
        // Check for success response - handle different possible response structures
        const isSuccess = response.status === 200 || response.status === 201;
        const responseData = response.data;
        const responseCode = responseData?.code || responseData?.status;
        
        if (isSuccess && (responseCode === 200 || responseCode === 201 || !responseCode)) {
            const action = isUpdate ? 'diupdate' : 'diupload';
            const message = responseData?.message || responseData?.data?.message || `${action} berhasil`;
            
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `File ${uploadedFiles.value[index].name} berhasil ${action}`,
                life: 3000
            });
            
            // Store uploaded file URL for preview and mark as existing
            // Handle different possible response structures
            const fileUrl = responseData?.data?.fileUrl || 
                           responseData?.data?.url || 
                           responseData?.fileUrl || 
                           responseData?.url || 
                           'file-uploaded';
                           
            uploadedFileUrls.value[fileType] = fileUrl;
            fileExists.value[fileType] = true;
            fileUploadMode.value[fileType] = 'update'; // Switch to update mode for future uploads
        } else {
            const errorMessage = responseData?.message || 
                               responseData?.error || 
                               responseData?.data?.message || 
                               `Upload/Update gagal (Status: ${response.status})`;
            throw new Error(errorMessage);
        }
    } catch (error) {
        const action = fileExists.value[fileType] ? 'mengupdate' : 'mengupload';
        let errorMessage = error.message;
        
        // Extract more specific error message from API response
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
            errorMessage = error.response.data.error;
        } else if (error.response?.statusText) {
            errorMessage = `${error.response.statusText} (${error.response.status})`;
        }
        
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Gagal ${action} file ${uploadedFiles.value[index].name}: ${errorMessage}`,
            life: 5000 // Show error longer for debugging
        });
    } finally {
        isUploading.value[fileType] = false;
    }
};

// Preview uploaded file using viewFile API
const previewFile = async (fileType) => {
    try {
        const jadwalRapatId = queryParams.value.id;
        
        if (!jadwalRapatId) {
            toast.add({
                severity: 'error',
                summary: 'Kesalahan',
                detail: 'ID jadwal rapat tidak ditemukan',
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

        // Call viewFile API
        const response = await FileApiService.viewFile({
            jadwalRapatId: jadwalRapatId,
            uploadFileType: fileType
        });

        // Create blob URL from response with proper MIME type
        const originalBlob = response.data;
        
        // For MATERI_RAPAT and other document types, assume PDF if no proper MIME type is set
        let mimeType = originalBlob.type;
        if (!mimeType || mimeType === 'application/octet-stream' || mimeType === fileType) {
            // Check file type and default to PDF for document types
            if (fileType.includes('MATERI_RAPAT') || fileType.includes('KKO') || fileType.includes('KKF') || 
                fileType.includes('KR') || fileType.includes('FRA') || fileType.includes('CTR') || 
                fileType.includes('PAKTA_INTEGRITAS') || fileType.includes('FORM_REVIEW')) {
                mimeType = 'application/pdf';
            }
        }
        
        // Create a new blob with the correct MIME type
        const blob = new Blob([originalBlob], { type: mimeType });
        const fileUrl = URL.createObjectURL(blob);
        
        previewUrl.value = fileUrl;
        previewFileName.value = uploadedFiles.value.find(f => f.type === fileType)?.name || `${fileType}_file`;
        showImagePreview.value = true;

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'File berhasil dimuat',
            life: 2000
        });

    } catch (error) {
        // Fallback to existing uploaded file URL if API fails
        const fileUrl = uploadedFileUrls.value[fileType];
        if (fileUrl) {
            previewUrl.value = fileUrl;
            previewFileName.value = uploadedFiles.value.find(f => f.type === fileType)?.name || 'File';
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
                detail: 'Tidak dapat memuat file. Pastikan file sudah diupload.',
                life: 3000
            });
        }
    }
};

const onLampiranRapatSelect = (event) => {
    const file = event.files[0];
    if (file) {
        lampiranRapat.value = file;
    }
};

const getPlaceholder = (type) => {
    const placeholders = {
        'KKO': 'KKO',
        'KKF': 'KKF',
        'KR': 'KR',
        'CTR': 'CTR',
        'PAKTA_INTEGRITAS': 'PAKTA_INTEGRITAS',
        'FORM_REVIEW_GOVERNENCE': 'FORM_REVIEW_GOVERNENCE'
    };
    return placeholders[type] || 'File';
};


const viewDocument = (file, index) => {
    if (file.file) {
        
        const fileUrl = URL.createObjectURL(file.file);
        window.open(fileUrl, '_blank');
        
        
        setTimeout(() => {
            URL.revokeObjectURL(fileUrl);
        }, 1000);
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'File tidak tersedia untuk dilihat',
            life: 3000
        });
    }
};


const parseQueryParams = () => {
    
    queryParams.value = {
        id: route.query.id || '',
        judulRapat: route.query.judulRapat || '',
        tanggal: route.query.tanggal || '',
        durasi: route.query.durasi || '',
        modelRapat: route.query.modelRapat || '',
        peserta: route.query.peserta || '',
        agenda: route.query.agenda || '',
        jenisRapat: route.query.jenisRapat || '',
        jenisRapatId: route.query.JenisRapatId || route.query.jenisRapatId || '',
        status: route.query.status || '',
        mode: route.query.mode || '',
        flagapprove: route.query.flagapprove || '',
        statusDecision: route.query.status || '',
        approveSekper: route.query.approveSekper,
        approveTl: route.query.approveTl,
        approveLegal: route.query.approveLegal,
        approveRisiko: route.query.approveRisiko,
        approveKepatuhan: route.query.approveKepatuhan
    };
    
    if (queryParams.value.tanggal && queryParams.value.tanggal.includes(' ')) {
        queryParams.value.tanggal = queryParams.value.tanggal.split(' ')[0];
    }
    
};

// Computed property untuk validasi tombol choose dan update di mode add
const isFileUploadDisabled = computed(() => {
    // Hanya berlaku di mode add
    if (queryParams.value.mode !== 'add') {
        return false;
    }
    
    const approvals = [
        queryParams.value.approveSekper,
        queryParams.value.approveTl,
        queryParams.value.approveLegal,
        queryParams.value.approveRisiko,
        queryParams.value.approveKepatuhan
    ];
    
    // Cek apakah ada nilai 1 (sedang dalam proses approval)
    const hasProcessing = approvals.some(val => val === '1' || val === 1);
    
    // Cek apakah ada nilai 2 (sudah approved)
    const hasApproved = approvals.some(val => val === '2' || val === 2);
    
    return hasProcessing && !hasApproved;
});

const onClickBack = () => {
    console.log('onClickBack');
    console.log('queryParams.value.id = ', queryParams.value.id);
    console.log('queryParams.value.jenisRapat = ', queryParams.value.jenisRapat);
    console.log('queryParams.value.jenisRapatId = ', queryParams.value.jenisRapatId);
    
    // Validasi parameter yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    if (!queryParams.value.jenisRapatId) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jenis rapat tidak ditemukan',
            life: 3000
        });
        return;
    }
    
    // Build query parameters for navigation
    const navigationQuery = {
        Id: queryParams.value.id,
        Agenda: queryParams.value.agenda,
        JenisRapat: queryParams.value.jenisRapat,
        jenisRapatParam: queryParams.value.jenisRapatId,
        TanggalRapat: queryParams.value.tanggal
    };

    console.log('navigationQuery = ', navigationQuery);
    
    // Navigate back to detail page
    router.push({
        path: `/transaction/jadwal-rapat-korporat/detail/${queryParams.value.jenisRapatId}/${queryParams.value.id}`,
        query: navigationQuery
    });
};

const onClickSubmit = () => {
    formUmumRef.value.onSubmit();
};

//============================================== Untuk handle PIC Rapat (Approve Tab) ==============================================

const onClickApprovePIC = () => {
    showApprovalModalPIC.value = true;
};


const onClickRejectPIC = () => {
    showRejectionModalPIC.value = true;
};


const confirmApprovePIC = async () => {
    if (!approvalReason.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Alasan approval harus diisi',
            life: 3000
        });
        return;
    }
    
    showApprovalModalPIC.value = false;
    await approveDataPIC();
};

const confirmRejectPIC = async () => {
    if (!rejectionReason.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Alasan penolakan harus diisi',
            life: 3000
        });
        return;
    }
    
    showRejectionModalPIC.value = false;
    await rejectDataPIC();
};

const cancelApprovalPIC = () => {
    showApprovalModalPIC.value = false;
    approvalReason.value = '';
};

const cancelRejectionPIC = () => {
    showRejectionModalPIC.value = false;
    rejectionReason.value = '';
};

const approveDataPIC = async () => {
    // Validasi data yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    const payload = {
        jadwalRapatId: queryParams.value.id,
        // roleId: parseInt(authStore.role),
        statusCekLampiran: 1,
        alasan: ''
    };

    isLoadingApprove.value = true;
    await DetailRapatKomisDireksidankomiteService.approvalAttachmentSekper(payload)
        .then((response) => {
            if (response.status === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Kajian rapat berhasil disetujui',
                    life: 3000
                });
                
                // Set approval status and reload data
                isApproved.value = true;
                window.location.reload();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: 'Gagal menyetujui attachment sekper',
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyetujui kajian rapat',
                life: 3000
            });
        })
        .finally(() => {
            isLoadingApprove.value = false;
        });
};

const rejectDataPIC = async () => {
    // Validasi data yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    const payload = {
        jadwalRapatId: queryParams.value.id,
        // roleId: parseInt(authStore.role),
        statusCekLampiran: 2, // 2 for reject
        alasan: rejectionReason.value || ''
    };

    isLoadingReject.value = true;
    await DetailRapatKomisDireksidankomiteService.approvalAttachmentSekper(payload) 
        .then((response) => {
            if (response.status === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Kajian rapat berhasil ditolak',
                    life: 3000
                });
                
                window.location.reload();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: 'Gagal menolak attachment sekper',
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.response?.data?.message || e.message || 'Terjadi kesalahan saat menolak kajian rapat',
                life: 3000
            });
        })
        .finally(() => {
            isLoadingReject.value = false;
        });
};

//===================================================================================================================================

// Handler untuk tombol Save pada Lampiran Rapat (dengan nama yang sesuai dengan template)
const onClickSubmitPicDoc = async () => {
    // Validasi file lampiran rapat
    if (!lampiranRapat.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Pilih file lampiran rapat terlebih dahulu',
            life: 3000
        });
        return;
    }

    // Validasi jadwal rapat ID
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    // Set loading state
    isLoadingSave.value = true;

    try {
        const uploadParams = {
            jadwalRapatId: queryParams.value.id,
            uploadFileType: 'LAMPIRAN_RAPAT',
            file: lampiranRapat.value
        };

        let response;
        const isUpdate = isLampiranRapatUploaded.value;

        if (isUpdate) {
            // File sudah ada, gunakan PATCH untuk update
            response = await FileApiService.updateUploadFile(uploadParams);
        } else {
            // File belum ada, gunakan POST untuk upload baru
            response = await FileApiService.uploadMateriRapat(uploadParams);
        }

        // Check for success response
        if (response.status === 200 || response.data?.code === 200) {
            const action = isUpdate ? 'diupdate' : 'diupload';
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `Lampiran rapat berhasil ${action}`,
                life: 3000
            });

            // Update state to show that file has been uploaded/updated
            isLampiranRapatUploaded.value = true;

            // Reset the file input after successful upload/update
            lampiranRapat.value = null;
        } else {
            throw new Error(response.data?.message || response.message || `${isUpdate ? 'Update' : 'Upload'} gagal`);
        }
    } catch (error) {
        const action = isLampiranRapatUploaded.value ? 'mengupdate' : 'mengupload';
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Gagal ${action} lampiran rapat: ${error.message}`,
            life: 3000
        });
    } finally {
        isLoadingSave.value = false;
    }
};

const viewLampiranRapat = async () => {
    try {
        const jadwalRapatId = queryParams.value.id;
        
        if (!jadwalRapatId) {
            toast.add({
                severity: 'error',
                summary: 'Kesalahan',
                detail: 'ID jadwal rapat tidak ditemukan',
                life: 3000
            });
            return;
        }

        // Show loading state
        toast.add({
            severity: 'info',
            summary: 'Loading',
            detail: 'Memuat dokumen lampiran rapat...',
            life: 2000
        });

        // Call viewFile API for LAMPIRAN_RAPAT
        const response = await FileApiService.viewFile({
            jadwalRapatId: jadwalRapatId,
            uploadFileType: 'LAMPIRAN_RAPAT'
        });

        // Create blob URL from response with proper MIME type
        const originalBlob = response.data;
        
        // For LAMPIRAN_RAPAT, assume PDF if no proper MIME type is set
        let mimeType = originalBlob.type;
        if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'LAMPIRAN_RAPAT') {
            mimeType = 'application/pdf';
        }
        
        // Create a new blob with the correct MIME type
        const blob = new Blob([originalBlob], { type: mimeType });
        const fileUrl = URL.createObjectURL(blob);
        
        previewUrl.value = fileUrl;
        previewFileName.value = 'Lampiran Rapat';
        showImagePreview.value = true;

        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Dokumen lampiran rapat berhasil dimuat',
            life: 2000
        });

    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'Tidak dapat memuat dokumen lampiran rapat',
            life: 3000
        });
    }
};

const onSubmitEvent = (data) => {
    if (data.valid) {
        confirmSave.require({
            group: 'crud-group',
            message: 'Apakah anda yakin untuk menyimpan data?',
            closeable: false,
            header: 'Konfirmasi',
            acceptLabel: 'Ya',
            rejectLabel: 'Tidak',
            acceptClass: 'order-2',
            rejectClass: 'order-1',
            rejectProps: {
                severity: 'danger'
            },
            acceptProps: {
                severity: 'success'
            },
            accept: () => {
                saveInputToService(data.values);
            }
        });
    }
};

const saveInputToService = async (data) => {
    const payload = {
        id: queryParams.value.id || null,
        judulKepdir: data.judulKepdir,
        tanggalTerbit: data.tanggalTerbit,
        // Include all query parameters
        judulRapat: queryParams.value.judulRapat,
        tanggal: queryParams.value.tanggal,
        durasi: queryParams.value.durasi,
        modelRapat: queryParams.value.modelRapat,
        peserta: queryParams.value.peserta,
        agenda: queryParams.value.agenda,
        status: queryParams.value.status,
        mode: currentMode.value,
        files: uploadedFiles.value.map(file => ({
            type: file.type,
            name: file.name,
            file: file.file
        })),
        // PIC form data
        lampiranRapat: lampiranRapat.value,
        arahanRapat: arahanRapat.value,
        selectedPIC: selectedPIC.value,
        targetWaktu: targetWaktu.value
    };

    isLoadingSave.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Pesan',
                    detail: response.data.message,
                    life: 3000
                });
                router.push('/transaction/jadwal-rapat-korporat');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
};



const approveData = async () => {
    // Validasi data yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    if (!authStore.role) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'Role user tidak ditemukan',
            life: 3000
        });
        return;
    }

    const payload = {
        jadwalRapatId: queryParams.value.id,
        roleId: parseInt(authStore.role),
        statusApproval: 1, // 1 for approve
        alasan: approvalReason.value || ''
    };

    isLoadingApprove.value = true;
    await DetailRapatKomisDireksidankomiteService.approvalKajianRapat(payload)
        .then((response) => {
            if (response.status === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Kajian rapat berhasil disetujui',
                    life: 3000
                });
                router.push('/transaction/jadwal-rapat-korporat');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: 'Gagal menyetujui kajian rapat',
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyetujui kajian rapat',
                life: 3000
            });
        })
        .finally(() => {
            isLoadingApprove.value = false;
        });
};

// const rejectDataPIC = async () => {
//     // Validasi data yang diperlukan
//     if (!queryParams.value.id) {
//         toast.add({
//             severity: 'error',
//             summary: 'Kesalahan',
//             detail: 'ID jadwal rapat tidak ditemukan',
//             life: 3000
//         });
//         return;
//     }

//     if (!authStore.role) {
//         toast.add({
//             severity: 'error',
//             summary: 'Kesalahan',
//             detail: 'Role user tidak ditemukan',
//             life: 3000
//         });
//         return;
//     }

//     const payload = {
//         jadwalRapatId: queryParams.value.id,
//         roleId: parseInt(authStore.role),
//         statusApproval: 2, // 2 for reject
//         alasan: rejectionReason.value || ''
//     };

//     isLoadingReject.value = true;
//     await DetailRapatKomisDireksidankomiteService.approvalKajianRapat(payload)
//         .then((response) => {
//             if (response.status === 200) {
//                 toast.add({
//                     severity: 'success',
//                     summary: 'Berhasil',
//                     detail: 'Kajian rapat berhasil ditolak',
//                     life: 3000
//                 });
//                 router.push('/transaction/jadwal-rapat-korporat');
//             } else {
//                 toast.add({
//                     severity: 'error',
//                     summary: 'Gagal',
//                     detail: 'Gagal menolak kajian rapat',
//                     life: 3000
//                 });
//             }
//         })
//         .catch((e) => {
//             toast.add({
//                 severity: 'error',
//                 summary: 'Gagal',
//                 detail: e.response?.data?.message || e.message || 'Terjadi kesalahan saat menolak kajian rapat',
//                 life: 3000
//             });
//         })
//         .finally(() => {
//             isLoadingReject.value = false;
//         });
// };

//============================================== Untuk handle Kajian Rapat (Approve Tab) ==============================================
const onClickApproveKajian = () => {
    showApprovalModalKajian.value = true;
};


const onClickRejectKajian = () => {
    showRejectionModalKajian.value = true;
};


const confirmApproveKajian = async () => {
    if (!approvalReason.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Alasan approval harus diisi',
            life: 3000
        });
        return;
    }
    
    showApprovalModalKajian.value = false;
    await approveDataKajian();
};

const confirmRejectKajian = async () => {
    if (!rejectionReason.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Alasan penolakan harus diisi',
            life: 3000
        });
        return;
    }
    
    showRejectionModalKajian.value = false;
    await rejectDataKajian();
};

const cancelApprovalKajian = () => {
    showApprovalModalKajian.value = false;
    approvalReason.value = '';
};

const cancelRejectionKajian = () => {
    showRejectionModalKajian.value = false;
    rejectionReason.value = '';
};

const approveDataKajian = async () => {
    // Validasi data yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    const payload = {
        jadwalRapatId: queryParams.value.id,
        roleId: parseInt(authStore.role),
        statusApproval: 1, // 1 for approve
        alasan: approvalReason.value || ''
    };

    isLoadingApprove.value = true;
    await DetailRapatKomisDireksidankomiteService.approvalKajianRapat(payload)
        .then((response) => {
            if (response.status === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Kajian rapat berhasil disetujui',
                    life: 3000
                });
                
                // Set approval status and reload data
                isApproved.value = true;
                router.push('/transaction/jadwal-rapat-korporat/detail/5/?id=' + queryParams.value.id);
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: 'Gagal menyetujui attachment sekper',
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.response?.data?.message || e.message || 'Terjadi kesalahan saat menyetujui kajian rapat',
                life: 3000
            });
        })
        .finally(() => {
            isLoadingApprove.value = false;
        });
};

const rejectDataKajian = async () => {
    // Validasi data yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    const payload = {
        jadwalRapatId: queryParams.value.id,
        roleId: parseInt(authStore.role),
        statusApproval: 2, // 2 for reject
        alasan: rejectionReason.value || ''
    };

    isLoadingReject.value = true;
    await DetailRapatKomisDireksidankomiteService.approvalKajianRapat(payload)
        .then((response) => {
            if (response.status === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Kajian rapat berhasil ditolak',
                    life: 3000
                });
                
                // Reload data to show updated status
                router.push('/transaction/jadwal-rapat-korporat');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: 'Gagal menolak attachment sekper',
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.response?.data?.message || e.message || 'Terjadi kesalahan saat menolak kajian rapat',
                life: 3000
            });
        })
        .finally(() => {
            isLoadingReject.value = false;
        });
};

//========================================================================================================================================

// Initialize files based on current mode and check for existing files
const initializeFiles = async () => {
    let filesToInitialize = [];
    
    if (currentMode.value === 'upload') {
        // For upload mode, only show Form Review Governance
        filesToInitialize = [
            { 
                type: 'FORM_REVIEW_GOVERNENCE', 
                name: 'FORM_REVIEW_GOVERNENCE', 
                file: null, 
                placeholder: 'FORM_REVIEW_GOVERNENCE' 
            }
        ];
    } else if (currentMode.value === 'pic') {
        // For PIC mode, check statusDecision
        if (queryParams.value.statusDecision === '1') {
            // If statusDecision is 1, only show FORM_REVIEW_GOVERNENCE
            filesToInitialize = [
                { type: 'FORM_REVIEW_GOVERNENCE', name: 'FORM_REVIEW_GOVERNENCE', file: null, placeholder: 'FORM_REVIEW_GOVERNENCE' }
            ];
        } else if (queryParams.value.statusDecision === '2') {
            // If statusDecision is 2, show both FORM_REVIEW_GOVERNENCE and MATERI_RAPAT
            filesToInitialize = [
                // { type: 'FORM_REVIEW_GOVERNENCE', name: 'FORM_REVIEW_GOVERNENCE', file: null, placeholder: 'FORM_REVIEW_GOVERNENCE' },
                { type: 'MATERI_RAPAT', name: 'MATERI_RAPAT', file: null, placeholder: 'MATERI_RAPAT' }
            ];
        } else {
            // Default: show both documents
            filesToInitialize = [
                { type: 'MATERI_RAPAT', name: 'MATERI_RAPAT', file: null, placeholder: 'MATERI_RAPAT' },
                { type: 'FORM_REVIEW_GOVERNENCE', name: 'FORM_REVIEW_GOVERNENCE', file: null, placeholder: 'FORM_REVIEW_GOVERNENCE' }
            ];
        }
    } else if (currentMode.value === 'approve') {
        // For approval mode, check statusDecision
        if (queryParams.value.statusDecision === '2') {
            // If statusDecision is 2, only show MATERI_RAPAT
            filesToInitialize = [
                { type: 'MATERI_RAPAT', name: 'MATERI_RAPAT', file: null, placeholder: 'MATERI_RAPAT' }
            ];
        } else {
            // Otherwise, show all available documents for review
            filesToInitialize = [
                { type: 'KKO', name: 'KKO', file: null, placeholder: 'KKO' },
                { type: 'KKF', name: 'KKF', file: null, placeholder: 'KKF' },
                { type: 'KR', name: 'KR', file: null, placeholder: 'KR' },
                { type: 'FRA', name: 'FRA', file: null, placeholder: 'FRA' },
                { type: 'CTR', name: 'CTR', file: null, placeholder: 'CTR' },
                { type: 'PAKTA_INTEGRITAS', name: 'PAKTA_INTEGRITAS', file: null, placeholder: 'PAKTA_INTEGRITAS' },
                { type: 'MATERI_RAPAT', name: 'MATERI_RAPAT', file: null, placeholder: 'MATERI_RAPAT' }
            ];
        }
    } else {
        // Initialize base files for other modes (add mode)
        filesToInitialize = [
            { type: 'KKO', name: 'KKO', file: null, placeholder: 'KKO' },
            { type: 'KKF', name: 'KKF', file: null, placeholder: 'KKF' },
            { type: 'KR', name: 'KR', file: null, placeholder: 'KR' },
            { type: 'CTR', name: 'CTR', file: null, placeholder: 'CTR' },
            { type: 'PAKTA_INTEGRITAS', name: 'PAKTA_INTEGRITAS', file: null, placeholder: 'PAKTA_INTEGRITAS' }
        ];
        
        // Add Form Review Governance when flagapprove is 'done'
        if (queryParams.value.flagapprove === 'done') {
            filesToInitialize.push({ 
                type: 'FORM_REVIEW_GOVERNENCE', 
                name: 'FORM_REVIEW_GOVERNENCE', 
                file: null, 
                placeholder: 'FORM_REVIEW_GOVERNENCE' 
            });
        }
    }

    // Set the files
    uploadedFiles.value = filesToInitialize;

    // Check which files already exist on the server
    if (queryParams.value.id) {
        for (const file of filesToInitialize) {
            try {
                const exists = await checkFileExists(file.type);
                fileExists.value[file.type] = exists;
                fileUploadMode.value[file.type] = exists ? 'update' : 'upload';
            } catch (error) {
                fileExists.value[file.type] = false;
                fileUploadMode.value[file.type] = 'upload';
            }
        }

        // Check if LAMPIRAN_RAPAT file already exists on server
        try {
            const lampiranExists = await checkFileExists('LAMPIRAN_RAPAT');
            isLampiranRapatUploaded.value = lampiranExists;
        } catch (error) {
            isLampiranRapatUploaded.value = false;
        }
    }
};

onBeforeMount(async () => {
    // Parse query params first to get flagapprove value
    parseQueryParams();
    
    // Initialize files based on current mode
    await initializeFiles();
    
    // Load Swagger data if already in PIC mode
    if (currentMode.value === 'pic') {
        await loadArahanRapatList();
        await loadSwaggerData();
        await loadPICData();
    }
    
    // Always load arahan rapat list regardless of mode
    await loadArahanRapatList();
});

// Function to load PIC data from API
const loadPICData = async () => {
    isLoadingPIC.value = true;
    try {
        const response = await DetailRapatKomisDireksidankomiteService.getListPic();
        if (response.data && response.data.success && response.data.data) {
            // Transform API response to match Select component format
            picOptions.value = response.data.data.map(item => ({
                name: item.value,
                value: item.id
            }));
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data PIC',
            life: 3000
        });
    } finally {
        isLoadingPIC.value = false;
    }
};

// Function to load Swagger API data when entering PIC mode
const loadSwaggerData = async () => {
    if (currentMode.value !== 'pic' || !queryParams.value.id) {
        return;
    }

    isLoadingSwaggerData.value = true;
    
    try {
        const response = await DetailRapatKomisDireksidankomiteService.getJadwalRapatDetail(queryParams.value.id);
        
        if (response.data && response.data.code === 200) {
            swaggerData.value = response.data.data;
            

            console.log('swaggerData =', swaggerData.value);
            // Update form fields with loaded data
            if (swaggerData.value.agenda) {
                queryParams.value.agenda = swaggerData.value.agenda;
            }
            if (swaggerData.value.tanggalRapat) {
                // Convert tanggalRapat to proper format if needed
                const dateValue = new Date(swaggerData.value.tanggalRapat);
                queryParams.value.tanggal = dateValue;
            }
            
            // Load existing PIC and Arahan Rapat data if available
            if (swaggerData.value.arahan) {
                arahanRapat.value = swaggerData.value.arahan;
            }
            if (swaggerData.value.targetWaktu) {
                // Convert targetWaktu to Date object for Calendar component
                targetWaktu.value = new Date(swaggerData.value.targetWaktu);
            }
            if (swaggerData.value.picId && swaggerData.value.picId.length > 0) {
                selectedPIC.value = swaggerData.value.picId[0];
            }
            
            // Set approval status based on statusCekLampiran
            if (swaggerData.value.statusCekLampiran === 1 || swaggerData.value.statusCekLampiran === 2) {
                isApproved.value = true;
            } else if (swaggerData.value.statusCekLampiran === 0) {
                isApproved.value = false;
            }
            
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data jadwal rapat berhasil dimuat',
                life: 3000
            });
        } else {
            throw new Error(response.data?.message || 'Gagal memuat data jadwal rapat');
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: `Gagal memuat data jadwal rapat: ${error.message}`,
            life: 3000
        });
    } finally {
        isLoadingSwaggerData.value = false;
    }
};

// Function to load arahan rapat list from API
const loadArahanRapatList = async () => {
    if (!queryParams.value.id) {
        console.log('No queryParams.id found, skipping loadArahanRapatList');
        return;
    }

    console.log('=== LOADING ARAHAN RAPAT LIST ===');
    console.log('Current mode:', currentMode.value);
    console.log('Query params:', queryParams.value);
    
    isLoadingArahanRapatList.value = true;
    
    // Debug token sebelum API call
    const authStore = useAuth();
    console.log('=== DEBUG LOAD ARAHAN RAPAT ===');
    console.log('Jadwal Rapat ID:', queryParams.value.id);
    console.log('Auth Store State:', {
        isLoggedIn: authStore.isLoggedIn,
        hasToken: !!authStore.token,
        tokenLength: authStore.token ? authStore.token.length : 0,
        tokenPreview: authStore.token ? authStore.token.substring(0, 20) + '...' : 'No token'
    });
    
    try {
        const response = await ArahanPIC.getArahanRapatListByJadwalRapatId(queryParams.value.id);
        
        console.log('API Response Success MASUK SiniiiII :', response.data);
        console.log('Response structure check:', {
            hasData: !!response.data,
            hasSuccess: !!response.data?.success,
            hasDataArray: !!response.data?.data,
            dataLength: response.data?.data?.length || 0,
            fullResponse: response.data
        });
        
        if (response.data && response.data.success) {
            arahanRapatList.value = response.data.data;
            console.log('arahanRapatList.value =', arahanRapatList.value);
            console.log('arahanRapatList.value length =', arahanRapatList.value?.length);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data PIC & Arahan Rapat berhasil dimuat',
                life: 3000
            });
        } else {
            console.log('API Response but no data:', response.data);
            arahanRapatList.value = [];
        }

    } catch (error) {
        console.error('API Error Details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message,
            url: error.config?.url,
            headers: error.config?.headers
        });
        
        arahanRapatList.value = [];
        
        if (error.response?.status === 401) {
            toast.add({
                severity: 'error',
                summary: 'Unauthorized',
                detail: 'Token expired atau tidak valid. Silakan login ulang.',
                life: 5000
            });
            
            // Optionally redirect to login
            // authStore.removeCredentials();
            // router.push('/auth/login');
        } else if (error.response?.status !== 404) {
            toast.add({
                severity: 'error',
                summary: 'Kesalahan',
                detail: `Gagal memuat data PIC & Arahan Rapat: ${error.message}`,
                life: 3000
            });
        }
    } finally {
        isLoadingArahanRapatList.value = false;
    }
};

// Watch for tab changes and reinitialize files
watch(activeTab, async () => {
    await initializeFiles();
    
    // Load Swagger data when entering PIC mode
    if (currentMode.value === 'pic') {
        await loadSwaggerData();
        await loadArahanRapatList();
    }
    
    // Always load arahan rapat list regardless of mode
    await loadArahanRapatList();
});

// Handler untuk submit PIC dan Arahan Rapat
const onClickSubmitPicdanArahanRapat = async () => {
    // Validasi data yang diperlukan
    if (!queryParams.value.id) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    if (!arahanRapat.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Arahan rapat harus diisi',
            life: 3000
        });
        return;
    }

    if (!selectedPIC.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'PIC harus dipilih',
            life: 3000
        });
        return;
    }

    if (!targetWaktu.value) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Target waktu harus diisi',
            life: 3000
        });
        return;
    }

    // Set loading state
    isLoadingSave.value = true;

    try {
        // Prepare payload sesuai dengan Swagger API
        const payload = {
            jadwalRapatId: queryParams.value.id,
            jadwalRapatDetailId: queryParams.value.id, // Menggunakan ID yang sama untuk detail
            arahan: arahanRapat.value.trim(),
            targetWaktu: targetWaktu.value ? targetWaktu.value.toISOString() : '', // Convert Date to ISO 8601 string format
            picId: [selectedPIC.value] // Array PIC IDs
        };

        // Call API menggunakan method yang sudah sesuai dengan Swagger
        const response = await DetailRapatKomisDireksidankomiteService.submitPicdanArahanRapat(payload);

        if (response && response.data) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'PIC dan Arahan Rapat berhasil disimpan',
                life: 3000
            });

            // Reset form setelah berhasil
            arahanRapat.value = '';
            selectedPIC.value = '';
            targetWaktu.value = '';
            
            // Refresh arahan rapat list
            await loadArahanRapatList();
        } else {
            throw new Error(response?.data?.message || 'Gagal menyimpan PIC dan Arahan Rapat');
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Kesalahan',
            detail: `Gagal menyimpan PIC dan Arahan Rapat: ${error.message}`,
            life: 3000
        });
    } finally {
        isLoadingSave.value = false;
    }
};

</script>
<template>
    <div>
        <div class="flex items-center gap-4 mb-4">
            <div class="font-semibold text-xl">
                Upload Kajian Rapat Direksi
            </div>
        </div>
        
        <div class="card border border-blue-200 bg-white p-6">
            <TabView v-model:activeIndex="activeTab" class="w-full">
                <!-- Dynamic Tabs based on role and mode -->
                <TabPanel v-for="(tab, index) in tabs" :key="tab.value" :value="index">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <i :class="tab.icon"></i>
                            <span>{{ tab.label }}</span>
                        </div>
                    </template>
                    
                    <!-- Add Tab Content -->
                    <div v-if="tab.value === 'add'">
                    
            <Form
                ref="formUmumRef"
                v-slot="$form"
                :resolver="resolver"
                @submit="onSubmitEvent"
                class="flex flex-col gap-6 w-full"
            >
                <div class="grid grid-cols-12 gap-6">
                    <!-- Left Column - Form Fields -->
                    <div class="col-span-8">
                        <!-- Judul Kepdir Sirkuler -->
                        <div class="mb-6">
                            <label
                                for="judulKepdir"
                                class="block font-bold mb-3 text-gray-700"
                            >
                                Agenda Rapat<span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                autocomplete="off" 
                                name="judulKepdir"
                                type="text"
                                placeholder="Agenda Rapat"
                                class="w-full"
                                v-model="queryParams.agenda"
                                disabled
                            />
                            <Message
                                v-if="$form.judulKepdir?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.judulKepdir?.errors?.[0] || 'Agenda Rapat harus diisi' }}
                            </Message>
                        </div>

                        <!-- Tanggal Terbit Kepdir Sirkuler -->
                        <div class="mb-6">
                            <label
                                for="tanggalTerbit"
                                class="block font-bold mb-3 text-gray-700"
                            >
                                Tanggal Rapat<span class="text-red-500">*</span>
                            </label>
                            <Calendar
                                name="tanggalTerbit"
                                placeholder="Calendar"
                                class="w-full"
                                :showIcon="true"
                                dateFormat="dd/mm/yy"
                                v-model="queryParams.tanggal"
                                disabled
                            />
                            <Message
                                v-if="$form.tanggalTerbit?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.tanggalTerbit?.errors?.[0] || 'Tanggal Rapat harus diisi' }}
                            </Message>
                        </div>
                    </div>

                    <!-- Right Column - File Upload Section -->
                            <div class="col-span-4">
                        <!-- Pesan Info jika upload disabled -->
                        <div v-if="isFileUploadDisabled" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div class="flex items-start gap-2">
                                <i class="pi pi-info-circle text-yellow-600 mt-0.5"></i>
                                <div class="flex-1">
                                    <p class="text-sm text-yellow-800 font-semibold">Upload File Dinonaktifkan</p>
                                    <p class="text-xs text-yellow-700 mt-1">
                                        Tombol upload dinonaktifkan karena ada approval yang sedang dalam proses (nilai 1) dan belum ada yang telah disetujui (nilai 2).
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- File Upload Fields -->
                 <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12">
                        <div 
                            v-for="(file, index) in uploadedFiles" 
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
                                    @click="removeFile(index)"
                                    class="text-red-500 hover:bg-red-50"
                                />
                                <div class="flex-1">
                                    <label class="block font-bold mb-2 text-gray-700">
                                        {{ file.name }}<span class="text-red-500">*</span>
                                    </label>
                                    <div class="flex gap-2">
                                        <InputText
                                            :value="file.file ? file.file.name : ''"
                                            :placeholder="file.placeholder"
                                            readonly
                                            class="flex-1 bg-gray-100"
                                        />
                                        <FileUpload
                                            mode="basic"
                                            :auto="false"
                                            :multiple="false"
                                            accept=".pdf,.doc,.docx"
                                            :maxFileSize="10000000"
                                            @select="(event) => onFileSelect(event, index)"
                                            class="p-button-outlined"
                                            :disabled="isFileUploadDisabled"
                                        />
                                        <!-- Show Upload button when file doesn't exist or when in upload mode -->
                                        <Button
                                            v-if="!fileExists[file.type] || fileUploadMode[file.type] === 'upload'"
                                            :icon="fileExists[file.type] ? 'pi pi-refresh' : 'pi pi-upload'"
                                            :label="fileExists[file.type] ? 'Update' : 'Upload'"
                                            severity="success"
                                            :loading="isUploading[file.type]"
                                            :disabled="!file.file || isUploading[file.type] || isFileUploadDisabled"
                                            @click="uploadIndividualFile(file.type, index)"
                                            class="px-4"
                                        />
                                        <!-- Show View button when file exists and not in upload mode -->
                                        <Button
                                            v-if="fileExists[file.type] && fileUploadMode[file.type] === 'update'"
                                            icon="pi pi-eye"
                                            label="View"
                                            severity="info"
                                            @click="previewFile(file.type)"
                                            class="px-4"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                    </Form>
                    </div>
                    
                    <!-- Approve Tab Content -->
                    <div v-else-if="tab.value === 'approve'">
                    
                    <Form
                        ref="formUmumRef"
                        v-slot="$form"
                        :resolver="resolver"
                        @submit="onSubmitEvent"
                        class="flex flex-col gap-6 w-full"
                    >
                        <div class="grid grid-cols-12 gap-6">
                            <!-- Left Column - Form Fields -->
                            <div class="col-span-8">
                                <!-- Judul Kepdir Sirkuler -->
                                <div class="mb-6">
                                    <label
                                        for="judulKepdir"
                                        class="block font-bold mb-3 text-gray-700"
                                    >
                                        Agenda Rapat<span class="text-red-500">*</span>
                                    </label>
                                    <InputText 
                                        autocomplete="off" 
                                        name="judulKepdir"
                                        type="text"
                                        placeholder="Agenda Rapat"
                                        class="w-full"
                                        v-model="queryParams.agenda"
                                        readonly
                                    />
                                </div>

                                <!-- Tanggal Terbit Kepdir Sirkuler -->
                                <div class="mb-6">
                                    <label
                                        for="tanggalTerbit"
                                        class="block font-bold mb-3 text-gray-700"
                                    >
                                        Tanggal Rapat<span class="text-red-500">*</span>
                                    </label>
                                    <Calendar
                                        name="tanggalTerbit"
                                        placeholder="Calendar"
                                        class="w-full"
                                        :showIcon="true"
                                        dateFormat="dd/mm/yy"
                                        v-model="queryParams.tanggal"
                                        readonly
                                    />
                                </div>
                            </div>
                        </div>

                <!-- File Information for Approval Mode -->
                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12">
                        <div class="mb-4">
                            <label class="block font-bold mb-3 text-gray-700">
                                Dokumen Terlampir
                            </label>
                            <div class="space-y-3">
                                <div 
                                    v-for="(file, index) in uploadedFiles" 
                                    :key="index"
                                    class="p-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                                >
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-file text-gray-500"></i>
                                        <span class="text-gray-700">{{ file.name }}</span>
                                    </div>
                                    <Button
                                        icon="pi pi-eye"
                                        label="Preview"
                                        severity="info"
                                        @click="previewFile(file.type)"
                                        class="p-button-outlined p-button-sm"
                                        v-tooltip.top="'Lihat Dokumen'"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                                <!-- <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        PIC & Alasan
                                    </label>
                                    <div class="overflow-x-auto">
                                        <table class="w-full border-collapse border border-gray-300">
                                            <thead>
                                                <tr class="bg-gray-50">
                                                    <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 w-16">
                                                        No
                                                    </th>
                                                    <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                                        PIC
                                                    </th>
                                                    <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                                        Status Approval
                                                    </th>
                                                    <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                                        Alasan
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="border border-gray-300 px-4 py-3 text-center text-gray-600">
                                                        1
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        John Doe
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Approved
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Sukses
                                                    </td>
                                                </tr>
                                                <tr class="bg-gray-50">
                                                    <td class="border border-gray-300 px-4 py-3 text-center text-gray-600">
                                                        2
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Jane Smith
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Rejected
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Salah nama dalam Dokumen kajian 
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="border border-gray-300 px-4 py-3 text-center text-gray-600">
                                                        3
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Ahmad Rahman
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Approved
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        Sukses
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div> -->
            </Form>

            <Divider />
            <div class="flex justify-end gap-3">
                        <!-- Tombol Reject hanya muncul untuk role yang sesuai dan belum approve -->
                        <Button
                            v-if="shouldShowApprovalButtons"
                            class="w-max"
                            severity="danger"
                            type="button"
                            @click="onClickRejectKajian"
                            :loading="isLoadingReject"
                            label="Reject"
                        />
                        <!-- Tombol Approve hanya muncul untuk role yang sesuai dan belum approve -->
                        <Button
                            v-if="shouldShowApprovalButtons"
                            class="w-max"
                            severity="success"
                            type="button"
                            @click="onClickApproveKajian"
                            :loading="isLoadingApprove"
                            label="Approve"
                        />
                    </div>
                    </div>
                    
                    <!-- Upload Tab Content -->
                    <div v-else-if="tab.value === 'upload'">
                    
                    <Form
                        ref="formUmumRef"
                        v-slot="$form"
                        :resolver="resolver"
                        @submit="onSubmitEvent"
                        class="flex flex-col gap-6 w-full"
                    >
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
                                        placeholder="Agenda Rapat"
                                        class="w-full"
                                        v-model="queryParams.judulRapat"
                                        readonly
                                    />
                                </div>

                                <!-- Tanggal Terbit Kepdir Sirkuler -->
                                <div class="mb-6">
                                    <label
                                        for="tanggalTerbit"
                                        class="block font-bold mb-3 text-gray-700"
                                    >
                                        Tanggal Rapat<span class="text-red-500">*</span>
                                    </label>
                                    <Calendar
                                        name="tanggalTerbit"
                                        placeholder="Calendar"
                                        class="w-full"
                                        :showIcon="true"
                                        dateFormat="dd/mm/yy"
                                        v-model="queryParams.tanggal"
                                        readonly
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- File Upload Fields for Upload Mode -->
                        <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <label class="block font-bold mb-3 text-gray-700">
                                        Government
                                    </label>
                                <div 
                                    v-for="(file, index) in uploadedFiles" 
                                    :key="index"
                                    class="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                                >
                                    <div class="flex items-center gap-3">
                                        <div class="flex-1">
                                            <label class="block font-bold mb-2 text-gray-700">
                                                {{ file.name }}<span class="text-red-500">*</span>
                                            </label>
                                            <div class="flex gap-2">
                                                <InputText
                                                    :value="file.file ? file.file.name : ''"
                                                    :placeholder="file.placeholder"
                                                    readonly
                                                    class="flex-1 bg-gray-100"
                                                />
                                                <FileUpload
                                                    mode="basic"
                                                    :auto="false"
                                                    :multiple="false"
                                                    accept=".pdf,.doc,.docx"
                                                    :maxFileSize="10000000"
                                                    @select="(event) => onFileSelect(event, index)"
                                                    class="p-button-outlined"
                                                />
                                                <!-- Show Upload button when file doesn't exist or when in upload mode -->
                                                <Button
                                                    v-if="!fileExists[file.type] || fileUploadMode[file.type] === 'upload'"
                                                    :icon="fileExists[file.type] ? 'pi pi-refresh' : 'pi pi-upload'"
                                                    :label="fileExists[file.type] ? 'Update' : 'Upload'"
                                                    severity="success"
                                                    :loading="isUploading[file.type]"
                                                    :disabled="!file.file || isUploading[file.type]"
                                                    @click="uploadIndividualFile(file.type, index)"
                                                    class="px-4"
                                                />
                                                <!-- Show View button when file exists and not in upload mode -->
                                                <Button
                                                    v-if="fileExists[file.type] && fileUploadMode[file.type] === 'update'"
                                                    icon="pi pi-eye"
                                                    label="View"
                                                    severity="info"
                                                    @click="previewFile(file.type)"
                                                    class="px-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>
                    </div>
                    
                    <!-- PIC Tab Content -->
                    <div v-else-if="tab.value === 'pic'">
                        <!-- Loading State -->
                        <div v-if="isLoadingSwaggerData" class="flex justify-center items-center py-8">
                            <div class="flex flex-col items-center gap-4">
                                <i class="pi pi-spin pi-spinner text-2xl text-blue-600"></i>
                                <span class="text-gray-600">Memuat data jadwal rapat...</span>
                            </div>
                        </div>
                        
                        <!-- PIC Form Content -->
                        <Form
                            v-else
                            ref="formUmumRef"
                            v-slot="$form"
                            :resolver="resolver"
                            @submit="onSubmitEvent"
                            class="flex flex-col gap-6 w-full"
                        >
                            <!-- Swagger Data Info -->
                            <div v-if="swaggerData" class="mb-4 p-3 rounded-lg border"
                                 :class="{
                                     'bg-yellow-50 border-yellow-200': swaggerData.statusCekLampiran === 0,
                                     'bg-green-50 border-green-200': swaggerData.statusCekLampiran === 1,
                                     'bg-red-50 border-red-200': swaggerData.statusCekLampiran === 2
                                 }">
                                <div v-if="swaggerData.statusDecision !== undefined" class="mt-2 text-sm text-green-700">
                                    <strong>Status Decision:</strong> {{ swaggerData.statusDecision === 1 ? 'Aktif' : 'Tidak Aktif' }}
                                </div>
                                <div v-if="swaggerData.statusCekLampiran !== undefined" class="mt-1 text-sm" 
                                     :class="{
                                         'text-yellow-700': swaggerData.statusCekLampiran === 0,
                                         'text-green-700': swaggerData.statusCekLampiran === 1,
                                         'text-red-700': swaggerData.statusCekLampiran === 2
                                     }">
                                    <strong>Status Cek Lampiran:</strong> 
                                    <span v-if="swaggerData.statusCekLampiran === 0" class="font-semibold">
                                        Belum Dicek - Perlu Approval
                                    </span>
                                    <span v-else-if="swaggerData.statusCekLampiran === 1" class="font-semibold">
                                        Sudah Dicek - Approved
                                    </span>
                                    <span v-else-if="swaggerData.statusCekLampiran === 2" class="font-semibold">
                                        Sudah Dicek - Rejected
                                    </span>
                                </div>
                                <div v-if="swaggerData.alasan" class="mt-1 text-sm" 
                                     :class="{
                                         'text-yellow-700': swaggerData.statusCekLampiran === 0,
                                         'text-green-700': swaggerData.statusCekLampiran === 1,
                                         'text-red-700': swaggerData.statusCekLampiran === 2
                                     }">
                                    <strong>Alasan:</strong> {{ swaggerData.alasan }}
                                </div>
                                
                                <!-- Special message for status 0 (needs approval) -->
                                <div v-if="swaggerData.statusCekLampiran === 0" class="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-exclamation-triangle text-yellow-600"></i>
                                        <span class="text-sm font-semibold text-yellow-800">
                                            PERHATIAN: Status Cek Lampiran masih 0 - Dokumen ini masih memerlukan approval sebelum dapat dilanjutkan.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Error State -->
                            <div v-if="!isLoadingSwaggerData && !swaggerData" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-exclamation-triangle text-red-600"></i>
                                        <span class="text-sm text-red-800">
                                            <strong>Gagal memuat data:</strong> Tidak dapat mengambil data jadwal rapat dari server
                                        </span>
                                    </div>
                                    <Button
                                        icon="pi pi-refresh"
                                        severity="danger"
                                        size="small"
                                        @click="loadSwaggerData"
                                        :loading="isLoadingSwaggerData"
                                        label="Coba Lagi"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-6">
                                <!-- Left Column - Form Fields -->
                                <div class="col-span-8">
                                    <!-- Agenda Rapat -->
                                    <div class="mb-6">
                                        <label
                                            for="judulKepdir"
                                            class="block font-bold mb-3 text-gray-700"
                                        >
                                            Agenda Rapat<span class="text-red-500">*</span>
                                        </label>
                                        <InputText 
                                            autocomplete="off" 
                                            name="judulKepdir"
                                            type="text"
                                            placeholder="Agenda Rapat"
                                            class="w-full"
                                            v-model="queryParams.agenda"
                                            readonly
                                        />
                                    </div>

                                    <!-- Tanggal Rapat -->
                                    <div class="mb-6">
                                        <label
                                            for="tanggalTerbit"
                                            class="block font-bold mb-3 text-gray-700"
                                        >
                                            Tanggal Rapat<span class="text-red-500">*</span>
                                        </label>
                                        <Calendar
                                            name="tanggalTerbit"
                                            placeholder="Calendar"
                                            class="w-full"
                                            :showIcon="true"
                                            dateFormat="dd/mm/yy"
                                            v-model="queryParams.tanggal"
                                            readonly
                                        />
                                    </div>
                                </div>
                            </div>

                        <!-- File Information for PIC Mode -->
                        <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="mb-4">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Dokumen Terlampir
                                    </label>
                                    <div class="space-y-3">
                                        <div 
                                            v-for="(file, index) in uploadedFiles" 
                                            :key="index"
                                            class="p-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                                        >
                                            <div class="flex items-center gap-3">
                                                <i class="pi pi-file text-gray-500"></i>
                                                <span class="text-gray-700">{{ file.name }}</span>
                                            </div>
                                            <Button
                                                icon="pi pi-eye"
                                                label="Preview"
                                                severity="info"
                                                @click="previewFile(file.type)"
                                                class="p-button-outlined p-button-sm"
                                                v-tooltip.top="'Lihat Dokumen'"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PIC Form Fields - Only show after approval (statusCekLampiran = 1) -->
                        <div v-if="isApproved || (swaggerData && swaggerData.statusCekLampiran === 1)" class="grid grid-cols-12 gap-6">
                            <!-- Lampiran Rapat -->
                            <div class="col-span-6">
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Lampiran Rapat<span class="text-red-500">*</span>
                                    </label>
                                    <div class="flex gap-2">
                                        <FileUpload
                                            mode="basic"
                                            :auto="true"
                                            :multiple="false"
                                            accept=".pdf,.doc,.docx"
                                            :maxFileSize="10000000"
                                            @select="onLampiranRapatSelect"
                                            class="p-button-outlined"
                                            chooseLabel="Unggah Dokumen"
                                            chooseIcon="pi pi-upload"
                                        />
                                        <!-- Show Save button when file is not uploaded yet -->
                                        <Button
                                            v-if="!isLampiranRapatUploaded"
                                            class="w-24"
                                            severity="success"
                                            type="button"
                                            @click="onClickSubmitPicDoc"
                                            :loading="isLoadingSave"
                                            label="Save"
                                        />
                                        <!-- Show Update button when file has been uploaded and new file is selected -->
                                        <Button
                                            v-if="isLampiranRapatUploaded && lampiranRapat"
                                            class="w-24"
                                            severity="warning"
                                            type="button"
                                            @click="onClickSubmitPicDoc"
                                            :loading="isLoadingSave"
                                            label="Update"
                                        />
                                        <!-- Show View Document button when file has been uploaded -->
                                        <Button
                                            v-if="isLampiranRapatUploaded && !lampiranRapat"
                                            class="w-32"
                                            severity="info"
                                            type="button"
                                            @click="viewLampiranRapat"
                                            icon="pi pi-eye"
                                            label="View Document"
                                        />
                                    </div>
                                    <Message
                                        v-if="$form.lampiranRapat?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.lampiranRapat?.errors?.[0] || 'Lampiran rapat harus diisi' }}
                                    </Message>
                                </div>
                            </div>

                            <!-- Pilih PIC -->
                            <div class="col-span-6">
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Pilih PIC<span class="text-red-500">*</span>
                                    </label>
                                    <Select
                                        name="selectedPIC"
                                        v-model="selectedPIC"
                                        :options="picOptions"
                                        optionLabel="name"
                                        optionValue="value"
                                        placeholder="Pilih PIC"
                                        class="w-full"
                                        :loading="isLoadingPIC"
                                        :disabled="isLoadingPIC"
                                    />
                                    <Message
                                        v-if="$form.selectedPIC?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.selectedPIC?.errors?.[0] || 'PIC harus dipilih' }}
                                    </Message>
                                </div>
                            </div>
                        </div>

                        <!-- Arahan Rapat - Only show after approval -->
                        <div v-if="isApproved" class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Arahan Rapat<span class="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="arahanRapat"
                                        v-model="arahanRapat"
                                        placeholder="Masukkan arahan rapat"
                                        rows="4"
                                        class="w-full"
                                    />
                                    <Message
                                        v-if="$form.arahanRapat?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.arahanRapat?.errors?.[0] || 'Arahan rapat harus diisi' }}
                                    </Message>
                                </div>

                                <!-- Target Waktu -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Target Waktu<span class="text-red-500">*</span>
                                    </label>
                                    <Calendar
                                        name="targetWaktu"
                                        v-model="targetWaktu"
                                        placeholder="Pilih target waktu"
                                        dateFormat="dd/mm/yy"
                                        showTime
                                        hourFormat="24"
                                        class="w-full"
                                        :minDate="new Date()"
                                    />
                                    <Message
                                        v-if="$form.targetWaktu?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.targetWaktu?.errors?.[0] || 'Target waktu harus diisi' }}
                                    </Message>
                                </div>

                                <!-- Save Button -->
                                <div class="mb-4 flex justify-end">
                                    <Button
                                        v-if="isApproved"
                                        class="w-max"
                                        severity="primary"
                                        type="button"
                                        @click="onClickSubmitPicdanArahanRapat"
                                        :loading="isLoadingSave"
                                        :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                                    />
                                </div>

                                <!-- Table with 3 columns -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        PIC & Arahan Rapat
                                    </label>
                                    
                                    <!-- Loading -->
                                    <div v-if="isLoadingArahanRapatList" class="text-center py-6">
                                        <i class="pi pi-spin pi-spinner text-blue-500"></i>
                                        <span class="ml-2 text-gray-600">Memuat data...</span>
                                    </div>
                                    
                                    <!-- Data Table -->
                                    <div v-else-if="arahanRapatList && arahanRapatList.length > 0" class="overflow-x-auto">
                                        <table class="w-full border-collapse">
                                            <thead>
                                                <tr class="bg-gray-50">
                                                    <th class="border-b px-3 py-2 text-left text-sm font-medium text-gray-600 w-12">No</th>
                                                    <th class="border-b px-3 py-2 text-left text-sm font-medium text-gray-600">Agenda</th>
                                                    <th class="border-b px-3 py-2 text-left text-sm font-medium text-gray-600">PIC</th>
                                                    <th class="border-b px-3 py-2 text-left text-sm font-medium text-gray-600">Arahan</th>
                                                    <th class="border-b px-3 py-2 text-left text-sm font-medium text-gray-600">Target</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="(item, index) in arahanRapatList" :key="item.id" 
                                                    class="hover:bg-gray-50">
                                                    <td class="border-b px-3 py-2 text-sm text-gray-600">{{ index + 1 }}</td>
                                                    <td class="border-b px-3 py-2 text-sm text-gray-700">{{ item.agenda || '-' }}</td>
                                                    <td class="border-b px-3 py-2 text-sm text-gray-700">{{ item.namaLengkap || '-' }}</td>
                                                    <td class="border-b px-3 py-2 text-sm text-gray-700">{{ item.arahan || '-' }}</td>
                                                    <td class="border-b px-3 py-2 text-sm text-gray-700">{{ item.targetWaktu ? new Date(item.targetWaktu).toLocaleDateString('id-ID') : '-' }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <!-- Empty State -->
                                    <div v-else class="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                                        <i class="pi pi-info-circle text-gray-400 text-xl"></i>
                                        <p class="text-sm text-gray-600 mt-2">Belum ada data PIC & Arahan Rapat</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Message when not approved yet -->
                        <div v-if="!isApproved && (!swaggerData || swaggerData.statusCekLampiran === 0)" class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-info-circle text-yellow-600"></i>
                                        <span class="text-yellow-800">
                                            <strong>Informasi:</strong> 
                                            <span v-if="swaggerData && swaggerData.statusCekLampiran === 0">
                                                Status Cek Lampiran masih 0 - Silakan klik tombol "Approve" terlebih dahulu untuk mengisi form PIC.
                                            </span>
                                            <span v-else>
                                                Silakan klik tombol "Approve" terlebih dahulu untuk mengisi form PIC.
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Message when rejected -->
                        <div v-if="swaggerData && swaggerData.statusCekLampiran === 2" class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-times-circle text-red-600"></i>
                                        <span class="text-red-800">
                                            <strong>Dokumen Ditolak:</strong> Status Cek Lampiran = 2 - Dokumen ini telah ditolak dan tidak dapat dilanjutkan.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Form>

                    <Divider />
                    <div class="flex justify-end gap-3">
                        <!-- Tombol Reject - muncul jika statusCekLampiran masih 0 atau belum di-approve -->
                        <Button
                            v-if="(!isApproved && !swaggerData) || (swaggerData && swaggerData.statusCekLampiran === 0)"
                            class="w-max"
                            severity="danger"
                            type="button"
                            @click="onClickRejectPIC"
                            :loading="isLoadingReject"
                            label="Reject"
                        />
                        <!-- Tombol Approve - muncul jika statusCekLampiran masih 0 atau belum di-approve -->
                        <Button
                            v-if="(!isApproved && !swaggerData) || (swaggerData && swaggerData.statusCekLampiran === 0)"
                            class="w-max"
                            severity="success"
                            type="button"
                            @click="onClickApprovePIC"
                            :loading="isLoadingApprove"
                            label="Approve"
                        />
                        
                        <!-- Informasi jika sudah di-approve atau di-reject -->
                        <div v-if="swaggerData && swaggerData.statusCekLampiran === 1" class="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded">
                            <i class="pi pi-check-circle text-green-600"></i>
                            <span class="text-sm font-semibold text-green-800">Dokumen sudah di-approve</span>
                        </div>
                        <div v-if="swaggerData && swaggerData.statusCekLampiran === 2" class="flex items-center gap-2 px-4 py-2 bg-red-100 border border-red-300 rounded">
                            <i class="pi pi-times-circle text-red-600"></i>
                            <span class="text-sm font-semibold text-red-800">Dokumen sudah di-reject</span>
                        </div>
                    </div>
                    </div>
                </TabPanel>
            </TabView>
            
            <!-- Back Button - appears on all tabs -->
            <Divider />
            <div class="flex justify-start">
                <Button
                    class="w-max"
                    severity="secondary"
                    type="button"
                    @click="onClickBack"
                    label="Back"
                />
            </div>
        </div>
    </div>
    

    <!--========================================================================================================================================
                                        Modal Approval & Rejection Kajian Rapat
    ===============================================================================================================================-->
    <!-- Approval Modal -->
    <Dialog 
        v-model:visible="showApprovalModalKajian" 
        modal 
        header="Konfirmasi Approval" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="flex flex-col gap-4">
            <!-- Agenda Rapat Info -->
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Agenda</label>
                    <InputText
                        :model-value="queryParams.agenda"
                        disabled
                        class="w-full"
                    />
                </div>
                
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Tanggal</label>
                    <InputText
                        :model-value="queryParams.tanggal"
                        disabled
                        class="w-full"
                    />
                </div>
                
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Model Rapat</label>
                    <InputText
                        :model-value="queryParams.modelRapat"
                        disabled
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Alasan Approval -->
            <div>
                <label class="block font-semibold mb-2 text-gray-700">
                    Alasan Approval <span class="text-red-500">*</span>
                </label>
                <Textarea
                    v-model="approvalReason"
                    placeholder="Masukkan alasan approval..."
                    rows="4"
                    class="w-full"
                />
            </div>
        </div>
        
        <template #footer>
            <Button 
                label="Batal" 
                severity="secondary" 
                @click="cancelApprovalKajian" 
                class="mr-2"
            />
            <Button 
                label="Konfirmasi Approval" 
                severity="success" 
                @click="confirmApproveKajian"
                :loading="isLoadingApprove"
            />
        </template>
    </Dialog>

    <!-- Rejection Modal -->
    <Dialog 
        v-model:visible="showRejectionModalKajian" 
        modal 
        header="Konfirmasi Penolakan" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="flex flex-col gap-4">
            <!-- Agenda Rapat Info -->
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Agenda</label>
                    <InputText
                        :model-value="queryParams.agenda"
                        disabled
                        class="w-full"
                    />
                </div>

                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Tanggal</label>
                    <InputText
                        :model-value="queryParams.tanggal"
                        disabled
                        class="w-full"
                    />
                </div>
                
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Model Rapat</label>
                    <InputText
                        :model-value="queryParams.modelRapat"
                        disabled
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Alasan Penolakan -->
            <div>
                <label class="block font-semibold mb-2 text-gray-700">
                    Alasan Penolakan <span class="text-red-500">*</span>
                </label>
                <Textarea
                    v-model="rejectionReason"
                    placeholder="Masukkan alasan penolakan..."
                    rows="4"
                    class="w-full"
                />
            </div>
        </div>
        
        <template #footer>
            <Button 
                label="Batal" 
                severity="secondary" 
                @click="cancelRejectionKajian" 
                class="mr-2"
            />
            <Button 
                label="Konfirmasi Penolakan" 
                severity="danger" 
                @click="confirmRejectKajian"
                :loading="isLoadingReject"
            />
        </template>
    </Dialog>
    <!--======================================================================================================================================== -->
    

    <!--========================================================================================================================================
                                        Modal Approval PIC
    ===============================================================================================================================-->
    <!-- Approval Modal -->
    <Dialog 
        v-model:visible="showApprovalModalPIC" 
        modal 
        header="Konfirmasi Approval" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="flex flex-col gap-4">
            <!-- Agenda Rapat Info -->
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Agenda</label>
                    <InputText
                        :model-value="queryParams.agenda"
                        disabled
                        class="w-full"
                    />
                </div>
                
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Tanggal</label>
                    <InputText
                        :model-value="queryParams.tanggal"
                        disabled
                        class="w-full"
                    />
                </div>
                
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Model Rapat</label>
                    <InputText
                        :model-value="queryParams.modelRapat"
                        disabled
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Alasan Approval -->
            <div>
                <label class="block font-semibold mb-2 text-gray-700">
                    Alasan Approval <span class="text-red-500">*</span>
                </label>
                <Textarea
                    v-model="approvalReason"
                    placeholder="Masukkan alasan approval..."
                    rows="4"
                    class="w-full"
                />
            </div>
        </div>
        
        <template #footer>
            <Button 
                label="Batal" 
                severity="secondary" 
                @click="cancelApprovalPIC" 
                class="mr-2"
            />
            <Button 
                label="Konfirmasi Approval" 
                severity="success" 
                @click="confirmApprovePIC"
                :loading="isLoadingApprove"
            />
        </template>
    </Dialog>

    <!-- Rejection Modal -->
    <Dialog 
        v-model:visible="showRejectionModalPIC" 
        modal 
        header="Konfirmasi Penolakan" 
        :style="{ width: '50rem' }"
        :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
        <div class="flex flex-col gap-4">
            <!-- Agenda Rapat Info -->
            <div class="flex flex-col gap-4">
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Agenda</label>
                    <InputText
                        :model-value="queryParams.agenda"
                        disabled
                        class="w-full"
                    />
                </div>

                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Tanggal</label>
                    <InputText
                        :model-value="queryParams.tanggal"
                        disabled
                        class="w-full"
                    />
                </div>
                
                <div>
                    <label class="block font-semibold mb-2 text-gray-700">Model Rapat</label>
                    <InputText
                        :model-value="queryParams.modelRapat"
                        disabled
                        class="w-full"
                    />
                </div>
            </div>
            
            <!-- Alasan Penolakan -->
            <div>
                <label class="block font-semibold mb-2 text-gray-700">
                    Alasan Penolakan <span class="text-red-500">*</span>
                </label>
                <Textarea
                    v-model="rejectionReason"
                    placeholder="Masukkan alasan penolakan..."
                    rows="4"
                    class="w-full"
                />
            </div>
        </div>
        
        <template #footer>
            <Button 
                label="Batal" 
                severity="secondary" 
                @click="cancelRejectionPIC" 
                class="mr-2"
            />
            <Button 
                label="Konfirmasi Penolakan" 
                severity="danger" 
                @click="confirmRejectPIC"
                :loading="isLoadingReject"
            />
        </template>
    </Dialog>
    
    
    
    <!-- Confirm Dialog -->
    <ConfirmDialog group="crud-group" />
    
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
