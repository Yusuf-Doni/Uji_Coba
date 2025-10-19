<script setup>
import AppMenu from './AppMenu.vue';
</script>

<template>
    <div class="layout-sidebar print:hidden">
        <div class="navigation">
            Navigation
        </div>
        <app-menu></app-menu>
    </div>
</template>

<style lang="scss" scoped>
.navigation{
    color: #B1B6B4;
    padding-bottom: 1rem;
    padding-top: 1rem;
    font-size: 16px;
}
</style>
