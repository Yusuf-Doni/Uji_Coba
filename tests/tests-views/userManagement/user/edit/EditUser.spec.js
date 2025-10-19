import BusinessAreaService from '@/service/BusinessAreaService';
import CompanyCodeService from '@/service/CompanyCodeService';
import RoleService from '@/service/RoleService';
import UserService from '@/service/UserService';
import EditUser from '@/views/userManagement/user/edit/EditUser.vue';
import { flushPromises, shallowMount } from '@vue/test-utils';
import {
    Column,
    ConfirmationService,
    DataTable,
    DialogService,
    Toast,
    ToastService
} from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { useRoute } from 'vue-router';

function factory() {
    return shallowMount(EditUser, {
        global: {
            plugins: [
                PrimeVue,
                ToastService,
                ConfirmationService,
                DialogService
            ],
            stubs: {
                Message: true,
                Button: true,
                ProgressSpinner: true,
                Skeleton: true,
                Select: true,
                Fluid: true,
                IconField: true,
                InputText: true,
                InputIcon: true,
                ConfirmDialog: true,
                TabPanels: true,
                TabPanel: true,
                TabList: true,
                Tabs: true,
                Tab: true,
                Password: true,
                Checkbox: true,
                Fieldset: true,
                Divider: true,
                Dialog: true,
                AddVendorModal: true,
                AddUnitKerjaModal: true
            },
            components: {
                DataTable,
                Column,
                Toast
            }
        },
        props: {}
    });
}

vi.mock('@/service/RoleService', () => ({
    default: {
        get: vi.fn()
    }
}));

vi.mock('@/service/UserService', () => ({
    default: {
        get: vi.fn(),
        getById: vi.fn(),
        post: vi.fn(),
        updateUser: vi.fn()
    }
}));

vi.mock('@/service/CompanyCodeService', () => ({
    default: {
        get: vi.fn(),
        getById: vi.fn()
    }
}));

vi.mock('@/service/BusinessAreaService', () => ({
    default: {
        get: vi.fn(),
        getByCompanyCode: vi.fn()
    }
}));

const mockConfirm = {
    require: vi.fn()
};

vi.mock('primevue/useconfirm', () => {
    return {
        useConfirm: () => mockConfirm
    };
});

const mockToast = {
    add: vi.fn()
};

vi.mock('primevue/usetoast', () => {
    return {
        useToast: () => mockToast
    };
});

vi.mock('vue-router', () => ({
    useRoute: vi.fn(),
    useRouter: vi.fn(() => ({
        push: () => {}
    }))
}));

