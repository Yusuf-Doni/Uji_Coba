import KecamatanService from '@/service/KecamatanService';
import KecamatanAdd from '@/views/master/kecamatan/KecamatanAdd.vue';
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

function factory() {
    return mount(KecamatanAdd, {
        global: {
            plugins: [PrimeVue, ToastService, ConfirmationService],
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
                Form: true
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

vi.mock('@/service/KecamatanService', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
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

describe('KecamatanAdd.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should open save confirmation', async () => {
        const wrapper = factory();
        await wrapper.vm.onClickSave({ description: 'lorem', valid: true });

        expect(mockConfirm.require).toHaveBeenCalled();
    });

    it('should handle success save', async () => {
        const wrapper = factory();
        KecamatanService.post.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        await wrapper.vm.saveInputToService({
            description: 'lorem',
            prvinsi: null,
            kotaKabupaten: {
                provinsi: null
            }
        });

        await flushPromises();

        expect(mockToast.add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success' })
        );
    });

    it('should get detail kecamatan', async () => {
        const wrapper = factory();
        KecamatanService.getById.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        wrapper.vm.dataInput.id = 1;
        await wrapper.vm.getDetailKecamatan();

        await flushPromises();

        expect(KecamatanService.getById).toHaveBeenCalled();
    });

    it('should handle success edit', async () => {
        const wrapper = factory();
        KecamatanService.put.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        wrapper.vm.dataInput.id = 1;
        await wrapper.vm.saveInputToService({
            description: 'lorem',
            prvinsi: null,
            kotaKabupaten: {
                provinsi: null
            }
        });

        await flushPromises();

        expect(mockToast.add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success' })
        );
    });

    it('should close modal when click cancel', async () => {
        const wrapper = factory();
        await wrapper.vm.onClickCancel();

        expect(wrapper.vm.$props.onClose).toHaveBeenCalled();
    });
});
