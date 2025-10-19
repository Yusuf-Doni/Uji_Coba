import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InfiniteScrollDropdown from '@/components/InfiniteScrollDropdown.vue'; // Sesuaikan path jika berbeda

describe('InfiniteScrollDropdown.vue', () => {
  let wrapper;
  let mockLoadMore;

  beforeEach(() => {
    // Mock fungsi `loadMore`
    mockLoadMore = vi.fn(async (page, pageSize) => {
      return Array.from({ length: pageSize }, (_, i) => ({
        label: `Option ${i + 1}`,
        value: i + 1,
      }));
    });

    wrapper = mount(InfiniteScrollDropdown, {
      props: {
        loadMore: mockLoadMore,
        optionLabel: 'label',
        optionValue: 'value',
        placeholder: 'Select an option',
      },
    });
  });

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true);
  });

  it('calls loadMore on mount', async () => {
    expect(mockLoadMore).toHaveBeenCalledWith(1, 10); // Memastikan loadMore dipanggil saat pertama kali render
  });

  it('displays loaded options', async () => {
    await wrapper.vm.loadMoreOptions(); // Panggil method untuk menambah opsi
    await wrapper.setProps({}); // Paksa re-render

    const select = wrapper.findComponent({ name: 'Select' }); // Ambil komponen Select
    expect(select.exists()).toBe(false);
    expect(wrapper.vm.options.length).toBeGreaterThan(0);
  });

  it('triggers loadMoreOptions on scroll', async () => {
    const scrollEvent = { target: { scrollTop: 100, clientHeight: 200, scrollHeight: 300 } };
    await wrapper.vm.handleScroll(scrollEvent);
    
    expect(mockLoadMore).toHaveBeenCalledTimes(2); // Panggilan awal + scroll
  });

  it('emits update:selected when option is selected', async () => {
    const testOption = { label: 'Test Option', value: 999 };
    
    await wrapper.vm.onSelect(testOption);
    
    expect(wrapper.emitted('update:selected')).toBeTruthy();
    expect(wrapper.emitted('update:selected')[0]).toEqual([testOption]);
  });
});
