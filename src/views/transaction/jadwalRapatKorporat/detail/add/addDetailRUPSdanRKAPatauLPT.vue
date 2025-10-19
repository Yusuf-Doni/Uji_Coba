<script setup>
import RoleService from '@/service/RoleService';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { onBeforeMount, ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { object, string } from 'yup';
import { useAuth } from '@/stores/authStore';

const isLoadingSave = ref(false);
const isLoadingApprove = ref(false);
const isLoadingReject = ref(false);
const formUmumRef = ref();
const confirmSave = useConfirm();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuth();
const activeTab = ref(0);
const isApproved = ref(false);

const Role1 = computed(() => {
    return authStore.role === '1';
});

const Role2 = computed(() => {
    return authStore.role === '2';
});

// Tab configuration
const tabs = computed(() => {
    const availableTabs = [
        { label: 'Add', value: 'add', icon: 'pi pi-plus' },
        { label: 'Detail', value: 'detail', icon: 'pi pi-eye' }
    ];
    
    // Filter tabs based on mode - each tab can only be accessed with its corresponding mode
    return availableTabs.filter(tab => {
        switch (tab.value) {
            case 'add':
                // Tab Add hanya bisa diakses dengan mode 'add'
                return queryParams.value.mode === 'add';
            
            case 'detail':
                // Tab Detail bisa diakses dengan mode 'detail' atau 'add' (untuk melihat data yang sudah diisi)
                return queryParams.value.mode === 'detail' || queryParams.value.mode === 'add';
            
            default:
                return false;
        }
    });
});

const currentMode = computed(() => {
    return tabs.value[activeTab.value]?.value || 'add';
});


const queryParams = ref({
    id: '',
    judulRapat: '',
    tanggal: '',
    durasi: '',
    lokasi: '',
    peserta: '',
    agenda: '',
    status: '',
    mode: '',
    flagapprove: ''
});


const fileTypeOptions = computed(() => {
    const baseOptions = [
        // { name: 'Draft Kepdir', value: 'draft_kepdir' },
        // { name: 'Kajian Kelayakan Proyek', value: 'kajian_kelayakan_proyek' },
        // { name: 'Kajian Risiko', value: 'kajian_risiko' },
        { name: 'Attachment Rapat', value: 'attachment_rapat' }
    ];
    
    // Add Form Review Governance when flagapprove is 'done'
    if (queryParams.value.flagapprove === 'done') {
        baseOptions.push({ name: 'Arahan Rapat', value: 'arahan_rapat' });
    }
    
    return baseOptions;
});


const selectedFileType = ref('');
const uploadedFiles = ref([]);

// Form State
const arahanRapat = ref('');
const selectedPIC = ref('');
const picOptions = ref([
    { name: 'John Doe', value: 'john_doe' },
    { name: 'Jane Smith', value: 'jane_smith' },
    { name: 'Ahmad Rahman', value: 'ahmad_rahman' }
]);

// Form data state for Detail view
const formData = ref({
    judulKepdir: '',
    tanggalTerbit: '',
    arahanRapat: '',
    selectedPIC: ''
});

const resolver = computed(() => {
    const baseSchema = {
        judulKepdir: string().required('Judul Kepdir Sirkuler harus diisi'),
        tanggalTerbit: string().required('Tanggal Terbit Kepdir Sirkuler harus diisi'),
        arahanRapat: string().required('Arahan rapat harus diisi'),
        selectedPIC: string().required('PIC harus dipilih')
    };

    return yupResolver(object().shape(baseSchema));
});


const addFileType = () => {
    if (selectedFileType.value && !uploadedFiles.value.find(file => file.type === selectedFileType.value)) {
        const fileType = fileTypeOptions.value.find(option => option.value === selectedFileType.value);
        uploadedFiles.value.push({
            type: selectedFileType.value,
            name: fileType.name,
            file: null,
            placeholder: getPlaceholder(selectedFileType.value)
        });
        selectedFileType.value = '';
    }
};

const removeFile = (index) => {
    uploadedFiles.value.splice(index, 1);
};

const onFileSelect = (event, index) => {
    const file = event.files[0];
    if (file) {
        uploadedFiles.value[index].file = file;
    }
};


const getPlaceholder = (type) => {
    const placeholders = {
        // 'draft_kepdir': 'Draft Kepdir',
        // 'kajian_kelayakan_proyek': 'KKP',
        // 'kajian_risiko': 'Kajian Risiko',
        // 'kajian_rfa': 'Kajian RFA',
        'attachment_rapat': 'Attachment Rapat',
        'arahan_rapat': 'Arahan Rapat'
    };
    return placeholders[type] || 'File';
};


const viewDocument = (file, index) => {
    if (file.file) {
        
        const fileUrl = URL.createObjectURL(file.file);
        window.open(fileUrl, '_blank');
        
        
        setTimeout(() => {
            URL.revokeObjectURL(fileUrl);
        }, 1000);
    } else {
        toast.add({
            severity: 'warn',
            summary: 'Peringatan',
            detail: 'File tidak tersedia untuk dilihat',
            life: 3000
        });
    }
};


const parseQueryParams = () => {
    
    queryParams.value = {
        id: route.query.id || '',
        judulRapat: route.query.judulRapat || '',
        tanggal: route.query.tanggal || '',
        durasi: route.query.durasi || '',
        lokasi: route.query.lokasi || '',
        peserta: route.query.peserta || '',
        agenda: route.query.agenda || '',
        status: route.query.status || '',
        mode: route.query.mode || '',
        flagapprove: route.query.flagapprove || ''
    };
    
    
    if (queryParams.value.tanggal && queryParams.value.tanggal.includes(' ')) {
        queryParams.value.tanggal = queryParams.value.tanggal.split(' ')[0];
    }
    
};

const onClickSubmit = () => {
    formUmumRef.value.onSubmit();
};

const onClickApprove = () => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menyetujui data ini?',
        closeable: false,
        header: 'Konfirmasi Approve',
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
            // Set approval state to true to show PIC form
            isApproved.value = true;
            approveData();
        }
    });
};

