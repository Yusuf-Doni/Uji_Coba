<script setup>
import { Form } from '@primevue/forms';
import InputForm from '@/views/component/InputForm.vue';
import DatePickerForm from '@/views/component/DatePickerForm.vue';
import { onMounted, ref } from 'vue';
import SelectForm from '@/views/component/SelectForm.vue';
const props = defineProps({
    item: Object,
    disabled: {
        type: Boolean,
        default: false
    }
});
onMounted(() => {});
</script>
<template>
    <Fluid>
        <div class="w-auto mx-auto bg-white shadow-md rounded-lg p-6">
            <div class="grid grid-cols-[1fr_2fr] gap-4 border-b pb-4">
                <div class="text-gray-400 font-semibold">Vendor</div>
                <div class="text-gray-900">
                    {{ props.item?.vendor?.namaPerusahaan }}
                </div>
            </div>

            <div class="grid grid-cols-[1fr_2fr] gap-4 border-b py-4">
                <div class="text-gray-400 font-semibold">Nomor Perjanjian</div>
                <div class="text-gray-900">
                    {{ props.item?.nomorKontrak }}
                </div>
            </div>

            <div class="grid grid-cols-[1fr_2fr] gap-4 border-b py-4">
                <div class="text-gray-400 font-semibold">Judul Perjanjian</div>
                <div class="text-gray-900">{{ props.item?.namaPekerjaan }}</div>
            </div>

            <div class="grid grid-cols-[1fr_2fr] gap-4 border-b py-4">
                <div class="text-gray-400 font-semibold">
                    Jangka Waktu Perjanjian
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-gray-900">{{ props.item?.tglAwal }}</span>
                    <span class="text-gray-700">:</span>
                    <span class="text-gray-900">{{
                        props.item?.tglAkhir
                    }}</span>
                </div>
            </div>

            <div class="grid grid-cols-[1fr_2fr] gap-4 pt-4">
                <div class="text-gray-400 font-semibold">Direksi Pekerjaan</div>
                <div class="text-gray-900">
                    {{ props.item?.direksiPekerjaan }}
                </div>
            </div>
        </div>
    </Fluid>
</template>
