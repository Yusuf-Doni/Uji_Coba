<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';

const toast = useToast();
const router = useRouter();

// Form data
const formData = ref({
    namaJadwal: null,
    namaAgenda: null,
    picTindaklanjut: '',
    approval: null
});

// Loading states
const loading = ref(false);
const isLoadingJadwal = ref(false);
const isLoadingAgenda = ref(false);

// Modal states
const showApprovalModal = ref(false);
const showTindaklanjutModal = ref(false);
const showRejectModal = ref(false);
const approvalType = ref(null); // 'approve' or 'reject'

// Reject form data
const rejectReason = ref('');
const rejectReasonError = ref('');

// Tindaklanjut form data
const tindaklanjutForm = ref({
    actionPlan: '',
    progress: null,
    deskripsi: '',
    status: null,
    materi: null
});

// Tindaklanjut validation errors
const tindaklanjutErrors = ref({});

// Status options for tindaklanjut
const statusOptions = ref([
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Status Berkelanjutan', value: 'continuous' },
    { label: 'Selesai', value: 'completed' }
]);

// Search functionality
const searchQuery = ref('');

// Dummy data for dropdowns
const jadwalOptions = ref([
    { id: 1, name: 'Jadwal Rapat Koordinasi Bulanan' },
    { id: 2, name: 'Jadwal Evaluasi Proyek Q4' },
    { id: 3, name: 'Jadwal Budget Planning 2024' },
    { id: 4, name: 'Jadwal Strategi Digitalisasi' },
    { id: 5, name: 'Jadwal Review KPI 2023' }
]);

const agendaOptions = ref([
    { id: 1, name: 'Review kinerja bulanan dan perencanaan bulan depan' },
    { id: 2, name: 'Evaluasi hasil proyek Q4 dan lesson learned' },
    { id: 3, name: 'Perencanaan budget tahun 2024' },
    { id: 4, name: 'Diskusi strategi digitalisasi perusahaan' },
    { id: 5, name: 'Review pencapaian KPI tahun 2023' }
]);

// Validation
const errors = ref({});

const validateForm = () => {
    errors.value = {};
    
    if (!formData.value.namaJadwal) {
        errors.value.namaJadwal = 'Nama Jadwal harus diisi';
    }
    
    if (!formData.value.namaAgenda) {
        errors.value.namaAgenda = 'Nama Agenda harus diisi';
    }
    
    if (!formData.value.picTindaklanjut) {
        errors.value.picTindaklanjut = 'PIC Tindaklanjut harus diisi';
    }
    
    if (formData.value.approval === null) {
        errors.value.approval = 'Approval harus dipilih';
    }
    
    return Object.keys(errors.value).length === 0;
};

// Function to validate tindaklanjut form
const validateTindaklanjutForm = () => {
    tindaklanjutErrors.value = {};
    
    if (!tindaklanjutForm.value.actionPlan.trim()) {
        tindaklanjutErrors.value.actionPlan = 'Action Plan Tindaklanjut harus diisi';
    }
    
    if (tindaklanjutForm.value.progress === null || tindaklanjutForm.value.progress === '') {
        tindaklanjutErrors.value.progress = 'Progress Tindaklanjut harus diisi';
    } else if (tindaklanjutForm.value.progress < 0 || tindaklanjutForm.value.progress > 100) {
        tindaklanjutErrors.value.progress = 'Progress harus antara 0-100%';
    }
    
    if (!tindaklanjutForm.value.deskripsi.trim()) {
        tindaklanjutErrors.value.deskripsi = 'Deskripsi Tindaklanjut harus diisi';
    }
    
    if (!tindaklanjutForm.value.materi) {
        tindaklanjutErrors.value.materi = 'Materi Tindaklanjut harus dipilih';
    }
    
    return Object.keys(tindaklanjutErrors.value).length === 0;
};

const handleSave = async () => {
    if (!validateForm()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Mohon lengkapi semua field yang wajib diisi',
            life: 3000
        });
        return;
    }
    
    loading.value = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Data approval berhasil disimpan',
            life: 3000
        });
        
        // Reset form or redirect
        resetForm();
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Terjadi kesalahan saat menyimpan data',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

