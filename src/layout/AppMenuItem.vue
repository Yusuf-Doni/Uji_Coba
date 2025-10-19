<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const { layoutState, setActiveMenuItem, onMenuToggle } = useLayout();

const props = defineProps({
    item: {
        type: Object,
        default: () => ({})
    },
    index: {
        type: Number,
        default: 0
    },
    root: {
        type: Boolean,
        default: true
    },
    parentItemKey: {
        type: String,
        default: null
    }
});

const isActiveMenu = ref(false);
const itemKey = ref(null);
const isRootCollapsed = ref(true);

onBeforeMount(() => {
    itemKey.value = props.parentItemKey
        ? props.parentItemKey + '-' + props.index
        : String(props.index);

    const activeItem = layoutState.activeMenuItem;

    isActiveMenu.value =
        activeItem === itemKey.value || activeItem
            ? activeItem.startsWith(itemKey.value + '-')
            : false;
});

watch(
    () => layoutState.activeMenuItem,
    (newVal) => {
        isActiveMenu.value =
            newVal === itemKey.value || newVal.startsWith(itemKey.value + '-');
    }
);

const itemClick = (event, item) => {
    if (item.disabled) {
        event.preventDefault();
        return;
    }

    if (
        (item.path || item.url) &&
        (layoutState.staticMenuMobileActive || layoutState.overlayMenuActive)
    ) {
        onMenuToggle();
    }

    if (item.command) {
        item.command({ originalEvent: event, item: item });
    }

    const foundItemKey = item.items
        ? isActiveMenu.value
            ? props.parentItemKey
            : itemKey
        : itemKey.value;

    setActiveMenuItem(foundItemKey);
};

const checkActiveRoute = (item) => {
    return route.path.includes(item.path);
};

const checkIsParentActiveRoute = (item) => {
    if (item.items) {
        const childItem = item.items;
        return childItem.some((item) => route.path.includes(item.path));
    } else {
        false;
    }
};

const toggleRootMenu = (event, item) => {
    if (item.items) {
        event.preventDefault();
    } else {
        router.push(item.path);
    }

    isRootCollapsed.value = !isRootCollapsed.value;
};
</script>

<template>
    <li
        :class="{
            'layout-root-menuitem': root,
            'active-menuitem': isActiveMenu
        }"
        class="py-1"
    >
        <div
            v-if="root && item.visible !== false"
            class="layout-menuitem-root-text flex justify-between items-center cursor-pointer before:absolute before:-z-10 before:content-[''] before:left-0 before:w-full before:h-11 hover:before:bg-[#f1f5f9] before:transition before:ease-default"
            :class="{ 'text-primary-900': checkActiveRoute(item) }"
            @click="toggleRootMenu($event, item)"
        >
            <span class="flex items-center">
                <i
                    :class="item.icon"
                    class="layout-menuitem-icon mr-1"
                ></i>
                {{ item.name }}
            </span>
            <i
                class="pi pi-fw pi-angle-down transition"
                :class="isRootCollapsed ? null : 'transform -rotate-180'"
                v-if="item.items"
            ></i>
        </div>
        <a
            v-if="(!item.path || item.items) && item.visible !== false"
            :href="item.url"
            @click="itemClick($event, item, index)"
            :class="item.class"
            :target="item.target"
            tabindex="0"
        >
            <i
                :class="item.icon"
                class="layout-menuitem-icon"
            ></i>
            <span class="layout-menuitem-text">{{ item.name }}</span>
            <i
                class="pi pi-fw pi-angle-down layout-submenu-toggler"
                v-if="item.items"
            ></i>
        </a>
        <router-link
            v-if="item.path && !item.items && item.visible !== false"
            @click="itemClick($event, item, index)"
            :class="[item.class, { 'active-route': checkActiveRoute(item) }]"
            tabindex="0"
            :to="item.path"
        >
            <i
                :class="item.icon"
                class="layout-menuitem-icon"
            ></i>
            <span class="layout-menuitem-text">{{ item.name }}</span>
            <i
                class="pi pi-fw pi-angle-down layout-submenu-toggler"
                v-if="item.items"
            ></i>
        </router-link>
        <Transition
            v-if="item.items && item.visible !== false"
            name="layout-submenu"
        >
            <ul
                v-show="
                    root
                        ? !isRootCollapsed || checkIsParentActiveRoute(item)
                        : isActiveMenu
                "
                class="layout-submenu"
            >
                <app-menu-item
                    v-for="(child, i) in item.items"
                    :key="child"
                    :index="i"
                    :item="child"
                    :parentItemKey="itemKey"
                    :root="false"
                ></app-menu-item>
            </ul>
        </Transition>
    </li>
</template>

<style lang="scss" scoped></style>