const onClickReject = () => {
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menolak data ini?',
        closeable: false,
        header: 'Konfirmasi Reject',
        acceptLabel: 'Ya',
        rejectLabel: 'Tidak',
        acceptClass: 'order-2',
        rejectClass: 'order-1',
        rejectProps: {
            severity: 'danger'
        },
        acceptProps: {
            severity: 'danger'
        },
        accept: () => {
            rejectData();
        }
    });
};

const onSubmitEvent = (data) => {
    if (data.valid) {
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
    }
};

const saveInputToService = async (data) => {
    const payload = {
        id: queryParams.value.id || null,
        judulKepdir: data.judulKepdir,
        tanggalTerbit: data.tanggalTerbit,
        // Include all query parameters
        judulRapat: queryParams.value.judulRapat,
        tanggal: queryParams.value.tanggal,
        durasi: queryParams.value.durasi,
        lokasi: queryParams.value.lokasi,
        peserta: queryParams.value.peserta,
        agenda: queryParams.value.agenda,
        status: queryParams.value.status,
        mode: currentMode.value,
        files: uploadedFiles.value.map(file => ({
            type: file.type,
            name: file.name,
            file: file.file
        })),
        // Form data
        arahanRapat: arahanRapat.value,
        selectedPIC: selectedPIC.value
    };

    isLoadingSave.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Pesan',
                    detail: response.data.message,
                    life: 3000
                });
                router.push('/transaction/jadwal-rapat-korporat');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
};



const approveData = async () => {
    const payload = {
        id: queryParams.value.id || null,
        action: 'approve',
        mode: currentMode.value
    };

    isLoadingApprove.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data berhasil disetujui',
                    life: 3000
                });
                router.push('/transaction/jadwal-rapat-korporat');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingApprove.value = false;
        });
};

const rejectData = async () => {
    const payload = {
        id: queryParams.value.id || null,
        action: 'reject',
        mode: currentMode.value
    };

    isLoadingReject.value = true;
    await RoleService.post(payload)
        .then((response) => {
            if (response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: 'Data berhasil ditolak',
                    life: 3000
                });
                router.push('/transaction/jadwal-rapat-korporat');
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data.message,
                    life: 3000
                });
            }
        })
        .catch((e) => {
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        })
        .finally(() => {
            isLoadingReject.value = false;
        });
};

