<script setup>
import GCGService from '../service/GCGService';
import ParameterItem from '../components/ParameterItem.vue';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { computed, onBeforeMount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string, number, array } from 'yup';
import { useAuth } from '@/stores';

// Main form data
const formData = ref({
    id: '',
    namaImplementasi: '',
    tahun: new Date().getFullYear(),
    deskripsi: '',
    aspectId: null,
    status: 'Not Started',
    parameters: [] // Dynamic parameter structure
});

// Parameter structure with dynamic levels
const parameterStructure = ref([]);

const isLoadingSave = ref(false);
const isLoadingDetail = ref(false);
const isLoadingAspects = ref(false);
const isLoadingDivisions = ref(false);

// File upload state for attachments
const selectedFiles = ref({});
const uploadProgress = ref({});
const allowedFileTypes = ['pdf', 'xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'jpg', 'jpeg', 'png'];
const maxFileSize = 10 * 1024 * 1024; // 10MB

const route = useRoute();
const confirmSave = useConfirm();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.id));
const mode = computed(() => isEdit.value ? 'edit' : 'add');

// Dropdown options
const aspects = ref([]);
const divisions = ref([]);

const resolver = computed(() => {
    let opt = {
        namaImplementasi: string().required('Nama Implementasi tidak boleh kosong'),
        tahun: number().required('Tahun tidak boleh kosong'),
        aspectId: string().required('Aspek harus dipilih'),
        parameters: array().min(1, 'Minimal ada 1 parameter')
    };

    return yupResolver(object().shape(opt));
});

const toast = useToast();

