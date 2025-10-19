import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BusinessAreaService from '@/service/BusinessAreaService';
import PrimeVue from 'primevue/config';
// import { useRouter } from 'vue-router';
import { ConfirmationService, ToastService } from 'primevue';
import AddUnitKerjaModal from '@/views/userManagement/user/edit/AddUnitKerjaModal.vue';

vi.mock('@/service/BusinessAreaService', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({
      data: {
          data: [{ id: 1, description: 'Area 1' }],
          totalElement: 20
      }
    }))
  } 
}));

vi.mock('primevue/usetoast', () => ({
    useToast: () => ({
        add: vi.fn()
    })
}));

describe('AddUnitKerjaModal.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AddUnitKerjaModal, {
            props: {
                onClose: vi.fn()
            },
            global: {
              plugins: [PrimeVue, ToastService, ConfirmationService],
            }
        });
    });

    it('should fetch business area options on mount', async () => {
        await wrapper.vm.getOptBusinessArea();
        expect(BusinessAreaService.get).toHaveBeenCalled();
        expect(wrapper.vm.businessAreaOpt).toHaveLength(1);
    });

    it('should handle scroll event and fetch more options', async () => {
        wrapper.vm.totalPageBusinessArea = 2;
        wrapper.vm.paramBusinessArea.size = 10;
        await wrapper.vm.onScrollEventBusinessArea({
            target: { scrollTop: 100, clientHeight: 500, scrollHeight: 600 }
        });
        expect(BusinessAreaService.get).toHaveBeenCalledTimes(4);
    });

    it('should call onClose when clicking cancel', async () => {
        await wrapper.vm.onClickCancel();
        expect(wrapper.props().onClose).toHaveBeenCalled();
    });

    it('should emit event and call onClose when saving valid data', async () => {
        // wrapper.vm.emitUnitKerja = vi.fn();
        // await wrapper.vm.onClickSave({ valid: true, values: { businessArea: 'Area 1' } });
        // expect(wrapper.vm.emitUnitKerja).toHaveBeenCalledWith('onUpdateDataUnitKerja', 'Area 1');
        // expect(wrapper.props().onClose).toHaveBeenCalled();
      await wrapper.vm.onClickSave({ valid: true, values: { businessArea: 'Area 1' } });

      expect(wrapper.emitted()).toHaveProperty('onUpdateDataUnitKerja');
      expect(wrapper.emitted('onUpdateDataUnitKerja')[0]).toEqual(['Area 1']);

    });
});
