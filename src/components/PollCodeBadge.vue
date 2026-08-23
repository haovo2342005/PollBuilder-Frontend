<script setup>
defineProps({
  code: { type: String, required: true }
})
</script>

<template>
  <div class="chip">
    <span class="chip-label">CODE</span>
    <span class="chip-code">{{ code }}</span>
  </div>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 1rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.chip-label {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-faint);
}

.chip-code {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>
