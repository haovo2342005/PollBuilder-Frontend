<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { getResults } from '../api/votes'
import { closePoll } from '../api/polls'
import { ApiError } from '../api/http'
import { connectToPollResults } from '../realtime/pollHub'
import PollCodeBadge from '../components/PollCodeBadge.vue'
import ResultBar from '../components/ResultBar.vue'

const props = defineProps({
  code: { type: String, required: true }
})

const loading = ref(true)
const loadError = ref(null)
const realtimeError = ref(null)
const results = ref(null)
const connectionStatus = ref('connecting') // connecting | connected | reconnecting | disconnected
const closing = ref(false)

let stopConnection = null

const rankedIndexes = computed(() => {
  if (!results.value) return []
  return results.value.voteCounts
    .map((count, i) => ({ count, i }))
    .sort((a, b) => b.count - a.count)
    .map((entry) => entry.i)
})

function rankOf(index) {
  return rankedIndexes.value.indexOf(index)
}

const statusLabel = computed(() => {
  return {
    connecting: 'Connecting...',
    connected: 'Live',
    reconnecting: 'Reconnecting...',
    disconnected: 'Disconnected'
  }[connectionStatus.value]
})

async function load() {
  loading.value = true
  loadError.value = null
  try {
    results.value = await getResults(props.code)
  } catch (err) {
    loadError.value =
      err instanceof ApiError && err.status === 404
        ? `Poll with code "${props.code}" not found.`
        : 'Failed to load results. Please try again later.'
  } finally {
    loading.value = false
  }
}

async function handleClose() {
  closing.value = true
  try {
    await closePoll(props.code)
    if (results.value) results.value.isClosed = true
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      realtimeError.value = 'Only the poll creator can close this poll.'
    }
  } finally {
    closing.value = false
  }
}

onMounted(async () => {
  await load()
  if (loadError.value) return

  stopConnection = connectToPollResults(
    props.code,
    (message) => {
      results.value = message
      realtimeError.value = null
    },
    {
      onStatusChange: (status) => (connectionStatus.value = status),
      onError: (message) => {
        realtimeError.value =
          message ||
          'Only the poll creator can view live results for this poll.'
      }
    }
  )
})

onBeforeUnmount(() => {
  stopConnection?.()
})
</script>

<template>
  <section class="results-page">
    <div v-if="loading" class="state-msg">Loading results...</div>

    <div v-else-if="loadError" class="state-card">
      <p class="error-banner">{{ loadError }}</p>
      <router-link class="btn btn-ghost" to="/dashboard">Go to dashboard</router-link>
    </div>

    <template v-else>
      <div class="top-row">
        <PollCodeBadge :code="results.code" />
        <div class="live-indicator" :class="results.isClosed ? 'closed' : connectionStatus">
          <span
            class="status-dot"
            :class="results.isClosed ? 'closed' : connectionStatus === 'connected' ? 'live' : 'closed'"
          />
          {{ results.isClosed ? 'Closed' : statusLabel }}
        </div>
      </div>

      <h1 class="question">{{ results.question }}</h1>
      <p class="total">
        <strong>{{ results.totalVotes }}</strong> {{ results.totalVotes === 1 ? 'vote' : 'votes' }}
      </p>

      <p v-if="realtimeError" class="error-banner">{{ realtimeError }}</p>

      <div class="results-card">
        <ResultBar
          v-for="(opt, i) in results.options"
          :key="i"
          :label="opt"
          :count="results.voteCounts[i]"
          :total="results.totalVotes"
          :rank="rankOf(i)"
          :index="i"
        />
      </div>

      <div class="actions">
        <router-link class="btn btn-ghost" :to="{ name: 'vote', params: { code: results.code } }">
          Open voting page
        </router-link>
        <button
          v-if="!results.isClosed"
          class="btn btn-danger"
          type="button"
          :disabled="closing"
          @click="handleClose"
        >
          {{ closing ? 'Closing...' : 'Close poll' }}
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.results-page {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  animation: fadeUp 0.4s ease both;
  padding-bottom: 2rem;
}

.state-msg {
  color: var(--text-soft);
  text-align: center;
  padding: 4rem 0;
}

.state-card {
  max-width: 480px;
  margin: 2rem auto;
  text-align: center;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-soft);
  padding: 0.5rem 0.95rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.live-indicator.connected {
  border-color: rgba(255, 77, 109, 0.35);
  color: var(--live);
}

.question {
  font-size: clamp(1.5rem, 4vw, 2.2rem);
  line-height: 1.25;
  margin-top: 0.25rem;
}

.total {
  font-size: 0.95rem;
  color: var(--text-soft);
  margin: 0.15rem 0 1.4rem;
}

.total strong {
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 1.15rem;
}

.results-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.5rem 1.75rem;
  backdrop-filter: blur(12px);
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}
</style>
