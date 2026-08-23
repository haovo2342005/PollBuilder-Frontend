<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'

const route = useRoute()

const hideHeader = computed(() =>
  ['login', 'register'].includes(route.name)
)
</script>

<template>
  <AppHeader v-if="!hideHeader" />
  <main class="main" :class="{ 'main-full': hideHeader }">
    <router-view />
  </main>
</template>

<style scoped>
.main {
  flex: 1;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: clamp(1.25rem, 4vw, 2.5rem) clamp(1rem, 3vw, 2rem);
}

.main-full {
  padding: 0;
  min-height: 100vh;
}
</style>
