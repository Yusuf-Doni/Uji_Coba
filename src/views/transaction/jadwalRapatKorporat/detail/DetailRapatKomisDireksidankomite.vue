<script setup>
/**
 * DetailRapatKomisDireksidankomite.vue
 * 
 * Component untuk menampilkan detail rapat komisaris, direksi, dan komite.
 * Menyediakan fungsi untuk melihat, mengedit, dan mengelola data rapat korporat.
 * 
 * Features:
 * - Menampilkan informasi rapat dari menu sebelumnya
 * - Data table dengan pagination dan search
 * - File management untuk dokumen kajian
 * - Role-based access control
 * - Form validation dengan Yup
 */

// Vue imports
import { onBeforeMount, onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// PrimeVue imports
import { useConfirm, useToast } from 'primevue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import ConfirmDialog from 'primevue/confirmdialog';

// External libraries
import { object, string } from 'yup';
import { yupResolver } from '@primevue/forms/resolvers/yup';

// Local imports
import RoleService from '@/service/RoleService';
import IParams from '@/interface/IParams';
import { useAuth } from '@/stores/authStore';
import DetailRapatKomisDireksidankomiteService from './service/DetailRapatKomisDireksidankomite';

// ===== COMPOSABLES =====
const confirmSave = useConfirm();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuth();

// ===== LOADING STATES =====
const isLoadingDetail = ref(false);
const isLoadingSave = ref(false);
const isLoadingApprove = ref(false);
const isLoadingReject = ref(false);
const loading = ref(false);
const isLoading = ref(false);

// ===== FORM REFERENCES =====
const formUmumRef = ref();

// ===== ROUTE PARAMETER REFERENCES =====
const tahunParam = ref(null);
const jenisRapatParam = ref(null);
const actionMenuItems = ref([]);

// ===== COMPUTED PROPERTIES =====
const canViewDataTable1 = computed(() => authStore.role === '1');
const canViewDataTable2 = computed(() => authStore.role === '2');
const canAddKajianRapat = computed(() => {
    // Hide button when statusDecision is 2, regardless of role
    if (String(meetingData.value.statusDecision) === '2' || '') {
        return false;
    }
    return authStore.role === '1';
});
const canUploadFormReview = computed(() => {
    // Hide button when statusDecision is 2, regardless of role
    if (String(meetingData.value.statusDecision) === '2') {
        return false;
    }
    return authStore.role === '1';
});

// Check if any of the approve flags is 1 to show upload button
const hasAnyApprovalFlag = computed(() => {
    return flagapprove.value.approveSekper === 1 || 
           flagapprove.value.approveTl === 1 || 
           flagapprove.value.approveLegal === 1 || 
           flagapprove.value.approveRisiko === 1 || 
           flagapprove.value.approveKepatuhan === 1;
});

const Role1 = authStore.role;


// ===== DATA STATE =====
// Query parameters from previous menu
const queryParams = ref({
    id: '',
    judulRapat: '',
    tanggal: '',
    durasi: '',
    lokasi: '',
    peserta: '',
    agenda: '',
    status: '',
    mode: ''
});

// Route parameters from previous menu
const routeParams = ref({
    Id: '',
    TanggalRapat: '',
    Agenda: '',
    JenisRapat: '',
    jenisRapatParam: ''
});

// Meeting data from previous menu
const meetingData = ref({
    id: null,
    agenda: '',
    tanggalRapat: '',
    jenisRapat: '',
    lokasi: '',
    durasi: '',
    deskripsi: '',
    statusDecision: '',
    modelRapat: '',
    peserta: [],
    // Approval status fields from API
    approveSekper: 0,
    approveTl: 0,
    approveLegal: 0,
    approveRisiko: 0,
    approveKepatuhan: 0
});

// Flag approval data
const flagapprove = ref({
    approveSekper: 0,
    approveTl: 0,
    approveLegal: 0,
    approveRisiko: 0,
    approveKepatuhan: 0
});

// ===== FILE MANAGEMENT =====
const fileTypeOptions = ref([
    { name: 'KKO', value: 'kajian_kKO' },
    { name: 'KKF', value: 'kajian_kKF' },
    { name: 'KR', value: 'kajian_kR' },
    { name: 'FRA', value: 'kajian_fRA' },
    { name: 'Pakta Integritas', value: 'kajian_paktaIntegritas' }
]);
const selectedFileType = ref('');
const uploadedFiles = ref([]);

// ===== UI STATE =====
const activeTab = ref(0);

// ===== TABLE DATA =====
const datas = ref([]);
const allData = ref([]);
const dataRoles = ref();
const search = ref(null);
const param = ref({ ...IParams });
const totalRecords = ref(0);
const selectedPICs = ref({});

// ===== FORM VALIDATION =====
const resolver = yupResolver(
    object().shape({
        judulKepdir: string().required('Judul Kepdir Sirkuler harus diisi'),
        tanggalTerbit: string().required('Tanggal Terbit Kepdir Sirkuler harus diisi')
    })
);

// ===== API FUNCTIONS =====
/**
 * Mengambil data dari API berdasarkan parameter route
 * Memvalidasi autentikasi sebelum melakukan panggilan API
 */
async function getDataFromAPI() {
    loading.value = true;
    
    try {
        // Validate authentication before making API call
        if (!validateAuthentication()) {
            return;
        }

        console.log('Making API call with parameters:', {
            id: routeParams.value.Id,
            agenda: routeParams.value.Agenda,
            token: authStore.token ? 'Present' : 'Missing'
        });

        // Validate that we have a valid ID
        if (!routeParams.value.Id || routeParams.value.Id === '') {
            console.error('No valid ID found for API call');
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'ID tidak valid untuk mengambil data detail rapat',
                life: 5000
            });
            return;
        }

        const queryParams = {
            idJadwalRapat: routeParams.value.Id || '',
            agenda: routeParams.value.Agenda || '',
        };

        // Remove undefined values
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        const response = await DetailRapatKomisDireksidankomiteService.get(routeParams.value.Id, queryParams);

        // console.log('Full API Response:', response);
        // console.log('Response data:', response.data);
        // console.log('Response status:', response.status);

        if (response.data && (response.data.code === 200 || response.data.success === true)) {
            // Ensure we always have an array
            const responseData = response.data.data;
            console.log('API Response Data:', responseData);
            
            if (Array.isArray(responseData)) {
                allData.value = responseData;
            } else if (responseData && typeof responseData === 'object') {
                // If it's an object, wrap it in an array
                allData.value = [responseData];
            } else {
                allData.value = [];
            }
            
            console.log('Processed allData:', allData.value);
        } else {
            // console.log('API Response not successful:', response.data);
            // console.log('Response code:', response.data?.code);
            // console.log('Response success:', response.data?.success);
            allData.value = [];
        }
        
        applyFiltersAndPagination();
    } catch (error) {
        handleApiError(error, 'Gagal memuat data jadwal rapat');
        allData.value = [];
        datas.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
}

