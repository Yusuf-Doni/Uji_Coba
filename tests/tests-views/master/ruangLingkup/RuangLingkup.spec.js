import RuangLingkupService from '@/service/RuangLingkupService';
import RuangLingkup from '@/views/master/ruangLingkup/RuangLingkup.vue';
import RuangLingkupAddDialog from '@/views/master/ruangLingkup/RuangLingkupAddDialog.vue';
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
    return mount(RuangLingkup, {
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
                RuangLingkupAddDialog: true
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

vi.mock('@/service/RuangLingkupService', () => ({
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
        RuangLingkupService.get.mockResolvedValue(mockDataList);
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            RuangLingkupService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });
    });

    describe('Feature Component', () => {
        it('should open add dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickAdd();

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataRuangLingkup).toEqual({});
            expect(wrapper.findComponent(RuangLingkupAddDialog).exists()).toBe(
                true
            );
        });

        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({
                id: 1,
                description: 'Kantor Pusat'
            });

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataRuangLingkup).toEqual({
                id: 1,
                description: 'Kantor Pusat'
            });
            expect(wrapper.findComponent(RuangLingkupAddDialog).exists()).toBe(
                true
            );
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
            RuangLingkupService.delete.mockResolvedValue({
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
