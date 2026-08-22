<script setup></script>

<template>
  <section class="wrap">
    <h1>Page not found</h1>
    <p>This link is incorrect, or the page has been moved.</p>
    <router-link class="btn" to="/">Back to create poll</router-link>
  </section>
</template>

<style scoped>
.wrap {
  max-width: 480px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
</style>
