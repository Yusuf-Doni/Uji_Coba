// import RoleService from '@/service/RoleService';
import BusinessAreaService from '@/service/BusinessAreaService';
import RoleService from '@/service/RoleService';
import UserService from '@/service/UserService';
import UserList from '@/views/userManagement/user/UserList.vue';
import { flushPromises, mount } from '@vue/test-utils';
import {
    ConfirmationService,
    DataTable,
    DialogService,
    Toast,
    ToastService,
    Tooltip
} from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'vue-router';

function factory() {
    return mount(UserList, {
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
                Dialog: true,
                Checkbox: true,
                DataTable: true,
                Column: true
            },
            components: {
                Toast
            },
            directives: {
                tooltip: Tooltip
            }
        },
        props: {}
    });
}

vi.mock('@/service/UserService', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
        getById: vi.fn()
    }
}));

vi.mock('@/service/BusinessAreaService', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
        getById: vi.fn(),
        getActive: vi.fn()
    }
}));

vi.mock('@/service/RoleService', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
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

const mockDataList = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: [
            {
                id: 56,
                username: 'fafsdf@a',
                name: 'ilhambaso',
                unitKerja: '',
                roles: 'Tenaga Kerja',
                vendor: ''
            }
        ]
    }
};

const mockBusinessAreas = {
    code: 200,
    success: true,
    data: {
        data: [
            { id: 1, description: 'Business Area 1' },
            { id: 2, description: 'Business Area 2' }
        ],
        totalElement: 2
    }
};

const mockRoles = {
    code: 200,
    success: true,
    data: {
        data: [
            { id: 1, displayName: 'Role 1' },
            { id: 2, displayName: 'Role 2' }
        ],
        totalElement: 2
    }
};

describe('UserList.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        BusinessAreaService.getActive.mockResolvedValue(mockBusinessAreas);

        RoleService.get.mockResolvedValue(mockRoles);
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            UserService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });

        it('should get data business area', async () => {
            BusinessAreaService.getActive.mockResolvedValue({
                code: 200,
                success: true
            });
            const wrapper = factory();
            wrapper.vm.getOptBusinessArea();

            await flushPromises();
            expect(BusinessAreaService.getActive).toHaveBeenCalledTimes(2);
        });
    });

    describe('Feature Component', () => {
        it('should open edit dialog', async () => {
            const mockPush = vi.fn();
            useRouter.mockImplementationOnce(() => ({
                push: mockPush
            }));

            const wrapper = factory();
            const testData = {
                id: 1
            };
            await wrapper.vm.onClickEditUser(testData);

            expect(mockPush).toHaveBeenCalledTimes(1);
        });
    });
});
