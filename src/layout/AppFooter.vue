<script setup>
import { onMounted, ref } from 'vue';
const currentYear = ref(null);

onMounted(() => {
    getCurrentyear();
});

const getCurrentyear = () => {
    const currentDate = new Date();
    currentYear.value = currentDate.getFullYear();
};
</script>

<template>
    <div class="layout-footer">Copyright © {{ currentYear }}. PT PLN (Persero). All Rights Reserved.</div>
</template>
