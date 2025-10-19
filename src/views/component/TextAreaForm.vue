<script setup>
import { Textarea } from 'primevue';
import { computed, onUpdated } from 'vue';

    const props = defineProps({
    name: {
        type: String,
        default: "nameInput"
    },
    label: {
        type: String,
        default: "Label"
    },
    labelWith: {
        type: Number,
        default: 2
    },
    message: {
        type: String,
        default: null
    },
    isLoading: {
        type: Boolean,
        default: false
    },
    disabled: {
        type: Boolean,
        default: false
    },
    invalid: {
        type: Boolean,
        default: false
    },
    requided: {
        type: Boolean,
        default: false
    },
    labelPosition: {
        type: String,
        default: "left"
    },
});
</script>
<template>
    
    <div :class="`${labelPosition===`top`?`flex flex-col`:`grid grid-cols-12 gap-2`}  `">
        <div :for="name" :class="`block font-bold mb-3 ${labelPosition===`top`?`w-full`:`col-span-${labelWith}`} align-middle self-center`">
            <label>
                {{ label }} 
            </label>
            <label v-if="requided" class="text-red-600 text-sm">
                * 
            </label>
        </div>
        
        <div :class="`${labelPosition===`top`?``:`col-span-${12-labelWith}`}`">
            <Skeleton class="mb-2 h-full" v-show="isLoading"></Skeleton>
            <Textarea :name="name" type="text" v-show="!isLoading" :disabled="disabled" />
            <Message v-if="invalid" severity="error" size="small" variant="simple">
                {{ message }}
            </Message>
        </div>
    </div>
</template>