const resetForm = () => {
    formData.value = {
        namaJadwal: null,
        namaAgenda: null,
        picTindaklanjut: '',
        approval: null
    };
    errors.value = {};
};

// Function to reset tindaklanjut form
const resetTindaklanjutForm = () => {
    tindaklanjutForm.value = {
        actionPlan: '',
        progress: null,
        deskripsi: '',
        status: null,
        materi: null
    };
    tindaklanjutErrors.value = {};
};

// Function to handle tindaklanjut form submission
const handleTindaklanjutSave = async () => {
    if (!validateTindaklanjutForm()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Mohon lengkapi semua field yang wajib diisi',
            life: 3000
        });
        return;
    }
    
    loading.value = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: 'Data tindaklanjut berhasil disimpan',
            life: 3000
        });
        
        // Close modal and reset form
        showTindaklanjutModal.value = false;
        resetTindaklanjutForm();
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Terjadi kesalahan saat menyimpan data',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Function to handle file selection
const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        tindaklanjutForm.value.materi = file;
    }
};

// Function to open tindaklanjut modal
const openTindaklanjutModal = () => {
    showTindaklanjutModal.value = true;
};

// Function to close tindaklanjut modal
const closeTindaklanjutModal = () => {
    showTindaklanjutModal.value = false;
    resetTindaklanjutForm();
};

const handleApprovalChange = (value) => {
    formData.value.approval = value;
};

// Function to handle button clicks for approval
const handleApprovalButton = (value) => {
    formData.value.approval = value;
    approvalType.value = value === true ? 'approve' : 'reject';
    showApprovalModal.value = true;
};

// Function to handle reject change
const handleRejectChange = (value) => {
    formData.value.approval = value;
};

// Function to handle reject button
const handleRejectButton = (value) => {
    formData.value.approval = value;
    approvalType.value = value === true ? 'approve' : 'reject';
    showRejectModal.value = true;
};

// Function to confirm approval
const confirmApproval = async () => {
    showApprovalModal.value = false;
    showRejectModal.value = false;
    
    // Show toast notification
    const message = approvalType.value === 'approve' 
        ? 'Menyetujui tindaklanjut dan redirecting...' 
        : 'Menolak tindaklanjut dan redirecting...';
    
    toast.add({
        severity: approvalType.value === 'approve' ? 'success' : 'warn',
        summary: approvalType.value === 'approve' ? 'Disetujui' : 'Ditolak',
        detail: message,
        life: 2000
    });
    
    // Redirect after delay
    setTimeout(() => {
        if (approvalType.value === 'approve') {
            router.push('/transaction/jadwal-rapat-korporat/approval-success');
        } else {
            router.push('/transaction/jadwal-rapat-korporat/approval-rejected');
        }
    }, 1000);
};

// Function to cancel approval
const cancelApproval = () => {
    showApprovalModal.value = false;
    showRejectModal.value = false;
    approvalType.value = null;
};

// Function to validate reject reason
const validateRejectReason = () => {
    rejectReasonError.value = '';
    
    if (!rejectReason.value.trim()) {
        rejectReasonError.value = 'Alasan Disapprove harus diisi';
        return false;
    }
    
    return true;
};

// Function to cancel reject
const cancelReject = () => {
    showRejectModal.value = false;
    rejectReason.value = '';
    rejectReasonError.value = '';
};

// Function to confirm reject
const confirmReject = async () => {
    if (!validateRejectReason()) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Mohon lengkapi alasan penolakan',
            life: 3000
        });
        return;
    }
    
    loading.value = true;
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.add({
            severity: 'warn',
            summary: 'Ditolak',
            detail: 'Tindaklanjut berhasil ditolak dengan alasan: ' + rejectReason.value,
            life: 3000
        });
        
        // Close modal and reset
        showRejectModal.value = false;
        rejectReason.value = '';
        rejectReasonError.value = '';
        
        // Redirect after delay
        setTimeout(() => {
            router.push('/transaction/jadwal-rapat-korporat/approval-rejected');
        }, 1000);
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Terjadi kesalahan saat menolak tindaklanjut',
            life: 3000
        });
    } finally {
        loading.value = false;
    }
};

