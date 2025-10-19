import BusinessAreaService from '@/service/BusinessAreaService';
import KanalKomunikasiService from '@/service/KanalKomunikasiService';
import KanalKomunikasi from '@/views/kanalKomunikasi/KanalKomunikasi.vue';
import KanalKomunikasiAddDialogWrapper from '@/views/kanalKomunikasi/KanalKomunikasiAddDialogWrapper.vue';
import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';
import {
    Column,
    ConfirmationService,
    DataTable,
    DialogService,
    Toast,
    ToastService,
    Tooltip
} from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function factory() {
    const pinia = createTestingPinia({
        createSpy: vi.fn
    });

    return mount(KanalKomunikasi, {
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
                AddKanalKomunikasiModal: true,
                KanalKomunikasiAddDialogWrapper: true,
                Tag: true,
                Dialog: true,
                DatePicker: true,
                DataTable: true
            },
            components: {
                // DataTable,
                Column,
                Toast
            },
            directives: { Tooltip }
        },
        props: {}
    });
}

vi.mock('@/service/KanalKomunikasiService', () => ({
    default: {
        get: vi.fn(),
        delete: vi.fn(),
        getById: vi.fn(),
        getPerioderWaktuList: vi.fn()
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
                id: 41,
                username: 'naker01',
                name: 'User Tenaga Kerja',
                vendor: {
                    id: 2,
                    namaPerusahaan: 'PT Aneka Jaya Edit',
                    namaDirektur: 'nama direktur test',
                    kotaKabupaten: {
                        id: 3,
                        nama: 'Banda Aceh',
                        namaProvinsi: 'Apache test Edit Dua'
                    },
                    npwp: '123',
                    noNIB: null,
                    status: 'AKTIF',
                    tglMulaiBlacklist: '13-12-2024',
                    tglAkhirBlacklist: '16-12-2024'
                },
                judul: 'aa',
                deskripsi: 'bb',
                tindakLanjut: 'asdasdas',
                businessArea: {
                    id: 1,
                    code: '1001',
                    description: 'Kantor Pusat',
                    shortText: ''
                },
                status: 'Sudah Ditindaklanjuti'
            }
        ]
    }
};

describe('KanalKomunikasi.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        KanalKomunikasiService.getPerioderWaktuList.mockResolvedValue(
            mockDataList
        );

        BusinessAreaService.getActive.mockResolvedValue({
            code: 200,
            success: true
        });
    });

    describe('Initial State', () => {
        it('renders DataTable on mount', () => {
            KanalKomunikasiService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();
            expect(wrapper.findComponent(DataTable).exists()).toBe(true);
        });

        it('renders get data komunikasi on mount', async () => {
            KanalKomunikasiService.get.mockResolvedValue(mockDataList);
            const wrapper = factory();

            wrapper.vm.getData();

            await flushPromises();

            expect(KanalKomunikasiService.get).toHaveBeenCalled();
        });
    });

    describe('Feature Component', () => {
        it('should open edit dialog', async () => {
            const wrapper = factory();
            await wrapper.vm.onClickEdit({
                id: 1,
                description: 'Kantor Pusat'
            });

            expect(wrapper.vm.visibleAddKanalModal).toBe(true);
            expect(wrapper.vm.dataTenagaKerja).toEqual({
                id: 1,
                description: 'Kantor Pusat'
            });
            expect(
                wrapper.findComponent(KanalKomunikasiAddDialogWrapper).exists()
            ).toBe(true);
        });
    });
});
