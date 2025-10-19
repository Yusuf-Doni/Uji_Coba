<script setup>
import AspekService from '../service/aspek';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string, ref as yref } from 'yup';
import { useAuth } from '@/stores';

const detailAspek = ref({
    id: null,
    kodeAspek: '',
    namaAspek: '',
    deskripsi: ''
});
const isLoadingSave = ref(false);
const isLoadingDetail = ref(false);
const route = useRoute();
const confirmSave = useConfirm();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.id));

const resolver = computed(() => {
    let opt = {
        kodeAspek: string().required('Kode Aspek tidak boleh kosong'),
        namaAspek: string().required('Nama Aspek tidak boleh kosong'),
        deskripsi: string().required('Deskripsi tidak boleh kosong')
    };

    return yupResolver(object().shape(opt));
});

const toast = useToast();

const getDetailAspek = () => {
    if (!isEdit.value) return;
    
    isLoadingDetail.value = true;
    AspekService.getById(route.params.id)
        .then((response) => {
            if (response.data.code === 200) {
                detailAspek.value = {
                    id: response.data.data.id,
                    kodeAspek: response.data.data.kodeAspek,
                    namaAspek: response.data.data.namaAspek,
                    deskripsi: response.data.data.deskripsi || ''
                };
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal mengambil data aspek',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching aspek detail:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Terjadi kesalahan saat mengambil data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoadingDetail.value = false;
        });
};

const onClickKembali = () => {
    router.push('/aspek');
};

const onClickSubmit = (data) => {
    if (!data.valid) {
        return;
    }

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
            saveInputToService();
        }
    });
};

const saveInputToService = () => {
    isLoadingSave.value = true;
    const id = detailAspek.value.id;
    const payload = {
        kodeAspek: detailAspek.value.kodeAspek,
        namaAspek: detailAspek.value.namaAspek,
        deskripsi: detailAspek.value.deskripsi || '',
    };
    // console.log('payload =', id);

    const serviceCall = isEdit.value 
        ? AspekService.put(id,payload)
        : AspekService.post(payload);

    serviceCall
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: isEdit.value ? 'Data aspek berhasil diupdate' : 'Data aspek berhasil ditambahkan',
                    life: 3000
                });
                router.push('/aspek');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal menyimpan data aspek',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error saving aspek:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Terjadi kesalahan saat menyimpan data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
};

onBeforeMount(() => {
    getDetailAspek();
});

onMounted(() => {});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Aspek
        </div>
        <div v-if="isLoadingDetail">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2 w-1/2"></Skeleton>
            <Skeleton class="mb-2 w-1/3"></Skeleton>
        </div>
        <div
            class="card"
            v-else
        >
            <div class="flex justify-end mb-4">
                <Button
                    class="w-max"
                    severity="warn"
                    type="button"
                    @click="onClickKembali"
                    :loading="isLoadingSave"
                    :label="isLoadingSave ? 'Menyimpan Data' : 'Kembali'"
                />
            </div>
            <Form
                @submit="onClickSubmit"
                :resolver="resolver"
                v-slot="$form"
                :initialValues="detailAspek"
            >
                <div class="col-span-8">
                    <Fieldset>
                        <Fluid>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="kodeAspek"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Kode Aspek <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-2">
                                    <InputText
                                        autocomplete="off"
                                        name="kodeAspek"
                                        type="text"
                                        placeholder="Kode Aspek"
                                        :disabled="isEdit"
                                        v-model:model-value="detailAspek.kodeAspek"
                                    />
                                    <Message
                                        v-if="$form.kodeAspek?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.kodeAspek.error?.message }}
                                    </Message>
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="namaAspek"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Nama Aspek <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="namaAspek"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Nama Aspek"
                                        v-model:model-value="detailAspek.namaAspek"
                                    />
                                    <Message
                                        v-if="$form.namaAspek?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.namaAspek.error?.message }}
                                    </Message>
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="deskripsi"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Deskripsi <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-5">
                                    <Textarea
                                        rows="4"
                                        autoResize
                                        autocomplete="off"
                                        name="deskripsi"
                                        v-show="!isLoadingDetail"
                                        placeholder="Deskripsi"
                                        v-model:model-value="detailAspek.deskripsi"
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
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="kategori"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Kategori
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="kategori"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Kategori"
                                        v-model:model-value="detailAspek.kategori"
                                    />
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="status"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Status
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="status"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Status"
                                        v-model:model-value="detailAspek.status"
                                    />
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="prioritas"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Prioritas
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="prioritas"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Prioritas"
                                        v-model:model-value="detailAspek.prioritas"
                                    />
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="penanggungJawab"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Penanggung Jawab
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="penanggungJawab"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Penanggung Jawab"
                                        v-model:model-value="detailAspek.penanggungJawab"
                                    />
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="target"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Target
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="target"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Target"
                                        v-model:model-value="detailAspek.target"
                                    />
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="progress"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Progress
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="progress"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Progress"
                                        v-model:model-value="detailAspek.progress"
                                    />
                                </div>
                            </div>
                        </Fluid>
                    </Fieldset>
                </div>

                <Divider />
                <div class="flex justify-end">
                    <Button
                        class="w-max"
                        severity="primary"
                        type="submit"
                        :loading="isLoadingSave"
                        :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                    />
                </div>
            </Form>
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
</template>