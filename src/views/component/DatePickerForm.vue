<script setup>
const props = defineProps({
    nameStartDate: {
        type: String,
        default: 'nameStartDatePicker'
    },
    nameEndDate: {
        type: String,
        default: 'nameEndDatePicker'
    },
    isDateRange: {
        type: Boolean,
        default: false
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
    dateFormat: {
        type: String,
        default: 'dd-mm-yy'
    },
    requided: {
        type: Boolean,
        default: false
    },
    labelPosition: {
        type: String,
        default: 'left'
    },
    view: {
        type: String
    },
    tglMulaiVal: String,
    tglAkhirVal: String
});
</script>
<template>
    <div
        :class="`${props.labelPosition === `top` ? `flex flex-col` : `grid grid-cols-12 gap-2`}  `"
    >
        <div
            :for="props.nameStartDate"
            :class="`block font-bold mb-3 ${props.labelPosition === `top` ? `w-full` : `col-span-${props.labelWith}`} align-middle self-center`"
        >
            <label>
                {{ props.label }}
            </label>
            <label
                v-if="props.requided"
                class="text-red-600 text-sm"
            >
                *
            </label>
        </div>
        <div
            :class="`${props.labelPosition === `top` ? `` : `col-span-${12 - props.labelWith}`}`"
        >
            <Skeleton
                class="mb-2 h-full"
                v-show="props.isLoading"
            ></Skeleton>
            <div
                class="flex flex-row gap-4 w-full"
                v-show="!props.isLoading"
            >
                <DatePicker
                    class="w-full"
                    :showIcon="true"
                    :showButtonBar="true"
                    :name="props.nameStartDate"
                    :placeholder="props.dateFormat"
                    :dateFormat="props.dateFormat"
                    :disabled="props.disabled"
                    :view="props.view"
                />
                <div v-show="props.isDateRange">:</div>
                <DatePicker
                    v-show="props.isDateRange"
                    class="w-full"
                    :showIcon="true"
                    :showButtonBar="true"
                    :name="props.nameEndDate"
                    :placeholder="props.dateFormat"
                    :dateFormat="props.dateFormat"
                    :disabled="props.disabled"
                    :view="props.view"
                />
            </div>
            <Message
                v-if="props.invalid"
                severity="error"
                size="small"
                variant="simple"
            >
                {{ props.message }}
            </Message>
        </div>
    </div>
</template>
