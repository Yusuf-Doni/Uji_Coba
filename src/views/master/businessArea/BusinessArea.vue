<script setup>
import BusinessAreaService from '@/service/BusinessAreaService';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref } from 'vue';
import IParams from '../../../interface/IParams';
import BusinessAreaAddDialog from './BusinessAreaAddDialog.vue';
// import LoadingBar from '../component/LoadingBar.vue';

const datas = ref([]);
const search = ref(null);
const loading = ref(null);
const isLoading = ref(false);
const visible = ref(false);
const labelHeader = ref('Tambah Status Vendor');
const dataBusinessArea = ref({});
const param = ref({ ...IParams });
const confirmDelete = useConfirm();
const toast = useToast();
const totalRecords = ref(0);

onBeforeMount(() => {});

onMounted(() => {
    getData();
});

function getData() {
    loading.value = true;
    param.value.search = search.value;
    BusinessAreaService.get(param.value)
        .then((response) => {
            loading.value = false;
            datas.value = response.data.data;
            // param.value.size = response.data.size;
            //   param.value.totalRecords = response.data.totalElement;
            totalRecords.value = response.data.totalElement;
        })
        .catch((e) => {
            loading.value = false;
            console.log(e);
        });
}

function onClickAdd() {
    visible.value = true;
    labelHeader.value = 'Tambah Personal Sub Area';
    dataBusinessArea.value = {};
}
function onClickEdit(data) {
    visible.value = true;
    labelHeader.value = 'Edit Personal Sub Area';
    dataBusinessArea.value = data;
}
function onClickDelete(data) {
    dataBusinessArea.value = data;
    openDialogDelete();
}
function onHideForm() {
    visible.value = false;
    getData();
}
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
    // loadLazyData(event);
};

const onChangeLoading = (loadingValue) => {
    isLoading.value = loadingValue;
};

const openDialogDelete = () => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi'
    });
};

function deleteData(accept) {
    isLoading.value = true;
    BusinessAreaService.delete(dataBusinessArea.value.id)
        .then((response) => {
            isLoading.value = false;
            accept();
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Pesan',
                    detail: response.data.code + ' - ' + response.data.message,
                    life: 3000
                });
                getData();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Pesan',
                    detail: response.data.code + ' - ' + response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            isLoading.value = false;
            accept();
            toast.add({
                severity: 'error',
                summary: 'Pesan',
                detail: e.message,
                life: 3000
            });
            console.log(e);
        });
}

const handleAccept = (accept) => {
    deleteData(accept);
};

const handleReject = (reject) => {
    reject();
};
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Personal Sub Area</div>

        <div class="card">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                scrollHeight="400px"
                :rows="param.size"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                dataKey="id"
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
                            label="Add Personal Sub Area"
                            @click="onClickAdd"
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
                    header="Personal Area"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.company.code }}
                    </template>
                </Column>
                <Column
                    header="Personal Sub Area"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.code }}
                    </template>
                </Column>
                <Column
                    header="Description"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.description }}
                    </template>
                </Column>
                <Column
                    header="Short Text"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.shortText }}
                    </template>
                </Column>
                <Column
                    header="Long Text"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.longText }}
                    </template>
                </Column>
                <Column
                    header="Status"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.status }}
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
                                aria-label="Filter"
                                @click="onClickEdit(data)"
                            />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                rounded
                                aria-label="Bookmark"
                                @click="onClickDelete(data)"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    <BusinessAreaAddDialog
        :visible="visible"
        :label="labelHeader"
        :data="dataBusinessArea"
        :onHideForm="onHideForm"
        :onChangeLoading="onChangeLoading"
        :isLoading="isLoading"
    />
    <ConfirmDialog
        :draggable="false"
        group="crud-group"
        :pt="{
            pcCloseButton: {
                root: {
                    class: 'hidden'
                }
            }
        }"
    />
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
                        <strong class="ml-1">Personal Sub Area:</strong>
                        <strong class="ml-1">
                            {{ dataBusinessArea.code }}
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
    <Toast />
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
