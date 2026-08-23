<script setup></script>

<template>
  <section class="page">
    <div class="wrap page-inner">
      <h1>Page not found</h1>
      <p>This link is incorrect, or the page has been moved.</p>
      <router-link class="btn" to="/">Back to create poll</router-link>
    </div>
  </section>
</template>

<style scoped>
.page {
  width: 100%;
  align-items: center;
}

.wrap {
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
</style>
