<script setup>
import RoleService from '@/views/master/userAdministration/mock/roles';
import UsersService from '@/views/master/userAdministration/mock/users';
import { useAuth } from '@/stores';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { computed, onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string, ref as yref } from 'yup';
import RegisterService from '@/views/master/userAdministration/mock/register';
import JabatanService from '@/views/master/jabatan/service/jabatan';

const detailUser = ref({
    id: null,
    username: '',
    name: '',
    email: '',
    phoneNumber: '',
    roles: [],
    password: '',
    passwordConfirmation: '',
    isActive: true
});
const rolesList = ref([]);
const selectedRoles = ref();
const isLoadingSave = ref(false);
const isLoadingDetail = ref(false);
const isLoadingListRoles = ref(false);
const isLoadingListJabatan = ref(false);
const jabatanListJabatan = ref([]);
const route = useRoute();
const confirmSave = useConfirm();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params?.idUser));
const showUpdatePass = ref(false);
const selectedJabatan = ref();
const resolver = computed(() => {
    let opt = {
        namaLengkap: string().required('Nama Lengkap tidak boleh kosong'),
        email: string()
            .email('Format Email tidak valid')
            .required('Email wajib diisi')
    };

    if (showUpdatePass.value || !isEdit.value) {
        opt = {
            ...opt,
            password: string()
                .min(8, 'Kata sandi harus minimal 8 karakter')
                .matches(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[a-zA-Z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/,
                    'Kata sandi setidaknya memiliki 1 huruf kecil dan besar, 1 angka dan 1 spesial karakter'
                )
                .required('Kata sandi wajib diisi'),
            passwordConfirmation: string()
                .oneOf(
                    [yref('password')],
                    'Kata sandi dan konfirmasi harus sama'
                )
                .required('Konfirmasi kata sandi wajib diisi')
        };
    }
    return yupResolver(object().shape(opt));
});

const toast = useToast();

const getDetailUser = async () => {
    try {
        isLoadingDetail.value = true;
        const response = await UsersService.getById(route.params.idUser);
        if (response.data.code === 200) {
            const userData = response.data.data;
            detailUser.value = {
                id: userData.id,
                namaLengkap: userData.namaLengkap || '',
                email: userData.email || '',
                roles: userData.roles || [],
                jabatan: userData.jabatan || [],
                password: userData.password || '',
                passwordConfirmation: userData.konfirmasiPassword || '',
                isActive: userData.isActive !== false
            };
            
            // Set selected roles based on existing roles
            if (userData.roles && userData.roles.length > 0) {
                // Map role IDs, handling both object and ID formats
                selectedRoles.value = userData.roles.map(role => {
                    return typeof role === 'object' ? role.id : role;
                });
                console.log('Selected roles:', selectedRoles.value);
            } else {
                selectedRoles.value = [];
            }
            
            // Set selected jabatan based on existing jabatan
            if (userData.jabatan && userData.jabatan.length > 0) {
                // Map jabatan IDs, handling both object and ID formats
                selectedJabatan.value = userData.jabatan.map(jabatan => {
                    return typeof jabatan === 'object' ? jabatan.id : jabatan;
                });
                console.log('Selected jabatan:', selectedJabatan.value);
            } else {
                selectedJabatan.value = [];
            }
        }
    } catch (error) {
        console.error('Error fetching user detail:', error);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Gagal mengambil data user',
            life: 3000
        });
    } finally {
        isLoadingDetail.value = false;
    }
};

