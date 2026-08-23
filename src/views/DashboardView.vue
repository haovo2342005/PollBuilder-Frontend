<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import PollCard from '../components/PollCard.vue'
import { BASE_URL } from '../api/http'

const router = useRouter()
const user = ref(null)
const polls = ref([])
const isLoading = ref(false)
const showCreateForm = ref(false)

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const formData = ref({
  question: '',
  options: ['', '']
})

const canAddOption = computed(() => formData.value.options.length < MAX_OPTIONS)
const canRemoveOption = computed(() => formData.value.options.length > MIN_OPTIONS)

onMounted(() => {
  const savedUser = localStorage.getItem('user')
  if (!savedUser) {
    router.push({ name: 'login' })
    return
  }
  user.value = JSON.parse(savedUser)
  fetchPolls()
})

async function fetchPolls() {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/polls/mine`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (response.ok) {
      polls.value = await response.json()
    }
  } catch (err) {
    console.error('Failed to fetch polls:', err)
  } finally {
    isLoading.value = false
  }
}

function addOption() {
  if (canAddOption.value) formData.value.options.push('')
}

function removeOption(index) {
  if (canRemoveOption.value) formData.value.options.splice(index, 1)
}

async function handleCreatePoll() {
  const trimmedQuestion = formData.value.question.trim()
  const trimmedOptions = formData.value.options.map((o) => o.trim())

  if (!trimmedQuestion) {
    alert('Please enter a question')
    return
  }
  if (trimmedOptions.some((o) => !o)) {
    alert('Options cannot be empty')
    return
  }

  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch(`${BASE_URL}/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        question: trimmedQuestion,
        options: trimmedOptions
      })
    })

    if (response.ok) {
      const newPoll = await response.json()
      polls.value.unshift(newPoll)
      resetForm()
      showCreateForm.value = false
    }
  } catch (err) {
    console.error('Failed to create poll:', err)
    alert('Failed to create poll')
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  formData.value = {
    question: '',
    options: ['', '']
  }
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="dashboard">
    <header class="dash-header">
      <div class="header-left">
        <h1>Your polls</h1>
        <p>Welcome back, <strong>{{ user?.username }}</strong></p>
      </div>
      <div class="header-right">
        <button class="btn" @click="showCreateForm = !showCreateForm">
          {{ showCreateForm ? '✕ Cancel' : '+ New poll' }}
        </button>
        <button class="btn-icon" @click="logout" title="Logout">
          Logout
        </button>
      </div>
    </header>

    <div class="dash-body">
      <transition name="slide">
        <div v-if="showCreateForm" class="create-panel">
          <div class="create-card">
            <h2>Create a new poll</h2>
            <form @submit.prevent="handleCreatePoll">
              <div class="form-group">
                <label for="question">Question</label>
                <input
                  id="question"
                  v-model="formData.question"
                  type="text"
                  placeholder="What's your favorite programming language?"
                  maxlength="200"
                />
              </div>

              <div class="form-group">
                <label>Options ({{ formData.options.length }}/{{ MAX_OPTIONS }})</label>
                <div v-for="(opt, i) in formData.options" :key="i" class="option-row">
                  <span class="opt-letter">{{ String.fromCharCode(65 + i) }}</span>
                  <input
                    v-model="formData.options[i]"
                    type="text"
                    :placeholder="`Option ${i + 1}`"
                    maxlength="100"
                  />
                  <button
                    type="button"
                    class="btn-icon-sm"
                    :disabled="!canRemoveOption"
                    @click="removeOption(i)"
                  >✕</button>
                </div>
                <button
                  type="button"
                  class="btn-add"
                  :disabled="!canAddOption"
                  @click="addOption"
                >+ Add option</button>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn" :disabled="isLoading">
                  {{ isLoading ? 'Creating...' : 'Create poll' }}
                </button>
                <button type="button" class="btn btn-ghost" @click="resetForm">Clear</button>
              </div>
            </form>
          </div>
        </div>
      </transition>

      <div class="polls-section">
        <div v-if="isLoading && polls.length === 0" class="empty-state">
          <p>Loading your polls...</p>
        </div>

        <div v-else-if="polls.length === 0" class="empty-state">
          <div class="empty-visual">
            <span class="empty-bars"><i /><i /><i /></span>
          </div>
          <h3>No polls yet</h3>
          <p>Create your first poll and share it with the world</p>
          <button class="btn" @click="showCreateForm = true">Create your first poll</button>
        </div>

        <div v-else class="polls-grid">
          <PollCard
            v-for="poll in polls"
            :key="poll.id || poll.code"
            :poll="poll"
            @delete="fetchPolls"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  animation: fadeUp 0.4s ease both;
}

.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.header-left h1 {
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  margin-bottom: 0.25rem;
}

.header-left p {
  font-size: 0.95rem;
}

.header-left strong {
  color: var(--text);
}

.header-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.btn-icon {
  padding: 0.75rem 1.1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-soft);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-icon:hover {
  border-color: var(--border-strong);
  color: var(--text);
  background: var(--surface-hover);
}

.dash-body {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.create-panel {
  margin-bottom: 0.5rem;
}

.create-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 1.75rem 2rem;
  backdrop-filter: blur(12px);
}

.create-card h2 {
  font-size: 1.25rem;
  margin-bottom: 1.4rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-soft);
  margin-bottom: 0.5rem;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text);
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
  align-items: center;
}

.opt-letter {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--gradient);
  color: #fff;
  font-weight: 700;
  font-size: 0.8rem;
}

.option-row input {
  flex: 1;
}

.btn-icon-sm {
  width: 36px;
  height: 36px;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-soft);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s;
}

.btn-icon-sm:hover:not(:disabled) {
  border-color: var(--live);
  color: var(--live);
  background: rgba(255, 77, 109, 0.08);
}

.btn-icon-sm:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-add {
  width: 100%;
  padding: 0.7rem;
  background: transparent;
  border: 1.5px dashed rgba(124, 92, 252, 0.45);
  border-radius: var(--radius-sm);
  color: var(--accent-hover);
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.35rem;
  transition: all 0.15s;
}

.btn-add:hover:not(:disabled) {
  background: var(--accent-soft);
}

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
}

.empty-visual {
  margin-bottom: 1.25rem;
}

.empty-bars {
  display: inline-flex;
  align-items: flex-end;
  gap: 6px;
  height: 48px;
}

.empty-bars i {
  display: block;
  width: 12px;
  border-radius: 4px;
  background: var(--gradient);
  opacity: 0.5;
}

.empty-bars i:nth-child(1) { height: 20px; }
.empty-bars i:nth-child(2) { height: 36px; }
.empty-bars i:nth-child(3) { height: 28px; }

.empty-state h3 {
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

.polls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

@media (max-width: 640px) {
  .dash-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .header-right .btn {
    flex: 1;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