// Status options
const statusOptions = [
    { label: 'Not Started', value: 'Not Started' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Selesai', value: 'Selesai' }
];

// Sub factor options
const subFaktorOptions = [
    { label: '0.5', value: 0.5 },
    { label: '0.75', value: 0.75 },
    { label: '1.0', value: 1.0 }
];

// Load dropdown data
const loadAspects = async () => {
    isLoadingAspects.value = true;
    try {
        const response = await GCGService.getAspects();
        if (response.data.code === 200) {
            aspects.value = response.data.data.map(item => ({
                label: item.nama,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('Error loading aspects:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal memuat data aspek',
            life: 3000
        });
    } finally {
        isLoadingAspects.value = false;
    }
};

const loadDivisions = async () => {
    isLoadingDivisions.value = true;
    try {
        const response = await GCGService.getDivisions();
        if (response.data.code === 200) {
            divisions.value = response.data.data.map(item => ({
                label: item.nama,
                value: item.id
            }));
        }
    } catch (error) {
        console.error('Error loading divisions:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal memuat data divisi',
            life: 3000
        });
    } finally {
        isLoadingDivisions.value = false;
    }
};

// Parameter management functions
const addParameter = () => {
    const newParameter = {
        id: `param-${Date.now()}`,
        level: 1,
        nama: '',
        deskripsi: '',
        bobot: '',
        subFaktorLevel2: '',
        subFaktorLevel1: '',
        faktor: '',
        uraianPemenuhan: '',
        pic: '',
        status: 'Not Started',
        children: []
    };
    
    parameterStructure.value.push(newParameter);
    updateFormParameters();
};

const addSubParameter = (parentId, level = 2) => {
    const parent = findParameterById(parentId, parameterStructure.value);
    if (!parent) return;
    
    const newSubParameter = {
        id: `sub-param-${Date.now()}`,
        level: level,
        nama: '',
        deskripsi: '',
        bobot: '',
        subFaktorLevel2: '',
        subFaktorLevel1: '',
        faktor: '',
        uraianPemenuhan: '',
        pic: '',
        status: 'Not Started',
        children: [],
        parentId: parentId
    };
    
    if (!parent.children) {
        parent.children = [];
    }
    parent.children.push(newSubParameter);
    updateFormParameters();
};

const addSubSubParameter = (parentId) => {
    addSubParameter(parentId, 3);
};

const addSubSubSubParameter = (parentId) => {
    addSubParameter(parentId, 4);
};

const removeParameter = (id) => {
    removeParameterFromStructure(id, parameterStructure.value);
    updateFormParameters();
};

const findParameterById = (id, structure) => {
    for (const item of structure) {
        if (item.id === id) return item;
        if (item.children) {
            const found = findParameterById(id, item.children);
            if (found) return found;
        }
    }
    return null;
};

const removeParameterFromStructure = (id, structure) => {
    for (let i = structure.length - 1; i >= 0; i--) {
        if (structure[i].id === id) {
            structure.splice(i, 1);
            return;
        }
        if (structure[i].children) {
            removeParameterFromStructure(id, structure[i].children);
        }
    }
};

const updateFormParameters = () => {
    // Convert hierarchical structure to flat array for form validation
    const flattenParameters = (structure, level = 1) => {
        let result = [];
        structure.forEach(item => {
            result.push({
                ...item,
                level: level
            });
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenParameters(item.children, level + 1));
            }
        });
        return result;
    };
    
    formData.value.parameters = flattenParameters(parameterStructure.value);
};

const getParameterLevelLabel = (level) => {
    switch (level) {
        case 1: return 'Parameter';
        case 2: return 'Sub Parameter';
        case 3: return 'Sub-Sub Parameter';
        case 4: return 'Sub-Sub-Sub Parameter';
        default: return `Level ${level}`;
    }
};

const getParameterLevelIcon = (level) => {
    switch (level) {
        case 1: return 'pi pi-circle';
        case 2: return 'pi pi-circle-fill';
        case 3: return 'pi pi-minus-circle';
        case 4: return 'pi pi-minus-circle-fill';
        default: return 'pi pi-circle';
    }
};

const getParameterLevelColor = (level) => {
    switch (level) {
        case 1: return 'text-blue-600';
        case 2: return 'text-green-600';
        case 3: return 'text-orange-600';
        case 4: return 'text-red-600';
        default: return 'text-gray-600';
    }
};

const getParameterPadding = (level) => {
    return `pl-${(level - 1) * 6}`;
};

// File upload and attachment management
const onFileSelect = (event, parameterId) => {
    const files = event.files;
    if (!selectedFiles.value[parameterId]) {
        selectedFiles.value[parameterId] = [];
    }
    
    files.forEach(file => {
        if (file.size > maxFileSize) {
            toast.add({
                severity: 'error',
                summary: 'File terlalu besar',
                detail: `File ${file.name} melebihi batas maksimal 10MB`,
                life: 3000
            });
            return;
        }
        
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedFileTypes.includes(fileExtension)) {
            toast.add({
                severity: 'error',
                summary: 'Tipe file tidak didukung',
                detail: `File ${file.name} memiliki tipe yang tidak didukung`,
                life: 3000
            });
            return;
        }
        
        selectedFiles.value[parameterId].push(file);
    });
};

const removeFile = (parameterId, fileIndex) => {
    if (selectedFiles.value[parameterId]) {
        selectedFiles.value[parameterId].splice(fileIndex, 1);
    }
};

const uploadFiles = async (parameterId) => {
    if (!selectedFiles.value[parameterId] || selectedFiles.value[parameterId].length === 0) {
        return [];
    }
    
    const uploadPromises = selectedFiles.value[parameterId].map(async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('parameterId', parameterId);
            formData.append('gcgId', formData.value.id);
            
            const response = await GCGService.uploadEvidence(formData);
            if (response.data.code === 200) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('Upload error:', error);
            toast.add({
                severity: 'error',
                summary: 'Upload gagal',
                detail: `Gagal mengupload file ${file.name}`,
                life: 3000
            });
            return null;
        }
    });
    
    const results = await Promise.all(uploadPromises);
    return results.filter(result => result !== null);
};

