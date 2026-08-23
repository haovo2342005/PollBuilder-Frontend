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
      <span class="option-label">
        <span class="rank-badge" v-if="rank === 0 && total > 0">★</span>
        {{ label }}
      </span>
      <span class="option-stats">
        <span class="pct">{{ percent }}%</span>
        <span class="cnt">{{ count }}</span>
      </span>
    </div>
    <div class="track">
      <div class="fill" :style="{ width: percent + '%', background: colorVar }" />
    </div>
  </div>
</template>

<style scoped>
.row {
  padding: 1rem 0;
}

.row + .row {
  border-top: 1px solid var(--border);
}

.row-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.55rem;
  gap: 0.75rem;
}

.option-label {
  font-weight: 550;
  font-size: 1rem;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leader .option-label {
  font-weight: 700;
}

.rank-badge {
  color: var(--warning);
  font-size: 0.9rem;
}

.option-stats {
  display: flex;
  align-items: baseline;
  gap: 0.65rem;
  white-space: nowrap;
}

.pct {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text);
}

.cnt {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-faint);
}

.track {
  height: 14px;
  background: var(--surface-raised);
  border-radius: 999px;
  overflow: hidden;
}

.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  min-width: 0;
}

.flash .fill {
  filter: brightness(1.35);
}

.leader .fill {
  box-shadow: 0 0 16px rgba(124, 92, 252, 0.35);
}
</style>
