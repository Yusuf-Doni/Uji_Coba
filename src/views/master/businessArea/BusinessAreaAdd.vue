<script setup>
import IParams from '@/interface/IParams';
import BusinessAreaService from '@/service/BusinessAreaService';
import debounce from '@/utils/debounce';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { object, string } from 'yup';
import IBusinessAreaData from './IBusinessAreaData';

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
    }
});

const dataStatus = ref([
    {
        name: 'ACTIVE',
        code: 'ACTIVE'
    },
    {
        name: 'INACTIVE',
        code: 'INACTIVE'
    }
]);

const resolver = yupResolver(
    object().shape({
        company: object().required('Personal area harus diisi'),
        code: string()
            // .positive('code tidak boleh negatif')
            // .integer('code harus bilangan bulat')
            .required('Personal sub area tidak boleh kosong'),
        // .typeError('code harus angka'),
        description: string().required('description tidak boleh kosong'),
        shortText: string().required('short text tidak boleh kosong'),
        longText: string().required('long text tidak boleh kosong'),
        status: string().required('status tidak boleh kosong')
    })
);

const dataInput = ref(IBusinessAreaData);
if (props.data) {
    dataInput.value = props.data;
}

const dataCompanyCode = ref();
const isLoadingDataCompanyCode = ref(false);
const totalPage = ref(0);

const confirmSave = useConfirm();
const toast = useToast();
const emitLoading = defineEmits(['onChangeLoading']);

const paramCompanyCode = ref({ ...IParams });
const isLoadingDetail = ref(false);

onMounted(() => {
    getDataCompanyCode();
    if (dataInput.value.id) {
        getDetailBusinessArea();
    }
});

const getDataCompanyCode = async () => {
};

const onClickCancel = () => {
    props.onClose();
};

const onClickSave = (data) => {
    if (data.valid) {
        openDialogSave(data);
    }
};

const saveInputToService = (data) => {
    emitLoading('onChangeLoading', true);
    const mappedData = {
        ...data,
        id: dataInput.value.id ? dataInput.value.id : null
    };

    let methodApi = 'post';

    if (dataInput.value.id) {
        methodApi = 'put';
    }

    BusinessAreaService[methodApi](mappedData)
        .then((response) => {
            emitLoading('onChangeLoading', false);
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                props.onClose();
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
                props.onClose();
            }
        })
        .catch((e) => {
            emitLoading('onChangeLoading', false);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
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
            saveInputToService(data.values);
        }
    });
};


const getDetailBusinessArea = async () => {
    isLoadingDetail.value = true;
    await BusinessAreaService.getById(dataInput.value.id)
        .then((response) => {
            isLoadingDetail.value = false;
            dataInput.value = response.data.data;
        })
        .catch((e) => {
            isLoadingDetail.value = false;
            console.log(e);
        });
};
</script>
<template>
    <Fluid>
        <Form
            v-slot="$form"
            :resolver="resolver"
            :initialValues="dataInput"
            @submit="onClickSave"
            class="flex flex-col gap-4 w-full"
        >
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="companyCode"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                Personal Area
                </label>
                <div class="col-span-10">
                    <Skeleton
                        class="mb-2 h-full"
                        v-show="isLoadingDetail"
                    ></Skeleton>
                    <Select
                        :virtual-scroller-options="{
                            autoSize: true,
                            lazy: true,
                            onLazyLoad: isLoadingDataCompanyCode,
                            showLoader: isLoadingDataCompanyCode,
                            loading: isLoadingDataCompanyCode,
                            itemSize: 38,
                            delay: 0,
                            onscroll: (event) => {
                                onScrollEvent(event);
                            }
                        }"
                        :loading="isLoadingDataCompanyCode"
                        :filter="true"
                        name="company"
                        :options="dataCompanyCode"
                        :filterFields="['code', 'description']"
                        placeholder="Pilih Personal Area"
                        @filter="onFilterCompanyCode"
                        v-show="!isLoadingDetail"
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
                                        `${slotProps.value.code} - ${slotProps.value.description}`
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
                                        `${slotProps.option.code} - ${slotProps.option.description}`
                                    }}
                                </div>
                            </div>
                        </template>
                    </Select>
                    <Message
                        v-if="$form.companyCode?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.companyCode.error?.message }}
                    </Message>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="code"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                Personal Sub Area
                </label>
                <div class="col-span-10">
                    <Skeleton
                        class="mb-2 h-full"
                        v-show="isLoadingDetail"
                    ></Skeleton>
                    <InputText autocomplete="off" 
                        name="code"
                        type="number"
                        v-show="!isLoadingDetail"
                    />
                    <Message
                        v-if="$form.code?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.code.error?.message }}
                    </Message>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="description"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Description
                </label>
                <div class="col-span-10">
                    <Skeleton
                        class="mb-2 h-full"
                        v-show="isLoadingDetail"
                    ></Skeleton>
                    <InputText autocomplete="off" 
                        name="description"
                        type="text"
                        v-show="!isLoadingDetail"
                    />
                    <Message
                        v-if="$form.description?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.description.error?.message }}
                    </Message>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="shortText"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Short Text
                </label>
                <div class="col-span-10">
                    <Skeleton
                        class="mb-2 h-full"
                        v-show="isLoadingDetail"
                    ></Skeleton>
                    <InputText autocomplete="off" 
                        name="shortText"
                        type="text"
                        v-show="!isLoadingDetail"
                    />
                    <Message
                        v-if="$form.shortText?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.shortText.error?.message }}
                    </Message>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="longText"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Long Text
                </label>
                <div class="col-span-10">
                    <Skeleton
                        class="mb-2 h-full"
                        v-show="isLoadingDetail"
                    ></Skeleton>
                    <InputText autocomplete="off" 
                        name="longText"
                        type="text"
                        v-show="!isLoadingDetail"
                    />
                    <Message
                        v-if="$form.longText?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.longText.error?.message }}
                    </Message>
                </div>
            </div>
            <div class="grid grid-cols-12 gap-2">
                <label
                    for="status"
                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                >
                    Status
                </label>
                <div class="col-span-10">
                    <Skeleton
                        class="mb-2 h-full"
                        v-show="isLoadingDetail"
                    ></Skeleton>
                    <Select
                        name="status"
                        :options="dataStatus"
                        optionLabel="name"
                        placeholder="Pilih Status"
                        :option-value="'code'"
                        v-show="!isLoadingDetail"
                    />
                    <Message
                        v-if="$form.status?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.status.error?.message }}
                    </Message>
                </div>
            </div>
            <div
                class="flex flex-col md:flex-row gap-4 justify-center items-start mt-4"
            >
                <Button
                    :disabled="isLoading"
                    class="w-24"
                    severity="danger"
                    label="Batal"
                    @click="onClickCancel"
                />
                <Button
                    :loading="isLoading"
                    class="w-max"
                    severity="success"
                    :label="isLoading ? 'Menyimpan Data' : 'Simpan'"
                    type="submit"
                    v-show="!isLoadingDetail"
                />
            </div>
        </Form>
    </Fluid>
</template>
