<script setup>
const props = defineProps({
    name: {
        type: String,
        default: 'nameInput'
    },
    label: {
        type: String,
        default: 'Label'
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
    showClear: {
        type: Boolean,
        default: false
    },
    
    labelPosition: {
        type: String,
        default: 'left'
    },
    paramName: {
        type: String,
        default: 'name'
    },
    filterApi: {
        type: Function
    },
    filterFields: {
        type: Array,
        default: ['']
    },
    onChange: {
        type: Function
    },
    virtualScrollerOptions:{
        type: Object
    },
    value:{
        type: Object
    }
    
});
const emit = defineEmits(['onclose']);
</script>
<template>
    <div
        :class="`${labelPosition === `top` ? `flex flex-col` : `grid grid-cols-12 gap-2`}  `"
    >
        <div
            v-if="label != ''"
            :for="name"
            :class="`block font-bold mb-3 ${labelPosition === `top` ? `w-full` : `col-span-${labelWith}`} align-middle self-center`"
        >
            <label>
                {{ label }}
            </label>
            <label
                v-if="requided"
                class="text-red-600 text-sm"
            >
                *
            </label>
        </div>
        <div :class="`${labelPosition===`top`?``:`col-span-${12-labelWith}`}`">
            <Skeleton class="mb-2 h-full" v-show="value && disabled && isLoading"></Skeleton>
            <InputText autocomplete="off"  v-if="value && disabled" v-model:model-value="value[paramName]" type="text" v-show="!isLoading" :disabled="disabled" />
            <Select v-else
                :disabled="disabled"
                :name="name" 
                :options="items" 
                filter 
                optionLabel="name"
                :placeholder="`Pilih ${label}`" 
                class="w-full" 
                :filterFields="filterFields"
                @filter="filterApi"
                v-on:change="onChange"
                :virtual-scroller-options="virtualScrollerOptions"
                :loading="isLoading" 
                :showClear="showClear"

            >
                <template #value="slotProps">
                    <div
                        v-if="slotProps.value"
                        class="flex items-start"
                    >
                        <div>{{ slotProps.value[paramName] }}</div>
                    </div>
                    <span v-else>
                        {{ slotProps.placeholder }}
                    </span>
                </template>
                <template #option="slotProps">
                    <div class="flex items-start">
                        <div>{{ slotProps.option[paramName] }}</div>
                    </div>
                </template>
            </Select>
            <Message
                v-if="invalid"
                severity="error"
                size="small"
                variant="simple"
            >
                {{ message }}
            </Message>
        </div>
    </div>
</template>