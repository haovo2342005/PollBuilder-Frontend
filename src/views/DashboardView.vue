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
    const response = await fetch(`${BASE_URL}/api/polls/my-polls`, {
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
    const response = await fetch(`${BASE_URL}/api/polls`, {
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
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

.dashboard-header {
  background: white;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-left h1 {
  font-size: 1.8rem;
  margin: 0;
  color: #333;
}

.header-left p {
  margin: 0.3rem 0 0;
  color: #999;
  font-size: 0.95rem;
}

.header-right {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-new {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-new:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-logout {
  width: 40px;
  height: 40px;
  border: 2px solid #e0e0e0;
  border-radius: 50%;
  background: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout:hover {
  border-color: #667eea;
  transform: scale(1.1);
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Create Form Section */
.create-section {
  margin-bottom: 3rem;
}

.create-card {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.create-card h2 {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.form-group input[type="text"] {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
}

.form-group input[type="text"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  font-weight: 600;
}

.btn-remove:hover:not(:disabled) {
  border-color: #e74c3c;
  color: #e74c3c;
  background: #fee;
}

.btn-remove:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-add {
  width: 100%;
  padding: 0.7rem 1rem;
  background: transparent;
  border: 2px dashed #667eea;
  border-radius: 8px;
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.btn-add:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
}

.btn-add:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-submit {
  flex: 1;
  padding: 0.9rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  flex: 1;
  padding: 0.9rem 1.5rem;
  background: transparent;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

/* Polls Section */
.polls-section {
  min-height: 400px;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #333;
  margin: 1rem 0;
}

.empty-state p {
  color: #999;
  margin: 0 0 1.5rem;
}

.polls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
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
