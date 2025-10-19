<script setup>
import RoleService from '@/service/RoleService';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm } from 'primevue';
import { useToast } from 'primevue/usetoast';
import { onBeforeMount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { object, string } from 'yup';


const isLoadingDetail = ref(false);
const isLoadingListPermission = ref(false);
const isLoadingSave = ref(false);
const permissionsList = ref([]);
const selectedPermissions = ref([]);
const formUmumRef = ref();
const confirmSave = useConfirm();
const router = useRouter();
const toast = useToast();

// DataTable related refs




const resolver = yupResolver(
    object().shape({
        kodeRole: string().required('Kode Role harus diisi'),
        role: string().required('Role harus diisi')
    })
);

const onClickSubmit = () => {
    formUmumRef.value.onSubmit();
};


const onClickKembali = () => {
    router.push('/user-roles-permissions/role');
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
        id: null,
        name: data.kodeRole,
        displayName: data.role,
        permissions: selectedPermissions.value.map((permission) => {
            return {
                id: permission.id
            };
        })
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
                router.push('/user-management/role');
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

const geListPermission = () => {
    // Mock permissions data
    isLoadingListPermission.value = true;
    
    // Simulate API delay
    setTimeout(() => {
        permissionsList.value = [
            {
                id: 1,
                systemName: 'master_user',
                displayName: 'Master User',
                description: 'Manajemen data user',
                module: 'Master User'
            },
            {
                id: 2,
                systemName: 'master_role_permission',
                displayName: 'Master Role & Permission',
                description: 'Manajemen role dan permission',
                module: 'Master Role & Permission'
            },
            {
                id: 3,
                systemName: 'jadwal_rapat',
                displayName: 'Jadwal Rapat',
                description: 'Manajemen jadwal rapat',
                module: 'Jadwal Rapat'
            },
            {
                id: 4,
                systemName: 'input_kedir',
                displayName: 'Input Kedir',
                description: 'Input data kedir',
                module: 'Input Kedir'
            }
        ];
        isLoadingListPermission.value = false;
    }, 500);
};

// DataTable selection handlers

onBeforeMount(() => {
    geListPermission();
});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">Tambah Role</div>
        <div v-if="isLoadingDetail">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2 w-1/2"></Skeleton>
            <Skeleton class="mb-2 w-1/3"></Skeleton>
        </div>
        <div
            class="card"
            v-else
        >
        <div class="flex justify-end">
                    <Button
                        class="w-max"
                        severity="warn"
                        type="submit"
                        @click="onClickKembali"
                        :loading="isLoadingSave"
                        :label="isLoadingSave ? 'Menyimpan Data' : 'Kembali'"
                    />
        </div>
            <div class="grid grid-cols-12 gap-2">
                <div class="col-span-12">
                    <Fluid>
                        <Form
                            ref="formUmumRef"
                            v-slot="$form"
                            :resolver="resolver"
                            @submit="onSubmitEvent"
                            class="flex flex-col gap-4 w-full"
                        >
                            <div class="grid grid-cols-12 gap-2">
                                <label
                                    for="kodeRole"
                                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                                >
                                    Kode Role <span class="text-red-500">(*)</span>
                                    
                                </label>
                                <div class="col-span-3">
                                    <InputText autocomplete="off" 
                                        name="kodeRole"
                                        type="text"
                                        placeholder="Kode Role"
                                    />
                                    <Message
                                        v-if="
                                            $form.kodeRole
                                                ?.invalid
                                        "
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{
                                            $form.kodeRole.error
                                                ?.message
                                        }}
                                    </Message>
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2">
                                <label
                                    for="role"
                                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                                >
                                    Role  <span class="text-red-500">(*)</span>
                                    
                                </label>
                                <div class="col-span-3">
                                    <InputText autocomplete="off" 
                                        name="role"
                                        type="text"
                                        placeholder="Role"
                                    />
                                    <Message
                                        v-if="
                                            $form.role
                                                ?.invalid
                                        "
                                        severity="error"
                                        size="small"
                                        variant="simple"
                                    >
                                        {{
                                            $form.role.error
                                                ?.message
                                        }}
                                    </Message>
                                </div>
                            </div>
                            <div class="grid grid-cols-12 gap-2">
                                <label
                                    for="permissions"
                                    class="block font-bold mb-3 col-span-2 align-middle self-center"
                                >
                                    Permission <span class="text-red-500">(*)</span>
                                </label>
                                <div class="col-span-10">
                                    <!---<div class="card">-->
                                        <DataTable
                                            :value="permissionsList"
                                            v-model:selection="selectedPermissions"
                                            dataKey="id"
                                            :loading="isLoadingListPermission"
                                            :paginator="true"
                                            :rows="5"
                                            :rowsPerPageOptions="[5, 10, 20]"
                                            tableStyle="min-width: 50rem"
                                            :showGridlines="true"
                                            :stripedRows="true"
                                            class="w-full"
                                        >
                                            <template #header>
                                                <div class="flex flex-wrap items-center justify-between gap-2">
                                                    <span class="text-xl font-bold">Daftar Permission</span>
                                                </div>
                                            </template>
                                            
                                            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                            
                                            <Column field="displayName" header="Nama Permission" sortable></Column>
                                            <Column field="description" header="Deskripsi" sortable></Column>
                                            <Column field="module" header="Module" sortable></Column>
                                            <Column field="systemName" header="System Name" sortable></Column>
                                            
                                            <template #footer>
                                                <div class="flex justify-between items-center">
                                                    <span>Total Permission: {{ permissionsList ? permissionsList.length : 0 }}</span>
                                                    <span>Selected: {{ selectedPermissions ? selectedPermissions.length : 0 }}</span>
                                                </div>
                                            </template>
                                            
                                            <template #empty>
                                                <div class="text-center py-4">
                                                    <i class="pi pi-inbox text-4xl text-gray-400 mb-2"></i>
                                                    <p class="text-gray-500">Tidak ada data permission</p>
                                                </div>
                                            </template>
                                            
                                            <template #loading>
                                                <div class="text-center py-4">
                                                    <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="4" />
                                                    <p class="mt-2 text-gray-500">Memuat data permission...</p>
                                                </div>
                                            </template>
                                        </DataTable>
                                    <!--</div>-->
                                </div>
                            </div>
                        </Form>
                    </Fluid>
                </div>
            </div>
            <Divider />
            <div class="flex justify-end">
                <Button
                    class="w-max"
                    severity="primary"
                    type="button"
                    @click="onClickSubmit"
                    :loading="isLoadingSave"
                    :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                />
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
