<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPoll } from '../api/polls'
import { castVote } from '../api/votes'
import { ApiError } from '../api/http'
import PollCodeBadge from '../components/PollCodeBadge.vue'

const props = defineProps({
  code: { type: String, required: true }
})

const router = useRouter()

const loading = ref(true)
const loadError = ref(null)
const poll = ref(null)

const selectedOption = ref(null)
const submitting = ref(false)
const submitError = ref(null)
const voteState = ref('idle') // idle | submitted | already-voted | closed

async function load() {
  loading.value = true
  loadError.value = null
  try {
    poll.value = await getPoll(props.code)
  } catch (err) {
    loadError.value =
      err instanceof ApiError && err.status === 404
        ? `Không tìm thấy poll với mã "${props.code}".`
        : 'Không thể tải poll. Thử lại sau.'
  } finally {
    loading.value = false
  }
}

async function submitVote() {
  if (selectedOption.value === null) {
    submitError.value = 'Chọn một đáp án trước khi gửi.'
    return
  }
  submitError.value = null
  submitting.value = true
  try {
    await castVote(props.code, selectedOption.value)
    voteState.value = 'submitted'
  } catch (err) {
    if (err instanceof ApiError && err.status === 409) {
      voteState.value = err.title === 'Poll is closed' ? 'closed' : 'already-voted'
    } else {
      submitError.value =
        err instanceof ApiError ? err.detail || err.title : 'Không thể gửi phiếu bầu. Thử lại.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="wrap">
    <div v-if="loading" class="hint">Đang tải poll...</div>

    <div v-else-if="loadError" class="card">
      <p class="error-banner">{{ loadError }}</p>
      <router-link class="btn btn-ghost" to="/">Tạo poll mới</router-link>
    </div>

    <template v-else>
      <PollCodeBadge :code="poll.code" />
      <h1 class="question">{{ poll.question }}</h1>

      <div class="card">
        <div v-if="poll.isClosed" class="notice closed">
          <span class="status-dot closed" /> Poll này đã đóng, không nhận thêm phiếu bầu.
        </div>

        <template v-else-if="voteState === 'submitted'">
          <p class="notice open">
            <span class="status-dot open" /> Cảm ơn bạn đã bỏ phiếu!
          </p>
          <router-link class="btn" :to="{ name: 'results', params: { code } }">
            Xem kết quả trực tiếp
          </router-link>
        </template>

        <template v-else-if="voteState === 'already-voted'">
          <p class="notice closed">Trình duyệt này đã bỏ phiếu cho poll rồi.</p>
          <router-link class="btn" :to="{ name: 'results', params: { code } }">
            Xem kết quả trực tiếp
          </router-link>
        </template>

        <template v-else-if="voteState === 'closed'">
          <p class="notice closed">Poll vừa đóng, không nhận thêm phiếu bầu.</p>
          <router-link class="btn" :to="{ name: 'results', params: { code } }">
            Xem kết quả
          </router-link>
        </template>

        <template v-else>
          <div v-if="submitError" class="error-banner">{{ submitError }}</div>

          <div class="options" role="radiogroup">
            <label
              v-for="(opt, i) in poll.options"
              :key="i"
              class="option"
              :class="{ selected: selectedOption === i }"
            >
              <input type="radio" name="vote-option" :value="i" v-model="selectedOption" />
              {{ opt }}
            </label>
          </div>

          <button class="btn submit-btn" type="button" :disabled="submitting" @click="submitVote">
            {{ submitting ? 'Đang gửi...' : 'Gửi phiếu bầu' }}
          </button>
        </template>
      </div>

      <router-link class="results-link" :to="{ name: 'results', params: { code } }">
        Xem kết quả trực tiếp →
      </router-link>
    </template>
  </section>
</template>

<style scoped>
.wrap {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.hint {
  color: var(--ink-soft);
}

.question {
  font-size: clamp(1.4rem, 3.6vw, 1.9rem);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.4rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border: 1.5px solid var(--line);
  border-radius: 4px;
  cursor: pointer;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.option:hover {
  border-color: var(--ink);
}

.option.selected {
  border-color: var(--ink);
  background: var(--paper);
}

.option input {
  accent-color: var(--ink);
}

.submit-btn {
  width: 100%;
}

.notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.2rem;
}

.notice.open {
  color: var(--accent-open);
  font-weight: 600;
}

.notice.closed {
  color: var(--ink-soft);
}

.results-link {
  align-self: flex-start;
  font-size: 0.9rem;
  text-decoration: underline;
  color: var(--ink-soft);
}
</style>