const geListRoles = () => {
    isLoadingListRoles.value = true;
    RoleService.get()
        .then((response) => {
            if (response.data.code == 200) {
                rolesList.value = response.data.data.map((item) => {
                    return {
                        id: item.id,
                        name: item.namaRole,
                        description: item.deskripsi,
                        nomer: item.angka
                    };
                });

                // Load user detail after both roles and jabatan are loaded (for edit mode)
                if (isEdit.value && rolesList.value.length > 0 && jabatanListJabatan.value.length > 0) {
                    getDetailUser();
                }
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
            isLoadingListRoles.value = false;
        });
};

const geListJabatan = () => {
    isLoadingListJabatan.value = true;
    JabatanService.get()
        .then((response) => {
            if (response.data.code == 200) {
                jabatanListJabatan.value = response.data.data.map((item) => {
                    return {
                        id: item.id,
                        name: item.namaJabatan,
                        description: item.deskripsi,
                        nomer: item.angka
                    };
                });

                // Load user detail after both roles and jabatan are loaded (for edit mode)
                if (isEdit.value && rolesList.value.length > 0 && jabatanListJabatan.value.length > 0) {
                    getDetailUser();
                }
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
            isLoadingListJabatan.value = false;
        });
};

const onClickSubmit = (data) => {
    if (!data.valid) {
        return;
    }

    // Validate roles and jabatan selection
    if (!selectedRoles.value || selectedRoles.value.length === 0) {
        toast.add({
            severity: 'error',
            summary: 'Validasi Error',
            detail: 'Roles wajib dipilih minimal satu',
            life: 3000
        });
        return;
    }

    if (!selectedJabatan.value || selectedJabatan.value.length === 0) {
        toast.add({
            severity: 'error',
            summary: 'Validasi Error',
            detail: 'Jabatan wajib dipilih minimal satu',
            life: 3000
        });
        return;
    }

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
            saveInputToService();
        }
    });
};

const onClickKembali = () => {
    router.push('/user-administration/user');
};

const saveInputToService = async () => {
    try {
        isLoadingSave.value = true;
        
        const payload = {
            namaLengkap: detailUser.value.namaLengkap,
            email: detailUser.value.email,
            roleId: selectedRoles.value || [],
            jabatanId: selectedJabatan.value || [],
            isActive: detailUser.value.isActive
        };
        console.log('selectedJabatan', selectedJabatan.value);
        // Only include password if it's being updated or it's a new user
        if (showUpdatePass.value || !isEdit.value) {
            payload.password = detailUser.value.password;
            payload.konfirmasiPassword = detailUser.value.passwordConfirmation;
        }

        console.log('payload', payload);
        let response;
        if (isEdit.value) {
            // Update existing user
            response = await RegisterService.put(detailUser.value.id, payload);
        } else {
            // Create new user
            response = await RegisterService.post(payload);
        }
        
        toast.add({
            severity: 'success',
            summary: 'Berhasil',
            detail: isEdit.value ? 'Data user berhasil diperbarui' : 'Data user berhasil disimpan',
            life: 3000
        });
        
        // Navigate back to user list
        router.push('/user-administration/user');
        
    } catch (error) {
        console.error('Error saving user:', error);
        
        const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data';
        
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 5000
        });
        
        // Clear auth credentials before redirecting to prevent router guard conflicts
        const authStore = useAuth();
        authStore.removeCredentials();
        router.push('/auth/login');
    } finally {
        isLoadingSave.value = false;
    }
};

onBeforeMount(() => {
    geListRoles();
    geListJabatan();
});

