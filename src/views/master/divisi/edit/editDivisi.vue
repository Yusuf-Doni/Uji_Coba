<script setup>
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, onMounted, ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string } from 'yup';
import direktoratService from '../../direktorat/service/direktorat.js';
import { useAuth } from '@/stores';
import DivisiService from '../service/divisi.js';

const isLoadingDetail = ref(false);
const isLoadingSave = ref(false);
const formUmumRef = ref();
const confirmSave = useConfirm();
const route = useRoute();
const toast = useToast();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.id));

// Form data
const dataDivisi = ref({
    id: '',
    divisi: '',
    singkatan: '',
    direktorat: ''
});

// Dropdown options for direktorat
const direktoratOptions = ref([]);
const isLoadingDirektorat = ref(false);

const loadDirektoratOptions = () => {
    isLoadingDirektorat.value = true;
    
    // Prepare API parameters
    const apiParams = {
        page: 0,
        size: 1000 // Get all direktorat options
    };
    
    direktoratService.getdropdown(apiParams)
        .then((response) => {
            if (response.data.code === 200) {
                // Transform data to match expected format for dropdown
                direktoratOptions.value = response.data.data.map(item => ({
                    id: item.id,
                    label: item.nama || item.singkatan,
                    value: item.id
                }));
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message || 'Gagal mengambil data direktorat',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching direktorat data:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.message || 'Terjadi kesalahan saat mengambil data direktorat',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoadingDirektorat.value = false;
        });
};

const resolver = yupResolver(
    object().shape({
        divisi: string().required('Divisi harus diisi'),
        singkatan: string().required('Singkatan harus diisi'),
        direktorat: string().required('Direktorat harus diisi')
    })
);

const getDetailDivisi = () => {
    if (isEdit.value && route.params.id) {
        isLoadingDetail.value = true;
        
        DivisiService.getById(route.params.id)
            .then((response) => {
                if (response.data.code === 200) {
                    dataDivisi.value = response.data.data;
                }
                isLoadingDetail.value = false;
            });
    }
};

const onClickSubmit = () => {
    formUmumRef.value.onSubmit();
};

const onClickKembali = () => {
    router.push('/divisi');
};

const onSubmitEvent = (data) => {
    if (data.valid) {
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
                saveInputToService(data.values);
            }
        });
    }
};

const saveInputToService = async (data) => {
    try {
        isLoadingSave.value = true;
        
        const payload = {
            namaDivisi: data.namaDivisi,
            singkatan: data.singkatan,
            direktoratId: data.direktorat
        };
        console.log(payload);
        let response;
        if (isEdit.value) {
            // Update existing divisi
            payload.id = dataDivisi.value.id;
            response = await DivisiService.put(payload.id, payload);
        } else {
            // Create new divisi
            response = await DivisiService.post(payload);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: isEdit.value ? 'Data divisi berhasil diperbarui' : 'Data divisi berhasil disimpan',
            life: 3000
        });
        
        // Navigate back to divisi list
        router.push('/divisi');
        
    } catch (error) {
        console.error('Error saving divisi:', error);
        
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
        
        // Only clear auth and redirect to login if it's an authentication error
        if (error.response?.status === 401 || error.response?.status === 403) {
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        }
    } finally {
        isLoadingSave.value = false;
    }
};

onBeforeMount(() => {
    if (isEdit.value) {
        getDetailDivisi();
    }
    // Load direktorat options when component mounts
    loadDirektoratOptions();
});

onMounted(() => {});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Divisi
        </div>
        
        <div v-if="isLoadingDetail">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2 w-1/2"></Skeleton>
            <Skeleton class="mb-2 w-1/3"></Skeleton>
        </div>
        
        <div class="card" v-else>
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
            
            <div class="grid grid-cols-12 gap-2">
                <div class="col-span-12">
                    <Fluid>
                        <Form
                            ref="formUmumRef"
                            v-slot="$form"
                            :resolver="resolver"
                            :initial-values="dataDivisi"
                            @submit="onSubmitEvent"
                            class="flex flex-col gap-4 w-full"
                        >
                            <!-- Divisi -->
                            <div class="grid grid-cols-12 gap-2">
                                <label
                                    for="divisi"
                                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                                >
                                    Divisi <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-4">
                                    <InputText 
                                        autocomplete="off" 
                                        name="namaDivisi"
                                        type="text"
                                        placeholder="Nama Divisi"
                                    />
                                    <Message
                                        v-if="$form.divisi?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.divisi.error?.message }}
                                    </Message>
                                </div>
                            </div>

                            <!-- Singkatan -->
                            <div class="grid grid-cols-12 gap-2">
                                <label
                                    for="singkatan"
                                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                                >
                                    Singkatan <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-4">
                                    <InputText 
                                        autocomplete="off" 
                                        name="singkatan"
                                        type="text"
                                        placeholder="Singkatan Divisi"
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

                            <!-- Direktorat -->
                            <div class="grid grid-cols-12 gap-2">
                                <label
                                    for="direktorat"
                                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                                >
                                    Direktorat <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-4">
                                    <Dropdown
                                        name="direktoratId"
                                        :options="direktoratOptions"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Direktorat"
                                        class="w-full"
                                        :loading="isLoadingDirektorat"
                                        :disabled="isLoadingDirektorat"
                                    />
                                    <Message
                                        v-if="$form.direktorat?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.direktorat.error?.message }}
                                    </Message>
                                </div>
                            </div>
                        </Form>
                    </Fluid>
                </div>
            </div>
            
            <Divider />
            <div class="flex justify-end">
                <Button
                    class="w-max"
                    severity="primary"
                    type="button"
                    @click="onClickSubmit"
                    :loading="isLoadingSave"
                    :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                />
            </div>
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