// Function to handle back button
const handleBack = () => {
    // Show confirmation before going back
    toast.add({
        severity: 'info',
        summary: 'Kembali',
        detail: 'Kembali ke menu sebelumnya...',
        life: 1500
    });
    
    // Go back to previous page
    setTimeout(() => {
        router.go(-1); // Go back one step in history
        // Alternative: router.push('/transaction/jadwal-rapat-korporat'); // Go to specific route
    }, 500);
};

onMounted(() => {
    // Initialize component
});
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <!-- Header Section -->
        <div class="bg-blue-100 p-6 border-b border-blue-200">
            <div class="flex justify-between items-center">
                <div class="flex-1">
                    <h1 class="text-2xl font-bold text-gray-800 mb-4">
                        Approval PIC Tindaklanjut Radir
                    </h1>
                    <div class="relative max-w-md">
                        <span class="p-input-icon-right w-full">
                            <i class="pi pi-search" />
                            <InputText 
                                v-model="searchQuery" 
                                placeholder="Search" 
                                class="w-full"
                            />
                        </span>
                    </div>
                </div>
                <Button 
                    label="Approval" 
                    class="bg-blue-100 text-gray-800 border-blue-300 hover:bg-blue-200"
                    @click="handleSave"
                    :loading="loading"
                />
            </div>
        </div>

        <!-- Main Content Area -->
        <div class="max-w-10xl mx-auto p-9">
            <div class="bg-white rounded-lg shadow-md p-10">
                <form @submit.prevent="handleSave" class="space-y-6">
                    <!-- Nama Jadwal Field -->
                    <div class="grid grid-cols-12 gap-4 items-center">
                        <label class="col-span-3 font-bold text-gray-700">
                            Nama Jadwal <span class="text-red-600">*</span>
                        </label>
                        <div class="col-span-9">
                            <Dropdown
                                v-model="formData.namaJadwal"
                                :options="jadwalOptions"
                                optionLabel="name"
                                placeholder="Nama Jadwal"
                                class="w-full"
                                :class="{ 'p-invalid': errors.namaJadwal }"
                                :loading="isLoadingJadwal"
                            />
                            <small v-if="errors.namaJadwal" class="p-error block mt-1">
                                {{ errors.namaJadwal }}
                            </small>
                        </div>
                    </div>

                    <!-- Nama Agenda Field -->
                    <div class="grid grid-cols-12 gap-4 items-center">
                        <label class="col-span-3 font-bold text-gray-700">
                            Nama Agenda <span class="text-red-600">*</span>
                        </label>
                        <div class="col-span-9">
                            <Dropdown
                                v-model="formData.namaAgenda"
                                :options="agendaOptions"
                                optionLabel="name"
                                placeholder="Nama Agenda"
                                class="w-full"
                                :class="{ 'p-invalid': errors.namaAgenda }"
                                :loading="isLoadingAgenda"
                            />
                            <small v-if="errors.namaAgenda" class="p-error block mt-1">
                                {{ errors.namaAgenda }}
                            </small>
                        </div>
                    </div>

                    <!-- PIC Tindaklanjut Field -->
                    <div class="grid grid-cols-12 gap-4 items-center">
                        <label class="col-span-3 font-bold text-gray-700">
                            PIC Tindaklanjut <span class="text-red-600">*</span>
                        </label>
                        <div class="col-span-9">
                            <InputText
                                v-model="formData.picTindaklanjut"
                                placeholder="PIC Tindaklanjut"
                                class="w-full"
                                :class="{ 'p-invalid': errors.picTindaklanjut }"
                            />
                            <small v-if="errors.picTindaklanjut" class="p-error block mt-1">
                                {{ errors.picTindaklanjut }}
                            </small>
                        </div>
                    </div>

                                         <!-- Approval Field -->
                     <div class="grid grid-cols-12 gap-4 items-center">
                         <label class="col-span-3 font-bold text-gray-700">
                             Approval <span class="text-red-600">*</span>
                         </label>
                                                   <div class="col-span-9">
                              <div class="flex gap-6">
                                 <div class="flex items-center gap-2">
                                     <Checkbox
                                         :model-value="formData.approval === true"
                                         @change="handleApprovalChange(true)"
                                         :binary="true"
                                         :class="{ 'p-invalid': errors.approval }"
                                     />
                                     <label class="font-medium text-gray-700">Ya</label>
                                     <button 
                                         @click="handleApprovalButton(true)"
                                         class="w-16 h-8 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center cursor-pointer approval-button"
                                     >
                                         Approve
                                     </button>
                                 </div>
                                 <div class="flex items-center gap-2">
                                     <Checkbox
                                         :model-value="formData.approval === false"
                                         @change="handleRejectChange(false)"
                                         :binary="true"
                                         :class="{ 'p-invalid': errors.approval }"
                                     />
                                     <label class="font-medium text-gray-700">Tidak</label>
                                     <button 
                                         @click="handleRejectButton(false)"
                                         class="w-16 h-8 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded transition-colors duration-200 flex items-center justify-center cursor-pointer approval-button"
                                     >
                                         Reject
                                     </button>
                                 </div>
                             </div>
                             <small v-if="errors.approval" class="p-error block mt-1">
                                 {{ errors.approval }}
                             </small>
                         </div>
                     </div>

                                         <!-- Action Buttons -->
                     <div class="flex justify-between items-center pt-6">
                         <!-- Back Button -->
                         <!-- <button 
                             @click="handleBack"
                             class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 back-button"
                         >
                             <i class="pi pi-arrow-left"></i>
                             Kembali
                         </button> -->
                         
                         <!-- Tindaklanjut Button -->
                         <!-- <div class="flex gap-3">
                             <Button
                                 type="submit"
                                 label="Save"
                                 class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                                 :loading="loading"
                             />
                         </div> -->
                     </div>
                </form>
            </div>
        </div>

        <!-- Approval Confirmation Modal -->
        <Dialog 
            v-model:visible="showApprovalModal" 
            :modal="true"
            :closable="true"
            :closeOnEscape="true"
            class="w-2xl"
            header="Tindaklanjut"
        >
            <div class="p-6">
                <form @submit.prevent="handleTindaklanjutSave" class="space-y-6">
                    <!-- Action Plan Tindaklanjut -->
                    <div class="space-y-2">
                        <label class="block font-semibold text-gray-700">
                            Action Plan Tindaklanjut <span class="text-red-600">*</span>
                        </label>
                        <Textarea
                            v-model="tindaklanjutForm.actionPlan"
                            placeholder="Action Plan"
                            rows="4"
                            class="w-full"
                            :class="{ 'p-invalid': tindaklanjutErrors.actionPlan }"
                        />
                        <small v-if="tindaklanjutErrors.actionPlan" class="p-error block">
                            {{ tindaklanjutErrors.actionPlan }}
                        </small>
                    </div>

                    <!-- Progress Tindaklanjut -->
                    <div class="space-y-2">
                        <label class="block font-semibold text-gray-700">
                            Progress Tindaklanjut <span class="text-red-600">*</span>
                        </label>
                        <div class="flex items-center gap-2">
                            <InputNumber
                                v-model="tindaklanjutForm.progress"
                                placeholder="Progress Tindaklanjut"
                                :min="0"
                                :max="100"
                                class="flex-1"
                                :class="{ 'p-invalid': tindaklanjutErrors.progress }"
                            />
                            <span class="text-gray-600 font-medium">%</span>
                        </div>
                        <small v-if="tindaklanjutErrors.progress" class="p-error block">
                            {{ tindaklanjutErrors.progress }}
                        </small>
                    </div>

                    <!-- Deskripsi Tindaklanjut -->
                    <div class="space-y-2">
                        <label class="block font-semibold text-gray-700">
                            Deskripsi Tindaklanjut <span class="text-red-600">*</span>
                        </label>
                        <Textarea
                            v-model="tindaklanjutForm.deskripsi"
                            placeholder="Deskripsi Tindaklanjut"
                            rows="4"
                            class="w-full"
                            :class="{ 'p-invalid': tindaklanjutErrors.deskripsi }"
                        />
                        <small v-if="tindaklanjutErrors.deskripsi" class="p-error block">
                            {{ tindaklanjutErrors.deskripsi }}
                        </small>
                    </div>

                    <!-- Status Tindaklanjut -->
                    <div class="space-y-2">
                        <label class="block font-semibold text-gray-700">
                            Status Tindaklanjut
                        </label>
                        <Dropdown
                            v-model="tindaklanjutForm.status"
                            :options="statusOptions"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Pilih Status"
                            class="w-full"
                        />
                    </div>

                    <!-- Materi Tindaklanjut -->
                    <div class="space-y-2">
                        <label class="block font-semibold text-gray-700">
                            Materi Tindaklanjut <span class="text-red-600">*</span>
                        </label>
                        <div class="flex items-center gap-3">
                            <input
                                type="file"
                                @change="handleFileSelect"
                                class="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                :class="{ 'border-red-500': tindaklanjutErrors.materi }"
                            />
                            <Button
                                label="Browse File"
                                class="bg-gray-500 hover:bg-gray-600 text-white"
                                severity="secondary"
                                @click="$refs.fileInput?.click()"
                            />
                        </div>
                        <small v-if="tindaklanjutErrors.materi" class="p-error block">
                            {{ tindaklanjutErrors.materi }}
                        </small>
                        <small v-if="tindaklanjutForm.materi" class="text-green-600 block">
                            File dipilih: {{ tindaklanjutForm.materi.name }}
                        </small>
                    </div>
                </form>
            </div>
            
            <template #footer>
                <div class="flex justify-end gap-3">
                    <Button 
                        label="Batal" 
                        @click="closeTindaklanjutModal"
                        class="bg-gray-500 hover:bg-gray-600 text-white"
                        severity="secondary"
                    />
                    <Button 
                        label="Save"
                        @click="handleTindaklanjutSave"
                        class="bg-blue-600 hover:bg-blue-700 text-white"
                        :loading="loading"
                    />
                </div>
            </template>
        </Dialog>

        <!-- Reject Modal -->
        <Dialog 
            v-model:visible="showRejectModal" 
            :modal="true"
            :closable="true"
            :closeOnEscape="true"
            class="w-2xl"
            header="Konfirmasi Penolakan"
        >
            <div class="p-6">
                <div class="space-y-4">
                    <!-- <div class="text-center mb-6">
                        <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">
                            Konfirmasi Penolakan
                        </h3>
                        <p class="text-gray-600">
                            Silakan berikan alasan penolakan untuk tindaklanjut ini.
                        </p>
                    </div> -->
                    
                    <!-- Alasan Disapprove Field -->
                    <div class="space-y-2">
                        <label class="block font-semibold text-gray-700">
                            Alasan Disapprove <span class="text-red-600">*</span>
                        </label>
                        <Textarea
                            v-model="rejectReason"
                            placeholder="Alasan Disapprove"
                            rows="6"
                            class="w-full"
                            :class="{ 'p-invalid': rejectReasonError }"
                        />
                        <small v-if="rejectReasonError" class="p-error block">
                            {{ rejectReasonError }}
                        </small>
                    </div>
                </div>
            </div>
            
            <template #footer>
                <div class="flex justify-end gap-3">
                    <Button 
                        label="Batal" 
                        @click="cancelReject"
                        class="bg-gray-500 hover:bg-gray-600 text-white"
                        severity="secondary"
                    />
                    <Button 
                        label="Save"
                        @click="confirmReject"
                        class="bg-blue-600 hover:bg-blue-700 text-white"
                        :loading="loading"
                    />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<style scoped>
.p-input-icon-right {
    position: relative;
}

.p-input-icon-right .pi {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6b7280;
}

.p-dropdown, .p-inputtext {
    width: 100%;
}

.p-checkbox {
    margin-right: 0.5rem;
}

/* Custom styling for approval buttons */
.approval-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.approval-indicator {
    width: 1rem;
    height: 1.5rem;
    border-radius: 0.25rem;
}

/* Custom button styling */
.approval-button {
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.approval-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.approval-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Back button styling */
.back-button {
    transition: all 0.2s ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.back-button:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Modal styling */
:deep(.p-dialog) {
    border-radius: 0.5rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

:deep(.p-dialog-header) {
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    border-radius: 0.5rem 0.5rem 0 0;
}

:deep(.p-dialog-content) {
    padding: 0;
}

:deep(.p-dialog-footer) {
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    border-radius: 0 0 0.5rem 0.5rem;
    padding: 1rem;
}
</style>
