<script setup>
import JenisRapatService from '../service/JenisRapatService';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string } from 'yup';
import { useAuth } from '@/stores';

const detailUser = ref({
    id: '',
    kodeJenisRapat: '',
    jenisRapat: '',
    deskripsi: ''
});
const isLoadingSave = ref(false);
const isLoadingDetail = ref(false);
const route = useRoute();
const confirmSave = useConfirm();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.idRapat));
const mode = computed(() => route.query?.mode || 'add');
const resolver = computed(() => {
    let opt = {
        kodeJenisRapat: string().required('Kode Rapat tidak boleh kosong'),
        jenisRapat: string().required('Nama Rapat tidak boleh kosong')
    };

    return yupResolver(object().shape(opt));
});


const toast = useToast();

const getDetailUser = () => {
    if (!isEdit.value) return;
    
    // Log received data from route
    console.log('Route params:', route.params);
    console.log('Route query:', route.query);
    console.log('ID Rapat:', route.params.idRapat);
    console.log('Mode:', route.query.mode);
    
    isLoadingDetail.value = true;
    
    // Call API to get rapat kerja detail
    JenisRapatService.getById(route.params.idRapat)
        .then((response) => {
            console.log('API response:', response);
            
            if (response.data && response.data.code === 200) {
                const apiData = response.data.data;
                
                // Update detailUser with received data from API
                detailUser.value = {
                    ...detailUser.value,
                    ...apiData
                };
                
                console.log('Updated detailUser:', detailUser.value);
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data?.message || 'Gagal memuat data jenis rapat',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error loading detail:', error);
            
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat memuat data',
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



const onClickSubmit = (data) => {
    if (!data.valid) {
        return;
    }
    console.log("masuk sini",data);
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
    
    // Prepare data to send to API
    const dataToSend = {
        id: detailUser.value.id,
        kodeJenisRapat: detailUser.value.kodeJenisRapat,
        jenisRapat: detailUser.value.jenisRapat,
        deskripsi: detailUser.value.deskripsi || ''
    };
    
    console.log('Data to send to API:', dataToSend);
    
    // Use PUT method for edit mode, POST for add mode
    const apiCall = isEdit.value 
        ? JenisRapatService.put(dataToSend.id,dataToSend)
        : JenisRapatService.post(dataToSend);
    console.log('apiCall', apiCall);
    apiCall
        .then((response) => {
            console.log('Save response:', response);
            isLoadingSave.value = false;
            
            if (response.data && response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: isEdit.value 
                        ? 'Data jenis rapat berhasil diperbarui'
                        : 'Data jenis rapat berhasil disimpan',
                    life: 3000
                });
                
                // Redirect to list page after successful save
                setTimeout(() => {
                    router.push('/jenis-rapat/rapat');
                }, 1500);
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data?.message || 'Terjadi kesalahan saat menyimpan data',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Save error:', error);
            isLoadingSave.value = false;
            
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        });
};

onBeforeMount(() => {
    getDetailUser();
});

onMounted(() => {});

const onClickKembali = () => {
    router.push('/jenis-rapat/rapat');
};

</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Rapat
            <span v-if="isEdit" class="text-sm text-gray-500 ml-2">
                (Mode: {{ mode }})
            </span>
        </div>
        
        <!-- Debug Information -->
       <!-- <div v-if="isEdit" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 class="font-semibold text-blue-800 mb-2">Debug Information:</h4>
            <p class="text-sm text-blue-700"><strong>ID Rapat:</strong> {{ route.params.idRapat }}</p>
            <p class="text-sm text-blue-700"><strong>Mode:</strong> {{ route.query.mode }}</p>
            <p class="text-sm text-blue-700"><strong>Is Edit:</strong> {{ isEdit }}</p>
        </div> -->
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
                :initialValues="detailUser"
            >
                <div class="col-span-8">
                    <Fieldset>
                        <Fluid>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Kode Rapat"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Kode Rapat <span class="text-red-500">(*)</span> 
                                </label>
                                <div class="col-span-2">
                                    <InputText
                                        autocomplete="off"
                                        name="kodeJenisRapat"
                                        type="text"
                                        placeholder="Kode Rapat"
                                        :disabled="isEdit"
                                        v-model:model-value="
                                            detailUser.kodeJenisRapat
                                        "
                                    />
                                    <Message
                                        v-if="$form.kodeJenisRapat?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.kodeJenisRapat.error?.message
                                        }}</Message
                                    >
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Nama Rapat"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Nama Rapat <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-3">
                                    <InputText
                                        autocomplete="off"
                                        name="jenisRapat"
                                        type="text"
                                        v-show="!isLoadingDetail"
                                        placeholder="Nama Rapat"
                                        :disabled="isEdit"
                                        v-model:model-value="
                                            detailUser.jenisRapat
                                        "
                                    />
                                    <Message
                                        v-if="$form.jenisRapat?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.jenisRapat.error?.message
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
