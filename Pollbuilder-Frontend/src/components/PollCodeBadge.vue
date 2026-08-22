<script setup>
defineProps({
  code: { type: String, required: true }
})
</script>

<template>
  <div class="stub">
    <span class="stub-label">Poll code</span>
    <span class="stub-code">{{ code }}</span>
  </div>
</template>

<style scoped>
.stub {
  display: inline-flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.85rem 1.4rem;
  background: var(--paper-raised);
  border: 1.5px dashed var(--ink);
  border-radius: 4px;
}

.stub-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--ink-soft);
}

.stub-code {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.14em;
}
</style>
