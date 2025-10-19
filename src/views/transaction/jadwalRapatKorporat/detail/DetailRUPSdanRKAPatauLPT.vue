<script setup>
// Vue imports
import { onBeforeMount, onMounted, ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// PrimeVue imports
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import InputText from 'primevue/inputtext';

// External libraries
import { object, string } from 'yup';

// Local imports
import RoleService from '@/service/RoleService';
import IParams from '@/interface/IParams';
import { useAuth } from '@/stores/authStore';

// Composables
const confirmSave = useConfirm();
const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuth();

// Loading states
const isLoadingDetail = ref(false);
const isLoadingSave = ref(false);
const isLoadingApprove = ref(false);
const isLoadingReject = ref(false);
const loading = ref(null);
const isLoadingUsers = ref(false);

// Form references
const formUmumRef = ref();

// Computed properties
const canViewDataTable1 = computed(() => authStore.role === '1');
const canViewDataTable2 = computed(() => authStore.role === '1');
const canAddKajianRapat = computed(() => authStore.role === '2');
const Role1 = authStore.role;


// Query parameters
const queryParams = ref({
    id: '',
    judulRapat: '',
    tanggal: '',
    durasi: '',
    lokasi: '',
    peserta: '',
    agenda: '',
    status: '',
    mode: ''
});

// File management
const fileTypeOptions = ref([
    { name: 'KKO', value: 'kajian_kKO' },
    { name: 'KKF', value: 'kajian_kKF' },
    { name: 'KR', value: 'kajian_kR' },
    { name: 'FRA', value: 'kajian_fRA' },
    { name: 'Pakta Integritas', value: 'kajian_paktaIntegritas' }
]);
const selectedFileType = ref('');
const uploadedFiles = ref([]);

// UI state
const activeTab = ref(0);

// Table data
const datas = ref([]);
const dataRoles = ref();
const search = ref(null);
const param = ref({ ...IParams });
const totalRecords = ref(0);

// User management
const users = ref([
    { id: 1, name: 'Ahmad Wijaya', email: 'ahmad.wijaya@pln.co.id' },
    { id: 2, name: 'Siti Nurhaliza', email: 'siti.nurhaliza@pln.co.id' },
    { id: 3, name: 'Budi Santoso', email: 'budi.santoso@pln.co.id' },
    { id: 4, name: 'Dewi Kartika', email: 'dewi.kartika@pln.co.id' },
    { id: 5, name: 'Eko Prasetyo', email: 'eko.prasetyo@pln.co.id' },
    { id: 6, name: 'Fitri Rahayu', email: 'fitri.rahayu@pln.co.id' },
    { id: 7, name: 'Gunawan Sari', email: 'gunawan.sari@pln.co.id' },
    { id: 8, name: 'Hesti Lestari', email: 'hesti.lestari@pln.co.id' },
    { id: 9, name: 'Indra Kurniawan', email: 'indra.kurniawan@pln.co.id' },
    { id: 10, name: 'Joko Widodo', email: 'joko.widodo@pln.co.id' }
]);
const selectedPICs = ref({});


// Form validation
const resolver = yupResolver(
    object().shape({
        judulKepdir: string().required('Judul Kepdir Sirkuler harus diisi'),
        tanggalTerbit: string().required('Tanggal Terbit Kepdir Sirkuler harus diisi')
    })
);


// File management functions
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
        'kajian_kKO': 'KKO',
        'kajian_kKF': 'KKF',
        'kajian_kR': 'KR',
        'kajian_fRA': 'FRA',
        'kajian_paktaIntegritas': 'Pakta Integritas'
    };
    return placeholders[type] || 'File';
};


const viewDocumentFile = (file, index) => {
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


// Utility functions
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
        mode: route.query.mode || ''
    };
    
    if (queryParams.value.tanggal && queryParams.value.tanggal.includes(' ')) {
        queryParams.value.tanggal = queryParams.value.tanggal.split(' ')[0];
    }
    
    console.log('Query Parameters:', queryParams.value);
};

// Form submission handlers
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

