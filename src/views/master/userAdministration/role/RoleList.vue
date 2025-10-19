<script setup>
import RoleService from '@/service/RoleService';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../../interface/IParams';
import mockRoles from '../mock/roles.js';

const datas = ref([]);
const dataRoles = ref();
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

function getData() {
    loading.value = true;
    
    // Simulate API delay
    setTimeout(() => {
        let filteredData = [...mockRoles];
        
        // Apply search filter
        if (search.value) {
            filteredData = filteredData.filter(role => 
                role.name.toLowerCase().includes(search.value.toLowerCase()) ||
                role.displayName.toLowerCase().includes(search.value.toLowerCase()) ||
                role.description.toLowerCase().includes(search.value.toLowerCase())
            );
        }
        
        // Apply pagination
        const startIndex = param.value.page * param.value.size;
        const endIndex = startIndex + param.value.size;
        const paginatedData = filteredData.slice(startIndex, endIndex);
        
        datas.value = paginatedData;
        totalRecords.value = filteredData.length;
        loading.value = false;
    }, 500);
}

function onClickEditUser(data) {
    router.push({
        path: `/user-roles-permissions/role/edit/${data.id}`
    });
}

function onClickDelete(data) {
    dataRoles.value = data;
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
        const index = mockRoles.findIndex(role => role.id === dataRoles.value.id);
        if (index > -1) {
            mockRoles.splice(index, 1);
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

onMounted(() => {
    getData();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Daftar Role</div>

        <div class="card">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                scrollHeight="400px"
                :rows="param.size"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                dataKey="nik"
                :rowHover="true"
                :loading="loading"
                :totalRecords="totalRecords"
                :lazy="true"
                @page="onPage($event)"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="showing {first} to {last} of {totalRecords}"
            >
                <template #header>
                    <div class="flex justify-between gap-4">
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText autocomplete="off" 
                                v-model="search"
                                @change="getData()"
                                placeholder="Search"
                            />
                        </IconField>
                        <Button
                            severity="info"
                            label="Tambah Roles"
                            as="router-link"
                            to="/user-roles-permissions/role/add"
                        />
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
                    header="Kode Role"
                    dataType="text"
                    field="name"
                />
                <Column
                    header="Role"
                    dataType="text"
                    field="displayName"
                />
                <Column
                    header="Permission"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <ul
                            v-if="data.permissions.length > 0"
                            class="list-disc"
                        >
                            <li
                                v-for="permission in data.permissions"
                                :key="permission"
                            >
                                {{ permission.displayName }}
                            </li>
                        </ul>
                    </template>
                </Column>
                <Column
                    header="Action"
                    class="w-[5rem]"
                >
                    <template #body="{ data }">
                        <div
                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                        >
                            <Button
                                icon="pi pi-pencil"
                                severity="warn"
                                rounded
                                aria-label="Edit User"
                                @click="onClickEditUser(data)"
                                v-tooltip.bottom="'Edit User'"
                            />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                rounded
                                aria-label="Hapus Role"
                                @click="onClickDelete(data)"
                                v-tooltip.bottom="'Hapus Role'"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
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
                            {{ mockRoles.name }}
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
