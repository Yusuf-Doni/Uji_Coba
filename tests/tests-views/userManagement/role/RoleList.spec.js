import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import RoleList from '@/views/userManagement/role/RoleList.vue';
import RoleService from '@/service/RoleService';
import { createTestingPinia } from '@pinia/testing';
import PrimeVue from 'primevue/config';
// import { useRouter } from 'vue-router';
import { ConfirmationService, ToastService } from 'primevue';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
  })),
  useRoute: vi.fn(() => ({
    path: '/current-path',
    query: { id: '123' },
    params: { slug: 'example' },
  })),
}));

vi.mock('@/service/RoleService', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: { data: [], totalElement: 0 } })),
    delete: vi.fn(() => Promise.resolve({ data: { code: 200, message: 'Deleted' } }))
  }
}));

// vi.mock('vue-router', () => ({
//   useRouter: vi.fn(() => ({ push: vi.fn() }))
// }));

describe('RoleList.vue', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = mount(RoleList, {
      global: {
        plugins: [PrimeVue, createTestingPinia({createSpy: vi.fn}), ToastService, ConfirmationService],
      },
    });
  });

  it('fetches roles on mount', async () => {
    expect(RoleService.get).toHaveBeenCalled();
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.datas).toEqual([]);
  });

  // it('navigates to edit page when edit button is clicked', async () => {
  //   // const router = useRouter();
  //   wrapper.vm.onClickEditUser({ id: 1 });
  //   expect(router.push).toHaveBeenCalledWith({ path: '/user-management/role/edit/1' });
  // });

  it('calls delete service when deleteData is invoked', async () => {
    wrapper.vm.dataRoles = { id: 1 };
    await wrapper.vm.deleteData(() => {});
    expect(RoleService.delete).toHaveBeenCalledWith(1);
  });

  it('shows success toast when delete is successful', async () => {
    const toastSpy = vi.spyOn(wrapper.vm.toast, 'add');
    wrapper.vm.dataRoles = { id: 1 };
    await wrapper.vm.deleteData(() => {});
    expect(toastSpy).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'success' })
    );
  });

  it('handles API errors gracefully', async () => {
    RoleService.get.mockRejectedValueOnce(new Error('API Error'));
    await wrapper.vm.getData();
    await flushPromises();
    expect(wrapper.vm.loading).toBe(false);
  });
});