// Initialize files based on current mode
const initializeFiles = () => {
    // Initialize base files for add and detail modes
    uploadedFiles.value = [
        { type: 'attachment_rapat', name: 'Attachment Rapat', file: null, placeholder: 'Attachment Rapat' }
        // { type: 'arahan_rapat', name: 'Arahan Rapat', file: null, placeholder: 'Arahan Rapat' }
    ];
    
    // Add Form Review Governance when flagapprove is 'done'
    if (queryParams.value.flagapprove === 'done') {
        uploadedFiles.value.push({ 
            type: 'arahan_rapat', 
            name: 'Arahan Rapat', 
            file: null, 
            placeholder: 'Arahan Rapat' 
        });
    }
};

// Function to load saved data
const loadSavedData = async () => {
    // In a real application, you would fetch this data from the backend
    // For now, we'll use mock data or data from query params
    if (queryParams.value.mode === 'detail') {
        try {
            // Mock data - in real implementation, fetch from API
            // const response = await RoleService.getDetail(queryParams.value.id);
            // arahanRapat.value = response.data.arahanRapat || '';
            // selectedPIC.value = response.data.selectedPIC || '';
            
            // Mock data for demonstration
            arahanRapat.value = 'Melakukan review dokumen keuangan Q1 dan menyiapkan laporan operasional bulanan';
            selectedPIC.value = 'john_doe';
            
            // Update form data for detail view
            formData.value.arahanRapat = arahanRapat.value;
            formData.value.selectedPIC = selectedPIC.value;
        } catch (error) {
            console.error('Error loading saved data:', error);
            // Keep empty values if loading fails
            arahanRapat.value = '';
            selectedPIC.value = '';
        }
    }
};

// Function to sync form data from Add tab to Detail tab
const syncFormData = () => {
    if (formUmumRef.value && formUmumRef.value.getValues) {
        const currentValues = formUmumRef.value.getValues();
        formData.value.judulKepdir = currentValues.judulKepdir || queryParams.value.judulRapat;
        formData.value.tanggalTerbit = currentValues.tanggalTerbit || queryParams.value.tanggal;
        formData.value.arahanRapat = arahanRapat.value;
        formData.value.selectedPIC = selectedPIC.value;
    } else {
        // Fallback to query params if form ref is not available
        formData.value.judulKepdir = queryParams.value.judulRapat;
        formData.value.tanggalTerbit = queryParams.value.tanggal;
        formData.value.arahanRapat = arahanRapat.value;
        formData.value.selectedPIC = selectedPIC.value;
    }
};

onBeforeMount(() => {
    // Parse query params first to get flagapprove value
    parseQueryParams();
    
    // Initialize files based on current mode
    initializeFiles();
    
    // Load saved data for detail mode
    loadSavedData();
    
    // Initialize form data
    syncFormData();
});

// Watch for tab changes and reinitialize files
watch(activeTab, () => {
    initializeFiles();
    // Sync form data when switching to detail tab
    if (tabs.value[activeTab.value]?.value === 'detail') {
        syncFormData();
    }
});

