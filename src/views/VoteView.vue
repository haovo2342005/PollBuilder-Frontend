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
        ? `Poll with code "${props.code}" not found.`
        : 'Failed to load poll. Please try again later.'
  } finally {
    loading.value = false
  }
}

async function submitVote() {
  if (selectedOption.value === null) {
    submitError.value = 'Please select an option before submitting.'
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
        err instanceof ApiError ? err.detail || err.title : 'Failed to submit vote. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="page">
  <div class="wrap page-inner">
    <div v-if="loading" class="hint">Loading poll...</div>

    <div v-else-if="loadError" class="card">
      <p class="error-banner">{{ loadError }}</p>
      <router-link class="btn btn-ghost" to="/">Create new poll</router-link>
    </div>

    <template v-else>
      <PollCodeBadge :code="poll.code" />
      <h1 class="question">{{ poll.question }}</h1>

      <div class="card">
        <div v-if="poll.isClosed" class="notice closed">
          <span class="status-dot closed" /> This poll is closed and is no longer accepting votes.
        </div>

        <template v-else-if="voteState === 'submitted'">
          <p class="notice open">
            <span class="status-dot open" /> Thanks for voting!
          </p>
          <router-link class="btn" :to="{ name: 'results', params: { code } }">
            View live results
          </router-link>
        </template>

        <template v-else-if="voteState === 'already-voted'">
          <p class="notice closed">This browser has already voted on this poll.</p>
          <router-link class="btn" :to="{ name: 'results', params: { code } }">
            View live results
          </router-link>
        </template>

        <template v-else-if="voteState === 'closed'">
          <p class="notice closed">This poll just closed and is no longer accepting votes.</p>
          <router-link class="btn" :to="{ name: 'results', params: { code } }">
            View results
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
            {{ submitting ? 'Submitting...' : 'Submit vote' }}
          </button>
        </template>
      </div>

      <router-link class="results-link" :to="{ name: 'results', params: { code } }">
        View live results →
      </router-link>
    </template>
  </div>
  </section>
</template>

<style scoped>
.page {
  width: 100%;
}

.wrap {
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.hint {
  color: var(--text-soft);
  font-weight: 500;
}

.question {
  font-size: clamp(1.4rem, 3.6vw, 1.9rem);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  margin-bottom: 1.4rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.95rem;
  transition: border-color 0.12s ease, background 0.12s ease;
}

.option:hover {
  border-color: var(--border-strong);
  background: rgba(255, 255, 255, 0.02);
}

.option.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}

.option input {
  accent-color: var(--accent);
  width: 1.05rem;
  height: 1.05rem;
}

.submit-btn {
  width: 100%;
}

.notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.2rem;
  font-weight: 500;
}

.notice.open {
  color: var(--success);
}

.notice.closed {
  color: var(--text-soft);
}

.results-link {
  align-self: flex-start;
  font-size: 0.88rem;
  text-decoration: underline;
  color: var(--text-soft);
}
</style>
