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
import UserDialogWrapper from './UserDialogWrapper.vue';

const detailUser = ref({
    username: '',
    domain: '',
    name: '',
    email: '',
    nip: '',
    vendors: [],
    unitKerjas: [],
    roles: [],
    businessArea: null,
    company: null,
    password: '',
    passwordConfirmation: ''
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
const isEdit = computed(() => Boolean(route.params?.idUser));
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
        username: string().required('Username tidak boleh kosong'),
        name: string().required('Nama tidak boleh kosong'),
        email: string()
            .email('Format Email tidak valid')
            .required('Email wajib diisi')
    };

    if (showUpdatePass.value || !isEdit.value) {
        opt = {
            ...opt,
            password: string()
                .min(8, 'Kata sandi harus minimal 8 karakter')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
                    'Kata sandi setidaknya memiliki 1 huruf kecil dan besar, 1 angka dan 1 spesial karakter'
                )
                .required('Kata sandi wajib diisi'),
            passwordConfirmation: string()
                .oneOf(
                    [yref('password')],
                    'Kata sandi dan konfirmasi harus sama'
                )
                .required('Konfirmasi kata sandi wajib diisi')
        };
    }
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

const getDetailUser = () => {
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

                getDetailUser();
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
            isLoadingListRoles.value = false;
        });
};

const getDataCompanyCode = async () => {

};


const getOptBusinessArea = async () => {
};
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

const saveInputToService = () => {
};

onBeforeMount(() => {
    geListRoles();
});

