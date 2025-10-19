<script setup>
import router from '@/router';
import AnalisaBebanKerjaService from '@/service/AnalisaBebanKerjaService';
import BusinessAreaService from '@/service/BusinessAreaService';
import ExportService from '@/service/ExportService';
import { useAuth } from '@/stores';
import { ifActionExist } from '@/utils/checkActionPermissions';
import { ACTION_PERMISSIONS } from '@/utils/constantVariable';
import moment from 'moment';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import IParams from '../../interface/IParams';
import debounce from '@/utils/debounce';
import CompanyCodeService from '@/service/CompanyCodeService';

const datas = ref([]);
const search = ref(null);
const loading = ref(null);
const isLoading = ref(false);
const loadingSubPersonelAreas = ref(false);
const loadingPersonelAreas = ref(false);
const visible = ref(false);
const labelHeader = ref('Tambah Analisis Beban Kerja');
const param = ref({ ...IParams });
const toast = useToast();
const totalRecords = ref(0);
const paramSubPersonalAreas = ref({ ...IParams });
const paramPersonelAreas = ref({ ...IParams });
const totalPageSubPersonelAreas = ref(0);
const totalPagePersonelAreas = ref(0);
const dataSubPersonelArea = ref([]);
const dataPersonelAreas = ref([]);
const dataTahun = ref([]);
const selectedSubPersonelArea = ref(null);
const selectedPersonelArea = ref(null);
const selectedTahun = ref();
const authStore = useAuth();
const confirmDelete = useConfirm();
const dataAnalisaBebanKerja = ref({});
const defaultVirtScrollerOpt = {
    autoSize: true,
    lazy: true,
    itemSize: 38,
    delay: 0
};
const subPersonelAreaVirtScrollerOpt = computed(() => ({
    ...defaultVirtScrollerOpt,
    onLazyLoad: loadingSubPersonelAreas,
    showLoader: loadingSubPersonelAreas,
    loading: loadingSubPersonelAreas,
    onscroll: (event) => {
        onScrollEvtSubPersonelAreas(event);
    }
}));
const personelAreaVirtScrollerOpt = computed(() => ({
    ...defaultVirtScrollerOpt,
    onLazyLoad: loadingPersonelAreas,
    showLoader: loadingPersonelAreas,
    loading: loadingPersonelAreas,
    onscroll: (event) => {
        onScrollEvtPersonelAreas(event);
    }
}));

onMounted(() => {
    getPersonelAreas();
    getSubPersonalAreas();
    getDataTahun();
    getData();
});
async function getPersonelAreas() {
    loadingPersonelAreas.value = true;

    try {
        const response = await CompanyCodeService.getActive(
            paramPersonelAreas.value
        );

        dataPersonelAreas.value = response?.data?.data || [];
        paramPersonelAreas.value.size = response?.data?.size || IParams.size;
        totalPagePersonelAreas.value = Math.ceil(
            (response?.data?.totalElement || 10) / 10
        );
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: e.message,
            life: 3000
        });
    }

    loadingPersonelAreas.value = false;
}
const onScrollEvtPersonelAreas = async (event) => {
    if (
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
        if (
            paramPersonelAreas.value.size < totalPagePersonelAreas.value * 10 &&
            !loadingPersonelAreas.value
        ) {
            paramPersonelAreas.value.size += 10;
            await getPersonelAreas();
        }
    }
};
const filterPersonelAreas = (events) => {
    paramPersonelAreas.value.size = 10;
    paramPersonelAreas.value.search = events.value;
    getPersonelAreas();
};
const debounceFilterPersonelAreas = debounce(filterPersonelAreas, 500);
const onFilterPersonelAreas = (events) => {
    dataPersonelAreas.value = [];
    debounceFilterPersonelAreas(events);
};
async function getSubPersonalAreas() {
    loadingSubPersonelAreas.value = true;

    try {
        const response = await BusinessAreaService.getActive({
            ...paramSubPersonalAreas.value,
            personel_area: selectedPersonelArea.value?.id
        });

        dataSubPersonelArea.value = response?.data?.data || [];
        paramSubPersonalAreas.value.size = response?.data?.size || IParams.size;
        totalPageSubPersonelAreas.value = Math.ceil(
            (response?.data?.totalElement || 10) / 10
        );
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: e.message,
            life: 3000
        });
    }

    loadingSubPersonelAreas.value = false;
}
const onScrollEvtSubPersonelAreas = async (event) => {
    if (
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
        if (
            paramSubPersonalAreas.value.size <
                totalPageSubPersonelAreas.value * 10 &&
            !loadingSubPersonelAreas.value
        ) {
            paramSubPersonalAreas.value.size += 10;
            await getSubPersonalAreas();
        }
    }
};
const filterSubPersonelAreas = (events) => {
    paramSubPersonalAreas.value.size = 10;
    paramSubPersonalAreas.value.search = events.value;
    getSubPersonalAreas();
};
const debounceFilterSubPersonelAreas = debounce(filterSubPersonelAreas, 500);
const onFilterSubPersonelAreas = (events) => {
    dataSubPersonelArea.value = [];
    debounceFilterSubPersonelAreas(events);
};
function getDataTahun() {
    const year = moment().format('yyyy');
    for (var i = 0; i < 7; i++) {
        const dt = year * 1 - i;
        dataTahun.value.push({ value: dt, description: dt });
    }
    if (selectedTahun.value == null) selectedTahun.value = dataTahun.value[0];
}
function getData() {
    loading.value = true;

    let params = {
        search: search.value,
        unitId: selectedSubPersonelArea.value?.id,
        period: selectedTahun.value?.value,
        companyId: selectedPersonelArea?.value?.id
    };

    AnalisaBebanKerjaService.get(params)
        .then((response) => {
            loading.value = false;
            datas.value = response.data.data;
            param.value.size = response.data.size;
            // param.value.totalRecords = response.data.totalElement;
            totalRecords.value = response.data.totalElement;
        })
        .catch((e) => {
            loading.value = false;
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
            console.log(e);
        });
}

