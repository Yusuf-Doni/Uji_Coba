import BusinessAreaService from '@/service/BusinessAreaService';
import BusinessArea from '@/views/master/businessArea/BusinessArea.vue';
import { flushPromises, mount } from '@vue/test-utils';
import {
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Dialog,
    DialogService,
    Toast,
    ToastService
} from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function factory() {
    return mount(BusinessArea, {
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
                BusinessAreaAddDialog: true
            },
            components: {
                DataTable,
                Column,
                ConfirmDialog,
                Toast
            }
        },
        props: {}
    });
}

vi.mock('@/service/BusinessAreaService', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn()
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

const mockDataList = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: [
            {
                id: 1,
                description: 'Kantor Pusat',
                code: '1001',
                company: {
                    id: 1,
                    description: 'Kantor Pusat Edit',
                    code: '1000',
                    status: 'ACTIVE'
                },
                shortText: '',
                longText: '',
                status: 'ACTIVE'
            }
        ]
    }
};

describe('BusinessArea.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            BusinessAreaService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });
    });

    describe('Feature Component', () => {
        it('should open add dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickAdd();

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataBusinessArea).toEqual({});
            expect(wrapper.findComponent(Dialog).exists()).toBe(true);
        });

        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({
                id: 1,
                description: 'Kantor Pusat'
            });

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataBusinessArea).toEqual({
                id: 1,
                description: 'Kantor Pusat'
            });
            expect(wrapper.findComponent(Dialog).exists()).toBe(true);
        });

        it('should open delete confirmation', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickDelete({ id: 1 });

            expect(mockConfirm.require).toHaveBeenCalled();
        });

        it('should open delete confirmation', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickDelete({ id: 1 });

            expect(mockConfirm.require).toHaveBeenCalled();
        });

        it('should handle success delete', async () => {
            const wrapper = factory();
            BusinessAreaService.delete.mockResolvedValue({
                data: { code: 200, message: 'Success' }
            });
            await wrapper.vm.deleteData(() => {});
            await flushPromises();

            expect(mockToast.add).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success' })
            );
        });
    });
    // describe('CRUD Operation', () => {});
});
