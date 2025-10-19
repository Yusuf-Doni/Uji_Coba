import KecamatanService from '@/service/KecamatanService';
import KelurahanService from '@/service/KelurahanService';
import KotaService from '@/service/KotaService';
import PersonService from '@/service/PersonService';
import ProvinsiService from '@/service/ProvinsiService';
import StatusPekerjaService from '@/service/StatusPekerjaService';
import PersonAdd from '@/views/master/person/PersonAdd.vue';
import { createTestingPinia } from '@pinia/testing';
import { flushPromises, mount } from '@vue/test-utils';
import {
    Column,
    ConfirmationService,
    ConfirmDialog,
    Dialog,
    Toast,
    ToastService
} from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockDetail = {
    id: 21,
    nama: 'Pamungkas',
    nik: '3402153213914442',
    alamat: 'alamat',
    kelurahan: {
        id: 1,
        nama: 'Lampaseh Kota',
        namaKecamatan: 'Kuta Raja'
    },
    kecamatan: {
        id: 1,
        nama: 'Kuta Raja',
        namaKotaKabupaten: 'Banda Aceh'
    },
    kotaKabupaten: {
        id: 3,
        nama: 'Banda Aceh',
        namaProvinsi: 'Apache test Edit Dua'
    },
    provinsi: {
        id: 1,
        nama: 'Apache test Edit Dua'
    },
    kodePos: '12311',
    tempatLahir: 'Jaksel',
    tanggalLahir: '03-01-2025',
    npwp: null,
    jenisKelamin: 'LAKI-LAKI',
    jenisPekerjaan: 'jenis pekerjaan',
    sertifikasi: 'sertifikasi',
    konduite: '-',
    email: 'asd@gmail.com',
    email2: null,
    noTelepon: '123',
    noTelepon2: null,
    foto: 'http://172.16.243.100:8082/api/download/57656e14-830a-47b0-b2dc-e4831313c744.png',
    statusPekerja: {
        id: 1,
        description: 'Borongan'
    },
    status: 'ACTIVE',
    noBpjsNaker: '',
    noBpjsKesehatan: '',
    bankDplk: '',
    noRekDplk: '',
    lembagaPenerbitSertifikat: '',
    masaBerlakuSertifikat: null
};

function factory() {
    const pinia = createTestingPinia({
        createSpy: vi.fn
    });

    return mount(PersonAdd, {
        global: {
            plugins: [pinia, PrimeVue, ToastService, ConfirmationService],
            stubs: {
                Message: true,
                Button: true,
                ProgressSpinner: true,
                Skeleton: true,
                Select: true,
                Fluid: true,
                ConfirmDialog: true,
                IconField: true,
                InputText: true,
                InputIcon: true,
                Form: true,
                DatePicker: true,
                FileUpload: true
            },
            components: {
                Column,
                Dialog,
                Toast,
                ConfirmDialog
            }
        },
        props: {
            onClose: vi.fn()
        }
    });
}

vi.mock('@/service/PersonService', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        getById: vi.fn()
    }
}));

vi.mock('@/service/ProvinsiService', () => ({
    default: {
        get: vi.fn()
    }
}));

vi.mock('@/service/KotaService', () => ({
    default: {
        get: vi.fn(),
        getByProvinsi: vi.fn()
    }
}));

vi.mock('@/service/KecamatanService', () => ({
    default: {
        get: vi.fn(),
        getByKabupaten: vi.fn()
    }
}));

vi.mock('@/service/KelurahanService', () => ({
    default: {
        get: vi.fn(),
        getByKecamatan: vi.fn()
    }
}));

vi.mock('@/service/StatusPekerjaService', () => ({
    default: {
        get: vi.fn()
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

vi.mock('getDataProvinsi', () => {
    return {
        default: () => {}
    };
});

vi.mock('@/utils/dateFormatter', () => ({
    formatDate: vi.fn(),
    unformatDate: vi.fn()
}));

describe('PersonAdd.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        ProvinsiService.get.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        KotaService.getByProvinsi.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        KecamatanService.getByKabupaten.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        KelurahanService.getByKecamatan.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        StatusPekerjaService.get.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });
    });

    it('should open save confirmation', async () => {
        const wrapper = factory();
        wrapper.vm.fileSrc = 'url_img';
        await wrapper.vm.onClickSave({ description: 'lorem', valid: true });

        expect(mockConfirm.require).toHaveBeenCalled();
    });

    it('should handle success save', async () => {
        const wrapper = factory();
        PersonService.post.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        await wrapper.vm.saveInputToService({
            description: 'lorem'
        });

        await flushPromises();

        expect(mockToast.add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success' })
        );
    });

    it('should get detail person', async () => {
        const wrapper = factory();
        PersonService.getById.mockResolvedValue({
            data: { code: 200, message: 'Success', data: mockDetail }
        });

        // wrapper.vm.dataInput = mockDetail;
        // wrapper.vm.dataInput.id = 1;
        await wrapper.vm.$nextTick();

        await wrapper.vm.getDetailPerson();

        await flushPromises();

        expect(PersonService.getById).toHaveBeenCalled();
    });

    it('should handle success edit', async () => {
        const wrapper = factory();
        PersonService.put.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        wrapper.vm.dataInput.id = 1;
        await wrapper.vm.saveInputToService({
            description: 'lorem'
        });

        await flushPromises();

        expect(mockToast.add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success' })
        );
    });

    it('should close modal when click cancel', async () => {
        const wrapper = factory();
        await wrapper.vm.onClickCancel({ description: 'lorem', valid: true });

        expect(wrapper.vm.$props.onClose).toHaveBeenCalled();
    });
});
