<script setup>
// Vue Composition API
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';


// Stores
import { useAuth } from '@/stores';

// Interfaces
import IParams from '@/interface/IParams';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// PrimeVue Components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import DatePicker from 'primevue/datepicker';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';
import Menu from 'primevue/menu';

// Services
import KepdirSirkulerService from './service/KepdirSirkuler';
import JenisRapatKepdirService from './service/JenisRapatKepdir';

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
const datas = ref([]);
const allData = ref([]); // Add missing allData ref
const loading = ref(false);
const search = ref(null);
const totalRecords = ref(0);
const searchQuery = ref('');
const currentPage = ref(1);
const rowsPerPage = ref(10);
const totalPages = ref(0);
const param = ref({
    ...IParams
});

// ==========================================
// ROUTE PARAMETERS
// ==========================================
const tahunParam = ref(null);
const jenisRapatParam = ref(null);

// ==========================================
// SORTING & FILTERING
// ==========================================
const sortField = ref(null);
const sortOrder = ref(null);
const showFilters = ref(false);
const columnFilters = ref({
    agenda: '',
    tanggalTerbit: null,
    judulKepdir: ''
});

// ==========================================
// OPTIONS & MAPPINGS
// ==========================================
const jenisRapatOptions = ref([
    { label: 'Direksi', value: 'Direksi' },
    { label: 'Kepdir Sirkuler', value: 'Kepdir Sirkuler' },
    { label: 'RUPS dan RKAP', value: 'RUPS dan RKAP' },
    { label: 'RUPS dan LPT', value: 'RUPS dan LPT' },
    { label: 'Komite', value: 'Komite' },
    { label: 'Dewan Komisaris', value: 'Dewan Komisaris' },
    { label: 'GCG', value: 'GCG' }
]);

const jenisRapatMapping = {
    '1': 'Direksi',
    '2': 'Kepdir Sirkuler',
    '3': 'RUPS dan RKAP',
    '4': 'RUPS dan LPT',
    '5': 'Komite',
    '6': 'Dewan Komisaris',
    '7': 'GCG'
};

const modelRapatOptions = ref([
    { label: 'Online', value: 'Online' },
    { label: 'Offline', value: 'Offline' },
    { label: 'Hybrid', value: 'Hybrid' }
]);

const statusDecisionOptions = ref([
    { label: 'Belum Diputuskan', value: 0 },
    { label: 'Menggunakan Decision', value: 1 },
    { label: 'Tidak Menggunakan Decision', value: 2 }
]);

// Generate tahun options from current year to 5 years back
const tahunOptions = ref([]);
const currentYear = new Date().getFullYear();
for (let i = currentYear; i >= currentYear - 5; i--) {
    tahunOptions.value.push({ label: i.toString(), value: i });
}

// ==========================================
// ACTION MENU
// ==========================================
const actionMenu = ref();
const selectedData = ref(null);
const actionMenuItems = ref([]);

// ==========================================
// DATA MANAGEMENT FUNCTIONS
// ========================================== 

async function getData() {
    console.log('getData called');
    loading.value = true;
    
    try {
        // Build query parameters according to Swagger API specification
        const queryParams = {
            search: '',
            tahun: '',
            page: 1,
            limit: 1000, // Get all data for client-side filtering
            order_by: '',
            sort: 'DESC',
            show_all: true
        };

        console.log('Query params:', queryParams);

        console.log('Calling KepdirSirkulerService.get with params:', queryParams);
        const response = await KepdirSirkulerService.get(queryParams);
        console.log('API response:', response);

        if (response.data && response.data.code === 200) {
            allData.value = response.data.data || [];
            console.log('Data loaded:', allData.value.length, 'items');
            console.log('Sample data:', allData.value[0]);
            console.log('All data:', allData.value);
            
            // Apply filters and pagination to display data in table
            applyFiltersAndPagination();
        } else {
            allData.value = [];
            console.log('No data returned or code !== 200');
            console.log('Response data:', response.data);
            
            // Clear table data
            datas.value = [];
            totalRecords.value = 0;
        }
    } catch (error) {
        console.error('Error in getData:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data kepdir sirkuler',
            life: 3000
        });
        datas.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
}

