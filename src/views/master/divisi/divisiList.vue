<script setup>
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../interface/IParams';
import divisiService from './service/divisi';
import direktoratService from '../direktorat/service/direktorat.js';
import { useAuth } from '@/stores';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { object, string } from 'yup';
import Dropdown from 'primevue/dropdown';

const datas = ref([]);
const dataDivisi = ref();
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
const showValidationErrors = ref(false);
const formData = ref({
    id: null,
    namaDivisi: '',
    singkatan: '',
    direktorat: ''
});

// Dropdown options for direktorat
const direktoratOptions = ref([]);
const isLoadingDirektorat = ref(false);

// Form validation
const resolver = computed(() => {
    return yupResolver(object().shape({
        namaDivisi: string().required('Nama Divisi tidak boleh kosong'),
        singkatan: string().required('Singkatan tidak boleh kosong'),
        direktorat: string().required('Direktorat tidak boleh kosong')
    }));
});

// Sorting state management
const sortField = ref(null);
const sortOrder = ref(null);

// Filter state management
const showFilters = ref(false);
const columnFilters = ref({
    namaDivisi: '',
    singkatan: '',
    direktoratNama: ''
});

// Menu untuk aksi
const actionMenu = ref();
const selectedData = ref(null);

const actionMenuItems = ref([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            onClickEditDivisi(selectedData.value);
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
            onClickDeleteDivisi(selectedData.value);
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
        namaDivisi: '',
        singkatan: '',
        direktoratNama: ''
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

// Load direktorat options
const loadDirektoratOptions = async () => {
    isLoadingDirektorat.value = true;
    try {
        const response = await direktoratService.get({ page: 0, size: 1000 });
        console.log(response.data.data);
        if (response.data.code === 200) {
            direktoratOptions.value = response.data.data.map(item => ({
                label: item.nama,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('Error loading direktorat options:', error);
    } finally {
        isLoadingDirektorat.value = false;
    }
};

function getData() {
    loading.value = true;
    
    // Prepare API parameters (without search and filters)
    const apiParams = {
        page: 0,
        size: 1000, // Get all data for client-side filtering
        include: 'direktorat' // Include related data
    };
    
    divisiService.get(apiParams)
        .then((response) => {
            if (response.data.code === 200) {
 
                allData.value = response.data.data.map(item => {
                    // Find direktorat name from direktoratOptions if relation not available
                    let direktoratName = item.direktoratNama || '';
                    if (!direktoratName && item.direktoratId) {
                        const direktoratOption = direktoratOptions.value.find(dir => dir.value === item.direktoratId);
                        direktoratName = direktoratOption ? direktoratOption.label : '';
                    }

                    
                    return {
                        id: item.id,
                        'Nama Divisi': item.namaDivisi,
                        'Singkatan': item.singkatan,
                        'Direktorat': item.direktoratNama,
                        direktoratId: item.direktoratId
                    };
                });
                
                applyFiltersAndPagination();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal mengambil data divisi',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching divisi data:', error);
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
            item['Nama Divisi'].toLowerCase().includes(searchTerm) ||
            item['Singkatan'].toLowerCase().includes(searchTerm) ||
            item['Direktorat'].toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply column filters
    if (columnFilters.value.namaDivisi) {
        filteredData = filteredData.filter(item => 
            item['Nama Divisi'].toLowerCase().includes(columnFilters.value.namaDivisi.toLowerCase())
        );
    }
    if (columnFilters.value.singkatan) {
        filteredData = filteredData.filter(item => 
            item['Singkatan'].toLowerCase().includes(columnFilters.value.singkatan.toLowerCase())
        );
    }
    if (columnFilters.value.direktoratNama) {
        filteredData = filteredData.filter(item => 
            item.direktoratId === columnFilters.value.direktoratNama
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
        namaDivisi: '',
        singkatan: '',
        direktorat: ''
    };
    isEditMode.value = false;
    showValidationErrors.value = false; // Reset validation errors
};

const onClickEditDivisi = (data) => {
    formData.value = {
        id: data.id,
        namaDivisi: data['Nama Divisi'],
        singkatan: data['Singkatan'],
        direktorat: data.direktoratId
    };
    isEditMode.value = true;
};

const onSubmitForm = (data) => {
    // Manual validation check
    const errors = [];
    
    if (!formData.value.namaDivisi || formData.value.namaDivisi.trim() === '') {
        errors.push('Nama Divisi tidak boleh kosong');
    }
    
    if (!formData.value.singkatan || formData.value.singkatan.trim() === '') {
        errors.push('Singkatan tidak boleh kosong');
    }
    
    if (!formData.value.direktorat || formData.value.direktorat === '') {
        errors.push('Direktorat tidak boleh kosong');
    }
    
    if (errors.length > 0) {
        showValidationErrors.value = true;
        toast.add({
            severity: 'error',
            summary: 'Validasi Gagal',
            detail: 'Mohon lengkapi semua field yang wajib diisi (bertanda *)',
            life: 5000
        });
        return;
    }

    // Reset validation errors
    showValidationErrors.value = false;
    isLoadingSave.value = true;
    const payload = {
        namaDivisi: formData.value.namaDivisi,
        singkatan: formData.value.singkatan,
        direktoratId: formData.value.direktorat
    };

    const serviceCall = isEditMode.value 
        ? divisiService.put(formData.value.id, payload)
        : divisiService.post(payload);

    serviceCall
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: isEditMode.value ? 'Data divisi berhasil diupdate' : 'Data divisi berhasil ditambahkan',
                    life: 3000
                });
                clearForm();
                getData(); // Refresh all data from server
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal menyimpan data divisi',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error saving divisi:', error);
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

function onClickDeleteDivisi(data) {
    dataDivisi.value = data;
    openDialogDelete(data.id);
}

const openDialogDelete = (value) => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi',
        path: `/divisi/edit/${value}`
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
    
    divisiService.delete(dataDivisi.value.id)
        .then((response) => {
            if (response.data.code === 200) {
                accept();
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data divisi berhasil dihapus',
                    life: 3000
                });
                getData(); // Refresh all data from server
            } else {
                accept(); // Tetap panggil accept untuk menutup dialog
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal menghapus data divisi',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error deleting divisi:', error);
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

onMounted(async () => {
    // Load options first
    await loadDirektoratOptions();
    // Then load data
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
        <div class="font-semibold text-xl mb-4">Divisi</div>

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
                        Nama Divisi <span class="text-red-500">(*)</span>
                    </label>
                    <div class="col-span-3">
                        <InputText
                            autocomplete="off"
                            v-model="formData.namaDivisi"
                            placeholder="Masukkan Nama Divisi"
                            :class="[
                                'w-full uppercase-input',
                                { 'p-invalid': showValidationErrors && (!formData.namaDivisi || formData.namaDivisi.trim() === '') }
                            ]"
                            @input="showValidationErrors = false"
                        />
                        <Message
                            v-if="showValidationErrors && (!formData.namaDivisi || formData.namaDivisi.trim() === '')"
                            severity="error"
                            size="small"
                            variant="simple"
                        >
                            Nama Divisi tidak boleh kosong
                        </Message>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-2 mb-2">
                    <label class="block font-bold mb-3 col-span-3 align-middle self-center">
                        Singkatan <span class="text-red-500">(*)</span>
                    </label>
                    <div class="col-span-3">
                        <InputText
                            autocomplete="off"
                            v-model="formData.singkatan"
                            placeholder="Masukkan Singkatan"
                            :class="[
                                'w-full uppercase-input',
                                { 'p-invalid': showValidationErrors && (!formData.singkatan || formData.singkatan.trim() === '') }
                            ]"
                            @input="showValidationErrors = false"
                        />
                        <Message
                            v-if="showValidationErrors && (!formData.singkatan || formData.singkatan.trim() === '')"
                            severity="error"
                            size="small"
                            variant="simple"
                        >
                            Singkatan tidak boleh kosong
                        </Message>
                    </div>
                </div>
                <div class="grid grid-cols-12 gap-2 mb-2">
                    <label class="block font-bold mb-3 col-span-3 align-middle self-center">
                        Direktorat <span class="text-red-500">(*)</span>
                    </label>
                    <div class="col-span-3">
                        <Dropdown
                            v-model="formData.direktorat"
                            :options="direktoratOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih Direktorat"
                            :class="[
                                'w-full',
                                { 'p-invalid': showValidationErrors && (!formData.direktorat || formData.direktorat === '') }
                            ]"
                            :loading="isLoadingDirektorat"
                            @change="showValidationErrors = false"
                        />
                        <Message
                            v-if="showValidationErrors && (!formData.direktorat || formData.direktorat === '')"
                            severity="error"
                            size="small"
                            variant="simple"
                        >
                            Direktorat tidak boleh kosong
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
                    field="Nama Divisi"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Nama Divisi</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.namaDivisi"
                                    placeholder="Filter nama divisi..."
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
                    field="Singkatan"
                    style="min-width: 150px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Singkatan</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.singkatan"
                                    placeholder="Filter singkatan..."
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
                    field="Direktorat"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Direktorat</div>
                            <div v-if="showFilters" class="w-full">
                                <Dropdown
                                    v-model="columnFilters.direktoratNama"
                                    :options="direktoratOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Filter direktorat..."
                                    class="w-full"
                                    size="small"
                                    @change="onFilterChange"
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
                            {{ dataDivisi['Nama Divisi'] }}
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

// Form validation styling
:deep(.p-invalid) {
    border-color: #ef4444 !important;
    box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.25) !important;
}

// Required field indicator
.text-red-500 {
    color: #ef4444;
    font-weight: bold;
}

// Error message styling
:deep(.p-message-error) {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

// Auto caps lock untuk input
.uppercase-input {
    text-transform: uppercase;
}

// Placeholder tetap normal (tidak ikut uppercase)
.uppercase-input::placeholder,
.uppercase-input input::placeholder,
.uppercase-input textarea::placeholder {
    text-transform: none !important;
}

// Fallback untuk semua placeholder
.p-inputtext::placeholder,
input::placeholder,
textarea::placeholder {
    text-transform: none !important;
}
</style>