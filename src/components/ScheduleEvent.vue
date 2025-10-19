<template>
  <div 
    :class="[
      'schedule-event absolute rounded-lg p-3 text-white text-sm font-medium shadow-sm cursor-pointer transition-all hover:shadow-md',
      getEventColor(event.category),
      event.spanMultiple ? 'col-span-2' : ''
    ]"
    :style="getEventStyle()"
    @click="toggleEvent"
  >
    <div class="flex items-center justify-between mb-2">
      <span class="font-semibold">{{ event.title }}</span>
      <span class="text-xs opacity-80">{{ formatTimeRange() }}</span>
    </div>
    
    <!-- Sub-tasks if any -->
    <div v-if="event.subTasks && event.subTasks.length > 0" class="space-y-1">
      <div 
        v-for="task in event.subTasks" 
        :key="task.id"
        class="flex items-center space-x-2 text-xs"
      >
        <input 
          type="checkbox" 
          :checked="task.completed"
          @click.stop="toggleSubTask(task.id)"
          class="w-3 h-3 rounded border-white"
        />
        <span :class="{ 'line-through opacity-60': task.completed }">
          {{ task.title }}
        </span>
      </div>
    </div>
    
    <!-- Tags -->
    <div v-if="event.tags && event.tags.length > 0" class="flex flex-wrap gap-1 mt-2">
      <span 
        v-for="tag in event.tags" 
        :key="tag"
        class="px-2 py-1 text-xs rounded-full bg-white bg-opacity-20"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  event: {
    type: Object,
    required: true
  },
  timeSlotHeight: {
    type: Number,
    default: 60
  }
});

const emit = defineEmits(['toggle-event', 'toggle-subtask']);

const getEventColor = (category) => {
  const colors = {
    'Productivity': 'bg-purple-600 border-purple-700',
    'Hobby': 'bg-blue-600 border-blue-700',
    'Personal': 'bg-orange-600 border-orange-700',
    'General': 'bg-green-600 border-green-700'
  };
  return colors[category] || 'bg-gray-600 border-gray-700';
};

const getEventStyle = () => {
  const startHour = parseInt(props.event.startTime.split(':')[0]);
  const startMinute = parseInt(props.event.startTime.split(':')[1]);
  const endHour = parseInt(props.event.endTime.split(':')[0]);
  const endMinute = parseInt(props.event.endTime.split(':')[1]);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  const duration = endMinutes - startMinutes;
  
  const top = ((startMinutes - 8 * 60) / 60) * props.timeSlotHeight;
  const height = (duration / 60) * props.timeSlotHeight;
  
  // Calculate left position based on column
  let left = '0%';
  if (props.event.column === 'Productivity') {
    left = '25%'; // First column after time column
  } else if (props.event.column === 'Hobby') {
    left = '50%'; // Second column
  } else if (props.event.column === 'Personal') {
    left = '75%'; // Third column
  }
  
  // Calculate width
  let width = '25%'; // Default width for single column
  if (props.event.spanMultiple) {
    width = '50%'; // Span two columns
  }
  
  return {
    top: `${top}px`,
    height: `${height}px`,
    left: left,
    width: width,
    position: 'absolute'
  };
};

const formatTimeRange = () => {
  return `${props.event.startTime} - ${props.event.endTime}`;
};

const toggleEvent = () => {
  emit('toggle-event', props.event.id);
};

const toggleSubTask = (taskId) => {
  emit('toggle-subtask', { eventId: props.event.id, taskId });
};
</script>
