<script setup>
// Vue Composition API
import { onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// Stores
import { useAuth } from '@/stores';

// PrimeVue Composables
import { useToast } from 'primevue/usetoast';

// PrimeVue Components
import Button from 'primevue/button';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import RadioButton from 'primevue/radiobutton';
import DatePicker from 'primevue/datepicker';
import Select from 'primevue/select';
import Toast from 'primevue/toast';

// Services
import KepdirSirkulerService from '../service/KepdirSirkuler.js';

// ==========================================
// COMPOSABLES & STORES
// ==========================================
const toast = useToast();
const router = useRouter();
const route = useRoute();
const authStore = useAuth();

// ==========================================
// REACTIVE DATA
// ==========================================
const isLoading = ref(false);
const selectedFile = ref(null);
const agendaRapatOptions = ref([]);

// Get year parameter from route
const tahunParam = ref(route.query.tahun || new Date().getFullYear());

// Mode kajian data
const isKajianMode = ref(route.query.mode === 'kajian');
const kepdirId = ref(route.query.id || '');
const agenda = ref(route.query.agenda || '');
const statusDecision = ref(route.query.statusDecision || '');
const jenisRapatId = ref(route.query.jenisRapatId || '');
const jenisRapat = ref(route.query.jenisRapat || '');
const role = ref(route.query.role || '');

// Kajian files data
const kajianFiles = ref([
    { id: 'draft-kepdir', label: 'Draft Kepdir', type: 'DRAFT_KEPDIR', file: null, required: true },
    { id: 'kajian-kelayakan', label: 'Kajian Kelayakan Proyek', type: 'KKP', file: null, required: true },
    { id: 'kajian-risiko', label: 'Kajian Risiko', type: 'KR', file: null, required: true },
    { id: 'kajian-rfa', label: 'Kajian RFA', type: 'FRA', file: null, required: true }
]);

// Form Data
const kepdirForm = ref({
    jenisInput: 'berdasarkan-agenda',
    jadwalRapatId: '',           // UUID dari jadwal rapat
    judul: '',                   // Judul kepdir (sesuai API)
    tanggalTerbit: new Date(),
    tahun: parseInt(tahunParam.value),
    uploadFileType: 'DRAFT_KEPDIR',  // Sesuai API
    file: null
});

// Kajian form data
const kajianForm = ref({
    judul: 'Mau Rapat RW sama pak RW', // Default value from image
    tanggalTerbit: new Date(),
    tambahJenisFile: 'DRAFT_KEPDIR'
});

// ==========================================
// COMPUTED PROPERTIES
// ==========================================
const showAgendaRapat = computed(() => {
    return kepdirForm.value.jenisInput === 'berdasarkan-agenda';
});

// ==========================================
// DATA LOADING FUNCTIONS
// ==========================================
const loadAgendaRapat = async () => {
    try {
        console.log('Loading agenda rapat dropdown...');
        const response = await KepdirSirkulerService.getAgendaRapatDropdown();
        console.log('Agenda rapat API response:', response);
        
        if (response.data && response.data.code === 200) {
            agendaRapatOptions.value = response.data.data.map(item => ({
                label: item.value,
                value: item.id
            }));
            console.log('Agenda rapat options loaded:', agendaRapatOptions.value);
        } else {
            console.log('No data returned or code !== 200');
            agendaRapatOptions.value = [];
        }
    } catch (error) {
        console.error('Error loading agenda rapat:', error);
        
        // Fallback to dummy data if API fails
        agendaRapatOptions.value = [
            { label: 'Rapat Direksi Januari 2025', value: 'dummy-1' },
            { label: 'Rapat Direksi Februari 2025', value: 'dummy-2' },
            { label: 'Rapat Direksi Maret 2025', value: 'dummy-3' }
        ];
        
        toast.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Gagal memuat data agenda rapat, menggunakan data dummy',
            life: 3000
        });
    }
};

// ==========================================
// FILE HANDLING
// ==========================================
const fileInput = ref(null);

const handleFileChoose = () => {
    fileInput.value.click();
};

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (file.type !== 'application/pdf') {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'File harus berformat PDF',
                life: 3000
            });
            return;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10000000) {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ukuran file maksimal 10MB',
                life: 3000
            });
            return;
        }
        
        selectedFile.value = file;
        kepdirForm.value.file = file;
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `File ${file.name} berhasil dipilih`,
            life: 3000
        });
    }
};

