<script setup>
import { onMounted, ref, toRaw } from 'vue';
import BebanKerja from './bebanKerja/BebanKerja.vue';
import Perjanjian from './Perjanjian.vue';
import History from './History.vue';
import AnalisaBebanKerjaService from '@/service/AnalisaBebanKerjaService';
import KontrakService from '@/service/KontrakService';

const props = defineProps({
    data: Object,
    id: {
        type: String
    },
    idKontrak: {
        type: String
    },
    action: {
        type: String
    },
    header: {
        type: String
    },
    onClose: {
        type: Function
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const isLoading = ref(false);
const activeStep = ref(1);
const lastStep = ref(1);
const title = ref('Beban Kerja Perjanjian');
const tempData = ref();

const listStepperAdd = [
    {
        id: 1,
        icon: 'pi pi-info-circle',
        title: 'Analisa Beban Kerja',
        component: 'analisaBebanKerja'
    }
];

const listStepperDetail = [
    {
        id: 1,
        icon: 'pi pi-info-circle',
        title: 'Analisa Beban Kerja',
        component: 'analisaBebanKerja'
    },
    {
        id: 2,
        icon: 'pi pi-th-large',
        title: 'Perjanjian',
        component: 'perjanjian'
    },
    {
        id: 3,
        icon: 'pi pi-chart-bar',
        title: 'History',
        component: 'history'
    }
];

const listStepper = ref([]);

function getByNoKontrak() {
    AnalisaBebanKerjaService.getDetail(props.id)
        .then((response) => {
            let param = { nomorKontrak: response.data.data.nomorKontrak };
            KontrakService.getKontrak(param)
                .then((response) => {
                    tempData.value = { ...response.data.data };
                })
                .catch((e) => {
                    console.log(e);
                });
        })
        .catch((e) => {
            console.log(e);
        });
}

onMounted(() => {
    if (props.action != 'add') {
        getByNoKontrak();
        title.value = 'Analisa Beban Kerja';
        listStepper.value.push(...listStepperDetail);
    } else {
        title.value = 'Analisa Beban Kerja';
        listStepper.value.push(...listStepperAdd);
    }
});
</script>

<template>
    <Fluid>
        <div class="flex">
            <div class="flex flex-col gap-4 w-full h-fit">
                <label class="font-semibold text-xl">{{ title }}</label>
                <div v-if="isLoading">
                    <Skeleton class="mb-2"></Skeleton>
                    <Skeleton class="mb-2 w-1/2"></Skeleton>
                    <Skeleton class="mb-2 w-1/3"></Skeleton>
                </div>
                <div
                    class="card"
                    v-else
                >
                    <Stepper
                        :value="1"
                        class="h-fit"
                        v-model:value="activeStep"
                    >
                        <StepList class="justify-normal gap-x-4">
                            <Step
                                v-for="dt in listStepper"
                                v-slot="{ activateCallback, value, a11yAttrs }"
                                asChild
                                :value="dt.id"
                            >
                                <div
                                    :class="[
                                        'flex flex-col gap-2 items-center px-6 py-2 rounded-md text-primary',
                                        {
                                            'bg-primary-50': value == activeStep
                                        }
                                    ]"
                                    v-bind="a11yAttrs.root"
                                    @click="activateCallback()"
                                >
                                    <i :class="dt.icon + ' text-2xl'"></i>
                                    <span class="font-bold">{{
                                        dt.title
                                    }}</span>
                                </div>
                            </Step>
                        </StepList>
                        <Divider class="mt-8" />
                        <StepPanels>
                            <StepPanel
                                v-for="dt in listStepper"
                                :value="dt.id"
                            >
                                <BebanKerja
                                    v-if="dt.component === 'analisaBebanKerja'"
                                    :action="props.action"
                                    :id="props.id"
                                    :item="tempData"
                                    :next-action="
                                        function (val) {
                                            activateCallback(dt.id + 1);
                                        }
                                    "
                                >
                                </BebanKerja>
                                <Perjanjian
                                    v-if="dt.component === 'perjanjian'"
                                    :item="tempData"
                                    :next-action="
                                        function (val) {
                                            activateCallback(dt.id + 1);
                                        }
                                    "
                                >
                                </Perjanjian>
                                <History
                                    v-if="dt.component === 'history'"
                                    :id="props.id"
                                    :next-action="
                                        function (val) {
                                            activateCallback(dt.id + 1);
                                        }
                                    "
                                >
                                </History>
                            </StepPanel>
                        </StepPanels>
                    </Stepper>
                </div>
                <!-- <div class="flex flex-col md:flex-row gap-4 justify-end items-start mt-4">
                    <Button class="w-24" variant="text" severity="danger" label="Back" @click="activateCallback(2)" />
                    <Button class="w-24" label="Next" @click="onClickSave" />
                </div> -->
            </div>
        </div>
    </Fluid>
    <ConfirmDialog id="confirm" />
    <Toast />
</template>
