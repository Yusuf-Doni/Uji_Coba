import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createApp, nextTick } from 'vue';
import PermissionList from '@/views/userManagement/permission/PermissionList.vue';
import PermissionService from '@/service/PermissionService';
import PerjanjianService from '@/service/PerjanjianService';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

vi.mock('@/service/PermissionService', () => {
    return {
        default: {
            get: vi.fn(() =>
                Promise.resolve({ data: { data: [], totalElement: 0 } })
            )
        }
    };
});

vi.mock('@/service/PerjanjianService', () => {
    return {
        default: {
            delete: vi.fn(() =>
                Promise.resolve({ data: { code: 200, message: 'Deleted' } })
            )
        }
    };
});

describe('PermissionList.vue', () => {
    let wrapper;

    beforeEach(() => {
        const app = createApp(PermissionList);
        app.use(PrimeVue);
        app.use(ToastService);

        wrapper = mount(PermissionList, {
            global: {
                plugins: [PrimeVue, ToastService]
            }
        });
    });

    it('should fetch data on mount', async () => {
        PermissionService.get.mockResolvedValue({
            data: { data: [{ id: 1, name: 'Role 1' }], totalElement: 1 }
        });
        await nextTick();
        expect(PermissionService.get).toHaveBeenCalled();
    });

    it('should handle successful data deletion', async () => {
        const mockAccept = vi.fn();
        wrapper.vm.dataRoles = { id: 1 };
        PerjanjianService.delete.mockResolvedValue({
            data: { code: 200, message: 'Deleted' }
        });

        await wrapper.vm.deleteData(mockAccept);

        expect(PerjanjianService.delete).toHaveBeenCalledWith(1);
        expect(mockAccept).toHaveBeenCalled();
    });

    it('should handle failed data deletion', async () => {
        const mockAccept = vi.fn();
        wrapper.vm.dataRoles = { id: 1 };
        PerjanjianService.delete.mockRejectedValue(new Error('Failed'));

        await wrapper.vm.deleteData(mockAccept);
        await nextTick();

        expect(PerjanjianService.delete).toHaveBeenCalledWith(1);
        expect(mockAccept).toHaveBeenCalled();
    });
});
