import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import HelloWorld from '../../src/components/HelloWorld.vue';

describe('HelloWorld.vue', () => {
  it('renders the message', () => {
    const wrapper = mount(HelloWorld, {
      props: { msg: 'Hello Vitest' }
    });
    expect(wrapper.find('h1').text()).toBe('Hello Vitest');
  });

  it('increments counter on button click', async () => {
    const wrapper = mount(HelloWorld);
    const button = wrapper.find('button');

    expect(button.text()).toContain('Clicked 0 times');
    
    await button.trigger('click');

    expect(button.text()).toContain('Clicked 1 times');
  });
});
