import TanggalInputTemuanService from '@/service/TanggalInputTemuanService';
import TanggalInputTemuan from '@/views/master/tanggalInputTemuan/TanggalInputTemuan.vue';
import TanggalInputTemuanAddDialog from '@/views/master/tanggalInputTemuan/TanggalInputTemuanAddDialog.vue';
import { flushPromises, mount } from '@vue/test-utils';
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
    return mount(TanggalInputTemuan, {
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
                TanggalInputTemuanAddDialog: true,
                Dialog: true,
                Checkbox: true
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

vi.mock('@/service/TanggalInputTemuanService', () => ({
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

const mockDataList = {
    data: {
        code: 200,
        success: true,
        size: 20,
        totalElement: 1,
        data: [
            {
                id: 3,
                tahun: 2025,
                triwulan: 2,
                tanggalAwal: '2024-12-01',
                tanggalAkhir: '2024-12-01'
            }
        ]
    }
};

describe('TanggalInputTemuan.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        TanggalInputTemuanService.get.mockResolvedValue(mockDataList);
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            TanggalInputTemuanService.get.mockResolvedValue(mockDataList);
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
            expect(
                wrapper.findComponent(TanggalInputTemuanAddDialog).exists()
            ).toBe(true);
        });

        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({
                id: 1,
                description: 'Kantor Pusat'
            });

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataEdit).toEqual({
                id: 1,
                description: 'Kantor Pusat'
            });
            expect(
                wrapper.findComponent(TanggalInputTemuanAddDialog).exists()
            ).toBe(true);
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
            TanggalInputTemuanService.delete.mockResolvedValue({
                data: { code: 200, message: 'Success' }
            });
            await wrapper.vm.deleteData(() => {});
            await flushPromises();

            expect(mockToast.add).toHaveBeenCalledWith(
                expect.objectContaining({ severity: 'success' })
            );
        });
    });
});
