<script setup>
import { useLayout } from '@/layout/composables/layout';
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '@/stores';
import AppFooter from './AppFooter.vue';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';

const { layoutConfig, layoutState, isSidebarActive, resetMenu } = useLayout();
const authStore = useAuth();

const outsideClickListener = ref(null);
const route = useRoute();
const breadcrumbItems = ref(
    typeof route.meta.breadcrumbItems === 'function'
        ? route.meta.breadcrumbItems(route)
        : (route.meta.breadcrumbItems ?? [])
);

// Refresh menu data when component mounts
onMounted(() => {
    if (authStore.isLoggedIn) {
        authStore.refreshMenuData();
    }
});

watch(isSidebarActive, (newVal) => {
    if (newVal) {
        bindOutsideClickListener();
    } else {
        unbindOutsideClickListener();
    }
});

watch(
    () => [route.meta, route.params, route.query],
    () => {
        if (route.meta.breadcrumbItems) {
            // Check if breadcrumbItems is a function
            breadcrumbItems.value = typeof route.meta.breadcrumbItems === 'function'
                ? route.meta.breadcrumbItems(route)
                : route.meta.breadcrumbItems;
        }
    },
    { deep: true }
);

const containerClass = computed(() => {
    return {
        'layout-overlay': layoutConfig.menuMode === 'overlay',
        'layout-static': layoutConfig.menuMode === 'static',
        'layout-static-inactive':
            layoutState.staticMenuDesktopInactive &&
            layoutConfig.menuMode === 'static',
        'layout-overlay-active': layoutState.overlayMenuActive,
        'layout-mobile-active': layoutState.staticMenuMobileActive
    };
});
const bindOutsideClickListener = () => {
    if (!outsideClickListener.value) {
        outsideClickListener.value = (event) => {
            if (isOutsideClicked(event)) {
                resetMenu();
            }
        };
        document.addEventListener('click', outsideClickListener.value);
    }
};
const unbindOutsideClickListener = () => {
    if (outsideClickListener.value) {
        document.removeEventListener('click', outsideClickListener);
        outsideClickListener.value = null;
    }
};
const isOutsideClicked = (event) => {
    const sidebarEl = document.querySelector('.layout-sidebar');
    const topbarEl = document.querySelector('.layout-menu-button');

    return !(
        sidebarEl.isSameNode(event.target) ||
        sidebarEl.contains(event.target) ||
        topbarEl.isSameNode(event.target) ||
        topbarEl.contains(event.target)
    );
};
</script>

<template>
    <div
        class="layout-wrapper"
        :class="containerClass"
    >
        <app-topbar></app-topbar>
        <app-sidebar></app-sidebar>
        <div class="layout-main-container print:p-0 print:m-0">
            <div class="layout-main">
                <Breadcrumb
                    :model="breadcrumbItems"
                    class="bg-transparent px-0 print:hidden"
                >
                    <template #item="{ item, props }">
                        <router-link
                            :to="item.url"
                            class="p-breadcrumb-item-link"
                            v-bind="props.action"
                            :class="{
                                'font-semibold': item.active,
                                'text-primary': item.active
                            }"
                        >
                            <span class="p-breadcrumb-item-label">{{
                                item.label
                            }}</span>
                        </router-link>
                    </template>
                    <template #separator> / </template>
                </Breadcrumb>
                <router-view :key="route.fullPath"></router-view>
            </div>
            <app-footer></app-footer>
        </div>
        <div class="layout-mask"></div>
    </div>
    <Toast />
</template>