function onClick(action, data) {
    if (action === 'add') {
        labelHeader.value = 'Tambah Analisis Beban Kerja';
        router.push({ path: '/analisis-beban-kerja/' + action });
    } else if (action === 'update') {
        labelHeader.value = 'Edit Analisis Beban Kerja';
        router.push({
            path: '/analisis-beban-kerja/' + action,
            query: { id: data.id }
        });
    } else {
        labelHeader.value = 'Detail Analisis Beban Kerja';
        router.push({
            path: '/analisis-beban-kerja/' + action,
            query: { id: data.id }
        });
    }
}

const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
    // loadLazyData(event);
};
const exportExcel = async () => {
    console.log(isLoading.value);
    if (isLoading.value) return;
    await ExportService.exportFile(
        'analisis-beban-kerja',
        {
            unitId: selectedSubPersonelArea.value?.id,
            tahun: selectedTahun.value?.value,
            search: search.value,
            companyId: selectedPersonelArea?.value?.id
            // status: 'AKTIF'
        },
        'analisis_beban_kerja_' + moment(new Date()).format('YYYYMMDD_HHmmss'),
        'xlsx'
    );
};
function onClickDelete(data) {
    dataAnalisaBebanKerja.value = data;
    openDialogDelete();
}
const openDialogDelete = () => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi'
    });
};

