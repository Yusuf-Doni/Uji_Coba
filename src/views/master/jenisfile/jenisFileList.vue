<script setup>
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../interface/IParams';
import JenisFileService from './service/jenisFile.js';
import { useAuth } from '@/stores';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { object, string } from 'yup';
import Textarea from 'primevue/textarea';

const datas = ref([]);
const dataJenisFile = ref();
const search = ref('');
const loading = ref(null);
const isLoading = ref(false);
const param = ref({
    ...IParams
});
const toast = useToast();
const totalRecords = ref(0);
const router = useRouter();
const confirmDelete = useConfirm();

// Debounce search
let searchTimeout = null;

// Form state management
const isEditMode = ref(false);
const isLoadingSave = ref(false);
const formData = ref({
    id: null,
    kodeJenisFile: '',
    jenisFile: '',
    deskripsi: ''
});

// Form validation
const resolver = computed(() => {
    return yupResolver(object().shape({
        kodeJenisFile: string().required('Kode Jenis File tidak boleh kosong'),
        jenisFile: string().required('Jenis File tidak boleh kosong'),
        deskripsi: string().required('Deskripsi tidak boleh kosong')
    }));
});

// Sorting state management
const sortField = ref(null);
const sortOrder = ref(null);

// Filter state management
const showFilters = ref(false);
const columnFilters = ref({
    kodeJenisFile: '',
    jenisFile: '',
    deskripsi: ''
});

// Menu untuk aksi
const actionMenu = ref();
const selectedData = ref(null);

const actionMenuItems = ref([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            onClickEditJenisFile(selectedData.value);
        }
    },
    {
        separator: true
    },
    {
        label: 'Hapus',
        icon: 'pi pi-trash',
        class: 'text-red-500',
        command: () => {
            onClickDeleteJenisFile(selectedData.value);
        }
    }
]);

const toggleActionMenu = (event, data) => {
    selectedData.value = data;
    actionMenu.value.toggle(event);
};

// Filter control functions
const toggleFilters = () => {
    showFilters.value = !showFilters.value;
};

const clearAllFilters = () => {
    columnFilters.value = {
        kodeJenisFile: '',
        jenisFile: '',
        deskripsi: ''
    };
    applyFiltersAndPagination();
};

const clearSearch = () => {
    search.value = '';
    param.value.page = 0;
    applyFiltersAndPagination();
};

const onFilterChange = () => {
    param.value.page = 0; // Reset to first page when filter changes
    applyFiltersAndPagination();
};

// Search function with debounce
const handleSearch = () => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        param.value.page = 0; // Reset to first page when search changes
        applyFiltersAndPagination();
    }, 300); // 300ms debounce
};

// Watch for search changes
watch(search, () => {
    handleSearch();
});

// Store all data for client-side filtering
const allData = ref([]);

