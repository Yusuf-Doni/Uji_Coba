<script setup>
import GCGService from '../service/GCGService';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '@/stores';

const scores = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const route = useRoute();
const router = useRouter();
const toast = useToast();

const gcgId = ref(route.params.id);
const parameterId = ref(route.query.parameterId);

// Score input state
const scoreInputs = ref({});

// Score options (0% - 100%)
const scoreOptions = ref([]);

// Generate score options from 0 to 100
for (let i = 0; i <= 100; i += 5) {
    scoreOptions.value.push({
        label: `${i}%`,
        value: i
    });
}

const loadScores = async () => {
    if (!gcgId.value) return;
    
    isLoading.value = true;
    try {
        const response = await GCGService.getScores(gcgId.value);
        if (response.data.code === 200) {
            scores.value = response.data.data;
            
            // Initialize score inputs
            scores.value.forEach(score => {
                scoreInputs.value[score.parameterId] = {
                    score: score.score || 0,
                    status: score.status || 'Not Started',
                    notes: score.notes || '',
                    lastUpdated: score.lastUpdated || null
                };
            });
        } else {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: response.data.message || 'Gagal memuat data skor',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error loading scores:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat memuat data skor',
            life: 3000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isLoading.value = false;
    }
};

const saveScore = async (parameterId, scoreData) => {
    try {
        const response = await GCGService.saveScore(gcgId.value, parameterId, scoreData);
        if (response.data.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Skor self-assessment berhasil disimpan',
                life: 3000
            });
            
            // Update the score data
            const scoreIndex = scores.value.findIndex(s => s.parameterId === parameterId);
            if (scoreIndex !== -1) {
                scores.value[scoreIndex] = {
                    ...scores.value[scoreIndex],
                    ...scoreData,
                    lastUpdated: new Date().toISOString()
                };
            }
        } else {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: response.data.message || 'Gagal menyimpan skor',
                life: 3000
            });
        }
    } catch (error) {
        console.error('Error saving score:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat menyimpan skor',
            life: 3000
        });
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    }
};

const onScoreChange = async (parameterId, newScore) => {
    const currentInput = scoreInputs.value[parameterId];
    if (!currentInput) return;
    
    currentInput.score = newScore;
    
    // Auto-save after score change
    await saveScore(parameterId, {
        score: newScore,
        status: currentInput.status,
        notes: currentInput.notes
    });
};

const onStatusChange = async (parameterId, newStatus) => {
    const currentInput = scoreInputs.value[parameterId];
    if (!currentInput) return;
    
    currentInput.status = newStatus;
    
    // Auto-save after status change
    await saveScore(parameterId, {
        score: currentInput.score,
        status: newStatus,
        notes: currentInput.notes
    });
};

const onNotesChange = async (parameterId, newNotes) => {
    const currentInput = scoreInputs.value[parameterId];
    if (!currentInput) return;
    
    currentInput.notes = newNotes;
    
    // Auto-save after notes change
    await saveScore(parameterId, {
        score: currentInput.score,
        status: currentInput.status,
        notes: newNotes
    });
};

const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
};

const getScoreSeverity = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
};

const getStatusSeverity = (status) => {
    switch (status) {
        case 'Selesai': return 'success';
        case 'In Progress': return 'warning';
        default: return 'secondary';
    }
};

const calculateAverageScore = () => {
    if (scores.value.length === 0) return 0;
    
    const totalScore = scores.value.reduce((sum, score) => {
        const input = scoreInputs.value[score.parameterId];
        return sum + (input?.score || 0);
    }, 0);
    
    return Math.round(totalScore / scores.value.length);
};

const onClickKembali = () => {
    router.push('/gcg');
};