// Kajian file handling
const handleKajianFileChoose = (kajianItem) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'File harus berformat PDF',
                    life: 3000
                });
                return;
            }
            
            // Validate file size (max 10MB)
            if (file.size > 10000000) {
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Ukuran file maksimal 10MB',
                    life: 3000
                });
                return;
            }
            
            kajianItem.file = file;
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: `File ${file.name} berhasil dipilih`,
                life: 3000
            });
        }
    };
    input.click();
};

const removeKajianFile = (kajianItem) => {
    kajianItem.file = null;
    toast.add({
        severity: 'info',
        summary: 'Info',
        detail: 'File telah dihapus',
        life: 3000
    });
};

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
const validateForm = () => {
    const { judul, tanggalTerbit, jenisInput, jadwalRapatId } = kepdirForm.value;
    
    if (!judul.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Judul Kepdir Sirkuler harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!tanggalTerbit) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Tanggal Terbit harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (jenisInput === 'berdasarkan-agenda' && !jadwalRapatId) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Agenda Rapat harus dipilih',
            life: 3000
        });
        return false;
    }
    
    if (!selectedFile.value) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Draft Kepdir harus dipilih',
            life: 3000
        });
        return false;
    }
    
    return true;
};

const validateKajianForm = () => {
    const { judul, tanggalTerbit } = kajianForm.value;
    
    if (!judul.trim()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Judul Kepdir Sirkuler harus diisi',
            life: 3000
        });
        return false;
    }
    
    if (!tanggalTerbit) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Tanggal Terbit Kepdir Sirkuler harus diisi',
            life: 3000
        });
        return false;
    }
    
    // Check if all required files are uploaded
    const missingFiles = kajianFiles.value.filter(item => item.required && !item.file);
    if (missingFiles.length > 0) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: `File ${missingFiles.map(f => f.label).join(', ')} harus diupload`,
            life: 3000
        });
        return false;
    }
    
    return true;
};

// ==========================================
// SUBMIT FUNCTIONS
// ==========================================
const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }
    
    isLoading.value = true;
    
    try {
        // Prepare data for API sesuai dengan dokumentasi
        const submitData = {
            jadwalRapatId: kepdirForm.value.jenisInput === 'berdasarkan-agenda' ? kepdirForm.value.jadwalRapatId : null,
            judul: kepdirForm.value.judul,
            tanggalTerbit: new Date(kepdirForm.value.tanggalTerbit).toISOString().slice(0, 19),
            tahun: kepdirForm.value.tahun,
            uploadFileType: kepdirForm.value.uploadFileType,
            file: selectedFile.value
        };
        
        console.log('Submit data prepared:', submitData);
        
        // Call the API menggunakan method addKepdir
        const response = await KepdirSirkulerService.addKepdir(submitData);
        
        if (response.data && response.data.code === 200) {
            toast.add({
                severity: 'success',
                summary: 'Berhasil',
                detail: 'Kepdir Sirkuler berhasil disimpan!',
                life: 3000
            });
            
            // Navigate back to list with year parameter
            setTimeout(() => {
                router.push(`/transaction/rapat-kepdir-sirkular/${tahunParam.value}`);
            }, 1000);
        }
        
    } catch (error) {
        console.error('Error saving Kepdir Sirkuler:', error);
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const handleKajianSubmit = async () => {
    if (!validateKajianForm()) {
        return;
    }
    
    isLoading.value = true;
    
    try {
        // Upload each file using the uploadKajianRapat endpoint
        for (const kajianItem of kajianFiles.value) {
            if (kajianItem.file) {
                console.log(`Uploading ${kajianItem.label}...`);
                
                const response = await KepdirSirkulerService.uploadKajianRapat({
                    kepdirId: kepdirId.value,
                    uploadFileType: kajianItem.type,
                    file: kajianItem.file
                });
                
                if (response.data && response.data.code === 200) {
                    console.log(`${kajianItem.label} uploaded successfully`);
                } else {
                    throw new Error(`Failed to upload ${kajianItem.label}`);
                }
            }
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Semua file kajian berhasil diupload!',
            life: 3000
        });
        
        // Navigate back to list
        setTimeout(() => {
            router.push(`/transaction/rapat-kepdir-sirkular/${tahunParam.value}`);
        }, 1000);
        
    } catch (error) {
        console.error('Error uploading kajian files:', error);
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: error.response?.data?.message || 'Terjadi kesalahan saat mengupload file kajian',
            life: 3000
        });
    } finally {
        isLoading.value = false;
    }
};

