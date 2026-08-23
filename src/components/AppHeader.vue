<script setup>
</script>

<template>
  <header class="header">
    <router-link to="/dashboard" class="wordmark">
      <span class="logo-mark">
        <span class="logo-bar b1" />
        <span class="logo-bar b2" />
        <span class="logo-bar b3" />
      </span>
      Poll Builder
    </router-link>
  </header>
</template>

<style scoped>
.header {
  padding: 1rem clamp(1.2rem, 4vw, 2.5rem);
  border-bottom: 1px solid var(--border);
  background: rgba(10, 10, 15, 0.7);
  backdrop-filter: blur(16px);
  position: sticky;
  top: 0;
  z-index: 50;
}

.wordmark {
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.02em;
  text-decoration: none;
  color: var(--text);
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  transition: opacity 0.15s;
}

.wordmark:hover {
  opacity: 0.85;
}

.logo-mark {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 18px;
}

.logo-bar {
  width: 5px;
  border-radius: 2px;
  background: var(--gradient);
}

.logo-bar.b1 { height: 8px; }
.logo-bar.b2 { height: 14px; }
.logo-bar.b3 { height: 18px; }
</style>
