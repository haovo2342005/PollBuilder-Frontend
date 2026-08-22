<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  count: { type: Number, required: true },
  total: { type: Number, required: true },
  rank: { type: Number, default: 0 }, // 0 = current leader
  index: { type: Number, default: 0 } // for color rotation
})

const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.round((props.count / props.total) * 100)
})

const colorVar = computed(() => `var(--series-${(props.index % 6) + 1})`)

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
      <div class="fill" :style="{ width: percent + '%', background: colorVar }" />
    </div>
  </div>
</template>

<style scoped>
.row {
  padding: 0.75rem 0;
}

.row + .row {
  border-top: 1px solid var(--border);
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.5rem;
  gap: 0.6rem;
}

.option-label {
  font-weight: 500;
  font-size: 0.94rem;
  color: var(--text);
}

.leader .option-label {
  font-weight: 700;
}

.option-stats {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-soft);
  white-space: nowrap;
}

.track {
  height: 6px;
  background: var(--surface-raised);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.flash .fill {
  filter: brightness(1.3);
}
</style>