// Server-side filtering and pagination - no client-side processing needed
function applyFiltersAndPagination() {
    console.log('applyFiltersAndPagination called');
    console.log('allData.value:', allData.value);
    console.log('tahunParam.value:', tahunParam.value);
    
    let filteredData = [...allData.value];
    console.log('Initial filteredData length:', filteredData.length);
    
    // Filter berdasarkan parameter tahun jika ada
    // DISABLED: Sementara dinonaktifkan untuk debugging
    // if (tahunParam.value) {
    //     console.log('Filtering by tahun:', tahunParam.value);
    //     const originalLength = filteredData.length;
    //     filteredData = filteredData.filter(item => {
    //         if (item.tanggalTerbit) {
    //             const itemYear = new Date(item.tanggalTerbit).getFullYear();
    //             console.log('Item tanggalTerbit:', item.tanggalTerbit, 'Year:', itemYear, 'Match:', itemYear.toString() === tahunParam.value);
    //             return itemYear.toString() === tahunParam.value;
    //         }
    //         return false;
    //     });
    //     console.log('After tahun filter, filteredData length:', filteredData.length, 'from', originalLength);
        
    //     // If no data matches the year filter, show all data as fallback
    //     if (filteredData.length === 0 && originalLength > 0) {
    //         console.log('No data matches tahun filter, showing all data as fallback');
    //         filteredData = [...allData.value];
    //     }
    // } else {
        console.log('Showing all data (filters disabled for debugging)');
    // }
    
    // Filter berdasarkan parameter jenisRapat jika ada
    // DISABLED: Data dari API tidak memiliki field jenisRapat
    // if (jenisRapatParam.value) {
    //     const jenisRapatLabel = jenisRapatMapping[jenisRapatParam.value];
    //     console.log('Filtering by jenisRapat:', jenisRapatParam.value, 'Label:', jenisRapatLabel);
    //     if (jenisRapatLabel) {
    //         const beforeFilter = filteredData.length;
    //         filteredData = filteredData.filter(item => {
    //             return item.jenisRapat === jenisRapatLabel;
    //         });
    //         console.log('After jenisRapat filter, filteredData length:', filteredData.length, 'from', beforeFilter);
    //     }
    // }
    
    // Global search filter
    if (search.value) {
        filteredData = filteredData.filter(item => 
            item.judulKepdir?.toLowerCase().includes(search.value.toLowerCase()) ||
            (item.agendaRapat && item.agendaRapat.toLowerCase().includes(search.value.toLowerCase()))
        );
    }
    
    // Column-specific filters
    if (columnFilters.value.agenda) {
        filteredData = filteredData.filter(item => 
            item.agendaRapat?.toLowerCase().includes(columnFilters.value.agenda.toLowerCase())
        );
    }
    
    if (columnFilters.value.judulKepdir) {
        filteredData = filteredData.filter(item => 
            item.judulKepdir?.toLowerCase().includes(columnFilters.value.judulKepdir.toLowerCase())
        );
    }
    
    if (columnFilters.value.tanggalTerbit) {
        const filterDate = new Date(columnFilters.value.tanggalTerbit).toISOString().split('T')[0];
        filteredData = filteredData.filter(item => {
            const itemDate = new Date(item.tanggalTerbit).toISOString().split('T')[0];
            return itemDate === filterDate;
        });
    }
    
    // Sorting
    if (sortField.value && sortOrder.value) {
        filteredData.sort((a, b) => {
            let aValue = a[sortField.value];
            let bValue = b[sortField.value];
            
            // Handle null/undefined values
            if (aValue == null) aValue = '';
            if (bValue == null) bValue = '';
            
            // Handle date fields
            if (sortField.value === 'tanggalTerbit') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            
            if (aValue < bValue) {
                return sortOrder.value === 1 ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortOrder.value === 1 ? 1 : -1;
            }
            return 0;
        });
    }
    
    // Update total records for pagination
    totalRecords.value = filteredData.length;
    
    // Client-side pagination
    const startIndex = param.value.page * param.value.size;
    const endIndex = startIndex + param.value.size;
    datas.value = filteredData.slice(startIndex, endIndex);
    
    console.log('=== applyFiltersAndPagination Results ===');
    console.log('filteredData.length:', filteredData.length);
    console.log('totalRecords.value:', totalRecords.value);
    console.log('datas.value.length:', datas.value.length);
    console.log('param.value.page:', param.value.page);
    console.log('param.value.size:', param.value.size);
    console.log('startIndex:', startIndex, 'endIndex:', endIndex);
    console.log('Final datas.value:', datas.value);

}

