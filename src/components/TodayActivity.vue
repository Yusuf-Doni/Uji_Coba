<template>
  <div class="today-activity bg-white border-r border-gray-200 w-80 p-6 overflow-y-auto">
    <!-- Header -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">Today Activity</h2>
      <p class="text-gray-600 text-sm">Hi {{ userName }}, Let's rock for today!</p>
      
      <!-- <button class="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-all">
        <i class="pi pi-star-fill text-yellow-300"></i>
        <span>Plan Your Day with AI</span>
      </button> -->
    </div>

    <!-- Activity Categories -->
    <div class="space-y-6">
      <div v-for="category in activityCategories" :key="category.name" class="activity-category">
        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
          {{ category.name }}
        </h3>
        
        <div class="space-y-1">
          <ActivityItem 
            v-for="activity in category.activities" 
            :key="activity.id"
            :activity="activity"
            @toggle="toggleActivity"
          />
        </div>
        
        <!-- Add new todo input -->
        <div class="mt-3">
          <input 
            type="text" 
            :placeholder="`Add new ${category.name.toLowerCase()}...`"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            @keyup.enter="addNewTodo($event, category.name)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ActivityItem from './ActivityItem.vue';

const props = defineProps({
  userName: {
    type: String,
    default: 'Mirza'
  }
});

const emit = defineEmits(['toggle-activity', 'add-todo']);

const activityCategories = ref([
  {
    name: 'Productivity',
    activities: [
      {
        id: 1,
        title: 'Meeting with team',
        duration: 30,
        completed: true,
        tags: ['Work', 'Business']
      },
      {
        id: 2,
        title: 'Design exploration',
        duration: 45,
        completed: true,
        tags: ['Work', 'Design']
      },
      {
        id: 3,
        title: 'Research design market',
        duration: 150,
        completed: false,
        tags: ['Work', 'Business']
      },
      {
        id: 4,
        title: 'One-on-one with 3D Team',
        duration: 60,
        completed: false,
        tags: ['Work', 'Business', 'Development']
      },
      {
        id: 5,
        title: 'Give some feedback',
        duration: 20,
        completed: false,
        tags: ['Work']
      }
    ]
  },
  {
    name: 'Hobby',
    activities: [
      {
        id: 6,
        title: 'Playing Mobile Legends',
        duration: 30,
        completed: false,
        tags: ['Hobby', 'Game']
      },
      {
        id: 7,
        title: 'Badminton training',
        duration: 90,
        completed: false,
        tags: ['Hobby', 'Sports']
      },
      {
        id: 8,
        title: 'Weekly fun futsal',
        duration: 60,
        completed: false,
        tags: ['Hobby', 'Sports']
      }
    ]
  },
  {
    name: 'Personal',
    activities: [
      {
        id: 9,
        title: 'Create personal website',
        duration: 120,
        completed: true,
        tags: ['Personal', 'Design']
      },
      {
        id: 10,
        title: 'Take a video for Youtube',
        duration: 45,
        completed: true,
        tags: ['Personal', 'Development']
      },
      {
        id: 11,
        title: 'Reading Al-Qur\'an',
        duration: 30,
        completed: false,
        tags: ['Personal', 'Mental Health']
      },
      {
        id: 12,
        title: 'Reading development book',
        duration: 30,
        completed: false,
        tags: ['Personal', 'Development']
      }
    ]
  }
]);

const toggleActivity = (activityId) => {
  emit('toggle-activity', activityId);
};

const addNewTodo = (event, categoryName) => {
  const title = event.target.value.trim();
  if (title) {
    emit('add-todo', { title, category: categoryName });
    event.target.value = '';
  }
};
</script>
