<template>
  <div class="w-64">
    <Select
      v-model="selectedOption"
      :suggestions="options"
      :completeMethod="loadMoreOptions"
      :field="optionLabel"
      :placeholder="placeholder"
      @scroll="handleScroll"
      @input="onSelect"
      :showEmptyMessage="true"
      dropdown
      class="w-full"
    />
    <p class="mt-2">
      Selected Option: {{ selectedOption ? selectedOption[optionLabel] : "None" }}
    </p>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";

export default {
  props: {
    loadMore: {
      type: Function,
      required: true,
    },
    optionLabel: {
      type: String,
      default: "label",
    },
    optionValue: {
      type: String,
      default: "value",
    },
    placeholder: {
      type: String,
      default: "Select an option",
    },
  },
  emits: ["update:selected"], // Declare the custom event
  setup(props, { emit }) {
    const options = ref([]);
    const selectedOption = ref(null);
    const loading = ref(false);
    const page = ref(1);
    const pageSize = ref(10);
    const hasMore = ref(true);

    const loadMoreOptions = async () => {
      if (!hasMore.value || loading.value) return;

      loading.value = true;
      const newOptions = await props.loadMore(page.value, pageSize.value);
      options.value = [...options.value, ...newOptions];

      if (newOptions.length < pageSize.value) {
        hasMore.value = false;
      } else {
        page.value += 1;
      }
      loading.value = false;
    };

    const handleScroll = async (event) => {
      const dropdownElement = event.target;
      if (
        dropdownElement.scrollTop + dropdownElement.clientHeight >=
        dropdownElement.scrollHeight - 10
      ) {
        await loadMoreOptions();
      }
    };

    const onSelect = (value) => {
      emit("update:selected", value); // Emit selected value to parent
    };

    onMounted(loadMoreOptions);

    return {
      options,
      selectedOption,
      loadMoreOptions,
      handleScroll,
      onSelect,
    };
  },
};
</script>

<style scoped>
/* Tailwind and PrimeVue styling adjustments (if needed) */
</style>
