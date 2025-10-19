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
import JadwalRapatService from './service/JadwalRapat';
import JenisRapattService from '../service/JenisRapatt';

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
const allData = ref([]);
const loading = ref(false);
const search = ref(null);
const totalRecords = ref(0);
const param = ref({
    ...IParams
});

// ==========================================
// ROUTE PARAMETERS
// ==========================================
const tahunParam = ref(null);
const jenisRapatParam = ref(null);

const sortField = ref(null);
const sortOrder = ref(null);
const showFilters = ref(false);
const columnFilters = ref({
    agenda: '',
    tanggalRapat: null,
    modelRapat: null,
    lokasi: '',
    durasi: null,
    deskripsi: '',
    statusDecision: null
});

// ==========================================
// OPTIONS & MAPPINGS
// ==========================================
const jenisRapatOptions = ref([]);

const jenisRapatMapping = ref({});

const modelRapatOptions = ref([
    { label: 'Online', value: 'Online' },
    { label: 'Offline', value: 'Offline' },
    { label: 'Hybrid', value: 'Hybrid' }
]);

const statusDecisionOptions = ref([
    { label: 'Belum Diputuskan', value: 0 },
    { label: 'Sudah Diputuskan', value: 1 }
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
    loading.value = true;
    
    try {
        const queryParams = {
            tahun: tahunParam.value || '',
            kodeJenisRapat: jenisRapatParam.value || ''
        };

        // Remove undefined values
        Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === undefined) {
                delete queryParams[key];
            }
        });

        const response = await JadwalRapatService.get(queryParams);

        if (response.data && response.data.success) {
            allData.value = response.data.data || [];
        } else {
            allData.value = [];
        }
        
        applyFiltersAndPagination();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data jadwal rapat',
            life: 3000
        });
        allData.value = [];
        datas.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
}

