<script setup>
defineProps({
  code: { type: String, required: true }
})
</script>

<template>
  <div class="chip">
    <span class="chip-label">Poll code</span>
    <span class="chip-divider" />
    <span class="chip-code">{{ code }}</span>
  </div>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.85rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
}

.chip-label {
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-faint);
}

.chip-divider {
  width: 1px;
  height: 14px;
  background: var(--border-strong);
}

.chip-code {
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--text);
}
</style>