const mockListRole = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: [
            {
                id: 14,
                name: 'vendor',
                description: 'Vendor',
                displayName: 'Vendor',
                permissions: [
                    {
                        id: 17,
                        name: 'ADD_TENAGA_KERJA',
                        displayName: 'Tambah Tenaga Kerja',
                        description: 'Button Add Tenaga Kerja',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 109,
                        name: 'kanal_komunikasi',
                        displayName: 'Kanal Komunikasi',
                        description: 'Menu Kanal Komunikasi',
                        moduleDisplayName: 'Modul Master Data'
                    },
                    {
                        id: 29,
                        name: 'VIEW_EVALUASI_TINDAK_LANJUT',
                        displayName: 'Detail Evaluasi Tindak Lanjut',
                        description: 'Button View Evaluasi Tindak Lanjut',
                        moduleDisplayName: 'Modul Evaluasi'
                    },
                    {
                        id: 9,
                        name: 'VIEW_KONTRAK',
                        displayName: 'View Kontrak',
                        description: 'Button View Kontrak',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 1041,
                        name: 'mnu_perjanjian',
                        displayName: 'Perjanjian',
                        description: 'Perjanjian',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 20,
                        name: 'ADD_TENAGA_KERJA_BL',
                        displayName: 'Tambah Tenaga Kerja Blacklist',
                        description: 'Button Add Tenaga Kerja Blacklist',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 6,
                        name: 'VIEW_VENDOR_BL',
                        displayName: 'Detail Vendor Blacklist',
                        description: 'Button View Vendor Blacklist',
                        moduleDisplayName: 'Modul Vendor'
                    },
                    {
                        id: 8,
                        name: 'EDIT_KONTRAK',
                        displayName: 'Edit Kontrak',
                        description: 'Button Edit Kontrak',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 18,
                        name: 'EDIT_TENAGA_KERJA',
                        displayName: 'Edit Tenaga Kerja',
                        description: 'Button Edit Tenaga Kerja',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 10,
                        name: 'UPLOAD_TENAGA_KERJA',
                        displayName: 'Upload Tenaga Kerja',
                        description: 'Button Upload Tenaga Kerja',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 11,
                        name: 'ADD_KONTRAK_NAKER',
                        displayName: 'Tambah Tenaga Kerja',
                        description: 'Button Add Kontrak - Tenaga Kerja',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 3,
                        name: 'VIEW_VENDOR',
                        displayName: 'Detail Vendor',
                        description: 'Button View Vendor',
                        moduleDisplayName: 'Modul Vendor'
                    },
                    {
                        id: 40,
                        name: 'EDIT_KANAL_KOMUNIKASI',
                        displayName: 'View Kanal Komunikasi',
                        description: 'Button View Kanal Komunikasi',
                        moduleDisplayName: 'Modul Report'
                    },
                    {
                        id: 108,
                        name: 'evaluasi_perjanjian',
                        displayName: 'Evaluasi Perjanjian',
                        description: 'Menu Evaluasi Perjanjian',
                        moduleDisplayName: 'Modul Evaluasi'
                    },
                    {
                        id: 13,
                        name: 'UPLOAD_KINERJA_INDIVIDU',
                        displayName: 'Upload Kinerja Individu',
                        description: 'Button Upload Kinerja Individu',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 106,
                        name: 'tenaga_kerja',
                        displayName: 'Tenaga Kerja',
                        description: 'Menu Tenaga Kerja',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 104,
                        name: 'perjanjian',
                        displayName: 'Perjanjian',
                        description: 'Menu Perjanjian',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 1083,
                        name: 'tindak_lanjut',
                        displayName: 'Tindak Lanjut',
                        description: 'Tindak Lanjut',
                        moduleDisplayName: 'Modul Evaluasi'
                    },
                    {
                        id: 103,
                        name: 'vendor',
                        displayName: 'Vendor',
                        description: 'Menu Vendor',
                        moduleDisplayName: 'Modul Vendor'
                    },
                    {
                        id: 19,
                        name: 'VIEW_TENAGA_KERJA',
                        displayName: 'Detail Tenaga Kerja',
                        description: 'Button View Tenaga Kerja',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 12,
                        name: 'SELECT_TENAGA_KERJA',
                        displayName: 'Pilih Tenaga Kerja',
                        description: 'Button Pilih Tenaga Kerja',
                        moduleDisplayName: 'Modul Kontrak'
                    },
                    {
                        id: 1061,
                        name: 'tenaga_kerja_aktif',
                        displayName: 'Tenaga Kerja',
                        description: 'Tenaga Kerja',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 1032,
                        name: 'vendor_blacklist',
                        displayName: 'Vendor Blacklist',
                        description: 'Vendor Blacklist',
                        moduleDisplayName: 'Modul Vendor'
                    },
                    {
                        id: 1062,
                        name: 'tenaga_kerja_bl',
                        displayName: 'Tenaga Kerja Blacklist',
                        description: 'Tenaga Kerja Blacklist',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 39,
                        name: 'VIEW_KANAL_KOMUNIKASI',
                        displayName: 'Edit Kanal Komunikasi',
                        description: 'Button Edit Kanal Komunikasi',
                        moduleDisplayName: 'Modul Report'
                    },
                    {
                        id: 1031,
                        name: 'vendor_aktif',
                        displayName: 'Vendor Aktif',
                        description: 'Vendor Aktif',
                        moduleDisplayName: 'Modul Vendor'
                    },
                    {
                        id: 21,
                        name: 'VIEW_TENAGA_KERJA_BL',
                        displayName: 'Detail Tenaga Kerja Blacklist',
                        description: 'Button View Tenaga Kerja Blacklist',
                        moduleDisplayName: 'Modul Tenaga Kerja'
                    },
                    {
                        id: 28,
                        name: 'EDIT_EVALUASI_TINDAK_LANJUT',
                        displayName: 'Edit Evaluasi Tindak Lanjut',
                        description: 'Button Edit Evaluasi Tindak Lanjut',
                        moduleDisplayName: 'Modul Evaluasi'
                    }
                ]
            }
        ]
    }
};

const mockDataUser = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: {
            id: 56,
            username: 'fafsdf@a',
            domain: null,
            username2: 'fafsdf@a',
            name: 'ilhambaso',
            email: 'fafsdf@a',
            adEmployeeNumber: null,
            roles: [
                {
                    id: 15,
                    name: 'tenaga_kerja',
                    description: 'Tenaga Kerja',
                    displayName: 'Tenaga Kerja',
                    permissions: [
                        {
                            id: 40,
                            name: 'EDIT_KANAL_KOMUNIKASI',
                            displayName: 'View Kanal Komunikasi',
                            description: 'Button View Kanal Komunikasi',
                            moduleDisplayName: 'Modul Report'
                        },
                        {
                            id: 109,
                            name: 'kanal_komunikasi',
                            displayName: 'Kanal Komunikasi',
                            description: 'Menu Kanal Komunikasi',
                            moduleDisplayName: 'Modul Master Data'
                        },
                        {
                            id: 39,
                            name: 'VIEW_KANAL_KOMUNIKASI',
                            displayName: 'Edit Kanal Komunikasi',
                            description: 'Button Edit Kanal Komunikasi',
                            moduleDisplayName: 'Modul Report'
                        },
                        {
                            id: 38,
                            name: 'ADD_KANAL_KOMUNIKASI',
                            displayName: 'Add Kanal Komunikasi',
                            description: 'Button Add Kanal Komunikasi',
                            moduleDisplayName: 'Modul Report'
                        }
                    ]
                }
            ],
            unitKerjas: [],
            vendors: [],
            businessArea: null,
            company: null,
            password: null,
            nip: null,
            passwordConfirmation: ''
        }
    }
};