function applyFiltersAndPagination() {
    let filteredData = [...allData.value];
    
    // Filter berdasarkan parameter tahun jika ada
    if (tahunParam.value) {
        filteredData = filteredData.filter(item => {
            // Use tanggalRapatFrom if available, otherwise use tanggalRapat
            const dateToCheck = item.tanggalRapatFrom || item.tanggalRapat;
            if (dateToCheck) {
                const itemYear = new Date(dateToCheck).getFullYear();
                return itemYear.toString() === tahunParam.value.toString();
            }
            return false;
        });
    }
    
    // Filter berdasarkan parameter jenisRapat jika ada
    if (jenisRapatParam.value) {
        const jenisRapatLabel = jenisRapatMapping.value[jenisRapatParam.value];
        if (jenisRapatLabel) {
            filteredData = filteredData.filter(item => {
                // Compare by jenisRapat name instead of ID/code
                const match = item.jenisRapat === jenisRapatLabel;
                return match;
            });
        }
    }
    
    // Global search filter
    if (search.value) {
        filteredData = filteredData.filter(item => 
            item.agenda?.toLowerCase().includes(search.value.toLowerCase()) ||
            item.lokasi?.toLowerCase().includes(search.value.toLowerCase()) ||
            item.deskripsi?.toLowerCase().includes(search.value.toLowerCase()) ||
            item.jenisRapat?.toLowerCase().includes(search.value.toLowerCase()) ||
            item.modelRapat?.toLowerCase().includes(search.value.toLowerCase()) ||
            (item.tanggalRapatFrom && new Date(item.tanggalRapatFrom).toLocaleDateString('id-ID').toLowerCase().includes(search.value.toLowerCase())) ||
            (item.tanggalRapat && new Date(item.tanggalRapat).toLocaleDateString('id-ID').toLowerCase().includes(search.value.toLowerCase()))
        );
    }
    
    // Column-specific filters
    if (columnFilters.value.agenda) {
        filteredData = filteredData.filter(item => 
            item.agenda?.toLowerCase().includes(columnFilters.value.agenda.toLowerCase())
        );
    }
    
    if (columnFilters.value.tanggalRapat) {
        const filterDate = new Date(columnFilters.value.tanggalRapat).toISOString().split('T')[0];
        filteredData = filteredData.filter(item => {
            // Use tanggalRapatFrom if available, otherwise use tanggalRapat
            const dateToCheck = item.tanggalRapatFrom || item.tanggalRapat;
            if (dateToCheck) {
                const itemDate = new Date(dateToCheck).toISOString().split('T')[0];
                return itemDate === filterDate;
            }
            return false;
        });
    }
    
    if (columnFilters.value.modelRapat) {
        filteredData = filteredData.filter(item => 
            item.modelRapat === columnFilters.value.modelRapat
        );
    }
    
    if (columnFilters.value.lokasi) {
        filteredData = filteredData.filter(item => 
            item.lokasi?.toLowerCase().includes(columnFilters.value.lokasi.toLowerCase())
        );
    }
    
    if (columnFilters.value.durasi !== null && columnFilters.value.durasi !== '') {
        filteredData = filteredData.filter(item => {
            // durasi dalam menit, convert ke jam untuk filter
            const durasiHours = Math.round(item.durasi / 60);
            return durasiHours === columnFilters.value.durasi;
        });
    }
    
    if (columnFilters.value.deskripsi) {
        filteredData = filteredData.filter(item => 
            item.deskripsi?.toLowerCase().includes(columnFilters.value.deskripsi.toLowerCase())
        );
    }
    
    if (columnFilters.value.statusDecision !== null && columnFilters.value.statusDecision !== '') {
        filteredData = filteredData.filter(item => 
            item.statusDecision === columnFilters.value.statusDecision
        );
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
            if (sortField.value === 'tanggalRapat') {
                // Use tanggalRapatFrom if available, otherwise use tanggalRapat
                const aDateToCheck = a.tanggalRapatFrom || a.tanggalRapat;
                const bDateToCheck = b.tanggalRapatFrom || b.tanggalRapat;
                aValue = new Date(aDateToCheck);
                bValue = new Date(bDateToCheck);
            }
            
            // Handle duration field (convert minutes to hours for sorting)
            if (sortField.value === 'durasi') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }
            
            // Handle numeric fields
            if (sortField.value === 'tahun' || sortField.value === 'statusDecision') {
                aValue = Number(aValue) || 0;
                bValue = Number(bValue) || 0;
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
    
    // Pagination
    const startIndex = param.value.page * param.value.size;
    const endIndex = startIndex + param.value.size;
    datas.value = filteredData.slice(startIndex, endIndex);
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
        tanggalRapat: null,
        modelRapat: null,
        lokasi: '',
        durasi: null,
        deskripsi: '',
        statusDecision: null
    };
    search.value = null;
    param.value.page = 0;
    applyFiltersAndPagination();
};