const handleCancel = () => {
    router.push(`/transaction/rapat-kepdir-sirkular/${tahunParam.value}`);
};

// ==========================================
// LIFECYCLE HOOKS
// ==========================================
onMounted(async () => {
    await loadAgendaRapat();
});
</script>

<template>
    <div>
        <!-- Page Header -->
        <div class="font-semibold text-xl mb-4">
            {{ isKajianMode ? 'AddKepdir' : 'Pengajuan Kepdir Sirkuler' }}
            <span v-if="tahunParam" class="text-lg text-gray-600 ml-2">
                - Tahun {{ tahunParam }}
            </span>
        </div>

        <!-- User Information -->
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ authStore.role || 'N/A' }}
                </span>
            </div>
        </div>

        <!-- Form Card -->
        <Card>
            <template #content>
                <!-- Normal Mode Form -->
                <form v-if="!isKajianMode" @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Jenis Input Kepdir -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Jenis Input Kepdir <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <div class="flex gap-6">
                                <div class="flex items-center">
                                    <RadioButton 
                                        v-model="kepdirForm.jenisInput" 
                                        inputId="berdasarkan-agenda" 
                                        name="jenisInput" 
                                        value="berdasarkan-agenda"
                                        :disabled="isLoading"
                                    />
                                    <label for="berdasarkan-agenda" class="ml-2">Berdasarkan Agenda Rapat</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton 
                                        v-model="kepdirForm.jenisInput" 
                                        inputId="tanpa-agenda" 
                                        name="jenisInput" 
                                        value="tanpa-agenda"
                                        :disabled="isLoading"
                                    />
                                    <label for="tanpa-agenda" class="ml-2">Tanpa Agenda Rapat</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Agenda Rapat -->
                    <div v-if="showAgendaRapat" class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Agenda Rapat <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <Select
                                v-model="kepdirForm.jadwalRapatId"
                                :options="agendaRapatOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Pilih Agenda Rapat"
                                class="w-full"
                                :disabled="isLoading"
                            />
                        </div>
                    </div>

                    <!-- Judul Kepdir Sirkuler -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Judul Kepdir Sirkuler <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <InputText
                                v-model="kepdirForm.judul"
                                placeholder="Masukkan Judul Kepdir Sirkuler"
                                class="w-full"
                                :disabled="isLoading"
                            />
                        </div>
                    </div>

                    <!-- Draft Kepdir -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Draft Kepdir <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <div class="flex gap-2">
                                <InputText
                                    :value="selectedFile ? selectedFile.name : ''"
                                    placeholder="Pilih Draft Kepdir (PDF)"
                                    readonly
                                    class="flex-1"
                                    :disabled="isLoading"
                                />
                                <input
                                    ref="fileInput"
                                    type="file"
                                    style="display: none"
                                    @change="handleFileSelect"
                                    accept=".pdf"
                                />
                                <Button
                                    label="Choose File"
                                    icon="pi pi-upload"
                                    @click="handleFileChoose"
                                    :disabled="isLoading"
                                    severity="secondary"
                                />
                            </div>
                            <small v-if="selectedFile" class="text-gray-600 mt-2 block">
                                <i class="pi pi-check-circle text-green-600"></i>
                                File terpilih: {{ selectedFile.name }} ({{ (selectedFile.size / 1024 / 1024).toFixed(2) }} MB)
                            </small>
                        </div>
                    </div>

                    <!-- Tanggal Terbit -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Tanggal Terbit <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <DatePicker
                                v-model="kepdirForm.tanggalTerbit"
                                dateFormat="dd/mm/yy"
                                placeholder="Pilih Tanggal Terbit"
                                showIcon
                                class="w-full"
                                :disabled="isLoading"
                            />
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            severity="secondary"
                            @click="handleCancel"
                            :disabled="isLoading"
                        />
                        <Button
                            label="Simpan"
                            icon="pi pi-save"
                            type="submit"
                            :loading="isLoading"
                        />
                    </div>
                </form>

                <!-- Kajian Mode Form -->
                <form v-else @submit.prevent="handleKajianSubmit" class="space-y-6">
                    <!-- Judul Kepdir Sirkuler -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Judul Kepdir Sirkuler <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <InputText
                                v-model="kajianForm.judul"
                                placeholder="Masukkan Judul Kepdir Sirkuler"
                                class="w-full"
                                :disabled="isLoading"
                            />
                        </div>
                    </div>

                    <!-- Tanggal Terbit Kepdir Sirkuler -->
                    <div class="grid grid-cols-12 gap-4">
                        <label class="col-span-12 md:col-span-3 font-bold text-gray-700 self-center">
                            Tanggal Terbit Kepdir Sirkuler <span class="text-red-500">*</span>
                        </label>
                        <div class="col-span-12 md:col-span-9">
                            <DatePicker
                                v-model="kajianForm.tanggalTerbit"
                                dateFormat="dd/mm/yy"
                                placeholder="Calendar"
                                showIcon
                                class="w-full"
                                :disabled="isLoading"
                            />
                        </div>
                    </div>

                    <!-- Tambah Jenis File -->
                    <div class="flex justify-end gap-4 mb-6">
                        <div class="flex items-center gap-2">
                            <label class="font-bold text-gray-700">Tambah Jenis File</label>
                            <Select
                                v-model="kajianForm.tambahJenisFile"
                                :options="[
                                    { label: 'Draft Kepdir', value: 'DRAFT_KEPDIR' },
                                    { label: 'Kajian Kelayakan Proyek', value: 'KKP' },
                                    { label: 'Kajian Risiko', value: 'KR' },
                                    { label: 'Kajian RFA', value: 'FRA' }
                                ]"
                                optionLabel="label"
                                optionValue="value"
                                class="w-48"
                                :disabled="isLoading"
                            />
                            <Button
                                label="Add File"
                                icon="pi pi-plus"
                                severity="secondary"
                                size="small"
                                :disabled="isLoading"
                            />
                        </div>
                    </div>

                    <!-- Kajian Files -->
                    <div class="space-y-4">
                        <div v-for="kajianItem in kajianFiles" :key="kajianItem.id" class="border border-gray-200 rounded-lg p-4">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <Button
                                        icon="pi pi-trash"
                                        severity="danger"
                                        text
                                        size="small"
                                        @click="removeKajianFile(kajianItem)"
                                        :disabled="isLoading"
                                    />
                                    <label class="font-bold text-gray-700">
                                        {{ kajianItem.label }} <span class="text-red-500">*</span>
                                    </label>
                                </div>
                                <div class="flex items-center gap-2">
                                    <InputText
                                        :value="kajianItem.file ? kajianItem.file.name : kajianItem.label"
                                        readonly
                                        class="w-48"
                                        :disabled="isLoading"
                                    />
                                    <Button
                                        label="+ Choose"
                                        icon="pi pi-upload"
                                        severity="secondary"
                                        size="small"
                                        @click="handleKajianFileChoose(kajianItem)"
                                        :disabled="isLoading"
                                    />
                                </div>
                            </div>
                            <small v-if="kajianItem.file" class="text-gray-600 mt-2 block">
                                <i class="pi pi-check-circle text-green-600"></i>
                                File terpilih: {{ kajianItem.file.name }} ({{ (kajianItem.file.size / 1024 / 1024).toFixed(2) }} MB)
                            </small>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            severity="secondary"
                            @click="handleCancel"
                            :disabled="isLoading"
                        />
                        <Button
                            label="Save"
                            icon="pi pi-save"
                            type="submit"
                            :loading="isLoading"
                        />
                    </div>
                </form>
            </template>
        </Card>
    </div>

    <!-- Toast Component -->
    <Toast />
</template>

<style scoped lang="scss">
// Custom styles for the form
.space-y-6 > * + * {
    margin-top: 1.5rem;
}

// Grid styling
.grid {
    display: grid;
}

.grid-cols-12 {
    grid-template-columns: repeat(12, minmax(0, 1fr));
}

.col-span-12 {
    grid-column: span 12 / span 12;
}

@media (min-width: 768px) {
    .md\:col-span-3 {
        grid-column: span 3 / span 3;
    }
    
    .md\:col-span-9 {
        grid-column: span 9 / span 9;
    }
}

// Card styling
:deep(.p-card) {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.p-card-content) {
    padding: 2rem;
}
</style>
