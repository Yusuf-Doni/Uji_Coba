<script setup>
import { ref, watch } from 'vue';
import BusinessAreaAdd from './BusinessAreaAdd.vue';

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    label: {
        type: String,
        default: ''
    },
    data: {
        type: Object,
        default: () => {}
    },
    onHideForm: {
        type: Function,
        default: () => ({})
    },
    onChangeLoading: {
        type: Function,
        default: () => ({})
    },
    isLoading: {
        type: Boolean,
        default: false
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
        :pt="{
            pcCloseButton: {
                root: {
                    display: false
                }
            }
        }"
    >
        <BusinessAreaAdd
            :data="props.data"
            :onClose="props.onHideForm"
            @on-change-loading="props.onChangeLoading"
            :is-loading="props.isLoading"
        />
    </Dialog>
</template>