// ===== FILE MANAGEMENT FUNCTIONS =====
/**
 * Menambahkan tipe file baru ke daftar file yang diupload
 */
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

/**
 * Menghapus file dari daftar berdasarkan index
 */
const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1);
};

/**
 * Handler untuk pemilihan file
 */
const onFileSelect = (event, index) => {
    const file = event.files[0];
    if (file) {
        uploadedFiles.value[index].file = file;
    }
};

/**
 * Mendapatkan placeholder text berdasarkan tipe file
 */
const getPlaceholder = (type) => {
    const placeholders = {
        'kajian_kKO': 'KKO',
        'kajian_kKF': 'KKF',
        'kajian_kR': 'KR',
        'kajian_fRA': 'FRA',
        'kajian_paktaIntegritas': 'Pakta Integritas'
    };
    return placeholders[type] || 'File';
};


/**
 * Membuka file dokumen untuk dilihat
 */
const viewDocumentFile = (file, index) => {
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

// ===== UTILITY FUNCTIONS =====
/**
 * Helper function untuk validasi autentikasi user
 * @returns {boolean} true jika user terautentikasi, false jika tidak
 */
const validateAuthentication = () => {
    if (!authStore.token || !authStore.isLoggedIn) {
        console.error('No authentication token found or user not logged in');
        console.error('Auth state:', {
            hasToken: !!authStore.token,
            isLoggedIn: authStore.isLoggedIn,
            tokenPreview: authStore.token ? authStore.token.substring(0, 10) + '...' : 'No token'
        });
        toast.add({
            severity: 'error',
            summary: 'Authentication Error',
            detail: 'Sesi Anda telah berakhir. Silakan login kembali.',
            life: 5000
        });
        router.push('/auth/login');
        return false;
    }
    return true;
};

/**
 * Helper function untuk menangani error dari API
 * @param {Error} error - Error object dari API call
 * @param {string} defaultMessage - Pesan error default
 */
const handleApiError = (error, defaultMessage = 'Gagal memuat data') => {
    console.error('API Error:', error);
    
    let errorMessage = 'Error';
    let errorDetail = defaultMessage;
    
    if (error.response?.status === 401) {
        errorMessage = 'Authentication Error';
        errorDetail = 'Sesi Anda telah berakhir. Silakan login kembali.';
    } else if (error.response?.status === 404) {
        errorMessage = 'Data Tidak Ditemukan';
        errorDetail = 'Data yang diminta tidak dapat ditemukan.';
    } else if (error.response?.data?.message) {
        errorDetail = error.response.data.message;
    } else if (error.message) {
        errorDetail = error.message;
    }
    
    toast.add({
        severity: 'error',
        summary: errorMessage,
        detail: errorDetail,
        life: 5000
    });
};

/**
 * Parse parameter dari route dan query untuk mendapatkan data dari menu sebelumnya
 */
const parseQueryParams = () => {
    // Parse route parameters from previous menu
    routeParams.value = {
        Id: route.params.id || route.query.Id || '',
        TanggalRapat: route.query.TanggalRapat || '',
        Agenda: route.query.Agenda || '',
        JenisRapat: route.query.JenisRapat || '',
        jenisRapatParam: route.query.jenisRapatParam || ''
    };

    // Set jenisRapatParam ke ref variable
    jenisRapatParam.value = route.query.jenisRapatParam || '';

    // Parse query parameters
    queryParams.value = {
        id: route.query.id || routeParams.value.Id || '',
        judulRapat: route.query.judulRapat || routeParams.value.Agenda || '',
        tanggal: route.query.tanggal || routeParams.value.TanggalRapat || '',
        durasi: route.query.durasi || '',
        lokasi: route.query.lokasi || '',
        peserta: route.query.peserta || '',
        agenda: route.query.agenda || routeParams.value.Agenda || '',
        status: route.query.status || '',
        JenisRapatId: route.query.jenisRapatParam || '',
        mode: route.query.mode || ''
    };
    
    if (queryParams.value.tanggal && queryParams.value.tanggal.includes(' ')) {
        queryParams.value.tanggal = queryParams.value.tanggal.split(' ')[0];
    }
    
    console.log('Route Parameters:', routeParams.value);
    console.log('Query Parameters:', queryParams.value);
    console.log('jenisRapatParam:', jenisRapatParam.value);
    // console.log('Route params.id:', route.params.id);
    // console.log('Route query.Id:', route.query.Id);
    // console.log('Final routeParams.value.Id:', routeParams.value.Id);
};

const id = route.params.id;

/**
 * Mengambil data detail rapat dari menu sebelumnya berdasarkan ID
 */
const fetchMeetingData = async () => {
    if (routeParams.value.Id) {
        try {
            isLoadingDetail.value = true;
            const response = await DetailRapatKomisDireksidankomiteService.getById(routeParams.value.Id);
            
            if (response.data && response.data.code === 200) {
                const apiData = response.data.data;
                console.log('Meeting Data from API:', apiData);
                
                meetingData.value = {
                    id: apiData.id || apiData.jadwalRapatId,
                    agenda: apiData.agenda || routeParams.value.Agenda,
                    tanggalRapat: apiData.tanggalRapat || routeParams.value.TanggalRapat,
                    jenisRapat: apiData.jenisRapat || routeParams.value.JenisRapat,
                    lokasi: apiData.lokasi || '',
                    durasi: apiData.durasi || '',
                    deskripsi: apiData.deskripsi || '',
                    statusDecision: apiData.statusDecision || '',
                    modelRapat: apiData.modelRapat || '',
                    peserta: apiData.peserta || [],
                    // Approval status from API
                    approveSekper: apiData.approveSekper ,
                    approveTl: apiData.approveTl ,
                    approveLegal: apiData.approveLegal ,
                    approveRisiko: apiData.approveRisiko ,
                    approveKepatuhan: apiData.approveKepatuhan 
                };
                
                console.log('Processed Meeting Data:', meetingData.value);
                
                // Update queryParams with fetched data
                queryParams.value = {
                    ...queryParams.value,
                    judulRapat: meetingData.value.agenda,
                    tanggal: meetingData.value.tanggalRapat,
                    durasi: meetingData.value.durasi,
                    lokasi: meetingData.value.lokasi,
                    agenda: meetingData.value.agenda,
                    status: meetingData.value.statusDecision
                };
                
                console.log('Meeting Data Fetched:', meetingData.value);
            }
        } catch (error) {
            handleApiError(error, 'Gagal mengambil data rapat');
        } finally {
            isLoadingDetail.value = false;
        }
    }
};

const fetchFlagApprove = async () => {
    if (routeParams.value.Id) {
        try {
            isLoadingDetail.value = true;
            const response = await DetailRapatKomisDireksidankomiteService.getByIdFlagApprove(routeParams.value.Id);
            
            if (response.data && response.data.code === 200) {
                const flag = response.data.data;
                console.log('Meeting Data from API:', flag);
                
                flagapprove.value = {
                    approveSekper: flag.approveSekper ,
                    approveTl: flag.approveTl ,
                    approveLegal: flag.approveLegal ,
                    approveRisiko: flag.approveRisiko ,
                    approveKepatuhan: flag.approveKepatuhan 
                };
                
                console.log('Processed flagapprove:', flagapprove.value);
                
                // Update queryParams with fetched data
                queryParams.value = {
                    ...queryParams.value,
                    judulRapat: meetingData.value.agenda,
                    tanggal: meetingData.value.tanggalRapat,
                    durasi: meetingData.value.durasi,
                    lokasi: meetingData.value.lokasi,
                    agenda: meetingData.value.agenda,
                    status: meetingData.value.statusDecision,
                    approveSekper: flagapprove.value.approveSekper ,
                    approveTl: flagapprove.value.approveTl ,
                    approveLegal: flagapprove.value.approveLegal ,
                    approveRisiko: flagapprove.value.approveRisiko ,
                    approveKepatuhan: flagapprove.value.approveKepatuhan 
                };
                
                console.log('Meeting Data Fetched:', flagapprove.value);
            }
        } catch (error) {
            handleApiError(error, 'Gagal mengambil data rapat');
        } finally {
            isLoadingDetail.value = false;
        }
    }
};





// ===== FORM SUBMISSION HANDLERS =====
const onClickSubmit = () => {
    formUmumRef.value.onSubmit();
};

const onClickApprove = () => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menyetujui data ini?',
        closeable: false,
        header: 'Konfirmasi Approve',
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
            approveData();
        }
    });
};

