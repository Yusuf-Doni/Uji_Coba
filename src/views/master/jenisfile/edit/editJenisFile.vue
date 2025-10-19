<script setup>
import JenisFileService from '../service/jenisFile';
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
    kodeJenisFile: '',
    jenisFile: '',
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
        kodeJenisFile: string().required('Kode Jenis File tidak boleh kosong'),
        jenisFile: string().required('Jenis File tidak boleh kosong')
    };

    return yupResolver(object().shape(opt));
});

const toast = useToast();


const onClickKembali = () => {
    router.push('/jenisFile/file');
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
            kodeJenisFile: detailUser.value.kodeJenisFile,
            jenisFile: detailUser.value.jenisFile,
            deskripsi: detailUser.value.deskripsi || ''
        };

        console.log('payload', payload);
        let response;
        if (isEdit.value) {
            // Update existing jenis file
            payload.id = detailUser.value.id;
            response = await JenisFileService.put(payload.id, payload);
        } else {
            // Create new jenis file
            response = await JenisFileService.post(payload);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: isEdit.value ? 'Data jenis file berhasil diperbarui' : 'Data jenis file berhasil disimpan',
            life: 3000
        });
        
        // Navigate back to jenis file list
        router.push('/jenisFile/file');
        
    } catch (error) {
        console.error('Error saving jenis file:', error);
        
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
        
        // Clear auth credentials before redirecting to prevent router guard conflicts
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isLoadingSave.value = false;
    }
};

const loadJenisFileData = async () => {
    if (isEdit.value && route.params.id) {
        try {
            isLoadingDetail.value = true;
            const response = await JenisFileService.getById(route.params.id);
            
            if (response.data.code === 200) {
                const data = response.data.data;
                detailUser.value = {
                    id: data.id,
                    kodeJenisFile: data.kodeJenisFile || '',
                    jenisFile: data.jenisFile || '',
                    deskripsi: data.deskripsi || ''
                };
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: response.data.message || 'Gagal memuat data jenis file',
                    life: 3000
                });
                router.push('/jenisFile/file');
            }
        } catch (error) {
            console.error('Error loading parameter:', error);
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Terjadi kesalahan saat memuat data jenis file',
                life: 3000
            });
            
            // Clear auth credentials before redirecting to prevent router guard conflicts
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        } finally {
            isLoadingDetail.value = false;
        }
    }
};

onBeforeMount(() => {
    loadJenisFileData();
});

onMounted(() => {});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Jenis File
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
                                    for="Kode Jenis File"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Kode Jenis File <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-2">
                                    <InputText
                                        autocomplete="off"
                                        name="kodeJenisFile"
                                        type="text"
                                        placeholder="Kode Jenis File"
                                        v-model:model-value="
                                            detailUser.kodeJenisFile
                                        "
                                    />
                                    <Message
                                        v-if="$form.kodeJenisFile?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.kodeJenisFile.error?.message
                                        }}</Message
                                    >
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Jenis File"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Jenis File <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="jenisFile"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Jenis File"
                                        v-model:model-value="
                                            detailUser.jenisFile
                                        "
                                    />
                                    <Message
                                        v-if="$form.jenisFile?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.jenisFile.error?.message
                                        }}</Message
                                    >
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Deskripsi Jenis File"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Deskripsi
                                </label>
                                <div class="col-span-5">
                                    <Textarea
                                        rows="4"
                                        autoResize
                                        autocomplete="off"
                                        name="deskripsi"
                                        v-show="!isLoadingDetail"
                                        placeholder="Deskripsi Jenis File"
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
