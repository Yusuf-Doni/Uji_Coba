import FungsiService from '@/service/FungsiService';
import RuangLingkupService from '@/service/RuangLingkupService';
import RuangLingkupAdd from '@/views/master/ruangLingkup/RuangLingkupAdd.vue';
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
    id: 2,
    description: 'test detail',
    code: '1.11',
    parent: null,
    status: 'ACTIVE',
    fungsi: {
        id: 1,
        description: 'Bidang Pembangkitan',
        code: '1',
        shortText: 'KIT'
    }
};
function factory() {
    return mount(RuangLingkupAdd, {
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

vi.mock('@/service/RuangLingkupService', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        getById: vi.fn()
    }
}));

vi.mock('@/service/FungsiService', () => ({
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

describe('RuangLingkupAdd.vue', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        RuangLingkupService.get.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        FungsiService.get.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        RuangLingkupService.getById.mockResolvedValue({
            data: { code: 200, message: 'Success', data: mockDetail }
        });
    });

    it('should open save confirmation', async () => {
        const wrapper = factory();
        await wrapper.vm.onClickSave({ description: 'lorem', valid: true });

        expect(mockConfirm.require).toHaveBeenCalled();
    });

    it('should handle success save', async () => {
        const wrapper = factory();
        RuangLingkupService.post.mockResolvedValue({
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
        RuangLingkupService.put.mockResolvedValue({
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
        await wrapper.vm.onClickCancel();

        expect(wrapper.vm.$props.onClose).toHaveBeenCalled();
    });
});
