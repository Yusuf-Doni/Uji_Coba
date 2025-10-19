<script setup>
import IParams from '@/interface/IParams';
import BusinessAreaService from '@/service/BusinessAreaService';
import CompanyCodeService from '@/service/CompanyCodeService';
import ExportService from '@/service/ExportService';
import KanalKomunikasiService from '@/service/KanalKomunikasiService';
import { useAuth } from '@/stores';
import { ifActionExist } from '@/utils/checkActionPermissions';
import {
    ACTION_PERMISSIONS,
    listOptStatusKnlKom
} from '@/utils/constantVariable';
import debounce from '@/utils/debounce';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref } from 'vue';
import AddKanalKomunikasiModal from './AddKanalKomunikasiModal.vue';
import KanalKomunikasiAddDialogWrapper from './KanalKomunikasiAddDialogWrapper.vue';

const datas = ref([]);
const dataTenagaKerja = ref([]);
const search = ref(null);
const loading = ref(null);
const isLoading = ref(false);
const visibleAddKanalModal = ref(false);
const labelHeaderKanalModal = ref('Tambah Data Komunikasi');
const actionModalKanal = ref('add');
const param = ref({
    ...IParams
});
const selectedStatus = ref();
const toast = useToast();
const totalRecords = ref(0);
const authStore = useAuth();
const isLoadingExport = ref(false);

// state business area
const businessAreaOpt = ref([]);
const isLoadingBusinessArea = ref();
const totalPageBusinessArea = ref(0);
const paramBusinessArea = ref({ ...IParams });
const selectedBusinessArea = ref();

const companyCodeOpt = ref([]);
const totalPageCompanyCode = ref(0);
const isLoadingCompanyCode = ref();
const selectedCompanyCode = ref();
const paramCompanyCode = ref({ ...IParams });

// handle companyCode
const getOptCompanyCode = async () => {
    isLoadingCompanyCode.value = true;
    await CompanyCodeService.getActive(paramCompanyCode.value)
        .then((response) => {
            companyCodeOpt.value = response.data.data;
            totalPageCompanyCode.value = Math.ceil(
                response.data.totalElement / 10
            );
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingCompanyCode.value = false;
        });
};

const onScrollEventCompanyCode = async (event) => {
    if (
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
        if (
            paramCompanyCode.value.size < totalPageCompanyCode.value * 10 &&
            !isLoadingCompanyCode.value
        ) {
            paramCompanyCode.value.size += 10;
            await getOptCompanyCode();
        }
    }
};

const filterCompanyCodeAPi = (events) => {
    paramCompanyCode.value.size = 10;
    paramCompanyCode.value.search = events.value;
    getOptCompanyCode();
};

const debounceFilterCompanyCode = debounce(filterCompanyCodeAPi, 500);

const onFilterCompanyCode = (event) => {
    businessAreaOpt.value = [];
    debounceFilterCompanyCode(event);
};

async function onChangePersonalArea() {
    selectedBusinessArea.value = null;
    await getOptBusinessArea();
    getData();
} 

// handle business area
const getOptBusinessArea = async () => {
    isLoadingBusinessArea.value = true;
    paramBusinessArea.value.personel_area =
        selectedCompanyCode.value?.id ?? null;
    await BusinessAreaService.getActive(paramBusinessArea.value)
        .then((response) => {
            businessAreaOpt.value = response.data.data;
            totalPageBusinessArea.value = Math.ceil(
                response.data.totalElement / 10
            );
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingBusinessArea.value = false;
        });
};

const onScrollEventBusinessArea = async (event) => {
    if (
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
        if (
            paramBusinessArea.value.size < totalPageBusinessArea.value * 10 &&
            !isLoadingBusinessArea.value
        ) {
            paramBusinessArea.value.size += 10;
            await getOptBusinessArea();
        }
    }
};

const filterBusinessAreaAPi = (events) => {
    paramBusinessArea.value.size = 10;
    paramBusinessArea.value.search = events.value;
    getOptBusinessArea();
};

const debounceFilterBusinessArea = debounce(filterBusinessAreaAPi, 500);

const onFilterBusinessArea = (event) => {
    businessAreaOpt.value = [];
    debounceFilterBusinessArea(event);
};

function getData() {
    loading.value = true;

    param.value.search = search.value;
    param.value.status = selectedStatus.value;
    param.value.businessAreaId = selectedBusinessArea.value?.id;
    param.value.companyId = selectedCompanyCode.value?.id

    KanalKomunikasiService.get(param.value)
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

function onClickAdd() {
    visibleAddKanalModal.value = true;
    labelHeaderKanalModal.value = 'Tambah Data Komunikasi';
    actionModalKanal.value = 'add';
    dataTenagaKerja.value = null;
}

function onClickEdit(data) {
    visibleAddKanalModal.value = true;
    labelHeaderKanalModal.value = 'Tambah Data Komunikasi';
    dataTenagaKerja.value = data;
    actionModalKanal.value = 'edit';
}

function onClickDetail(data) {
    visibleAddKanalModal.value = true;
    labelHeaderKanalModal.value = 'Detail Data Komunikasi';
    dataTenagaKerja.value = data;
    actionModalKanal.value = 'detail';
}
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
};

function onHideKanalKomunikasiModal() {
    visibleAddKanalModal.value = false;
}

const getNamaStatus = (status) => {
    const findObj = status
        ? listOptStatusKnlKom.find(
              (item) => item.code === status.replace(' ', '_').toUpperCase()
          )
        : '-';

    return findObj.name;
};

onBeforeMount(() => {
    getOptCompanyCode();
});

onMounted(() => {
    getData();
});

