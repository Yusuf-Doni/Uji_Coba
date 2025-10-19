import BankDokumenService from '@/service/BankDokumenService';
import BankDokumen from '@/views/master/bankDokumen/BankDokumen.vue';
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
    return mount(BankDokumen, {
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
                BankDokumenAddDialog: true
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

vi.mock('@/service/BankDokumenService', () => ({
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

const mockDataTable = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: [
            {
                id: 1,
                nama: 'Test',
                updatedAt: '27-11-2024',
                filePath: '-'
            }
        ]
    }
};

describe('BankDokumen.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            BankDokumenService.get.mockResolvedValue(mockDataTable);
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
            expect(wrapper.findComponent(Dialog).exists()).toBe(true);
        });

        it('should open view dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickView({ id: 1, description: 'lorem ipsum' });

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataEdit).toEqual({
                id: 1,
                description: 'lorem ipsum'
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
            BankDokumenService.delete.mockResolvedValue({
                data: { code: 200, message: 'Success' }
            });
            await wrapper.vm.deleteData(1);
            await flushPromises();

            expect(mockToast.add).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success' })
            );
        });
    });
});