// ==========================================
// FILTER MANAGEMENT FUNCTIONS
// ==========================================
const toggleFilters = () => {
    showFilters.value = !showFilters.value;
};

const clearAllFilters = () => {
    columnFilters.value = {
        agenda: '',
        tanggalTerbit: null,
        judulKepdir: ''
    };
    search.value = null;
    param.value.page = 0;
    getData(); // Call getData directly for server-side filtering
};

const onFilterChange = () => {
    param.value.page = 0; // Reset to first page when filter changes
    applyFiltersAndPagination();
};

const clearTahunFilter = () => {
    tahunParam.value = null;
    param.value.page = 0;
    applyFiltersAndPagination();
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
function onClickEditJadwal(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/add',
        query: {
            id: data.id,
            agenda: data.agenda,
            tanggalRapat: data.tanggalRapat ? new Date(data.tanggalRapat) : null, 
            tahun: data.tahun,
            modelRapat: data.modelRapat,
            lokasi: data.lokasi,
            durasi: data.durasi,
            deskripsi: data.deskripsi,
            statusDecision: data.statusDecision,
            jenisRapatId: data.jenisRapatId,
            jenisRapat: data.jenisRapat,
            mode: 'edit' 
        }
    });
}

function onClickDetailJadwal(data) {
    router.push({
        path: `/transaction/kepdir-sirkuler/detail/${data.id}`,
        query: {
            id: data.id,
            agenda: data.agendaRapat,
            judul: data.judulKepdir,
            tanggalTerbit: data.tanggalTerbit,
            jenisRapat: jenisRapatParam.value,
            tahun: tahunParam.value,
            mode: 'detail'
        }
    });
}

function onClickKajian(data) {
    router.push({
        path: '/transaction/kepdir-sirkuler/upload-kajian',
        query: {
            id: data.id,
            kepdirId: data.id,
            agenda: data.agendaRapat,
            judul: data.judulKepdir,
            tanggalTerbit: data.tanggalTerbit,
            statusDecision: data.statusDecision,
            jenisRapatId: data.jenisRapatId,
            jenisRapat: data.jenisRapat,
            role: getDisplayRole(),
            tahun: tahunParam.value
        }
    });
}

function onClickUploadFormReviewGovernance(data) {
    router.push({
        path: '/transaction/kepdir-sirkuler/upload-form-review-governance',
        query: {
            id: data.id,
            kepdirId: data.id, // ID kepdir untuk getById
            agenda: data.agendaRapat,
            judul: data.judulKepdir,
            tanggalTerbit: data.tanggalTerbit,
            statusDecision: data.statusDecision,
            jenisRapatId: data.jenisRapatId,
            jenisRapat: data.jenisRapat,
            role: getDisplayRole(),
            tahun: tahunParam.value
        }
    });
}

function onClickApprovalRadir(data) {
    // Navigate to approval radir with tahun parameter
    const tahun = tahunParam.value || new Date().getFullYear().toString();
    const jenisRapat = jenisRapatParam.value || data.jenisRapatId;
    
    router.push({
        path: `/transaction/approval-radir/${tahun}`,
        query: {
            agenda: data.agenda,
            tanggalRapat: data.tanggalRapat,
            jenisRapat: data.jenisRapat,
            tahun: tahun
        }
    });
}

// Base action menu items
const baseItems = [
    {
        label: 'Detail',
        icon: 'pi pi-info-circle',
        command: () => {
            onClickDetailJadwal(selectedData.value);
        }
    }
];

