import StatusKontrakService from '@/service/StatusKontrakService';
import Status from '@/views/transaction/perjanjian/perjanjianAdd/Status.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function factory(pinia = {}) {
    return mount(Status, {
        global: {
            plugins: [pinia],
            stubs: {
                Message: true,
                Button: true,
                ProgressSpinner: true,
                Skeleton: true,
                Select: true,
                Fluid: true
            }
        },
        methods: {
            onClickNext: vi.fn()
        },
        props: { nextAction: vi.fn() }
    });
}

vi.mock('@/service/StatusKontrakService', () => ({
    default: {
        get: vi.fn()
    }
}));

describe('Status.vue', () => {
    beforeEach(() => {});

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('call status service for Status Perjanjian Options', async () => {
        StatusKontrakService.get.mockResolvedValue({
            data: {
                data: {
                    code: 200,
                    success: true
                }
            }
        });
        const wrapper = factory();

        await flushPromises();

        expect(StatusKontrakService.get).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.dataStatus).toEqual({
            code: 200,
            success: true
        });
    });

    it('handles error API response', async () => {
        StatusKontrakService.get.mockRejectedValue({
            data: {
                data: {
                    code: 500,
                    success: false
                }
            }
        });
        const wrapper = factory();

        await flushPromises();

        wrapper.vm.onClickNext({ valid: true, values: {} });
        expect(wrapper.props('nextAction')).toHaveBeenCalled();

        expect(StatusKontrakService.get).toHaveBeenCalledTimes(1);
        expect(wrapper.vm.isLoading).toBe(false);
        expect(wrapper.vm.dataStatus).toEqual([]);
    });
});
