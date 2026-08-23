<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

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
  if (!confirm('Are you sure you want to delete this poll?')) return

  isDeleting.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`/api/polls/${props.poll.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (response.ok) {
      emit('delete')
    }
  } catch (err) {
    console.error('Failed to delete poll:', err)
    alert('Failed to delete poll')
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
    <!-- Header -->
    <div class="poll-header">
      <div class="poll-code">
        <span class="code-badge">{{ poll.code }}</span>
      </div>
      <div class="poll-status">
        <span v-if="poll.isClosed" class="status-badge closed">🔒 Closed</span>
        <span v-else class="status-badge active">🟢 Active</span>
      </div>
    </div>

    <!-- Question -->
    <div class="poll-question">
      {{ poll.question }}
    </div>

    <!-- Stats -->
    <div class="poll-stats">
      <div class="stat">
        <span class="stat-icon">🗳️</span>
        <span class="stat-label">{{ poll.voteCount || 0 }} votes</span>
      </div>
      <div class="stat">
        <span class="stat-icon">⏰</span>
        <span class="stat-label">{{ formatDate(poll.createdAt) }}</span>
      </div>
    </div>

    <!-- Link Section -->
    <div class="link-section">
      <input
        type="text"
        readonly
        :value="pollLink"
        class="poll-link-input"
      />
      <button
        class="btn-copy"
        :class="{ copied }"
        @click="copyLink"
      >
        {{ copied ? '✓ Copied' : '📋' }}
      </button>
    </div>

    <!-- Actions -->
    <div class="poll-actions">
      <button
        class="btn-action btn-results"
        @click="goToResults"
      >
        📊 Results
      </button>
      <button
        class="btn-action btn-vote"
        @click="goToVote"
      >
        🗳️ Vote
      </button>
      <button
        class="btn-action btn-delete"
        @click="deletePoll"
        :disabled="isDeleting"
      >
        {{ isDeleting ? '⏳' : '🗑️ Delete' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.poll-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  transition: border-color 0.2s ease, transform 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poll-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-strong);
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-badge {
  display: inline-block;
  background: var(--accent-soft);
  color: var(--accent-hover);
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 600;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(47, 217, 146, 0.12);
  color: var(--success);
}

.status-badge.closed {
  background: rgba(255, 84, 112, 0.12);
  color: var(--live);
}

.poll-question {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  min-height: 2.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poll-stats {
  display: flex;
  gap: 1.5rem;
  padding: 0.9rem 1rem;
  background: var(--surface-raised);
  border-radius: var(--radius-sm);
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.05rem;
}

.stat-label {
  color: var(--text-soft);
  font-size: 0.87rem;
  font-weight: 500;
}

.link-section {
  display: flex;
  gap: 0.5rem;
}

.poll-link-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.78rem;
  font-family: var(--font-mono);
  color: var(--text-soft);
  background: var(--surface-raised);
}

.btn-copy {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-copy:hover {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.btn-copy.copied {
  border-color: var(--success);
  background: rgba(47, 217, 146, 0.12);
  color: var(--success);
}

.poll-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.btn-action {
  padding: 0.65rem 0.5rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.82rem;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-sans);
}

.btn-results {
  color: var(--accent-hover);
  border-color: rgba(108, 92, 231, 0.35);
}

.btn-results:hover {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.btn-vote {
  color: var(--success);
  border-color: rgba(47, 217, 146, 0.35);
}

.btn-vote:hover {
  background: rgba(47, 217, 146, 0.1);
  border-color: var(--success);
}

.btn-delete {
  color: var(--live);
  border-color: rgba(255, 84, 112, 0.35);
}

.btn-delete:hover:not(:disabled) {
  background: rgba(255, 84, 112, 0.1);
  border-color: var(--live);
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .poll-card {
    padding: 1rem;
  }

  .poll-actions {
    grid-template-columns: 1fr;
  }

  .link-section {
    flex-direction: column;
  }

  .btn-copy {
    width: 100%;
  }
}
</style>
