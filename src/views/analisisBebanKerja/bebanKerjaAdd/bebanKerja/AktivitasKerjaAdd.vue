<script setup>
import { ref } from 'vue';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { object, string } from 'yup';
import AktivitasService from '@/service/AktivitasService';
import { useToast } from 'primevue/usetoast';

const emits = defineEmits(['close', 'simpan']);
const props = defineProps({
    dataUpdate: {
        type: Object,
        default: null
    },
    data: {
        type: Object,
        default: null
    },
    dataKontrak: {
        type: Object,
        default: null
    },
    isLoading: {
        type: Boolean,
        default: false
    }
});
const toast = useToast();
const btnLoading = ref(false);
const resolver = yupResolver(
    object().shape({
        nama: string().required('Aktivitas kerja tidak boleh kosong')
    })
);
const dataInput = ref({});
if (props.dataUpdate) {
    dataInput.value = props.dataUpdate;
}
const saveInputToService = (data) => {
    btnLoading.value = true;
    let mappedData = {
        nama: data.values.nama,
        jenisPekerjaanAbkId: props.data.id,
        kontrakId: props.dataKontrak.id
    };
    if (dataInput.value.id) {
        mappedData = {
            id: dataInput.value.id,
            nama: data.values.nama,
            jenisPekerjaanAbkId: props.data.id,
            kontrakId: props.dataKontrak.id
        };
    }

    let methodApi = 'post';
    if (dataInput.value.id) {
        methodApi = 'put';
    }
    AktivitasService[methodApi](mappedData)
        .then((response) => {
            btnLoading.value = false;
            if (response.data.code == 200) {
                emits('simpan');
                emits('close');
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
            } else {
                btnLoading.value = false;
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            // emits('close');
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
            // props.onClose();
        });
};
const onClose = () => {
    emits('close');
};
</script>
<template>
    <Fluid>
        <Form
            v-slot="$form"
            :resolver="resolver"
            :initialValues="dataInput"
            @submit="saveInputToService"
            class="flex flex-col gap-4 w-full"
        >
            <div class="p-4">
                <div class="mb-4">
                    <label class="block text-gray-700 font-bold"
                        >Jenis Pekerjaan</label
                    >
                    <p class="mt-1">{{ data.nama }}</p>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 font-bold"
                        >Aktifitas Kerja<span class="text-red-500"
                            >*</span
                        ></label
                    >
                    <InputText autocomplete="off" 
                        name="nama"
                        class="w-full mt-1"
                        placeholder="Masukkan aktifitas kerja"
                    />
                    <Message
                        v-if="$form.nama?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.nama.error?.message }}
                    </Message>
                </div>
                <div class="flex justify-between mt-6">
                    <button
                        class="text-red-500 font-bold"
                        @click="onClose()"
                    >
                        Cancel
                    </button>
                    <button
                        :loading="btnLoading"
                        class="bg-teal-700 text-white px-4 py-2 rounded"
                        :label="'Simpan'"
                        type="submit"
                    >
                        Save
                    </button>
                </div>
            </div>
        </Form>
    </Fluid>
</template>