function getData() {
    loading.value = true;
    
    // Prepare API parameters (without search and filters)
    const apiParams = {
        page: 0,
        size: 1000 // Get all data for client-side filtering
    };
    
    JenisFileService.get(apiParams)
        .then((response) => {
            if (response.data.code === 200) {
                allData.value = response.data.data.map(item => ({
                    id: item.id,
                    'Kode Jenis File': item.kodeJenisFile,
                    'Jenis File': item.jenisFile,
                    'Deskripsi': item.deskripsi
                }));
                
                applyFiltersAndPagination();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal mengambil data jenis file',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching jenis file data:', error);
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

function applyFiltersAndPagination() {
    let filteredData = [...allData.value];
    
    // Apply search filter
    if (search.value && search.value.trim()) {
        const searchTerm = search.value.toLowerCase();
        filteredData = filteredData.filter(item => 
            item['Kode Jenis File'].toLowerCase().includes(searchTerm) ||
            item['Jenis File'].toLowerCase().includes(searchTerm) ||
            item['Deskripsi'].toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply column filters
    if (columnFilters.value.kodeJenisFile) {
        filteredData = filteredData.filter(item => 
            item['Kode Jenis File'].toLowerCase().includes(columnFilters.value.kodeJenisFile.toLowerCase())
        );
    }
    if (columnFilters.value.jenisFile) {
        filteredData = filteredData.filter(item => 
            item['Jenis File'].toLowerCase().includes(columnFilters.value.jenisFile.toLowerCase())
        );
    }
    if (columnFilters.value.deskripsi) {
        filteredData = filteredData.filter(item => 
            item['Deskripsi'].toLowerCase().includes(columnFilters.value.deskripsi.toLowerCase())
        );
    }
    
    // Apply sorting
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
    
    // Apply pagination
    totalRecords.value = filteredData.length;
    const startIndex = param.value.page * param.value.size;
    const endIndex = startIndex + param.value.size;
    datas.value = filteredData.slice(startIndex, endIndex);
}

// Form functions
const clearForm = () => {
    formData.value = {
        id: null,
        kodeJenisFile: '',
        jenisFile: '',
        deskripsi: ''
    };
    isEditMode.value = false;
};

const onClickEditJenisFile = (data) => {
    formData.value = {
        id: data.id,
        kodeJenisFile: data['Kode Jenis File'],
        jenisFile: data['Jenis File'],
        deskripsi: data['Deskripsi']
    };
    isEditMode.value = true;
};

const onSubmitForm = (data) => {
    if (!data.valid) {
        return;
    }

    isLoadingSave.value = true;
    const payload = {
        kodeJenisFile: formData.value.kodeJenisFile,
        jenisFile: formData.value.jenisFile,
        deskripsi: formData.value.deskripsi
    };

    const serviceCall = isEditMode.value 
        ? JenisFileService.put(formData.value.id, payload)
        : JenisFileService.post(payload);

    serviceCall
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: isEditMode.value ? 'Data jenis file berhasil diupdate' : 'Data jenis file berhasil ditambahkan',
                    life: 3000
                });
                clearForm();
                getData(); // Refresh all data from server
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal menyimpan data jenis file',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error saving jenis file:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Terjadi kesalahan saat menyimpan data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
};

function onClickDeleteJenisFile(data) {
    dataJenisFile.value = data;
    openDialogDelete(data.id);
}

const openDialogDelete = (value) => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi',
        path: `/jenis-file/edit/${value}`
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
    
    JenisFileService.delete(dataJenisFile.value.id)
        .then((response) => {
            if (response.data.code === 200) {
                accept();
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data jenis file berhasil dihapus',
                    life: 3000
                });
                getData(); // Refresh all data from server
            } else {
                accept(); // Tetap panggil accept untuk menutup dialog
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal menghapus data jenis file',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error deleting jenis file:', error);
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

// Keyboard shortcut for search
const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'k') {
        event.preventDefault();
        // Focus on search input
        const searchInput = document.querySelector('input[placeholder="Search"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
};

onMounted(() => {
    getData();
    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyDown);
});

// Cleanup on unmount
onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Jenis File</div>

        <!-- Form Section -->
        <div class="card mb-4">
            <Form
                @submit="onSubmitForm"
                :resolver="resolver"
                v-slot="$form"
                :initialValues="formData"
            >
                <div class="grid grid-cols-12 gap-2 mb-2">
                    <label class="block font-bold mb-3 col-span-3 align-middle self-center">
                        Kode Jenis File <span class="text-red-500">(*)</span>
                    </label>
                    <div class="col-span-3">
                        <InputText
                            autocomplete="off"
                            v-model="formData.kodeJenisFile"
                            placeholder="Masukkan Kode Jenis File"
                            class="w-full"
                        />
                        <Message
                            v-if="$form.kodeJenisFile?.invalid"
                            severity="error"
                            size="small"
                            variant="simple"
                        >
                            {{ $form.kodeJenisFile.error?.message }}
                        </Message>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-2 mb-2">
                    <label class="block font-bold mb-3 col-span-3 align-middle self-center">
                        Jenis File <span class="text-red-500">(*)</span>
                    </label>
                    <div class="col-span-3">
                        <InputText
                            autocomplete="off"
                            v-model="formData.jenisFile"
                            placeholder="Masukkan Jenis File"
                            class="w-full"
                        />
                        <Message
                            v-if="$form.jenisFile?.invalid"
                            severity="error"
                            size="small"
                            variant="simple"
                        >
                            {{ $form.jenisFile.error?.message }}
                        </Message>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-2 mb-2">
                    <label class="block font-bold mb-3 col-span-3 align-middle self-center">
                        Deskripsi <span class="text-red-500">(*)</span>
                    </label>
                    <div class="col-span-5">
                        <Textarea
                            autocomplete="off"
                            v-model="formData.deskripsi"
                            placeholder="Masukkan Deskripsi"
                            rows="3"
                            autoResize
                            class="w-full"
                        />
                        <Message
                            v-if="$form.deskripsi?.invalid"
                            severity="error"
                            size="small"
                            variant="simple"
                        >
                            {{ $form.deskripsi.error?.message }}
                        </Message>
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <Button
                        type="button"
                        label="Cancel"
                        severity="danger"
                        @click="clearForm"
                        :disabled="isLoadingSave"
                    />
                    <Button
                        type="submit"
                        label="Submit"
                        severity="info"
                        :loading="isLoadingSave"
                    />
                </div>
            </Form>
        </div>

        <!-- Table Section -->
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
                                    placeholder="Search"
                                />
                            </IconField>
                            <Button
                                v-if="search"
                                icon="pi pi-times"
                                severity="secondary"
                                text
                                rounded
                                @click="clearSearch"
                                v-tooltip.bottom="'Clear Search'"
                            />
                        </div>
                    </div>
                </template>
                <template #empty> Data not found... </template>
                <template #loading> Loading data. Please wait. </template>
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
                    field="Kode Jenis File"
                    style="min-width: 150px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Kode Jenis File</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.kodeJenisFile"
                                    placeholder="Filter kode jenis file..."
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
                    field="Jenis File"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Jenis File</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.jenisFile"
                                    placeholder="Filter jenis file..."
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
                    field="Deskripsi"
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

                <Column
                    header="Aksi"
                    class="w-[5rem]"
                >
                    <template #body="{ data }">
                        <div
                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
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
                label: 'yaaaa'
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
                        <strong class="ml-1">
                            {{ dataJenisFile['Jenis File'] }}
                        </strong>
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
</style>