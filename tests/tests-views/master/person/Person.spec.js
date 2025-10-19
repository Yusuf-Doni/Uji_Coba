import PersonService from '@/service/PersonService';
import Person from '@/views/master/person/Person.vue';
import PersonAddDialog from '@/views/master/person/PersonAddDialog.vue';
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
    return mount(Person, {
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
                PersonAddDialog: true
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

vi.mock('@/service/PersonService', () => ({
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
                id: 21,
                nama: 'Pamungkas',
                nik: '3402153213914442',
                alamat: 'alamat',
                status: 'ACTIVE',
                tempatLahir: 'Jaksel',
                tanggalLahir: '03-01-2025',
                noTelepon: '123',
                noTelepon2: null
            }
        ]
    }
};

describe('Person.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        PersonService.get.mockResolvedValue(mockDataList);
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            PersonService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });
    });

    describe('Feature Component', () => {
        it('should open add dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickAdd();

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataPerson).toEqual({});
            expect(wrapper.findComponent(PersonAddDialog).exists()).toBe(true);
        });

        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({
                id: 21,
                nama: 'Pamungkas',
                nik: '3402153213914442',
                alamat: 'alamat',
                status: 'ACTIVE',
                tempatLahir: 'Jaksel',
                tanggalLahir: '03-01-2025',
                noTelepon: '123',
                noTelepon2: null
            });

            expect(wrapper.vm.visible).toBe(true);
            expect(wrapper.vm.dataPerson).toEqual({
                id: 21,
                nama: 'Pamungkas',
                nik: '3402153213914442',
                alamat: 'alamat',
                status: 'ACTIVE',
                tempatLahir: 'Jaksel',
                tanggalLahir: '03-01-2025',
                noTelepon: '123',
                noTelepon2: null
            });
            expect(wrapper.findComponent(PersonAddDialog).exists()).toBe(true);
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
            PersonService.delete.mockResolvedValue({
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
