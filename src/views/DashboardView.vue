<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import PollCard from '../components/PollCard.vue'

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
    const response = await fetch('/api/polls/my-polls', {
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
    const response = await fetch('/api/polls', {
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
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1>📊 Poll Builder</h1>
        <p>Hi, <strong>{{ user?.username }}</strong>!</p>
      </div>
      <div class="header-right">
        <button class="btn-new" @click="showCreateForm = !showCreateForm">
          {{ showCreateForm ? '✕ Close' : '+ Create poll' }}
        </button>
        <button class="btn-logout" @click="logout" title="Logout">
          👋
        </button>
      </div>
    </header>

    <div class="dashboard-content">
      <!-- Create Poll Form -->
      <transition name="slide-down">
        <div v-if="showCreateForm" class="create-section">
          <div class="create-card">
            <h2>Create new poll</h2>
            
            <form @submit.prevent="handleCreatePoll">
              <!-- Question Field -->
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

              <!-- Options Field -->
              <div class="form-group">
                <label>Options ({{ formData.options.length }}/{{ MAX_OPTIONS }})</label>
                <div v-for="(opt, i) in formData.options" :key="i" class="option-row">
                  <input
                    v-model="formData.options[i]"
                    type="text"
                    :placeholder="`Option ${i + 1}`"
                    maxlength="100"
                  />
                  <button
                    type="button"
                    class="btn-remove"
                    :disabled="!canRemoveOption"
                    @click="removeOption(i)"
                  >
                    ✕
                  </button>
                </div>
                <button
                  type="button"
                  class="btn-add"
                  :disabled="!canAddOption"
                  @click="addOption"
                >
                  + Add option
                </button>
              </div>

              <!-- Submit Buttons -->
              <div class="form-actions">
                <button type="submit" class="btn-submit" :disabled="isLoading">
                  {{ isLoading ? 'Creating...' : 'Create poll' }}
                </button>
                <button type="button" class="btn-cancel" @click="resetForm">
                  Clear form
                </button>
              </div>
            </form>
          </div>
        </div>
      </transition>

      <!-- Polls List or Empty State -->
      <div class="polls-section">
        <div v-if="polls.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <h3>You don't have any polls yet</h3>
          <p>Create your first poll to start collecting votes</p>
          <button class="btn-new" @click="showCreateForm = true">
            ✨ Create your first poll
          </button>
        </div>

        <div v-else class="polls-grid">
          <PollCard
            v-for="poll in polls"
            :key="poll.id"
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
  min-height: calc(100vh - 64px);
  width: 100%;
}

.dashboard-header {
  width: 100%;
  padding: 2rem clamp(1.2rem, 4vw, 3rem);
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  font-size: 1.6rem;
  margin: 0;
  color: var(--text);
  letter-spacing: -0.02em;
}

.header-left p {
  margin: 0.35rem 0 0;
  color: var(--text-soft);
  font-size: 0.92rem;
}

.header-left p strong {
  color: var(--text);
}

.header-right {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.btn-new {
  padding: 0.72rem 1.35rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  font-family: var(--font-sans);
}

.btn-new:hover {
  background: var(--accent-hover);
}

.btn-new:active {
  transform: scale(0.98);
}

.btn-logout {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-strong);
  border-radius: 50%;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout:hover {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.04);
}

.dashboard-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2.2rem clamp(1.2rem, 4vw, 3rem);
}

/* Create Form Section */
.create-section {
  margin-bottom: 3rem;
}

.create-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  max-width: 640px;
}

.create-card h2 {
  font-size: 1.3rem;
  margin: 0 0 1.5rem;
  color: var(--text);
  letter-spacing: -0.01em;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--text-soft);
  font-size: 0.85rem;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  transition: border-color 0.15s ease;
  background: var(--surface-raised);
  color: var(--text);
  font-family: var(--font-sans);
}

.form-group input[type="text"]::placeholder {
  color: var(--text-faint);
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.option-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-row input {
  flex: 1;
}

.btn-remove {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-soft);
}

.btn-remove:hover:not(:disabled) {
  border-color: var(--live);
  color: var(--live);
  background: rgba(255, 84, 112, 0.08);
}

.btn-remove:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.btn-add {
  width: 100%;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-sm);
  color: var(--accent);
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-top: 0.5rem;
  font-family: var(--font-sans);
}

.btn-add:hover:not(:disabled) {
  background: var(--accent-soft);
  border-color: var(--accent);
}

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 0.8rem;
  margin-top: 1.5rem;
}

.btn-submit {
  flex: 1;
  padding: 0.8rem 1.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  font-family: var(--font-sans);
}

.btn-submit:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-submit:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  padding: 0.8rem 1.5rem;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text);
  font-family: var(--font-sans);
}

.btn-cancel:hover {
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.04);
}

/* Polls Section */
.polls-section {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 4.5rem 2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  opacity: 0.85;
}

.empty-state h3 {
  font-size: 1.3rem;
  color: var(--text);
  margin: 1rem 0;
  letter-spacing: -0.01em;
}

.empty-state p {
  color: var(--text-soft);
  margin: 0 0 1.5rem;
}

.polls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.4rem;
}

/* Animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
  }

  .btn-new {
    flex: 1;
  }

  .polls-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}
</style>
