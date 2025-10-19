<script setup>
import GCGService from '../service/GCGService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores';

const reportData = ref(null);
const isLoading = ref(false);
const route = useRoute();
const router = useRouter();
const toast = useToast();

const gcgId = ref(route.params.id);

const loadReport = async () => {
    if (!gcgId.value) return;
    
    isLoading.value = true;
    try {
        const response = await GCGService.getReport(gcgId.value);
        if (response.data.code === 200) {
            reportData.value = response.data.data;
        } else {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: response.data.message || 'Gagal memuat data laporan',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error loading report:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat memuat data laporan',
            life: 3000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isLoading.value = false;
    }
};

const printReport = () => {
    window.print();
};

const downloadReport = () => {
    // This would typically generate a PDF report
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'Fitur download PDF akan segera tersedia',
        life: 3000
    });
};

const onClickKembali = () => {
    router.push('/gcg');
};

onMounted(() => {
    loadReport();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            Laporan Implementasi GCG
            <span class="text-sm text-gray-500 ml-2">
                (ID: {{ gcgId }})
            </span>
        </div>
        
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-4">
                    <Button
                        icon="pi pi-print"
                        label="Print"
                        severity="info"
                        @click="printReport"
                    />
                    <Button
                        icon="pi pi-download"
                        label="Download PDF"
                        severity="success"
                        @click="downloadReport"
                    />
                </div>
                
                <Button
                    severity="warn"
                    type="button"
                    @click="onClickKembali"
                    :label="'Kembali'"
                />
            </div>
            
            <div v-if="isLoading">
                <Skeleton class="mb-2"></Skeleton>
                <Skeleton class="mb-2"></Skeleton>
                <Skeleton class="mb-2"></Skeleton>
            </div>
            
            <div v-else-if="!reportData" class="text-center py-8">
                <i class="pi pi-file-pdf text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Tidak ada data laporan tersedia</p>
            </div>
            
            <div v-else class="space-y-6">
                <!-- Report Header -->
                <div class="text-center border-b pb-6">
                    <h1 class="text-2xl font-bold mb-2">Laporan Implementasi GCG</h1>
                    <p class="text-gray-600">{{ reportData.namaImplementasi }}</p>
                    <p class="text-sm text-gray-500">Tahun: {{ reportData.tahun }}</p>
                    <p class="text-sm text-gray-500">
                        Generated: {{ new Date().toLocaleDateString('id-ID') }}
                    </p>
                </div>
                
                <!-- Summary Section -->
                <div class="grid grid-cols-4 gap-4">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">{{ reportData.totalAspects || 0 }}</div>
                        <div class="text-sm text-gray-500">Total Aspek</div>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">{{ reportData.completedParameters || 0 }}</div>
                        <div class="text-sm text-gray-500">Parameter Selesai</div>
                    </div>
                    <div class="text-center p-4 bg-yellow-50 rounded-lg">
                        <div class="text-2xl font-bold text-yellow-600">{{ reportData.averageScore || 0 }}%</div>
                        <div class="text-sm text-gray-500">Rata-rata Skor</div>
                    </div>
                    <div class="text-center p-4 bg-purple-50 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">{{ reportData.totalEvidence || 0 }}</div>
                        <div class="text-sm text-gray-500">Total Evidence</div>
                    </div>
                </div>
                
                <!-- Detailed Results -->
                <div v-if="reportData.details && reportData.details.length > 0">
                    <h2 class="text-xl font-semibold mb-4">Detail Hasil Penilaian</h2>
                    <DataTable :value="reportData.details" class="p-datatable-sm">
                        <Column field="aspect" header="Aspek" />
                        <Column field="parameter" header="Parameter" />
                        <Column field="score" header="Skor (%)">
                            <template #body="{ data }">
                                <div class="flex items-center gap-2">
                                    <ProgressBar 
                                        :value="data.score" 
                                        :showValue="false"
                                        style="width: 100px;"
                                        :class="{
                                            'bg-green-500': data.score >= 80,
                                            'bg-yellow-500': data.score >= 60 && data.score < 80,
                                            'bg-red-500': data.score < 60
                                        }"
                                    />
                                    <span class="text-sm">{{ data.score }}%</span>
                                </div>
                            </template>
                        </Column>
                        <Column field="status" header="Status">
                            <template #body="{ data }">
                                <Tag 
                                    :value="data.status"
                                    :severity="{
                                        'Selesai': 'success',
                                        'In Progress': 'warning',
                                        'Not Started': 'secondary'
                                    }[data.status] || 'secondary'"
                                    size="small"
                                />
                            </template>
                        </Column>
                        <Column field="evidenceCount" header="Evidence" />
                        <Column field="pic" header="PIC" />
                    </DataTable>
                </div>
                
                <!-- Recommendations -->
                <div v-if="reportData.recommendations && reportData.recommendations.length > 0">
                    <h2 class="text-xl font-semibold mb-4">Rekomendasi</h2>
                    <div class="space-y-2">
                        <div 
                            v-for="(recommendation, index) in reportData.recommendations" 
                            :key="index"
                            class="p-3 bg-gray-50 rounded-lg"
                        >
                            <p class="text-sm">{{ recommendation }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
@media print {
    .no-print {
        display: none !important;
    }
    
    .card {
        box-shadow: none !important;
        border: none !important;
    }
}
</style>
