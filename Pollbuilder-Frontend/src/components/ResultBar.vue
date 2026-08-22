<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  count: { type: Number, required: true },
  total: { type: Number, required: true },
  rank: { type: Number, default: 0 } // 0 = current leader
})

const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.round((props.count / props.total) * 100)
})

// Brief highlight flash whenever this option's count changes.
const justUpdated = ref(false)
watch(
  () => props.count,
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
      justUpdated.value = true
      setTimeout(() => (justUpdated.value = false), 700)
    }
  }
)
</script>

<template>
  <div class="row" :class="{ leader: rank === 0 && total > 0, flash: justUpdated }">
    <div class="row-top">
      <span class="option-label">{{ label }}</span>
      <span class="option-stats">{{ count }} · {{ percent }}%</span>
    </div>
    <div class="track">
      <div class="fill" :style="{ width: percent + '%' }" />
    </div>
  </div>
</template>

<style scoped>
.row {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--line);
}

.row:last-child {
  border-bottom: none;
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.4rem;
}

.option-label {
  font-weight: 500;
}

.leader .option-label {
  font-weight: 700;
}

.option-stats {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.track {
  height: 10px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 2px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--ink);
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.leader .fill {
  background: var(--accent-live);
}

.flash .track {
  border-color: var(--accent-live);
}
</style>
