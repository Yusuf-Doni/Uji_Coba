<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { object, string, number } from 'yup';
import AktivitasService from '@/service/AktivitasService';
import { useToast } from 'primevue/usetoast';

const emits = defineEmits(['close', 'simpan']);
const props = defineProps({
    datas: Object
});

const toast = useToast();

const btnLoading = ref(false);
const periodes = ref([
    { name: 'Harian', code: 1 },
    { name: 'Mingguan', code: 2 },
    { name: 'Bulanan', code: 3 },
    { name: 'Tahunan', code: 4 }
]);
const resolver = yupResolver(
    object().shape({
        nama: string().required('Sub Aktifitas kerja tidak boleh kosong'),
        periode: object().required('Periode tidak boleh kosong'),
        processTimeDefault: number().required(
            'Waktu Proses (Menit) tidak boleh kosong'
        ),
        kuantitas: number().required('Kuantitas (Orang) tidak boleh kosong')
    })
);

console.log('aaaass');
console.log(props.datas);

const saveSubAktifitas = (data) => {
    if (data.valid) {
        btnLoading.value = true;
        let datas = data.values;
        let params;
        if (props.datas.edit == 'Edit Sub Aktivitas') {
            params = {
                nama: datas.nama,
                jenisPekerjaanAbkId: props.datas.jenisPekerjaanId,
                id: props.datas.id,
                kontrakId: props.datas.kontrakId,
                periodeId: datas.periode.code,
                processTimeDefault: datas.processTimeDefault,
                kuantitas: datas.kuantitas
            };
        } else {
            params = {
                nama: datas.nama,
                jenisPekerjaanAbkId: props.datas.jenisPekerjaanId,
                parentId: props.datas.id,
                kontrakId: props.datas.kontrakId,
                periodeId: datas.periode.code,
                processTimeDefault: datas.processTimeDefault,
                kuantitas: datas.kuantitas
            };
        }

        let methodApi = 'post';
        if (props.datas.edit == 'Edit Sub Aktivitas') {
            methodApi = 'put';
        }
        if (props.datas.id)
            AktivitasService[methodApi](params)
                .then((response) => {
                    if (response.data.code == 200) {
                        btnLoading.value = false;
                        emits('simpan');
                        emits('close');
                        toast.add({
                            severity: 'success',
                            summary: 'Berhasil',
                            detail: 'Berhasil tambah data sub aktifitas',
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
                    console.log('error = ', e);
                    btnLoading.value = false;
                    toast.add({
                        severity: 'error',
                        summary: 'Gagal',
                        detail: e.message,
                        life: 3000
                    });
                });
    }
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
            @submit="saveSubAktifitas"
            :initialValues="props.datas"
        >
            <div class="mb-6">
                <label class="block text-gray-600 font-medium">
                    Aktifitas Kerja
                </label>
                <div class="mt-4 ml-3 text-base">
                    {{ props.datas ? props.datas.namaAktivitas : '' }}
                </div>
            </div>
            <div class="mb-6">
                <label class="block text-gray-600 font-medium mb-2">
                    Sub Aktifitas kerja<span class="text-red-500">*</span>
                </label>
                <InputText autocomplete="off" 
                    name="nama"
                    type="text"
                    placeholder="Masukan Sub Aktifitas kerja"
                    fluid
                />
                <Message
                    v-if="$form.nama?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.nama.error?.message }}</Message
                >
            </div>
            <div class="mb-6">
                <label class="block text-gray-600 font-medium mb-2">
                    Periode<span class="text-red-500">*</span>
                </label>
                <Select
                    name="periode"
                    :options="periodes"
                    optionLabel="name"
                    placeholder="Masukan Periode"
                    fluid
                />
                <Message
                    v-if="$form.periode?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.periode.error?.message }}</Message
                >
            </div>
            <div class="mb-6">
                <label class="block text-gray-600 font-medium mb-2">
                    Waktu Proses (Menit)<span class="text-red-500">*</span>
                </label>
                <InputText autocomplete="off" 
                    name="processTimeDefault"
                    placeholder="Masukan Waktu Proses (Menit)"
                    fluid
                />
                <Message
                    v-if="$form.processTimeDefault?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.waktuProses.error?.message }}</Message
                >
            </div>
            <div class="mb-6">
                <label class="block text-gray-600 font-medium mb-2">
                    Kuantitas (Orang)<span class="text-red-500">*</span>
                </label>
                <InputNumber autocomplete="off" 
                    name="kuantitas"
                    :useGrouping="false"
                    placeholder="Masukan Kuantitas (Orang)"
                    fluid
                />
                <Message
                    v-if="$form.kuantitas?.invalid"
                    severity="error"
                    size="small"
                    variant="simple"
                    >{{ $form.kuantitas.error?.message }}</Message
                >
            </div>
            <div class="flex justify-end">
                <Button
                    label="Cancel"
                    class="w-auto mr-2"
                    size="large"
                    variant="text"
                    severity="danger"
                    @click="onClose()"
                />
                <Button
                    label="Save"
                    type="submit"
                    class="w-auto"
                    size="large"
                    :loading="btnLoading"
                />
            </div>
        </Form>
    </Fluid>
</template>
