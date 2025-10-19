<script setup>
import ParameterService from '../service/parameter';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string, ref as yref } from 'yup';
import { useAuth } from '@/stores';

const detailUser = ref({
    id: null,
    kodeParameter: '',
    namaParameter: '',
    subParameter: '',
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
        kodeParameter: string().required('Kode Parameter tidak boleh kosong'),
        namaParameter: string().required('Nama Parameter tidak boleh kosong'),
        subParameter: string().required('Sub Parameter tidak boleh kosong')
    };

    return yupResolver(object().shape(opt));
});

const toast = useToast();


const onClickKembali = () => {
    router.push('/parameter');
};


const onClickSubmit = (data) => {
    if (!data.valid) {
        // tabValue.value = '0';
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
    try {
        isLoadingSave.value = true;
        
        const payload = {
            kodeParameter: detailUser.value.kodeParameter,
            namaParameter: detailUser.value.namaParameter,
            subParameter: detailUser.value.subParameter,
            deskripsi: detailUser.value.deskripsi || ''
        };


        console.log('payload', payload);
        let response;
        if (isEdit.value) {
            // Update existing parameter
            payload.id = detailUser.value.id;
            response = await ParameterService.put(payload.id,payload);
        } else {
            // Create new parameter
            response = await ParameterService.post(payload);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: isEdit.value ? 'Data parameter berhasil diperbarui' : 'Data parameter berhasil disimpan',
            life: 3000
        });
        
        // Navigate back to parameter list
        router.push('/parameter');
        
    } catch (error) {
        console.error('Error saving parameter:', error);
        
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isLoadingSave.value = false;
    }
};

const loadParameterData = async () => {
    if (isEdit.value && route.params.id) {
        try {
            isLoadingDetail.value = true;
            const response = await ParameterService.getById(route.params.id);
            
            if (response.data.code === 200) {
                const data = response.data.data;
                detailUser.value = {
                    id: data.id,
                    kodeParameter: data.kodeParameter || '',
                    namaParameter: data.namaParameter || '',
                    subParameter: data.subParameter || '',
                    deskripsi: data.deskripsi || ''
                };
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: response.data.message || 'Gagal memuat data parameter',
                    life: 3000
                });
                router.push('/parameter');
            }
        } catch (error) {
            console.error('Error loading parameter:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Terjadi kesalahan saat memuat data parameter',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        } finally {
            isLoadingDetail.value = false;
        }
    }
};

onBeforeMount(() => {
    loadParameterData();
});

onMounted(() => {});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Parameter
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
                :initialValues="detailUser"
            >
                <div class="col-span-8">
                    <Fieldset>
                        <Fluid>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Kode Parameter"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Kode Parameter <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-2">
                                    <InputText
                                        autocomplete="off"
                                        name="kodeParameter"
                                        type="text"
                                        placeholder="Kode Parameter"
                                        v-model:model-value="
                                            detailUser.kodeParameter
                                        "
                                    />
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Nama Parameter"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Nama Parameter <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="namaParameter"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Nama Parameter"
                                        v-model:model-value="
                                            detailUser.namaParameter
                                        "
                                    />
                                    <Message
                                        v-if="$form.namaParameter?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.namaParameter.error?.message
                                        }}</Message
                                    >
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Sub Parameter"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Sub Parameter <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="subParameter"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Sub Parameter"
                                        v-model:model-value="
                                            detailUser.subParameter
                                        "
                                    />
                                    <Message
                                        v-if="$form.subParameter?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.subParameter.error?.message
                                        }}</Message
                                    >
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Deskripsi"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Deskripsi (Optional)
                                </label>
                                <div class="col-span-5">
                                    <Textarea
                                        rows="4"
                                        autoResize
                                        autocomplete="off"
                                        name="deskripsi"
                                        v-show="!isLoadingDetail"
                                        placeholder="Deskripsi"
                                        v-model:model-value="
                                            detailUser.deskripsi
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