// API service functions
const saveInputToService = async (data) => {
    const payload = {
        id: queryParams.value.id || null,
        judulKepdir: data.judulKepdir,
        tanggalTerbit: data.tanggalTerbit,
        judulRapat: queryParams.value.judulRapat,
        tanggal: queryParams.value.tanggal,
        durasi: queryParams.value.durasi,
        lokasi: queryParams.value.lokasi,
        peserta: queryParams.value.peserta,
        agenda: queryParams.value.agenda,
        status: queryParams.value.status,
        mode: queryParams.value.mode,
        files: uploadedFiles.value.map(file => ({
            type: file.type,
            name: file.name,
            file: file.file
        }))
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
        mode: queryParams.value.mode
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
        mode: queryParams.value.mode
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

onBeforeMount(() => {
    
    uploadedFiles.value = [
        { type: 'kajian_kKO', name: 'KKO', file: null, placeholder: 'KKO' },
        { type: 'kajian_kKF', name: 'KKF', file: null, placeholder: 'KKF' },
        { type: 'kajian_kR', name: 'KR', file: null, placeholder: 'KR' },
        { type: 'kajian_fRA', name: 'FRA', file: null, placeholder: 'FRA' },
        { type: 'kajian_paktaIntegritas', name: 'Pakta Integritas', file: null, placeholder: 'Pakta Integritas' }
    ];
});

// Table data functions
function getData() {
    loading.value = true;
    param.value.search = search.value;
    
    setTimeout(() => {
        loading.value = false;
        datas.value = [
            { 
                id: 1, 
                name: 'Keputusan Direksi No. 001/2024', 
                displayName: 'Draft', 
                description: '2024-01-15 10:30:00'
            },
            { 
                id: 2, 
                name: 'Keputusan Direksi No. 002/2024', 
                displayName: 'Approved', 
                description: '2024-01-16 14:20:00'
            }
        ];
        totalRecords.value = datas.value.length;
    }, 1000);
}


function onClickEditTable(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/DetailDireksi',
        query: {
            id: data.id,
            judulRapat: data.name || '',
            tanggal: data.description || '',
            durasi: '2 jam',
            lokasi: 'Meeting Room',
            peserta: 'Peserta A, Peserta B',
            agenda: data.description || '',
            status: data.displayName || 'draft',
            mode: 'edit' 
        }
    });
}

function onClickDeleteTable(data) {
    dataRoles.value = data;
    openDialogDeleteTable();
}

function onClickApprovalPICTable(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add/detail-rups-dan-rkap-atau-lpt',
        query: {
            id: data.id,
            judulKepdir: data.name || '',
            status: data.displayName || '',
            lastModified: data.description || '',
            mode: 'pic' 
        }
    });
}

function onClickDetailTable(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add/detail-rups-dan-rkap-atau-lpt',
        query: {
            id: data.id,
            judulKepdir: data.name || '',
            status: data.displayName || '',
            lastModified: data.description || '',
            mode: 'detail',
            role: Role1
        }
    });
}


function viewDocumentInDialog(doc) {
    toast.add({
        severity: 'info',
        summary: 'View Document',
        detail: `Opening ${doc.nama}`,
        life: 3000
    });
    // Here you can implement actual document viewing logic
}

function onClickUploadFormReviewGovernanceTable(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add/detail-direksi',
        query: {
            id: data.id,
            judulKepdir: data.name || '',
            status: data.displayName || '',
            lastModified: data.description || '',
            flagapprove: 'done',
            mode: 'upload',
            role: Role1
        }
    });
}

function onClickRejectTable(data) {
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
            rejectDataTable(data);
        }
    });
}

const rejectDataTable = async (data) => {
    const payload = {
        id: data.id || null,
        action: 'reject',
        mode: 'table'
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
                getData(); // Refresh table data
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

const openDialogDeleteTable = () => {
    confirmSave.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi'
    });
};

function deleteDataTable(accept) {
    isLoading.value = true;
    RoleService.delete(dataRoles.value.id)
        .then((response) => {
            isLoading.value = false;
            accept();
            if (response.data.code == 200) {
                toast.add({
                    severity: 'success',
                    summary: 'Berhasil',
                    detail: response.data.message,
                    life: 3000
                });
                getData();
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
            isLoading.value = false;
            accept();
            toast.add({
                severity: 'error',
                summary: 'Gagal',
                detail: e.message,
                life: 3000
            });
        });
}

// Table event handlers
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
};

const viewDocument = (file) => {
    toast.add({
        severity: 'info',
        summary: 'View Document',
        detail: `Opening ${file.nama_file}`,
        life: 3000
    });
};

const onClickPilihPicTable = (data) => {
    toast.add({
        severity: 'info',
        summary: 'Pilih PIC',
        detail: `Memilih PIC untuk ${data.name}`,
        life: 3000
    });
};

