<script setup>
// Vue Composition API
import { onMounted, ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import RadioButton from 'primevue/radiobutton';
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog';

// Services
import JadwalRapatService from '../service/JadwalRapat';

// ==========================================
// COMPOSABLES & STORES
// ==========================================
const toast = useToast();
const confirm = useConfirm();
const router = useRouter();
const route = useRoute();
const authStore = useAuth();

// ==========================================
// REACTIVE DATA
// ==========================================
const isLoading = ref(false);

// Form Data
const scheduleForm = ref({
    agenda: '',
    tanggalRapatFrom: new Date(), // Start datetime
    tanggalRapatTo: new Date(), // End datetime
    tahun: new Date().getFullYear(),
    modelRapat: '',
    lokasi: '',
    linkMeeting: '',
    durasi: null,
    deskripsi: '',
    kodeJenisRapat: '4' // RUPS dan LPT
});

// Set default end time to 1 hour after start time
const setDefaultEndTime = () => {
    const startTime = new Date(scheduleForm.value.tanggalRapatFrom);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
    scheduleForm.value.tanggalRapatTo = endTime;
};

// Helper function to ensure proper datetime handling
const updateDateTime = (field, value) => {
    if (value && value instanceof Date) {
        // Ensure we're working with a proper Date object
        const date = new Date(value);
        scheduleForm.value[field] = date;
        
        // If this is start time, auto-update end time
        if (field === 'tanggalRapatFrom') {
            const endTime = new Date(date.getTime() + 60 * 60 * 1000); // Add 1 hour
            scheduleForm.value.tanggalRapatTo = endTime;
        }
    }
};

// Default time for meetings (9:00 AM)
const defaultMeetingTime = ref(new Date());
defaultMeetingTime.value.setHours(9, 0, 0, 0);

// ==========================================
// COMPUTED PROPERTIES
// ==========================================
// Computed property to calculate duration from start and end times
const calculatedDuration = computed(() => {
    if (!scheduleForm.value.tanggalRapatFrom || !scheduleForm.value.tanggalRapatTo) {
        return 0;
    }
    
    const startTime = new Date(scheduleForm.value.tanggalRapatFrom);
    const endTime = new Date(scheduleForm.value.tanggalRapatTo);
    
    if (endTime <= startTime) {
        return 0;
    }
    
    const diffInMs = endTime.getTime() - startTime.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    return diffInMinutes;
});

// Computed property for formatted duration display
const formattedDuration = computed(() => {
    const duration = calculatedDuration.value;
    if (!duration || duration <= 0) return '';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0 && minutes > 0) {
        return `${hours} jam ${minutes} menit`;
    } else if (hours > 0) {
        return `${hours} jam`;
    } else {
        return `${minutes} menit`;
    }
});

// ==========================================
// PARAMETERS FROM ROUTE
// ==========================================
const roleParam = ref(null);
const jenisRapatParam = ref(null);
const tahunParam = ref(null);

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
const validateForm = () => {
    const { agenda, tanggalRapatFrom, tanggalRapatTo, modelRapat, lokasi, deskripsi } = scheduleForm.value;
    
    if (!agenda.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Agenda rapat harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!tanggalRapatFrom) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Waktu mulai rapat harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!tanggalRapatTo) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Waktu selesai rapat harus diisi',
            life: 3000
        });
        return false;
    }
    
    // Validate that end time is after start time
    if (new Date(tanggalRapatTo) <= new Date(tanggalRapatFrom)) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Waktu selesai harus lebih dari waktu mulai',
            life: 3000
        });
        return false;
    }
    
    if (!modelRapat) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Model rapat harus dipilih',
            life: 3000
        });
        return false;
    }
    
    if (!lokasi.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Lokasi rapat harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!deskripsi.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Deskripsi rapat harus diisi',
            life: 3000
        });
        return false;
    }
    
    // Validate deskripsi minimum length
    if (deskripsi.length < 3) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Deskripsi harus minimal 3 karakter',
            life: 3000
        });
        return false;
    }
    
    // Validate link meeting for Online/Hybrid
    if ((modelRapat === 'Online' || modelRapat === 'Hybrid')) {
        if (!scheduleForm.value.linkMeeting.trim()) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Link meeting harus diisi untuk mode Online/Hybrid',
                life: 3000
            });
            return false;
        }
        
        // Validate URL format
        try {
            const url = new URL(scheduleForm.value.linkMeeting.trim());
            // Check if protocol is http or https
            if (!['http:', 'https:'].includes(url.protocol)) {
                throw new Error('Invalid protocol');
            }
        } catch (error) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Link meeting harus berupa URL yang valid (contoh: https://zoom.us/j/123456789)',
                life: 3000
            });
            return false;
        }
    }
    
    return true;
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================
// Helper function to format date without timezone conversion
const formatDateForAPI = (date) => {
    if (!date) return null;
    
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
};