const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
        case 'pdf': return 'pi pi-file-pdf';
        case 'xlsx':
        case 'xls': return 'pi pi-file-excel';
        case 'docx':
        case 'doc': return 'pi pi-file-word';
        case 'pptx':
        case 'ppt': return 'pi pi-file-powerpoint';
        case 'jpg':
        case 'jpeg':
        case 'png': return 'pi pi-image';
        default: return 'pi pi-file';
    }
};

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getDetailGCG = () => {
    if (!isEdit.value) return;
    
    isLoadingDetail.value = true;
    
    GCGService.getById(route.params.id)
        .then((response) => {
            if (response.data && response.data.code === 200) {
                const apiData = response.data.data;
                formData.value = {
                    ...formData.value,
                    ...apiData
                };
                
                // Load parameter structure if exists
                if (apiData.parameterStructure) {
                    parameterStructure.value = apiData.parameterStructure;
                    updateFormParameters();
                }
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data?.message || 'Gagal memuat data implementasi GCG',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Error loading detail:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat memuat data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoadingDetail.value = false;
        });
};

const onClickSubmit = (data) => {
    if (!data.valid) {
        return;
    }
    
    confirmSave.require({
        group: 'crud-group',
        message: 'Apakah anda yakin untuk menyimpan data implementasi GCG?',
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
            saveInputToService();
        }
    });
};

const saveInputToService = async () => {
    isLoadingSave.value = true;
    
    try {
        // Upload files for each parameter first
        const uploadedAttachments = {};
        for (const param of parameterStructure.value) {
            const attachments = await uploadFiles(param.id);
            if (attachments.length > 0) {
                uploadedAttachments[param.id] = attachments;
            }
        }
        
        const dataToSend = {
            id: formData.value.id,
            namaImplementasi: formData.value.namaImplementasi,
            tahun: formData.value.tahun,
            deskripsi: formData.value.deskripsi || '',
            aspectId: formData.value.aspectId,
            status: formData.value.status,
            parameterStructure: parameterStructure.value,
            parameters: formData.value.parameters,
            attachments: uploadedAttachments
        };
        
        const apiCall = isEdit.value 
            ? GCGService.put(dataToSend.id, dataToSend)
            : GCGService.post(dataToSend);
        
        apiCall
        .then((response) => {
            if (response.data && response.data.code === 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: isEdit.value 
                        ? 'Data implementasi GCG berhasil diperbarui'
                        : 'Data implementasi GCG berhasil disimpan',
                    life: 3000
                });
                
                setTimeout(() => {
                    router.push('/gcg');
                }, 1500);
            } else {
                toast.add({
                    severity: 'error',
                    summary: 'Gagal',
                    detail: response.data?.message || 'Terjadi kesalahan saat menyimpan data',
                    life: 3000
                });
            }
        })
        .catch((error) => {
            console.error('Save error:', error);
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: error.response?.data?.message || error.message || 'Terjadi kesalahan saat menyimpan data',
                life: 3000
            });
            const authStore = useAuth();
            authStore.removeCredentials();
            router.push('/auth/login');
        })
        .finally(() => {
            isLoadingSave.value = false;
        });
    } catch (error) {
        console.error('Upload error:', error);
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Terjadi kesalahan saat mengupload file',
            life: 3000
        });
        isLoadingSave.value = false;
    }
};

const onClickKembali = () => {
    router.push('/gcg');
};

onBeforeMount(() => {
    loadAspects();
    loadDivisions();
    getDetailGCG();
});

onMounted(() => {});
</script>

