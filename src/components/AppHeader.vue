<script setup>
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <router-link to="/" class="wordmark">
        <span class="mark" />
        Poll Builder
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  padding: 0 clamp(1.2rem, 4vw, 3rem);
  border-bottom: 1px solid var(--border);
  background: rgba(11, 13, 18, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  height: 64px;
  display: flex;
  align-items: center;
}

.wordmark {
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: -0.01em;
  text-decoration: none;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  width: fit-content;
  transition: opacity 0.15s ease;
}

.wordmark:hover {
  opacity: 0.85;
}

.mark {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-soft);
}
</style>