// ==========================================
// API FUNCTIONS
// ==========================================
const saveSchedule = async () => {
    if (!validateForm()) {
        return;
    }

    confirm.require({
        message: 'Apakah Anda yakin ingin menyimpan jadwal rapat ini?',
        header: 'Konfirmasi',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Ya, Simpan',
        rejectLabel: 'Tidak',
        accept: async () => {
            try {
                isLoading.value = true;
                
                const payload = {
                    agenda: scheduleForm.value.agenda.trim(),
                    tanggalRapat: formatDateForAPI(scheduleForm.value.tanggalRapatFrom), // Use start time as main date
                    tanggalRapatFrom: formatDateForAPI(scheduleForm.value.tanggalRapatFrom),
                    tanggalRapatTo: formatDateForAPI(scheduleForm.value.tanggalRapatTo),
                    tahun: scheduleForm.value.tahun,
                    modelRapat: scheduleForm.value.modelRapat,
                    lokasi: scheduleForm.value.lokasi.trim(),
                    linkMeeting: scheduleForm.value.linkMeeting.trim(),
                    durasi: calculatedDuration.value,
                    deskripsi: scheduleForm.value.deskripsi.trim(),
                    kodeJenisRapat: scheduleForm.value.kodeJenisRapat
                };
                
                
                const response = await JadwalRapatService.post(payload);
                
                if (response.data && response.data.success) {
                    toast.add({
                        severity: 'success',
                        summary: 'Berhasil',
                        detail: 'Jadwal rapat berhasil disimpan',
                        life: 3000
                    });
                    
                    // Redirect to list page
                    setTimeout(() => {
                        router.push(`/transaction/rapat-rups-lpt/${scheduleForm.value.tahun || new Date().getFullYear()}/4`);
                    }, 1000);
                } else {
                    throw new Error(response.data?.message || 'Gagal menyimpan jadwal rapat');
                }
            } catch (error) {
                console.error('Error saving schedule:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan jadwal rapat',
                    life: 3000
                });
            } finally {
                isLoading.value = false;
            }
        }
    });
};

// ==========================================
// NAVIGATION FUNCTIONS
// ==========================================
const onClickCancel = () => {
    router.push(`/transaction/rapat-rups-lpt/${scheduleForm.value.tahun || new Date().getFullYear()}/4`);
};

// ==========================================
// WATCHERS
// ==========================================
watch(() => scheduleForm.value.tanggalRapatFrom, (newDate) => {
    if (newDate) {
        // Extract year from the selected start date
        const year = new Date(newDate).getFullYear();
        scheduleForm.value.tahun = year;
        
        // Auto-update end time when start time changes (if end time is not manually set)
        const startTime = new Date(newDate);
        const currentEndTime = scheduleForm.value.tanggalRapatTo;
        
        if (!currentEndTime || currentEndTime <= startTime) {
            const newEndTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Add 1 hour
            scheduleForm.value.tanggalRapatTo = newEndTime;
        }
    }
});

