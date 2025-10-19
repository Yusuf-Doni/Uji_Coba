<script setup>
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../interface/IParams';
import GCGService from './service/GCGService';
import { useAuth } from '@/stores';

const datas = ref([]);
const dataGCG = ref();
const search = ref(null);
const loading = ref(null);
const isLoading = ref(false);
const params = ref({
    ...IParams
});
const toast = useToast();
const totalRecords = ref(0);
const router = useRouter();
const confirmDelete = useConfirm();

// Sorting state management
const sortField = ref(null);
const sortOrder = ref(null);

// Filter state management
const showFilters = ref(false);
const columnFilters = ref({
    aspect: '',
    parameter: '',
    status: ''
});

// Menu untuk aksi
const actionMenu = ref();
const selectedData = ref(null);

const actionMenuItems = ref([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            onClickEditGCG(selectedData.value);
        }
    },
    // {
    //     label: 'Manage Evidence',
    //     icon: 'pi pi-file',
    //     command: () => {
    //         onClickManageEvidence(selectedData.value);
    //     }
    // },
    // {
    //     label: 'Self Assessment',
    //     icon: 'pi pi-chart-bar',
    //     command: () => {
    //         onClickSelfAssessment(selectedData.value);
    //     }
    // },
    // {
    //     label: 'View Report',
    //     icon: 'pi pi-file-pdf',
    //     command: () => {
    //         onClickViewReport(selectedData.value);
    //     }
    // },
    {
        separator: true
    },
    {
        label: 'Hapus',
        icon: 'pi pi-trash',
        class: 'text-red-500',
        command: () => {
            onClickDeleteGCG(selectedData.value);
        }
    }
]);

const toggleActionMenu = (event, data) => {
    selectedData.value = data;
    actionMenu.value.toggle(event);
};

