<template>
  <div class="schedule-dashboard h-screen flex flex-col bg-gray-50">
    <!-- Header -->
    <ScheduleHeader />
    
    <!-- Main Content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar -->
      <TodayActivity 
        :user-name="userName"
        @toggle-activity="toggleActivity"
        @add-todo="addNewTodo"
      />
      
      <!-- Main Grid -->
      <ScheduleGrid 
        :events="scheduleEvents"
        @toggle-event="toggleEvent"
        @toggle-subtask="toggleSubTask"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import ScheduleHeader from './ScheduleHeader.vue';
import TodayActivity from './TodayActivity.vue';
import ScheduleGrid from './ScheduleGrid.vue';

const userName = ref('Mirza');

// Sample schedule events data
const scheduleEvents = ref([
  {
    id: 1,
    title: 'Meeting with team',
    startTime: '08:00',
    endTime: '08:30',
    category: 'Productivity',
    column: 'Productivity',
    tags: ['Work', 'Business']
  },
  {
    id: 2,
    title: 'Create Personal Project',
    startTime: '09:00',
    endTime: '11:00',
    category: 'Personal',
    column: 'Personal',
    subTasks: [
      { id: 1, title: 'Setup the directory github project', completed: true },
      { id: 2, title: 'Setup NextJS', completed: false },
      { id: 3, title: 'Setup TailwindCSS', completed: false }
    ],
    tags: ['Personal', 'Design']
  },
  {
    id: 3,
    title: 'Playing Mobile Legends',
    startTime: '11:00',
    endTime: '12:00',
    category: 'Hobby',
    column: 'Hobby',
    tags: ['Hobby', 'Game']
  },
  {
    id: 4,
    title: 'Take a nap',
    startTime: '12:00',
    endTime: '13:00',
    category: 'General',
    column: 'Productivity',
    spanMultiple: true,
    tags: ['Break']
  },
  {
    id: 5,
    title: 'Research design market',
    startTime: '13:00',
    endTime: '15:30',
    category: 'Productivity',
    column: 'Productivity',
    subTasks: [
      { id: 4, title: 'Monitoring design and technology trends', completed: false },
      { id: 5, title: 'Dribbble', completed: true },
      { id: 6, title: 'Behance', completed: true },
      { id: 7, title: 'Canva', completed: false },
      { id: 8, title: 'LinkedIn', completed: false }
    ],
    tags: ['Work', 'Business']
  },
  // {
  //   id: 6,
  //   title: 'Give some feedback',
  //   startTime: '15:40',
  //   endTime: '16:00',
  //   category: 'Productivity',
  //   column: 'Productivity',
  //   tags: ['Work']
  // },
  {
    id: 7,
    title: 'Reading Al-Qur\'an',
    startTime: '16:00',
    endTime: '16:30',
    category: 'Personal',
    column: 'Personal',
    tags: ['Personal', 'Mental Health']
  },
  {
    id: 8,
    title: 'Reading development book',
    startTime: '16:00',
    endTime: '16:30',
    category: 'Personal',
    column: 'Personal',
    tags: ['Personal', 'Development']
  },
  {
    id: 9,
    title: 'Badminton training',
    startTime: '16:30',
    endTime: '18:00',
    category: 'Hobby',
    column: 'Hobby',
    tags: ['Hobby', 'Sports']
  },
  {
    id: 10,
    title: 'One-on-One with 3D Team',
    startTime: '19:00',
    endTime: '20:00',
    category: 'Productivity',
    column: 'Productivity',
    tags: ['Work', 'Business', 'Development']
  }
]);

const toggleActivity = (activityId) => {
  // Handle activity toggle logic
  console.log('Toggle activity:', activityId);
};

const addNewTodo = (todoData) => {
  // Handle adding new todo logic
  console.log('Add new todo:', todoData);
};

const toggleEvent = (eventId) => {
  // Handle event toggle logic
  console.log('Toggle event:', eventId);
};

const toggleSubTask = (data) => {
  // Handle sub-task toggle logic
  console.log('Toggle sub-task:', data);
};
</script>
