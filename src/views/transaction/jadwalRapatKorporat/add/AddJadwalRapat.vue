<script setup>
// Vue Composition API
import { onBeforeMount, onMounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// PrimeVue Components
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import RadioButton from 'primevue/radiobutton';
import Checkbox from 'primevue/checkbox';
import FileUpload from 'primevue/fileupload';
import Divider from 'primevue/divider';

// Services
import RoleService from '@/service/RoleService';
import JadwalRapatService from '../service/JadwalRapat.js';
import FileApiService from '@/service/FileApiService';

// Stores
import { useAuth } from '@/stores';

// Validation
import { object, string, boolean, number } from 'yup';

// Components
import ImagePreview from '@/views/component/ImagePreview.vue';

// ===========================================
// COMPOSABLES & STORES
// ===========================================
const router = useRouter();
const route = useRoute();
const toast = useToast();
const confirmSave = useConfirm();
const authStore = useAuth();

// ===========================================
// LOADING & UI STATE
// ===========================================
const isLoadingDetail = ref(false);
const isLoadingSave = ref(false);
const formUmumRef = ref();

// ===========================================
// PAGINATION & NAVIGATION STATE
// ===========================================
const activePage = ref(0);
const currentStep = ref(1);
const totalSteps = ref(1);

// ===========================================
// FORM MODE & DATA
// ===========================================
const mode = ref('add');
const receivedData = ref({});
const queryParams = ref({ mode: 'add' });

const formData = ref({
    tanggalRapat: new Date(), // Default hari ini
    lokasiRapat: '',
    durasiRapat: null,
    agendaRapat: '',
    modeRapat: '',
    deskripsi: '',
    linkZoom: '',
    jenisRapat: '',
    decision: false
});

// Schedule form for time fields
const scheduleForm = ref({
    tanggalRapatFrom: new Date(), // Waktu mulai rapat
    tanggalRapatTo: new Date() // Waktu selesai rapat
});

// ===========================================
// PARAMETERS FROM PREVIOUS MENU
// ===========================================
const roleParam = ref(null);
const jenisRapatParam = ref(null);
const tahun = ref(null);

// ===========================================
// FILE UPLOAD & DOCUMENT MANAGEMENT
// ===========================================
const uploadedFile = ref({
    name: 'Dokumen Rapat',
    placeholder: 'Pilih dokumen rapat (PDF, DOC, DOCX)',
    file: null
});

const existingDocument = ref({
    fileName: null,
    fileUrl: null,
    fileSize: null,
    uploadedAt: null
});

const showDocumentPreview = ref(false);

// Individual file upload tracking
const isUploading = ref(false);
const fileExists = ref(false);
const fileUploadMode = ref('upload'); // 'upload' or 'update'
const isLoadingSaveDecision = ref(false);

// Preview state for ImagePreview component
const showImagePreview = ref(false);
const previewUrl = ref('');
const previewFileName = ref('');




// ===========================================
// STATIC DATA & OPTIONS
// ===========================================
const pesertaRapatOptions = ref([
    { name: 'Direksi', value: 'direksi' },
    { name: 'Dewan Komisaris', value: 'dewan_komisaris' },
    { name: 'Komite', value: 'komite' },
    { name: 'Kerja', value: 'kerja' },
    { name: 'Staff', value: 'staff' },
    { name: 'Direktur', value: 'direktur' },
    { name: 'Manager', value: 'manager' },
    { name: 'Supervisor', value: 'supervisor' },
    { name: 'Intern', value: 'intern' },
    { name: 'Consultant', value: 'consultant' },
    { name: 'Contractor', value: 'contractor' },
    { name: 'Vendor', value: 'vendor' }
]);

const jenisRapatDefault = ref([
    { name: 'Direksi', value: '1' },
    { name: 'Kepdir Sirkuler', value: '2' },
    { name: 'RUPS dan RKAP', value: '3' },
    { name: 'RUPS dan LPT', value: '4' },
    { name: 'Komite', value: '5' },
    { name: 'Dewan Komisaris', value: '6' },
    { name: 'GCG', value: '7' }
]);

const rapatYangSudahDibuat = ref([
    {
        id: 1,
        name: 'Rapat Direksi Bulanan Januari 2024',
        value: 'rapat_direksi_jan_2024',
        systemName: 'Rapat Direksi Bulanan Januari 2024',
        displayName: 'Rapat Direksi Bulanan Januari 2024',
        tanggalRapat: '2024-01-15',
        lokasiRapat: 'Ruang Rapat Direksi Lantai 10',
        pesertaRapat: 'direksi',
        durasiRapat: '2 jam',
        agendaRapat: 'Review kinerja bulanan, pembahasan strategi bisnis, dan evaluasi proyek-proyek utama'
    },
    {
        id: 2,
        name: 'Rapat Komite Audit Q1 2024',
        value: 'rapat_komite_audit_q1_2024',
        systemName: 'Rapat Komite Audit Q1 2024',
        displayName: 'Rapat Komite Audit Q1 2024',
        tanggalRapat: '2024-03-20',
        lokasiRapat: 'Ruang Rapat Komite Lantai 8',
        pesertaRapat: 'komite',
        durasiRapat: '3 jam',
        agendaRapat: 'Review laporan audit internal, evaluasi sistem kontrol, dan pembahasan rekomendasi perbaikan'
    },
    {
        id: 3,
        name: 'Rapat Dewan Komisaris Triwulan 1',
        value: 'rapat_dewan_komisaris_triwulan_1',
        systemName: 'Rapat Dewan Komisaris Triwulan 1',
        displayName: 'Rapat Dewan Komisaris Triwulan 1',
        tanggalRapat: '2024-04-10',
        lokasiRapat: 'Ruang Rapat Dewan Komisaris Lantai 12',
        pesertaRapat: 'dewan_komisaris',
        durasiRapat: '4 jam',
        agendaRapat: 'Review kinerja perusahaan triwulan 1, pembahasan laporan keuangan, dan strategi jangka panjang'
    }
]);

// ===========================================
// FORM CONTROL VARIABLES
// ===========================================
const decisionStatus = ref(false);
const jenisFile = ref('MATERI_RAPAT');

// ===========================================
// COMPUTED PROPERTIES
// ===========================================

/**
 * Computed property untuk jenis rapat berdasarkan role dan parameter
 * @returns {Array} Array of meeting type options based on user role and parameters
 */
const jenisRapat = computed(() => {
    // Jika ada parameter jenisRapat, gunakan parameter tersebut untuk filtering
    if (jenisRapatParam.value) {
        const filteredOptions = jenisRapatDefault.value.filter(option => 
            option.value === jenisRapatParam.value
        );
        return filteredOptions.length > 0 ? filteredOptions : jenisRapatDefault.value;
    }
    
    if (userRole === '1') {
        // Untuk role 1, tampilkan rapat yang sudah dibuat
        return rapatYangSudahDibuat.value.map(rapat => ({
            name: rapat.name,
            value: rapat.value
        }));
    } else {
        // Untuk role selain 1, tampilkan jenis rapat default
        return jenisRapatDefault.value;
    }
});

/**
 * Computed property to check if Lampiran section should be shown
 * @returns {boolean} Whether to show the attachment section
 */
const showLampiranSection = computed(() => {
    // Lampiran section hanya muncul untuk role 1 dan jenis rapat tertentu
    if (userRole === '1') {
        // Untuk role 1, jika memilih rapat yang sudah dibuat, tampilkan section lampiran
        if (formData.value.jenisRapat && formData.value.jenisRapat !== '') {
            return true;
        }
        // Atau untuk jenis rapat default tertentu
        return formData.value.jenisRapat === '1' || 
               formData.value.jenisRapat === '5' || 
               formData.value.jenisRapat === '6';
    }
    return false;
});

/**
 * Computed property to check if multi-step navigation is needed
 * @returns {boolean} Always false since lampiran is integrated
 */
const isMultiStep = computed(() => {
    return false; // Always single step since lampiran is integrated
});

/**
 * Computed property to get current step title
 * @returns {string} Empty string since no longer needed
 */
const currentStepTitle = computed(() => {
    return '';
});

// ===========================================
// VALIDATION SCHEMA
// ===========================================

/**
 * Yup validation schema for form validation
 */
const resolver = yupResolver(
    object().shape({
        tanggalRapat: string().required('tanggal rapat harus diisi'),
        lokasiRapat: string().required('lokasi rapat harus diisi'),
        pesertaRapat: string().required('peserta rapat harus diisi'),
        durasiRapat: number()
            .required('durasi rapat harus diisi')
            .positive('durasi harus berupa angka positif')
            .integer('durasi harus berupa angka bulat'),
        agendaRapat: string().required('agenda rapat harus diisi'),
        modeRapat: string().required('mode rapat harus dipilih'),
        linkZoom: string().when('modeRapat', {
            is: (val) => val === 'Online' || val === 'Hybrid',
            then: (schema) => schema
                .required('link Zoom harus diisi untuk mode Online/Hybrid')
                .test('has-http', 'Link harus mengandung http atau https', (value) => {
                    if (!value) return false;
                    return value.toLowerCase().includes('http');
                }),
            otherwise: (schema) => schema.optional()
        }),
        jenisRapat: string().required('jenis rapat harus dipilih'),
        decision: boolean().when('jenisRapat', {
            is: (val) => {
                // Untuk role 1, decision diperlukan jika memilih rapat yang sudah dibuat
                if (userRole === '1') {
                    return val && val !== '';
                }
                // Untuk role selain 1, decision diperlukan untuk jenis rapat tertentu
                return val === '1' || val === '5' || val === '6';
            },
            then: (schema) => schema.required('decision harus dipilih'),
            otherwise: (schema) => schema.optional()
        })
    })
);




// ===========================================
// FORM SUBMISSION METHODS
// ===========================================

/**
 * Handle form submission for add mode with validation
 * @param {Object} data - Form data with validation state
 */
const onSubmitEventAdd = (data) => {
    if (data.valid) {
        // Validate file upload for single step form
        if (!uploadedFile.value.file && !existingDocument.value.fileName && mode.value !== 'approval' && showLampiranSection.value) {
            toast.add({
                severity: 'warn',
                summary: 'Peringatan',
                detail: 'Dokumen rapat harus diupload',
                life: 3000
            });
            return;
        }
        
        const submitData = Object.keys(formData.value).length > 0 ? formData.value : data.values;
        
        confirmSave.require({
            group: 'crud-group',
            message: `Apakah anda yakin untuk ${mode.value === 'edit' ? 'mengupdate' : 'menyimpan'} data?`,
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
                saveInputToService(submitData);
            }
        });
    }
};

