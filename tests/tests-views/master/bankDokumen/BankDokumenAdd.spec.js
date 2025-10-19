import BankDokumenService from '@/service/BankDokumenService';
import FileApiService from '@/service/FileApiService';
import BankDokumenAdd from '@/views/master/bankDokumen/BankDokumenAdd.vue';
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
    return mount(BankDokumenAdd, {
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

vi.mock('@/service/BankDokumenService', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn()
    }
}));

vi.mock('@/service/FileApiService', () => ({
    default: {
        upload: vi.fn()
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
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should open save confirmation', async () => {
        const wrapper = factory();
        wrapper.vm.data = {
            nama: 'test',
            filePath: 'test',
            fileName: 'test'
        };
        await wrapper.vm.onClickSave({ description: 'lorem', valid: true });

        expect(mockConfirm.require).toHaveBeenCalled();
    });

    it('should handle success save', async () => {
        const wrapper = factory();
        BankDokumenService.post.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        wrapper.vm.data = {
            nama: 'test',
            filePath: 'test',
            fileName: 'test'
        };

        wrapper.vm.fileupload = {
            name: 'test'
        };

        await wrapper.vm.setData({
            nama: 'test',
            filePath: 'test',
            fileName: 'test'
        });

        await flushPromises();

        expect(mockToast.add).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'success' })
        );
    });

    it('should handle success edit', async () => {
        const wrapper = factory();
        BankDokumenService.put.mockResolvedValue({
            data: { code: 200, message: 'Success' }
        });

        wrapper.vm.data = {
            nama: 'test',
            filePath: 'test',
            fileName: 'test'
        };

        wrapper.vm.fileupload = {
            name: 'test'
        };

        await wrapper.vm.setData({
            nama: 'test',
            filePath: 'test',
            fileName: 'test'
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

    describe('file upload proccess', () => {
        it('should select file', async () => {
            const wrapper = factory();
            FileApiService.upload.mockResolvedValue({
                data: { code: 200, message: 'Success' }
            });

            wrapper.vm.data = {
                nama: 'test',
                filePath: 'test',
                fileName: 'test'
            };

            const mockFile = {
                files: [{ name: 'test' }]
            };

            wrapper.vm.selectFile(mockFile);

            await wrapper.vm.$nextTick();

            expect(wrapper.vm.fileupload).toEqual(mockFile.files[0]);
        });

        it('should call upload file service', async () => {
            const wrapper = factory();
            FileApiService.upload.mockResolvedValue({
                data: { code: 200, message: 'Success' }
            });

            wrapper.vm.onUpload();

            await flushPromises();

            expect(FileApiService.upload).toHaveBeenCalled();
        });
    });
});
