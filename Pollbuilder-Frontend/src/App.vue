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
  display: flex;
  justify-content: center;
  padding: clamp(1.5rem, 5vw, 4rem) 1.2rem;
}
</style>