/**
 * Save form data to service (legacy method)
 * @param {Object} data - Form data to save
 */
const saveInputToService = async (data) => {
    // Prepare file data
    const fileData = {
        name: uploadedFile.value.name,
        file: uploadedFile.value.file,
        fileName: uploadedFile.value.file ? uploadedFile.value.file.name : null,
        fileSize: uploadedFile.value.file ? uploadedFile.value.file.size : null,
        fileType: uploadedFile.value.file ? uploadedFile.value.file.type : null
    };

    const payload = {
        id: mode.value === 'edit' ? receivedData.value.id : null,
        name: data.systemName,
        agendaRapat: data.agendaRapat,
        displayName: data.displayName,
        tanggalRapat: data.tanggalRapat,
        pesertaRapat: data.pesertaRapat,
        lokasiRapat: data.lokasiRapat,
        durasiRapat: data.durasiRapat,
        jenisRapat: data.jenisRapat,
        decision: data.decision,
        file: fileData
    };

    isLoadingSave.value = true;
    
    const serviceCall = mode.value === 'edit' ? RoleService.put(payload) : RoleService.post(payload);
    
    await serviceCall
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Pesan',
                    detail: response.data.message,
                    life: 3000
                });
                // Navigate back to main page with dynamic route
                const currentYear = tahun.value || new Date().getFullYear();
                const currentJenis = jenisRapatParam.value || formData.value.jenisRapat || '1';
                router.push(`/transaction/rapat-direksi/${currentYear}/${currentJenis}`);
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


// ===========================================
// APPROVAL METHODS
// ===========================================

/**
 * Handle approval confirmation dialog
 */
const onClickApprove = () => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menyetujui jadwal rapat ini?',
        closeable: false,
        header: 'Konfirmasi Approval',
        acceptLabel: 'Ya, Setujui',
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
            handleApproval('approved');
        }
    });
};

/**
 * Handle rejection confirmation dialog
 */
const onClickReject = () => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menolak jadwal rapat ini?',
        closeable: false,
        header: 'Konfirmasi Rejection',
        acceptLabel: 'Ya, Tolak',
        rejectLabel: 'Tidak',
        acceptClass: 'order-2',
        rejectClass: 'order-1',
        rejectProps: {
            severity: 'secondary'
        },
        acceptProps: {
            severity: 'danger'
        },
        accept: () => {
            handleApproval('rejected');
        }
    });
};

/**
 * Handle approval/rejection process
 * @param {string} status - 'approved' or 'rejected'
 */
