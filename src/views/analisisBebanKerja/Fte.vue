<script setup>
import AnalisaBebanKerjaService from '@/service/AnalisaBebanKerjaService';
import BusinessAreaService from '@/service/BusinessAreaService';
import ExportService from '@/service/ExportService';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref, computed } from 'vue';
import IParams from '../../interface/IParams';
import CompanyCodeService from '@/service/CompanyCodeService';
import debounce from '@/utils/debounce';

const datas = ref([]);
const dataRekap = ref({});
const search = ref('');
const loading = ref(null);
const isLoading = ref(false);
const loadingSubPersonelAreas = ref(false);
const loadingPersonelAreas = ref(false);
const param = ref({ ...IParams });
const toast = useToast();
const totalRecords = ref(0);
const paramSubPersonalAreas = ref({ ...IParams });
const paramPersonelAreas = ref({ ...IParams });
const totalPageSubPersonelAreas = ref(0);
const totalPagePersonelAreas = ref(0);
const dataSubPersonelArea = ref([]);
const dataPersonelAreas = ref([]);
const selectedSubPersonelArea = ref(null);
const selectedPersonelArea = ref(null);

const currentYear = new Date().getFullYear();
const dataTahun = new Array(7).fill(null).map((_, idx) => {
    return {
        value: currentYear - idx,
        description: currentYear - idx
    };
});
const period = ref({value:currentYear, description: currentYear});
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
    getDataRekap();
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

