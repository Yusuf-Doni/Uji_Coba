<script setup>
import IParams from '@/interface/IParams';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string } from 'yup';
import JabatanService from '../service/jabatan.js';
import DivisiService from '../../divisi/service/divisi.js';

const detailJabatan = ref({
    id: '',
    namaJabatan: '',
    singkatan: '',
    deskripsi: '',
    divisiId: '',
    atasanId: ''
});

const divisiList = ref([]);
const atasanList = ref([]);
const isLoadingDivisi = ref(false);
const isLoadingAtasan = ref(false);

const isLoadingSave = ref(false);
const isLoadingDetail = ref(false);
const route = useRoute();
const confirmSave = useConfirm();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.id));
const toast = useToast();

const resolver = computed(() => {
    let opt = {
        namaJabatan: string().required('Nama Jabatan tidak boleh kosong'),
        singkatan: string().required('Singkatan tidak boleh kosong'),
        deskripsi: string().required('Deskripsi tidak boleh kosong'),
        divisiId: string().required('Divisi tidak boleh kosong'),
        atasanId: string().required('Atasan tidak boleh kosong')
    };
    return yupResolver(object().shape(opt));
});

const getDetailJabatan = async () => {
    if (isEdit.value && route.params.id) {
        isLoadingDetail.value = true;
        
        try {
            const response = await JabatanService.getById(route.params.id);
            const jabatanData = response.data.data;
            
            detailJabatan.value = {
                id: jabatanData.id,
                namaJabatan: jabatanData.namaJabatan,
                singkatan: jabatanData.singkatan,
                deskripsi: jabatanData.deskripsi,
                divisiId: jabatanData.divisiId,
                atasanId: jabatanData.atasanId
            };
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Gagal mengambil data jabatan',
                life: 3000
            });
        } finally {
            isLoadingDetail.value = false;
        }
    }
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

const saveInputToService = async () => {
    isLoadingSave.value = true;
    
    try {
        const payload = {
            namaJabatan: detailJabatan.value.namaJabatan,
            singkatan: detailJabatan.value.singkatan,
            deskripsi: detailJabatan.value.deskripsi,
            divisiId: detailJabatan.value.divisiId,
            atasanId: detailJabatan.value.atasanId
        };

        if (isEdit.value) {
            await JabatanService.put(detailJabatan.value.id, payload);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data jabatan berhasil diperbarui',
                life: 3000
            });
        } else {
            await JabatanService.post(payload);
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Data jabatan berhasil ditambahkan',
                life: 3000
            });
        }
        
        router.push('/jabatan');
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal menyimpan data jabatan',
            life: 3000
        });
    } finally {
        isLoadingSave.value = false;
    }
};

// Fetch divisi list from master divisi
const fetchDivisiList = async () => {
    isLoadingDivisi.value = true;
    try {
        const response = await DivisiService.get({ page: 0, size: 1000 });
        divisiList.value = response.data.data.map(item => ({
            label: item.namaDivisi,
            value: item.id
        }));
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal mengambil data divisi',
            life: 3000
        });
    } finally {
        isLoadingDivisi.value = false;
    }
};

// Fetch atasan list from master jabatan
const fetchAtasanList = async () => {
    isLoadingAtasan.value = true;
    try {
        const response = await JabatanService.get({ page: 0, size: 1000 });
        atasanList.value = response.data.data.map(item => ({
            label: item.namaJabatan,
            value: item.id
        }));
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal mengambil data atasan',
            life: 3000
        });
    } finally {
        isLoadingAtasan.value = false;
    }
};

onBeforeMount(() => {
    fetchDivisiList();
    fetchAtasanList();
    if (isEdit.value) {
        getDetailJabatan();
    }
});

onMounted(() => {});

const onClickKembali = () => {
    router.push('/jabatan');
};
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Jabatan
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
            <div class="flex justify-end">
                <Button
                    class="w-max"
                    severity="warn"
                    type="submit"
                    @click="onClickKembali"
                    :loading="isLoadingSave"
                    :label="isLoadingSave ? 'Menyimpan Data' : 'Kembali'"
                />
            </div>
        
            <Form
                @submit="onClickSubmit"
                :resolver="resolver"
                v-slot="$form"
                :initialValues="detailJabatan"
            >
                <div class="col-span-8">
                    <Fieldset>
                        <Fluid>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="namaJabatan"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Nama Jabatan <span class="text-red-500">(*)</span> 
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="namaJabatan"
                                        type="text"
                                        placeholder="Nama Jabatan"
                                        v-model:model-value="detailJabatan.namaJabatan"
                                    />
                                    <Message
                                        v-if="$form.namaJabatan?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.namaJabatan.error?.message }}
                                    </Message>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Singkatan"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Singkatan <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="singkatan"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Singkatan"
                                        v-model:model-value="detailJabatan.singkatan"
                                    />
                                    <Message
                                        v-if="$form.singkatan?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.singkatan.error?.message }}
                                    </Message>
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Deskripsi"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Deskripsi <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <Textarea
                                        name="deskripsi"
                                        placeholder="Deskripsi Jabatan"
                                        rows="3"
                                        class="w-full"
                                        v-model:model-value="detailJabatan.deskripsi"
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
                                    for="Divisi"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Divisi <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <Dropdown
                                        v-model="detailJabatan.divisiId"
                                        :options="divisiList"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Divisi"
                                        class="w-full"
                                        :loading="isLoadingDivisi || isLoadingDetail"
                                    >
                                        <template #value="slotProps">
                                            <div v-if="slotProps.value">
                                                <span>{{ divisiList.find(d => d.value === slotProps.value)?.label }}</span>
                                            </div>
                                            <span v-else>
                                                {{ slotProps.placeholder }}
                                            </span>
                                        </template>
                                    </Dropdown>
                                    <Message
                                        v-if="$form.divisiId?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.divisiId.error?.message }}
                                    </Message>
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Atasan"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Atasan <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <Dropdown
                                        v-model="detailJabatan.atasanId"
                                        :options="atasanList"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Atasan"
                                        class="w-full"
                                        :loading="isLoadingAtasan || isLoadingDetail"
                                    >
                                        <template #value="slotProps">
                                            <div v-if="slotProps.value">
                                                <span>{{ atasanList.find(a => a.value === slotProps.value)?.label }}</span>
                                            </div>
                                            <span v-else>
                                                {{ slotProps.placeholder }}
                                            </span>
                                        </template>
                                    </Dropdown>
                                    <Message
                                        v-if="$form.atasanId?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.atasanId.error?.message }}
                                    </Message>
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
