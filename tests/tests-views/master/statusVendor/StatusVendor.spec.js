import StatusVendorService from '@/service/StatusVendorService';
import StatusVendor from '@/views/master/statusVendor/StatusVendor.vue';
import { flushPromises, mount } from '@vue/test-utils';
import {
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Toast,
    ToastService
} from 'primevue';
import PrimeVue from 'primevue/config';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function factory() {
    return mount(StatusVendor, {
        global: {
            plugins: [PrimeVue, ToastService, ConfirmationService],
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
                StatusVendorAddDialog: true
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

vi.mock('@/service/StatusVendorService', () => ({
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

describe('StatusVendor.vue', () => {
    beforeEach(() => {});

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            StatusVendorService.get.mockResolvedValue({
                data: {
                    code: 200,
                    success: true,
                    size: 20,
                    totalElement: 1,
                    data: [
                        {
                            id: 3,
                            description: 'Aktif'
                        }
                    ]
                }
            });
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });
    });

    describe('Feature Component', () => {
        it('should open add dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickAdd();

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataEdit).toEqual({});
        });

        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({ id: 1, description: 'lorem ipsum' });

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataEdit).toEqual({
                id: 1,
                description: 'lorem ipsum'
            });
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
            StatusVendorService.delete.mockResolvedValue({
                data: { code: 200, message: 'Success' }
            });
            await wrapper.vm.deleteData(1);
            await flushPromises();

            expect(mockToast.add).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success' })
            );
        });
    });
    // describe('CRUD Operation', () => {});
});
