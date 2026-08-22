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
    connecting: 'Đang kết nối...',
    connected: 'Trực tiếp',
    reconnecting: 'Đang kết nối lại...',
    disconnected: 'Mất kết nối'
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
        ? `Không tìm thấy poll với mã "${props.code}".`
        : 'Không thể tải kết quả. Thử lại sau.'
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
    <div v-if="loading" class="hint">Đang tải kết quả...</div>

    <div v-else-if="loadError" class="card">
      <p class="error-banner">{{ loadError }}</p>
      <router-link class="btn btn-ghost" to="/">Tạo poll mới</router-link>
    </div>

    <template v-else>
      <div class="top-row">
        <PollCodeBadge :code="results.code" />
        <div class="live-indicator" :class="results.isClosed ? 'closed' : connectionStatus">
          <span
            class="status-dot"
            :class="results.isClosed ? 'closed' : connectionStatus === 'connected' ? 'live' : 'closed'"
          />
          {{ results.isClosed ? 'Đã đóng' : statusLabel }}
        </div>
      </div>

      <h1 class="question">{{ results.question }}</h1>
      <p class="total">{{ results.totalVotes }} phiếu bầu</p>

      <div class="card">
        <ResultBar
          v-for="(opt, i) in results.options"
          :key="i"
          :label="opt"
          :count="results.voteCounts[i]"
          :total="results.totalVotes"
          :rank="rankOf(i)"
        />
      </div>

      <div class="actions">
        <router-link class="btn btn-ghost" :to="{ name: 'vote', params: { code: results.code } }">
          Mở trang bỏ phiếu
        </router-link>
        <button
          v-if="!results.isClosed"
          class="btn btn-danger"
          type="button"
          :disabled="closing"
          @click="handleClose"
        >
          {{ closing ? 'Đang đóng...' : 'Đóng poll' }}
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
  color: var(--ink-soft);
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.8rem;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--ink-soft);
  padding-top: 0.4rem;
}

.question {
  font-size: clamp(1.4rem, 3.6vw, 1.9rem);
  margin-top: 0.3rem;
}

.total {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  margin: 0.2rem 0 1.2rem;
}

.actions {
  display: flex;
  gap: 0.7rem;
  margin-top: 1.4rem;
  flex-wrap: wrap;
}
</style>
