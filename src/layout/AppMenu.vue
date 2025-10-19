<script setup>
import { computed } from 'vue';
import { useAuth } from '@/stores';

import AppMenuItem from './AppMenuItem.vue';

const authStore = useAuth();

const model = computed(() => {
    return authStore.menus || [];
});
</script>

<template>
    <ul class="layout-menu">
        <template
            v-for="(item, i) in model"
            :key="item.id || i"
        >
            <app-menu-item
                v-if="!item.separator"
                :item="item"
                :index="i"
            ></app-menu-item>
            <li
                v-if="item.separator"
                class="menu-separator"
            ></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
