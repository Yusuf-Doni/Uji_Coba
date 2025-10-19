<script setup>
import { onBeforeMount } from 'vue';
import { useAuth } from './stores';

onBeforeMount(() => {
    validateToken();
});

const validateToken = async () => {
    const authStore = useAuth();
    if (authStore.isLoggedIn) {
        await authStore.validateToken();
    }
};
</script>

<template>
    <router-view />
</template>

<style scoped></style>