function deleteData(accept) {
    isLoading.value = true;
    AnalisaBebanKerjaService.deleteAbkParam(dataAnalisaBebanKerja.value.id)
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
        <div class="font-semibold text-xl mb-4">Analisis Beban Kerja</div>

        <div class="card">
            <div
                class="flex flex-col md:flex-row gap-4 justify-between items-center mt-4 w-full"
            >
                <div
                    class="flex flex-col md:flex-row gap-4 justify-start items-center mt-4"
                >
                    <Select
                        :virtual-scroller-options="personelAreaVirtScrollerOpt"
                        :loading="loadingPersonelAreas"
                        v-model="selectedPersonelArea"
                        :options="dataPersonelAreas"
                        filter
                        optionLabel="description"
                        :placeholder="`Pilih Personel Area`"
                        class="w-[220px]"
                        :filterFields="['description']"
                        @filter="onFilterPersonelAreas"
                        :show-clear="true"
                        @change="
                            ({ value }) => {
                                if (value) {
                                    getSubPersonalAreas();
                                } else {
                                    selectedSubPersonelArea = null;
                                }
                                getData();
                            }
                        "
                    />
                    <Select
                        :virtual-scroller-options="
                            subPersonelAreaVirtScrollerOpt
                        "
                        :loading="loadingSubPersonelAreas"
                        v-model="selectedSubPersonelArea"
                        :options="dataSubPersonelArea"
                        filter
                        optionLabel="description"
                        :placeholder="`Pilih Sub Personel Sub Area`"
                        class="w-[220px]"
                        :filterFields="['description']"
                        @filter="onFilterSubPersonelAreas"
                        :show-clear="true"
                        :disabled="!Boolean(selectedPersonelArea)"
                        @change="
                            ({ value }) => {
                                if (!value) {
                                    selectedPersonelArea = null;
                                }

                                paramSubPersonalAreas = { ...IParams };
                                getData();
                            }
                        "
                    />
                    <Select
                        v-model="selectedTahun"
                        :options="dataTahun"
                        optionLabel="description"
                        :placeholder="`Pilih Tahun`"
                        class="w-[100px]"
                        @change="getData()"
                    />
                    <IconField class="w-full md:w-60">
                        <InputText autocomplete="off" 
                            class="w-full md:w-60"
                            v-model="search"
                            @change="getData()"
                            placeholder="Search"
                        />
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                    </IconField>
                </div>
                <div
                    class="flex flex-col md:flex-row gap-4 justify-center md:justify-end items-end md:items-center mt-4 w-full mb-3"
                >
                    <div
                        class="flex flex-row gap-4 justify-end items-center w-fit"
                    >
                        <Button
                            icon="pi pi-file-excel"
                            severity="primary"
                            variant="outlined"
                            label="Export"
                            @click="exportExcel"
                        />
                        <Button
                            v-if="
                                ifActionExist(
                                    authStore.permittedAction,
                                    ACTION_PERMISSIONS.ADD_ABK_BEBAN_KERJA
                                )
                            "
                            icon="pi pi-plus"
                            severity="primary"
                            label="Tambah Data Beban Kerja"
                            @click="onClick('add')"
                        />
                    </div>
                </div>
            </div>
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
                <template #empty> Data not found... </template>
                <template #loading> Loading data. Please wait. </template>
                <Column
                    field="id"
                    header="Nomor"
                    style="min-width: 12rem"
                >
                    <template #body="{ index }">
                        {{ param.page * param.size + index + 1 }}
                    </template>
                </Column>
                <Column
                    header="Nama Vendor"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.namaPerusahaan ?? '-' }}
                    </template>
                </Column>
                <Column
                    header="Nama Perjanjian"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <div class="font-bold text-primary">
                            <router-link
                                :to="{
                                    path: '/perjanjian/detail',
                                    query: { id: data.kontrakId }
                                }"
                                class="hover:underline cursor-pointer"
                            >
                                {{ data.nomorKontrak ?? '-' }}
                            </router-link>
                        </div>
                        {{ data.namaPekerjaan ?? '-' }}
                    </template>
                </Column>
                <Column
                    header="Fungsi"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.fungsi ?? '-' }}
                    </template>
                </Column>
                <Column
                    header="Jenis Pekerjaan"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.jenisPekerjaan ?? '-' }}
                    </template>
                </Column>
                <Column
                    header="Jam Kerja Pertahun"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{
                            data.jamKerjaPerTahun
                                ? new Intl.NumberFormat('id-ID').format(
                                      data.jamKerjaPerTahun
                                  )
                                : '-'
                        }}
                    </template>
                </Column>
                <Column
                    header="FTE"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{
                            data.fte
                                ? new Intl.NumberFormat('id-ID').format(
                                      data.fte
                                  )
                                : '-'
                        }}
                    </template>
                </Column>
                <Column
                    header="Status Approval"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <Tag
                            :severity="data.status.hexCode"
                            :value="data.status?.code ?? '-'"
                        ></Tag>
                    </template>
                </Column>
                <Column
                    v-if="
                        ifActionExist(
                            authStore.permittedAction,
                            ACTION_PERMISSIONS.EDIT_ABK_BEBAN_KERJA,
                            ACTION_PERMISSIONS.DEL_ABK_BEBAN_KERJA,
                            ACTION_PERMISSIONS.VIEW_ABK_BEBAN_KERJA
                        )
                    "
                    header="Action"
                    class="w-[5rem]"
                >
                    <template #body="{ data }">
                        <div
                            v-if="
                                data.status.code == 'APRV-UI' ||
                                data.status.code == 'APRV-HTD' ||
                                data.status.code == 'APRV-PST'
                            "
                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                        >
                            <Button
                                v-if="
                                    ifActionExist(
                                        authStore.permittedAction,
                                        ACTION_PERMISSIONS.VIEW_ABK_BEBAN_KERJA
                                    )
                                "
                                icon="pi pi-eye"
                                severity="primary"
                                rounded
                                aria-label="Filter"
                                @click="onClick('detail', data)"
                            />
                        </div>
                        <div
                            v-else
                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                        >
                            <Button
                                v-if="
                                    ifActionExist(
                                        authStore.permittedAction,
                                        ACTION_PERMISSIONS.EDIT_ABK_BEBAN_KERJA
                                    )
                                "
                                icon="pi pi-pencil"
                                severity="warn"
                                rounded
                                aria-label="Filter"
                                @click="onClick('update', data)"
                            />
                            <Button
                                v-if="
                                    ifActionExist(
                                        authStore.permittedAction,
                                        ACTION_PERMISSIONS.DEL_ABK_BEBAN_KERJA
                                    ) && data.status.code === 'DRAFT'
                                "
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
    <Dialog
        v-model:visible="visible"
        modal
        :draggable="false"
        :header="labelHeader"
        :style="{ width: '60rem' }"
        :pt="{
            pcCloseButton: {
                root: {
                    disabled: isLoading
                }
            }
        }"
    >
        <CompanyCodeAdd
            :data="dataCompany"
            :onClose="onHideForm"
            @on-change-loading="onChangeLoading"
            :is-loading="isLoading"
        />
    </Dialog>
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
                        <strong class="ml-1">Analisis Beban Kerja:</strong>
                        <strong class="ml-1">
                            {{ dataAnalisaBebanKerja.namaPekerjaan }}
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
