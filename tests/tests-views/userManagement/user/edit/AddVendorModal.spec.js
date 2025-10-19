import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddVendorModal from '@/views/userManagement/user/edit/AddVendorModal.vue';
import VendorService from '@/service/VendorService';
import { useToast } from 'primevue/usetoast';
import { Toast, ToastService } from 'primevue';

vi.mock('@/service/VendorService', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: [], totalElement: 0 } }))
  }
}));

vi.mock('primevue/usetoast', () => ({
    useToast: vi.fn(() => ({ add: vi.fn() }))
}));

describe('AddVendorModal.vue', () => {
    let wrapper;
    let toastMock;

    beforeEach(() => {
      toastMock = { add: vi.fn() };
      useToast.mockReturnValue(toastMock);
        wrapper = mount(AddVendorModal, {
            props: {
                onClose: vi.fn()
            },
            global: {
              plugins: [ToastService],
              components: { Toast }
            },
        });
    });

    it('renders properly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('calls getDataOptVendor on mount', async () => {
        expect(VendorService.get).toHaveBeenCalled();
    });

    it('updates vendor list on successful fetch', async () => {
        await VendorService.get.mockResolvedValueOnce({
            data: {
                data: [{ id: 1, namaPerusahaan: 'Vendor A' }],
                totalElement: 1
            }
        });
        await wrapper.vm.getDataOptVendor();
        expect(wrapper.vm.dataOptVendor).toEqual([{ id: 1, namaPerusahaan: 'Vendor A' }]);
    });

    // it('displays an error toast on fetch failure', async () => {
    //     // const toast = useToast();
    //     await VendorService.get.mockRejectedValueOnce(new Error('Fetch Error'));
    //     await wrapper.vm.getDataOptVendor();
    //     expect(toastMock.add).toHaveBeenCalledWith(expect.objectContaining({
    //         severity: 'error',
    //         summary: 'Gagal',
    //         detail: 'Fetch Error'
    //     }));
    // });

    it('emits onUpdateDataVendor when saving valid data', async () => {
        wrapper.vm.onClickSave({ valid: true, values: { vendor: { id: 1, namaPerusahaan: 'Vendor A' } } });
        expect(wrapper.emitted('onUpdateDataVendor')).toBeTruthy();
    });

    it('calls onClose when cancel button is clicked', async () => {
        await wrapper.find('button[severity="danger"]').trigger('click');
        expect(wrapper.props().onClose).toHaveBeenCalled();
    });
});