const onClickReject = () => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menolak data ini?',
        closeable: false,
        header: 'Konfirmasi Reject',
        acceptLabel: 'Ya',
        rejectLabel: 'Tidak',
        acceptClass: 'order-2',
        rejectClass: 'order-1',
        rejectProps: {
            severity: 'danger'
        },
        acceptProps: {
            severity: 'danger'
        },
        accept: () => {
            rejectData();
        }
    });
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

// ===== API SERVICE FUNCTIONS =====
const saveInputToService = async (data) => {
    const payload = {
        id: queryParams.value.id || meetingData.value.id || null,
        judulKepdir: data.judulKepdir,
        tanggalTerbit: data.tanggalTerbit,
        // Data from previous menu
        meetingId: meetingData.value.id,
        agenda: meetingData.value.agenda,
        tanggalRapat: meetingData.value.tanggalRapat,
        jenisRapat: meetingData.value.jenisRapat,
        lokasi: meetingData.value.lokasi,
        durasi: meetingData.value.durasi,
        deskripsi: meetingData.value.deskripsi,
        statusDecision: meetingData.value.statusDecision,
        modelRapat: meetingData.value.modelRapat,
        peserta: meetingData.value.peserta,
        // Legacy query params for backward compatibility
        judulRapat: queryParams.value.judulRapat,
        tanggal: queryParams.value.tanggal,
        peserta: queryParams.value.peserta,
        status: queryParams.value.status,
        mode: queryParams.value.mode,
        files: uploadedFiles.value.map(file => ({
            type: file.type,
            name: file.name,
            file: file.file
        }))
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
    const payload = {
        id: queryParams.value.id || null,
        action: 'approve',
        mode: queryParams.value.mode
    };

    isLoadingApprove.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data berhasil disetujui',
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
            isLoadingApprove.value = false;
        });
};

