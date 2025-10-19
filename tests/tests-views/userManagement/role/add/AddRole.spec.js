import PermissionService from '@/service/PermissionService';
import RoleService from '@/service/RoleService';
import AddRole from '@/views/userManagement/role/add/AddRole.vue';
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

function factory() {
    return shallowMount(AddRole, {
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
        post: vi.fn()
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

describe('AddRole.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PermissionService.get.mockResolvedValue(mockListPermission);
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
            RoleService.post.mockResolvedValue({
                code: 200,
                success: true
            });

            const wrapper = factory();

            wrapper.vm.saveInputToService({
                systemName: 'Modul Kontrak',
                description: 'Button Amandemen Kontrak',
                displayName: 'Amandemen Kontrak'
            });

            await flushPromises();

            expect(RoleService.post).toHaveBeenCalled();
        });
    });
});
