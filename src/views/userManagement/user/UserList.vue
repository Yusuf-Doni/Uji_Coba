<script setup>
import BusinessAreaService from '@/service/BusinessAreaService';
import ExportService from '@/service/ExportService';
import RoleService from '@/service/RoleService';
import { formatDate } from '@/utils/dateFormatter';
import debounce from '@/utils/debounce';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import IParams from '../../../interface/IParams';
import omit from '@/utils/omit';

const datas = ref([]);
const search = ref(null);
const loading = ref(null);
const param = ref({
    ...IParams
});
const toast = useToast();
const totalRecords = ref(0);
const router = useRouter();
const isLoadingExport = ref(false);

// state business area
const businessAreaOpt = ref();
const isLoadingBusinessArea = ref();
const totalPageBusinessArea = ref(0);
const paramBusinessArea = ref({ ...IParams });

const companyCodeOpt = ref([]);
const totalPageCompanyCode = ref(0);
const isLoadingCompanyCode = ref();
const selectedCompanyCode = ref();
const paramCompanyCode = ref({ ...IParams });

// state roles
const rolesOpt = ref();
const isLoadingRoles = ref();
const totalPageRoles = ref(0);
const paramRoles = ref({ ...IParams });


// handle business area
const getOptBusinessArea = async () => {
    isLoadingBusinessArea.value = true;
    paramBusinessArea.value.personel_area =
        selectedCompanyCode.value?.id ?? null;
    await BusinessAreaService.getActive(paramBusinessArea.value)
        .then((response) => {
            businessAreaOpt.value = response.data.data;

            totalPageBusinessArea.value = Math.ceil(
                response.data.totalElement / 10
            );
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
            isLoadingBusinessArea.value = false;
        });
};

const onScrollEventBusinessArea = async (event) => {
    if (
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
        if (
            paramBusinessArea.value.size < totalPageBusinessArea.value * 10 &&
            !isLoadingBusinessArea.value
        ) {
            paramBusinessArea.value.size += 10;
            await getOptBusinessArea();
        }
    }
};

const filterBusinessAreaAPi = (events) => {
    paramBusinessArea.value.size = 10;
    paramBusinessArea.value.search = events.value;
    getOptBusinessArea();
};

const debounceFilterBusinessArea = debounce(filterBusinessAreaAPi, 500);

const onFilterBusinessArea = (event) => {
    businessAreaOpt.value = [];
    debounceFilterBusinessArea(event);
};

// handle roles
const getOptRoles = async () => {
    isLoadingRoles.value = true;
    await RoleService.get(paramRoles.value)
        .then((response) => {
            rolesOpt.value = response.data.data;

            totalPageRoles.value = Math.ceil(response.data.totalElement / 10);
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
            isLoadingRoles.value = false;
        });
};

const onScrollEventRoles = async (event) => {
    if (
        event.target.scrollTop + event.target.clientHeight >=
        event.target.scrollHeight
    ) {
        if (
            paramRoles.value.size < totalPageRoles.value * 10 &&
            !isLoadingRoles.value
        ) {
            paramRoles.value.size += 10;
            await getOptRoles();
        }
    }
};

const filterRolesAPi = (events) => {
    paramRoles.value.size = 10;
    paramRoles.value.search = events.value;
    getOptRoles();
};

const debounceFilterRoles = debounce(filterRolesAPi, 500);

const onFilterRoles = (event) => {
    rolesOpt.value = [];
    debounceFilterRoles(event);
};

function getData() {
    loading.value = true;
        loading.value = false;
}

function onClickEditUser(data) {
    router.push({
        path: `/user-management/user/edit/${data.id}`
    });
}
const onPage = (event) => {
    param.value.size = event.rows;
    param.value.page = event.page;
    getData();
};

const exportExcel = async () => {
    isLoadingExport.value = true;
    await ExportService.exportFile(
        'user',
        {
            businessAreaId: param.value?.unitId || null,
            roleId: param.value?.roleId || null,
            search: search.value,
            companyId: selectedCompanyCode.value?.id || null
        },
        'user_all' + formatDate(new Date(), 'YYYYMMMDD_HHmmss'),
        'xlsx'
    );
    isLoadingExport.value = false;
};

onMounted(() => {
    getData();
    getOptCompanyCode();
    getOptRoles();
});
</script>

