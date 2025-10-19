<template>
  <div class="activity-item flex items-center space-x-3 py-2">
    <div class="flex-shrink-0">
      <input 
        type="checkbox" 
        :checked="activity.completed"
        @change="$emit('toggle', activity.id)"
        class="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
      />
    </div>
    
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <span 
          :class="[
            'text-sm font-medium truncate',
            activity.completed ? 'line-through text-gray-400' : 'text-gray-900'
          ]"
        >
          {{ activity.title }}
        </span>
        <span class="text-xs text-gray-500 font-mono">
          {{ formatDuration(activity.duration) }}
        </span>
      </div>
      
      <div class="flex flex-wrap gap-1 mt-1">
        <span 
          v-for="tag in activity.tags" 
          :key="tag"
          :class="[
            'px-2 py-1 text-xs rounded-full font-medium',
            getTagColor(tag)
          ]"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  activity: {
    type: Object,
    required: true
  }
});

defineEmits(['toggle']);

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

const getTagColor = (tag) => {
  const colors = {
    'Work': 'bg-blue-100 text-blue-800',
    'Business': 'bg-indigo-100 text-indigo-800',
    'Design': 'bg-purple-100 text-purple-800',
    'Development': 'bg-green-100 text-green-800',
    'Hobby': 'bg-yellow-100 text-yellow-800',
    'Sports': 'bg-orange-100 text-orange-800',
    'Game': 'bg-pink-100 text-pink-800',
    'Personal': 'bg-gray-100 text-gray-800',
    'Mental Health': 'bg-teal-100 text-teal-800'
  };
  return colors[tag] || 'bg-gray-100 text-gray-800';
};
</script>
