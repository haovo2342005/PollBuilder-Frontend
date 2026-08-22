<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPoll } from '../api/polls'
import { ApiError } from '../api/http'
import PollCodeBadge from '../components/PollCodeBadge.vue'

const router = useRouter()

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const question = ref('')
const options = ref(['', ''])
const submitting = ref(false)
const errorMessage = ref(null)
const createdPoll = ref(null)

const canAddOption = computed(() => options.value.length < MAX_OPTIONS)
const canRemoveOption = computed(() => options.value.length > MIN_OPTIONS)

function addOption() {
  if (canAddOption.value) options.value.push('')
}

function removeOption(index) {
  if (canRemoveOption.value) options.value.splice(index, 1)
}

function voteLink(code) {
  return `${window.location.origin}/poll/${code}`
}

async function handleSubmit() {
  errorMessage.value = null

  const trimmedQuestion = question.value.trim()
  const trimmedOptions = options.value.map((o) => o.trim())

  if (!trimmedQuestion) {
    errorMessage.value = 'Enter a question for the poll.'
    return
  }
  if (trimmedOptions.some((o) => !o)) {
    errorMessage.value = 'Each option must have content and cannot be empty.'
    return
  }

  submitting.value = true
  try {
    createdPoll.value = await createPoll({
      question: trimmedQuestion,
      options: trimmedOptions
    })
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError ? err.detail || err.title : 'Failed to create poll. Please try again later.'
  } finally {
    submitting.value = false
  }
}

function copyLink() {
  navigator.clipboard?.writeText(voteLink(createdPoll.value.code))
}

function resetForm() {
  createdPoll.value = null
  question.value = ''
  options.value = ['', '']
}
</script>

<template>
  <section class="wrap">
    <template v-if="!createdPoll">
      <h1 class="title">Create new poll</h1>
      <p class="subtitle">Ask a question, add up to 6 options, share the link — results update live.</p>

      <form class="card" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

        <div class="field">
          <label for="question">Question</label>
          <input
            id="question"
            v-model="question"
            type="text"
            placeholder="What's your favorite programming language?"
            maxlength="200"
          />
        </div>

        <div class="field">
          <label>Options ({{ options.length }}/{{ MAX_OPTIONS }})</label>
          <div class="option-row" v-for="(opt, i) in options" :key="i">
            <input
              v-model="options[i]"
              type="text"
              :placeholder="`Option ${i + 1}`"
              maxlength="100"
            />
            <button
              type="button"
              class="remove-btn"
              :disabled="!canRemoveOption"
              title="Remove option"
              @click="removeOption(i)"
            >
              ✕
            </button>
          </div>
          <button type="button" class="btn btn-ghost add-btn" :disabled="!canAddOption" @click="addOption">
            + Add option
          </button>
        </div>

        <button class="btn submit-btn" type="submit" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create poll' }}
        </button>
      </form>
    </template>

    <template v-else>
      <h1 class="title">Poll is ready</h1>
      <p class="subtitle">Share the link below so people can vote.</p>

      <div class="card success-card">
        <PollCodeBadge :code="createdPoll.code" />

        <div class="field link-field">
          <label>Voting link</label>
          <div class="link-row">
            <input type="text" readonly :value="voteLink(createdPoll.code)" />
            <button class="btn btn-ghost" type="button" @click="copyLink">Copy</button>
          </div>
        </div>

        <div class="actions">
          <router-link class="btn" :to="{ name: 'results', params: { code: createdPoll.code } }">
            View live results
          </router-link>
          <router-link class="btn btn-ghost" :to="{ name: 'vote', params: { code: createdPoll.code } }">
            Open voting page
          </router-link>
        </div>

        <button class="btn btn-ghost new-poll-btn" type="button" @click="resetForm">
          Create another poll
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.wrap {
  width: 100%;
  max-width: 560px;
}

.title {
  font-size: clamp(1.6rem, 4vw, 2.1rem);
}

.subtitle {
  margin: 0.5rem 0 1.8rem;
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-row input {
  flex: 1;
  font-size: 0.95rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text);
}

.option-row input::placeholder {
  color: var(--text-faint);
}

.option-row input:focus {
  border-color: var(--accent);
  outline: none;
}

.remove-btn {
  border: 1px solid var(--border);
  background: transparent;
  border-radius: var(--radius-sm);
  width: 2.4rem;
  cursor: pointer;
  color: var(--text-soft);
  transition: border-color 0.12s ease, color 0.12s ease;
}

.remove-btn:hover:not(:disabled) {
  border-color: var(--live);
  color: var(--live);
}

.remove-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.add-btn {
  margin-top: 0.3rem;
  padding: 0.5rem 0.9rem;
  font-size: 0.86rem;
}

.submit-btn {
  width: 100%;
  margin-top: 0.7rem;
}

.success-card {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  align-items: flex-start;
}

.link-field {
  width: 100%;
}

.link-row {
  display: flex;
  gap: 0.5rem;
}

.link-row input {
  flex: 1;
  font-family: var(--font-mono);
  font-size: 0.83rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text-soft);
}

.actions {
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
}

.new-poll-btn {
  padding: 0.4rem 0;
  border: none;
  background: transparent;
  font-size: 0.85rem;
  text-decoration: underline;
  color: var(--text-soft);
}
</style>
