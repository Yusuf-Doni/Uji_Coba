<script setup>
import RoleService from '@/service/RoleService';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../interface/IParams';

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
    param.value.search = search.value;
    RoleService.get(param.value)
        .then((response) => {
            loading.value = false;
            datas.value = response.data.data;
            totalRecords.value = response.data.totalElement;
        })
        .catch((e) => {
            loading.value = false;
            console.log(e);
        });
}

function onClickEditUser(data) {
    router.push({
        path: `/user-management/role/edit/${data.id}`
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
                getData();
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
                    <div class="flex justify-end gap-4">
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
                            icon="pi pi-plus"
                            severity="primary"
                            variant="outlined"
                            label="Tambah Roles"
                            as="router-link"
                            to="/user-management/role/add"
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
                    header="System Name"
                    dataType="text"
                    field="name"
                />
                <Column
                    header="Display Name"
                    dataType="text"
                    field="displayName"
                />
                <Column
                    header="Description"
                    dataType="text"
                    field="description"
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
                    header="Aksi"
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
                            {{ dataRoles.name }}
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