function getData() {
    loading.value = true;
    let params = {
        search: search.value,
        unitId: selectedSubPersonelArea.value?.id,
        companyId: selectedPersonelArea?.value?.id,
        period: period.value.value,
    };

    AnalisaBebanKerjaService.getFte(params)
        .then((response) => {
            loading.value = false;
            datas.value = response.data.data;
            param.value.size = response.data.size;
            //   param.value.totalRecords = response.data.totalElement;
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

function getDataRekap() {
    loading.value = true;

    let paramRekap = {
        search: search.value,
        unitId: selectedSubPersonelArea.value?.id,
        companyId: selectedPersonelArea?.value?.id,
        period: period.value.value
    };

    AnalisaBebanKerjaService.getRekapFte(paramRekap)
        .then((response) => {
            loading.value = false;
            dataRekap.value = response.data.data;
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

const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
    // loadLazyData(event);
};

function getDataAll() {
    getData();
    getDataRekap();
}
const exportExcel = async () => {
    if (isLoading.value) return;
    await ExportService.exportFile(
        'analisis-beban-kerja/fte',
        {
            search: search.value,
            unitId: selectedSubPersonelArea.value?.id,
            companyId: selectedPersonelArea?.value?.id,
            period: period.value.value
        },
        'analisis_beban_kerja_fte_' +
            moment(new Date()).format('YYYYMMDD_HHmmss'),
        'xlsx'
    );
};
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            Report Full Time Equivalent
        </div>

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
                                getDataAll();
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
                            () => {
                                paramSubPersonalAreas = { ...IParams };
                                getDataAll();
                            }
                        "
                    />
                    <Select
                        v-model="period"
                        :options="dataTahun"
                        optionLabel="description"
                        :placeholder="`Pilih Tahun`"
                        class="w-[100px]"
                        @change="getDataAll()"
                    />
                    <IconField class="w-full md:w-60">
                        <InputText autocomplete="off" 
                            class="w-full md:w-60"
                            v-model="search"
                            @change="getDataAll()"
                            placeholder="Search"
                        />
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                    </IconField>
                </div>

                <div class="flex flex-row gap-4 justify-end items-center w-fit">
                    <Button
                        icon="pi pi-file-excel"
                        severity="primary"
                        label="Export"
                        @click="exportExcel"
                    />
                </div>
            </div>
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                scrollHeight="400px"
                :rows="param.size"
                :rowsPerPageOptions="[5, 10, 20, 50]"
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
                    header="Nomor"
                    style="min-width: 12rem"
                >
                    <template #body="{ index }">
                        {{ param.page * param.size + index + 1 }}
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
                    header="Nama Vendor"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.namaPerusahaan ?? '-' }}
                    </template>
                </Column>
                <Column
                    header="Fungsi"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{ data.namaFungsi ?? '-' }}
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
                    header="FTE Per Tahun"
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
                    header="Jumlah Naker Terkontrak"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{
                            data.jmlNaker
                                ? new Intl.NumberFormat('id-ID').format(
                                      data.jmlNaker
                                  )
                                : '-'
                        }}
                    </template>
                </Column>
                <Column
                    header="Jumlah Naker Realisasi"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{
                            data.jmlNakerRealisasi
                                ? new Intl.NumberFormat('id-ID').format(
                                      data.jmlNakerRealisasi
                                  )
                                : '-'
                        }}
                    </template>
                </Column>
                <Column
                    header="Beban Kerja Per Orang"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        {{
                            data.bebanKerjaOrangPerTahun
                                ? new Intl.NumberFormat('id-ID').format(
                                      data.bebanKerjaOrangPerTahun
                                  )
                                : '-'
                        }}
                    </template>
                </Column>
            </DataTable>
        </div>
        <div class="card">
            <div class="font-semibold text-xl mb-4">Rekapitulasi</div>
            <table
                class="w-1/2 border border-gray-300 rounded-lg overflow-hidden"
            >
                <thead class="bg-gray-100">
                    <tr class="border-b border-gray-300">
                        <th class="px-4 py-2 text-left font-semibold">No</th>
                        <th class="px-4 py-2 text-left font-semibold">
                            Keterangan
                        </th>
                        <th class="px-4 py-2 text-left font-semibold">
                            Jumlah
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="border-b border-gray-300">
                        <td class="px-4 py-2">1</td>
                        <td class="px-4 py-2 flex items-center gap-2">
                            <i class="pi pi-file"></i> Total Perjanjian
                        </td>
                        <td class="px-4 py-2">
                            {{
                                new Intl.NumberFormat('id-ID').format(
                                    dataRekap.totalPerjanjian
                                )
                            }}
                        </td>
                    </tr>
                    <tr class="border-b border-gray-300">
                        <td class="px-4 py-2">2</td>
                        <td class="px-4 py-2 flex items-center gap-2">
                            <i class="pi pi-clock"></i> Total Jam kerja Per
                            Tahun
                        </td>
                        <td class="px-4 py-2">
                            {{
                                new Intl.NumberFormat('id-ID').format(
                                    dataRekap.totalJamKerjaPerTahun
                                )
                            }}
                        </td>
                    </tr>
                    <tr class="border-b border-gray-300">
                        <td class="px-4 py-2">3</td>
                        <td class="px-4 py-2 flex items-center gap-2">
                            <i class="pi pi-calendar"></i> Total FTE per Tahun
                        </td>
                        <td class="px-4 py-2">
                            {{
                                new Intl.NumberFormat('id-ID').format(
                                    dataRekap.totalFte
                                )
                            }}
                        </td>
                    </tr>
                    <tr class="border-b border-gray-300">
                        <td class="px-4 py-2">4</td>
                        <td class="px-4 py-2 flex items-center gap-2">
                            <i class="pi pi-users"></i> Total Jumlah Naker
                            Terkontrak
                        </td>
                        <td class="px-4 py-2">
                            {{
                                new Intl.NumberFormat('id-ID').format(
                                    dataRekap.totalNakerKontrak
                                )
                            }}
                        </td>
                    </tr>
                    <tr class="border-b border-gray-300">
                        <td class="px-4 py-2">5</td>
                        <td class="px-4 py-2 flex items-center gap-2">
                            <i class="pi pi-user"></i> Total Jumlah Naker
                            Realisasi
                        </td>
                        <td class="px-4 py-2">
                            {{
                                new Intl.NumberFormat('id-ID').format(
                                    dataRekap.totalNakerRealisasi
                                )
                            }}
                        </td>
                    </tr>
                    <tr>
                        <td class="px-4 py-2">6</td>
                        <td class="px-4 py-2 flex items-center gap-2">
                            <i class="pi pi-users"></i> Total Beban Kerja per
                            Orang per Tahun
                        </td>
                        <td class="px-4 py-2">
                            {{
                                new Intl.NumberFormat('id-ID').format(
                                    dataRekap.totalBebanKerjaOrangPerTahun
                                )
                            }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>
