<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useRouter, useRoute } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import Menu from 'primevue/menu';
import IParams from '@/interface/IParams';
import TindakLanjutService from './service/TindakLanjutService';

const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const route = useRoute();

// Reactive data
const datas = ref([]);
const allData = ref([]);
const loading = ref(false);
const totalRecords = ref(0);
const search = ref('');
const isLoadingApproval = ref(false);
const isLoadingReject = ref(false);

// Route parameters
const tahunParam = ref(null);
const jenisRapatParam = ref(null);

// Sorting state management
const sortField = ref(null);
const sortOrder = ref(null);

// Filter state management
const showFilters = ref(false);
const columnFilters = ref({
    agenda: '',
    namaPic: '',
    arahan: '',
    statusTindaklanjut: '',
    statusApproval: '',
    actionPlan: '',
    progress: '',
    deskripsi: ''
});

// Menu untuk aksi
const actionMenu = ref();
const selectedDataForMenu = ref(null);

// Computed properties untuk menentukan kolom mana yang ditampilkan
const showApprovalColumn = computed(() => {
    // Tampilkan kolom Approval jika ada data dengan statusApproval bukan 1 atau 2
    if (!datas.value || datas.value.length === 0) return true;
    return datas.value.some(data => 
        data.statusApproval != 1 && 
        data.statusApproval != 2 && 
        data.statusApproval != '1' && 
        data.statusApproval != '2'
    );
});

const showActionColumn = computed(() => {
    // Tampilkan kolom Action jika ada data dengan statusApproval bukan 0
    if (!datas.value || datas.value.length === 0) return true;
    return datas.value.some(data => 
        data.statusApproval != 0 && 
        data.statusApproval != '0'
    );
});

const actionMenuItems = ref([
    {
        label: 'Detail',
        icon: 'pi pi-eye',
        command: () => {
            onClickDetailTable(selectedDataForMenu.value);
        }
    },
    {
        label: 'Upload',
        icon: 'pi pi-upload',
        class: 'text-red-500',
        command: () => {
            onClickUploadTable(selectedDataForMenu.value);
        }
    },
    {
        label: 'Delete',
        icon: 'pi pi-trash',
        class: 'text-red-500',
        command: () => {
            onClickDeleteTable(selectedDataForMenu.value);
        }
    }
    // ,
    // {
    //     label: 'Reject',
    //     icon: 'pi pi-times-circle',
    //     class: 'text-red-500',
    //     command: () => {
    //         onClickRejectTable(selectedDataForMenu.value);
    //     }
    // }
]);

const toggleActionMenu = (event, data) => {
    selectedDataForMenu.value = data;
    actionMenu.value.toggle(event);
};

// Filter control functions
const toggleFilters = () => {
    showFilters.value = !showFilters.value;
};

const clearAllFilters = () => {
    columnFilters.value = {
        agenda: '',
        namaPic: '',
        arahan: '',
        statusTindaklanjut: '',
        statusApproval: '',
        actionPlan: '',
        progress: '',
        deskripsi: ''
    };
    getData();
};

const onFilterChange = () => {
    getData();
};