const rejectData = async () => {
    const payload = {
        id: queryParams.value.id || null,
        action: 'reject',
        mode: queryParams.value.mode
    };

    isLoadingReject.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data berhasil ditolak',
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
            isLoadingReject.value = false;
        });
};

const applyFiltersAndPagination = () => {
    // Ensure allData.value is always an array
    const dataArray = Array.isArray(allData.value) ? allData.value : [];
    let filteredData = [...dataArray];
    
    // console.log('applyFiltersAndPagination - allData:', allData.value);
    // console.log('applyFiltersAndPagination - dataArray:', dataArray);
    // console.log('applyFiltersAndPagination - search.value:', search.value);
    // console.log('applyFiltersAndPagination - param.value:', param.value);
    
    // Apply search filter
    if (search.value && search.value.trim()) {
        const searchTerm = search.value.toLowerCase();
        filteredData = filteredData.filter(item => 
            (item.agenda && item.agenda.toLowerCase().includes(searchTerm)) ||
            (item.id && item.id.toString().toLowerCase().includes(searchTerm)) ||
            (item.jadwalRapatId && item.jadwalRapatId.toString().toLowerCase().includes(searchTerm)) ||
            (item.tanggalRapat && item.tanggalRapat.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply pagination
    const startIndex = (param.value.page || 0) * (param.value.size || 10);
    const endIndex = startIndex + (param.value.size || 10);
    
    datas.value = filteredData.slice(startIndex, endIndex);
    totalRecords.value = filteredData.length;
    
    // console.log('applyFiltersAndPagination - filteredData:', filteredData);
    // console.log('applyFiltersAndPagination - datas.value:', datas.value);
    // console.log('applyFiltersAndPagination - totalRecords:', totalRecords.value);   
};
const getDataTable = () => {
    loading.value = true;
    param.value.search = search.value;
    
    // console.log('getDataTable called with search:', search.value);
    // console.log('getDataTable - allData before filter:', allData.value);
    
    // Apply filters and pagination to existing data
    applyFiltersAndPagination();
    
    loading.value = false;
};



function onClickEditTable(data) {
    console.log('onClickEditTable called with data:', data);
    
    // Validate that we have a valid ID from the data
    if (!data?.id || data.id === '') {
        console.error('No valid ID found in data for Edit navigation');
        toast.add({
            severity: 'error',
            summary: 'Navigation Error',
            detail: 'ID tidak valid. Tidak dapat melakukan navigasi Edit.',
            life: 5000
        });
        return;
    }
    
    const navigationParams = {
        id: data.id,
        judulRapat: data.name || '',
        tanggal: data.description || '',
        durasi: '2 jam',
        lokasi: 'Meeting Room',
        peserta: 'Peserta A, Peserta B',
        agenda: data.description || '',
        status: data.displayName || 'draft',
        mode: 'edit' 
    };
    
    console.log('Edit Navigation parameters:', navigationParams);
    
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/DetailDireksi',
        query: navigationParams
    }).then(result => {
        console.log('Edit Router push result:', result);
        if (result && result.type === 'abort') {
            console.error('Edit Navigation was aborted:', result);
            toast.add({
                severity: 'error',
                summary: 'Navigation Error',
                detail: 'Navigasi Edit dibatalkan. Periksa parameter yang dikirim.',
                life: 5000
            });
        }
    }).catch(error => {
        console.error('Edit Navigation error:', error);
        toast.add({
            severity: 'error',
            summary: 'Navigation Error',
            detail: 'Terjadi kesalahan saat navigasi edit.',
            life: 5000
        });
    });
}

function onClickDeleteTable(data) {
    dataRoles.value = data;
    openDialogDeleteTable();
}

function onClickApprovalPICTable(data) {
    console.log('onClickApprovalPICTable called with data:', data);
    
    // Validate that we have a valid ID from the data
    if (!data?.id || data.id === '') {
        console.error('No valid ID found in data for ApprovalPIC navigation');
        toast.add({
            severity: 'error',
            summary: 'Navigation Error',
            detail: 'ID tidak valid. Tidak dapat melakukan navigasi ApprovalPIC.',
            life: 5000
        });
        return;
    }
    
    const navigationParams = {
        id: data.id,
        judulKepdir: data.name || '',
        status: data.displayName || '',
        lastModified: data.description || '',
        mode: 'pic',
        agenda: meetingData.value.agenda || queryParams.value.agenda,
        tanggal: meetingData.value.tanggalRapat || queryParams.value.tanggal,
        modelRapat: meetingData.value.modelRapat || queryParams.value.modelRapat,
        JenisRapatId: jenisRapatParam.value,
        durasi: meetingData.value.durasi || queryParams.value.durasi,
        peserta: meetingData.value.peserta || queryParams.value.peserta,
        status: queryParams.value.status || meetingData.value.statusDecision,
        approveSekper: meetingData.value.approveSekper || queryParams.value.approveSekper,
        approveTl: meetingData.value.approveTl || queryParams.value.approveTl,
        approveLegal: meetingData.value.approveLegal || queryParams.value.approveLegal,
        approveRisiko: meetingData.value.approveRisiko || queryParams.value.approveRisiko,
        approveKepatuhan: meetingData.value.approveKepatuhan || queryParams.value.approveKepatuhan
    };
    
    console.log('ApprovalPIC Navigation parameters:', navigationParams);
    
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add/detail-direksi',
        query: navigationParams
    }).then(result => {
        console.log('ApprovalPIC Router push result:', result);
        if (result && result.type === 'abort') {
            console.error('ApprovalPIC Navigation was aborted:', result);
            toast.add({
                severity: 'error',
                summary: 'Navigation Error',
                detail: 'Navigasi ApprovalPIC dibatalkan. Periksa parameter yang dikirim.',
                life: 5000
            });
        }
    }).catch(error => {
        console.error('ApprovalPIC Navigation error:', error);
        toast.add({
            severity: 'error',
            summary: 'Navigation Error',
            detail: 'Terjadi kesalahan saat navigasi.',
            life: 5000
        });
    });
}

