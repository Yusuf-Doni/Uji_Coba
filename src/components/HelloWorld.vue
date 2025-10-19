
<script setup>
  import { ref } from 'vue';

  defineProps({ msg: String });

  const count = ref(0);
</script>

<template>
  <div>
    <h1>{{ msg }}</h1>
    <button @click="count++">Clicked {{ count }} times</button>
  </div>
</template>
