<script setup>
import AnalisaBebanKerjaService from '@/service/AnalisaBebanKerjaService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
const props = defineProps({
    id: {
        type: String
    }
});
const toast = useToast();
const datas = ref([]);
const data = ref([]);
const loading = ref(null);

onMounted(() => {
    console.clear(); // Bersihkan konsol
    console.log('Parent Loaded');
    getData();
});

function getData() {
    loading.value = true;

    AnalisaBebanKerjaService.getTracking(props.id)
        .then((response) => {
            loading.value = false;
            datas.value = response.data.data.detailTracking;
            data.value = response.data.data;
        })
        .catch((e) => {
            loading.value = false;
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
            console.log(e);
        });
}
</script>
<template>
    <div class="flex gap-4 w-full">
        <div
            :class="{
                'bg-green-100 border-green-300 text-green-600':
                    data.isApprovedUnitInduk === true,
                'bg-gray-100 border-gray-300 text-gray-600':
                    data.isApprovedUnitInduk === false
            }"
            class="border-2 p-4 rounded-lg w-full"
        >
            <h3 class="text-sm font-semibold text-gray-700">Unit Induk</h3>
            <div class="flex items-center gap-2 mt-2">
                <span
                    v-if="data.isApprovedUnitInduk === true"
                    class="text-green-500"
                    >√</span
                >
                <span
                    v-else
                    class="text-grey-500"
                    >✖</span
                >
                <span
                    :class="{
                        'text-green-600 font-medium':
                            data.isApprovedUnitInduk === true,
                        'text-grey-600 font-medium':
                            data.isApprovedUnitInduk === false
                    }"
                    >{{
                        data.isApprovedUnitInduk === true
                            ? 'Approved'
                            : 'Not Submitted'
                    }}</span
                >
            </div>
        </div>

        <div
            :class="{
                'bg-green-100 border-green-300 text-green-600':
                    data.isApprovedHdtArea === true,
                'bg-gray-100 border-gray-300 text-gray-600':
                    data.isApprovedHdtArea === false
            }"
            class="border-2 p-4 rounded-lg w-full"
        >
            <h3 class="text-sm font-semibold text-gray-700">HTD</h3>
            <div class="flex items-center gap-2 mt-2">
                <span
                    v-if="data.isApprovedHdtArea === true"
                    class="text-green-500"
                    >√</span
                >
                <span
                    v-else
                    class="text-grey-500"
                    >✖</span
                >
                <span
                    :class="{
                        'text-green-600 font-medium':
                            data.isApprovedHdtArea === true,
                        'text-grey-600 font-medium':
                            data.isApprovedHdtArea === false
                    }"
                    >{{
                        data.isApprovedHdtArea === true
                            ? 'Approved'
                            : 'Not Submitted'
                    }}</span
                >
            </div>
        </div>

        <div
            :class="{
                'bg-green-100 border-green-300 text-green-600':
                    data.isApprovedKantorPusat === true,
                'bg-gray-100 border-gray-300 text-gray-600':
                    data.isApprovedKantorPusat === false
            }"
            class="border-2 p-4 rounded-lg w-full"
        >
            <h3 class="text-sm font-semibold text-gray-700">Kantor Pusat</h3>
            <div class="flex items-center gap-2 mt-2">
                <span
                    v-if="data.isApprovedKantorPusat === true"
                    class="text-green-500"
                    >√</span
                >
                <span
                    v-else
                    class="text-grey-500"
                    >✖</span
                >
                <span
                    :class="{
                        'text-green-600 font-medium':
                            data.isApprovedKantorPusat === true,
                        'text-grey-600 font-medium':
                            data.isApprovedKantorPusat === false
                    }"
                    >{{
                        data.isApprovedKantorPusat === true
                            ? 'Approved'
                            : 'Not Submitted'
                    }}</span
                >
            </div>
        </div>
    </div>
    <div class="card">
        <DataTable
            :value="datas"
            :paginator="false"
            scrollable
            scrollHeight="400px"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            dataKey="id"
            :rowHover="true"
            :lazy="true"
        >
            <template #header> </template>
            <template #empty> Data not found... </template>
            <template #loading> Loading data. Please wait. </template>
            <Column
                header="No"
                style="min-width: 12rem"
            >
                <template #body="{ index }">
                    {{ index + 1 }}
                </template>
            </Column>
            <Column
                header="Tanggal dan Jam"
                dataType="text"
                style="min-width: 10rem"
            >
                <template #body="{ data }">
                    {{ data.createdAt ?? '-' }}
                </template>
            </Column>
            <Column
                header="User Name"
                dataType="text"
                style="min-width: 10rem"
            >
                <template #body="{ data }">
                    {{ data.username ?? '-' }}
                </template>
            </Column>
            <Column
                header="Status"
                dataType="text"
                style="min-width: 10rem"
            >
                <template #body="{ data }">
                    {{ data.status?.description ?? '-' }}
                </template>
            </Column>
            <Column
                header="Keterangan"
                dataType="text"
                style="min-width: 10rem"
            >
                <template #body="{ data }">
                    {{ data.message ?? '-' }}
                </template>
            </Column>
            <!-- <Column
                header="Tindak Lanjut"
                dataType="text"
                style="min-width: 10rem"
            >
                <template #body="{ data }">
                    {{ data.status }}
                </template>
            </Column> -->
        </DataTable>
    </div>
</template>
