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
  <section class="vote-page">
    <div v-if="loading" class="state-msg">Loading poll...</div>

    <div v-else-if="loadError" class="state-card">
      <p class="error-banner">{{ loadError }}</p>
      <router-link class="btn btn-ghost" to="/dashboard">Go to dashboard</router-link>
    </div>

    <template v-else>
      <div class="vote-header">
        <PollCodeBadge :code="poll.code" />
      </div>

      <h1 class="question">{{ poll.question }}</h1>

      <div class="vote-body">
        <div v-if="poll.isClosed" class="notice closed">
          <span class="status-dot closed" /> This poll is closed and is no longer accepting votes.
        </div>

        <template v-else-if="voteState === 'submitted'">
          <div class="success-panel">
            <div class="success-icon">✓</div>
            <p class="notice open">Thanks for voting!</p>
            <router-link class="btn" :to="{ name: 'results', params: { code } }">
              View live results
            </router-link>
          </div>
        </template>

        <template v-else-if="voteState === 'already-voted'">
          <div class="success-panel">
            <p class="notice closed">This browser has already voted on this poll.</p>
            <router-link class="btn" :to="{ name: 'results', params: { code } }">
              View live results
            </router-link>
          </div>
        </template>

        <template v-else-if="voteState === 'closed'">
          <div class="success-panel">
            <p class="notice closed">This poll just closed and is no longer accepting votes.</p>
            <router-link class="btn" :to="{ name: 'results', params: { code } }">
              View results
            </router-link>
          </div>
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
              <span class="option-letter">{{ String.fromCharCode(65 + i) }}</span>
              <span class="option-text">{{ opt }}</span>
            </label>
          </div>

          <button class="btn submit-btn" type="button" :disabled="submitting || selectedOption === null" @click="submitVote">
            {{ submitting ? 'Submitting...' : 'Submit vote' }}
          </button>
        </template>
      </div>

      <router-link class="results-link" :to="{ name: 'results', params: { code } }">
        View live results →
      </router-link>
    </template>
  </section>
</template>

<style scoped>
.vote-page {
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeUp 0.4s ease both;
  padding-bottom: 2rem;
}

.state-msg {
  color: var(--text-soft);
  font-weight: 500;
  text-align: center;
  padding: 4rem 0;
}

.state-card {
  max-width: 480px;
  margin: 2rem auto;
  text-align: center;
}

.vote-header {
  display: flex;
  justify-content: center;
}

.question {
  font-size: clamp(1.6rem, 4.5vw, 2.35rem);
  text-align: center;
  line-height: 1.25;
  letter-spacing: -0.03em;
  padding: 0 0.5rem;
}

.vote-body {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.75rem;
  backdrop-filter: blur(12px);
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
}

.option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.25rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 1.05rem;
  font-weight: 500;
  transition: all 0.18s ease;
  background: var(--surface-raised);
}

.option:hover {
  border-color: rgba(124, 92, 252, 0.5);
  background: var(--surface-hover);
  transform: translateX(4px);
}

.option.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 3px var(--accent-soft), 0 4px 20px rgba(124, 92, 252, 0.2);
}

.option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.option-letter {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--gradient);
  color: #fff;
  font-weight: 700;
  font-size: 0.9rem;
}

.option.selected .option-letter {
  box-shadow: 0 4px 12px rgba(124, 92, 252, 0.4);
}

.option-text {
  flex: 1;
  line-height: 1.35;
}

.submit-btn {
  width: 100%;
  padding: 1.05rem;
  font-size: 1.05rem;
}

.notice {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin: 0 0 1.2rem;
  font-weight: 500;
  text-align: center;
}

.notice.open { color: var(--success); }
.notice.closed { color: var(--text-soft); }

.success-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem 0;
}

.success-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(46, 229, 157, 0.15);
  border: 2px solid var(--success);
  color: var(--success);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  font-weight: 700;
}

.results-link {
  align-self: center;
  font-size: 0.9rem;
  color: var(--text-soft);
  transition: color 0.15s;
}

.results-link:hover {
  color: var(--accent-hover);
}
</style>