onMounted(() => {});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">
            {{ isEdit ? 'Edit' : 'Add' }} User
        </div>
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
            <Form
                @submit="onClickSubmit"
                :resolver="resolver"
                v-slot="$form"
                :initialValues="detailUser"
            >
                <div class="grid grid-cols-12 gap-2">
                    <div class="col-span-12">
                        <Fieldset legend="User Info">
                            <Fluid>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="email"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Email <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-5">
                                        <InputText autocomplete="off" 
                                            name="email"
                                            type="email"
                                            v-show="
                                                !isLoadingDetail
                                            "
                                            placeholder="Email"
                                            v-model:model-value="
                                                detailUser.email
                                            "
                                        />
                                        <Message
                                            v-if="
                                                $form.email?.invalid
                                            "
                                            severity="error"
                                            size="small"
                                            variant="simple"
                                            >{{
                                                $form.email.error
                                                    ?.message
                                            }}</Message
                                        >
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="namaLengkap"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Nama Lengkap <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-5">
                                        <InputText autocomplete="off" 
                                            name="namaLengkap"
                                            type="text"
                                            v-show="
                                                !isLoadingDetail
                                            "
                                            placeholder="Nama Lengkap"
                                            v-model:model-value="
                                                detailUser.namaLengkap
                                            "
                                        />
                                        <Message
                                            v-if="
                                                $form.namaLengkap?.invalid
                                            "
                                            severity="error"
                                            size="small"
                                            variant="simple"
                                            >{{
                                                $form.namaLengkap.error
                                                    ?.message
                                            }}</Message
                                        >
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="password"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Password <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-5">
                                        <Password
                                            :feedback="false"
                                            name="password"
                                            placeholder="Password"
                                            v-model:model-value="
                                                detailUser.password
                                            "
                                            :disabled="
                                                !(
                                                    showUpdatePass ||
                                                    !isEdit
                                                )
                                            "
                                        />
                                        <Message
                                            v-if="
                                                $form.password
                                                    ?.invalid
                                            "
                                            severity="error"
                                            size="small"
                                            variant="simple"
                                            >{{
                                                $form.password.error
                                                    ?.message
                                            }}</Message
                                        >
                                        <div
                                            v-if="isEdit"
                                            class="flex gap-2 mt-2"
                                        >
                                            <Checkbox
                                                v-model="
                                                    showUpdatePass
                                                "
                                                binary
                                            />
                                            <label
                                                >Update
                                                Password</label
                                            >
                                        </div>
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="passwordConfirmation"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Konfirmasi Password <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-3">
                                        <Password
                                            :feedback="false"
                                            name="passwordConfirmation"
                                            placeholder="Konfirmasi Password"
                                            v-model:model-value="
                                                detailUser.passwordConfirmation
                                            "
                                            :disabled="
                                                !(
                                                    showUpdatePass ||
                                                    !isEdit
                                                )
                                            "
                                        />
                                        <Message
                                            v-if="
                                                $form
                                                    .passwordConfirmation
                                                    ?.invalid
                                            "
                                            severity="error"
                                            size="small"
                                            variant="simple"
                                            >{{
                                                $form
                                                    .passwordConfirmation
                                                    .error?.message
                                            }}</Message
                                        >
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="jabatan"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Jabatan <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-3">
                                        <Select
                                            v-model="selectedJabatan"
                                            :options="jabatanListJabatan"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Pilih Jabatan"
                                            :loading="isLoadingListJabatan"
                                            multiple
                                        />
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="roles"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Roles <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-3">
                                        <Select
                                            v-model="selectedRoles"
                                            :options="rolesList"
                                            optionLabel="name"
                                            optionValue="id"
                                            placeholder="Pilih Roles"
                                            :loading="isLoadingListRoles"
                                            multiple
                                        />
                                    </div>
                                </div>
                                <div
                                    class="grid grid-cols-12 gap-2 mb-2"
                                >
                                    <label
                                        for="isActive"
                                        class="block font-bold mb-3 col-span-3 align-middle self-center"
                                    >
                                        Status <span class="text-red-500">(*)</span>
                                    </label>
                                    <div class="col-span-9">
                                        <div class="flex gap-2 items-center">
                                            <Checkbox
                                                v-model="detailUser.isActive"
                                                binary
                                                :inputId="'isActive'"
                                            />
                                            <label for="isActive">Status Aktif</label>
                                        </div>
                                    </div>
                                </div>
                            </Fluid>
                        </Fieldset>
                    </div>
                </div>
                <Divider />
                <div class="flex justify-end">
                    <Button
                        class="w-max"
                        severity="primary"
                        type="submit"
                        :loading="isLoadingSave"
                        :label="isLoadingSave ? 'Menyimpan Data' : 'Simpan'"
                    />
                 
                </div>
            </Form>
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
