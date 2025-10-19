import StatusPekerjaService from '@/service/StatusPekerjaService';
import StatusPekerjaAdd from '@/views/master/statusPekerja/StatusPekerjaAdd.vue';
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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function factory() {
    return mount(StatusPekerjaAdd, {
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

vi.mock('@/service/StatusPekerjaService', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
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

describe('StatusPekerjaAdd.vue', () => {
    beforeEach(() => {});

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should open save confirmation', async () => {
        const wrapper = factory();
        await wrapper.vm.onClickSave({ description: 'lorem', valid: true });

        expect(mockConfirm.require).toHaveBeenCalled();
    });

    it('should handle success save', async () => {
        const wrapper = factory();
        StatusPekerjaService.post.mockResolvedValue({
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

    it('should handle success edit', async () => {
        const wrapper = factory();
        StatusPekerjaService.put.mockResolvedValue({
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
