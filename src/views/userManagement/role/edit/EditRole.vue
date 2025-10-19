<script setup>
import RoleService from '@/service/RoleService';
import { Form } from '@primevue/forms';
import { yupResolver } from '@primevue/forms/resolvers/yup';
import { useConfirm, useToast } from 'primevue';
import { onBeforeMount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { object, string } from 'yup';

const dataRole = ref();
const isLoadingDetail = ref(false);
const isLoadingSave = ref(false);
const isLoadingListPermission = ref(false);
const permissionsList = ref([]);
const selectedPermissions = ref();
const formUmumRef = ref();
const confirmSave = useConfirm();
const route = useRoute();
const toast = useToast();
const router = useRouter();

const resolver = yupResolver(
    object().shape({
        systemName: string().required('system name harus diisi'),
        displayName: string().required('display name harus diisi'),
        description: string().required('description harus diisi')
    })
);

const getDetailRole = () => {
    isLoadingDetail.value = true;
    RoleService.getById(route.params.idRole)
        .then((response) => {
            isLoadingDetail.value = false;
            if (response.data.code == 200) {
                dataRole.value = {
                    ...response.data.data,
                    systemName: response.data.data.name
                };

                selectedPermissions.value = dataRole.value.permissions;
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
            isLoadingDetail.value = false;
        });
};

const onClickSubmit = () => {
    formUmumRef.value.onSubmit();
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

const saveInputToService = (data) => {
    const payload = {
        ...data,
        id: Number(route.params.idRole),
        name: data.systemName,
        permissions: selectedPermissions.value.map((item) => {
            return {
                id: item.id
            };
        })
    };

    isLoadingSave.value = true;
    RoleService.put(payload)
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
};

onBeforeMount(() => {
    getDetailRole();
    geListPermission();
});

onMounted(() => {});
</script>
<template>
    <div>
        <div class="font-semibold text-xl mb-4">Edit Role</div>
        <div v-if="isLoadingDetail">
            <Skeleton class="mb-2"></Skeleton>
            <Skeleton class="mb-2 w-1/2"></Skeleton>
            <Skeleton class="mb-2 w-1/3"></Skeleton>
        </div>
        <div
            class="card"
            v-else
        >
            <Tabs value="0">
                <TabList>
                    <Tab value="0">Info Umum</Tab>
                    <Tab value="1">Permission</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="0">
                        <div class="grid grid-cols-12 gap-2">
                            <div class="col-span-12">
                                <Fluid>
                                    <Form
                                        ref="formUmumRef"
                                        v-slot="$form"
                                        :resolver="resolver"
                                        :initial-values="dataRole"
                                        @submit="onSubmitEvent"
                                        class="flex flex-col gap-4 w-full"
                                    >
                                        <div class="grid grid-cols-12 gap-2">
                                            <label
                                                for="systemName"
                                                class="block font-bold mb-3 col-span-2 align-middle self-center"
                                            >
                                                System Name<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-10">
                                                <InputText autocomplete="off" 
                                                    name="systemName"
                                                    type="text"
                                                    placeholder="System Name"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.systemName
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.systemName.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-12 gap-2">
                                            <label
                                                for="displayName"
                                                class="block font-bold mb-3 col-span-2 align-middle self-center"
                                            >
                                                Display Name<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-10">
                                                <InputText autocomplete="off" 
                                                    name="displayName"
                                                    type="text"
                                                    placeholder="Display Name"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.displayName
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.displayName.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-12 gap-2">
                                            <label
                                                for="description"
                                                class="block font-bold mb-3 col-span-2"
                                            >
                                                Description<span
                                                    class="text-danger"
                                                    >*</span
                                                >
                                            </label>
                                            <div class="col-span-10">
                                                <Textarea
                                                    placeholder="Description"
                                                    class="w-full"
                                                    name="description"
                                                    rows="5"
                                                    cols="30"
                                                />
                                                <Message
                                                    v-if="
                                                        $form.description
                                                            ?.invalid
                                                    "
                                                    severity="error"
                                                    size="small"
                                                    variant="simple"
                                                >
                                                    {{
                                                        $form.description.error
                                                            ?.message
                                                    }}
                                                </Message>
                                            </div>
                                        </div>
                                    </Form>
                                </Fluid>
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="1">
                        <div class="flex flex-wrap gap-2">
                            <Fieldset
                                v-for="(modulePerm, index) in permissionsList"
                                :key="index"
                                :legend="modulePerm.moduleDisplayName"
                            >
                                <div
                                    v-for="perm in modulePerm.permissions"
                                    :key="perm.id"
                                >
                                    <Checkbox
                                        v-model="selectedPermissions"
                                        :inputId="perm.id.toString()"
                                        name="role"
                                        :value="perm"
                                        class="mr-1"
                                    />
                                    <label :for="perm.id">
                                        {{ perm.description }}
                                    </label>
                                </div>
                            </Fieldset>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
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