async function onClickDetailTable(data) {
    if (!validateAuthentication()) {
        return;
    }

    try {
        await authStore.validateToken();
        
        const actualId = data?.id || routeParams.value.Id || meetingData.value.id || queryParams.value.id;
        
        const navigationParams = {
            id: actualId,
            agenda: routeParams.value.Agenda || meetingData.value.agenda || queryParams.value.agenda,
            jenisRapat: routeParams.value.JenisRapat || meetingData.value.jenisRapat,
            JenisRapatId: jenisRapatParam.value,
            status: queryParams.value.status || meetingData.value.statusDecision,
            mode: 'approval',
            role: Role1,
            tanggal: routeParams.value.TanggalRapat || meetingData.value.tanggalRapat || queryParams.value.tanggal,
            lokasi: meetingData.value.lokasi || queryParams.value.lokasi,
            durasi: meetingData.value.durasi || queryParams.value.durasi,
            peserta: meetingData.value.peserta || queryParams.value.peserta,
            approveSekper: meetingData.value.approveSekper || queryParams.value.approveSekper,
            approveTl: meetingData.value.approveTl || queryParams.value.approveTl,
            approveLegal: meetingData.value.approveLegal || queryParams.value.approveLegal,
            approveRisiko: meetingData.value.approveRisiko || queryParams.value.approveRisiko,
            approveKepatuhan: meetingData.value.approveKepatuhan || queryParams.value.approveKepatuhan
        };
        
        // Validate that we have a valid ID before navigation
        if (!actualId || actualId === '') {
            console.error('No valid ID found for navigation');
            toast.add({
                severity: 'error',
                summary: 'Navigation Error',
                detail: 'ID tidak valid. Tidak dapat melakukan navigasi.',
                life: 5000
            });
            return;
        }
        
        const navigationResult = await router.push({
            path: '/transaction/jadwal-rapat-korporat/detail/add/detail-direksi',
            query: navigationParams
        });
        
        console.log('Router push result:', navigationResult);
        
        if (navigationResult && navigationResult.type === 'abort') {
            console.error('Navigation was aborted:', navigationResult);
            toast.add({
                severity: 'error',
                summary: 'Navigation Error',
                detail: 'Navigasi dibatalkan. Periksa parameter yang dikirim.',
                life: 5000
            });
        }
        
    } catch (error) {
        console.error('Token validation failed:', error);
        toast.add({
            severity: 'error',
            summary: 'Authentication Error',
            detail: 'Token tidak valid. Silakan login kembali.',
            life: 5000
        });
        authStore.removeCredentials();
        router.push('/auth/login');
    }
}