describe('EditUser.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        RoleService.get.mockResolvedValue(mockListRole);
        UserService.get.mockResolvedValue(mockDataUser);
        CompanyCodeService.get.mockResolvedValue({
            code: 200,
            success: true,
            data: []
        });
        useRoute.mockImplementationOnce(() => ({
            params: {
                idUser: null
            }
        }));
    });

    describe('Initial State', () => {
        it('should get data role on mount', async () => {
            RoleService.get.mockResolvedValue(mockListRole);
            const wrapper = factory();
            wrapper.vm.geListRoles();

            await flushPromises();
            const mappedRoleListResponse = mockListRole.data.data.map(
                (item) => {
                    return {
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        displayName: item.displayName
                    };
                }
            );

            expect(wrapper.vm.rolesList).toEqual(mappedRoleListResponse);
        });
    });

    describe('Component Method', () => {
        it('should get data business area', async () => {
            BusinessAreaService.getByCompanyCode.mockResolvedValue({
                code: 200,
                success: true
            });
            const wrapper = factory();
            wrapper.vm.detailUser = {
                company: { code: 1 }
            };
            wrapper.vm.paramBusinessArea = {
                search: '',
                page: 0,
                size: 10
            };

            wrapper.vm.getOptBusinessArea();

            await flushPromises();

            expect(BusinessAreaService.getByCompanyCode).toHaveBeenCalled();
        });

        it('should get detail user successfully', async () => {
            UserService.getById.mockResolvedValue(mockDataUser);
            const wrapper = factory();

            wrapper.vm.getDetailUser();

            await flushPromises();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.detailUser).toEqual(mockDataUser.data.data);
            expect(UserService.getById).toHaveBeenCalled();
        });

        it('should get data company code successfully', async () => {
            CompanyCodeService.get.mockResolvedValue({
                code: 200,
                success: true,
                data: []
            });
            const wrapper = factory();

            wrapper.vm.getDataCompanyCode();

            await flushPromises();

            expect(CompanyCodeService.get).toHaveBeenCalled();
        });

        it('should add data user successfully', async () => {
            UserService.post.mockResolvedValue({
                code: 200,
                success: true
            });

            const wrapper = factory();

            wrapper.vm.selectedRoles = [];

            wrapper.vm.saveInputToService();

            await flushPromises();

            expect(UserService.post).toHaveBeenCalled();
        });

        it('should edit data user successfully', async () => {
            UserService.updateUser.mockResolvedValue({
                code: 200,
                success: true
            });

            const mockRoute = {
                params: {
                    idUser: 123
                }
            };
            useRoute.mockImplementation(() => mockRoute);

            useRoute();

            const wrapper = factory();

            wrapper.vm.selectedRoles = [];

            wrapper.vm.saveInputToService();

            await flushPromises();

            expect(UserService.updateUser).toHaveBeenCalled();
        });
    });

    describe('UI Interaction', () => {
        it('should open Add Vendor Modal', async () => {
            const wrapper = factory();
            wrapper.vm.onClickAddVendor();

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.visibleAddVendorModal).toBe(true);
        });

        it('should hide Add Vendor Modal', async () => {
            const wrapper = factory();
            wrapper.vm.onHideAddVendorModal();

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.visibleAddVendorModal).toBe(false);
        });

        it('should open Add Unit Kerja Modal', async () => {
            const wrapper = factory();
            wrapper.vm.onClickAddUnitKerja();

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.visibleAddUnitKerjaModal).toBe(true);
        });

        it('should hide Add Unit Kerja Modal', async () => {
            const wrapper = factory();
            wrapper.vm.onHideAddUnitKerjaModal();

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.visibleAddUnitKerjaModal).toBe(false);
        });

        it('should show vendor tab', async () => {
            const wrapper = factory();
            wrapper.vm.selectedRoles = [
                {
                    name: 'vendor'
                }
            ];

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.showVendorTab).toBe(true);
        });

        it('should show button save', async () => {
            const mockRoute = {
                params: {
                    idUser: 123
                }
            };
            useRoute.mockImplementation(() => mockRoute);

            useRoute();

            const wrapper = factory();

            await nextTick();
            await wrapper.vm.$nextTick();

            expect(wrapper.vm.isEdit).toBe(true);
            expect(wrapper.vm.showBtSave).toBe(true);
        });
    });
});