onMounted(() => {});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} User
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
            <Form
                @submit="onClickSubmit"
                :resolver="resolver"
                v-slot="$form"
                :initialValues="detailUser"
            >
                <Tabs
                    v-model:value="tabValue"
                    value="0"
                >
                    <TabList>
                        <Tab value="0">Info Umum</Tab>
                        <Tab
                            :disabled="!showVendorTab"
                            value="1"
                            >Vendor</Tab
                        >
                        <Tab
                            value="2"
                            :disabled="!showUnitTab"
                            >Unit Kerja</Tab
                        >
                    </TabList>
                    <TabPanels>
                        <TabPanel value="0">
                            <div class="grid grid-cols-12 gap-2">
                                <div class="col-span-8">
                                    <Fieldset legend="User Info">
                                        <Fluid>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="domain"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Domain
                                                </label>
                                                <div class="col-span-9">
                                                    <InputText autocomplete="off" 
                                                        name="domain"
                                                        type="text"
                                                        placeholder="Domain"
                                                        :disabled="isEdit"
                                                        v-model:model-value="
                                                            detailUser.domain
                                                        "
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="username"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Username
                                                </label>
                                                <div class="col-span-3">
                                                    <InputText autocomplete="off" 
                                                        name="username"
                                                        type="text"
                                                        v-show="
                                                            !isLoadingDetail
                                                        "
                                                        placeholder="Username"
                                                        :disabled="isEdit"
                                                        v-model:model-value="
                                                            detailUser.username
                                                        "
                                                    />
                                                    <Message
                                                        v-if="
                                                            $form.username
                                                                ?.invalid
                                                        "
                                                        severity="error"
                                                        size="small"
                                                        variant="simple"
                                                        >{{
                                                            $form.username.error
                                                                ?.message
                                                        }}</Message
                                                    >
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="nama"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Nama
                                                </label>
                                                <div class="col-span-9">
                                                    <InputText autocomplete="off" 
                                                        name="name"
                                                        type="text"
                                                        v-show="
                                                            !isLoadingDetail
                                                        "
                                                        placeholder="Nama"
                                                        v-model:model-value="
                                                            detailUser.name
                                                        "
                                                    />
                                                    <Message
                                                        v-if="
                                                            $form.name?.invalid
                                                        "
                                                        severity="error"
                                                        size="small"
                                                        variant="simple"
                                                        >{{
                                                            $form.name.error
                                                                ?.message
                                                        }}</Message
                                                    >
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="nip"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    NIP
                                                </label>
                                                <div class="col-span-9">
                                                    <InputText autocomplete="off" 
                                                        name="nip"
                                                        type="text"
                                                        v-show="
                                                            !isLoadingDetail
                                                        "
                                                        placeholder="NIP"
                                                        v-model:model-value="
                                                            detailUser.nip
                                                        "
                                                    />
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="email"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Email
                                                </label>
                                                <div class="col-span-5">
                                                    <InputText autocomplete="off" 
                                                        name="email"
                                                        type="text"
                                                        placeholder="E-mail"
                                                        v-model:model-value="
                                                            detailUser.email
                                                        "
                                                    />
                                                    <Message
                                                        v-if="
                                                            $form.email?.invalid
                                                        "
                                                        severity="error"
                                                        size="small"
                                                        variant="simple"
                                                        >{{
                                                            $form.email.error
                                                                ?.message
                                                        }}</Message
                                                    >
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="password"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Password
                                                </label>
                                                <div class="col-span-5">
                                                    <Password
                                                        :feedback="false"
                                                        name="password"
                                                        placeholder="Password"
                                                        v-model:model-value="
                                                            detailUser.password
                                                        "
                                                        :disabled="
                                                            !(
                                                                showUpdatePass ||
                                                                !isEdit
                                                            )
                                                        "
                                                    />
                                                    <Message
                                                        v-if="
                                                            $form.password
                                                                ?.invalid
                                                        "
                                                        severity="error"
                                                        size="small"
                                                        variant="simple"
                                                        >{{
                                                            $form.password.error
                                                                ?.message
                                                        }}</Message
                                                    >
                                                    <div
                                                        v-if="isEdit"
                                                        class="flex gap-2 mt-2"
                                                    >
                                                        <Checkbox
                                                            v-model="
                                                                showUpdatePass
                                                            "
                                                            binary
                                                        />
                                                        <label
                                                            >Update
                                                            Password</label
                                                        >
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="email"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Konfirmasi Password
                                                </label>
                                                <div class="col-span-3">
                                                    <Password
                                                        :feedback="false"
                                                        name="passwordConfirmation"
                                                        placeholder="Konfirmasi Password"
                                                        v-model:model-value="
                                                            detailUser.passwordConfirmation
                                                        "
                                                        :disabled="
                                                            !(
                                                                showUpdatePass ||
                                                                !isEdit
                                                            )
                                                        "
                                                    />
                                                    <Message
                                                        v-if="
                                                            $form
                                                                .passwordConfirmation
                                                                ?.invalid
                                                        "
                                                        severity="error"
                                                        size="small"
                                                        variant="simple"
                                                        >{{
                                                            $form
                                                                .passwordConfirmation
                                                                .error?.message
                                                        }}</Message
                                                    >
                                                </div>
                                            </div>
                                        </Fluid>
                                    </Fieldset>
                                </div>
                                <div class="col-span-4">
                                    <Fieldset legend="Unit">
                                        <Fluid>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="companyCode"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Personal Area
                                                </label>
                                                <div class="col-span-9">
                                                    <Select
                                                        v-model="
                                                            detailUser.company
                                                        "
                                                        :virtual-scroller-options="{
                                                            autoSize: true,
                                                            lazy: true,
                                                            showLoader: true,
                                                            loading:
                                                                isLoadingCompanyCode,
                                                            itemSize: 38,
                                                            delay: 0,
                                                            onscroll:
                                                                onScrollCompanyCode
                                                        }"
                                                        :loading="
                                                            isLoadingCompanyCode
                                                        "
                                                        :filter="true"
                                                        name="company"
                                                        :options="
                                                            dataCompanyCode
                                                        "
                                                        :filterFields="[
                                                            'code',
                                                            'description'
                                                        ]"
                                                        placeholder="Pilih Personal Area"
                                                        @filter="
                                                            onFilterCompanyCode
                                                        "
                                                        @change="({value: val}) => {
                                                            detailUser.businessArea = null;
                                                            dataBusinessArea = [];
                                                            console.log(val);
                                                            if (val?.code) {
                                                                getOptBusinessArea();
                                                            }
                                                        }"
                                                    >
                                                        <template
                                                            #value="slotProps"
                                                        >
                                                            <div
                                                                v-if="
                                                                    slotProps.value
                                                                "
                                                                class="flex items-center"
                                                            >
                                                                <div>
                                                                    {{
                                                                        `${slotProps.value.code} -
                                                                    ${slotProps.value.description}`
                                                                    }}
                                                                </div>
                                                            </div>
                                                            <span v-else>
                                                                {{
                                                                    slotProps.placeholder
                                                                }}
                                                            </span>
                                                        </template>
                                                        <template
                                                            #option="slotProps"
                                                        >
                                                            <div
                                                                class="flex items-center"
                                                            >
                                                                <div>
                                                                    {{
                                                                        `${slotProps.option.code} -
                                                                    ${slotProps.option.description}`
                                                                    }}
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div
                                                class="grid grid-cols-12 gap-2 mb-2"
                                            >
                                                <label
                                                    for="businessArea"
                                                    class="block font-bold mb-3 col-span-3 align-middle self-center"
                                                >
                                                    Personal Sub Area
                                                </label>
                                                <div class="col-span-9">
                                                    <Select
                                                        :disabled="
                                                            !Boolean(
                                                                detailUser.company
                                                            )
                                                        "
                                                        v-model="
                                                            detailUser.businessArea
                                                        "
                                                        :virtual-scroller-options="{
                                                            autoSize: true,
                                                            lazy: true,
                                                            showLoader: true,
                                                            loading:
                                                                isLoadingBusinessArea,
                                                            itemSize: 38,
                                                            delay: 0,
                                                            onscroll:
                                                                onScrollBusinessArea
                                                        }"
                                                        :loading="
                                                            isLoadingBusinessArea
                                                        "
                                                        :filter="true"
                                                        name="businessArea"
                                                        :options="
                                                            dataBusinessArea
                                                        "
                                                        :filterFields="[
                                                            'description'
                                                        ]"
                                                        placeholder="Pilih Personal Sub Area"
                                                        @filter="
                                                            onFilterBusinessArea
                                                        "
                                                    >
                                                        <template
                                                            #value="slotProps"
                                                        >
                                                            <div
                                                                v-if="
                                                                    slotProps.value
                                                                "
                                                                class="flex items-center"
                                                            >
                                                                <div>
                                                                    {{
                                                                        `${slotProps.value.description}`
                                                                    }}
                                                                </div>
                                                            </div>
                                                            <span v-else>
                                                                {{
                                                                    slotProps.placeholder
                                                                }}
                                                            </span>
                                                        </template>
                                                        <template
                                                            #option="slotProps"
                                                        >
                                                            <div
                                                                class="flex items-center"
                                                            >
                                                                <div>
                                                                    {{
                                                                        `${slotProps.option.description}`
                                                                    }}
                                                                </div>
                                                            </div>
                                                        </template>
                                                    </Select>
                                                </div>
                                            </div>
                                        </Fluid>
                                    </Fieldset>
                                    <Fieldset legend="Roles">
                                        <div class="flex flex-wrap gap-4">
                                            <div
                                                v-for="role of rolesList"
                                                :key="role.id"
                                                class="inline-block"
                                            >
                                                <Checkbox
                                                    v-model="selectedRoles"
                                                    :inputId="
                                                        role.id.toString()
                                                    "
                                                    name="role"
                                                    :value="role"
                                                    class="mr-1"
                                                />
                                                <label :for="role.id">
                                                    {{ role.displayName }}
                                                </label>
                                            </div>
                                        </div>
                                    </Fieldset>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel value="1">
                            <DataTable
                                :value="vendorList"
                                tableStyle="min-width: 50rem"
                                showGridlines
                            >
                                <template #header>
                                    <div class="w-fit">
                                        <Button
                                            icon="pi pi-plus"
                                            severity="primary"
                                            variant="outlined"
                                            label="Tambah Vendor"
                                            type="button"
                                            :disabled="vendorList.length"
                                            @click="onClickAddVendor"
                                        />
                                        <Message
                                            v-if="vendorList.length > 0"
                                            severity="info"
                                            size="small"
                                            variant="simple"
                                            class="mt-2"
                                        >
                                            Data vendor maksimal 1. Klik Ikon
                                            hapus untuk mengganti vendor
                                        </Message>
                                    </div>
                                </template>
                                <template #empty> Data is empty... </template>
                                <Column
                                    field="namaPerusahaan"
                                    header="Nama Vendor"
                                ></Column>
                                <Column
                                    header="Action"
                                    class="w-[5rem]"
                                >
                                    <template #body="{ index }">
                                        <div
                                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                                        >
                                            <Button
                                                icon="pi pi-trash"
                                                severity="danger"
                                                rounded
                                                aria-label="hapus vendor"
                                                @click="onClickDelete(index)"
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </TabPanel>
                        <TabPanel value="2">
                            <DataTable
                                :value="unitKerjaList"
                                tableStyle="min-width: 50rem"
                                showGridlines
                            >
                                <template #header>
                                    <div class="w-fit">
                                        <Button
                                            icon="pi pi-plus"
                                            severity="primary"
                                            variant="outlined"
                                            label="Tambah Unit Kerja"
                                            type="button"
                                            @click="onClickAddUnitKerja"
                                        />
                                    </div>
                                </template>
                                <template #empty> Data is empty... </template>
                                <Column
                                    field="companyDescription"
                                    header="Personal Area"
                                ></Column>
                                <Column
                                    field="description"
                                    header="Personal Sub Area"
                                ></Column>
                                <Column
                                    header="Action"
                                    class="w-[5rem]"
                                >
                                    <template #body="{ index }">
                                        <div
                                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                                        >
                                            <Button
                                                icon="pi pi-trash"
                                                severity="danger"
                                                rounded
                                                aria-label="hapus unit"
                                                @click="
                                                    onClickDeleteUnitKerja(
                                                        index
                                                    )
                                                "
                                            />
                                        </div>
                                    </template>
                                </Column>
                            </DataTable>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
                <Divider />
                <div class="flex justify-end">
                    <Button
                        v-show="!isEdit && !showBtSave"
                        class="w-max"
                        severity="info"
                        type="button"
                        @click="
                            () => {
                                if (showUnitTab) {
                                    tabValue = '2';
                                } else {
                                    tabValue = '1';
                                }
                            }
                        "
                        label="Selanjutnya"
                    />

                    <Button
                        v-show="showBtSave"
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