// Apply filters and pagination
const applyFiltersAndPagination = () => {
    let filteredData = [...allData.value];
    
    // Global search filter
    if (search.value) {
        const searchLower = search.value.toLowerCase();
        filteredData = filteredData.filter(item => 
            item.agenda?.toLowerCase().includes(searchLower) ||
            item.namaPic?.toLowerCase().includes(searchLower) ||
            item.arahan?.toLowerCase().includes(searchLower) ||
            item.statusTindaklanjutDesc?.toLowerCase().includes(searchLower) ||
            item.actionPlan?.toLowerCase().includes(searchLower) ||
            item.progress?.toLowerCase().includes(searchLower) ||
            item.deskripsi?.toLowerCase().includes(searchLower)
        );
    }
    
    // Apply column filters
    if (columnFilters.value.agenda) {
        filteredData = filteredData.filter(item => 
            item.agenda?.toLowerCase().includes(columnFilters.value.agenda.toLowerCase())
        );
    }
    if (columnFilters.value.namaPic) {
        filteredData = filteredData.filter(item => 
            item.namaPic?.toLowerCase().includes(columnFilters.value.namaPic.toLowerCase())
        );
    }
    if (columnFilters.value.arahan) {
        filteredData = filteredData.filter(item => 
            item.arahan?.toLowerCase().includes(columnFilters.value.arahan.toLowerCase())
        );
    }
    if (columnFilters.value.statusTindaklanjut) {
        filteredData = filteredData.filter(item => 
            item.statusTindaklanjutDesc?.toLowerCase().includes(columnFilters.value.statusTindaklanjut.toLowerCase())
        );
    }
    if (columnFilters.value.statusApproval) {
        filteredData = filteredData.filter(item => 
            item.statusApproval?.toLowerCase().includes(columnFilters.value.statusApproval.toLowerCase())
        );
    }
    if (columnFilters.value.actionPlan) {
        filteredData = filteredData.filter(item => 
            item.actionPlan?.toLowerCase().includes(columnFilters.value.actionPlan.toLowerCase())
        );
    }
    if (columnFilters.value.progress) {
        filteredData = filteredData.filter(item => 
            item.progress?.toLowerCase().includes(columnFilters.value.progress.toLowerCase())
        );
    }
    if (columnFilters.value.deskripsi) {
        filteredData = filteredData.filter(item => 
            item.deskripsi?.toLowerCase().includes(columnFilters.value.deskripsi.toLowerCase())
        );
    }
    
    // Sorting
    if (sortField.value && sortOrder.value) {
        filteredData.sort((a, b) => {
            let aValue = a[sortField.value];
            let bValue = b[sortField.value];
            
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
    
    datas.value = filteredData;
    totalRecords.value = filteredData.length;
};

// Modal states
const showApprovalModal = ref(false);
const showRejectModal = ref(false);
const showDisapprovalModal = ref(false);
const selectedData = ref(null);
const rejectReason = ref('');
const disapprovalReason = ref('');

// Pagination params
// const param = ref(new IParams());

// Methods
const getData = async () => {
    loading.value = true;
    try {
        const response = await TindakLanjutService.get();

        if (response.data && response.data.success) {
            allData.value = response.data.data || [];
            console.log('MASUK SINI GA 1', allData.value);
        } else {
            allData.value = [];
            console.log('MASUK SINI GA 2', allData.value);
        }
        console.log('MASUK SINI GA 3', allData.value);
        applyFiltersAndPagination();
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal mengambil data approval',
            life: 3000
        });
        allData.value = [];
        datas.value = [];
        totalRecords.value = 0;
    } finally {
        loading.value = false;
    }
};

const onPage = (event) => {
    // param.value.page = event.page;
    // param.value.size = event.rows;
    getData();
};

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    getData();
};

const onClickDetailTable = (data) => {
    router.push({
        path: '/transaction/tindak-lanjut/detail/detail-rapat',
        query: {
            id: data.id,
            mode: 'pic' 
        }
    });
};
const onClickUploadTable = (data) => {
    router.push({
        path: '/transaction/tindak-lanjut/detail/detail-rapat',
        query: {
            id: data.id,
            mode: 'upload'
        }
    });
};

// const onClickUploadFormReviewGovernanceTable = (data) => {
//     // TODO: Implement upload functionality
//     toast.add({
//         severity: 'info',
//         summary: 'Upload',
//         detail: `Upload form review governance untuk: ${data.agenda}`,
//         life: 3000
//     });
// };

const onClickDeleteTable = async (data) => {
    console.log('Data:', data);
    if (!data || !data.id) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Data tidak valid untuk dihapus',
            life: 3000
        });
        return;
    }

    // Show confirmation dialog
    confirm.require({
        message: `Apakah Anda yakin ingin menghapus tindak lanjut rapat "${data.agenda}"?`,
        header: 'Konfirmasi Hapus',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Batal',
        acceptLabel: 'Hapus',
        rejectClass: 'p-button-secondary',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                loading.value = true;
                const response = await TindakLanjutService.delete(data.id);
                
                if (response.data && response.data.success) {
                    toast.add({
                        severity: 'success',
                        summary: 'Berhasil',
                        detail: 'Tindak lanjut rapat berhasil dihapus',
                        life: 3000
                    });
                    
                    // Refresh data after successful deletion
                    getData();
                } else {
                    toast.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: response.data?.message || 'Gagal menghapus tindak lanjut rapat',
                        life: 3000
                    });
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal menghapus tindak lanjut rapat',
                    life: 3000
                });
            } finally {
                loading.value = false;
            }
        }
    });
};

// const onClickRejectTable = (data) => {
//     selectedData.value = data;
//     rejectReason.value = '';
//     showRejectModal.value = true;
// };
//================================================================ tombol approval  ===========================================
const handleApproval = (data) => {
    selectedData.value = data;
    showApprovalModal.value = true;
};

