<script setup>
import IParams from '@/interface/IParams';
import AktivitasService from '@/service/AktivitasService';
import AnalisaBebanKerjaService from '@/service/AnalisaBebanKerjaService';
import FungsiService from '@/service/FungsiService';
import JenisPekerjaanService from '@/service/JenisPekerjaanService';
import KontrakService from '@/service/KontrakService';
import { useAuth } from '@/stores';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import moment from 'moment';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string } from 'yup';
import AddSubAktifitas from './AddSubAktifitas.vue';
import AktivitasKerjaAdd from './AktivitasKerjaAdd.vue';

const props = defineProps({
    item: Object,
    id: {
        type: String
    },
    action: {
        type: String
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const authStore = useAuth();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirmDelete = useConfirm();

const dataDetail = ref({});
const isLoading = ref(false);
const isLoadingDelete = ref(false);
const dataByKontrak = ref(null);
const dataFungsi = ref();
const isLoadingDataFungsi = ref(false);
const paramFungsi = ref({ ...IParams });
const selectedFungsi = ref();
const nomorKontrak = ref('');
const statusDetail = ref('');

const dataJenisPekerjaan = ref();
const isLoadingDataPekerjaan = ref(false);
const paramJenisPekerjaan = ref({ ...IParams });
const totalPage = ref(0);
const selectedJenisPekerjaan = ref();
const lokasiPekerjaan = ref('');

const isNotValid = ref(false);
const dataAktivitas = ref([]);
const isLoadingDataAktivitas = ref(false);
const paramAktivitas = ref({ ...IParams });
const visible = ref(false);
const labelHeader = ref('Tambah Aktifitas Kerja');
const dataTahun = ref([]);
const selectedTahun = ref();
const dataSelectedAktivitas = ref({});
const activityData = ref();
const dialogAddSub = reactive({
    show: false,
    data: {}
});
const message = ref(null);

watch(
    () => props.item,
    (val) => {
        if (val) {
            getDetail();
        }
    }
);

const dialogKonfirmasi = reactive({
    show: false,
    title: '',
    message: '',
    status: '',
    params: '',
    load: false
});

function getDataTahun() {
    isLoading.value = true;
    const year = moment().format('yyyy');
    for (var i = 0; i < 7; i++) {
        const dt = year * 1 - i;
        dataTahun.value.push({ name: dt, code: dt });
    }
    if (selectedTahun.value == null) selectedTahun.value = dataTahun.value[0];
}

function changeKontrak(val) {
    if (val) {
        let param = { nomorKontrak: val };
        KontrakService.getKontrak(param)
            .then((response) => {
                dataByKontrak.value = response.data.data;
            })
            .catch((e) => {
                console.log(e);
            });
    } else {
        isNotValid.value = false;
        dataByKontrak.value = null;
        selectedTahun.value = dataTahun.value[0];
        selectedFungsi.value = null;
        dataJenisPekerjaan.value = [];
        selectedJenisPekerjaan.value = null;
        lokasiPekerjaan.value = '';
        dataAktivitas.value = [];
    }
}

const resolver = yupResolver(
    object().shape({
        nomorPerjanjian: object().required('Nomor Perjanjian harus diisi'),
        periode: object().required('Periode harus diisi'),
        fungsi: object().required('Fungsi harus diisi'),
        jenisPekerjaan: string().required('Jenis Pekerjaan harus diisi'),
        lokasiPekerjaan: string().required('Lokasi Pekerjaan harus diisi')
    })
);
onMounted(() => {
    if (props.action !== 'add') {
        getDetail();
        // enterKontrak();
    }
    console.log(props.action);

    getDataFungsi();
    getDataTahun();
});
function getDetail() {
    isLoadingDataAktivitas.value = false;

    AnalisaBebanKerjaService.getDetail(props.id)
        .then((response) => {
            isLoadingDataAktivitas.value = false;
            dataDetail.value = response.data.data;
            let datas = response.data.data.activities;
            let dataModif = [];
            datas.forEach((e) => {
                e.subActivity.forEach((el) => {
                    el.frekuensi = el.frekuensi;
                    el.volume = el.volume;
                    el.jamKerjaPerTahun = el.jamKerjaPerTahun;
                    el.processTimeUser = el.processTimeDefault;
                    el.kuantitasUser = el.kuantitas;
                });
                dataModif.push(e);
            });
            console.log('data aktivitas 2', dataModif);
            dataAktivitas.value = dataModif;
            selectedFungsi.value = response.data.data.fungsiId;
            selectedJenisPekerjaan.value =
                response.data.data.jenisPekerjaanAbkId;
            getJenisPekerjaan();
            dataByKontrak.value = props.item;
            lokasiPekerjaan.value = response.data.data.lokasiKerja;
            statusDetail.value = dataDetail.value.status.code;
        })
        .catch((e) => {
            isLoadingDataAktivitas.value = false;
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
            console.log(e);
        });
}
const getDataFungsi = async () => {
    isLoadingDataFungsi.value = true;
    await FungsiService.get(paramFungsi.value)
        .then((response) => {
            isLoadingDataFungsi.value = false;
            dataFungsi.value = response.data.data;

            totalPage.value = Math.ceil(response.data.totalElement / 10);
        })
        .catch((e) => {
            isLoadingDataFungsi.value = false;
            console.log(e);
        });
};

const getJenisPekerjaan = async () => {
    isLoadingDataPekerjaan.value = true;
    await JenisPekerjaanService.getByFungsiId(
        paramJenisPekerjaan.value,
        props.action === 'add' ? selectedFungsi.value.id : selectedFungsi.value
    )
        .then((response) => {
            isLoadingDataPekerjaan.value = false;
            dataJenisPekerjaan.value = response.data.data;

            totalPage.value = Math.ceil(response.data.totalElement / 10);
        })
        .catch((e) => {
            isLoadingDataPekerjaan.value = false;
            console.log(e);
        });
};

const getAktivitas = async () => {
    isLoadingDataAktivitas.value = true;
    await AktivitasService.getByJenisPekerjaanId(
        paramAktivitas.value,
        selectedJenisPekerjaan.value.id
    )
        .then((response) => {
            isLoadingDataAktivitas.value = false;

            let datas = response.data.data;
            let dataModif = [];
            datas.forEach((e) => {
                e.subActivities.forEach((el) => {
                    el.frekuensi = null;
                    el.volume = null;
                    el.jamKerjaPerTahun = 0;
                    el.processTimeUser = el.processTimeDefault;
                    el.kuantitasUser = el.kuantitas;
                });
                dataModif.push(e);
            });
            console.log('data aktivitas 2', dataModif);
            dataAktivitas.value = dataModif;

            totalPage.value = Math.ceil(response.data.totalElement / 10);
        })
        .catch((e) => {
            isLoadingDataAktivitas.value = false;
            console.log(e);
        });
};
function onClick(data) {
    if (dataJenisPekerjaan.value == null) {
    } else {
        console.log(data);
        if (data != null) {
            labelHeader.value = 'Edit data aktivitas';
        } else {
            labelHeader.value = 'Tambah data aktivitas';
        }
        visible.value = true;
        dataSelectedAktivitas.value = data;
    }
}
function onClickNext() {}

function aksi(status) {
    let catatan = {
        id: 2,
        jenisPekerjaanAbkId: 1,
        kuantitas: 2,
        nama: 'Melakukan absensi awal shift',
        parentId: 1,
        periodeId: 3,
        periodeName: 'Bulanan',
        periodeValue: 12,
        processTimeDefault: 1,
        // tambahan
        frekuensi: 1,
        volume: 1,
        jamKerjaPerTahun: 0,
        processTimeUser: 1,
        kuantitasUser: 1
    };
    let mergedSubActivities = [];
    if (props.action === 'add') {
        mergedSubActivities = dataAktivitas.value.flatMap((item) =>
            item.subActivities.map((el) => ({
                aktivitasId: el.id,
                processTimeDefault: el.processTimeDefault,
                processTimeUser: el.processTimeUser,
                frekuensi: el.frekuensi,
                jamKerjaPerTahun: el.jamKerjaPerTahun,
                kuantitas: el.kuantitas,
                kuantitasUser: el.kuantitasUser,
                jmlHariPeriode: el.periodeValue,
                volume: el.volume
            }))
        );
    } else {
        mergedSubActivities = dataAktivitas.value.flatMap((item) =>
            item.subActivity.map((el) => ({
                id: el.id,
                aktivitasId: el.aktivitasId,
                processTimeDefault: el.processTimeDefault,
                processTimeUser: el.processTimeUser,
                frekuensi: el.frekuensi,
                jamKerjaPerTahun: el.jamKerjaPerTahun,
                kuantitas: el.kuantitas,
                kuantitasUser: el.kuantitasUser,
                jmlHariPeriode: el.jmlHariPeriode,
                volume: el.volume
            }))
        );
    }

    isNotValid.value = mergedSubActivities.some(
        (item) =>
            item.kuantitasUser == null ||
            item.processTimeUser == null ||
            item.frekuensi == null ||
            item.volume == null
    );

    if (!isNotValid.value) {
        dialogKonfirmasi.params = mergedSubActivities;
        if (status == 'DRAFT') {
            dialogKonfirmasi.title = 'Simpan Draft';
            dialogKonfirmasi.message =
                'Apakah Anda yakin ingin simpan draft data ABK ini?';
        } else if (status == 'REJ-UI') {
            dialogKonfirmasi.title = 'Reject data ABK - Unit Induk';
            dialogKonfirmasi.message =
                'Apakah Anda yakin ingin Reject data ABK ini?';
        } else if (status == 'APRV-UI') {
            dialogKonfirmasi.title = 'Approve data ABK - Unit Induk';
            dialogKonfirmasi.message =
                'Apakah Anda yakin ingin Approve data ABK ini?';
        } else {
            dialogKonfirmasi.title = 'Simpan dan Submit';
            dialogKonfirmasi.message =
                'Apakah Anda yakin ingin mengirimkan data ABK ini?';
        }
        dialogKonfirmasi.show = true;
        dialogKonfirmasi.status = status;
    }
}

function onKonfirmasi() {
    let status = dialogKonfirmasi.status;
    dialogKonfirmasi.load = true;
    let params = {};
    if (props.action === 'add') {
        params = {
            kontrakId: dataByKontrak.value.id,
            jenisPekerjaanAbkId: selectedJenisPekerjaan.value.id,
            periode: selectedTahun.value.code,
            lokasiKerja: lokasiPekerjaan.value,
            status: status,
            activities: dialogKonfirmasi.params
        };
    } else {
        params = {
            id: props.id,
            kontrakId: dataByKontrak.value.id,
            jenisPekerjaanAbkId: selectedJenisPekerjaan.value.id,
            lokasiKerja: lokasiPekerjaan.value,
            message: message.value,
            newStatus: status,
            activities: dialogKonfirmasi.params
        };
    }

    let methodApi = 'post';
    if (props.action !== 'add') {
        methodApi = 'put';
    }
    AnalisaBebanKerjaService[methodApi](params)
        .then((response) => {
            console.log('response = ', response);
            if (response.data.code == 200) {
                dialogKonfirmasi.load = false;
                dialogKonfirmasi.show = false;
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                router.push({ path: '/analisis-beban-kerja' });
            } else {
                dialogKonfirmasi.load = false;
                dialogKonfirmasi.show = false;
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            console.log('error = ', e);
            dialogKonfirmasi.load = false;
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        });
}

const onChangeFungsi = (events) => {
    isNotValid.value = false;
    selectedFungsi.value = events.value;
    selectedJenisPekerjaan.value = null;
    dataAktivitas.value = [];
    getJenisPekerjaan();
};
const onChangeJenisPekerjaan = (events) => {
    isNotValid.value = false;
    selectedJenisPekerjaan.value = events.value;
    getAktivitas();
};
const onFilterFungsi = (event) => {
    dataFungsi.value = [];
};

const onAddSub = (params, aktivitas, label) => {
    labelHeader.value = label;
    dialogAddSub.show = true;
    dialogAddSub.data = {
        kontrakId: dataByKontrak.value.id,
        jenisPekerjaanId: selectedJenisPekerjaan.value.id,
        namaAktivitas: aktivitas.nama,
        edit: label,
        ...params
    };
};

const onRefreshValue = (sub, status) => {
    if (status === 'waktu') sub.processTimeUser = sub.processTimeDefault;
    if (status === 'kuantitas') sub.kuantitasUser = sub.kuantitas;
};

function hitung(sub) {
    if (
        [
            sub.periodeValue,
            sub.frekuensi,
            sub.processTimeUser,
            sub.volume,
            sub.kuantitasUser
        ].some((val) => val == null)
    ) {
        sub.jamKerjaPerTahun = 0;
    } else {
        let hasil =
            (sub.periodeValue *
                sub.frekuensi *
                sub.processTimeUser *
                sub.volume *
                sub.kuantitasUser) /
            60;
        sub.jamKerjaPerTahun = hasil.toFixed(2);
    }
}
function onClickDelete(data) {
    activityData.value = data;
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
    isLoadingDelete.value = true;
    AktivitasService.delete(activityData.value.id)
        .then((response) => {
            isLoadingDelete.value = false;
            accept();
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                getAktivitas();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.code + ' - ' + response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            isLoadingDelete.value = false;
            accept();
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
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
    <Fluid>
        <div class="grid grid-cols-2">
            <div class="col-1">
                <Form
                    v-slot="$form"
                    :resolver="resolver"
                    :initial-values="dataDetail"
                    @submit="onClickNext"
                    class="flex flex-col gap-4 w-full"
                >
                    <div class="grid grid-cols-12 gap-2">
                        <label
                            class="block font-bold mb-3 col-span-3 align-middle self-center"
                        >
                            Nomor Perjanjian
                        </label>
                        <div class="col-span-9">
                            <InputText autocomplete="off" 
                                v-model="dataDetail.nomorKontrak"
                                name="nomorKontrak"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                                type="text"
                                placeholder="Masukan Nomor Perjanjian"
                                @update:model-value="changeKontrak"
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-12 gap-2">
                        <label
                            class="block font-bold mb-3 col-span-3 align-middle self-center"
                        >
                            Periode ABK
                        </label>
                        <div class="col-span-9">
                            <Select
                                v-model="selectedTahun"
                                name="periode"
                                filter
                                optionLabel="name"
                                placeholder="Pilih Periode ABK"
                                :options="dataTahun"
                                class="w-full"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                            />
                        </div>
                    </div>
                    <div class="grid grid-cols-12 gap-2">
                        <label
                            for="companyCode"
                            class="block font-bold mb-3 col-span-3 align-middle self-center"
                        >
                            Fungsi
                        </label>
                        <div
                            class="col-span-9"
                            v-if="props.action === 'add'"
                        >
                            <Select
                                :virtual-scroller-options="{
                                    autoSize: true,
                                    lazy: true,
                                    onLazyLoad: isLoadingDataFungsi,
                                    showLoader: isLoadingDataFungsi,
                                    loading: isLoadingDataFungsi,
                                    itemSize: 38,
                                    delay: 0,
                                    onscroll: (event) => {
                                        onScrollEvent(event);
                                    }
                                }"
                                :loading="isLoadingDataFungsi"
                                :filter="true"
                                name="fungsi"
                                :options="dataFungsi"
                                :filterFields="['description']"
                                placeholder="Pilih Fungsi"
                                v-show="!isLoadingDataPekerjaan"
                                @filter="onFilterFungsi"
                                @change="onChangeFungsi"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                                v-model="selectedFungsi"
                            >
                                <template #emptyfilter>
                                    {{ '' }}
                                </template>
                                <template #empty>
                                    {{ '' }}
                                </template>
                                <template #value="slotProps">
                                    <div
                                        v-if="slotProps.value"
                                        class="flex items-center"
                                    >
                                        <div>
                                            {{
                                                `${slotProps.value.id} - ${slotProps.value.description}`
                                            }}
                                        </div>
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                                <template #option="slotProps">
                                    <div class="flex items-center">
                                        <div>
                                            {{
                                                `${slotProps.option.id} - ${slotProps.option.description}`
                                            }}
                                        </div>
                                    </div>
                                </template>
                            </Select>
                        </div>
                        <div
                            class="col-span-9"
                            v-else
                        >
                            <Select
                                :loading="isLoadingDataFungsi"
                                :filter="true"
                                name="fungsi"
                                :options="dataFungsi"
                                optionLabel="description"
                                optionValue="id"
                                placeholder="Pilih Fungsi"
                                v-model="selectedFungsi"
                                @change="onChangeFungsi"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                            >
                                <template #option="slotProps">
                                    <div class="flex items-center">
                                        <div>
                                            {{
                                                `${slotProps.option.id} - ${slotProps.option.description}`
                                            }}
                                        </div>
                                    </div>
                                </template>
                            </Select>
                        </div>
                    </div>
                    <div class="grid grid-cols-12 gap-2">
                        <label
                            for="companyCode"
                            class="block font-bold mb-3 col-span-3 align-middle self-center"
                        >
                            Jenis Pekerjaan
                        </label>
                        <div
                            class="col-span-9"
                            v-if="props.action === 'add'"
                        >
                            <Select
                                :virtual-scroller-options="{
                                    autoSize: true,
                                    lazy: true,
                                    onLazyLoad: isLoadingDataPekerjaan,
                                    showLoader: isLoadingDataPekerjaan,
                                    loading: isLoadingDataPekerjaan,
                                    itemSize: 38,
                                    delay: 0,
                                    onscroll: (event) => {
                                        onScrollEvent(event);
                                    }
                                }"
                                :loading="isLoadingDataPekerjaan"
                                :filter="true"
                                name="dataPekerjaan"
                                :options="dataJenisPekerjaan"
                                :filterFields="['description']"
                                placeholder="Pilih Jenis Pekerjaan"
                                @change="onChangeJenisPekerjaan"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                                v-model="selectedJenisPekerjaan"
                            >
                                <template #value="slotProps">
                                    <div
                                        v-if="slotProps.value"
                                        class="flex items-center"
                                    >
                                        <div>
                                            {{
                                                `${slotProps.value.id} - ${slotProps.value.nama}`
                                            }}
                                        </div>
                                    </div>
                                    <span v-else>
                                        {{ slotProps.placeholder }}
                                    </span>
                                </template>
                                <template #option="slotProps">
                                    <div class="flex items-center">
                                        <div>
                                            {{
                                                `${slotProps.option.id} - ${slotProps.option.nama}`
                                            }}
                                        </div>
                                    </div>
                                </template>
                            </Select>
                        </div>
                        <div
                            class="col-span-9"
                            v-else
                        >
                            <Select
                                :loading="isLoadingDataPekerjaan"
                                name="dataPekerjaan"
                                :options="dataJenisPekerjaan"
                                optionLabel="nama"
                                optionValue="id"
                                :filterFields="['description']"
                                placeholder="Pilih Jenis Pekerjaan"
                                @change="onChangeJenisPekerjaan"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                                v-model="selectedJenisPekerjaan"
                            >
                                <template #option="slotProps">
                                    <div class="flex items-center">
                                        <div>
                                            {{
                                                `${slotProps.option.id} - ${slotProps.option.nama}`
                                            }}
                                        </div>
                                    </div>
                                </template>
                            </Select>
                        </div>
                    </div>
                    <div class="grid grid-cols-12 gap-2">
                        <label
                            class="block font-bold mb-3 col-span-3 align-middle self-center"
                        >
                            Lokasi Pekerjaan
                        </label>
                        <div class="col-span-9">
                            <InputText autocomplete="off" 
                                v-model="lokasiPekerjaan"
                                name="direksiPekerjaan"
                                type="text"
                                placeholder="Lokasi Pekerjaan"
                                :disabled="
                                    props.action !== 'add' ? true : false
                                "
                            />
                        </div>
                    </div>
                </Form>
            </div>
            <div
                class="col-2 ml-8"
                v-if="dataByKontrak !== null"
            >
                {{ dataByKontrak !== null ? dataByKontrak?.namaPekerjaan : '' }}
                <div class="text-gray-400">
                    {{
                        dataByKontrak !== null
                            ? 'Nomor Perjanjian : ' +
                              dataByKontrak?.nomorKontrak
                            : ''
                    }}
                </div>
                <div class="grid grid-cols-2 mt-2">
                    <div class="col-1">
                        <div>{{ dataByKontrak !== null ? 'Unit' : '' }}</div>
                        <div class="text-gray-400">
                            {{
                                dataByKontrak !== null &&
                                dataByKontrak?.wilayahKerjas.length > 0
                                    ? dataByKontrak?.wilayahKerjas[0]
                                          .businessArea.description
                                    : ''
                            }}
                        </div>
                    </div>
                    <div class="col-2">
                        <div>{{ dataByKontrak !== null ? 'Vendor' : '' }}</div>
                        <div class="text-gray-400">
                            {{
                                dataByKontrak !== null
                                    ? dataByKontrak?.vendor?.namaPerusahaan
                                    : ''
                            }}
                        </div>
                        <div class="mt-6">
                            <button
                                class="px-4 py-1 border-2 border-[#5CA5B6] text-[#26717B] bg-[#E6F4F6] rounded-full text-xs font-semibold"
                            >
                                {{ statusDetail }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="overflow-x-scroll mt-5">
            <table
                class="w-full border-collapse border border-gray-300 mt-4 table-none"
                style="overflow-x: auto"
            >
                <thead>
                    <tr class="bg-gray-200">
                        <th
                            class="p-2 border align-top"
                            style="min-width: 70px"
                        >
                            No
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 300px"
                        >
                            <div class="text-left">
                                <strong>Aktifitas kerja</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Berisi daftar aktifitas kerja dan sub
                                    aktifitas kerja untuk masing-masing
                                    pekerjaan dan dapat disesuaikan berdasarkan
                                    yang dilakukan oleh masing-masing Unit
                                </div>
                            </div>
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 300px"
                        >
                            <div class="text-left">
                                <strong>Periode</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Parameter periode berdasarkan satuan
                                    frekuensi yang dipilih : 1 Tahunan (1 hari);
                                    2 Bulanan (12 hari); 3 Mingguan (52 hari); 4
                                    Harian (238 hari).
                                </div>
                            </div>
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 150px"
                        >
                            <div class="text-left">
                                <strong>Frekuensi</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Berapa kali aktifitas kerja dilakukan dalam
                                    satu periode
                                </div>
                            </div>
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 150px"
                        >
                            <div class="text-left">
                                <strong>Waktu Proses (Menit)</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Waktu yang diperlukan untuk menyelesaikan
                                    aktivitas tiap proses kerja di jabatan
                                    tersebut
                                </div>
                            </div>
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 150px"
                        >
                            <div class="text-left">
                                <strong>Volume</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Jumlah kejadian / hasil kerja yang harus
                                    ditangani.
                                </div>
                            </div>
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 150px"
                        >
                            <div class="text-left">
                                <strong>Kuantitas (Orang)</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Jam kerja untuk masing-masing sub aktivitas
                                    kerja (Waktu Proses * Frekuensi * Kuantitas
                                    * Periode / 60 )
                                </div>
                            </div>
                        </th>
                        <th
                            class="p-2 border align-top"
                            style="min-width: 150px"
                        >
                            <div class="text-left">
                                <strong>Jam kerja Pertahun</strong>
                                <div style="font-size: 0.8rem; color: gray">
                                    Jam kerja untuk masing-masing sub aktivitas
                                    kerja(Waktu proses * Frekuensi * Kuantitas *
                                    Periode / 60)
                                </div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <template
                        v-for="(activity, index) in dataAktivitas"
                        :key="activity.id"
                    >
                        <tr class="bg-gray-100">
                            <td
                                class="p-2 border"
                                style="width: max-content"
                            >
                                {{ index + 1 }}
                            </td>
                            <td
                                class="p-2 border font-bold"
                                colspan="7"
                            >
                                {{ activity.nama }}
                                <Button
                                    icon="pi pi-plus"
                                    severity="primary"
                                    variant="outlined"
                                    class="ms-5"
                                    @click.stop="
                                        onAddSub(
                                            activity,
                                            activity,
                                            'Tambah Sub Aktivitas'
                                        )
                                    "
                                />
                                <Button
                                    v-if="activity.canEdit"
                                    icon="pi pi-pencil"
                                    severity="warn"
                                    variant="outlined"
                                    class="ms-3"
                                    @click="onClick(activity)"
                                />
                                <Button
                                    v-if="activity.canEdit"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    variant="outlined"
                                    class="ms-3"
                                    @click="onClickDelete(activity)"
                                />
                            </td>
                        </tr>
                        <tr
                            v-for="(sub, sindex) in props.action !== 'add'
                                ? activity.subActivity
                                : activity.subActivities"
                            :key="sub.id"
                            class="bg-gray-50"
                        >
                            <td class="p-2 border align-top">
                                {{ index + 1 + '.' + (sindex + 1) }}
                            </td>
                            <td class="p-2 border pl-6 align-top">
                                {{ sub.nama }}
                                <Button
                                    v-if="sub.canEdit"
                                    icon="pi pi-pencil"
                                    severity="warn"
                                    variant="outlined"
                                    class="small-btn ms-2"
                                    @click.stop="
                                        onAddSub(
                                            sub,
                                            activity,
                                            'Edit Sub Aktivitas'
                                        )
                                    "
                                />
                                <Button
                                    v-if="sub.canEdit"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    variant="outlined"
                                    class="small-btn ms-2"
                                    @click="onClickDelete(sub)"
                                />
                            </td>
                            <td class="p-2 border text-center align-top">
                                <div>
                                    {{
                                        props.action !== 'add'
                                            ? sub.periode.name
                                            : sub.periodeName
                                    }}
                                </div>
                                ({{
                                    props.action !== 'add'
                                        ? sub.periode.jumlahHari
                                        : sub.periodeValue
                                }}
                                hari)
                            </td>
                            <td class="p-2 border align-top">
                                <div class="flex items-center">
                                    <InputNumber autocomplete="off" 
                                        v-model="sub.frekuensi"
                                        name="frekuensi"
                                        :useGrouping="false"
                                        placeholder="Frekuensi"
                                        :disabled="
                                            props.action !== 'detail'
                                                ? false
                                                : true
                                        "
                                        class="w-full mt-1"
                                        @update:model-value="hitung(sub)"
                                    />
                                </div>
                                <span
                                    v-if="isNotValid && !sub.frekuensi"
                                    class="text-sm text-red-500"
                                    >Frekuensi Wajib Diisi</span
                                >
                            </td>
                            <td class="p-2 border align-top">
                                <div class="flex items-center">
                                    <InputNumber autocomplete="off" 
                                        v-model="sub.processTimeUser"
                                        name="waktuProses"
                                        :useGrouping="false"
                                        :disabled="
                                            props.action !== 'detail'
                                                ? false
                                                : true
                                        "
                                        placeholder="Waktu proses"
                                        class="w-full mt-1"
                                        @update:model-value="hitung(sub)"
                                    />
                                    <Button
                                        icon="pi pi-refresh"
                                        severity="contrast"
                                        variant="text"
                                        rounded
                                        aria-label="refresh"
                                        @click="onRefreshValue(sub, 'waktu')"
                                    />
                                </div>
                                <span
                                    v-if="isNotValid && !sub.processTimeUser"
                                    class="text-sm text-red-500"
                                    >Waktu Proses Wajib Diisi</span
                                >
                            </td>
                            <td class="p-2 border align-top">
                                <div class="flex items-center">
                                    <InputNumber autocomplete="off" 
                                        v-model="sub.volume"
                                        name="volume"
                                        :useGrouping="false"
                                        :disabled="
                                            props.action !== 'detail'
                                                ? false
                                                : true
                                        "
                                        placeholder="Volume"
                                        class="w-full mt-1"
                                        @update:model-value="hitung(sub)"
                                    />
                                </div>
                                <span
                                    v-if="isNotValid && !sub.volume"
                                    class="text-sm text-red-500"
                                    >Volume Wajib Diisi</span
                                >
                            </td>
                            <td class="p-2 border align-top">
                                <div class="flex items-center">
                                    <InputNumber autocomplete="off" 
                                        v-model="sub.kuantitasUser"
                                        name="kuantitas"
                                        :useGrouping="false"
                                        :disabled="
                                            props.action !== 'detail'
                                                ? false
                                                : true
                                        "
                                        placeholder="kuantitas"
                                        class="w-full mt-1"
                                        @update:model-value="hitung(sub)"
                                    />
                                    <Button
                                        icon="pi pi-refresh"
                                        severity="contrast"
                                        variant="text"
                                        rounded
                                        aria-label="refresh"
                                        @click="
                                            onRefreshValue(sub, 'kuantitas')
                                        "
                                    />
                                </div>
                                <span
                                    v-if="isNotValid && !sub.kuantitasUser"
                                    class="text-sm text-red-500"
                                    >Kuantitas Wajib Diisi</span
                                >
                            </td>
                            <td class="p-2 border text-center align-top">
                                <div class="mt-3">
                                    {{ sub.jamKerjaPerTahun }}
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
        <div
            class="flex flex-col md:flex-row gap-4 justify-center md:justify-end items-end md:items-center mt-4 w-full"
        >
            <div class="flex flex-row gap-4 justify-end items-center w-fit">
                <Button
                    icon="pi pi-plus"
                    severity="primary"
                    variant="outlined"
                    label="Tambah Aktivitas"
                    @click="onClick(null)"
                />
            </div>
        </div>
        <div
            v-if="dataAktivitas.length > 0"
            class="flex flex-col md:flex-row gap-4 justify-center md:justify-end items-end md:items-center mt-10 w-full"
        >
            <div
                v-if="statusDetail == ''"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-plus"
                    severity="primary"
                    label="Save and Draft"
                    @click="aksi('DRAFT')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save and Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-HTD')"
                />
            </div>
            <div
                v-if="statusDetail == 'DRAFT'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-plus"
                    severity="primary"
                    label="Save and Draft"
                    @click="aksi('DRAFT')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save and Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-HTD')"
                />
            </div>
            <div
                v-if="
                    statusDetail == 'APRV-HTD' &&
                    authStore.role.includes('pusat')
                "
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="danger"
                    label="Reject Pusat"
                    @click="aksi('REJ-PST')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Approved Pusat"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('APRV-PST')"
                />
            </div>
            <div
                v-if="statusDetail == 'APRV-PST'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-send"
                    severity="primary"
                    label="Unrealese"
                    class="whitespace-nowrap"
                    @click="aksi('UNREL-PST')"
                />
            </div>
            <div
                v-if="statusDetail == 'UNREL-PST'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="primary"
                    label="Save"
                    @click="aksi('REV-PST')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save and Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-PST')"
                />
            </div>
            <div
                v-if="statusDetail == 'SUBMIT-PST'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="danger"
                    label="Reject Pusat"
                    @click="aksi('REJ-PST')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Approved Pusat"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('APRV-PST')"
                />
            </div>
            <div
                v-if="statusDetail == 'REJ-PST'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="primary"
                    label="Save"
                    @click="aksi('REV-PST')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save And Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-PST')"
                />
            </div>
            <div
                v-if="statusDetail == 'REV-PST'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="primary"
                    label="Save"
                    @click="aksi('REV-PST')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save And Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-PST')"
                />
            </div>
            <div
                v-if="statusDetail == 'REJ-HTD'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="primary"
                    label="Save"
                    @click="aksi('REV-HTD')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save And Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-HTD')"
                />
            </div>
            <div
                v-if="statusDetail == 'REV-HTD'"
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="primary"
                    label="Save"
                    @click="aksi('REV-HTD')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Save And Submit"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('SUBMIT-HTD')"
                />
            </div>
            <div
                v-if="
                    statusDetail == 'SUBMIT-HTD' &&
                    authStore.role.includes('htd')
                "
                class="flex flex-row gap-3 justify-end items-center w-auto"
            >
                <Button
                    icon="pi pi-times"
                    severity="danger"
                    label="Reject HTD"
                    @click="aksi('REJ-HTD')"
                />
                <Button
                    icon="pi pi-send"
                    severity="success"
                    label="Approved HTD"
                    class="whitespace-nowrap min-w-max"
                    @click="aksi('APRV-HTD')"
                />
            </div>
        </div>
    </Fluid>
    <Dialog
        v-model:visible="visible"
        modal
        :header="labelHeader"
        :style="{ width: '40rem' }"
    >
        <AktivitasKerjaAdd
            :dataUpdate="dataSelectedAktivitas"
            :data="selectedJenisPekerjaan"
            :dataKontrak="dataByKontrak"
            @close="() => (visible = false)"
            @simpan="() => getAktivitas()"
        />
    </Dialog>

    <Dialog
        v-model:visible="dialogAddSub.show"
        :style="{ width: '40rem' }"
        :closable="false"
        :draggable="false"
    >
        <template #header>
            <div
                class="flex justify-between items-center w-full border-b-2 pb-2"
            >
                <div class="font-bold text-2xl">{{ labelHeader }}</div>
                <div>
                    <Button
                        icon="pi pi-times"
                        class="p-button-text"
                        @click="dialogAddSub.show = false"
                    />
                </div>
            </div>
        </template>
        <AddSubAktifitas
            :datas="dialogAddSub.data"
            @close="() => (dialogAddSub.show = false)"
            @simpan="() => getAktivitas()"
        />
    </Dialog>

    <Dialog
        v-model:visible="dialogKonfirmasi.show"
        :style="{ width: '40rem' }"
        :closable="false"
        :draggable="false"
    >
        <template #header>
            <div
                class="flex justify-between items-center w-full border-b-2 pb-2"
            >
                <div class="font-bold text-2xl">
                    {{ dialogKonfirmasi.title }}
                </div>
                <div>
                    <Button
                        icon="pi pi-times"
                        class="p-button-text"
                        @click="dialogKonfirmasi.show = false"
                    />
                </div>
            </div>
        </template>
        <InputText autocomplete="off" 
            v-if="
                dialogKonfirmasi.status == 'REJ-UI' ||
                dialogKonfirmasi.status == 'REJ-HTD' ||
                dialogKonfirmasi.status == 'REJ-PST'
            "
            v-model="message"
            name="message"
            type="text"
            placeholder="Alasan Penolakan"
        />
        <div
            class="mb-8"
            style="font-size: 16px"
        >
            {{
                dialogKonfirmasi.status == 'REJ-UI' ||
                dialogKonfirmasi.status == 'REJ-HTD' ||
                dialogKonfirmasi.status == 'REJ-PST'
                    ? ''
                    : dialogKonfirmasi.message
            }}
        </div>

        <div class="flex justify-end">
            <Button
                label="Cancel"
                class="w-auto mr-2"
                size="large"
                variant="text"
                severity="danger"
                @click="dialogKonfirmasi.show = false"
            />
            <Button
                label="Confirm"
                type="submit"
                class="w-auto"
                size="large"
                :loading="dialogKonfirmasi.load"
                @click="onKonfirmasi"
            />
        </div>
    </Dialog>

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
                        <strong class="ml-1">:</strong>
                        <strong class="ml-1">
                            {{ activityData.nama }}
                        </strong>
                    </span>
                </div>
                <div class="p-dialog-footer">
                    <Button
                        :loading="isLoadingDelete"
                        :label="isLoadingDelete ? 'Menghapus Data' : 'Ya'"
                        class="p-confirmdialog-accept-button order-1"
                        type="button"
                        severity="success"
                        @click="handleAccept(acceptCallback)"
                    />
                    <Button
                        :disabled="isLoadingDelete"
                        label="Tidak"
                        class="p-confirmdialog-reject-button order-2"
                        type="button"
                        severity="danger"
                        @click="handleReject(rejectCallback)"
                    />
                </div>
            </div>
        </template>
    </ConfirmDialog>
</template>
<style>
.small-btn {
    font-size: 9px; /* Kecilkan font */
    padding: 4px 8px;
    width: 80px;
}
</style>
