<script setup>
import { onMounted, ref } from 'vue'
import { getMyPolls, closePoll } from '../api/polls'
import { ApiError } from '../api/http'

const polls = ref([])
const loading = ref(true)
const errorMessage = ref(null)
const closingCode = ref(null)

async function load() {
  loading.value = true
  errorMessage.value = null
  try {
    polls.value = await getMyPolls()
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError ? err.detail || err.title : 'Không thể tải danh sách poll.'
  } finally {
    loading.value = false
  }
}

async function handleClose(code) {
  closingCode.value = code
  try {
    await closePoll(code)
    const poll = polls.value.find((p) => p.code === code)
    if (poll) poll.isClosed = true
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError ? err.detail || err.title : 'Không thể đóng poll này.'
  } finally {
    closingCode.value = null
  }
}

function voteLink(code) {
  return `${window.location.origin}/poll/${code}`
}

onMounted(load)
</script>

<template>
  <section class="wrap">
    <h1 class="title">Poll của tôi</h1>
    <p class="subtitle">Danh sách poll bạn đã tạo.</p>

    <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

    <p v-if="loading">Đang tải...</p>

    <template v-else>
      <div v-if="polls.length === 0" class="card empty-card">
        <p>Bạn chưa tạo poll nào.</p>
        <router-link class="btn" :to="{ name: 'create-poll' }">Tạo poll mới</router-link>
      </div>

      <ul v-else class="poll-list">
        <li v-for="poll in polls" :key="poll.code" class="card poll-row">
          <div class="poll-info">
            <div class="poll-meta">
              <span class="poll-code">{{ poll.code }}</span>
              <span class="status-dot" :class="poll.isClosed ? 'closed' : 'open'"></span>
              <span class="poll-status">{{ poll.isClosed ? 'Đã đóng' : 'Đang mở' }}</span>
            </div>
            <p class="poll-question">{{ poll.question }}</p>
          </div>

          <div class="poll-actions">
            <router-link class="btn btn-ghost" :to="{ name: 'results', params: { code: poll.code } }">
              Xem kết quả
            </router-link>
            <a class="btn btn-ghost" :href="voteLink(poll.code)" target="_blank" rel="noopener">
              Link bỏ phiếu
            </a>
            <button
              class="btn btn-danger"
              type="button"
              :disabled="poll.isClosed || closingCode === poll.code"
              @click="handleClose(poll.code)"
            >
              {{ closingCode === poll.code ? 'Đang đóng...' : 'Đóng poll' }}
            </button>
          </div>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.wrap {
  width: 100%;
  max-width: 640px;
}

.title {
  font-size: clamp(1.6rem, 4vw, 2.1rem);
}

.subtitle {
  margin: 0.5rem 0 1.6rem;
}

.empty-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

.poll-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.poll-row {
  padding: 1.2rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poll-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--ink-soft);
}

.poll-code {
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--ink);
}

.poll-question {
  margin: 0.4rem 0 0;
  font-weight: 600;
  color: var(--ink);
}

.poll-actions {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.poll-actions .btn {
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
}
</style>