const status = computed(() => {
    status.value = queryParams.value.status || meetingData.value.statusDecision;
    if(queryParams.value.status === '0' || meetingData.value.statusDecision === '0') {
        return 'Belum di putuskan';
    } else if(queryParams.value.status === '1' || meetingData.value.statusDecision === '1') {
        return 'Ya';
    } else if(queryParams.value.status === '2' || meetingData.value.statusDecision === '2') {
        return 'Tidak';
    }
});

function viewDocumentInDialog(doc) {
    toast.add({
        severity: 'info',
        summary: 'View Document',
        detail: `Opening ${doc.nama}`,
        life: 3000
    });
    // Here you can implement actual document viewing logic
}

function onClickUploadFormReviewGovernanceTable(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add/detail-direksi',
        query: {
            id: data.id,
            judulKepdir: data.name || '',
            status: data.displayName || '',
            lastModified: data.description || '',
            JenisRapatId: jenisRapatParam.value,
            flagapprove: 'done',
            mode: 'upload',
            role: Role1,
            agenda: meetingData.value.agenda || queryParams.value.agenda,
            tanggal: meetingData.value.tanggalRapat || queryParams.value.tanggal,
            lokasi: meetingData.value.lokasi || queryParams.value.lokasi,
            durasi: meetingData.value.durasi || queryParams.value.durasi,
            peserta: meetingData.value.peserta || queryParams.value.peserta
        }
    });
}

function onClickRejectTable(data) {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menolak data ini?',
        closeable: false,
        header: 'Konfirmasi Reject',
        acceptLabel: 'Ya',
        rejectLabel: 'Tidak',
        acceptClass: 'order-2',
        rejectClass: 'order-1',
        rejectProps: {
            severity: 'danger'
        },
        acceptProps: {
            severity: 'danger'
        },
        accept: () => {
            rejectDataTable(data);
        }
    });
}

const rejectDataTable = async (data) => {
    const payload = {
        id: data.id || null,
        action: 'reject',
        mode: 'table'
    };

    isLoadingReject.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data berhasil ditolak',
                    life: 3000
                });
                getDataTable(); // Refresh table data
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
            isLoadingReject.value = false;
        });
};

const openDialogDeleteTable = () => {
    confirmSave.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi'
    });
};

