import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import VendorList from '../../src/views/vendorManagement/vendorAktif/VendorList.vue';
import PrimeVue from 'primevue/config';
import { ConfirmationService, ToastService, AuthService } from 'primevue';
import { createPinia } from 'pinia';
import router from '@/router';
import { createPinia } from 'pinia';
const pinia = createPinia();

describe('VendorList.vue', () => {
  const wrapper = mount(VendorList, {
    global: {
      plugins: [ pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService]
      }
  });
  
  it('mounts correctly', () => {
    expect(wrapper.isVisible()).toBe(true);
});
  it('should render', async() => {
    const wrapper = mount(VendorList, {
      global: {
        plugins: [PrimeVue, ToastService, ConfirmationService, AuthService]
        }
    });

    const dataTableList = wrapper.find('#dataTableList');
    
    expect(wrapper.find('#labelInfo').text()).toBe("Data Vendor Aktif");
    expect(dataTableList.exists()).toBeTruthy();
  });

  it('displays loaded datas', async () => {
    
    await wrapper.vm.getData(); // Panggil method untuk get Data
    await wrapper.setProps({}); // Paksa re-render

    const buttonAdd = wrapper.find('#buttonAdd');
    const buttonExport = wrapper.find('#buttonExport');
    expect(buttonAdd.exists()).toBe(false);
    
    expect(buttonExport.exists()).toBe(false);
    expect(wrapper.vm.datas.length).toBeGreaterThanOrEqual(0);
  });

  it('action function', async () => {
    
    expect(wrapper.vm.datas.length).toBeGreaterThanOrEqual(0);
    
    await wrapper.vm.getData(); // Panggil method untuk get Data
    await wrapper.vm.exportExcel();
    await wrapper.vm.handleAccept(()=>{});
    await wrapper.vm.handleReject(()=>{});
    await wrapper.vm.deleteData(()=>{});
    await wrapper.vm.onPage({rows:1, page:0});
    await wrapper.vm.onClickDetail({id:1});
    await wrapper.vm.onClickEdit({id:1});

    await wrapper.setProps({}); // Paksa re-render
  });
});
