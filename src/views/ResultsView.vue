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
  } catch {
    // Non-fatal — the SignalR/refresh path will reflect the true state either way.
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
    },
    { onStatusChange: (status) => (connectionStatus.value = status) }
  )
})

onBeforeUnmount(() => {
  stopConnection?.()
})
</script>

<template>
  <section class="wrap">
    <div v-if="loading" class="hint">Loading results...</div>

    <div v-else-if="loadError" class="card">
      <p class="error-banner">{{ loadError }}</p>
      <router-link class="btn btn-ghost" to="/">Create new poll</router-link>
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
      <p class="total">{{ results.totalVotes }} votes</p>

      <div class="card">
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
.wrap {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.hint {
  color: var(--text-soft);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.9rem;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--text-soft);
  padding: 0.5rem 0.8rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: 999px;
}

.question {
  font-size: clamp(1.4rem, 3.6vw, 1.9rem);
  margin-top: 0.3rem;
}

.total {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  color: var(--text-soft);
  margin: 0.2rem 0 1.2rem;
}

.actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}
</style>