<template>
    <div>
        <!-- Header -->
        <div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <!-- <div class="bg-white bg-opacity-20 rounded-full p-3">
                        <i :class="isEdit ? 'pi pi-pencil' : 'pi pi-plus'" class="text-2xl"></i>
                    </div> -->
                    <div>
                        <h1 class="text-2xl font-bold">
                            {{ isEdit ? 'Edit' : 'Tambah' }} Implementasi GCG
                        </h1>
                        <!-- <p class="text-blue-100 mt-1">
                            {{ isEdit ? 'Perbarui data implementasi GCG dengan parameter dinamis' : 'Buat implementasi GCG baru dengan struktur parameter yang fleksibel' }}
                        </p> -->
                    </div>
                </div>
            </div>
        </div>
        
        <div v-if="isLoadingDetail" class="space-y-6">
            <div class="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton height="2rem" class="mb-4"></Skeleton>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton height="3rem"></Skeleton>
                    <Skeleton height="3rem"></Skeleton>
                    <Skeleton height="3rem"></Skeleton>
                </div>
            </div>
            <div class="bg-white rounded-lg p-6 shadow-sm">
                <Skeleton height="2rem" class="mb-4"></Skeleton>
                <Skeleton height="8rem"></Skeleton>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm" v-else>
            <div class="p-8">
                <Form
                @submit="onClickSubmit"
                :resolver="resolver"
                v-slot="$form"
                :initialValues="formData"
            >
                <div class="grid grid-cols-12 gap-4">
                    <!-- Basic Information -->
                    <div class="col-span-12">
                        <Fieldset legend="Informasi Dasar" class="mb-6">
                            <!-- Row 1: Nama Implementasi, Tahun, Status -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">
                                        <i class="pi pi-building mr-2 text-blue-600"></i>
                                        Nama Implementasi 
                                        <span class="text-red-500 ml-1">*</span>
                                    </label>
                                    <InputText
                                        autocomplete="off"
                                        name="namaImplementasi"
                                        type="text"
                                        placeholder="Masukkan nama implementasi GCG"
                                        v-model:model-value="formData.namaImplementasi"
                                        class="w-full"
                                        :class="{ 'p-invalid': $form.namaImplementasi?.invalid }"
                                    />
                                    <Message
                                        v-if="$form.namaImplementasi?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.namaImplementasi.error?.message }}
                                    </Message>
                                </div>
                                
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">
                                        <i class="pi pi-calendar mr-2 text-green-600"></i>
                                        Tahun 
                                        <span class="text-red-500 ml-1">*</span>
                                    </label>
                                    <InputNumber
                                        autocomplete="off"
                                        name="tahun"
                                        placeholder="Tahun"
                                        v-model:model-value="formData.tahun"
                                        class="w-full"
                                        :class="{ 'p-invalid': $form.tahun?.invalid }"
                                        :useGrouping="false"
                                    />
                                    <Message
                                        v-if="$form.tahun?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.tahun.error?.message }}
                                    </Message>
                                </div>
                                
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">
                                        <i class="pi pi-check-circle mr-2 text-orange-600"></i>
                                        Status
                                    </label>
                                    <Dropdown
                                        name="status"
                                        v-model:model-value="formData.status"
                                        :options="statusOptions"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Status"
                                        class="w-full"
                                    />
                                </div>
                            </div>
                            
                            <!-- Row 2: Aspek -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">
                                        <i class="pi pi-list mr-2 text-purple-600"></i>
                                        Aspek 
                                        <span class="text-red-500 ml-1">*</span>
                                    </label>
                                    <Dropdown
                                        name="aspectId"
                                        v-model:model-value="formData.aspectId"
                                        :options="aspects"
                                        optionLabel="label"
                                        optionValue="value"
                                        placeholder="Pilih Aspek"
                                        class="w-full"
                                        :loading="isLoadingAspects"
                                        :class="{ 'p-invalid': $form.aspectId?.invalid }"
                                    />
                                    <Message
                                        v-if="$form.aspectId?.invalid"
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{ $form.aspectId.error?.message }}
                                    </Message>
                                </div>
                                
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">
                                        <i class="pi pi-info-circle mr-2 text-gray-600"></i>
                                        Deskripsi
                                        <span class="text-gray-400 ml-1">(Optional)</span>
                                    </label>
                                    <Textarea
                                        rows="3"
                                        autoResize
                                        autocomplete="off"
                                        name="deskripsi"
                                        placeholder="Masukkan deskripsi implementasi GCG"
                                        v-model:model-value="formData.deskripsi"
                                        class="w-full"
                                    />
                                </div>
                            </div>
                        </Fieldset>
                    </div>

                    <!-- Dynamic Parameters Section -->
                    <div class="col-span-12">
                        <Fieldset legend="Manajemen Parameter" class="mb-6">
                            <div class="flex justify-between items-center mb-6">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-sitemap text-2xl text-blue-600"></i>
                                    <div>
                                        <h3 class="text-lg font-semibold text-gray-800">Parameter Structure</h3>
                                        <p class="text-sm text-gray-600">Buat struktur parameter hierarkis sesuai kebutuhan</p>
                                    </div>
                                </div>
                                <Button
                                    label="Tambah Parameter"
                                    icon="pi pi-plus"
                                    severity="success"
                                    size="large"
                                    @click="addParameter"
                                    class="shadow-lg hover:shadow-xl transition-shadow duration-200"
                                />
                            </div>
                            
                             <!-- Parameter Structure Display -->
                             <div class="space-y-6">
                                 <div 
                                     v-for="parameter in parameterStructure" 
                                     :key="parameter.id"
                                     class="border border-gray-200 rounded-xl p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 shadow-sm hover:shadow-md transition-shadow duration-200"
                                 >
                                     <ParameterItem
                                         :parameter="parameter"
                                         :level="1"
                                         :onAddSub="addSubParameter"
                                         :onAddSubSub="addSubSubParameter"
                                         :onAddSubSubSub="addSubSubSubParameter"
                                         :onRemove="removeParameter"
                                         :getLevelLabel="getParameterLevelLabel"
                                         :getLevelIcon="getParameterLevelIcon"
                                         :getLevelColor="getParameterLevelColor"
                                         :getPadding="getParameterPadding"
                                         :subFaktorOptions="subFaktorOptions"
                                         :statusOptions="statusOptions"
                                         :divisions="divisions"
                                         :selectedFiles="selectedFiles"
                                         :onFileSelect="onFileSelect"
                                         :removeFile="removeFile"
                                         :getFileIcon="getFileIcon"
                                         :formatFileSize="formatFileSize"
                                         :allowedFileTypes="allowedFileTypes"
                                         :maxFileSize="maxFileSize"
                                     />
                                 </div>
                                 
                                <div v-if="parameterStructure.length === 0" class="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200">
                                    <div class="max-w-md mx-auto">
                                        <div class="mb-6">
                                            <i class="pi pi-sitemap text-8xl text-gray-300"></i>
                                        </div>
                                        <h3 class="text-xl font-semibold text-gray-700 mb-3">Belum Ada Parameter</h3>
                                        <p class="text-gray-500 mb-6 leading-relaxed">
                                            Mulai dengan menambahkan parameter utama untuk membangun struktur GCG yang komprehensif.
                                        </p>
                                        <Button
                                            label="Tambah Parameter Pertama"
                                            icon="pi pi-plus"
                                            severity="success"
                                            size="large"
                                            @click="addParameter"
                                            class="shadow-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Fieldset>
                    </div>
                </div>

                <Divider class="my-8" />
                
                <!-- Action Buttons -->
                <div class="flex justify-between items-center bg-gray-50 rounded-lg p-6">
                    <div class="flex items-center gap-3">
                        <i class="pi pi-info-circle text-blue-600"></i>
                        <div class="text-sm text-gray-600">
                            <span class="font-semibold">Tips:</span>
                            Pastikan semua field yang bertanda <span class="text-red-500">*</span> sudah diisi sebelum menyimpan.
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <Button
                            label="Batal"
                            icon="pi pi-times"
                            severity="secondary"
                            type="button"
                            @click="onClickKembali"
                            :disabled="isLoadingSave"
                            class="px-6"
                        />
                        <Button
                            label="Simpan"
                            icon="pi pi-check"
                            severity="primary"
                            type="submit"
                            :loading="isLoadingSave"
                            :disabled="isLoadingSave"
                            class="px-8 shadow-lg hover:shadow-xl transition-shadow duration-200"
                        />
                    </div>
                </div>
                </Form>
            </div>
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


<style scoped lang="scss">
:deep(.p-fieldset-content) {
    padding: 1rem;
}

.parameter-level-1 {
    border-left: 3px solid #3b82f6;
}

.parameter-level-2 {
    border-left: 3px solid #10b981;
}

.parameter-level-3 {
    border-left: 3px solid #f59e0b;
}

.parameter-level-4 {
    border-left: 3px solid #ef4444;
}
</style>