<template>
    <div>
        <div class="font-semibold text-xl mb-4">Daftar User</div>

        <div class="card">
            <DataTable
                :value="datas"
                :paginator="true"
                scrollable
                :scroll-height="'400px'"
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
                    <div class="flex justify-end gap-4">
                        <Select
                            :virtual-scroller-options="{
                                autoSize: true,
                                lazy: true,
                                onLazyLoad: isLoadingCompanyCode,
                                showLoader: isLoadingCompanyCode,
                                loading: isLoadingCompanyCode,
                                itemSize: 38,
                                delay: 0,
                                onscroll: (event) => {
                                    onScrollEventCompanyCode(event);
                                }
                            }"
                            :loading="isLoadingCompanyCode"
                            :filter="true"
                            name="companyCode"
                            :options="companyCodeOpt"
                            :filterFields="['description']"
                            placeholder="Pilih Personal Area"
                            @filter="onFilterCompanyCode"
                            @change="onChangePersonalArea"
                            :showClear="true"
                            v-model="selectedCompanyCode"
                            optionLabel="description"
                            
                        >
                            <template #emptyfilter>
                                {{ '' }}
                            </template>
                            <template #empty>
                                {{ '' }}
                            </template>
                        </Select>
                        
                        <Select
                            :virtual-scroller-options="{
                                autoSize: true,
                                lazy: true,
                                onLazyLoad: isLoadingBusinessArea,
                                showLoader: isLoadingBusinessArea,
                                loading: isLoadingBusinessArea,
                                itemSize: 38,
                                delay: 0,
                                onscroll: (event) => {
                                    onScrollEventBusinessArea(event);
                                }
                            }"
                            :loading="isLoadingBusinessArea"
                            :filter="true"
                            name="businessArea"
                            :options="businessAreaOpt"
                            :filterFields="['description']"
                            placeholder="Pilih Personal Sub Area"
                            @filter="onFilterBusinessArea"
                            v-model="param.unitId"
                            optionLabel="description"
                            optionValue="id"
                            @change="getData"
                            :showClear="true"
                        >
                            <template #emptyfilter>
                                {{ '' }}
                            </template>
                            <template #empty>
                                {{ '' }}
                            </template>
                        </Select>
                        <Select
                            :virtual-scroller-options="{
                                autoSize: true,
                                lazy: true,
                                onLazyLoad: isLoadingRoles,
                                showLoader: isLoadingRoles,
                                loading: isLoadingRoles,
                                itemSize: 38,
                                delay: 0,
                                onscroll: (event) => {
                                    onScrollEventRoles(event);
                                }
                            }"
                            :loading="isLoadingRoles"
                            :filter="true"
                            name="roles"
                            :options="rolesOpt"
                            :filterFields="['displayName']"
                            placeholder="Pilih Role"
                            @filter="onFilterRoles"
                            @change="getData"
                            :showClear="true"
                            v-model="param.roleId"
                            optionLabel="displayName"
                            optionValue="id"
                        >
                            <template #emptyfilter>
                                {{ '' }}
                            </template>
                            <template #empty>
                                {{ '' }}
                            </template>
                        </Select>
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText autocomplete="off" 
                                v-model="search"
                                @change="getData()"
                                placeholder="Search"
                            />
                        </IconField>
                        <Button
                            icon="pi pi-file-excel"
                            severity="primary"
                            label="Export"
                            type="button"
                            :loading="isLoadingExport"
                            @click="exportExcel"
                        />
                        <Button
                            as="router-link"
                            label="Add User"
                            to="/user-management/user/add"
                            severity="info"
                        />
                    </div>
                </template>
                <template #empty> Data not found... </template>
                <template #loading> Loading data. Please wait. </template>
                <Column
                    header="No."
                    style="min-width: 5rem"
                >
                    <template #body="{ index }">
                        {{ param.page * param.size + index + 1 }}
                    </template>
                </Column>
                <Column
                    header="Username"
                    dataType="text"
                    field="username"
                />
                <Column
                    header="Nama"
                    dataType="text"
                    field="name"
                />
                <Column
                    header="Unit Kerja"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <ul
                            v-if="data?.unitKerja"
                            class="list-disc"
                        >
                            <li
                                v-for="unitKerja in data.unitKerja.split(',')"
                                :key="unitKerja"
                            >
                                {{ unitKerja }}
                            </li>
                        </ul>
                    </template>
                </Column>
                <Column
                    header="Roles"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <ul
                            v-if="data.roles"
                            class="list-disc"
                        >
                            <li
                                v-for="role in data.roles.split(',')"
                                :key="role"
                            >
                                {{ role }}
                            </li>
                        </ul>
                    </template>
                </Column>
                <Column
                    header="Nama Vendor"
                    dataType="text"
                    style="min-width: 10rem"
                >
                    <template #body="{ data }">
                        <ul
                            v-if="data.vendor"
                            class="list-disc"
                        >
                            <li
                                v-for="vendor in data.vendor.split(',')"
                                :key="vendor"
                            >
                                {{ vendor }}
                            </li>
                        </ul>
                    </template>
                </Column>
                <Column
                    header="Aksi"
                    class="w-[5rem]"
                >
                    <template #body="{ data }">
                        <div
                            class="flex flex-col md:flex-row gap-4 justify-center items-start"
                        >
                            <Button
                                icon="pi pi-pencil"
                                severity="warn"
                                rounded
                                aria-label="Edit User"
                                @click="onClickEditUser(data)"
                                v-tooltip.bottom="'Edit User'"
                            />
                        </div>
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>
    <Toast />
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold;
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold;
}
</style>
