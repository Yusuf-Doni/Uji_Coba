
import { mount, shallowMount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import VendorAdd from '../../src/views/vendorManagement/vendorBlacklist/VendorAdd.vue';
import PrimeVue from 'primevue/config';
import { ConfirmationService, ToastService, AuthService, Stepper, Step, StepList, InputText } from 'primevue';
import { createPinia } from 'pinia';
import router from '@/router';
import { createPinia } from 'pinia';
import InfoUmumForm from '../../src/views/vendorManagement/vendorBlacklist/form/InfoUmumForm.vue';
import InfoLegalForm from '../../src/views/vendorManagement/vendorBlacklist/form/InfoLegalForm.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { nextTick } from 'vue';
const pinia = createPinia();

describe('VendorAdd.vue', () => {
  const wrapper = shallowMount(VendorAdd, {
    global: {
      plugins: [pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService]
    },
    stubs: {
      InfoUmumForm, 
      InfoLegalForm
    },
    children: [InfoUmumForm, InfoLegalForm]
  });

  

  it('mounts correctly', () => {
    expect(wrapper.isVisible()).toBe(true);
  });

  it('should display the route param with action type add', async () => {
    
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/vendor/blacklist/:action',
          component: VendorAdd,
          props: route => ({ action: route.params.action }),
        },
      ],
    });

    router.push('/vendor/blacklist/add');
    await router.isReady();

    let wrapper2 = mount(VendorAdd, {
      global: {
        plugins: [router, pinia, PrimeVue, ToastService, ConfirmationService, AuthService]
        },
    });

    expect(wrapper2.find('#labelInfoVendorAdd').text()).toBe("Tambah Data Vendor Blacklist");
    
  });

  it('should display the route param with action type edit', async () => { 
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/vendor/blacklist/:action',
          component: VendorAdd,
          props: route => ({ action: route.params.action }),
        },
      ],
    });

    router.push('/vendor/blacklist/edit');
    await router.isReady();

    let wrapper2 = mount(VendorAdd, {
      global: {
        plugins: [router, pinia, PrimeVue, ToastService, ConfirmationService, AuthService]
        },
    });
    await wrapper.vm.onMounted();
    expect(wrapper2.find('#labelInfoVendorAdd').text()).toBe("Edit Data Vendor Blacklist");
    
  });

  it('should display the route param with action type detail', async () => { 
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/vendor/blacklist/:action',
          component: VendorAdd,
          props: route => ({ action: route.params.action }),
        },
      ],
    });
    
    router.push('/vendor/blacklist/detail');
    await router.isReady();

    let wrapper2 = mount(VendorAdd, {
      global: {
        plugins: [router, pinia, PrimeVue, ToastService, ConfirmationService, AuthService]
        },
    });
    await wrapper.vm.onMounted();
    expect(wrapper2.find('#labelInfoVendorAdd').text()).toBe("Detail Data Vendor Blacklist");
    
  });

  it('should render', async () => {
    
    expect(wrapper.find('#labelInfoVendorAdd').text()).toBe("Tambah Data Vendor Blacklist");
    await wrapper.vm.onMounted(); // Panggil method untuk get Data
    const loadingVendorAdd = wrapper.find('#loadingVendorAdd');
    expect(loadingVendorAdd.exists()).toBe(false);
    
    expect(loadingVendorAdd.exists()).toBe(false);

    wrapper.vm.isLoadingDetail = false;
    expect(wrapper.vm.isLoadingDetail).toBe(false);

  });

  it('action function', async () => {
    await wrapper.vm.onMounted();
    await wrapper.vm.getDetailVendor(); 

    await wrapper.vm.setTitlePage();
    await wrapper.vm.onUpdateInfoUmum({});
    await wrapper.setProps({}); // Paksa re-render
  });

  it('component on children From Info Umum', async () => {

    const stepVendorAdd1 = wrapper.find('#stepVendorAdd1');
    expect(stepVendorAdd1.exists()).toBe(true);

    stepVendorAdd1.trigger('click');
    
    const infoUmumFormComp = wrapper.getComponent(InfoUmumForm);
    expect(infoUmumFormComp.exists()).toBe(true);
  });

  it('component on children Form Info Legal', async () => {

    const stepVendorAdd2 = wrapper.find('#stepVendorAdd2');
    expect(stepVendorAdd2.exists()).toBe(true);

    stepVendorAdd2.trigger('click');

    const infoLegalFormComp = wrapper.getComponent(InfoLegalForm);
    expect(infoLegalFormComp.exists()).toBe(true);
  });

  it('child should render form info umum with action type add', async () => {
    const wrapperInfoUmum = shallowMount(InfoUmumForm, {
      global: {
        plugins: [pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService]
      },
      props: { 
        activateCallback: ()=>{}, 
        detailVendor: {}, 
        action: "add"
      }
    });
    expect(wrapperInfoUmum.isVisible()).toBe(true);
    await wrapperInfoUmum.vm.onMounted(); // Panggil method untuk get Data
    await wrapperInfoUmum.vm.onChangeOptVendor({value:{id:1}});
    await wrapperInfoUmum.vm.getDetailVendor(1);

    const inputNamaPerusahaan = wrapperInfoUmum.find('#inputNoFax');
    expect(inputNamaPerusahaan.exists()).toBe(false);
  });

  it('child should render form info umum with action type detail', async () => {
    const wrapperInfoUmum = mount(InfoUmumForm, {
      plugins: [PrimeVue],
      global: {
        plugins: [pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService]
      },
      components: {
        InputText
      },
      props: { 
        activateCallback: ()=>{}, 
        detailVendor: {
          namaPerusahaan:"abc",
          status:{
            name: 'YA',
            code: 'BLACKLIST'
        }
        }, 
        action: "detail"
      }
    });
    
    expect(wrapperInfoUmum.isVisible()).toBe(true);

    await wrapperInfoUmum.vm.onMounted(); // Panggil method untuk get Data

    await wrapperInfoUmum.vm.getDetailVendor(1);

    const formInfoUmum =  wrapperInfoUmum.findComponent({ref: "formInfoUmum"});
    expect(formInfoUmum.exists()).toBe(true);

    const namaPerusahaan = wrapperInfoUmum.findComponent({ref: "namaPerusahaan"});
    expect(namaPerusahaan.exists()).toBe(true);
    await namaPerusahaan.setValue('test value');
    await nextTick();
    expect(namaPerusahaan.element.value).toBe('test value');

    const input = wrapperInfoUmum.findComponent({ref: "namaDirektur"});
    expect(input.exists()).toBe(true);
    await input.setValue('test value');
    await nextTick();
    expect(input.element.value).toBe('test value');

    const alamat = wrapperInfoUmum.findComponent({ref: "alamat"});
    expect(alamat.exists()).toBe(true);
    await alamat.setValue('test value');
    await nextTick();
    expect(alamat.element.value).toBe('test value');

    const kodePos = wrapperInfoUmum.findComponent({ref: "kodePos"});
    expect(kodePos.exists()).toBe(true);
    await kodePos.setValue('123');
    await nextTick();
    expect(kodePos.element.value).toBe('123');

    const noTelepon = wrapperInfoUmum.findComponent({ref: "noTelepon"});
    expect(noTelepon.exists()).toBe(true);
    await noTelepon.setValue('123');
    await nextTick();
    expect(noTelepon.element.value).toBe('123');

    const noFax = wrapperInfoUmum.findComponent({ref: "noFax"});
    expect(noFax.exists()).toBe(true);
    await noFax.setValue('123');
    await nextTick();
    expect(noFax.element.value).toBe('123');

    const situs = wrapperInfoUmum.findComponent({ref: "situs"});
    expect(situs.exists()).toBe(true);
    await situs.setValue('123');
    await nextTick();
    expect(situs.element.value).toBe('123');

    const jumlahPegawaiOrganik = wrapperInfoUmum.findComponent({ref: "jumlahPegawaiOrganik"});
    expect(jumlahPegawaiOrganik.exists()).toBe(true);
    await jumlahPegawaiOrganik.setValue('123');
    await nextTick();
    expect(jumlahPegawaiOrganik.element.value).toBe('123');

    const selectJenisVendor = wrapperInfoUmum.find({ref:"selectStatus"});
    await selectJenisVendor.trigger('change');
    await nextTick();
    expect(selectJenisVendor.element.value).toBe('');
    // await options.at(1).setSelected();
    
  });

  it('child call function form info umum', async () => {
    const wrapperInfoUmum = shallowMount(InfoUmumForm, {
      global: {
        plugins: [pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService, Stepper, Step, StepList]
      },
      props: { 
        activateCallback: ()=>{}, 
        detailVendor: {}, 
        action: "add"
      },
      emits: ['updateInfoUmum'],
    });
    await wrapperInfoUmum.vm.onMounted();

    await wrapperInfoUmum.vm.getDataProvinsi(); 
    await wrapperInfoUmum.vm.onScrollEventProvinsi({target:{scrollTop: 10, clientHeight: 400, scrollHeight: 200}});
    await wrapperInfoUmum.vm.filterProvinsiAPi({});
    await wrapperInfoUmum.vm.onFilterProvinsi({originalEvent:{stopImmediatePropagation: ()=>{}}});

    await wrapperInfoUmum.vm.onChangeProvinsi({value: {id: "1"}});
 
    await wrapperInfoUmum.vm.getDataKabupaten();
    await wrapperInfoUmum.vm.onScrollEventKabupaten({target:{scrollTop: 10, clientHeight: 400, scrollHeight: 200}});
    await wrapperInfoUmum.vm.filterKabupatenAPi({});
    await wrapperInfoUmum.vm.onFilterKabupaten({originalEvent:{stopImmediatePropagation: ()=>{}}});

    await wrapperInfoUmum.vm.onChangeKabupaten({value: {id: "1"}});

    await wrapperInfoUmum.vm.getDataKecamatan();
    await wrapperInfoUmum.vm.onScrollEventKecamatan({target:{scrollTop: 10, clientHeight: 400, scrollHeight: 200}});
    await wrapperInfoUmum.vm.filterKecamatanAPi({});
    await wrapperInfoUmum.vm.onFilterKecamatan({originalEvent:{stopImmediatePropagation: ()=>{}}});

    await wrapperInfoUmum.vm.onChangeKecamatan({value: {id: "1"}});

    await wrapperInfoUmum.vm.getDataKelurahan();
    await wrapperInfoUmum.vm.onScrollEventKelurahan({target:{scrollTop: 10, clientHeight: 400, scrollHeight: 200}});
    await wrapperInfoUmum.vm.filterKelurahanAPi({});
    await wrapperInfoUmum.vm.onFilterKelurahan({originalEvent:{stopImmediatePropagation: ()=>{}}});

    await wrapperInfoUmum.vm.getDataOptVendor();
    await wrapperInfoUmum.vm.onScrollEventOptVendor({target:{scrollTop: 10, clientHeight: 400, scrollHeight: 200}});
    await wrapperInfoUmum.vm.filterOptVendorAPi({});
    await wrapperInfoUmum.vm.onFilterOptVendor({originalEvent:{stopImmediatePropagation: ()=>{}}});

    await wrapperInfoUmum.vm.getDetailVendor(1);

    await wrapperInfoUmum.vm.onChangeOptVendor({value:{id:1}});

    await wrapperInfoUmum.vm.onChangeTglMulai(new Date());

    await wrapperInfoUmum.vm.onClickSave({valid:true});

    await wrapperInfoUmum.vm.openDialogSave({});
    await wrapperInfoUmum.vm.blackListService({});

    await wrapperInfoUmum.vm.approveService();
    
    await wrapperInfoUmum.setProps({}); // Paksa re-render
  });


  it('child should render form info legal', async () => {
    const wrapperInfoLegal = shallowMount(InfoLegalForm, {
      global: {
        plugins: [pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService, Stepper, Step, StepList]
      },
      props: { 
        activateCallback: ()=>{}, 
        detailVendor: {}, 
        action: "add",
        
      }
    });
    expect(wrapperInfoLegal.isVisible()).toBe(true);

    const selectKso = wrapper.find('#selectKso');
    expect(selectKso.exists()).toBe(true);
  });

  it('child call function form info legal', async () => {
    const wrapperInfoLegal = shallowMount(InfoLegalForm, {
      global: {
        plugins: [pinia, PrimeVue, router, ToastService, ConfirmationService, AuthService, Stepper, Step, StepList]
      },
      props: { 
        activateCallback: ()=>{}, 
        detailVendor: {}, 
        infoUmum:{kodePos:123, noTelepon:123, noFax:123},
        action: "add"
      }
    });

    await wrapperInfoLegal.vm.onClickSave({valid:true}); 
    await wrapperInfoLegal.vm.openDialogSave({values:{}}); 
    await wrapperInfoLegal.vm.openDialogApprove(); 
    await wrapperInfoLegal.vm.saveInputToService({noNIB:123, noPkb:123, noBujp:123, tglNib:new Date(), tglPkb: new Date()}); 
    await wrapperInfoLegal.vm.openDialogSave({}); 
    await wrapperInfoLegal.vm.openDialogApprove(); 
    await wrapperInfoLegal.vm.saveInputToService({noNIB:123, noPkb:123, noBujp:123, tglNib:new Date(), tglPkb: new Date()}); 
    await wrapperInfoLegal.vm.approveService(); 
    await wrapperInfoLegal.vm.openDialogReject(); 
    await wrapperInfoLegal.vm.confirmDialogReject(); 
    await wrapperInfoLegal.vm.rejectService(()=>{}); 
    await wrapperInfoLegal.vm.handleAccept(()=>{}); 
    await wrapperInfoLegal.vm.handleAcceptConfirm(()=>{}); 
    await wrapperInfoLegal.vm.handleRejectConfirm(()=>{}); 

    await wrapperInfoLegal.setProps({}); // Paksa re-render
  });

});
