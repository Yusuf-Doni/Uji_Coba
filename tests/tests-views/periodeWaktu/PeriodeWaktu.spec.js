import PeriodeWaktuService from '@/service/PeriodeWaktuService';
import PeriodeWaktu from '@/views/periodeWaktu/PeriodeWaktu.vue';
import PeriodeWaktuAddDialog from '@/views/periodeWaktu/PeriodeWaktuAddDialog.vue';
import { createTestingPinia } from '@pinia/testing';
import { mount } from '@vue/test-utils';
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
    const pinia = createTestingPinia({
        createSpy: vi.fn
    });

    return mount(PeriodeWaktu, {
        global: {
            plugins: [
                pinia,
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
                PeriodeWaktuAddDialog: true,
                Tag: true,
                Dialog: true,
                DatePicker: true
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

vi.mock('@/service/PeriodeWaktuService', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
        getById: vi.fn(),
        getPerioderWaktuList: vi.fn()
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
                tanggalAkhir: '30-04-2025',
                modul: 'Perjanjian',
                status: 'OPEN'
            }
        ]
    }
};

describe('PeriodeWaktu.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PeriodeWaktuService.getPerioderWaktuList.mockResolvedValue(
            mockDataList
        );
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            PeriodeWaktuService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });
    });

    describe('Feature Component', () => {
        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({
                id: 1,
                description: 'Kantor Pusat'
            });

            expect(wrapper.vm.visibleUpdate).toBe(true);
            expect(wrapper.vm.dataPeriodeWaktu).toEqual({
                id: 1,
                description: 'Kantor Pusat'
            });
            expect(wrapper.findComponent(PeriodeWaktuAddDialog).exists()).toBe(
                true
            );
        });
    });
});
