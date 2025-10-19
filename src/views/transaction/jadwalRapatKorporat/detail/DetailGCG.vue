<script setup>
import RoleService from '@/service/RoleService';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import IParams from '@/interface/IParams';
import InputText from 'primevue/inputtext';

// Data untuk tabel pertama
const datas = ref([]);
const dataRoles = ref();
const search = ref(null);
const loading = ref(null);
const isLoading = ref(false);
const param = ref({
    ...IParams
});
const toast = useToast();
const totalRecords = ref(0);
const router = useRouter();
const route = useRoute();
const confirmDelete = useConfirm();

// Capture URL parameters
const tanggal = ref('');
const agenda = ref('');
const jadwalRapat = ref('');
const rapatId = ref('');

// Function to parse URL parameters
const parseUrlParams = () => {
    const pathSegments = route.path.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    
    if (lastSegment) {
        const parts = lastSegment.split('&');
        parts.forEach(part => {
            if (part.startsWith('JadwalRapat:')) {
                jadwalRapat.value = part.replace('JadwalRapat:', '');
            } else if (part.startsWith('Id:')) {
                rapatId.value = part.replace('Id:', '');
            } else if (part.startsWith('Tanggal:')) {
                tanggal.value = part.replace('Tanggal:', '');
            } else if (part.startsWith('Agenda:')) {
                agenda.value = part.replace('Agenda:', '');
            }
        });
    }
    
    // console.log('Jadwal Rapat:', jadwalRapat.value);
    // console.log('Rapat ID:', rapatId.value);
    // console.log('Tanggal:', tanggal.value);
    // console.log('Agenda:', agenda.value);
};

// Data untuk tabel kedua
const datas2 = ref([]);
const search2 = ref(null);
const loading2 = ref(null);
const param2 = ref({
    ...IParams
});
const totalRecords2 = ref(0);


function getData() {
    loading.value = true;
    param.value.search = search.value;
    
    setTimeout(() => {
        loading.value = false;
       
        datas.value = [
            { 
                id: 1, 
                name: 'Keputusan Direktur Utama No. 001/2024', 
                displayName: 'Draft', 
                description: '2024-01-15 10:30:00'
            }
        ];
        totalRecords.value = datas.value.length;
    }, 1000);
}


function getData2() {
    loading2.value = true;
    param2.value.search = search2.value;
    
    setTimeout(() => {
        loading2.value = false;
        
        datas2.value = [
            { id: 1, name: 'Keputusan Direktur Utama No. 001/2024', email: 'pesertaA@example.com', nama_file: 'baru.pdf', modified_by: 'admin' },
            { id: 2, name: 'Keputusan Direktur Utama No. 001/2024', email: 'pesertaB@example.com', nama_file: 'baru.pdf', modified_by: 'admin' },
            { id: 3, name: 'Keputusan Direktur Utama No. 001/2024', email: 'pesertaC@example.com', nama_file: 'baru.pdf', modified_by: 'admin' },
        ];
        totalRecords2.value = datas2.value.length;
    }, 1000);
}


function onClickEdit(data) {
    
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add',
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


function onClickDelete(data) {
    dataRoles.value = data;
    openDialogDelete();
}

function onClickApproval(data) {
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add',
        query: {
            id: data.id,
            judulKepdir: data.name || '',
            status: data.displayName || '',
            lastModified: data.description || '',
            mode: 'Approval' 
        }
    });
}

function onClickDetail(data) {
    
    router.push({
        path: '/transaction/jadwal-rapat-korporat/detail/add',
        query: {
            id: data.id,
            judulKepdir: data.name || '',
            status: data.displayName || '',
            lastModified: data.description || '',
            mode: 'detail' 
        }
    });
}

function handleBack() {
    router.push({
        path: '/transaction/jadwal-rapat-korporat'
    });
}

const openDialogDelete = () => {
    confirmDelete.require({
        group: 'delete-group',
        message: `Apakah anda yakin untuk menghapus data`,
        header: 'Konfirmasi'
    });
};

const handleAccept = (accept) => {
    deleteData(accept);
};

const handleReject = (reject) => {
    reject();
};

function deleteData(accept) {
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

const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
};

const onPage2 = (event) => {
    param2.value.size = event.rows;
    param2.value.page = event.page;
    getData2();
};


const viewDocument = (file) => {
    // console.log('Viewing document:', file);
    
    toast.add({
        severity: 'info',
        summary: 'View Document',
        detail: `Opening ${file.nama_file}`,
        life: 3000
    });
};

onMounted(() => {
    parseUrlParams(); 
    getData();
    getData2();
});
</script>