watch(() => scheduleForm.value.tanggalRapatTo, (newDate) => {
    if (newDate) {
    }
});

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(() => {
    // Get parameters from route
    roleParam.value = route.query.role || null;
    jenisRapatParam.value = route.query.jenisRapat || '4';
    tahunParam.value = route.query.tahun || new Date().getFullYear();
    
    // Initialize form with year from route parameter or current year
    scheduleForm.value.tahun = tahunParam.value ? parseInt(tahunParam.value) : new Date().getFullYear();
    scheduleForm.value.kodeJenisRapat = jenisRapatParam.value || '4';
    
    // Set default end time (1 hour after start time)
    setDefaultEndTime();
    
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            Tambah Jadwal Rapat RUPS LPT
        </div>
        
        <!-- User Information -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ authStore.role || 'User' }}
                    <span v-if="tahunParam" class="ml-4">
                        | <strong>Tahun:</strong> {{ tahunParam }}
                    </span>
                </span>
            </div>
        </div>

        <!-- Form Card -->
        <Card>
            <template #content>
                <div class="space-y-6">
                    <div class="text-center mb-6">
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">
                            <i class="pi pi-calendar mr-2"></i>
                            Mengisi Jadwal Rapat
                        </h3>
                        <p class="text-sm text-gray-600">Lengkapi informasi jadwal rapat RUPS LPT</p>
                    </div>

                    <div class="grid grid-cols-12 gap-4">
                        <!-- Left Column -->
                        <div class="col-span-12 lg:col-span-6 space-y-4">
                            <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-700 self-center">
                                    Agenda Rapat <span class="text-red-500">*</span>
                                </label>
                                <div class="col-span-8">
                                    <InputText 
                                        v-model="scheduleForm.agenda"
                                        placeholder="Masukkan agenda rapat"
                                        class="w-full"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-700 self-center">
                                    Waktu Mulai <span class="text-red-500">*</span>
                                </label>
                                <div class="col-span-8">
                                    <Calendar
                                        v-model="scheduleForm.tanggalRapatFrom"
                                        placeholder="Pilih waktu mulai rapat"
                                        class="w-full"
                                        :showIcon="true"
                                        dateFormat="dd/mm/yy"
                                        :showTime="true"
                                        hourFormat="24"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-700 self-center">
                                    Waktu Selesai <span class="text-red-500">*</span>
                                </label>
                                <div class="col-span-8">
                                    <Calendar
                                        v-model="scheduleForm.tanggalRapatTo"
                                        placeholder="Pilih waktu selesai rapat"
                                        class="w-full"
                                        :showIcon="true"
                                        dateFormat="dd/mm/yy"
                                        :showTime="true"
                                        hourFormat="24"
                                    />
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-700 self-center">
                                    Model Rapat <span class="text-red-500">*</span>
                                </label>
                                <div class="col-span-8">
                                    <div class="flex gap-6">
                                        <div class="flex items-center">
                                            <RadioButton 
                                                v-model="scheduleForm.modelRapat" 
                                                inputId="offline" 
                                                name="modelRapat" 
                                                value="Offline"
                                            />
                                            <label for="offline" class="ml-2">Offline</label>
                                        </div>
                                        <div class="flex items-center">
                                            <RadioButton 
                                                v-model="scheduleForm.modelRapat" 
                                                inputId="online" 
                                                name="modelRapat" 
                                                value="Online"
                                            />
                                            <label for="online" class="ml-2">Online</label>
                                        </div>
                                        <div class="flex items-center">
                                            <RadioButton 
                                                v-model="scheduleForm.modelRapat" 
                                                inputId="hybrid" 
                                                name="modelRapat" 
                                                value="Hybrid"
                                            />
                                            <label for="hybrid" class="ml-2">Hybrid</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-700 self-center">
                                    Lokasi Rapat <span class="text-red-500">*</span>
                                </label>
                                <div class="col-span-8">
                                    <InputText 
                                        v-model="scheduleForm.lokasi"
                                        placeholder="Masukkan lokasi rapat"
                                        class="w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <!-- Right Column -->
                        <div class="col-span-12 lg:col-span-6 space-y-4">
                            <div class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-500 self-center">
                                    Durasi Rapat
                                </label>
                                <div class="col-span-8">
                                    <InputText 
                                        :value="formattedDuration || 'Pilih waktu mulai dan selesai terlebih dahulu'"
                                        class="w-full"
                                        readonly
                                        :class="{ 'text-gray-400': !formattedDuration }"
                                    />
                                </div>
                            </div>

                            <!-- Link Meeting - only show for Online/Hybrid -->
                            <div v-if="scheduleForm.modelRapat === 'Online' || scheduleForm.modelRapat === 'Hybrid'" class="grid grid-cols-12 gap-2">
                                <label class="col-span-4 font-bold text-gray-700 self-center">
                                    Link Meeting <span class="text-red-500">*</span>
                                </label>
                                <div class="col-span-8">
                                    <InputText 
                                        v-model="scheduleForm.linkMeeting"
                                        placeholder="Masukkan link meeting"
                                        class="w-full"
                                        type="url"
                                    />
                                </div>
                            </div>

                            <!-- Tahun field hidden - automatically set from parameter -->
                            <div class="hidden">
                                <InputNumber 
                                    v-model="scheduleForm.tahun"
                                    :min="2020"
                                    :max="2030"
                                />
                            </div>
                        </div>
                    </div>

                    <!-- Description -->
                    <div class="grid grid-cols-12 gap-2">
                        <label class="col-span-2 font-bold text-gray-700">
                            Deskripsi Rapat <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-10">
                            <Textarea
                                v-model="scheduleForm.deskripsi"
                                placeholder="Masukkan deskripsi rapat"
                                class="w-full"
                                rows="4"
                            />
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end gap-2 pt-6">
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            severity="secondary"
                            @click="onClickCancel"
                        />
                        <Button
                            label="Simpan Jadwal Rapat"
                            icon="pi pi-save"
                            severity="success"
                            :loading="isLoading"
                            @click="saveSchedule"
                            class="px-8"
                        />
                    </div>
                </div>
            </template>
        </Card>
    </div>
    
    <!-- Global Components -->
    <Toast />
    <ConfirmDialog />
</template>

<style scoped lang="scss">
// Custom styles
.space-y-6 > * + * {
    margin-top: 1.5rem;
}

.space-y-4 > * + * {
    margin-top: 1rem;
}

// Form styling
:deep(.p-inputtext),
:deep(.p-inputnumber),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-textarea) {
    width: 100%;
}
</style>