// Dynamic action menu items based on role
const getActionMenuItems = () => {
    const currentRole = getDisplayRole();
    
    // Role 1 (BOD): Edit, Input Kajian Rapat, Input Form Government, Detail, Hapus
    if (currentRole === '1' || currentRole === 1) {
        return [
            // {
            //     label: 'Edit',
            //     icon: 'pi pi-pencil',
            //     command: () => {
            //         onClickEditJadwal(selectedData.value);
            //     }
            // },
            {
                label: 'Input Kajian Rapat',
                icon: 'pi pi-upload',
                command: () => {
                    onClickInputKajianRapat(selectedData.value);
                }
            },
            {
                label: 'Input Form Governance',
                icon: 'pi pi-plus-circle',
                command: () => {
                    onClickInputFormGovernance(selectedData.value);
                }
            },
            {
                label: 'Detail',
                icon: 'pi pi-info-circle',
                command: () => {
                    onClickDetailJadwal(selectedData.value);
                }
            },
            {
                label: 'Hapus',
                icon: 'pi pi-trash',
                class: 'text-red-500',
                command: () => {
                    onClickDeleteJadwal(selectedData.value);
                }
            }
        ];
    } 
    // Role 3, 4, 5: Approve Kajian Rapat, Detail
    else if (currentRole === '3' || currentRole === 3 || currentRole === '4' || currentRole === 4 || currentRole === '5' || currentRole === 5) {
        return [
            {
                label: 'Approval Kajian Rapat',
                icon: 'pi pi-check-circle',
                class: 'text-green-600',
                command: () => {
                    onClickApprovalKajianRapat(selectedData.value);
                }
            },
            ...baseItems
        ];
    }
    // Role 2: Approve Kajian Rapat, Detail
    else if (currentRole === '2' || currentRole === 2) {
        return [
            {
                label: 'Approval Kajian Rapat',
                icon: 'pi pi-check-circle',
                class: 'text-green-600',
                command: () => {
                    onClickApprovalKajianRapat(selectedData.value);
                }
            },
            {
                label: 'Detail & Approval Form Review Governance',
                icon: 'pi pi-info-circle',
                command: () => {
                    onClickDetailJadwal(selectedData.value);
                }
            },
        ];
    }
    else {
        // Other roles: Show Upload options
        const uploadItems = [];
        
        // Only show Upload Kajian Rapat if agenda does NOT exist
        if (!selectedData.value?.agendaRapat) {
            uploadItems.push({
                label: 'Upload Kajian Rapat',
                icon: 'pi pi-upload',
                command: () => {
                    onClickKajian(selectedData.value);
                }
            });
        }
        
        // Always show Upload Form Review Governance
        uploadItems.push({
            label: 'Upload Form Review Governance',
            icon: 'pi pi-upload',
            command: () => {
                onClickUploadFormReviewGovernance(selectedData.value);
            }
        });
        
        return [...uploadItems, ...baseItems];
    }
};

const toggleActionMenu = (event, data) => {
    selectedData.value = data;
    // Refresh menu items based on current role
    actionMenuItems.value = getActionMenuItems();
    actionMenu.value.toggle(event);
};

function onClickDeleteJadwal(data) {
    confirm.require({
        message: `Apakah Anda yakin ingin menghapus jadwal rapat "${data.agenda}"?`,
        header: 'Konfirmasi Hapus',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {
            try {
                await KepdirSirkulerService.delete(data.id);
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Jadwal rapat berhasil dihapus',
                    life: 3000
                });
                getData();
            } catch (error) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal menghapus jadwal rapat',
                    life: 3000
                });
            }
        }
    });
}