function deleteDataTable(accept) {
    isLoading.value = true;
    RoleService.delete(dataRoles.value.id)
        .then((response) => {
            isLoading.value = false;
            accept();
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                getDataTable();
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
            isLoading.value = false;
            accept();
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        });
}

// ===== TABLE EVENT HANDLERS =====
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    applyFiltersAndPagination();
};

const viewDocument = (file) => {
    toast.add({
        severity: 'info',
        summary: 'View Document',
        detail: `Opening ${file.nama_file}`,
        life: 3000
    });
};

const onClickPilihPicTable = (data) => {
    toast.add({
        severity: 'info',
        summary: 'Pilih PIC',
        detail: `Memilih PIC untuk ${data.name}`,
        life: 3000
    });
};

const saveSelectedPIC = async (data, selectedUser) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `PIC ${selectedUser.name} berhasil disimpan untuk ${data.name}`,
            life: 3000
        });
        
        selectedPICs.value[data.id] = selectedUser;
        
        console.log('Saved PIC:', {
            meetingId: data.id,
            meetingName: data.name,
            picId: selectedUser.id,
            picName: selectedUser.name
        });
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menyimpan PIC',
            life: 3000
        });
    }
};

/**
 * Mendapatkan action menu items berdasarkan role dan status
 */
const getActionMenuItems = () => {
    const items = [];
    
    // Add menu items based on role and status
    if (authStore.role === '1') {
        items.push({
            label: 'View Detail',
            icon: 'pi pi-eye',
            command: () => {
                console.log('View Detail clicked');
            }
        });
    }
    
    if (authStore.role === '2') {
        items.push({
            label: 'Approve & Add PIC',
            icon: 'pi pi-user-plus',
            command: () => {
                console.log('Approve & Add PIC clicked');
            }
        });
    }
    
    return items;
};

// ===== LIFECYCLE HOOKS =====
onBeforeMount(() => {
    uploadedFiles.value = [
        { type: 'kajian_kKO', name: 'KKO', file: null, placeholder: 'KKO' },
        { type: 'kajian_kKF', name: 'KKF', file: null, placeholder: 'KKF' },
        { type: 'kajian_kR', name: 'KR', file: null, placeholder: 'KR' },
        { type: 'kajian_fRA', name: 'FRA', file: null, placeholder: 'FRA' },
        { type: 'kajian_paktaIntegritas', name: 'Pakta Integritas', file: null, placeholder: 'Pakta Integritas' }
    ];
});

