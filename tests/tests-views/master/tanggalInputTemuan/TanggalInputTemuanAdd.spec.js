import TanggalInputTemuanService from '@/service/TanggalInputTemuanService';
import TanggalInputTemuanAdd from '@/views/master/tanggalInputTemuan/TanggalInputTemuanAdd.vue';
import { flushPromises, mount } from '@vue/test-utils';
import {
    Column,
    ConfirmationService,
    ConfirmDialog,
    Toast,
    ToastService
} from 'primevue';
import PrimeVue from 'primevue/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function factory() {
    return mount(TanggalInputTemuanAdd, {
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
                Form: true,
                Dialog: true,
                Checkbox: true,
                DatePicker: true
            },
            components: {
                Column,
                Toast,
                ConfirmDialog
            }
        },
        props: {
            onClose: vi.fn()
        }
    });
}

vi.mock('@/service/TanggalInputTemuanService', () => ({
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

describe('TanggalInputTemuanAdd.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        TanggalInputTemuanService.get.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });
    });

    it('should open save confirmation', async () => {
        const wrapper = factory();
        await wrapper.vm.onClickSave({ description: 'lorem', valid: true });

        expect(mockConfirm.require).toHaveBeenCalled();
    });

    it('should handle success save', async () => {
        const wrapper = factory();
        TanggalInputTemuanService.post.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        await wrapper.vm.setData({
            id: null
        });

        await flushPromises();

        expect(mockToast.add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success' })
        );
    });

    it('should handle success edit', async () => {
        const wrapper = factory();
        TanggalInputTemuanService.put.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        await wrapper.vm.setData({
            id: 1
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