const handleApprovalSubmit = async () => {
    if (!selectedData.value) return;
    
    isLoadingApproval.value = true;
    try {
        // Call API untuk approve
        const response = await TindakLanjutService.approve(
            selectedData.value.id,
            selectedData.value.jadwalRapatId,
            selectedData.value.picId
        );
        
        if (response.data && response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Tindak lanjut rapat berhasil disetujui',
                life: 3000
            });
            
            showApprovalModal.value = false;
            getData(); // Refresh data
        } else {
            throw new Error(response.data?.message || 'Gagal menyetujui tindak lanjut rapat');
        }
    } catch (error) {
        console.error('Approval error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal menyetujui tindak lanjut rapat',
            life: 3000
        });
    } finally {
        isLoadingApproval.value = false;
    }
};

const handleReject = (data) => {
    selectedData.value = data;
    disapprovalReason.value = '';
    showDisapprovalModal.value = true;
};

const handleDisapproval = async () => {
    if (!selectedData.value || !disapprovalReason.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Alasan penolakan harus diisi',
            life: 3000
        });
        return;
    }
    
    if (disapprovalReason.value.length > 100) {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'Alasan penolakan maksimal 100 karakter',
            life: 3000
        });
        return;
    }
    
    isLoadingReject.value = true;
    try {
        // Call API untuk reject dengan alasan
        const response = await TindakLanjutService.reject(
            selectedData.value.id,
            selectedData.value.jadwalRapatId,
            selectedData.value.picId,
            disapprovalReason.value.trim()
        );
        
        if (response.data && response.data.success) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Tindak lanjut rapat berhasil ditolak',
                life: 3000
            });
            
            showDisapprovalModal.value = false;
            disapprovalReason.value = '';
            getData(); // Refresh data
        } else {
            throw new Error(response.data?.message || 'Gagal menolak tindak lanjut rapat');
        }
    } catch (error) {
        console.error('Reject error:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Gagal melakukan penolakan tindak lanjut rapat',
            life: 3000
        });
    } finally {
        isLoadingReject.value = false;
    }
};

//======================================================================================================================

// Lifecycle
onMounted(() => {
    tahunParam.value = route.query.tahun || route.params.tahun || null;
    jenisRapatParam.value = route.query.jenisRapat || route.params.jenisRapat || null;
    
    // Display received parameters in console for debugging
    console.log('TindakLanjutRapat - Received parameters:', {
        tahun: tahunParam.value,
        jenisRapat: jenisRapatParam.value,
        routeQuery: route.query,
        routeParams: route.params
    });
    
    getData();
});
</script>

