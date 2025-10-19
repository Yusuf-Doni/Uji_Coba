<template>
  <div class="schedule-header bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left side - Title and Navigation -->
      <div class="flex items-center space-x-6">
        <h1 class="text-2xl font-bold text-gray-900">Schedule</h1>
        
        <!-- Date Navigation -->
        <div class="flex items-center space-x-2">
          <button class="p-2 hover:bg-gray-100 rounded-lg">
            <i class="pi pi-chevron-left text-gray-600"></i>
          </button>
          <div class="px-4 py-2 bg-gray-50 rounded-lg">
            <span class="font-medium text-gray-900">{{ currentDate }}</span>
          </div>
          <button class="p-2 hover:bg-gray-100 rounded-lg">
            <i class="pi pi-chevron-right text-gray-600"></i>
          </button>
        </div>
        
        <!-- View Options -->
        <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button 
            v-for="view in viewOptions" 
            :key="view.value"
            @click="selectedView = view.value"
            :class="[
              'px-3 py-1 rounded-md text-sm font-medium transition-colors',
              selectedView === view.value 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            {{ view.label }}
          </button>
        </div>
      </div>
      
      <!-- Right side - User Actions -->
      <!-- <div class="flex items-center space-x-4">
        <button class="p-2 hover:bg-gray-100 rounded-lg relative">
          <i class="pi pi-bell text-gray-600 text-lg"></i>
          <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
        </button>
        
        <button class="p-2 hover:bg-gray-100 rounded-lg">
          <i class="pi pi-gift text-gray-600 text-lg"></i>
        </button>
        
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white font-semibold text-sm">MF</span>
          </div>
          <div class="text-left">
            <div class="font-medium text-gray-900">Mirza Faturrachman</div>
            <div class="text-sm text-gray-500">Pro Account</div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const selectedView = ref('day');

const viewOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' }
];

const currentDate = computed(() => {
  const date = new Date();
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
});
</script>