<template>
    <div>
        <!-- Tabel Pertama -->
        <div class="font-semibold text-xl mb-4">Daftar Role</div>
        <div class="card mb-6">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                scrollHeight="400px"
                :rows="param.size"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                dataKey="nik"
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
                        <div class="flex items-center gap-4">
                            <button 
                             @click="handleBack"
                             class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 back-button">
                             <i class="pi pi-arrow-left"></i>
                         </button>
                                                         <div>
                                 <label style="font-size: 20px; font-weight: bold; color: #2563eb; display: block; margin-bottom: 4px;">{{ jadwalRapat || 'Tidak ditemukan' }}</label>
                                 <label style="font-size: 10px; font-weight: 600; color: #374151; display: block; margin-bottom: 2px;">{{ agenda || 'Tidak ditemukan' }}</label>
                                 <label style="font-size: 10px; font-weight: 600; color: #6b7280; display: block;">{{ tanggal || 'Tidak ditemukan' }}</label>
                                 <!-- <label class="block text-sm font-medium text-gray-700">Jadwal Rapat:</label> -->
                                 <!-- <p class="text-lg font-semibold text-blue-600">{{ jadwalRapat || 'Tidak ditemukan' }}</p> -->
                             </div>
                        </div>
                        <div class="flex gap-4">
                            <InputText autocomplete="off" 
                                v-model="search"
                                @change="getData()"
                                placeholder="Search"
                                class="h-8 px-3"
                                style="width: 200px;"
                            />
                            <Button
                                icon="pi pi-plus"
                                severity="primary"
                                variant="outlined"
                                label="Tambah Kepdir"
                                as="router-link"
                                to="/transaction/jadwal-rapat-korporat/detail/add"
                                size="medium"
                                class="h-8 px-3"
                            />
                        </div>
                    </div>
                </template>
                <template #empty> Data not found... </template>
                <template #loading> Loading data. Please wait. </template>
                <!-- <Column
                    header="No."
                    style="min-width: 5rem"
                >
                    <template #body="{ index }">
                        {{ param.page * param.size + index + 1 }}
                    </template>
                </Column> -->
                <Column
                    header="Judul Kepdir"
                    dataType="text"
                    field="name"
                />
                <Column
                    header="Status"
                    dataType="text"
                    field="displayName"
                />
                <Column
                    header="Last Modified"
                    dataType="text"
                    field="description"
                />
                <!-- <Column
                    header="Action"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <ul
                            v-if="data.permissions.length > 0"
                            class="list-disc"
                        >
                            <li
                                v-for="permission in data.permissions"
                                :key="permission"
                            >
                                {{ permission.displayName }}
                            </li>
                        </ul>
                    </template>
                </Column> -->
                <Column
                    header="Action"
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
                                @click="onClickDetail(data)"
                                v-tooltip.bottom="'Detail'"
                            />
                            <Button
                                icon="pi pi-pencil"
                                severity="warn"
                                rounded
                                aria-label="Edit"
                                @click="onClickEdit(data)"
                                v-tooltip.bottom="'Edit'"
                            />
                            <Button
                                icon="pi pi-trash"
                                severity="danger"
                                rounded
                                aria-label="Hapus"
                                @click="onClickDelete(data)"
                                v-tooltip.bottom="'Hapus'"
                            />
                            <Button
                                icon="pi pi-check-circle"
                                severity="success"
                                rounded
                                aria-label="Approval"
                                @click="onClickApproval(data)"
                                v-tooltip.bottom="'Approval'"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>

        <!-- Tabel Kedua -->
        <div class="font-semibold text-xl mb-4">Log/File History</div>
        <div class="card">
            <DataTable
                :value="datas2"
                :paginator="true"
                scrollable
                scrollHeight="400px"
                :rows="param2.size"
                :rowsPerPageOptions="[5, 10, 20, 50]"
                dataKey="id"
                :rowHover="true"
                :loading="loading2"
                :totalRecords="totalRecords2"
                :lazy="true"
                @page="onPage2($event)"
                paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                currentPageReportTemplate="showing {first} to {last} of {totalRecords}"
            >
                <template #header>
                    <div class="flex justify-end gap-4">
                        <InputText autocomplete="off" 
                            v-model="search2"
                            @change="getData2()"
                            placeholder="Search Peserta"
                            class="h-8 px-3"
                            style="width: 200px;"
                        />
                        <!-- <Button
                            icon="pi pi-plus"
                            severity="primary"
                            variant="outlined"
                            label="Tambah Peserta"
                        /> -->
                    </div>
                </template>
                <template #empty> Data peserta tidak ditemukan... </template>
                <template #loading> Loading data peserta. Please wait. </template>
                <Column
                    header="No."
                    style="min-width: 5rem"
                >
                    <template #body="{ index }">
                        {{ param2.page * param2.size + index + 1 }}
                    </template>
                </Column>
                <Column
                    header="Judul Kepdir"
                    dataType="text"
                    field="name"
                />
                <Column
                    header="Nama File"
                    dataType="text"
                    field="nama_file"
                />
                <Column
                    header="Uploaded By (Time)"
                    dataType="text"
                    field="modified_by"
                />
                <Column
                    header="Modified By (Time)"
                    dataType="text"
                    field="modified_by"
                />
                <!-- <Column
                    header="Uploaded By (Time)"
                    dataType="text"
                    field="status"
                >
                    <template #body="{ data }">
                        <Tag 
                            :value="data.status" 
                            :severity="data.status === 'Hadir' ? 'success' : 'danger'"
                        />
                    </template>
                </Column> -->
            </DataTable>
        </div>
    </div>
    <Toast />
    <ConfirmDialog
        :draggable="false"
        group="delete-group"
        :pt="{
            pcCloseButton: {
                root: {
                    class: 'hidden'
                }
            },
            accept: {
                label: 'yaaaa'
            }
        }"
    >
        <template #container="{ message, acceptCallback, rejectCallback }">
            <div class="p-confirmdialog">
                <div class="p-dialog-header">
                    <span class="p-dialog-title">{{ message.header }}</span>
                </div>
                <div class="p-dialog-content">
                    <span class="p-confirmdialog-message">
                        {{ message.message }}
                        <strong class="ml-1">
                            {{ dataRoles.name }}
                        </strong>
                    </span>
                </div>
                <div class="p-dialog-footer">
                    <Button
                        :disabled="isLoading"
                        label="Tidak"
                        class="p-confirmdialog-reject-button order-1"
                        type="button"
                        severity="danger"
                        @click="handleReject(rejectCallback)"
                    />
                    <Button
                        :loading="isLoading"
                        :label="isLoading ? 'Menghapus Data' : 'Ya'"
                        class="p-confirmdialog-accept-button order-2"
                        type="button"
                        severity="success"
                        @click="handleAccept(acceptCallback)"
                    />
                </div>
            </div>
        </template>
    </ConfirmDialog>




</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
