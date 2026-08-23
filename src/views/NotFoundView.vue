<script setup></script>

<template>
  <section class="wrap">
    <div class="code-404">404</div>
    <h1>Page not found</h1>
    <p>This link is incorrect, or the page has been moved.</p>
    <router-link class="btn" to="/dashboard">Back to dashboard</router-link>
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
  padding: 3rem 1rem;
  animation: fadeUp 0.4s ease both;
}

.code-404 {
  font-size: 4rem;
  font-weight: 800;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.04em;
  line-height: 1;
}

h1 {
  font-size: 1.5rem;
}

p {
  margin-bottom: 0.5rem;
}
</style>