</script>
<template>
    <div>
        <div class="flex items-center gap-4 mb-4">
            <div class="font-semibold text-xl">
                Kepdir Sirkuler Management
            </div>
        </div>
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-center gap-2">
                <i class="pi pi-user text-blue-600"></i>
                <span class="text-sm text-blue-800">
                    <strong>User:</strong> {{ authStore.name || 'User' }} | 
                    <strong>Role:</strong> {{ Role1 ? 'Role 1' : Role2 ? 'Role 2' : 'Role 3' }}
                </span>
            </div>
        </div>
        
        <div class="card border border-blue-200 bg-white p-6">
            <TabView v-model:activeIndex="activeTab" class="w-full">
                <!-- Dynamic Tabs based on role and mode -->
                <TabPanel v-for="(tab, index) in tabs" :key="tab.value" :value="index">
                    <template #header>
                        <div class="flex items-center gap-2">
                            <i :class="tab.icon"></i>
                            <span>{{ tab.label }}</span>
                        </div>
                    </template>
                    
                    <!-- Add Tab Content -->
                    <div v-if="tab.value === 'add'">
                    
            <Form
                ref="formUmumRef"
                v-slot="$form"
                :resolver="resolver"
                @submit="onSubmitEvent"
                class="flex flex-col gap-6 w-full"
            >
                <div class="grid grid-cols-12 gap-6">
                    <!-- Left Column - Form Fields -->
                    <div class="col-span-8">
                        <!-- Judul Kepdir Sirkuler -->
                        <div class="mb-6">
                            <label
                                for="judulKepdir"
                                class="block font-bold mb-3 text-gray-700"
                            >
                                Judul Kepdir Sirkuler<span class="text-red-500">*</span>
                            </label>
                            <InputText 
                                autocomplete="off" 
                                name="judulKepdir"
                                type="text"
                                placeholder="Judul Kepdir Sirkuler"
                                class="w-full"
                                :value="queryParams.judulRapat"
                            />
                            <Message
                                v-if="$form.judulKepdir?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.judulKepdir?.errors?.[0] || 'Judul Kepdir Sirkuler harus diisi' }}
                            </Message>
                        </div>

                        <!-- Tanggal Terbit Kepdir Sirkuler -->
                        <div class="mb-6">
                            <label
                                for="tanggalTerbit"
                                class="block font-bold mb-3 text-gray-700"
                            >
                                Tanggal Terbit Kepdir Sirkuler<span class="text-red-500">*</span>
                            </label>
                            <Calendar
                                name="tanggalTerbit"
                                placeholder="Calendar"
                                class="w-full"
                                :showIcon="true"
                                dateFormat="dd/mm/yy"
                                :value="queryParams.tanggal"
                            />
                            <Message
                                v-if="$form.tanggalTerbit?.invalid"
                                severity="error"
                                size="small"
                                variant="simple"
                            >
                                {{ $form.tanggalTerbit?.errors?.[0] || 'Tanggal Terbit Kepdir Sirkuler harus diisi' }}
                            </Message>
                        </div>
                    </div>

                    <!-- Right Column - File Upload Section -->
                            <div class="col-span-4">
                        <!-- Tambah Jenis File -->
                        <!-- <div class="mb-6">
                            <label class="block font-bold mb-3 text-gray-700">
                                Tambah Jenis File
                            </label>
                            <div class="flex gap-2">
                                <Select
                                    v-model="selectedFileType"
                                    :options="fileTypeOptions"
                                    optionLabel="name"
                                    optionValue="value"
                                    placeholder="Attachment Rapat"
                                    class="flex-1"
                                />
                                <Button
                                    label="Add File"
                                    severity="secondary"
                                    @click="addFileType"
                                    :disabled="!selectedFileType"
                                    class="px-4"
                                />
                            </div>
                        </div> -->
                    </div>
                </div>

                <!-- File Upload Fields -->
                <div class="grid grid-cols-12 gap-6">
                    <div class="col-span-12">
                        <div 
                            v-for="(file, index) in uploadedFiles" 
                            :key="index"
                            class="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
                        >
                            <div class="flex items-center gap-3">
                                <Button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    text
                                    rounded
                                    size="small"
                                    @click="removeFile(index)"
                                    class="text-red-500 hover:bg-red-50"
                                />
                                <div class="flex-1">
                                    <label class="block font-bold mb-2 text-gray-700">
                                                {{ file.name }}<span class="text-red-500">*</span>
                                    </label>
                                    <div class="flex gap-2">
                                        <InputText
                                            :value="file.file ? file.file.name : ''"
                                            :placeholder="file.placeholder"
                                            readonly
                                            class="flex-1 bg-gray-100"
                                        />
                                        <FileUpload
                                            mode="basic"
                                            :auto="true"
                                            :multiple="false"
                                            accept=".pdf,.doc,.docx"
                                            :maxFileSize="10000000"
                                            @select="(event) => onFileSelect(event, index)"
                                            class="p-button-outlined"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Arahan Rapat -->
                <div class="mb-4">
                    <label class="block font-bold mb-2 text-gray-700">
                        Arahan Rapat<span class="text-red-500">*</span>
                    </label>
                    <Textarea
                        name="arahanRapat"
                        v-model="arahanRapat"
                        placeholder="Masukkan arahan rapat"
                        rows="4"
                        class="w-full"
                    />
                    <Message
                        v-if="$form.arahanRapat?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.arahanRapat?.errors?.[0] || 'Arahan rapat harus diisi' }}
                    </Message>
                </div>

                <!-- Pilih PIC -->
                <div class="mb-4">
                    <label class="block font-bold mb-2 text-gray-700">
                        Pilih PIC<span class="text-red-500">*</span>
                    </label>
                    <Select
                        name="selectedPIC"
                        v-model="selectedPIC"
                        :options="picOptions"
                        optionLabel="name"
                        optionValue="value"
                        placeholder="Pilih PIC"
                        class="w-full"
                    />
                    <Message
                        v-if="$form.selectedPIC?.invalid"
                        severity="error"
                        size="small"
                        variant="simple"
                    >
                        {{ $form.selectedPIC?.errors?.[0] || 'PIC harus dipilih' }}
                    </Message>
                </div>

                <!-- Save Button -->
                <div class="mb-4 flex justify-end">
                    <Button
                        v-if="isApproved"
                        class="w-max"
                        severity="primary"
                        type="button"
                        @click="onClickSubmit"
                        :loading="isLoadingSave"
                        :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                    />
                </div>
                            
                    </Form>

                    <Divider />
                    <div class="flex justify-end gap-3">
                        <Button
                            class="w-max"
                            severity="primary"
                            type="button"
                            @click="onClickSubmit"
                            :loading="isLoadingSave"
                            :label="isLoadingSave ? 'Menyimpan Data' : 'Save'"
                        />
                    </div>
                    </div>
                    
                    <!-- Detail Tab Content -->
                    <div v-else-if="tab.value === 'detail'">
                        <div class="grid grid-cols-12 gap-6">
                            <!-- Left Column - Form Fields -->
                            <div class="col-span-8">
                                <!-- Judul Kepdir Sirkuler -->
                                <div class="mb-6">
                                    <label
                                        for="judulKepdir"
                                        class="block font-bold mb-3 text-gray-700"
                                    >
                                        Judul Kepdir Sirkuler
                                    </label>
                                    <InputText 
                                        autocomplete="off" 
                                        name="judulKepdir"
                                        type="text"
                                        placeholder="Judul Kepdir Sirkuler"
                                        class="w-full"
                                        :value="formData.judulKepdir || queryParams.judulRapat"
                                        readonly
                                    />
                                </div>

                                <!-- Tanggal Terbit Kepdir Sirkuler -->
                                <div class="mb-6">
                                    <label
                                        for="tanggalTerbit"
                                        class="block font-bold mb-3 text-gray-700"
                                    >
                                        Tanggal Terbit Kepdir Sirkuler
                                    </label>
                                    <Calendar
                                        name="tanggalTerbit"
                                        placeholder="Calendar"
                                        class="w-full"
                                        :showIcon="true"
                                        dateFormat="dd/mm/yy"
                                        :value="formData.tanggalTerbit || queryParams.tanggal"
                                        readonly
                                    />
                                </div>
                                <!-- Arahan Rapat -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700 flex items-center gap-2">
                                        <i class="pi text-blue-600"></i>  <!-- pi-file-edit -->
                                        Arahan Rapat
                                    </label>
                                    <Textarea
                                        :value="formData.arahanRapat || arahanRapat"
                                        placeholder="Belum ada arahan rapat"
                                        rows="4"
                                        class="w-full"
                                        readonly
                                    />
                                </div>

                                <!-- PIC -->
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700 flex items-center gap-2">
                                        <i class="pi text-green-600"></i>  <!-- pi-user -->
                                        PIC
                                    </label>
                                    <InputText 
                                        :value="(formData.selectedPIC || selectedPIC) ? picOptions.find(pic => pic.value === (formData.selectedPIC || selectedPIC))?.name || (formData.selectedPIC || selectedPIC) : 'Belum ada PIC yang ditentukan'"
                                        class="w-full"
                                        readonly
                                    />
                                </div>
                            </div>

                            <!-- Right Column - Status Information -->
                            <div class="col-span-4">
                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Status
                                    </label>
                                    <div class="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <span class="text-gray-700">{{ queryParams.status || 'Draft' }}</span>
                                    </div>
                                </div>

                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Mode
                                    </label>
                                    <div class="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <span class="text-gray-700">{{ queryParams.mode || 'add' }}</span>
                                    </div>
                                </div>

                                <div class="mb-6">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Approval Status
                                    </label>
                                    <div class="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                        <span class="text-gray-700">{{ queryParams.flagapprove || 'pending' }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- File Information for Detail Mode -->
                        <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="mb-4">
                                    <label class="block font-bold mb-3 text-gray-700">
                                        Attachment Rapat
                                    </label>
                                    <div class="space-y-3">
                                        <div 
                                            v-for="(file, index) in uploadedFiles" 
                                            :key="index"
                                            class="p-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between"
                                        >
                                            <div class="flex items-center gap-3">
                                                <i class="pi pi-file text-gray-500"></i>
                                                <span class="text-gray-700">{{ file.name }}</span>
                                            </div>
                                            <Button
                                                :icon="file.file ? 'pi pi-eye' : 'pi pi-file'"
                                                :label="file.file ? 'View' : 'No File'"
                                                :severity="file.file ? 'info' : 'secondary'"
                                                :disabled="!file.file"
                                                @click="file.file ? viewDocument(file, index) : null"
                                                class="p-button-outlined p-button-sm"
                                                v-tooltip.top="file.file ? 'Lihat Dokumen' : 'File tidak tersedia'"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PIC & Arahan Rapat Information -->
                        <div class="grid grid-cols-12 gap-6">
                            <div class="col-span-12">
                                <div class="mb-4">
                                    <label class="block font-bold mb-3 text-gray-700 flex items-center gap-2">
                                        <i class="pi text-purple-600"></i>  <!-- pi-table -->
                                        Informasi PIC & Arahan Rapat
                                    </label>
                                    <div class="overflow-x-auto">
                                        <table class="w-full border-collapse border border-gray-300 shadow-sm">
                                            <thead>
                                                <tr class="bg-gradient-to-r from-purple-50 to-blue-50">
                                                    <th class="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-700 w-16">
                                                        No
                                                    </th>
                                                    <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                                        <i class="pi mr-2 text-green-600"></i>PIC  <!-- pi-user -->
                                                    </th>
                                                    <th class="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-700">
                                                        <i class="pi mr-2 text-blue-600"></i>Arahan Rapat  <!-- pi-file-edit -->
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-if="(formData.selectedPIC || selectedPIC) || (formData.arahanRapat || arahanRapat)" class="hover:bg-gray-50">
                                                    <td class="border border-gray-300 px-4 py-3 text-center text-gray-600 font-medium">
                                                        1
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        <div class="flex items-center gap-2">
                                                            <i class="pi text-green-500"></i>  <!-- pi-user -->
                                                            {{ (formData.selectedPIC || selectedPIC) ? picOptions.find(pic => pic.value === (formData.selectedPIC || selectedPIC))?.name || (formData.selectedPIC || selectedPIC) : '-' }}
                                                        </div>
                                                    </td>
                                                    <td class="border border-gray-300 px-4 py-3 text-gray-600">
                                                        <div class="flex items-start gap-2">
                                                            <i class="pi text-blue-500 mt-1"></i>  <!-- pi-file-edit -->
                                                            <span>{{ formData.arahanRapat || arahanRapat || '-' }}</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr v-else>
                                                    <td colspan="3" class="border border-gray-300 px-4 py-6 text-center text-gray-500 italic bg-gray-50">
                                                        <div class="flex flex-col items-center gap-2">
                                                            <i class="pi text-gray-400 text-xl"></i>  <!-- pi-info-circle -->
                                                            <span>Belum ada data PIC dan arahan rapat</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Approve/Reject Buttons - Only for Role 1 -->
                        <div v-if="Role1" class="flex justify-end gap-3 mt-6">
                            <Button
                                class="w-max"
                                severity="danger"
                                type="button"
                                @click="onClickReject"
                                :loading="isLoadingReject"
                                label="Reject"
                            />
                            <Button
                                class="w-max"
                                severity="success"
                                type="button"
                                @click="onClickApprove"
                                :loading="isLoadingApprove"
                                label="Approve"
                            />
                        </div>
                    </div>
                    
                    
                </TabPanel>
            </TabView>
        </div>
    </div>
    <ConfirmDialog
        :draggable="false"
        group="crud-group"
        :pt="{
            pcCloseButton: {
                root: {
                    class: 'hidden'
                }
            }
        }"
    />
</template>
