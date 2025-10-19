<!-- <script setup>
import moment from 'moment';
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch, computed, onBeforeMount } from 'vue';
import 'leaflet/dist/leaflet.css';

const { getPrimary, getSurface, isDarkTheme } = useLayout();
const zoom = ref(5);
const isLoading = ref(false);
const dataOverview = ref({});
const dataTahun = ref([]);
const selectedTahun = ref();
const selectedType = ref({ value: 'H', description: 'Holding' });
const optionTypes = [
    { value: 'H', description: 'Holding' },
    { value: 'SH', description: 'Subholding' },
    { value: 'AP', description: 'Anak Perusahaan' }
];
const charts = ref([]);
const chartsRealisasi = ref([]);

const chartJmlTenagaKerja = ref({
    series: [],
    option: {}
});
const chartJmlRealisasiPembayaran = ref({
    series: [],
    option: {}
});

const formatter = new Intl.NumberFormat('id-ID');
const basicChartOpt = {
    chart: {
        type: 'bar',
        height: 350
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5,
            borderRadiusApplication: 'end',
            distributed: true
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    colors: ['#939C44', '#00667A', '#DD4803'],
    fill: { opacity: 1 },
    tooltip: {
        y: {
            title: {
                formatter: function () {
                    return '';
                }
            }
        },
        x: {
            show: false
        }
    },
    yaxis: {
        labels: {
            formatter: function (val) {
                return formatter.format(Number(val));
            }
        }
    }
};

const chartOptions2Category = {
    chart: {
        type: 'bar',
        height: 350
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '55%',
            borderRadius: 5,
            borderRadiusApplication: 'end'
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
    },
    xaxis: {
        categories: ['AP', 'NAP']
    },
    fill: {
        opacity: 1,
        colors: ['#939C44', '#00667A', '#DD4803']
    },
    tooltip: {
        y: {
            formatter: function (val) {
                return formatter.format(Number(val));
            }
        }
    },
    yaxis: {
        labels: {
            formatter: function (val) {
                return formatter.format(Number(val));
            }
        }
    }
};

const carouselResponsiveOpt = ref([
    {
        breakpoint: '767px',
        numVisible: 2,
        numScroll: 2
    },
    {
        breakpoint: '575px',
        numVisible: 1,
        numScroll: 1
    }
]);

const filterOverview = computed(() => {
    return {
        period: selectedTahun?.value?.value,
        type: selectedType?.value?.value
    };
});

const markers = computed(() => {
    return (dataOverview.value?.regionMap || []).map((it) => {
        return [it.latitude, it.longitude];
    });
});
const markerTooltips = computed(() => {
    return (dataOverview.value?.regionMap || []).map((it) => {
        return {
            name: it.name,
            data: [
                {
                    ico: 'pi pi-user',
                    ap: it.ap.totalNaker,
                    nap: it.nap.totalNaker
                },
                {
                    ico: 'pi pi-book',
                    ap: it.ap.totalKontrak,
                    nap: it.nap.totalKontrak
                }
            ]
        };
    });
});

onBeforeMount(() => getDataTahun());

onMounted(() => {
    getData();
});

function getData() {
    Promise.all([
        getDataOverview(),
        getDataOverviewNakerKontrak(),
        getDataOverviewRealisasiKontrak()
    ]);
}

function getDataTahun() {
    isLoading.value = true;
    const year = moment().format('yyyy');
    for (var i = 0; i < 7; i++) {
        const dt = year * 1 - i;
        dataTahun.value.push({ value: dt, description: dt });
    }
    if (selectedTahun.value == null) selectedTahun.value = dataTahun.value[0];
}

function onPrintPDF() {
    window.print();
}

function getDataOverview() {
    isLoading.value = true;
    return new Promise((resolve) => {
    });
}

function getDataOverviewNakerKontrak() {
    isLoading.value = true;
    return new Promise((resolve) => {
    });
}

function getDataOverviewRealisasiKontrak() {
    isLoading.value = true;
    return new Promise((resolve) => {
    });
}

watch([getPrimary, getSurface, isDarkTheme], () => {}); 

</script>  -->
<script setup>
import WeeklyCalendar from '@/components/WeeklyCalendar.vue';
import ChartDashboard from '@/components/ChartDashboard.vue';
</script>
<template>
    <div id="dashboard">
        <!-- <div
            class="flex flex-col md:flex-row gap-4 justify-end items-center mt-4 mb-4 print:hidden"
        >
            <Select
                v-model="selectedTahun"
                :options="dataTahun"
                optionLabel="description"
                :placeholder="`Pilih Tahun`"
                class="w-[150px]"
                @change="getData()"
            />
            <Select
                v-model="selectedType"
                :options="optionTypes"
                optionLabel="description"
                placeholder="Tipe"
                class="w-[220px]"
                @change="getData()"
            />
            <Button
                label="Export"
                @click="onPrintPDF"
                type="button"
                rounded
                severity="primary"
            />
        </div>
        <div class="grid grid-cols-12 gap-8">
            <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 print:col-span-3"
            >
                <div class="card mb-0 p-6">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block font-medium text-xl mb-4"
                                >Total Realisasi Biaya Tahun
                                {{ selectedTahun.value }}</span
                            >
                            <div
                                class="text-surface-900 dark:text-surface-0 font-medium"
                                style="
                                    font-size: 24px;
                                    font-weight: 700 !important;
                                "
                            >
                                Rp.
                                {{
                                    formatter.format(
                                        dataOverview?.general?.total
                                            ?.nilaiKontrak ?? 0
                                    )
                                }}
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-center"
                            style="width: 2.5rem; height: 2.5rem"
                        >
                            <img
                                :src="'/demo/images/icon/money.png'"
                                alt="down red"
                                width="28"
                            />
                        </div>
                    </div> -->
                                    <!-- <span class="font-medium">
                                        <div
                                            class="flex"
                                            style="height: 2.5rem"
                                        >
                                            <img
                                                :src="'/demo/images/down-red.png'"
                                                alt="down red"
                                                width="28"
                                            />
                                            <div class="pt-2">
                                                <span class="text-danger px-2">10%</span>
                                                <span class="text-muted-color"
                                                    >Vs Last Month</span
                                                >
                                            </div>
                                        </div>
                                    </span> -->
                <!-- </div>
            </div>
            <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 print:col-span-3"
            >
                <div class="card mb-0 p-6">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block font-medium text-xl mb-4"
                                >Jumlah Tenaga Kerja Per Tahun
                                {{ selectedTahun.value }}</span
                            >
                            <div
                                class="text-surface-900 dark:text-surface-0 font-medium"
                                style="
                                    font-size: 24px;
                                    font-weight: 700 !important;
                                "
                            >
                                {{
                                    formatter.format(
                                        dataOverview?.general?.total?.naker ?? 0
                                    )
                                }}
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-center"
                            style="width: 2.5rem; height: 2.5rem"
                        >
                            <img
                                :src="'/demo/images/icon/user.png'"
                                alt="down red"
                                width="32"
                            />
                        </div>
                    </div> -->
                                    <!-- <span class="font-medium">
                                        <div
                                            class="flex"
                                            style="height: 2.5rem"
                                        >
                                            <img
                                                :src="'/demo/images/up-green.png'"
                                                alt="down red"
                                                width="28"
                                            />
                                            <div class="pt-2">
                                                <span
                                                    class="text-success px-2"
                                                    style="color: #25ac00"
                                                    >10%</span
                                                >
                                                <span class="text-muted-color"
                                                    >Vs Last Month</span
                                                >
                                            </div>
                                        </div>
                                    </span> -->
                <!-- </div>
            </div>
            <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 print:col-span-3"
            >
                <div class="card mb-0 p-6">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block font-medium text-xl mb-4"
                                >Jumlah Perjanjian Per Tahun
                                {{ selectedTahun.value }}</span
                            >
                            <div
                                class="text-surface-900 dark:text-surface-0 font-medium"
                                style="
                                    font-size: 24px;
                                    font-weight: 700 !important;
                                "
                            >
                                {{
                                    formatter.format(
                                        dataOverview?.general?.total?.kontrak ??
                                            0
                                    )
                                }}
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-center"
                            style="width: 2.5rem; height: 2.5rem"
                        >
                            <img
                                :src="'/demo/images/icon/doc.png'"
                                alt="down red"
                                width="24"
                            />
                        </div>
                    </div> -->
                                    <!-- <span class="font-medium">
                                        <div
                                            class="flex"
                                            style="height: 2.5rem"
                                        >
                                            <img
                                                :src="'/demo/images/down-red.png'"
                                                alt="down red"
                                                width="28"
                                            />
                                            <div class="pt-2">
                                                <span
                                                    class="text-danger px-2"
                                                    style="color: #25ac00"
                                                    >10%</span
                                                >
                                                <span class="text-muted-color"
                                                    >Vs Last Month</span
                                                >
                                            </div>
                                        </div>
                                    </span> -->
                <!-- </div>
            </div>
            <div
                class="col-span-12 lg:col-span-6 xl:col-span-3 print:col-span-3"
            >
                <div class="card mb-0 p-6">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block font-medium text-xl mb-4"
                                >Jumlah Vendor Per Tahun
                                {{ selectedTahun.value }}</span
                            >
                            <div
                                class="text-surface-900 dark:text-surface-0 font-medium"
                                style="
                                    font-size: 24px;
                                    font-weight: 700 !important;
                                "
                            >
                                {{
                                    formatter.format(
                                        dataOverview?.general?.total?.vendor ??
                                            0
                                    )
                                }}
                            </div>
                        </div>
                        <div
                            class="flex items-center justify-center"
                            style="width: 2.5rem; height: 2.5rem"
                        >
                            <img
                                :src="'/demo/images/icon/vendor.png'"
                                alt="down red"
                                width="24"
                            />
                        </div>
                    </div> -->
                                    <!-- <span class="font-medium">
                                        <div
                                            class="flex"
                                            style="height: 2.5rem"
                                        >
                                            <img
                                                :src="'/demo/images/up-green.png'"
                                                alt="down red"
                                                width="28"
                                            />
                                            <div class="pt-2">
                                                <span
                                                    class="text-success px-2"
                                                    style="color: #25ac00"
                                                    >10%</span
                                                >
                                                <span class="text-muted-color"
                                                    >Vs Last Month</span
                                                >
                                            </div>
                                        </div>
                                    </span> -->
                <!-- </div>
            </div>
        </div>

        <div class="grid grid-cols-12 gap-8 pt-4">
            <div
                class="col-span-6 lg:col-span-6 xl:col-span-6 mt-4 print:col-span-6"
            >
                <div class="card mb-0">
                    <div>
                        <span
                            class="block font-medium mb-4"
                            style="font-size: 16px"
                            >Jumlah Tenaga Kerja</span
                        >
                    </div>
                    <apexchart
                        width="100%"
                        height="350"
                        type="bar"
                        :options="chartJmlTenagaKerja.option"
                        :series="chartJmlTenagaKerja.series"
                    ></apexchart>
                </div>
            </div>
            <div
                class="col-span-6 lg:col-span-6 xl:col-span-6 mt-4 print:col-span-6"
            >
                <div class="card mb-0">
                    <div>
                        <span
                            class="block font-medium mb-4"
                            style="font-size: 16px"
                            >Jumlah Nilai Realisasi Pembayaran</span
                        >
                    </div>
                    <apexchart
                        width="100%"
                        height="350"
                        type="bar"
                        :options="chartJmlRealisasiPembayaran.option"
                        :series="chartJmlRealisasiPembayaran.series"
                    ></apexchart>
                </div>
            </div>
        </div>

        <Carousel
            class="mt-4"
            :value="[...charts, ...chartsRealisasi]"
            :numVisible="2"
            :numScroll="2"
            :prevButtonProps="{ severity: 'primary' }"
            :nextButtonProps="{ severity: 'primary' }"
            :responsiveOptions="carouselResponsiveOpt"
        >
            <template #item="{ data }">
                <div
                    v-for="(dt, idx) in data"
                    :key="dt.title"
                    :class="{
                        'm-4': idx === 0,
                        'ml-4 mr-4 mt-8': idx > 0
                    }"
                >
                    <div class="card mb-0">
                        <div>
                            <span
                                class="block font-medium mb-4"
                                style="font-size: 16px"
                                >{{ dt.title }}</span
                            >
                        </div>
                        <apexchart
                            width="100%"
                            height="350"
                            type="bar"
                            :options="dt.categories"
                            :series="dt.series"
                        >
                        </apexchart>
                    </div>
                </div>
            </template> 
        </Carousel>-->
        <WeeklyCalendar />
        <ChartDashboard />
    </div>
</template>

<!-- <style scoped lang="scss">
:deep(.p-carousel-content) {
    position: relative;
    display: block;
}

:deep(.p-carousel-content > button:first-child) {
    position: absolute;
    left: 0;
    z-index: 1;
    top: 50%;
}

:deep(.p-carousel-content > button:last-child) {
    position: absolute;
    right: 0;
    z-index: 1;
    top: 50%;
}

@media print {
    :deep(.p-carousel-content > button) {
        display: none;
    }
}
</style> -->

<style scoped>
#dashboard {
    min-height: 100vh;
    overflow-y: auto;
    padding: 20px;
}

/* Ensure ChartDashboard is visible */
:deep(.chart-dashboard) {
    display: block !important;
    visibility: visible !important;
}
</style>