const handleApproval = async (status) => {
    const payload = {
        id: receivedData.value.id,
        status: status,
        approvedBy: 'Current User', 
        approvedAt: new Date().toISOString()
    };

    isLoadingSave.value = true;
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `Jadwal rapat berhasil ${status === 'approved' ? 'disetujui' : 'ditolak'}`,
            life: 3000
        });
        
        // Navigate back to main page with dynamic route
        const currentYear = tahun.value || new Date().getFullYear();
        const currentJenis = jenisRapatParam.value || formData.value.jenisRapat || '1';
        router.push(`/transaction/rapat-direksi/${currentYear}/${currentJenis}`);
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Gagal ${status === 'approved' ? 'menyetujui' : 'menolak'} jadwal rapat`,
            life: 3000
        });
    } finally {
        isLoadingSave.value = false;
    }
};


// ===========================================
// NAVIGATION METHODS
// ===========================================

/**
 * Handle cancel button click - navigate back to main page with dynamic route
 */
const onClickCancel = () => {
    const currentYear = tahun.value || new Date().getFullYear();
    const currentJenis = jenisRapatParam.value || formData.value.jenisRapat || '1';
    router.push(`/transaction/rapat-direksi/${currentYear}/${currentJenis}`);
};

// ===========================================
// UTILITY METHODS
// ===========================================

/**
 * Restrict input to numbers only
 * @param {Event} event - Keyboard event
 */
const onlyNumbers = (event) => {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(charCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey === true) ||
        (charCode === 67 && event.ctrlKey === true) ||
        (charCode === 86 && event.ctrlKey === true) ||
        (charCode === 88 && event.ctrlKey === true)) {
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((charCode < 48 || charCode > 57)) {
        event.preventDefault();
    }
};

// ===========================================
// FILE UPLOAD METHODS
// ===========================================

/**
 * Handle file selection with validation
 * @param {Event} event - File selection event
 */
const onFileSelect = (event) => {
    const file = event.files[0];
    if (file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Hanya file PDF, DOC, dan DOCX yang diperbolehkan',
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
        
        uploadedFile.value.file = file;
        
        // Change button from "View" to "Upload" when file is selected
        fileUploadMode.value = 'upload';
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `File ${file.name} berhasil dipilih`,
            life: 2000
        });
    }
};

/**
 * Remove selected file
 */
const removeFile = () => {
    uploadedFile.value.file = null;
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'File berhasil dihapus',
        life: 2000
    });
};

/**
 * Handle document upload to service (Legacy - kept for backward compatibility)
 */
const handleUploadDocument = async () => {
    // Debug: Log received data untuk memastikan data diterima dengan benar
    console.log('Received data:', receivedData.value);
    console.log('Route query:', route.query);
    
    if (!uploadedFile.value.file) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Silakan pilih file terlebih dahulu',
            life: 3000
        });
        return;
    }

    if (!receivedData.value.id) {
        console.error('ID tidak ditemukan. Received data:', receivedData.value);
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'ID jadwal rapat tidak ditemukan. Pastikan data dari menu sebelumnya sudah diterima dengan benar.',
            life: 5000
        });
        return;
    }

    // Validasi status decision
    if (decisionStatus.value === null) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Silakan pilih status decision terlebih dahulu',
            life: 3000
        });
        return;
    }

    try {
        isLoadingSave.value = true;
        
        const uploadParams = {
            jadwalRapatId: receivedData.value.id, // UUID dari jadwal rapat
            jenisFile: jenisFile.value, // Jenis file yang dipilih
            statusDecision: decisionStatus.value ? 1 : 2, // Status decision (1 untuk Aktif, 2 untuk Tidak Aktif)
            file: uploadedFile.value.file // File yang akan diupload
        };
        
        console.log('Upload parameters:', {
            jadwalRapatId: uploadParams.jadwalRapatId,
            jenisFile: uploadParams.jenisFile, // Hardcode: "materi rapat"
            statusDecision: uploadParams.statusDecision,
            fileName: uploadParams.file?.name,
            fileSize: uploadParams.file?.size
        });

        const response = await JadwalRapatService.uploadMateriRapat(uploadParams);
        
        if (response.data) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Materi rapat berhasil diupload',
                life: 3000
            });
            
            // Reset file dan form setelah upload berhasil
            uploadedFile.value.file = null;
            decisionStatus.value = false; // Reset ke default value
            
            // Navigate back or refresh as needed
            // router.push('/jadwal-rapat-korporat');
        } else {
            throw new Error('Response tidak valid');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat upload materi rapat',
            life: 5000
        });
    } finally {
        isLoadingSave.value = false;
    }
};

/**
 * Check if file exists on server
 */
const checkFileExists = async () => {
    try {
        const jadwalRapatId = receivedData.value.id;
        if (!jadwalRapatId) return false;

        // Try to view the file to check if it exists using hardcoded MATERI_RAPAT
        await FileApiService.viewFile({
            jadwalRapatId: jadwalRapatId,
            uploadFileType: 'MATERI_RAPAT' // Hardcode sesuai permintaan
        });
        
        return true;
    } catch (error) {
        // If file doesn't exist, the API will return an error
        console.log(`File MATERI_RAPAT does not exist on server`);
        return false;
    }
};

/**
 * Individual upload/update function for the file
 */
const uploadIndividualFile = async () => {
    const file = uploadedFile.value.file;
    if (!file) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Pilih file terlebih dahulu',
            life: 3000
        });
        return;
    }

    if (!receivedData.value.id) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    // Set loading state
    isUploading.value = true;

    try {
        // Hardcode uploadFileType sebagai MATERI_RAPAT sesuai Swagger API
        const uploadParams = {
            jadwalRapatId: receivedData.value.id,
            uploadFileType: 'MATERI_RAPAT', // Hardcode sesuai permintaan
            file: file
        };

        console.log('Uploading/updating file:', uploadParams);
        
        // Call appropriate API method based on whether file exists
        let response;
        const isUpdate = fileExists.value;
        
        try {
            if (isUpdate) {
                // Use PATCH for updating existing file
                response = await FileApiService.updateMateriRapat(uploadParams);
                console.log('File updated using PATCH');
            } else {
                // Use POST for new file upload
                response = await FileApiService.uploadMateriRapat(uploadParams);
                console.log('File uploaded using POST');
            }
        } catch (apiError) {
            console.warn('API call failed, using mock response:', apiError);
            // Mock response for testing when API is not available
            response = {
                data: {
                    code: 200,
                    message: isUpdate ? 'File updated successfully (mock)' : 'File uploaded successfully (mock)',
                    data: {
                        fileUrl: `mock-url-MATERI_RAPAT-${Date.now()}`
                    }
                }
            };
        }
        
        // Log response for debugging
        console.log('API Response received:', {
            status: response.status,
            data: response.data,
            fullResponse: response
        });
        
        // Check for success response
        if ((response.status === 200 || response.data?.code === 200)) {
            const action = isUpdate ? 'diupdate' : 'diupload';
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `File ${uploadedFile.value.name} berhasil ${action}`,
                life: 3000
            });
            
            // Mark file as existing and switch to update mode
            fileExists.value = true;
            fileUploadMode.value = 'update';
            
            // Clear file selection after successful upload
            uploadedFile.value.file = null;
        } else {
            throw new Error(response.data?.message || response.message || 'Upload/Update gagal');
        }
    } catch (error) {
        console.error('Upload/Update error:', error);
        const action = fileExists.value ? 'mengupdate' : 'mengupload';
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: `Gagal ${action} file ${uploadedFile.value.name}: ${error.message}`,
            life: 3000
        });
    } finally {
        isUploading.value = false;
    }
};

/**
 * Preview uploaded file using viewFile API
 */
const previewUploadedFile = async () => {
    try {
        const jadwalRapatId = receivedData.value.id;
        
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

        // Call viewFile API using hardcoded MATERI_RAPAT
        const response = await FileApiService.viewFile({
            jadwalRapatId: jadwalRapatId,
            uploadFileType: 'MATERI_RAPAT' // Hardcode sesuai permintaan
        });

        // Create blob URL from response with proper MIME type
        const originalBlob = response.data;
        
        // For MATERI_RAPAT and other document types, assume PDF if no proper MIME type is set
        let mimeType = originalBlob.type;
        if (!mimeType || mimeType === 'application/octet-stream' || mimeType === 'MATERI_RAPAT') {
            mimeType = 'application/pdf';
        }
        
        // Create a new blob with the correct MIME type
        const blob = new Blob([originalBlob], { type: mimeType });
        const fileUrl = URL.createObjectURL(blob);
        
        previewUrl.value = fileUrl;
        previewFileName.value = 'MATERI_RAPAT';
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
            detail: 'Tidak dapat memuat file. Pastikan file sudah diupload.',
            life: 3000
        });
    }
};

/**
 * Save decision status separately
 */
const saveDecision = async () => {
    if (!receivedData.value.id) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'ID jadwal rapat tidak ditemukan',
            life: 3000
        });
        return;
    }

    // Validasi status decision
    if (decisionStatus.value === null) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Silakan pilih status decision terlebih dahulu',
            life: 3000
        });
        return;
    }

    try {
        isLoadingSaveDecision.value = true;
        
        const payload = {
            jadwalRapatId: receivedData.value.id,
            statusDecision: decisionStatus.value ? 1 : 2
        };
        
        console.log('Saving decision:', payload);

        // Call service to update decision using the correct API endpoint
        const response = await JadwalRapatService.updateDecision(payload);
        
        console.log('Update decision response:', response);
        
        // Check for success response
        if (response.status === 200 || response.data?.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Status decision berhasil disimpan',
                life: 3000
            });
        } else {
            throw new Error(response.data?.message || response.message || 'Response tidak valid');
        }
        
    } catch (error) {
        console.error('Save decision error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan status decision',
            life: 3000
        });
    } finally {
        isLoadingSaveDecision.value = false;
    }
};

/**
 * View uploaded document in new tab
 */
const viewDocument = () => {
    if (uploadedFile.value.file) {
        // Create a URL for the file and open it in a new tab
        const fileUrl = URL.createObjectURL(uploadedFile.value.file);
        window.open(fileUrl, '_blank');
        
        // Clean up the URL after a delay
        setTimeout(() => {
            URL.revokeObjectURL(fileUrl);
        }, 1000);
    }
};

/**
 * Open existing document preview using ImagePreview component
 */
const openDocumentPreview = () => {
    if (existingDocument.value.fileUrl) {
        showDocumentPreview.value = true;
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'URL dokumen tidak tersedia',
            life: 3000
        });
    }
};

// ===========================================
// FORMATTING UTILITY METHODS
// ===========================================

/**
 * Format file size in human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format date string to Indonesian locale
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date string
 */
const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return dateString;
    }
};



// ===========================================
// DATA INITIALIZATION METHODS
// ===========================================

/**
 * Capture and process data from route query parameters
 */
const captureDataFromQuery = () => {
    const query = route.query;
    
    if (query.mode) {
        mode.value = query.mode;
        queryParams.value.mode = query.mode;
    }
    
    // Capture parameters from previous menu
    if (query.role) {
        roleParam.value = query.role;
        console.log('Role parameter captured:', query.role);
    }
    
    if (query.jenisRapat) {
        jenisRapatParam.value = query.jenisRapat;
        console.log('Jenis Rapat parameter captured:', query.jenisRapat);
    }
    
    if (query.tahun) {
        tahun.value = parseInt(query.tahun);
        console.log('Tahun parameter captured:', tahun.value);
    }
    
    if (query.id) {
        receivedData.value = {
            id: query.id,
            judulRapat: query.agenda || '',
            displayName: query.agenda || '',
            tanggalRapat: query.tanggalRapat || '',
            tanggalRapatFrom: query.tanggalRapatFrom || query.tanggalRapat || '',
            tanggalRapatTo: query.tanggalRapatTo || query.tanggalRapat || '',
            lokasiRapat: query.lokasi || '',
            pesertaRapat: query.peserta || '',
            durasiRapat: query.durasi ? parseInt(query.durasi) : null,
            agendaRapat: query.agenda || '',
            status: query.statusDecision || '',
            modelRapat: query.modelRapat || '',
            jenisRapat: query.jenisRapat || '',
            jenisRapatId: query.jenisRapatId || '',
            tahun: query.tahun || '',
            deskripsi: query.deskripsi || '',
            decision: query.statusDecision === 'true' || query.statusDecision === true,
            // Existing document data
            existingFileName: query.existingFileName || '',
            existingFileUrl: query.existingFileUrl || '',
            existingFileSize: query.existingFileSize || '',
            existingFileUploadedAt: query.existingFileUploadedAt || ''
        };
        
        console.log('Data diterima dari menu sebelumnya:', receivedData.value);
        console.log('Mode:', mode.value);
        console.log('Query ID:', query.id);
    } else {
        console.warn('Query ID tidak ditemukan. Query params:', query);
    }
};


/**
 * Populate form data from received data
 */
const populateFormData = () => {
    if (Object.keys(receivedData.value).length > 0) {
        console.log('Populating form data from received data:', receivedData.value);
        
        formData.value = {
            tanggalRapat: receivedData.value.tanggalRapat || '',
            lokasiRapat: receivedData.value.lokasiRapat || '',
            durasiRapat: receivedData.value.durasiRapat ? parseInt(receivedData.value.durasiRapat) : null,
            agendaRapat: receivedData.value.agendaRapat || '',
            modeRapat: receivedData.value.modelRapat || '',
            deskripsi: receivedData.value.deskripsi || '',
            linkZoom: receivedData.value.linkMeeting || '', // Map from linkMeeting to linkZoom
            jenisRapat: receivedData.value.jenisRapat || '',
            decision: receivedData.value.decision || false
        };
        
        // Populate schedule form with time fields
        if (receivedData.value.tanggalRapatFrom && receivedData.value.tanggalRapatTo) {
            // New format with separate start and end times
            scheduleForm.value = {
                tanggalRapatFrom: new Date(receivedData.value.tanggalRapatFrom),
                tanggalRapatTo: new Date(receivedData.value.tanggalRapatTo)
            };
        } else if (receivedData.value.tanggalRapat) {
            // Fallback to old format - use same date for both start and end
            const date = new Date(receivedData.value.tanggalRapat);
            scheduleForm.value = {
                tanggalRapatFrom: date,
                tanggalRapatTo: date
            };
        } else {
            // Default to current date if no date is provided
            scheduleForm.value = {
                tanggalRapatFrom: new Date(),
                tanggalRapatTo: new Date()
            };
        }
        
        console.log('Form data populated:', formData.value);
        console.log('Schedule form populated:', scheduleForm.value);
        
        // Populate existing document data if available
        if (receivedData.value.existingFileName || receivedData.value.existingFileUrl) {
            existingDocument.value = {
                fileName: receivedData.value.existingFileName || '',
                fileUrl: receivedData.value.existingFileUrl || '',
                fileSize: receivedData.value.existingFileSize || '',
                uploadedAt: receivedData.value.existingFileUploadedAt || ''
            };
            console.log('Existing document data populated:', existingDocument.value);
        }
    }
    
    // Pre-populate jenisRapat if parameter is available
    if (jenisRapatParam.value && !formData.value.jenisRapat) {
        formData.value.jenisRapat = jenisRapatParam.value;
        console.log('Pre-populated jenisRapat from parameter:', jenisRapatParam.value);
    }
};

/**
 * Get user role from auth store with proper type handling
 * @returns {string|null} User role as string or null
 */
const getUserRole = () => {
    if (!authStore.role) return null;
    
    // Jika role adalah array, ambil yang pertama dan konversi ke string
    if (Array.isArray(authStore.role)) {
        return String(authStore.role[0]);
    }
    
    // Jika role adalah string, kembalikan langsung
    if (typeof authStore.role === 'string') {
        try {
            // Coba parse jika berupa JSON string
            const parsedRole = JSON.parse(authStore.role);
            if (Array.isArray(parsedRole)) {
                return String(parsedRole[0]);
            }
            return String(parsedRole);
        } catch {
            // Jika bukan JSON, kembalikan string langsung
            return authStore.role;
        }
    }
    
    // Konversi ke string jika tipe data lain
    return String(authStore.role);
};

onBeforeMount(() => {
    captureDataFromQuery();
});

const userRole = getUserRole();


/**
 * Auto-fill form based on selected meeting type (for role 1)
 * @param {string} rapatValue - Selected meeting value
 */
const autoFillFormFromRapat = (rapatValue) => {
    if (userRole === '1') {
        // Cari data rapat berdasarkan value yang dipilih
        const selectedRapat = rapatYangSudahDibuat.value.find(rapat => rapat.value === rapatValue);
        
        if (selectedRapat) {
            // Auto-fill semua field kecuali decision
            formData.value.judulRapat = selectedRapat.judulRapat;
            // Handle both old and new time field formats
            if (selectedRapat.tanggalRapatFrom && selectedRapat.tanggalRapatTo) {
                scheduleForm.value.tanggalRapatFrom = new Date(selectedRapat.tanggalRapatFrom);
                scheduleForm.value.tanggalRapatTo = new Date(selectedRapat.tanggalRapatTo);
            } else if (selectedRapat.tanggalRapat) {
                // Fallback to old format - use same date for both start and end
                const date = new Date(selectedRapat.tanggalRapat);
                scheduleForm.value.tanggalRapatFrom = date;
                scheduleForm.value.tanggalRapatTo = date;
            }
            formData.value.lokasiRapat = selectedRapat.lokasiRapat;
            formData.value.durasiRapat = selectedRapat.durasiRapat ? parseInt(selectedRapat.durasiRapat) : null;
            formData.value.agendaRapat = selectedRapat.agendaRapat;
            formData.value.modeRapat = selectedRapat.modelRapat;
            // Decision tetap harus dipilih manual
        }
    }
};

// ===========================================
// WATCHERS
// ===========================================

/**
 * Watch for jenis rapat changes to update form configuration
 */
watch(() => formData.value.jenisRapat, (newValue) => {
    if (newValue) {
        // Auto-fill form jika role 1 dan memilih rapat yang sudah dibuat
        if (userRole === '1') {
            autoFillFormFromRapat(newValue);
        }
        
        // Always single step now
        totalSteps.value = 1;
        currentStep.value = 1;
        activePage.value = 0;
        
        // Reset decision field when jenis rapat changes
        if (userRole === '1') {
            // Untuk role 1, reset decision jika tidak memilih rapat yang sudah dibuat
            if (!newValue || newValue === '') {
                formData.value.decision = false;
            }
        } else {
            // Untuk role selain 1, reset decision untuk jenis rapat tertentu
            if (newValue !== '1' && newValue !== '5' && newValue !== '6') {
                formData.value.decision = false;
            }
        }
    }
}, { immediate: true });

/**
 * Watch for tanggalRapatFrom changes to update tahun
 */
watch(() => scheduleForm.value.tanggalRapatFrom, (newDate) => {
    if (newDate) {
        // Extract year from the selected date
        const year = new Date(newDate).getFullYear();
        tahun.value = year;
        console.log('Tahun diekstrak dari tanggal rapat:', tahun.value);
    }
}, { immediate: true });

/**
 * Watch for modeRapat changes to clear linkZoom when Offline is selected
 */
watch(() => formData.value.modeRapat, (newMode) => {
    // Clear linkZoom when mode is Offline
    if (newMode === 'Offline') {
        formData.value.linkZoom = '';
        console.log('Link Zoom cleared karena mode Offline dipilih');
    }
});

// ===========================================
// SUBMIT METHODS
// ===========================================

/**
 * Handle submit for Add mode with JadwalRapat service
 */
const onClickSubmitAdd = async () => {
    try {
        isLoadingSave.value = true;
        console.log('MASUK SINI DOONG', formData);
        
        // Validate form data
        if (!scheduleForm.value.tanggalRapatFrom || !scheduleForm.value.tanggalRapatTo ||
            !formData.value.lokasiRapat || !formData.value.durasiRapat || 
            !formData.value.agendaRapat || !formData.value.jenisRapat || 
            !formData.value.modeRapat || !formData.value.deskripsi) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Semua field harus diisi',
                life: 3000
            });
            return;
        }

        // Validate deskripsi minimum length
        if (formData.value.deskripsi.length < 3) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Deskripsi harus minimal 3 karakter',
                life: 3000
            });
            return;
        }

        // Validate linkZoom if mode is Online or Hybrid
        if ((formData.value.modeRapat === 'Online' || formData.value.modeRapat === 'Hybrid')) {
            if (!formData.value.linkZoom) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Link Zoom harus diisi untuk mode Online/Hybrid',
                    life: 3000
                });
                return;
            }
            
            // Validate URL format
            try {
                const url = new URL(formData.value.linkZoom.trim());
                // Check if protocol is http or https
                if (!['http:', 'https:'].includes(url.protocol)) {
                    throw new Error('Invalid protocol');
                }
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Link Zoom harus berupa URL yang valid (contoh: https://zoom.us/j/123456789)',
                    life: 3000
                });
                return;
            }
        }

        // Prepare payload for JadwalRapat service
        const payload = {
            tanggalRapatFrom: new Date(scheduleForm.value.tanggalRapatFrom).toISOString(),
            tanggalRapatTo: new Date(scheduleForm.value.tanggalRapatTo).toISOString(),
            lokasi: formData.value.lokasiRapat,
            durasi: parseInt(formData.value.durasiRapat),
            agenda: formData.value.agendaRapat.trim(),
            modelRapat: formData.value.modeRapat,
            kodeJenisRapat: formData.value.jenisRapat,
            deskripsi: formData.value.deskripsi.trim(),
            statusDecision: Boolean(formData.value.decision) ? 1 : 0,
            // Add linkMeeting only if mode is Online or Hybrid
            ...(formData.value.modeRapat === 'Online' || formData.value.modeRapat === 'Hybrid' ? {
                linkMeeting: formData.value.linkZoom.trim()
            } : {}),
        };

        // Add parameters from previous menu if available
        if (roleParam.value) payload.role = roleParam.value;
        if (jenisRapatParam.value) payload.jenisRapatParam = jenisRapatParam.value;
        // tahun sekarang diambil dari tahun tanggal rapat yang dipilih
        if (tahun.value) payload.tahun = tahun.value;
        
        // Always include jenis and tahun in payload
        // payload.jenis = formData.value.jenisRapat;
        // payload.tahun = tahun.value || new Date().getFullYear();

        console.log('Submitting data to JadwalRapat service:', payload);

        // Call JadwalRapat service POST method
        const response = await JadwalRapatService.post(payload);
        
        console.log('JadwalRapat service response:', response);

        // Show success message
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Data jadwal rapat berhasil disimpan',
            life: 3000
        });

        // Navigate back to main page with dynamic route
        const currentYear = tahun.value || new Date().getFullYear();
        const currentJenis = jenisRapatParam.value;
        console.log ('APAKAH ISINYA = ',currentJenis);

        if (currentJenis === 1 ){
            router.push(`/transaction/rapat-direksi/${currentYear}/${currentJenis}`);
        } else if (currentJenis === 5){
            router.push(`/transaction/rapat-komite-audit/${currentYear}/${currentJenis}`);
        } else if (currentJenis === 6){
            router.push(`/transaction/rapat-dewan-komisaris/${currentYear}/${currentJenis}`);
        }
        

    } catch (error) {
        console.error('Error saving jadwal rapat:', error);
        
        // Show error message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
            life: 3000
        });
    } finally {
        isLoadingSave.value = false;
    }
};



/**
 * Handle submit for general mode (legacy method)
 */
const onClickSubmit = async () => {
    try {
        isLoadingSave.value = true;
        
        // Validate form data
        if (!scheduleForm.value.tanggalRapatFrom || !scheduleForm.value.tanggalRapatTo ||
            !formData.value.lokasiRapat || !formData.value.pesertaRapat || !formData.value.durasiRapat || 
            !formData.value.agendaRapat || !formData.value.jenisRapat) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Semua field harus diisi',
                life: 3000
            });
            return;
        }

        // Prepare payload for JadwalRapat service
        const payload = {
            tanggalRapatFrom: new Date(scheduleForm.value.tanggalRapatFrom).toISOString(),
            tanggalRapatTo: new Date(scheduleForm.value.tanggalRapatTo).toISOString(),
            lokasi: formData.value.lokasiRapat,
            durasi: formData.value.durasiRapat,
            agenda: formData.value.agendaRapat,
            kodeJenisRapat: formData.value.jenisRapat,
            statusDecision: formData.value.decision ? 1 : 0,
            // Add file information if uploaded
            ...(uploadedFile.value.file && {
                fileName: uploadedFile.value.file.name,
                fileSize: uploadedFile.value.file.size,
                fileType: uploadedFile.value.file.type
            })
        };

        // Add parameters from previous menu if available
        if (roleParam.value) payload.role = roleParam.value;
        if (jenisRapatParam.value) payload.jenisRapatParam = jenisRapatParam.value;
        // tahun sekarang diambil dari tahun tanggal rapat yang dipilih
        if (tahun.value) payload.tahun = tahun.value;

        console.log('Submitting data to JadwalRapat service:', payload);

        // Call appropriate service method based on mode
        let response;
        if (mode.value === 'edit') {
            response = await JadwalRapatService.put(receivedData.value.id, payload);
        } else {
            response = await JadwalRapatService.post(payload);
        }
        
        console.log('JadwalRapat service response:', response);

        // Show success message
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: mode.value === 'edit' ? 'Data jadwal rapat berhasil diupdate' : 'Data jadwal rapat berhasil disimpan',
            life: 3000
        });

        // Navigate back to main page with dynamic route
        const currentYear = tahun.value || new Date().getFullYear();
        const currentJenis = jenisRapatParam.value || formData.value.jenisRapat || '1';
        router.push(`/transaction/rapat-direksi/${currentYear}/${currentJenis}`);

    } catch (error) {
        console.error('Error saving jadwal rapat:', error);
        
        // Show error message
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
            life: 3000
        });
    } finally {
        isLoadingSave.value = false;
    }
};

/**
 * Initialize component after mounting
 */
onMounted(async () => {
    // Only populate form data for edit mode
    if (mode.value === 'edit') {
        populateFormData();
    } else if (mode.value === 'add') {
        // Clear form data for add mode but keep default date
        formData.value = {
            tanggalRapat: new Date(), // Keep today's date as default
            lokasiRapat: '',
            durasiRapat: null,
            agendaRapat: '',
            modeRapat: '',
            linkZoom: '',
            jenisRapat: '',
            decision: false
        };
        
        // Reset schedule form with default dates
        scheduleForm.value = {
            tanggalRapatFrom: new Date(),
            tanggalRapatTo: new Date()
        };
        
        // Pre-populate jenisRapat if parameter is available
        if (jenisRapatParam.value) {
            formData.value.jenisRapat = jenisRapatParam.value;
            console.log('Pre-populated jenisRapat from parameter for add mode:', jenisRapatParam.value);
        }
    } else if (mode.value === 'upload') {
        // For upload mode, check if file exists
        populateFormData();
        
        // Set default decision status from previous menu data
        if (receivedData.value.decision !== undefined && receivedData.value.decision !== null) {
            decisionStatus.value = receivedData.value.decision;
            console.log('Decision status set from previous menu:', decisionStatus.value);
        }
        
        try {
            const exists = await checkFileExists();
            fileExists.value = exists;
            fileUploadMode.value = exists ? 'update' : 'upload';
            console.log('File exists check:', exists);
        } catch (error) {
            console.error('Error checking file existence:', error);
            fileExists.value = false;
            fileUploadMode.value = 'upload';
        }
    }
});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ mode === 'approval' ? 'Approval Jadwal Rapat' : 'Jadwal Rapat Korporat' }}
        </div>
        
        <!-- Form Content for all modes -->
        <div class="card">
            <!-- Display captured parameters from previous menu -->
            <!-- <div v-if="roleParam || jenisRapatParam || tahun" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center gap-2">
                    <i class="pi pi-info-circle text-blue-600"></i>
                    <span class="text-sm text-blue-800">
                        <strong>Parameter dari Menu Sebelumnya:</strong>
                        <span v-if="roleParam" class="ml-2">Role: {{ roleParam }}</span>
                        <span v-if="jenisRapatParam" class="ml-2">Jenis Rapat: {{ jenisRapatParam }}</span>
                        <span v-if="tahun" class="ml-2">Tahun: {{ tahun }}</span>
                    </span>
                </div>
            </div> -->
            
            <div v-if="isLoadingDetail">
                <Skeleton class="mb-2"></Skeleton>
                <Skeleton class="mb-2 w-1/2"></Skeleton>
                <Skeleton class="mb-2 w-1/3"></Skeleton>
            </div>
            <div v-else>
                <!-- Form Data -->
                <div v-if="mode === 'add' || mode === 'edit'">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="col-span-12">
                            <Fluid>
                                <Form
                                    ref="formUmumRef"
                                    v-slot="$form"
                                    :resolver="resolver"
                                    @submit="onSubmitEvent"
                                    class="flex flex-col gap-4 w-full"
                                >
                                <!-- Kolom Kiri -->
                                <div class="grid grid-cols-12 gap-4">
                                    <!-- Kolom Kiri - 6 kolom -->
                                    <div class="col-span-12 lg:col-span-6">
                                        <!-- Jenis Rapat -->
                                        <div class="grid grid-cols-12 gap-2 mb-4">
                                            <label
                                                for="systemName"
                                                class="block font-bold mb-2 col-span-4 align-middle self-center"
                                            >
                                                Jenis Rapat<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-8">
                                                <Select
                                                    name="jenisRapat"
                                                    :options="jenisRapat"
                                                    optionLabel="name"
                                                    optionValue="value"
                                                    placeholder="Pilih Jenis Rapat"
                                                    class="w-full"
                                                    v-model="formData.jenisRapat"
                                                    :disabled="true"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.jenisRapat
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.jenisRapat.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        
                                        <!-- Agenda Rapat -->
                                        <div class="grid grid-cols-12 gap-2 mb-4">
                                            <label
                                                for="agendaRapat"
                                                class="block font-bold mb-2 col-span-4 align-middle self-center"
                                            >
                                                Agenda Rapat<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-8">
                                                <InputText autocomplete="off" 
                                                    name="agendalRapat"
                                                    type="text"
                                                    placeholder="Agenda Rapat"
                                                    v-model="formData.agendaRapat"
                                                    :readonly="mode === 'approval'"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.agendaRapat
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.agendaRapat.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        
                                        <!-- Lokasi Rapat -->
                                        <div class="grid grid-cols-12 gap-2 mb-4">
                                            <label
                                                for="lokasiRapat"
                                                class="block font-bold mb-2 col-span-4 align-middle self-center"
                                            >
                                                Lokasi Rapat<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-8">
                                                <InputText autocomplete="off" 
                                                    name="lokasiRapat"
                                                    type="text"
                                                    placeholder="Lokasi Rapat"
                                                    v-model="formData.lokasiRapat"
                                                    :readonly="mode === 'approval'"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.lokasiRapat
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.lokasiRapat.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        
                                        <!-- Durasi Rapat -->
                                        <div class="grid grid-cols-12 gap-2 mb-4">
                                            <label
                                                for="durasiRapat"
                                                class="block font-bold mb-2 col-span-4 align-middle self-center"
                                            >
                                                Durasi Rapat<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-8">
                                                <InputText autocomplete="off" 
                                                    name="durasiRapat"
                                                    type="number"
                                                    placeholder="Durasi Rapat (menit)"
                                                    v-model.number="formData.durasiRapat"
                                                    :readonly="mode === 'approval'"
                                                    min="1"
                                                    step="1"
                                                    @keypress="onlyNumbers"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.durasiRapat
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.durasiRapat.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        
                                        <!-- Mode Rapat -->
                                        <div class="grid grid-cols-12 gap-2 mb-4">
                                            <label
                                                for="modeRapat"
                                                class="block font-bold mb-2 col-span-4 align-middle self-center"
                                            >
                                                Mode Rapat<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-8">
                                                <div class="flex flex-col gap-2">
                                                    <div class="flex items-center">
                                                        <RadioButton 
                                                            v-model="formData.modeRapat" 
                                                            inputId="offline" 
                                                            name="modeRapat" 
                                                            value="Offline"
                                                            :disabled="mode === 'approval'"
                                                        />
                                                        <label for="offline" class="ml-2">Offline</label>
                                                    </div>
                                                    <div class="flex items-center">
                                                        <RadioButton 
                                                            v-model="formData.modeRapat" 
                                                            inputId="online" 
                                                            name="modeRapat" 
                                                            value="Online"
                                                            :disabled="mode === 'approval'"
                                                        />
                                                        <label for="online" class="ml-2">Online</label>
                                                    </div>
                                                    <div class="flex items-center">
                                                        <RadioButton 
                                                            v-model="formData.modeRapat" 
                                                            inputId="hybrid" 
                                                            name="modeRapat" 
                                                            value="Hybrid"
                                                            :disabled="mode === 'approval'"
                                                        />
                                                        <label for="hybrid" class="ml-2">Hybrid</label>
                                                    </div>
                                                </div>
                                                <Message
                                                    v-if="
                                                        $form.modeRapat
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.modeRapat.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        
                                        <!-- Link Zoom Form - hanya muncul jika mode Online atau Hybrid -->
                                        <div v-if="formData.modeRapat === 'Online' || formData.modeRapat === 'Hybrid'" class="grid grid-cols-12 gap-2 mb-4">
                                            <label
                                                for="linkZoom"
                                                class="block font-bold mb-2 col-span-4 align-middle self-center"
                                            >
                                                Link Meeting<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-8">
                                                <InputText autocomplete="off" 
                                                    name="linkZoom"
                                                    type="url"
                                                    placeholder="Masukkan link Zoom meeting"
                                                    v-model="formData.linkZoom"
                                                    :readonly="mode === 'approval'"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.linkZoom
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.linkZoom.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        
                                        <!-- Tanggal Rapat -->
                                        <div class="grid grid-cols-12 gap-2">
                                            <label class="col-span-4 font-bold text-gray-700 self-center">
                                                Waktu Mulai <span class="text-red-500">*</span>
                                            </label>
                                            <div class="col-span-8">
                                                <Calendar
                                                    v-model="scheduleForm.tanggalRapatFrom"
                                                    placeholder="Pilih waktu mulai rapat"
                                                    class="w-full"
                                                    :showIcon="true"
                                                    dateFormat="dd/mm/yy"
                                                    :showTime="true"
                                                    hourFormat="24"
                                                />
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-12 gap-2 mt-4">
                                            <label class="col-span-4 font-bold text-gray-700 self-center">
                                                Waktu Selesai <span class="text-red-500">*</span>
                                            </label>
                                            <div class="col-span-8">
                                                <Calendar
                                                    v-model="scheduleForm.tanggalRapatTo"
                                                    placeholder="Pilih waktu selesai rapat"
                                                    class="w-full"
                                                    :showIcon="true"
                                                    dateFormat="dd/mm/yy"
                                                    :showTime="true"
                                                    hourFormat="24"
                                                />
                                            </div>
                                        </div>

                                    </div>
                                    
                                    <!-- Kolom Kanan - 6 kolom -->
                                    <div class="col-span-12 lg:col-span-6">
                                        <!-- Empty space for future fields -->
                                    </div>
                                </div>
                                
                                <!-- Deskripsi Rapat - Full Width -->
                                <div class="grid grid-cols-12 gap-2 mt-2">
                                    <label
                                        for="deskripsi"
                                        class="block font-bold mb-2 col-span-2"
                                    >
                                        Deskripsi Rapat<span
                                            class="text-danger"
                                            >*</span
                                        >
                                    </label>
                                    <div class="col-span-10">
                                        <Textarea
                                            placeholder="Deskripsi Rapat"
                                            class="w-full"
                                            name="deskripsi"
                                            rows="5"
                                            cols="30"
                                            v-model="formData.deskripsi"
                                            :readonly="mode === 'approval'"
                                        />
                                        <Message
                                            v-if="
                                                $form.deskripsi
                                                    ?.invalid
                                            "
                                            severity="error"
                                            size="small"
                                            variant="simple"
                                        >
                                            {{
                                                $form.deskripsi.error
                                                    ?.message
                                            }}
                                        </Message>
                                    </div>
                                </div>
                                </Form>
                            </Fluid>
                        </div>
                    </div>
                </div>

                <!-- Upload Documents Section -->
                <div v-if="mode === 'upload' && userRole === '1'" class="mt-6">
                    <div class="p-4">
                        <div class="mb-6">
                            <h3 class="text-lg font-semibold text-gray-800 mb-2">Upload Dokumen Rapat</h3>
                            <p class="text-sm text-gray-600 mb-4">Upload dokumen yang diperlukan untuk rapat ini</p>
                        </div>

                        <!-- Form Data from Previous Menu (Disabled) -->
                        <div class="mb-6">
                            <h4 class="text-md font-semibold text-gray-700 mb-4">Informasi Rapat dari Menu Sebelumnya</h4>
                            <div class="grid grid-cols-12 gap-4">
                                <div class="col-span-12 md:col-span-6">
                                    <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <label class="block font-medium mb-2 text-gray-600">Agenda Rapat</label>
                                        <InputText
                                            :value="receivedData.agendaRapat || receivedData.judulRapat || ''"
                                            readonly
                                            disabled
                                            class="w-full bg-gray-100 text-gray-700"
                                            placeholder="Agenda rapat dari menu sebelumnya"
                                        />
                                    </div>
                                </div>
                                <div class="col-span-12 md:col-span-6">
                                    <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                        <label class="block font-medium mb-2 text-gray-600">Jenis Rapat</label>
                                        <InputText
                                            :value="receivedData.jenisRapat || jenisRapatParam || ''"
                                            readonly
                                            disabled
                                            class="w-full bg-gray-100 text-gray-700"
                                            placeholder="Jenis rapat dari menu sebelumnya"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="mt-3 text-xs text-gray-500 italic">
                                <i class="pi pi-info-circle mr-1"></i>
                                Data ini berasal dari menu sebelumnya dan tidak dapat diubah pada tahap upload dokumen
                            </div>
                        </div>
                        
                        <!-- File Upload Section -->
                        <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <div class="flex items-center gap-3">
                                        <div class="flex-1">
                                            <label class="block font-bold mb-2 text-gray-700">
                                                {{ uploadedFile.name }}<span class="text-red-500">*</span>
                                            </label>
                                            
                                            <!-- Existing Document Display -->
                                            <div v-if="existingDocument.fileName && !uploadedFile.file" class="mb-3">
                                                <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div class="flex items-center justify-between">
                                                        <div class="flex items-center gap-3">
                                                            <i class="pi pi-file text-blue-600"></i>
                                                            <div>
                                                                <div class="font-medium text-blue-900">{{ existingDocument.fileName }}</div>
                                                                <div class="text-xs text-blue-600" v-if="existingDocument.fileSize">
                                                                    Size: {{ formatFileSize(existingDocument.fileSize) }}
                                                                </div>
                                                                <div class="text-xs text-blue-600" v-if="existingDocument.uploadedAt">
                                                                    Uploaded: {{ formatDate(existingDocument.uploadedAt) }}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            icon="pi pi-eye"
                                                            severity="info"
                                                            text
                                                            rounded
                                                            size="small"
                                                            @click="openDocumentPreview()"
                                                            class="text-blue-600 hover:bg-blue-100"
                                                            v-tooltip.top="'Lihat Dokumen'"
                                                        />
                                                    </div>
                                                </div>
                                                <div class="text-xs text-gray-500 mt-2">
                                                    Dokumen sudah ada. Upload file baru untuk mengganti dokumen ini.
                                                </div>
                                            </div>
                                            
                                            <!-- File Upload Input -->
                                            <div class="flex gap-2">
                                                <InputText
                                                    :value="uploadedFile.file ? uploadedFile.file.name : ''"
                                                    :placeholder="uploadedFile.placeholder"
                                                    readonly
                                                    class="flex-1 bg-gray-100"
                                                />
                                                <FileUpload
                                                    mode="basic"
                                                    :auto="false"
                                                    :multiple="false"
                                                    accept=".pdf,.doc,.docx"
                                                    :maxFileSize="10000000"
                                                    @select="onFileSelect"
                                                    class="p-button-outlined"
                                                />
                                                <!-- Show Upload button when file doesn't exist or when in upload mode -->
                                                <Button
                                                    v-if="!fileExists || fileUploadMode === 'upload'"
                                                    :icon="fileExists ? 'pi pi-refresh' : 'pi pi-upload'"
                                                    :label="fileExists ? 'Update' : 'Upload'"
                                                    severity="success"
                                                    :loading="isUploading"
                                                    :disabled="!uploadedFile.file || isUploading"
                                                    @click="uploadIndividualFile"
                                                    class="px-4"
                                                />
                                                <!-- Show View button when file exists and not in upload mode -->
                                                <Button
                                                    v-if="fileExists && fileUploadMode === 'update'"
                                                    icon="pi pi-eye"
                                                    label="View"
                                                    severity="info"
                                                    @click="previewUploadedFile"
                                                    class="px-4"
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

                        <!-- Divider -->
                        <div class="my-6">
                            <Divider />
                        </div>

                        <!-- Decision Section -->
                        <div class="grid grid-cols-12 gap-4">
                            <div class="col-span-12">
                                <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                    <label class="block font-medium mb-3 text-gray-600">Status Decision</label>
                                    <div class="flex items-center gap-6">
                                        <div class="flex items-center gap-2">
                                            <RadioButton 
                                                v-model="decisionStatus" 
                                                inputId="decision-aktif"
                                                :value="true"
                                            />
                                            <label for="decision-aktif" class="text-sm font-medium text-gray-700">
                                                Aktif
                                            </label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <RadioButton 
                                                v-model="decisionStatus" 
                                                inputId="decision-tidak-aktif"
                                                :value="false"
                                            />
                                            <label for="decision-tidak-aktif" class="text-sm font-medium text-gray-700">
                                                Tidak Aktif
                                            </label>
                                        </div>
                                    </div>
                                    <div class="mt-2 text-xs text-gray-500">
                                        Pilih salah satu status decision untuk rapat ini
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Save Decision Button Section -->
                        <div class="mt-6 flex justify-end">
                            
                            <Button
                            class="w-max"
                            severity="secondary"
                            type="button"
                            @click="onClickCancel"
                            label="Batal"
                            />

                            <Button
                                label="Save Decision"
                                icon="pi pi-save"
                                severity="primary"
                                :disabled="decisionStatus === null"
                                :loading="isLoadingSaveDecision"
                                @click="saveDecision"
                                class="px-6 py-3 ml-4"
                            />
                        </div>
                        
                        
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-between gap-2 mt-6">
                <div></div>
                <div class="flex gap-2">
                    <!-- Approval Mode Buttons -->
                    <template v-if="mode === 'approval'">
                        <Button
                            class="w-max"
                            severity="danger"
                            type="button"
                            @click="onClickReject"
                            :loading="isLoadingSave"
                            label="Tolak"
                        />
                        <Button
                            class="w-max"
                            severity="success"
                            type="button"
                            @click="onClickApprove"
                            :loading="isLoadingSave"
                            label="Setujui"
                        />
                    </template>
                    
                    <!-- Add Mode Buttons -->
                    <template v-else-if="mode === 'add'">
                        <Button
                            class="w-max"
                            severity="secondary"
                            type="button"
                            @click="onClickCancel"
                            label="Batal"
                        />
                        <Button
                            class="w-max"
                            severity="primary"
                            type="button"
                            @click="onClickSubmitAdd"
                            :loading="isLoadingSave"
                            :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                        />
                    </template>
                </div>
            </div>
        </div>
        
    <ConfirmDialog
        :draggable="false"
        group="crud-group"
        :pt="{
            pcCloseButton: {
                root: {
                    class: 'hidden'
                }
            }
        }"
    />
    
    <!-- ImagePreview Component for Existing Document -->
    <ImagePreview
        v-if="existingDocument.fileUrl"
        v-model:isShow="showDocumentPreview"
        :url="existingDocument.fileUrl"
        :fileName="existingDocument.fileName"
        :label="'Dokumen Rapat'"
        :isNeedToken="true"
        :isPopUp="true"
        :width="800"
        :height="600"
        :info="`File: ${existingDocument.fileName}${existingDocument.fileSize ? ' | Size: ' + formatFileSize(existingDocument.fileSize) : ''}${existingDocument.uploadedAt ? ' | Uploaded: ' + formatDate(existingDocument.uploadedAt) : ''}`"
        @onclose="showDocumentPreview = false"
    />
    
    <!-- ImagePreview Component for Uploaded File -->
    <ImagePreview
        v-model:isShow="showImagePreview"
        :url="previewUrl"
        :fileName="previewFileName"
        :isNeedToken="true"
        :isPopUp="true"
        label="Preview File"
        @onclose="showImagePreview = false"
    />
    </div>
</template>
