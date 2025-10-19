<script setup>
import KanalKomunikasiService from '@/service/KanalKomunikasiService';
import { useAuth } from '@/stores';
import { listOptStatusKnlKom } from '@/utils/constantVariable';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import Skeleton from 'primevue/skeleton';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { object, string } from 'yup';
import IKanalKomunikasiData from './IKanalKomunikasiData';

const props = defineProps({
    data: {
        type: Object,
        default: null
    },
    onClose: {
        type: Function,
        default: () => ({})
    },
    disabled: {
        type: Boolean,
        default: false
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    refetchData: Function,
    action: String
});

const dataInput = ref(IKanalKomunikasiData);
const isLoadingDetail = ref(false);
const isLoadingSave = ref(false);
const dataTenagaKerja = ref({
    username: null,
    name: null,
    vendor: null,
    unitKerja: null
});
const detailKanalKomunikasi = ref();
const authStore = useAuth();

const confirmSave = useConfirm();
const toast = useToast();

const baseSchema = {
    judul: string().required('judul tidak boleh kosong'),
    deskripsi: string().required('deskripsi tidak boleh kosong')
};

const schema = computed(() => {
    if (props.action === 'edit') {
        return object().shape({
            tindakLanjut: string().required('tindak lanjut tidak boleh kosong')
        });
    }
    return object().shape(baseSchema);
});

const resolver = computed(() => yupResolver(schema.value));

const getDataTenagaKerja = async () => {
    dataTenagaKerja.value = {
        username: authStore.username,
        name: authStore.name,
        vendor: authStore.vendor,
        unitKerja: authStore.unitKerja
    };
};

const onClickCancel = () => {
    props.onClose();
};

const onClickSave = (data) => {
    if (data.valid) {
        openDialogSave(data);
    }
};

const saveToServiceAddKanalKomunikasi = (data) => {
    let payload = {
        username: authStore.username,
        name: dataTenagaKerja.value.name,
        vendor: {
            id: dataTenagaKerja.value.vendor?.id,
            namaPerusahaan: dataTenagaKerja.value.vendor?.namaPerusahaan
        },
        judul: data.judul,
        deskripsi: data.deskripsi
    };

    isLoadingSave.value = true;

    KanalKomunikasiService.post(payload)
        .then((response) => {
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                props.refetchData();
                props.onClose();
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
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
};

const saveToServiceTindakLanjut = (data) => {
    let payload = {
        id: props.data.id,
        tindakLanjut: data.tindakLanjut
    };

    isLoadingSave.value = true;
    KanalKomunikasiService.saveTindakLanjut(payload)
        .then((response) => {
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                props.refetchData();
                props.onClose();
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
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
};

const getDetailTindakLanjut = () => {
    isLoadingDetail.value = true;
    KanalKomunikasiService.getById(props.data.id)
        .then((response) => {
            if (response.data.code == 200) {
                detailKanalKomunikasi.value = response.data.data;
                dataInput.value = {
                    ...response.data.data,
                    status: getNamaStatus(response.data.data.status)
                };
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
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingDetail.value = false;
        });
};

const openDialogSave = (data) => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menyimpan data?',
        closeable: false,
        header: 'Konfirmasi',
        acceptLabel: 'Ya',
        rejectLabel: 'Tidak',
        acceptClass: 'order-2',
        rejectClass: 'order-1',
        rejectProps: {
            severity: 'danger'
        },
        acceptProps: {
            severity: 'success'
        },
        accept: () => {
            if (props.action === 'add') {
                saveToServiceAddKanalKomunikasi(data.values);
            } else {
                saveToServiceTindakLanjut(data.values);
            }
        }
    });
};

const getNamaStatus = (status) => {
    const findObj = status
        ? listOptStatusKnlKom.find(
              (item) => item.code === status.replace(' ', '_').toUpperCase()
          )
        : '-';

    return findObj.name;
};

onBeforeMount(() => {
    if (props.action === 'add') {
        getDataTenagaKerja();
    }

    if (props.action === 'edit' || props.action === 'detail') {
        getDetailTindakLanjut();
    }
});

onMounted(() => {});
</script>
<template>
    <Fluid>
        <div v-if="isLoadingDetail">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2 w-1/2"></Skeleton>
            <Skeleton class="mb-2 w-1/3"></Skeleton>
        </div>
        <Form
            v-else
            v-slot="$form"
            :resolver="resolver"
            :initial-values="dataInput"
            @submit="onClickSave"
            class="flex flex-col gap-4 w-full"
        >
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="username"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Username
                </label>
                <div class="col-span-10">
                    <InputText autocomplete="off" 
                        name="username"
                        :defaultValue="
                            props.action === 'add'
                                ? dataTenagaKerja.username
                                : detailKanalKomunikasi.username
                        "
                        type="text"
                        placeholder="Username"
                        v-show="!isLoadingDetail"
                        disabled
                    />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="nama"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Nama
                </label>
                <div class="col-span-10">
                    <InputText autocomplete="off" 
                        name="nama"
                        :defaultValue="
                            props.action === 'add'
                                ? dataTenagaKerja.name
                                : detailKanalKomunikasi.name
                        "
                        type="text"
                        placeholder="Nama"
                        v-show="!isLoadingDetail"
                        disabled
                    />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="nik"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Vendor
                </label>
                <div class="col-span-10">
                    <InputText autocomplete="off" 
                        name="vendor"
                        :defaultValue="
                            props.action === 'add'
                                ? dataTenagaKerja.vendor?.namaPerusahaan
                                : detailKanalKomunikasi.vendor?.namaPerusahaan
                        "
                        type="text"
                        placeholder="Vendor"
                        v-show="!isLoadingDetail"
                        disabled
                    />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="alamat"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Unit Kerja
                </label>
                <div class="col-span-10">
                    <InputText autocomplete="off" 
                        name="unit"
                        :defaultValue="
                            props.action === 'add'
                                ? dataTenagaKerja.unitKerja?.description
                                : detailKanalKomunikasi.businessArea
                                      ?.description
                        "
                        type="text"
                        placeholder="Unit Kerja"
                        v-show="!isLoadingDetail"
                        disabled
                    />
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="judul"
                    class="block font-bold mb-3 col-span-2"
                >
                    Judul
                </label>
                <div class="col-span-10">
                    <InputText autocomplete="off" 
                        placeholder="Judul"
                        class="w-full"
                        name="judul"
                        :disabled="
                            props.action === 'detail' || props.action === 'edit'
                        "
                    />
                    <Message
                        v-if="$form.judul?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.judul.error?.message }}
                    </Message>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="deskripsi"
                    class="block font-bold mb-3 col-span-2"
                >
                    Deskripsi
                </label>
                <div class="col-span-10">
                    <Textarea
                        placeholder="Deskripsi"
                        class="w-full"
                        name="deskripsi"
                        rows="5"
                        cols="30"
                        :disabled="
                            props.action === 'detail' || props.action === 'edit'
                        "
                    />
                    <Message
                        v-if="$form.deskripsi?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.deskripsi.error?.message }}
                    </Message>
                </div>
            </div>
            <div
                v-if="props.action === 'edit' || props.action === 'detail'"
                class="grid grid-cols-12 gap-2"
            >
                <label
                    for="tindakLanjut"
                    class="block font-bold mb-3 col-span-2"
                >
                    Status
                </label>
                <div class="col-span-10">
                    <InputText autocomplete="off" 
                        placeholder="Status"
                        class="w-full"
                        name="status"
                        :disabled="true"
                    />
                </div>
            </div>
            <div
                v-if="props.action === 'edit' || props.action === 'detail'"
                class="grid grid-cols-12 gap-2"
            >
                <label
                    for="tindakLanjut"
                    class="block font-bold mb-3 col-span-2"
                >
                    Tindak lanjut
                </label>
                <div class="col-span-10">
                    <Textarea
                        placeholder="Tindak Lanjut"
                        class="w-full"
                        name="tindakLanjut"
                        rows="5"
                        cols="30"
                        :disabled="props.action === 'detail'"
                    />
                    <Message
                        v-if="$form.tindakLanjut?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.tindakLanjut.error?.message }}
                    </Message>
                </div>
            </div>
            <div
                v-if="props.action !== 'detail'"
                class="flex gap-4 justify-end items-center mt-4"
            >
                <Button
                    :disabled="isLoadingSave"
                    class="w-24"
                    severity="danger"
                    label="Batal"
                    @click="onClickCancel"
                />
                <Button
                    :loading="isLoadingSave"
                    class="w-max"
                    severity="success"
                    :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                    type="submit"
                    v-show="!isLoadingDetail"
                />
            </div>
        </Form>
    </Fluid>
</template>