onMounted(() => {
    loadScores();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            Self Assessment Scoring
            <span class="text-sm text-gray-500 ml-2">
                (Parameter ID: {{ parameterId }})
            </span>
        </div>
        
        <div class="card">
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold" :class="getScoreColor(calculateAverageScore())">
                            {{ calculateAverageScore() }}%
                        </div>
                        <div class="text-sm text-gray-500">Rata-rata Skor</div>
                    </div>
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
            
            <div v-else-if="scores.length === 0" class="text-center py-8">
                <i class="pi pi-chart-bar text-4xl text-gray-400 mb-4"></i>
                <p class="text-gray-500">Belum ada data skor untuk dinilai</p>
            </div>
            
            <div v-else class="space-y-6">
                <div 
                    v-for="score in scores" 
                    :key="score.parameterId"
                    class="border rounded-lg p-6"
                >
                    <div class="grid grid-cols-12 gap-6">
                        <!-- Parameter Info -->
                        <div class="col-span-8">
                            <h3 class="font-semibold text-lg mb-2">{{ score.parameterName }}</h3>
                            <p class="text-sm text-gray-600 mb-4">{{ score.parameterDescription }}</p>
                            
                            <!-- Notes Section -->
                            <div class="mb-4">
                                <label class="block font-medium mb-2">Catatan</label>
                                <Textarea
                                    :model-value="scoreInputs[score.parameterId]?.notes || ''"
                                    @input="(event) => onNotesChange(score.parameterId, event.target.value)"
                                    rows="3"
                                    placeholder="Tambahkan catatan untuk parameter ini..."
                                    class="w-full"
                                />
                            </div>
                        </div>
                        
                        <!-- Scoring Section -->
                        <div class="col-span-4">
                            <div class="space-y-4">
                                <!-- Score Input -->
                                <div>
                                    <label class="block font-medium mb-2">Skor (%)</label>
                                    <Dropdown
                                        :model-value="scoreInputs[score.parameterId]?.score || 0"
                                        @change="(event) => onScoreChange(score.parameterId, event.value)"
                                        :options="scoreOptions"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Skor"
                                        class="w-full"
                                    />
                                    <div class="mt-2">
                                        <ProgressBar 
                                            :value="scoreInputs[score.parameterId]?.score || 0" 
                                            :class="getScoreSeverity(scoreInputs[score.parameterId]?.score || 0)"
                                        />
                                    </div>
                                </div>
                                
                                <!-- Status Input -->
                                <div>
                                    <label class="block font-medium mb-2">Status</label>
                                    <Dropdown
                                        :model-value="scoreInputs[score.parameterId]?.status || 'Not Started'"
                                        @change="(event) => onStatusChange(score.parameterId, event.value)"
                                        :options="[
                                            { label: 'Not Started', value: 'Not Started' },
                                            { label: 'In Progress', value: 'In Progress' },
                                            { label: 'Selesai', value: 'Selesai' }
                                        ]"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Status"
                                        class="w-full"
                                    />
                                    <Tag 
                                        :value="scoreInputs[score.parameterId]?.status || 'Not Started'"
                                        :severity="getStatusSeverity(scoreInputs[score.parameterId]?.status || 'Not Started')"
                                        size="small"
                                        class="mt-2"
                                    />
                                </div>
                                
                                <!-- Last Updated -->
                                <div v-if="scoreInputs[score.parameterId]?.lastUpdated">
                                    <small class="text-gray-500">
                                        Terakhir diperbarui: {{ new Date(scoreInputs[score.parameterId].lastUpdated).toLocaleString('id-ID') }}
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Summary Section -->
            <div class="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 class="font-semibold text-lg mb-4">Ringkasan Penilaian</h3>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">
                            {{ scores.filter(s => (scoreInputs[s.parameterId]?.score || 0) >= 80).length }}
                        </div>
                        <div class="text-sm text-gray-500">Baik (≥80%)</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-yellow-600">
                            {{ scores.filter(s => {
                                const score = scoreInputs[s.parameterId]?.score || 0;
                                return score >= 60 && score < 80;
                            }).length }}
                        </div>
                        <div class="text-sm text-gray-500">Cukup (60-79%)</div>
                    </div>
                    <div class="text-center">
                        <div class="text-2xl font-bold text-red-600">
                            {{ scores.filter(s => (scoreInputs[s.parameterId]?.score || 0) < 60).length }}
                        </div>
                        <div class="text-sm text-gray-500">Kurang (<60%)</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
:deep(.p-progressbar) {
    height: 8px;
    border-radius: 4px;
}

:deep(.p-progressbar .p-progressbar-value) {
    border-radius: 4px;
}
</style>