<template>
    <div class="w-full">
        <div class="card w-full">
            <div class="font-semibold text-xl mb-4">
                Daftar Tindak Lanjut Rapat
                <span v-if="tahunParam" class="text-lg text-gray-600 ml-2">
                    - Tahun {{ tahunParam }}
                </span>
                <span v-if="jenisRapatParam" class="text-lg text-gray-600 ml-2">
                    - Jenis Rapat: {{ jenisRapatParam }}
                </span>
            </div>
            
            <!-- Parameter Information Display -->
            <div v-if="tahunParam || jenisRapatParam" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div class="flex items-center gap-2">
                    <i class="pi pi-info-circle text-blue-600"></i>
                    <span class="text-sm text-blue-800">
                        <strong>Parameter dari menu sebelumnya:</strong>
                        <span v-if="tahunParam"> Tahun: {{ tahunParam }}</span>
                        <span v-if="tahunParam && jenisRapatParam"> | </span>
                        <span v-if="jenisRapatParam"> Jenis Rapat: {{ jenisRapatParam }}</span>
                    </span>
                </div>
            </div>
            <div class="card mb-6 w-full">
                    <DataTable
                        :value="datas"
                        :paginator="true"
                        scrollable
                        :rows="10"
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
                        class="w-full"
                        style="width: 100%"
                    >
                        <template #header>
                            <div class="flex justify-between items-center w-full">
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
                                <div class="flex gap-4">
                                    <InputText autocomplete="off" 
                                        v-model="search"
                                        @change="getData()"
                                        placeholder="Search"
                                        class="h-8 px-3"
                                        style="width: 200px;"
                                    />
                                </div>
                            </div>
                        </template>
                        <template #empty> Data not found... </template>
                        <template #loading> Loading data. Please wait. </template>
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
                            field="namaPic"
                            style="min-width: 150px"
                            sortable
                        >
                            <template #header>
                                <div class="w-full">
                                    <div class="font-semibold text-gray-900 mb-2">Nama PIC</div>
                                    <div v-if="showFilters" class="w-full">
                                        <InputText 
                                            v-model="columnFilters.namaPic"
                                            placeholder="Filter nama PIC..."
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
                            field="arahan"
                            style="min-width: 150px"
                            sortable
                        >
                            <template #header>
                                <div class="w-full">
                                    <div class="font-semibold text-gray-900 mb-2">Arahan</div>
                                    <div v-if="showFilters" class="w-full">
                                        <InputText 
                                            v-model="columnFilters.arahan"
                                            placeholder="Filter arahan..."
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
                            field="actionPlan"
                            style="min-width: 150px"
                            sortable
                        >
                            <template #header>
                                <div class="w-full">
                                    <div class="font-semibold text-gray-900 mb-2">Action Plan</div>
                                    <div v-if="showFilters" class="w-full">
                                        <InputText 
                                            v-model="columnFilters.actionPlan"
                                            placeholder="Filter action plan..."
                                            class="w-full"
                                            @input="onFilterChange"
                                            size="small"
                                        />
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <!-- <Column
                            dataType="text"
                            field="deskripsi"
                            style="min-width: 180px"
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
                        </Column> -->
                        <!-- <Column
                            dataType="text"
                            field="statusTindaklanjutDesc"
                            style="min-width: 150px"
                            sortable
                        >
                            <template #header>
                                <div class="w-full">
                                    <div class="font-semibold text-gray-900 mb-2">Status Tindak Lanjut</div>
                                    <div v-if="showFilters" class="w-full">
                                        <InputText 
                                            v-model="columnFilters.statusTindaklanjut"
                                            placeholder="Filter status tindak lanjut..."
                                            class="w-full"
                                            @input="onFilterChange"
                                            size="small"
                                        />
                                    </div>
                                </div>
                            </template>
                        </Column> -->
                        <Column
                        header="Status Approval"
                        dataType="text"
                        field="statusApproval"
                        >
                        <template #body="{ data }">
                            <span v-if="data.statusApproval === 0 || data.statusApproval === ''">Perlu diapprove</span>
                            <span v-else-if="data.statusApproval === 1 || data.statusApproval === '1'">Approved</span>
                            <span v-else-if="data.statusApproval === 2 || data.statusApproval === '2'">Rejected</span>
                            <span v-else>-</span>
                        </template>


                            <!-- <template #header>
                                <div class="w-full">
                                    <div class="font-semibold text-gray-900 mb-2">Status Approval</div>
                                    <div v-if="showFilters" class="w-full">
                                        <InputText 
                                            v-model="columnFilters.statusApproval"
                                            placeholder="Filter status approval..."
                                            class="w-full"
                                            @input="onFilterChange"
                                            size="small"
                                        />
                                    </div>
                                </div>
                            </template> -->
                        </Column>
                        <Column
                            dataType="text"
                            field="progress"
                            style="min-width: 120px"
                            sortable
                        >
                            <template #header>
                                <div class="w-full">
                                    <div class="font-semibold text-gray-900 mb-2">Progress</div>
                                    <div v-if="showFilters" class="w-full">
                                        <InputText 
                                            v-model="columnFilters.progress"
                                            placeholder="Filter progress..."
                                            class="w-full"
                                            @input="onFilterChange"
                                            size="small"
                                        />
                                    </div>
                                </div>
                            </template>
                        </Column>
                        <Column
                            header="Approval"
                            class="w-[5rem]"
                        >
                            <template #body="{ data }">
                                <div
                                    v-if="data.statusApproval != 1 && data.statusApproval != 2 && data.statusApproval != '1' && data.statusApproval != '2'"
                                    class="flex flex-col md:flex-row gap-2 justify-center items-start"
                                >
                                    <Button
                                        icon="pi pi-check-circle"
                                        severity="secondary"
                                        text
                                        rounded
                                        @click="handleApproval(data)"
                                        aria-haspopup="true"
                                        aria-controls="action_menu"
                                        v-tooltip.bottom="'Approval'"
                                    />
                                    <Button
                                        icon="pi pi-times-circle"
                                        severity="secondary"
                                        text
                                        rounded
                                        @click="handleReject(data)"
                                        aria-haspopup="true"
                                        aria-controls="action_menu"
                                        v-tooltip.bottom="'Reject'"
                                    />
                                </div>
                                <div v-else class="text-gray-400 text-center">-</div>
                            </template>
                        </Column>
                        <Column
                            header="Action"
                            class="w-[5rem]"
                        >
                            <template #body="{ data }">
                                <div
                                    v-if="data.statusApproval != 0 && data.statusApproval != '0'"
                                    class="flex flex-col md:flex-row gap-2 justify-center items-start"
                                >
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
                                <div v-else class="text-gray-400 text-center">-</div>
                            </template>
                        </Column>
                    </DataTable>
            </div>
        </div>
    </div>
    <Menu ref="actionMenu" :model="actionMenuItems" :popup="true" />

    <!-- Approval Modal -->
    <Dialog v-model:visible="showApprovalModal" modal header="Approval Tindak Lanjut Rapat" :style="{ width: '32rem' }">
        <div class="space-y-4">
            <!-- Agenda Rapat -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Agenda Rapat</label>
                <InputText 
                    :modelValue="selectedData?.agenda || ''"
                    readonly
                    class="w-full bg-gray-50"
                />
            </div>

            <!-- Target Waktu -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Target Waktu</label>
                <InputText 
                    :modelValue="selectedData?.targetWaktu || ''"
                    placeholder="Target Waktu"
                    readonly
                    class="w-full bg-gray-50"
                />
            </div>

            <!-- PIC Tindak Lanjut -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">PIC Tindak Lanjut</label>
                <InputText 
                    :modelValue="selectedData?.namaPic || ''"
                    readonly
                    class="w-full bg-gray-50"
                />
            </div>

            <!-- Konfirmasi -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Konfirmasi</label>
                <div class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <i class="pi pi-check-circle text-green-500 text-xl"></i>
                    <span class="font-medium text-green-800">Apakah Anda yakin ingin menyetujui tindak lanjut rapat ini?</span>
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button 
                    label="Batal" 
                    severity="secondary"
                    @click="showApprovalModal = false" 
                />
                <Button 
                    label="Setujui" 
                    severity="success"
                    @click="handleApprovalSubmit" 
                    :loading="isLoadingApproval"
                />
            </div>
        </template>
    </Dialog>

    <!-- Reject Modal -->
    <Dialog v-model:visible="showRejectModal" modal header="Konfirmasi Penolakan" :style="{ width: '25rem' }">
        <div class="flex align-items-center gap-3 mb-3">
            <i class="pi pi-times-circle text-red-500 text-xl"></i>
            <span class="font-medium">Apakah Anda yakin ingin menolak jadwal rapat ini?</span>
        </div>
        <div class="mb-3">
            <label for="rejectReason" class="block text-sm font-medium mb-2">Alasan Penolakan</label>
            <Textarea 
                id="rejectReason"
                v-model="rejectReason" 
                placeholder="Masukkan alasan penolakan..."
                rows="3"
                class="w-full"
            />
        </div>
        <template #footer>
            <Button label="Batal" text @click="showRejectModal = false" />
            <Button label="Tolak" severity="danger" @click="handleReject" :loading="isLoadingReject" />
        </template>
    </Dialog>

    <!-- Reject Modal -->
    <Dialog v-model:visible="showDisapprovalModal" modal header="Penolakan Tindak Lanjut Rapat" :style="{ width: '32rem' }">
        <div class="space-y-4">
            <!-- Agenda Rapat -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Agenda Rapat</label>
                <InputText 
                    :modelValue="selectedData?.agenda || ''"
                    readonly
                    class="w-full bg-gray-50"
                />
            </div>

            <!-- Target Waktu -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Target Waktu</label>
                <InputText 
                    :modelValue="selectedData?.targetWaktu || ''"
                    placeholder="Target Waktu"
                    readonly
                    class="w-full bg-gray-50"
                />
            </div>

            <!-- PIC Tindak Lanjut -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">PIC Tindak Lanjut</label>
                <InputText 
                    :modelValue="selectedData?.namaPic || ''"
                    readonly
                    class="w-full bg-gray-50"
                />
            </div>

            <!-- Alasan Penolakan -->
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan <span class="text-red-500">(*)</span>
                </label>
                <Textarea 
                    v-model="disapprovalReason" 
                    placeholder="Masukkan alasan penolakan"
                    rows="4"
                    class="w-full"
                    :maxlength="100"
                />
                <div class="text-right text-sm text-gray-500 mt-1">
                    {{ disapprovalReason.length }}/100
                </div>
            </div>
        </div>

        <template #footer>
            <div class="flex justify-end gap-2">
                <Button 
                    label="Batal" 
                    severity="secondary"
                    @click="showDisapprovalModal = false" 
                />
                <Button 
                    label="Tolak" 
                    severity="danger"
                    @click="handleDisapproval" 
                    :loading="isLoadingReject"
                />
            </div>
        </template>
    </Dialog>
</template>

<style scoped>
.w-full {
    width: 100% !important;
}

.card {
    width: 100% !important;
    max-width: 100% !important;
}

:deep(.p-datatable) {
    width: 100% !important;
}

:deep(.p-datatable-wrapper) {
    width: 100% !important;
}

:deep(.p-datatable-table) {
    width: 100% !important;
}
</style>