const onFilterChange = () => {
    param.value.page = 0; // Reset to first page when filter changes
    applyFiltersAndPagination();
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
function onClickEditJadwal(data) {
    router.push({
        path: `/transaction/rapat-rups-lpt/edit/${data.id}`,
        query: {
            tahun: data.tahun || new Date().getFullYear()
        }
    });
}

function onClickDetailJadwal(data) {
    router.push({
        path: `/transaction/rapat-rups-lpt/detail/${data.id}`,
        query: {
            Id: data.id,
            Agenda: data.agenda,
            JenisRapat: data.jenisRapat,
            jenisRapatParam: jenisRapatParam.value,
            tahun: tahunParam.value || new Date().getFullYear()
        }
    });
}

function onClickUpload(data) {
    router.push({
        path: `/transaction/rapat-rups-lpt/edit/${data.id}`,
        query: {
            tahun: data.tahun || new Date().getFullYear(),
            mode: 'upload'
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
            tanggalRapat: data.tanggalRapatFrom || data.tanggalRapat,
            jenisRapat: data.jenisRapat,
            tahun: tahun
        }
    });
}

// Dynamic action menu items based on role
const getActionMenuItems = () => {
    const baseItems = [
        {
            label: 'Detail Jadwal',
            icon: 'pi pi-info-circle',
            command: () => {
                onClickDetailJadwal(selectedData.value);
            }
        },
        {
            separator: true
        },
        {
            label: 'Hapus Jadwal',
            icon: 'pi pi-trash',
            class: 'text-red-500',
            command: () => {
                onClickDeleteJadwal(selectedData.value);
            }
        }
    ];

    // Add role-specific first item
    const currentRole = getDisplayRole();
    if (currentRole === '2' || currentRole === 2) {
        // Role 2: Show Edit/Upload Rapat (for Step 2 & 3)
        return [
            {
                label: 'Attachment & Arahan',
                icon: 'pi pi-pencil',
                class: 'text-blue-600',
                command: () => {
                    onClickEditJadwal(selectedData.value);
                }
            },
            ...baseItems
        ];
    } 
    else {
        // Other roles: only basic items
        return [
            ...baseItems
        ];
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
                await JadwalRapatService.delete(data.id);
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

// ==========================================
// TABLE EVENT HANDLERS
// ==========================================
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    applyFiltersAndPagination();
};

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    param.value.page = 0; // Reset to first page when sorting changes
    applyFiltersAndPagination();
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
// DATA LOADING FUNCTIONS
// ==========================================
const loadJenisRapatOptions = async () => {
    try {
        const response = await JenisRapattService.get();
        
        if (response.data && response.data.success === true && response.data.data) {
            // Map to options format
            jenisRapatOptions.value = response.data.data.map(item => ({
                label: item.jenisRapat,
                value: item.id
            }));
            
            // Create mapping object using kodeJenisRapat as key
            const mapping = {};
            response.data.data.forEach(item => {
                mapping[item.kodeJenisRapat.toString()] = item.jenisRapat;
            });
            jenisRapatMapping.value = mapping;
        }
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data jenis rapat: ' + error.message,
            life: 3000
        });
    }
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(() => {
    tahunParam.value = route.params.tahun || null;
    
    // Extract jenisRapat dari path (format: /transaction/xxx/:tahun/:jenisRapatId)
    const pathSegments = route.path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Check if last segment is a number (jenisRapat ID)
    if (lastSegment && /^\d+$/.test(lastSegment)) {
        jenisRapatParam.value = lastSegment;
    } else {
        jenisRapatParam.value = null;
    }
    
    // Initialize action menu items after all functions are defined
    actionMenuItems.value = getActionMenuItems();
    
    // Load jenis rapat options and other data
    loadJenisRapatOptions();
    getData();
    getLoginRole();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Jadwal Rapat Korporat
            <span v-if="tahunParam" class="text-lg text-gray-600 ml-2">
                - Tahun {{ tahunParam }}
            </span>
            <span v-if="jenisRapatParam && jenisRapatMapping[jenisRapatParam]" class="text-lg text-gray-600 ml-2">
                - {{ jenisRapatMapping[jenisRapatParam] }}
            </span>
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
            <div class="flex items-center gap-2">
                <i class="pi pi-filter text-yellow-600"></i>
                <span class="text-sm text-yellow-800">
                    <strong>Filter Aktif:</strong> 
                    <span v-if="tahunParam">Menampilkan data jadwal rapat untuk tahun {{ tahunParam }}</span>
                    <span v-if="tahunParam && jenisRapatParam && jenisRapatMapping[jenisRapatParam]"> dan </span>
                    <span v-if="jenisRapatParam && jenisRapatMapping[jenisRapatParam]">jenis rapat {{ jenisRapatMapping[jenisRapatParam] }}</span>
                </span>
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
                            
                            <!-- Add Jadwal Rapat Button (Role 2) -->
                            <Button
                                as="router-link"
                                label="Add Jadwal Rapat"
                                v-if="getDisplayRole() === '2' || getDisplayRole() === 2 || authStore.role === '2' || authStore.role === 2"
                                :to="{
                                    path: '/transaction/rapat-rups-lpt/add',
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
                    field="agenda"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Agenda</div>
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
                </Column>
                <Column
                    dataType="text"
                    field="jenisRapat"
                    style="min-width: 180px"
                    sortable
                >
                    <template #header>
                        <div class="font-semibold text-gray-900">Jenis Rapat</div>
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="tanggalRapat"
                    style="min-width: 160px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Tanggal Rapat</div>
                            <div v-if="showFilters" class="w-full">
                                <DatePicker 
                                    v-model="columnFilters.tanggalRapat"
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
                        {{ new Date(data.tanggalRapatFrom || data.tanggalRapat).toLocaleDateString('id-ID') }}
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="waktuRapat"
                    style="min-width: 180px"
                    sortable
                >
                    <template #header>
                        <div class="font-semibold text-gray-900">Waktu Rapat</div>
                    </template>
                    <template #body="{ data }">
                        <div v-if="data.tanggalRapatFrom && data.tanggalRapatTo" class="text-sm">
                            <div>{{ new Date(data.tanggalRapatFrom).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</div>
                            <div class="text-gray-500">-</div>
                            <div>{{ new Date(data.tanggalRapatTo).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}</div>
                        </div>
                        <div v-else-if="data.tanggalRapat" class="text-sm">
                            {{ new Date(data.tanggalRapat).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }}
                        </div>
                        <div v-else class="text-gray-400">-</div>
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="modelRapat"
                    style="min-width: 120px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Model Rapat</div>
                            <div v-if="showFilters" class="w-full">
                                <Select 
                                    v-model="columnFilters.modelRapat"
                                    :options="modelRapatOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Pilih model"
                                    class="w-full"
                                    @change="onFilterChange"
                                    :showClear="true"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                    <template #body="{ data }">
                        <Tag 
                            :value="data.modelRapat" 
                            :severity="data.modelRapat === 'Online' ? 'success' : data.modelRapat === 'Offline' ? 'warning' : 'info'"
                        />
                    </template>
                </Column>
                <Column
                    dataType="numeric"
                    field="durasi"
                    style="min-width: 140px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Durasi (menit)</div>
                            <div v-if="showFilters" class="w-full">
                                <InputNumber 
                                    v-model="columnFilters.durasi"
                                    placeholder="Durasi (jam)"
                                    class="w-full"
                                    @input="onFilterChange"
                                    :showButtons="false"
                                    :min="0"
                                    :max="1440"
                                    :step="30"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                    <template #body="{ data }">
                        {{ data.durasi }} menit
                    </template>
                </Column>
                <Column
                    dataType="text"
                    field="lokasi"
                    style="min-width: 180px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Lokasi</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.lokasi"
                                    placeholder="Filter lokasi..."
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
                    field="deskripsi"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Deskripsi</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.deskripsi"
                                    placeholder="Filter deskripsi..."
                                    class="w-full"
                                    @input="onFilterChange"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                </Column>
                <!-- <Column
                    dataType="numeric"
                    field="statusDecision"
                    style="min-width: 160px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Status Decision</div>
                            <div v-if="showFilters" class="w-full">
                                <Select 
                                    v-model="columnFilters.statusDecision"
                                    :options="statusDecisionOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Pilih status"
                                    class="w-full"
                                    @change="onFilterChange"
                                    :showClear="true"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                    <template #body="{ data }">
                        <Tag 
                            :value="data.statusDecision === 1 ? 'Sudah Diputuskan' : 'Belum Diputuskan'" 
                            :severity="data.statusDecision === 1 ? 'success' : 'warning'"
                        />
                    </template>
                </Column> -->
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
