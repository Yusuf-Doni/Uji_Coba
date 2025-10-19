<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    },
    onHideForm: {
        type: Function,
        default: () => ({})
    }
});

const visibleDialog = ref(false);

watch([() => props.visible], (newVal) => {
    const [visible] = newVal;
    visibleDialog.value = visible;
});
</script>
<template>
    <Dialog
        v-model:visible="visibleDialog"
        modal
        :draggable="false"
        :header="props.label"
        :style="{ width: '60rem' }"
        @hide="props.onHideForm"
    >
        <slot></slot>
    </Dialog>
</template>
