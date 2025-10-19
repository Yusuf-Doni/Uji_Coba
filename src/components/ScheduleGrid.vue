<template>
  <div class="schedule-grid flex-1 bg-white p-6 schedule-grid">
    <!-- Grid Header -->
    <div class="grid grid-cols-4 gap-4 mb-4">
      <div class="text-sm font-semibold text-gray-700">Today</div>
      <div class="text-sm font-semibold text-gray-700 text-center">Productivity</div>
      <div class="text-sm font-semibold text-gray-700 text-center">Hobby</div>
      <div class="text-sm font-semibold text-gray-700 text-center">Personal</div>
    </div>

    <!-- Timeline Grid -->
    <div class="relative">
      <!-- Time slots -->
      <div class="grid grid-cols-4 gap-4">
        <!-- Time column -->
        <div class="time-column">
          <div 
            v-for="hour in timeSlots" 
            :key="hour"
            class="time-slot border-b border-gray-100 flex items-center"
          >
            <span class="text-xs text-gray-500 font-mono">{{ formatTime(hour) }}</span>
          </div>
        </div>

        <!-- Category columns -->
        <div 
          v-for="category in categories" 
          :key="category"
          class="category-column relative border-l border-gray-100"
        >
          <div 
            v-for="hour in timeSlots" 
            :key="hour"
            class="time-slot border-b border-gray-100"
          ></div>
        </div>
      </div>

      <!-- Events overlay -->
      <div class="absolute inset-0">
        <ScheduleEvent 
          v-for="event in events" 
          :key="event.id"
          :event="event"
          :time-slot-height="60"
          @toggle-event="toggleEvent"
          @toggle-subtask="toggleSubTask"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import ScheduleEvent from './ScheduleEvent.vue';

const props = defineProps({
  events: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['toggle-event', 'toggle-subtask']);

const timeSlots = computed(() => {
  const slots = [];
  for (let i = 8; i <= 21; i++) {
    slots.push(i);
  }
  return slots;
});

const categories = ['Productivity', 'Hobby', 'Personal'];

const formatTime = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

const toggleEvent = (eventId) => {
  emit('toggle-event', eventId);
};

const toggleSubTask = (data) => {
  emit('toggle-subtask', data);
};
</script>

<style scoped>
.time-slot {
  height: 60px;
}

.category-column {
  position: relative;
}

.schedule-grid {
  height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>