async function onClickInputKajianRapat(data) {
    try {
        // Fetch detailed kepdir information using GET /api/kepdir/{id}
        const response = await KepdirSirkulerService.getById(data.id);
        
        if (response.data && response.data.code === 200) {
            const kepdirDetail = response.data.data;
            
            router.push({
                path: '/transaction/kepdir-sirkuler/upload-kajian',
                query: {
                    id: data.id,
                    kepdirId: data.id,
                    agenda: kepdirDetail.agendaRapat,
                    judul: kepdirDetail.judulKepdir,
                    tanggalTerbit: kepdirDetail.tanggalTerbit,
                    statusDecision: data.statusDecision,
                    jenisRapatId: data.jenisRapatId,
                    jenisRapat: data.jenisRapat,
                    role: getDisplayRole(),
                    tahun: tahunParam.value,
                    mode: 'input',
                    // Additional kepdir details from API
                    jadwalRapatId: kepdirDetail.jadwalRapatId,
                    tahun: kepdirDetail.tahun,
                    createdBy: kepdirDetail.createdBy,
                    approveSekper: kepdirDetail.approveSekper,
                    approveLegal: kepdirDetail.approveLegal,
                    approveRisiko: kepdirDetail.approveRisiko,
                    approveKepatuhan: kepdirDetail.approveKepatuhan,
                    statusReviewGovernence: kepdirDetail.statusReviewGovernence,
                    statusApproval: kepdirDetail.statusApproval,
                    alasanTolak: kepdirDetail.alasanTolak
                }
            });
        } else {
            // Fallback to existing data if API fails
            router.push({
                path: '/transaction/kepdir-sirkuler/upload-kajian',
                query: {
                    id: data.id,
                    kepdirId: data.id,
                    agenda: data.agendaRapat,
                    judul: data.judulKepdir,
                    tanggalTerbit: data.tanggalTerbit,
                    statusDecision: data.statusDecision,
                    jenisRapatId: data.jenisRapatId,
                    jenisRapat: data.jenisRapat,
                    role: getDisplayRole(),
                    tahun: tahunParam.value,
                    mode: 'input'
                }
            });
        }
    } catch (error) {
        console.error('Error fetching kepdir details:', error);
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Gagal memuat detail kepdir, menggunakan data yang tersedia',
            life: 3000
        });
        
        // Fallback to existing data if API fails
        router.push({
            path: '/transaction/kepdir-sirkuler/upload-kajian',
            query: {
                id: data.id,
                kepdirId: data.id,
                agenda: data.agendaRapat,
                judul: data.judulKepdir,
                tanggalTerbit: data.tanggalTerbit,
                statusDecision: data.statusDecision,
                jenisRapatId: data.jenisRapatId,
                jenisRapat: data.jenisRapat,
                role: getDisplayRole(),
                tahun: tahunParam.value,
                mode: 'input'
            }
        });
    }
}

function onClickInputFormGovernance(data) {
    router.push({
        path: '/transaction/kepdir-sirkuler/upload-form-review-governance',
        query: {
            id: data.id,
            kepdirId: data.id,
            agenda: data.agendaRapat,
            judul: data.judulKepdir,
            tanggalTerbit: data.tanggalTerbit,
            statusDecision: data.statusDecision,
            jenisRapatId: data.jenisRapatId,
            jenisRapat: data.jenisRapat,
            role: getDisplayRole(),
            tahun: tahunParam.value,
            mode: 'upload'
        }
    });
}

async function onClickApprovalKajianRapat(data) {
    try {
        // Fetch detailed kepdir information using GET /api/kepdir/{id}
        const response = await KepdirSirkulerService.getById(data.id);
        
        if (response.data && response.data.code === 200) {
            const kepdirDetail = response.data.data;
            
            router.push({
                path: `/transaction/kepdir-sirkuler/upload-kajian`,
                query: {
                    id: data.id,
                    kepdirId: data.id,
                    agenda: kepdirDetail.agendaRapat,
                    judul: kepdirDetail.judulKepdir,
                    tanggalTerbit: kepdirDetail.tanggalTerbit,
                    jenisRapat: jenisRapatParam.value,
                    tahun: tahunParam.value,
                    mode: 'approve',
                    // Additional kepdir details from API
                    jadwalRapatId: kepdirDetail.jadwalRapatId,
                    tahun: kepdirDetail.tahun,
                    createdBy: kepdirDetail.createdBy,
                    approveSekper: kepdirDetail.approveSekper,
                    approveLegal: kepdirDetail.approveLegal,
                    approveRisiko: kepdirDetail.approveRisiko,
                    approveKepatuhan: kepdirDetail.approveKepatuhan,
                    statusReviewGovernence: kepdirDetail.statusReviewGovernence,
                    statusApproval: kepdirDetail.statusApproval,
                    alasanTolak: kepdirDetail.alasanTolak
                }
            });
        } else {
            // Fallback to existing data if API fails
            router.push({
                path: `/transaction/kepdir-sirkuler/upload-kajian`,
                query: {
                    id: data.id,
                    agenda: data.agendaRapat,
                    judul: data.judulKepdir,
                    tanggalTerbit: data.tanggalTerbit,
                    jenisRapat: jenisRapatParam.value,
                    tahun: tahunParam.value,
                    mode: 'approve'
                }
            });
        }
    } catch (error) {
        console.error('Error fetching kepdir details:', error);
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Gagal memuat detail kepdir, menggunakan data yang tersedia',
            life: 3000
        });
        
        // Fallback to existing data if API fails
        router.push({
            path: `/transaction/kepdir-sirkuler/upload-kajian`,
            query: {
                id: data.id,
                agenda: data.agendaRapat,
                judul: data.judulKepdir,
                tanggalTerbit: data.tanggalTerbit,
                jenisRapat: jenisRapatParam.value,
                tahun: tahunParam.value,
                mode: 'approve'
            }
        });
    }
}

