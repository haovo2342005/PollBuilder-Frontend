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
        :disabled="isDeleting || poll.isClosed"
      >
        {{ isDeleting ? '⏳' : '🔒 Close' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.poll-card {
  background: white;
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poll-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  font-family: monospace;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.closed {
  background: #fce4ec;
  color: #c2185b;
}

.poll-question {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
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
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 10px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-icon {
  font-size: 1.2rem;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
}

.link-section {
  display: flex;
  gap: 0.5rem;
}

.poll-link-input {
  flex: 1;
  padding: 0.6rem 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.8rem;
  font-family: monospace;
  color: #666;
  background: #fafafa;
}

.btn-copy {
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-copy:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

.btn-copy.copied {
  border-color: #2e7d32;
  background: #e8f5e9;
  color: #2e7d32;
}

.poll-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.btn-action {
  padding: 0.7rem 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-results {
  color: #667eea;
  border-color: #667eea;
}

.btn-results:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.btn-vote {
  color: #2e7d32;
  border-color: #2e7d32;
}

.btn-vote:hover {
  background: #e8f5e9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
}

.btn-delete {
  color: #c2185b;
  border-color: #c2185b;
}

.btn-delete:hover:not(:disabled) {
  background: #fce4ec;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(194, 24, 91, 0.2);
}

.btn-delete:disabled {
  opacity: 0.6;
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