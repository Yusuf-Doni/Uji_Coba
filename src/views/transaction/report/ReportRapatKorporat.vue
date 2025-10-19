<script setup>
// Vue Composition API
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import Tag from 'primevue/tag';
import Toast from 'primevue/toast';
import ProgressBar from 'primevue/progressbar';

// Services
import reportService from './service/ReportService';
import jenisRapatService from '@/views/master/rapatKerja/service/JenisRapatService';

// ==========================================
// COMPOSABLES & STORES
// ==========================================
const toast = useToast();
const router = useRouter();
const authStore = useAuth();

// ==========================================
// REACTIVE DATA
// ==========================================
const isLoading = ref(false);
const reportData = ref([]);
const filteredData = ref([]);

// Filter visibility
const showFilters = ref(false);

// Filter data
const searchText = ref('');
const selectedStatus = ref(null);
const selectedJenisRapat = ref(null);
const selectedYear = ref(null); // Remove default year filter
const dateRange = ref(null);

// Status options - based on API response format
const statusOptions = ref([
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Selesai Berkelanjutan', value: 'Selesai Berkelanjutan' },
    { label: 'Selesai', value: 'Selesai' }
]);

// Year options
const yearOptions = ref([]);

// Jenis rapat options
const jenisRapatOptions = ref([]);

// ==========================================
// COMPUTED PROPERTIES
// ==========================================
// Use backend filtering - no client-side filtering needed
const filteredReportData = computed(() => {
    return reportData.value || [];
});

// ==========================================
// WATCHERS FOR BACKEND FILTERING
// ==========================================
// Watch filter changes and reload data from backend
watch([searchText, selectedStatus, selectedJenisRapat, selectedYear, dateRange], () => {
    applyFilters();
}, { deep: true });

// ==========================================
// FILTER FUNCTIONS
// ==========================================
const applyFilters = async () => {
    const filters = {
        search: searchText.value,
        statusTindakLanjut: selectedStatus.value,
        jenisRapatId: selectedJenisRapat.value,
        tahun: selectedYear.value,
        dateRange: dateRange.value
    };
    
    await loadReportData(filters);
};

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================
const loadJenisRapatOptions = async () => {
    try {
        const response = await jenisRapatService.get();
        
        if (response.data && response.data.success === true && response.data.data) {
            // Filter out id 3 and 4, then map to options format
            jenisRapatOptions.value = response.data.data
                .filter(item => item.kodeJenisRapat !== 3 && item.kodeJenisRapat !== 4)
                .map(item => ({
                    label: item.jenisRapat,
                    value: item.id
                }));
        } else {
            console.error('No jenis rapat data in response:', response);
        }
    } catch (error) {
        console.error('Error loading jenis rapat options:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data jenis rapat: ' + error.message,
            life: 3000
        });
    }
};