// ==========================================
// TABLE EVENT HANDLERS
// ==========================================
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData(); // Call getData directly for server-side pagination
};

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    param.value.page = 0; // Reset to first page when sorting changes
    getData(); // Call getData directly for server-side sorting
};

// ==========================================
// ROLE MANAGEMENT FUNCTIONS
// ==========================================
const getLoginRole = () => {
    const roleFromStorage = localStorage.getItem('role');
    const roleTypeFromStorage = localStorage.getItem('userRole');
    
    return authStore.roleType || roleFromStorage || roleTypeFromStorage;
};

const getDisplayRole = () => {
    return getLoginRole();
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(() => {
    console.log('KepdirSirkuler component mounted');
    console.log('Route params:', route.params);
    console.log('Route path:', route.path);
    console.log('Route query:', route.query);
    
    tahunParam.value = route.params.tahun || null;
    
    // For Kepdir Sirkuler, set jenisRapatParam to '2' (Kepdir Sirkuler)
    jenisRapatParam.value = '2';
    
    // Initialize pagination parameters
    param.value = {
        search: '',
        page: 0,
        size: 10
    };
    
    console.log('tahunParam:', tahunParam.value);
    console.log('jenisRapatParam:', jenisRapatParam.value);
    console.log('param.value:', param.value);
    console.log('Will filter by tahunParam:', tahunParam.value ? 'YES' : 'NO');
    
    // Initialize action menu items after all functions are defined
    actionMenuItems.value = getActionMenuItems();
    
    getData();
    getLoginRole();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Kepdir Sirkuler
            <span v-if="tahunParam" class="text-lg text-gray-600 ml-2">
                - Tahun {{ tahunParam }}
            </span>
            <!-- <span v-if="jenisRapatParam && jenisRapatMapping[jenisRapatParam]" class="text-lg text-gray-600 ml-2">
                - {{ jenisRapatMapping[jenisRapatParam] }}
            </span> -->
        </div>
        
        <!-- User Information -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ getDisplayRole() }}
                    <span v-if="tahunParam" class="ml-4">
                        | <strong>Tahun:</strong> {{ tahunParam }}
                    </span>
                    <span v-if="jenisRapatParam && jenisRapatMapping[jenisRapatParam]" class="ml-4">
                        | <strong>Jenis Rapat:</strong> {{ jenisRapatParam }} - {{ jenisRapatMapping[jenisRapatParam] }}
                    </span>
                </span>
            </div>
        </div>

        <!-- Active Filter Information -->
        <div v-if="tahunParam || jenisRapatParam" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <i class="pi pi-filter text-yellow-600"></i>
                    <span class="text-sm text-yellow-800">
                        <strong>Filter Aktif:</strong> 
                        <span v-if="tahunParam">Menampilkan data kepdir sirkuler untuk tahun {{ tahunParam }}</span>
                        <span v-if="tahunParam && jenisRapatParam && jenisRapatMapping[jenisRapatParam]"> dan </span>
                        <span v-if="jenisRapatParam && jenisRapatMapping[jenisRapatParam]">jenis rapat {{ jenisRapatMapping[jenisRapatParam] }}</span>
                    </span>
                </div>
                <Button
                    v-if="tahunParam"
                    label="Clear Tahun Filter"
                    icon="pi pi-times"
                    severity="secondary"
                    size="small"
                    text
                    @click="clearTahunFilter"
                />
            </div>
        </div>

        <div class="card">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                :scroll-height="'400px'"
                :rows="param.size"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                dataKey="id"
                :rowHover="true"
                :loading="loading"
                :totalRecords="totalRecords"
                :lazy="true"
                @page="onPage($event)"
                @sort="onSort($event)"
                :sortField="sortField"
                :sortOrder="sortOrder"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="showing {first} to {last} of {totalRecords}"
                :first="param.page * param.size"
            >
                <template #header>
                    <div class="flex justify-between items-center w-full">
                        <!-- Filter Controls -->
                        <div class="flex gap-4">
                            <Button
                                icon="pi pi-filter"
                                :severity="showFilters ? 'primary' : 'secondary'"
                                :text="!showFilters"
                                label="Filters"
                                @click="toggleFilters"
                                v-tooltip.bottom="'Toggle Column Filters'"
                            />
                            <Button
                                icon="pi pi-filter-slash"
                                severity="secondary"
                                text
                                label="Clear"
                                @click="clearAllFilters"
                                v-tooltip.bottom="'Clear All Filters'"
                            />
                        </div>
                        
                        <!-- Search and Action Buttons -->
                        <div class="flex gap-4">
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText 
                                    autocomplete="off" 
                                    v-model="search"
                                    @input="onFilterChange"
                                    placeholder="Search"
                                />
                            </IconField>
                            
                            <!-- Add Jadwal Rapat Button (Role 1=BOD) -->
                            <Button
                                as="router-link"
                                label="Add Kepdir Sirkuler"
                                v-if="getDisplayRole() === '1' || getDisplayRole() === 1 || authStore.role === '1' || authStore.role === 1"
                                :to="{
                                    path: '/transaction/kepdir-sirkuler/add',
                                    query: {
                                        role: getDisplayRole(),
                                        jenisRapat: jenisRapatParam,
                                        tahun: tahunParam,
                                        mode: 'add'
                                    }
                                }"
                                severity="info"
                            />
                            
                            <!-- Pilih Jadwal Rapat Button (Role 1) -->
                            <!-- <Button
                                as="router-link"
                                label="Pilih Jadwal Rapat"
                                v-if="getDisplayRole() === '1' || getDisplayRole() === 1 || authStore.role === '1' || authStore.role === 1"
                                :to="{
                                    path: '/transaction/jadwal-rapat-korporat/add',
                                    query: {
                                        role: getDisplayRole(),
                                        jenisRapat: jenisRapatParam,
                                        tahun: tahunParam
                                    }
                                }"
                                severity="success"
                            /> -->
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
                    header="No."
                    style="min-width: 5rem"
                >
                    <template #body="{ index }">
                        {{ param.page * param.size + index + 1 }}
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="agendaRapat"
                    style="min-width: 180px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Agenda Rapat</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.agenda"
                                    placeholder="Filter agenda..."
                                    class="w-full"
                                    @input="onFilterChange"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                    <template #body="{ data }">
                        {{ data.agendaRapat || '-' }}
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="judulKepdir"
                    style="min-width: 250px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Judul Kepdir Sirkuler</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.judulKepdir"
                                    placeholder="Filter judul..."
                                    class="w-full"
                                    @input="onFilterChange"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="tanggalTerbit"
                    style="min-width: 160px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Tanggal Terbit</div>
                            <div v-if="showFilters" class="w-full">
                                <DatePicker 
                                    v-model="columnFilters.tanggalTerbit"
                                    placeholder="Pilih tanggal"
                                    class="w-full"
                                    @date-select="onFilterChange"
                                    :showClear="true"
                                    dateFormat="yy-mm-dd"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                    <template #body="{ data }">
                        {{ new Date(data.tanggalTerbit).toLocaleDateString('id-ID') }}
                    </template>
                </Column>
                <Column
                    header="Status"
                    style="min-width: 120px"
                >
                    <template #body="{ data }">
                        <Tag 
                            :value="data.statusApproval === 1 ? 'Disetujui' : data.statusApproval === 2 ? 'Ditolak' : 'Berjalan'" 
                            :severity="data.statusApproval === 1 ? 'success' : data.statusApproval === 2 ? 'danger' : 'info'"
                        />
                    </template>
                </Column>
                <Column
                    header="Dibuat Oleh"
                    style="min-width: 150px"
                >
                    <template #body="{ data }">
                        {{ authStore.name || 'System' }}
                    </template>
                </Column>
                <Column
                    header="Aksi"
                    class="w-[5rem]"
                >
                    <template #body="{ data }">
                        <div class="flex justify-center items-center">
                            <Button
                                icon="pi pi-ellipsis-v"
                                severity="secondary"
                                text
                                rounded
                                @click="toggleActionMenu($event, data)"
                                aria-haspopup="true"
                                aria-controls="action_menu"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    
    <!-- Global Components -->
    <Toast />
    <ConfirmDialog />
    <Menu ref="actionMenu" :model="actionMenuItems" :popup="true" />
</template>

<style scoped lang="scss">
// ==========================================
// CUSTOM STYLES
// ==========================================

// DataTable custom styles
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