const exportExcel = async () => {
    isLoadingExport.value = true;
    await ExportService.exportFile(
        'kanal_komunikasi',
        {
            businessAreaId: param.value.businessAreaId,
            status: param.value.status,
            search: param.value.search,
            companyId: param.value.companyId
        },
        'kanal_komunikasi_' + moment(new Date()).format('YYYYMMDD_HHmmss'),
        'xlsx'
    );
    isLoadingExport.value = false;
};
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Kanal Komunikasi</div>

        <div class="card">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                :scroll-height="'400px'"
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
                        <Select
                            :virtual-scroller-options="{
                                autoSize: true,
                                lazy: true,
                                onLazyLoad: isLoadingCompanyCode,
                                showLoader: isLoadingCompanyCode,
                                loading: isLoadingCompanyCode,
                                itemSize: 38,
                                delay: 0,
                                onscroll: (event) => {
                                    onScrollEventCompanyCode(event);
                                }
                            }"
                            :loading="isLoadingCompanyCode"
                            :filter="true"
                            name="companyCode"
                            :options="companyCodeOpt"
                            :filterFields="['description']"
                            placeholder="Pilih Personal Area"
                            @filter="onFilterCompanyCode"
                            @change="onChangePersonalArea"
                            :showClear="true"
                            v-model="selectedCompanyCode"
                            optionLabel="description"
                            
                        >
                            <template #emptyfilter>
                                {{ '' }}
                            </template>
                            <template #empty>
                                {{ '' }}
                            </template>
                        </Select>
                        <Select
                            :virtual-scroller-options="{
                                autoSize: true,
                                lazy: true,
                                onLazyLoad: isLoadingBusinessArea,
                                showLoader: isLoadingBusinessArea,
                                loading: isLoadingBusinessArea,
                                itemSize: 38,
                                delay: 0,
                                onscroll: (event) => {
                                    onScrollEventBusinessArea(event);
                                }
                            }"
                            :loading="isLoadingBusinessArea"
                            :filter="true"
                            name="businessArea"
                            :options="businessAreaOpt"
                            :filterFields="['description']"
                            placeholder="Pilih Personal Sub Area"
                            @filter="onFilterBusinessArea"
                            @change="getData"
                            :showClear="true"
                            v-model="selectedBusinessArea"
                            optionLabel="description"
                        >
                            <template #emptyfilter>
                                {{ '' }}
                            </template>
                            <template #empty>
                                {{ '' }}
                            </template>
                        </Select>
                        <Select
                            v-model="selectedStatus"
                            :options="listOptStatusKnlKom"
                            option-label="name"
                            option-value="code"
                            :placeholder="`Pilih Status`"
                            :showClear="true"
                            @change="getData"
                        />
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
                            v-if="
                                ifActionExist(
                                    authStore.permittedAction,
                                    ACTION_PERMISSIONS.ADD_KANAL_KOMUNIKASI
                                )
                            "
                            icon="pi pi-plus"
                            severity="primary"
                            variant="outlined"
                            label="Tambah Data"
                            @click="onClickAdd"
                        />
                        <Button
                            icon="pi pi-file-excel"
                            label="Export"
                            @click="
                                () => {
                                    exportExcel();
                                }
                            "
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
                    header="Username"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.username }}
                    </template>
                </Column>
                <Column
                    header="Name"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.name }}
                    </template>
                </Column>
                <Column
                    header="Unit Kerja"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.businessArea?.description }}
                    </template>
                </Column>
                <Column
                    header="Judul"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.judul }}
                    </template>
                </Column>
                <Column
                    header="Deskripsi"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.deskripsi }}
                    </template>
                </Column>
                <Column
                    header="Tindak Lanjut"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.tindakLanjut }}
                    </template>
                </Column>
                <Column
                    header="Status"
                    dataType="text"
                    style="min-width: 12rem"
                >
                    <template #body="{ data }">
                        {{ getNamaStatus(data.status) }}
                    </template>
                </Column>
                <Column
                    v-if="
                        ifActionExist(
                            authStore.permittedAction,
                            ACTION_PERMISSIONS.VIEW_KANAL_KOMUNIKASI,
                            ACTION_PERMISSIONS.EDIT_KANAL_KOMUNIKASI
                        )
                    "
                    header="Action"
                    class="w-[5rem]"
                >
                    <template #body="{ data }">
                        <div
                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                        >
                            <Button
                                v-if="
                                    ifActionExist(
                                        authStore.permittedAction,
                                        ACTION_PERMISSIONS.VIEW_KANAL_KOMUNIKASI
                                    )
                                "
                                icon="pi pi-eye"
                                severity="primary"
                                rounded
                                aria-label="detail"
                                @click="onClickDetail(data)"
                                v-tooltip.bottom="'Detail'"
                            />
                            <Button
                                v-if="
                                    ifActionExist(
                                        authStore.permittedAction,
                                        ACTION_PERMISSIONS.EDIT_KANAL_KOMUNIKASI
                                    )
                                "
                                icon="pi pi-pencil"
                                severity="warn"
                                rounded
                                aria-label="tindak lanjut"
                                @click="onClickEdit(data)"
                                v-tooltip.bottom="'Tindak Lanjut'"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
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
    <KanalKomunikasiAddDialogWrapper
        :visible="visibleAddKanalModal"
        :label="labelHeaderKanalModal"
        :onHideForm="onHideKanalKomunikasiModal"
    >
        <AddKanalKomunikasiModal
            :data="dataTenagaKerja"
            :onClose="onHideKanalKomunikasiModal"
            :is-loading="isLoading"
            :refetch-data="getData"
            :action="actionModalKanal"
        />
    </KanalKomunikasiAddDialogWrapper>
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
