import SkemaPerjanjianService from '@/service/SkemaPerjanjianService';
import SkemaPerjanjian from '@/views/master/skemaPerjanjian/SkemaPerjanjian.vue';
import SkemaPerjanjianAddDialog from '@/views/master/skemaPerjanjian/SkemaPerjanjianAddDialog.vue';
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
    return mount(SkemaPerjanjian, {
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
                RuangLingkupAddDialog: true,
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

vi.mock('@/service/SkemaPerjanjianService', () => ({
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
                id: 2,
                description: 'test detail',
                code: '1.11',
                parentCode: null,
                status: 'ACTIVE'
            }
        ]
    }
};

describe('RuangLingkup.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        SkemaPerjanjianService.get.mockResolvedValue(mockDataList);
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            SkemaPerjanjianService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });
    });

    describe('Feature Component', () => {
        it('should open add dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickAdd();

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataEdit).toEqual({
                description: '',
                monitoredByPln: false
            });
            expect(
                wrapper.findComponent(SkemaPerjanjianAddDialog).exists()
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
                wrapper.findComponent(SkemaPerjanjianAddDialog).exists()
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
            SkemaPerjanjianService.delete.mockResolvedValue({
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
