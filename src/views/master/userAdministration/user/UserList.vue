<script setup>
import debounce from '@/utils/debounce';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../../interface/IParams';
import mockUsers from '../mock/users.js';
import UsersService from '../mock/users.js';
import { useAuth } from '@/stores';

const datas = ref([]);
const dataUsers = ref();
const search = ref(null);
const loading = ref(null);
const isLoading = ref(false);
const param = ref({
    ...IParams
});
const toast = useToast();
const totalRecords = ref(0);
const router = useRouter();
const confirmDelete = useConfirm();
const isLoadingExport = ref(false);

// Sorting state management
const sortField = ref(null);
const sortOrder = ref(null);

// Filter state management
const showFilters = ref(false);
const columnFilters = ref({
    username: '',
    name: '',
    jabatan: ''
});

// Menu untuk aksi
const actionMenu = ref();
const selectedData = ref(null);

const actionMenuItems = ref([
    {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
            onClickEditUser(selectedData.value);
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
            onClickDelete(selectedData.value);
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
        username: '',
        name: '',
        jabatan: ''
    };
    getData();
};

const onFilterChange = () => {
    param.value.page = 0; // Reset to first page when filter changes
    getData();
};

// state roles
const rolesOpt = ref();
const isLoadingRoles = ref();
const totalPageRoles = ref(0);
const paramRoles = ref({ ...IParams });

// Mock data for roles
const mockRoles = [
    { id: 1, displayName: 'Super Admin' },
    { id: 2, displayName: 'Admin Sekper' },
    { id: 3, displayName: 'Admin Legal' },
    { id: 4, displayName: 'Admin Risiko' },
    { id: 5, displayName: 'Admin Kepatuhan' }
];

// handle roles
const getOptRoles = async () => {
    isLoadingRoles.value = true;
    
    // Simulate API delay
    setTimeout(() => {
        rolesOpt.value = mockRoles;
        totalPageRoles.value = Math.ceil(mockRoles.length / 10);
        isLoadingRoles.value = false;
    }, 500);
};

const onScrollEventRoles = async (event) => {
    // Mock implementation - no additional loading needed
};

const filterRolesAPi = (events) => {
    // Mock implementation
    rolesOpt.value = mockRoles.filter(role => 
        role.displayName.toLowerCase().includes(events.value.toLowerCase())
    );
};

const debounceFilterRoles = debounce(filterRolesAPi, 500);

const onFilterRoles = (event) => {
    rolesOpt.value = [];
    debounceFilterRoles(event);
};

function getData() {
    loading.value = true;
    
    // Prepare API parameters
    const apiParams = {
        page: param.value.page,
        size: param.value.size,
        search: search.value || ''
    };
    
    // Add column filters to API parameters
    if (columnFilters.value.username) {
        apiParams.username = columnFilters.value.username;
    }
    if (columnFilters.value.name) {
        apiParams.name = columnFilters.value.name;
    }
    if (columnFilters.value.jabatan) {
        apiParams.jabatan = columnFilters.value.jabatan;
    }
    
    console.log('API Parameters:', apiParams);
    
    UsersService.get(apiParams)
        .then((response) => {
            
            if (response.data.code === 200) {
                console.log('Original Data:', response.data.data);
                
                let filteredData = response.data.data.map(item => ({
                    id: item.id,
                    username: item.email,
                    name: item.namaLengkap,
                    phoneNumber: item.noHp || '-',
                    roles: item.role ? [{ id: item.role.id, displayName: item.role.namaRole }] : [],
                    jabatan: item.jabatan ? item.jabatan.namaJabatan : '-',
                    isActive: item.isActive
                }));
                
                // Apply client-side filtering if needed (as backup)
                if (columnFilters.value.username) {
                    filteredData = filteredData.filter(item => 
                        item.username.toLowerCase().includes(columnFilters.value.username.toLowerCase())
                    );
                }
                if (columnFilters.value.name) {
                    filteredData = filteredData.filter(item => 
                        item.name.toLowerCase().includes(columnFilters.value.name.toLowerCase())
                    );
                }
                if (columnFilters.value.jabatan) {
                    filteredData = filteredData.filter(item => 
                        item.jabatan.toLowerCase().includes(columnFilters.value.jabatan.toLowerCase())
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
                    detail: response.data.message || 'Gagal mengambil data user',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching user data:', error);
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

function onClickEditUser(data) {
    router.push({
        path: `/user-administration/user/edit/${data.id}`
    });
}

function onClickDelete(data) {
    dataUsers.value = data;
    openDialogDelete();
}

const openDialogDelete = () => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi'
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
    
    // Simulate API call
    setTimeout(() => {
        isLoading.value = false;
        accept();
        
        // Remove from mock data
        const index = mockUsers.findIndex(user => user.id === dataUsers.value.id);
        if (index > -1) {
            mockUsers.splice(index, 1);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Data berhasil dihapus',
            life: 3000
        });
        
        getData();
    }, 1000);
}

const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
};

const onSort = (event) => {
    sortField.value = event.sortField;
    sortOrder.value = event.sortOrder;
    param.value.page = 0; // Reset to first page when sorting changes
    getData();
};

const exportExcel = async () => {
    isLoadingExport.value = true;
    
    // Simulate export delay
    setTimeout(() => {
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'File berhasil diexport',
            life: 3000
        });
        isLoadingExport.value = false;
    }, 2000);
};

onMounted(() => {
    getData();
    getOptRoles();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Daftar User</div>

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
                                <InputIcon class>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText autocomplete="off" 
                                    v-model="search"
                                    @change="getData()"
                                    placeholder="Search"
                                />
                            </IconField>
                            <Select
                                :loading="isLoadingRoles"
                                :filter="true"
                                name="roles"
                                :options="rolesOpt"
                                :filterFields="['displayName']"
                                placeholder="Pilih Role"
                                @filter="onFilterRoles"
                                @change="getData"
                                :showClear="true"
                                v-model="param.roleId"
                                optionLabel="displayName"
                                optionValue="id"
                                class="min-w-[200px]"
                            >
                                <template #emptyfilter>
                                    <div class="p-2 text-gray-500">Tidak ada data yang cocok</div>
                                </template>
                                <template #empty>
                                    <div class="p-2 text-gray-500">Tidak ada data</div>
                                </template>
                            </Select>
                        
                            <Button
                                as="router-link"
                                label="Add User"
                                to="/user-administration/user/add"
                                severity="info"
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
                    field="username"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Username</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.username"
                                    placeholder="Filter username..."
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
                    field="name"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Nama Lengkap</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.name"
                                    placeholder="Filter nama lengkap..."
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
                    field="jabatan"
                    style="min-width: 200px"
                    sortable
                >
                    <template #header>
                        <div class="w-full">
                            <div class="font-semibold text-gray-900 mb-2">Jabatan</div>
                            <div v-if="showFilters" class="w-full">
                                <InputText 
                                    v-model="columnFilters.jabatan"
                                    placeholder="Filter jabatan..."
                                    class="w-full"
                                    @input="onFilterChange"
                                    size="small"
                                />
                            </div>
                        </div>
                    </template>
                </Column>
                <Column
                    header="Role"
                    dataType="text"
                >
                    <template #body="{ data }">
                        <div v-for="role in data.roles" :key="role.id">
                            {{ role.displayName }}
                        </div>
                    </template>
                </Column>
                <Column
                    header="Status Aktif"
                    dataType="text"
                >
                    <template #body="{ data }">
                        <Tag 
                            :value="data.isActive ? 'Aktif' : 'Tidak Aktif'"
                            :severity="data.isActive ? 'success' : 'danger'"
                        />
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
                            {{ dataUsers.name }}
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
