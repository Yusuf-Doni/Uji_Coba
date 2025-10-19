<script setup>
const props = defineProps({
    name: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
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
    items: {
        type: Object,
        default: []
    },
    requided: {
        type: Boolean,
        default: false
    },
    labelPosition: {
        type: String,
        default: "left"
    },
    paramName: {
        type: String,
        default: "name"
    },
});

const title = defineModel('title')
</script>
<template>
    <div :class="`${labelPosition===`top`?`flex flex-col`:`grid grid-cols-12 gap-2`}  `">
        <div :for="name" :class="`block font-bold mb-3 ${labelPosition===`top`?`w-full`:`col-span-${labelWith}`} align-middle self-center`">
            <label >
                {{ label }} 
            </label>
            <label v-if="requided" class="text-red-600 text-sm">
                * 
            </label>
        </div>
        <div :class="`${labelPosition===`top`?``:`col-span-${12-labelWith}`}`">
            <Skeleton class="mb-2 h-full" v-show="isLoading"></Skeleton>
            <div class="flex flex-wrap gap-4" v-show="!isLoading">
                <div v-for="dt in items" class="flex items-center gap-2">
                    <RadioButton :disabled="disabled" :name="name" :value="dt" 
                    v-model="title" />
                    <label :for="dt['id']">{{ dt[paramName] }}</label>
                </div>
            </div>
            <Message v-if="invalid" severity="error" size="small" variant="simple">
                {{ message }}
            </Message>
        </div>
    </div>
</template>