const saveSelectedPIC = async (data, selectedUser) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: `PIC ${selectedUser.name} berhasil disimpan untuk ${data.name}`,
            life: 3000
        });
        
        selectedPICs.value[data.id] = selectedUser;
        
        console.log('Saved PIC:', {
            meetingId: data.id,
            meetingName: data.name,
            picId: selectedUser.id,
            picName: selectedUser.name
        });
        
    } catch (error) {
        toast.add({
            severity: 'error',
            summary: 'Gagal',
            detail: 'Gagal menyimpan PIC',
            life: 3000
        });
    }
};

onMounted(() => {
    parseQueryParams(); 
    getData();
});
</script>
<template>
    <div>
        <div class="flex items-center gap-4 mb-4">
            <div class="font-semibold text-xl">
                {{ queryParams.mode === 'edit' ? 'Edit Kepdir Sirkuler' : queryParams.mode === 'detail' ? 'Detail Kepdir Sirkuler' : queryParams.mode === 'Approval' ? 'Approve Kepdir Sirkuler' : 'Input Kajian Rapat' }}
            </div>
        </div>
        <!-- Tab Navigation -->
        <TabView v-model:activeIndex="activeTab" class="mb-4">
            <TabPanel header="Data Table">
                <DataTable
                        :value="datas"
                        :paginator="true"
                        scrollable
                        scrollHeight="400px"
                        :rows="param.size"
                        :rowsPerPageOptions="[5, 10, 20, 50]"
                        dataKey="id"
                        :rowHover="true"
                        :loading="loading"
                        :totalRecords="totalRecords"
                        :lazy="true"
                        @page="onPage($event)"
                        paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                        currentPageReportTemplate="showing {first} to {last} of {totalRecords}"
                    >
                        <template #header>
                            <div class="flex justify-between gap-2">
                                <div class="flex items-center w-full">
                                    <InputText autocomplete="off" 
                                        v-model="search"
                                        @change="getData()"
                                        placeholder="Search"
                                        class="h-8 px-3"
                                        style="width: 200px;"
                                    />
                                    <Button
                                        v-if="canAddKajianRapat"
                                        icon="pi pi-plus"
                                        severity="primary"
                                        variant="outlined"
                                        label="Add Kajian Rapat"
                                        as="router-link"
                                        :to="{
                                            path: '/transaction/jadwal-rapat-korporat/detail/add/detail-rups-dan-rkap-atau-lpt',
                                            query: {
                                                mode: 'add'
                                            }
                                        }"
                                        size="medium"
                                        class="h-8 px-3 ml-auto"
                                    />
                                </div>
                            </div>
                        </template>
                        <template #empty> Data not found... </template>
                        <template #loading> Loading data. Please wait. </template>
                        <Column
                            header="Judul Rapat"
                            dataType="text"
                            field="name"
                        />
                        <Column
                            header="Jenis Rapat"
                            dataType="text"
                            field="displayName"
                        />
                        <Column
                            header="Tanggal Rapat"
                            dataType="text"
                            field="description"
                        />
                        <Column
                            header="Agenda Rapat"
                            dataType="text"
                            field="description"
                        />
                        <Column
                            header="Materi Rapat"
                            class="w-[8rem]"
                        >
                            <template #body="{ data }">
                                <div
                                    class="flex flex-col md:flex-row gap-2 justify-center items-start"
                                >
                                    <Button
                                        icon="pi pi-eye"
                                        severity="info"
                                        rounded
                                        aria-label="Detail"
                                        @click="onClickDetailTable(data)"
                                        v-tooltip.bottom="'Detail'"
                                    />
                                </div>
                            </template>
                        </Column>
                        <!-- <Column
                            v-if="canViewDataTable2"
                            header="Approval & add PIC"
                            class="w-[8rem]"
                        >
                            <template #body="{ data }">
                                <div
                                    class="flex flex-col md:flex-row gap-2 justify-center items-start"
                                >
                                    <Button
                                        icon="pi pi-user-plus"
                                        severity="success"
                                        rounded
                                        aria-label="Approval & add PIC"
                                        @click="onClickApprovalPICTable(data)"
                                        v-tooltip.bottom="'Approval & Add PIC'"
                                    />
                                </div>
                            </template>
                        </Column> -->
                </DataTable>
            </TabPanel>
        </TabView>
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
