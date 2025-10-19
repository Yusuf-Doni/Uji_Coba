import PermissionService from '@/service/PermissionService';
import RoleService from '@/service/RoleService';
import EditRole from '@/views/userManagement/role/edit/EditRole.vue';
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
import { useRoute } from 'vue-router';

function factory() {
    return shallowMount(EditRole, {
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
                Form: true,
                Textarea: true
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

vi.mock('@/service/PermissionService', () => ({
    default: {
        get: vi.fn()
    }
}));

vi.mock('@/service/RoleService', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        getById: vi.fn()
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

const mockListPermission = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: [
            {
                id: 14,
                name: 'AMANDEMEN_KONTRAK',
                displayName: 'Amandemen Kontrak',
                description: 'Button Amandemen Kontrak',
                moduleDisplayName: 'Modul Kontrak'
            }
        ]
    }
};

const mockDetailRole = {
    data: {
        code: 200,
        success: true,
        message: 'Success',
        traceId: null,
        data: {
            id: 14,
            name: 'vendor',
            description: 'Vendor',
            displayName: 'Vendor',
            permissions: [
                {
                    id: 106,
                    name: 'tenaga_kerja',
                    displayName: 'Tenaga Kerja',
                    description: 'Menu Tenaga Kerja',
                    moduleDisplayName: 'Modul Tenaga Kerja'
                },
                {
                    id: 17,
                    name: 'ADD_TENAGA_KERJA',
                    displayName: 'Tambah Tenaga Kerja',
                    description: 'Button Add Tenaga Kerja',
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
                    id: 18,
                    name: 'EDIT_TENAGA_KERJA',
                    displayName: 'Edit Tenaga Kerja',
                    description: 'Button Edit Tenaga Kerja',
                    moduleDisplayName: 'Modul Tenaga Kerja'
                },
                {
                    id: 40,
                    name: 'EDIT_KANAL_KOMUNIKASI',
                    displayName: 'View Kanal Komunikasi',
                    description: 'Button View Kanal Komunikasi',
                    moduleDisplayName: 'Modul Report'
                },
                {
                    id: 104,
                    name: 'perjanjian',
                    displayName: 'Perjanjian',
                    description: 'Menu Perjanjian',
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
                    id: 39,
                    name: 'VIEW_KANAL_KOMUNIKASI',
                    displayName: 'Edit Kanal Komunikasi',
                    description: 'Button Edit Kanal Komunikasi',
                    moduleDisplayName: 'Modul Report'
                },
                {
                    id: 1032,
                    name: 'vendor_blacklist',
                    displayName: 'Vendor Blacklist',
                    description: 'Vendor Blacklist',
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
                    id: 1031,
                    name: 'vendor_aktif',
                    displayName: 'Vendor Aktif',
                    description: 'Vendor Aktif',
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
                    id: 9,
                    name: 'VIEW_KONTRAK',
                    displayName: 'View Kontrak',
                    description: 'Button View Kontrak',
                    moduleDisplayName: 'Modul Kontrak'
                },
                {
                    id: 19,
                    name: 'VIEW_TENAGA_KERJA',
                    displayName: 'Detail Tenaga Kerja',
                    description: 'Button View Tenaga Kerja',
                    moduleDisplayName: 'Modul Tenaga Kerja'
                },
                {
                    id: 1083,
                    name: 'tindak_lanjut',
                    displayName: 'Tindak Lanjut',
                    description: 'Tindak Lanjut',
                    moduleDisplayName: 'Modul Evaluasi'
                },
                {
                    id: 20,
                    name: 'ADD_TENAGA_KERJA_BL',
                    displayName: 'Tambah Tenaga Kerja Blacklist',
                    description: 'Button Add Tenaga Kerja Blacklist',
                    moduleDisplayName: 'Modul Tenaga Kerja'
                },
                {
                    id: 103,
                    name: 'vendor',
                    displayName: 'Vendor',
                    description: 'Menu Vendor',
                    moduleDisplayName: 'Modul Vendor'
                },
                {
                    id: 28,
                    name: 'EDIT_EVALUASI_TINDAK_LANJUT',
                    displayName: 'Edit Evaluasi Tindak Lanjut',
                    description: 'Button Edit Evaluasi Tindak Lanjut',
                    moduleDisplayName: 'Modul Evaluasi'
                },
                {
                    id: 29,
                    name: 'VIEW_EVALUASI_TINDAK_LANJUT',
                    displayName: 'Detail Evaluasi Tindak Lanjut',
                    description: 'Button View Evaluasi Tindak Lanjut',
                    moduleDisplayName: 'Modul Evaluasi'
                },
                {
                    id: 1061,
                    name: 'tenaga_kerja_aktif',
                    displayName: 'Tenaga Kerja',
                    description: 'Tenaga Kerja',
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
                    id: 10,
                    name: 'UPLOAD_TENAGA_KERJA',
                    displayName: 'Upload Tenaga Kerja',
                    description: 'Button Upload Tenaga Kerja',
                    moduleDisplayName: 'Modul Kontrak'
                },
                {
                    id: 6,
                    name: 'VIEW_VENDOR_BL',
                    displayName: 'Detail Vendor Blacklist',
                    description: 'Button View Vendor Blacklist',
                    moduleDisplayName: 'Modul Vendor'
                },
                {
                    id: 108,
                    name: 'evaluasi_perjanjian',
                    displayName: 'Evaluasi Perjanjian',
                    description: 'Menu Evaluasi Perjanjian',
                    moduleDisplayName: 'Modul Evaluasi'
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
                    id: 21,
                    name: 'VIEW_TENAGA_KERJA_BL',
                    displayName: 'Detail Tenaga Kerja Blacklist',
                    description: 'Button View Tenaga Kerja Blacklist',
                    moduleDisplayName: 'Modul Tenaga Kerja'
                },
                {
                    id: 13,
                    name: 'UPLOAD_KINERJA_INDIVIDU',
                    displayName: 'Upload Kinerja Individu',
                    description: 'Button Upload Kinerja Individu',
                    moduleDisplayName: 'Modul Kontrak'
                }
            ]
        }
    }
};

describe('EditRole.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PermissionService.get.mockResolvedValue(mockListPermission);
        RoleService.getById.mockResolvedValue(mockDetailRole);
        useRoute.mockImplementationOnce(() => ({
            params: {
                idRole: 14
            }
        }));
    });

    describe('Initial State', () => {
        it('should get data permission on mount', async () => {
            PermissionService.get.mockResolvedValue(mockListPermission);
            const wrapper = factory();
            wrapper.vm.geListPermission();

            const mappedResponse = [
                {
                    moduleDisplayName: 'Modul Kontrak',
                    permissions: [
                        {
                            description: 'Button Amandemen Kontrak',
                            displayName: 'Amandemen Kontrak',
                            id: 14,
                            moduleDisplayName: 'Modul Kontrak',
                            name: 'AMANDEMEN_KONTRAK'
                        }
                    ]
                }
            ];

            await flushPromises();

            expect(wrapper.vm.permissionsList).toEqual(mappedResponse);
        });
    });

    describe('Component Method', () => {
        it('should add data role successfully', async () => {
            RoleService.put.mockResolvedValue({
                code: 200,
                success: true
            });

            const wrapper = factory();
            wrapper.vm.selectedPermissions = [];

            wrapper.vm.saveInputToService({
                systemName: 'Modul Kontrak',
                description: 'Button Amandemen Kontrak',
                displayName: 'Amandemen Kontrak'
            });

            await flushPromises();

            expect(RoleService.put).toHaveBeenCalled();
        });
    });
});
