<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<template>
  <AppHeader />
  <main class="main">
    <router-view />
  </main>
</template>

<style scoped>
.main {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
