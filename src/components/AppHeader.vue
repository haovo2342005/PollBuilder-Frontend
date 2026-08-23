<script setup>
</script>

<template>
  <header class="header">
    <router-link to="/dashboard" class="wordmark">
      <span class="mark" />
      Poll Builder
    </router-link>
  </header>
</template>

<style scoped>
.header {
  padding: 1.1rem clamp(1.2rem, 4vw, 3rem);
  border-bottom: 1px solid var(--border);
}

.wordmark {
  font-weight: 700;
  font-size: 0.98rem;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  width: fit-content;
}

.mark {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
</style>