const loadReportData = async (filters = {}) => {
    try {
        isLoading.value = true;
        
        // Build filter parameters according to API specification
        const apiFilters = reportService.buildFilterParams(filters);
        
        const response = await reportService.getRapatKorporatReport(apiFilters);
        
        if (response.data && response.data.success === true && response.data.data) {
            reportData.value = response.data.data;
            filteredData.value = [...reportData.value];
        } else {
            console.error('No data in response:', response);
            throw new Error('Data tidak ditemukan');
        }
    } catch (error) {
        console.error('Error loading report data:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal memuat data report: ' + error.message,
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Selesai': return 'success';
        case 'Selesai Berkelanjutan': return 'warning';
        case 'In Progress': return 'info';
        default: return 'secondary';
    }
};

const getProgressSeverity = (progress) => {
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'warning';
    return 'info';
};

const exportToExcel = async () => {
    try {
        
        // Get current filters with correct parameter names
        const filters = {
            search: searchText.value,
            statusTindakLanjut: selectedStatus.value,
            jenisRapatId: selectedJenisRapat.value,
            tahun: selectedYear.value,
            dateRange: dateRange.value
        };
        
        // Build filter parameters according to API specification
        const apiFilters = reportService.buildFilterParams(filters);
        
        // Show loading state
        isLoading.value = true;
        
        // Call service to get data
        const response = await reportService.exportRapatKorporatToExcel(apiFilters);
        
        // Check if response has data
        if (!response.data || !response.data.success || !response.data.data) {
            throw new Error('No data available for export');
        }
        
        const exportData = response.data.data;
        if (!Array.isArray(exportData) || exportData.length === 0) {
            throw new Error('No data to export');
        }
        
        // Generate Excel file from data
        const filename = `Report_Rapat_Korporat_${new Date().toISOString().slice(0, 10)}.xlsx`;
        await reportService.generateExcelFromData(exportData, filename, 'corporate');
        
        toast.add({
            severity: 'success',
            summary: 'Export Berhasil',
            detail: 'File Excel berhasil diunduh',
            life: 3000
        });
    } catch (error) {
        console.error('Export error:', error);
        
        let errorMessage = 'Gagal melakukan export Excel';
        if (error.response?.data) {
            // If it's a JSON error response
            if (typeof error.response.data === 'string' && error.response.data.includes('{')) {
                try {
                    const errorData = JSON.parse(error.response.data);
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch (parseError) {
                    console.error('Error parsing error response:', parseError);
                }
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        toast.add({
            severity: 'error',
            summary: 'Export Error',
            detail: errorMessage,
            life: 5000
        });
    } finally {
        isLoading.value = false;
    }
};


const clearFilters = async () => {
    searchText.value = '';
    selectedStatus.value = null;
    selectedJenisRapat.value = null;
    selectedYear.value = null;
    dateRange.value = null;
    
    // Reload data with cleared filters
    await loadReportData({});
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
const goBack = () => {
    router.push('/');
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(() => {
    // Generate year options (current year ± 5 years)
    const currentYear = new Date().getFullYear();
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        yearOptions.value.push({ label: i.toString(), value: i });
    }
    
    // Load jenis rapat options and report data
    loadJenisRapatOptions();
    loadReportData();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Report Rapat Korporat
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

        <!-- Filter Toggle Button -->
        <div class="mb-4">
            <Button
                :icon="showFilters ? 'pi pi-eye-slash' : 'pi pi-eye'"
                :label="showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'"
                severity="secondary"
                size="small"
                @click="showFilters = !showFilters"
                class="mb-2"
            />
            <span v-if="!showFilters && (searchText || selectedStatus || selectedJenisRapat || selectedYear || dateRange)" class="ml-3 text-sm text-blue-600">
                <i class="pi pi-filter mr-1"></i>
                Filter aktif - {{ filteredReportData.length }} data ditampilkan
            </span>
        </div>

        <!-- Filter Card -->
        <Card v-show="showFilters" class="mb-6">
            <template #content>
                <div class="space-y-4">
                    <!-- Search Row -->
                    <div class="flex gap-4 items-end">
                        <div class="flex-1">
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                <i class="pi pi-search mr-1"></i>
                                Pencarian
                            </label>
                            <InputText
                                v-model="searchText"
                                placeholder="Cari arahan, PIC, action plan..."
                                class="w-full"
                            />
                        </div>
                        <Button
                            icon="pi pi-filter-slash"
                            severity="secondary"
                            @click="clearFilters"
                            v-tooltip="'Hapus Filter'"
                            :loading="isLoading"
                        />
                    </div>

                    <!-- Filter Row -->
                    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <!-- Status Filter -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Status
                            </label>
                            <Dropdown
                                v-model="selectedStatus"
                                :options="statusOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Semua Status"
                                class="w-full"
                                :showClear="true"
                            />
                        </div>

                        <!-- Jenis Rapat Filter -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Jenis Rapat
                            </label>
                            <Dropdown
                                v-model="selectedJenisRapat"
                                :options="jenisRapatOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Semua Jenis Rapat"
                                class="w-full"
                                :showClear="true"
                            />
                        </div>

                        <!-- Year Filter -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Tahun
                            </label>
                            <Dropdown
                                v-model="selectedYear"
                                :options="yearOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih Tahun"
                                class="w-full"
                            />
                        </div>

                        <!-- Date Range -->
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">
                                Range Tanggal
                            </label>
                            <Calendar
                                v-model="dateRange"
                                selectionMode="range"
                                placeholder="Pilih range"
                                class="w-full"
                                :showIcon="true"
                                dateFormat="dd/mm/yy"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </Card>

        <!-- Report Table Card -->
        <Card>
            <template #content>
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">
                        <i class="pi pi-table mr-2"></i>
                        Data Report Rapat Korporat
                    </h3>
                    
                    <div class="flex gap-2">
                        <Button
                            icon="pi pi-file-excel"
                            label="Export Excel"
                            severity="success"
                            size="small"
                            @click="exportToExcel"
                        />
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="isLoading" class="flex justify-center items-center h-64">
                    <div class="text-center">
                        <i class="pi pi-spin pi-spinner text-4xl text-blue-600 mb-4"></i>
                        <p class="text-gray-600">Memuat data report...</p>
                    </div>
                </div>

                <!-- Data Table -->
                <div v-else>
                    <DataTable
                        :value="filteredReportData"
                        :paginator="true"
                        :rows="10"
                        :rowsPerPageOptions="[10, 20, 50]"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="Menampilkan {first} sampai {last} dari {totalRecords} data"
                        :loading="isLoading"
                        class="p-datatable-sm"
                        responsiveLayout="scroll"
                    >
                        <Column field="no" header="No" :sortable="true" style="width: 60px">
                            <template #body="slotProps">
                                {{ slotProps.index + 1 }}
                            </template>
                        </Column>

                        <Column field="arahan" header="Arahan" :sortable="true" style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="text-sm">
                                    {{ slotProps.data.arahan || '-' }}
                                </div>
                            </template>
                        </Column>

                        <Column field="pic" header="PIC" :sortable="true" style="min-width: 120px">
                            <template #body="slotProps">
                                <div class="font-medium">
                                    {{ slotProps.data.pic || '-' }}
                                </div>
                            </template>
                        </Column>

                        <Column field="actionPlan" header="Action Plan" :sortable="true" style="min-width: 200px">
                            <template #body="slotProps">
                                <div class="text-sm">
                                    {{ slotProps.data.actionPlan || '-' }}
                                </div>
                            </template>
                        </Column>

                        <Column field="targetWaktu" header="Target Waktu" :sortable="true" style="width: 120px">
                            <template #body="slotProps">
                                <div class="text-sm">
                                    {{ formatDate(slotProps.data.targetWaktu) }}
                                </div>
                            </template>
                        </Column>

                        <Column field="progress" header="%Progress" :sortable="true" style="width: 120px">
                            <template #body="slotProps">
                                <div class="flex items-center gap-2">
                                    <ProgressBar
                                        :value="slotProps.data.progress || 0"
                                        :severity="getProgressSeverity(slotProps.data.progress || 0)"
                                        style="height: 8px; flex: 1;"
                                    />
                                    <span class="text-xs font-medium">
                                        {{ slotProps.data.progress || 0 }}%
                                    </span>
                                </div>
                            </template>
                        </Column>

                        <Column field="statusTindaklanjut" header="Status" :sortable="true" style="width: 150px">
                            <template #body="slotProps">
                                <Tag
                                    :value="slotProps.data.statusTindaklanjut || '-'"
                                    :severity="getStatusSeverity(slotProps.data.statusTindaklanjut)"
                                />
                            </template>
                        </Column>

                        <Column field="linkEvidence" header="Link Evidence" style="width: 100px">
                            <template #body="slotProps">
                                <Button
                                    v-if="slotProps.data.linkEvidence"
                                    icon="pi pi-external-link"
                                    severity="info"
                                    size="small"
                                    @click="window.open(slotProps.data.linkEvidence, '_blank')"
                                    v-tooltip="'Buka Link'"
                                />
                                <span v-else class="text-gray-400">-</span>
                            </template>
                        </Column>

                        <Column field="keterangan" header="Keterangan" :sortable="true" style="min-width: 150px">
                            <template #body="slotProps">
                                <div class="text-sm">
                                    {{ slotProps.data.keterangan || '-' }}
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                </div>

                <!-- Summary -->
                <div v-if="!isLoading" class="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-center text-sm text-gray-600">
                        <span>
                            <strong>Total Data:</strong> {{ filteredReportData.length }} data ditampilkan
                        </span>
                        <span v-if="searchText || selectedStatus || selectedJenisRapat || selectedYear || dateRange">
                            <strong>Filter Aktif:</strong> Data difilter berdasarkan parameter yang dipilih
                        </span>
                    </div>
                </div>
            </template>
        </Card>
    </div>
    
    <!-- Global Components -->
    <Toast />
</template>

<style scoped lang="scss">
// Custom styles
.space-y-6 > * + * {
    margin-top: 1.5rem;
}

.space-y-4 > * + * {
    margin-top: 1rem;
}

// Table styling
:deep(.p-datatable) {
    .p-datatable-header {
        background-color: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .p-datatable-thead > tr > th {
        background-color: #f1f5f9;
        font-weight: 600;
        color: #374151;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .p-datatable-tbody > tr:hover {
        background-color: #f8fafc;
    }
}

// Progress bar styling
:deep(.p-progressbar) {
    border-radius: 4px;
    
    .p-progressbar-value {
        border-radius: 4px;
    }
}

// Card styling
:deep(.p-card) {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

// Grid styling
.grid {
    display: grid;
}

.grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
}

.col-span-1 {
    grid-column: span 1 / span 1;
}

.col-span-2 {
    grid-column: span 2 / span 2;
}

.col-span-3 {
    grid-column: span 3 / span 3;
}

.col-span-4 {
    grid-column: span 4 / span 4;
}

.col-span-12 {
    grid-column: span 12 / span 12;
}

@media (min-width: 1024px) {
    .lg\\:col-span-1 {
        grid-column: span 1 / span 1;
    }
    
    .lg\\:col-span-2 {
        grid-column: span 2 / span 2;
    }
    
    .lg\\:col-span-3 {
        grid-column: span 3 / span 3;
    }
    
    .lg\\:col-span-4 {
        grid-column: span 4 / span 4;
    }
}
</style>