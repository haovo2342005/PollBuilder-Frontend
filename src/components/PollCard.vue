<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BASE_URL } from '../api/http'

const props = defineProps({
  poll: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['delete'])
const router = useRouter()
const isDeleting = ref(false)
const copied = ref(false)

const pollLink = computed(() => {
  return `${window.location.origin}/poll/${props.poll.code}`
})

function copyLink() {
  navigator.clipboard?.writeText(pollLink.value).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}

function goToResults() {
  router.push({ name: 'results', params: { code: props.poll.code } })
}

function goToVote() {
  router.push({ name: 'vote', params: { code: props.poll.code } })
}

async function deletePoll() {
  if (!confirm('Close this poll? Voting will stop.')) return

  isDeleting.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/polls/${props.poll.code}/close`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      emit('delete')
    }
  } catch (err) {
    console.error('Failed to close poll:', err)
    alert('Failed to close poll')
  } finally {
    isDeleting.value = false
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="poll-card">
    <div class="poll-header">
      <span class="code-badge">{{ poll.code }}</span>
      <span v-if="poll.isClosed" class="status-badge closed">Closed</span>
      <span v-else class="status-badge active">
        <span class="status-dot open" /> Active
      </span>
    </div>

    <div class="poll-question">{{ poll.question }}</div>

    <div class="poll-stats">
      <div class="stat">
        <span class="stat-val">{{ poll.voteCount || 0 }}</span>
        <span class="stat-label">votes</span>
      </div>
      <div class="stat">
        <span class="stat-label">{{ formatDate(poll.createdAt) }}</span>
      </div>
    </div>

    <div class="link-section">
      <input type="text" readonly :value="pollLink" class="poll-link-input" />
      <button class="btn-copy" :class="{ copied }" @click="copyLink">
        {{ copied ? '✓' : 'Copy' }}
      </button>
    </div>

    <div class="poll-actions">
      <button class="btn-action primary" @click="goToResults">Results</button>
      <button class="btn-action" @click="goToVote">Vote</button>
      <button
        class="btn-action danger"
        @click="deletePoll"
        :disabled="isDeleting || poll.isClosed"
      >
        {{ isDeleting ? '...' : 'Close' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.poll-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(8px);
}

.poll-card:hover {
  transform: translateY(-3px);
  border-color: rgba(124, 92, 252, 0.35);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-badge {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--gradient);
  color: #fff;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(46, 229, 157, 0.12);
  color: var(--success);
  border: 1px solid rgba(46, 229, 157, 0.3);
}

.status-badge.closed {
  background: rgba(107, 107, 128, 0.15);
  color: var(--text-faint);
  border: 1px solid var(--border);
}

.poll-question {
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.8rem;
}

.poll-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--surface-raised);
  border-radius: var(--radius-sm);
}

.stat {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
}

.stat-val {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
}

.stat-label {
  font-size: 0.82rem;
  color: var(--text-faint);
}

.link-section {
  display: flex;
  gap: 0.5rem;
}

.poll-link-input {
  flex: 1;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-soft);
  background: var(--bg);
  min-width: 0;
}

.btn-copy {
  padding: 0.55rem 0.9rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-copy:hover {
  border-color: var(--accent);
  color: var(--accent-hover);
}

.btn-copy.copied {
  border-color: var(--success);
  color: var(--success);
  background: rgba(46, 229, 157, 0.1);
}

.poll-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.65rem 0.4rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-action:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-action.primary {
  border-color: rgba(124, 92, 252, 0.45);
  color: var(--accent-hover);
}

.btn-action.primary:hover {
  background: var(--accent-soft);
}

.btn-action.danger {
  border-color: rgba(255, 77, 109, 0.35);
  color: var(--live);
}

.btn-action.danger:hover:not(:disabled) {
  background: rgba(255, 77, 109, 0.1);
}

.btn-action:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 400px) {
  .poll-actions {
    grid-template-columns: 1fr;
  }
}
</style>