onMounted(async () => {
    // Debug authentication state on mount
    const authStore = useAuth();
    console.log('Component mounted - Authentication state:', {
        hasToken: !!authStore.token,
        isLoggedIn: authStore.isLoggedIn,
        tokenPreview: authStore.token ? authStore.token.substring(0, 10) + '...' : 'No token',
        userRole: authStore.role,
        userId: authStore.userId
    });
    
    
    // Initialize action menu items after all functions are defined
    actionMenuItems.value = getActionMenuItems();

    
    parseQueryParams(); 
    // console.log('parseQueryParams completed');
    
    await fetchMeetingData();
    // console.log('fetchMeetingData completed');
    
    await fetchFlagApprove();
    // console.log('fetchFlagApprove completed');

    await getDataFromAPI();
    // console.log('getDataFromAPI completed');
    
    console.log('Component mounted - Final state:', {
        allData: allData.value,
        datas: datas.value,
        totalRecords: totalRecords.value,
        loading: loading.value
    });
});
</script>
<template>
    <div class="p-4">
        <!-- Page Header -->
        <div class="flex items-center gap-4 mb-6">
            <div class="font-semibold text-xl text-gray-800">
                {{ queryParams.mode === 'edit' ? 'Edit Kepdir Sirkuler' : 
                   queryParams.mode === 'detail' ? 'Detail Kepdir Sirkuler' : 
                   queryParams.mode === 'Approval' ? 'Approve Kepdir Sirkuler' : 
                   'Input Kajian Rapat' }}
            </div>
        </div>
        <!-- Main Content Tabs -->
        <TabView v-model:activeIndex="activeTab" class="mb-4">
            <TabPanel header="Data Table">
                <DataTable
                    :value="datas"
                    :paginator="true"
                    scrollable
                    scrollHeight="400px"
                    :rows="param.size || 10"
                    :rowsPerPageOptions="[5, 10, 20, 50]"
                    dataKey="id"
                    :rowHover="true"
                    :loading="loading"
                    :totalRecords="totalRecords"
                    :lazy="false"
                    @page="onPage($event)"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    currentPageReportTemplate="showing {first} to {last} of {totalRecords}"
                >
                    <template #header>
                        <div class="flex justify-between gap-2">
                            <div class="flex items-center w-full">
                                <InputText 
                                    autocomplete="off" 
                                    v-model="search"
                                    @change="getDataTable()"
                                    placeholder="Search"
                                    class="h-8 px-3"
                                    style="width: 200px;"
                                />
                                <Button
                                    v-if="canAddKajianRapat"
                                    icon="pi pi-plus"
                                    severity="primary"
                                    variant="outlined"
                                    label="Add Kajian Rapat"
                                    as="router-link"
                                    :to="{
                                        path: '/transaction/jadwal-rapat-korporat/detail/add/detail-direksi',
                                        query: {
                                            mode: 'add',
                                            id: routeParams.Id || meetingData.id || queryParams.id,
                                            agenda: routeParams.Agenda || meetingData.agenda || queryParams.agenda,
                                            jenisRapat: routeParams.JenisRapat || meetingData.jenisRapat,
                                            JenisRapatId: jenisRapatParam,
                                            status: queryParams.status || meetingData.statusDecision,
                                            tanggal: routeParams.TanggalRapat || meetingData.tanggalRapat || queryParams.tanggal,
                                            lokasi: meetingData.lokasi || queryParams.lokasi,
                                            durasi: meetingData.durasi || queryParams.durasi,
                                            peserta: meetingData.peserta || queryParams.peserta,
                                            // Approval status data from API
                                            approveSekper: meetingData.approveSekper || queryParams.approveSekper,
                                            approveTl: meetingData.approveTl || queryParams.approveTl,
                                            approveLegal: meetingData.approveLegal || queryParams.approveLegal,
                                            approveRisiko: meetingData.approveRisiko || queryParams.approveRisiko,
                                            approveKepatuhan: meetingData.approveKepatuhan || queryParams.approveKepatuhan
                                        }
                                    }"
                                    size="medium"
                                    class="h-8 px-3 ml-auto"
                                />
                            </div>
                        </div>
                    </template>
                    <template #empty> 
                        Data not found... 
                    </template>
                    <template #loading> 
                        Loading data. Please wait. 
                    </template>
                    
                    <Column
                        header="Agenda"
                        dataType="text"
                        field="agenda"
                    />
                    <Column
                        header="Jenis Rapat"
                        dataType="text"
                        field="jenisRapat"
                    />
                    <Column
                        header="Agenda"
                        dataType="text"
                        field="agenda"
                    />
                    <Column
                        header="Status Decision"
                        dataType="text"
                        field="statusDecision"
                    >
                        <template #body="{ data }">
                            <span v-if="data.statusDecision === 0 || data.statusDecision === '0'">Belum dipilih</span>
                            <span v-else-if="data.statusDecision === 1 || data.statusDecision === '1'">Ya</span>
                            <span v-else-if="data.statusDecision === 2 || data.statusDecision === '2'">Tidak</span>
                            <span v-else>-</span>
                        </template>
                    </Column>
                    <Column
                        header="Tanggal Rapat"
                        dataType="text"
                        field="tanggalRapat"
                    />
                    <Column
                        v-if="meetingData.statusDecision === '1' || meetingData.statusDecision === 1"
                        header="Materi Rapat"
                        class="w-[8rem]"
                    >
                        <template #body="{ data }">
                            <div class="flex flex-col md:flex-row gap-2 justify-center items-start">
                                <Button
                                    icon="pi pi-eye"
                                    severity="info"
                                    rounded
                                    aria-label="Detail"
                                    @click="onClickDetailTable(data)"
                                    v-tooltip.bottom="'Detail'"
                                />
                            </div>
                        </template>
                    </Column>
                    <Column
                        v-if="canUploadFormReview && hasAnyApprovalFlag"
                        header="Upload Form Review Governance"
                        class="w-[8rem]"
                    >
                        <template #body="{ data }">
                            <div class="flex flex-col md:flex-row gap-2 justify-center items-start">
                                <Button
                                    icon="pi pi-upload"
                                    severity="info"
                                    rounded
                                    aria-label="Upload Form Review Governance"
                                    @click="onClickUploadFormReviewGovernanceTable(data)"
                                    v-tooltip.bottom="'Upload Form Review Governance'"
                                />
                            </div>
                        </template>
                    </Column>
                    <Column
                        v-if="canViewDataTable2"
                        header="Approval & add PIC"
                        class="w-[8rem]"
                    >
                        <template #body="{ data }">
                            <div class="flex flex-col md:flex-row gap-2 justify-center items-start">
                                <Button
                                    icon="pi pi-user-plus"
                                    severity="success"
                                    rounded
                                    aria-label="Approval & add PIC"
                                    @click="onClickApprovalPICTable(data)"
                                    v-tooltip.bottom="'Approval & Add PIC'"
                                />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>
    </div>

    <!-- Confirmation Dialog -->
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
</template>