function getData() {
    loading.value = true;
    
    // Prepare API parameters
    const apiParams = {
        page: params.value.page,
        size: params.value.size,
        search: search.value || ''
    };
    
    // Add column filters to API parameters
    if (columnFilters.value.aspect) {
        apiParams.aspect = columnFilters.value.aspect;
    }
    if (columnFilters.value.parameter) {
        apiParams.parameter = columnFilters.value.parameter;
    }
    if (columnFilters.value.status) {
        apiParams.status = columnFilters.value.status;
    }
    
    GCGService.get(apiParams)
        .then((response) => {
            if (response.data.code === 200) {
                let filteredData = response.data.data.map(item => ({
                    id: item.id,
                    'No': item.no,
                    'Penjelasan Kriteria': item.kriteriaDescription,
                    'Bobot': item.bobot,
                    'Sub Faktor Level 2': item.subFaktorLevel2,
                    'Sub Faktor Level 1': item.subFaktorLevel1,
                    'Faktor': item.faktor,
                    'Skor Parameter': item.skorParameter,
                    'Skor Indikator': item.skorIndikator,
                    'Skor Aspek': item.skorAspek,
                    'Capaian (%)': item.capaianPercent,
                    'Uraian Pemenuhan': item.uraianPemenuhan,
                    'Dokumen': item.dokumenCount,
                    'PIC': item.pic,
                    'Status': item.status,
                    'Level': item.level || 0, // Ensure Level always has a value
                    'level': item.level || 0, // Also keep lowercase for compatibility
                    'Parent Id': item.parentId,
                    'Aspect Id': item.aspectId,
                    'Parameter Id': item.parameterId
                }));
                
                // Apply client-side filtering if needed (as backup)
                if (columnFilters.value.aspect) {
                    filteredData = filteredData.filter(item => 
                        item['Penjelasan Kriteria'].toLowerCase().includes(columnFilters.value.aspect.toLowerCase())
                    );
                }
                if (columnFilters.value.status) {
                    filteredData = filteredData.filter(item => 
                        item['Status'].toLowerCase().includes(columnFilters.value.status.toLowerCase())
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
                totalRecords.value = response.data.totalElement || filteredData.length;
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal mengambil data GCG',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching GCG data:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Terjadi kesalahan saat mengambil data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            loading.value = false;
        });
}

// Filter control functions
const toggleFilters = () => {
    showFilters.value = !showFilters.value;
};

const clearAllFilters = () => {
    columnFilters.value = {
        aspect: '',
        parameter: '',
        status: ''
    };
    getData();
};

const onFilterChange = () => {
    params.value.page = 0; // Reset to first page when filter changes
    getData();
};

function onClickEditGCG(data) {
    router.push({
        path: `/gcg/edit/${data.id}`,
        query: {
            mode: 'edit' 
        }
    });
}

function onClickManageEvidence(data) {
    router.push({
        path: `/gcg/evidence/${data.id}`,
        query: {
            parameterId: data['Parameter Id']
        }
    });
}

function onClickSelfAssessment(data) {
    router.push({
        path: `/gcg/score/${data.id}`,
        query: {
            parameterId: data['Parameter Id']
        }
    });
}

function onClickViewReport(data) {
    // Open report in new window
    window.open(`/gcg/report/${data.id}`, '_blank');
}

function onClickDeleteGCG(data) {
    dataGCG.value = data;
    openDialogDelete(data.id);
}

const openDialogDelete = (value) => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data implementasi GCG ini?`,
        header: 'Konfirmasi',
        path: `/gcg/edit/${value}`
    });
};

const handleAccept = (accept) => {
    deleteData(accept);
};

const handleReject = (reject) => {
    reject();
};

function deleteData(accept) {
    isLoading.value = true;
    
    GCGService.delete(dataGCG.value.id)
        .then((response) => {
            if (response.data.code === 200) {
                accept();
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data implementasi GCG berhasil dihapus',
                    life: 3000
                });
                getData();
            } else {
                accept(); // Tetap panggil accept untuk menutup dialog
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal menghapus data implementasi GCG',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error deleting GCG:', error);
            accept(); // Tetap panggil accept untuk menutup dialog
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Terjadi kesalahan saat menghapus data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoading.value = false;
        });
}

const onPage = (event) => {
    params.value.size = event.rows;
    params.value.page = event.page;
    getData();
};

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    params.value.page = 0; // Reset to first page when sorting changes
    getData();
};

// Helper function to get row style based on level
const getRowStyle = (data) => {
    // Handle both possible property names and ensure data exists
    if (!data) return {};
    
    const level = data.level || data.Level || 0;
    switch (level) {
        case 0: // ASPEK
            return { backgroundColor: '#f3f4f6', fontWeight: 'bold', fontSize: '14px' };
        case 1: // INDIKATOR
            return { backgroundColor: '#f9fafb', fontWeight: '600', fontSize: '13px', paddingLeft: '20px' };
        case 2: // PARAMETER
            return { backgroundColor: '#ffffff', fontSize: '12px', paddingLeft: '40px' };
        case 3: // SUB PARAMETER
            return { backgroundColor: '#fafbfc', fontSize: '11px', paddingLeft: '60px' };
        case 4: // SUB-SUB PARAMETER
            return { backgroundColor: '#fdfefe', fontSize: '10px', paddingLeft: '80px' };
        default:
            return {};
    }
};

onMounted(() => {
    getData();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Manajemen Implementasi GCG</div>

        <div class="card">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                :scroll-height="'600px'"
                :rows="params.size"
                :rowsPerPageOptions="[10, 25, 50, 100]"
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
                :pt="{
                    bodyRow: ({ context, props }) => {
                        // Ensure data exists and has Level property
                        const data = props.data || {};
                        return {
                            style: getRowStyle(data)
                        };
                    }
                }"
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
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText
                                    autocomplete="off"
                                    v-model="search"
                                    @change="getData()"
                                    placeholder="Search"
                                />
                            </IconField>

                            <Button
                                as="router-link"
                                label="Add Implementasi GCG"
                                to="/gcg/add"
                                severity="success"
                                icon="pi pi-plus"
                            />
                        </div>
                    </div>
                </template>
                <template #empty> Data not found... </template>
                <template #loading> Loading data. Please wait. </template>
                
                <Column
                    header="No."
                    field="No"
                    style="min-width: 60px"
                    sortable
                />
                
                <Column
                    field="Penjelasan Kriteria"
                    style="min-width: 300px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Penjelasan Kriteria</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.aspect"
                                    placeholder="Filter kriteria..."
                                    class="w-full"
                                    @input="onFilterChange"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                </Column>

                <Column
                    header="Bobot"
                    field="Bobot"
                    style="min-width: 80px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data.Bobot || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Sub Faktor L2"
                    field="Sub Faktor Level 2"
                    style="min-width: 100px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data['Sub Faktor Level 2'] || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Sub Faktor L1"
                    field="Sub Faktor Level 1"
                    style="min-width: 100px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data['Sub Faktor Level 1'] || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Faktor"
                    field="Faktor"
                    style="min-width: 80px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data.Faktor || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Skor Parameter"
                    field="Skor Parameter"
                    style="min-width: 120px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data['Skor Parameter'] || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Skor Indikator"
                    field="Skor Indikator"
                    style="min-width: 120px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data['Skor Indikator'] || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Skor Aspek"
                    field="Skor Aspek"
                    style="min-width: 100px"
                    sortable
                >
                    <template #body="{ data }">
                        <span class="text-right block">{{ data['Skor Aspek'] || '-' }}</span>
                    </template>
                </Column>

                <Column
                    header="Capaian (%)"
                    field="Capaian (%)"
                    style="min-width: 100px"
                    sortable
                >
                    <template #body="{ data }">
                        <div class="flex items-center gap-2">
                            <ProgressBar 
                                :value="parseFloat(data['Capaian (%)'] || 0)" 
                                :showValue="false"
                                style="width: 60px; height: 8px;"
                                :class="{
                                    'bg-green-500': parseFloat(data['Capaian (%)'] || 0) >= 80,
                                    'bg-yellow-500': parseFloat(data['Capaian (%)'] || 0) >= 60 && parseFloat(data['Capaian (%)'] || 0) < 80,
                                    'bg-red-500': parseFloat(data['Capaian (%)'] || 0) < 60
                                }"
                            />
                            <span class="text-xs">{{ data['Capaian (%)'] || '0%' }}</span>
                        </div>
                    </template>
                </Column>

                <Column
                    header="Uraian Pemenuhan"
                    field="Uraian Pemenuhan"
                    style="min-width: 200px"
                >
                    <template #body="{ data }">
                        <div class="max-w-xs">
                            <span class="text-xs line-clamp-2">{{ data['Uraian Pemenuhan'] || '-' }}</span>
                        </div>
                    </template>
                </Column>

                <Column
                    header="Dokumen"
                    field="Dokumen"
                    style="min-width: 80px"
                    sortable
                >
                    <template #body="{ data }">
                        <Tag 
                            :value="`${data.Dokumen || 0} file`" 
                            severity="info"
                            size="small"
                        />
                    </template>
                </Column>

                <Column
                    header="PIC"
                    field="PIC"
                    style="min-width: 100px"
                >
                    <template #body="{ data }">
                        <span class="text-xs">{{ data.PIC || '-' }}</span>
                    </template>
                </Column>

                <Column
                    field="Status"
                    style="min-width: 100px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Status</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.status"
                                    placeholder="Filter status..."
                                    class="w-full"
                                    @input="onFilterChange"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                    <template #body="{ data }">
                        <Tag 
                            :value="data.Status || 'Not Started'" 
                            :severity="{
                                'Selesai': 'success',
                                'In Progress': 'warning',
                                'Not Started': 'secondary'
                            }[data.Status] || 'secondary'"
                            size="small"
                        />
                    </template>
                </Column>

                <Column
                    header="Aksi"
                    class="w-[5rem]"
                    frozen="right"
                >
                    <template #body="{ data }">
                        <div class="flex flex-col md:flex-row gap-2 justify-center items-center">
                            <Button
                                icon="pi pi-ellipsis-v"
                                severity="secondary"
                                text
                                rounded
                                size="small"
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
    
    <Menu ref="actionMenu" :model="actionMenuItems" :popup="true" />
    <Toast />
    <ConfirmDialog
        :draggable="false"
        group="delete-group"
        :pt="{
            pcCloseButton: {
                root: {
                    class: 'hidden'
                }
            },
            accept: {
                label: 'Ya'
            }
        }"
    >
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="p-confirmdialog">
                <div class="p-dialog-header">
                    <span class="p-dialog-title">{{ message.header }}</span>
                </div>
                <div class="p-dialog-content">
                    <span class="p-confirmdialog-message">
                        {{ message.message }}
                    </span>
                </div>
                <div class="p-dialog-footer">
                    <Button
                        :disabled="isLoading"
                        label="Tidak"
                        class="p-confirmdialog-reject-button order-1"
                        type="button"
                        severity="danger"
                        @click="handleReject(rejectCallback)"
                    />
                    <Button
                        :loading="isLoading"
                        :label="isLoading ? 'Menghapus Data' : 'Ya'"
                        class="p-confirmdialog-accept-button order-2"
                        type="button"
                        severity="success"
                        @click="handleAccept(acceptCallback)"
                    />
                </div>
            </div>
        </template>
    </ConfirmDialog>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>