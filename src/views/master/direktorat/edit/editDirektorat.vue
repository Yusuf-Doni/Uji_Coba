<script setup>
import IParams from '@/interface/IParams';
import RoleService from '@/service/RoleService';
import debounce from '@/utils/debounce';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string, ref as yref } from 'yup';
import DirektoratService from '../service/direktorat.js';
import { useAuth } from '@/stores';

const detailDirektorat = ref({
    id: '',
    direktorat: '',
    singkatan: ''
});
const rolesList = ref([]);
const selectedRoles = ref();
const vendorList = ref([]);
const unitKerjaList = ref([]);
const visibleAddVendorModal = ref(false);
const visibleAddUnitKerjaModal = ref(false);
const isLoadingSave = ref(false);
const isLoadingDetail = ref(false);
const isLoadingListRoles = ref(false);
const route = useRoute();
const confirmSave = useConfirm();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.id));
const tabValue = ref('0');
const showUpdatePass = ref(false);
const showVendorTab = computed(() => {
    return ['tenaga_kerja', 'vendor'].some(
        (k) => (selectedRoles.value || []).findIndex((r) => r.name === k) > -1
    );
});
const showUnitTab = computed(() => !showVendorTab.value);
const showBtSave = computed(() => {
    if (isEdit.value) {
        return true;
    }

    return tabValue.value != '0';
});
const resolver = computed(() => {
    let opt = {
        direktorat: string().required('Direktorat tidak boleh kosong'),
        singkatan: string().required('Singkatan tidak boleh kosong')
    };
    return yupResolver(object().shape(opt));
});

const isLoadingCompanyCode = ref(false);
const paramCompanyCode = ref({ ...IParams });
const dataCompanyCode = ref([]);
const totalPageCompanyCode = ref(0);

const isLoadingBusinessArea = ref(false);
const paramBusinessArea = ref({ ...IParams });
const dataBusinessArea = ref([]);
const totalPageBusinessArea = ref(0);

const toast = useToast();

const getDetailDirektorat = () => {
    if (isEdit.value && route.params.id) {
        isLoadingDetail.value = true;
        
        DirektoratService.getById(route.params.id)
            .then((response) => {
                if (response.data.code === 200) {
                    detailDirektorat.value = {
                        id: response.data.data.id,
                        direktorat: response.data.data.nama,
                        singkatan: response.data.data.singkatan
                    };
                }
                isLoadingDetail.value = false;
            })
            .catch((error) => {
                console.error('Error fetching direktorat detail:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Gagal mengambil data direktorat',
                    life: 3000
                });
                isLoadingDetail.value = false;
            });
    }
};

const geListRoles = () => {
    isLoadingListRoles.value = true;
    RoleService.get()
        .then((response) => {
            isLoadingListRoles.value = false;
            if (response.data.code == 200) {
                rolesList.value = response.data.data.map((item) => {
                    return {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        displayName: item.displayName
                    };
                });

                if (!isEdit.value) {
                    return;
                }

                getDetailDirektorat();
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
            isLoadingListRoles.value = false;
        });
};

const getDataCompanyCode = async () => {};

const onClickKembali = () => {
    router.push('/direktorat');
};

const getOptBusinessArea = async () => {};
const filterBusinessAreaAPi = (events) => {
    paramBusinessArea.value.size = 10;
    paramBusinessArea.value.search = events.value;
    paramBusinessArea.value.getOptBusinessArea();
};
const debounceFilterBusinessArea = debounce(filterBusinessAreaAPi, 500);
const onFilterBusinessArea = (event) => {
    dataBusinessArea.value = [];
    debounceFilterBusinessArea(event);
};

const onClickAddVendor = () => {
    visibleAddVendorModal.value = true;
};

const onHideAddVendorModal = () => {
    visibleAddVendorModal.value = false;
};

const onClickDelete = (index) => {
    const filtered = vendorList.value.filter((_, itemIdx) => itemIdx !== index);

    vendorList.value = filtered;
};

const onUpdateDataVendor = (dataValue) => {
    vendorList.value.push({
        ...dataValue
    });
};

const onClickAddUnitKerja = () => {
    visibleAddUnitKerjaModal.value = true;
};

const onHideAddUnitKerjaModal = () => {
    visibleAddUnitKerjaModal.value = false;
};

const onClickDeleteUnitKerja = (index) => {
    const filtered = unitKerjaList.value.filter(
        (_, itemIdx) => itemIdx !== index
    );

    unitKerjaList.value = filtered;
};

const onUpdateDataUnitKerja = (dataValue) => {
    const remapDataUnitKerja = {
        id: dataValue.id,
        code: dataValue.code,
        description: dataValue.description,
        companyCode: dataValue.company.code,
        companyDescription: dataValue.company.description
    };

    unitKerjaList.value.push({
        ...remapDataUnitKerja
    });
};

const onClickSubmit = (data) => {
    if (!data.valid) {
        tabValue.value = '0';
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
            nama: detailDirektorat.value.direktorat,
            singkatan: detailDirektorat.value.singkatan
        };

        console.log('payload', payload);
        let response;
        if (detailDirektorat.value.id) {
            // Update existing direktorat
            response = await DirektoratService.put(detailDirektorat.value.id, payload);
        } else {
            // Create new direktorat
            response = await DirektoratService.post(payload);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: isEdit.value ? 'Data direktorat berhasil diperbarui' : 'Data direktorat berhasil disimpan',
            life: 3000
        });
        
        // Navigate back to direktorat list
        router.push('/direktorat');
        
    } catch (error) {
        console.error('Error saving direktorat:', error);
        
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

onBeforeMount(() => {
    geListRoles();
    if (isEdit.value) {
        getDetailDirektorat();
    }
});

onMounted(() => {});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} Direktorat
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
                :initialValues="detailDirektorat"
            >
                <div class="col-span-8">
                    <Fieldset>
                        <Fluid>
                            <div class="grid grid-cols-12 gap-2 mb-2">
                                <label
                                    for="Direktorat"
                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                >
                                    Direktorat <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-2">
                                    <InputText
                                        autocomplete="off"
                                        name="direktorat"
                                        type="text"
                                        placeholder="Direktorat"
                                        
                                        v-model:model-value="
                                            detailDirektorat.direktorat
                                        "
                                    />
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
                                        
                                        v-model:model-value="
                                            detailDirektorat.singkatan
                                        "
                                    />
                                    <Message
                                        v-if="$form.singkatan?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                        >{{
                                            $form.singkatan.error?.message
                                        }}</Message
                                    >
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