<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const formData = ref({
  email: '',
  password: ''
})

const isFormValid = computed(() => {
  return formData.value.email.trim() && formData.value.password.length >= 6
})

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.value.email.trim(),
        password: formData.value.password
      })
    })

    if (!response.ok) {
      throw new Error('Incorrect email or password')
    }

    const { token, user } = await response.json()
    
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    
    router.push({ name: 'dashboard' })
  } catch (err) {
    error.value = err.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}

function goToRegister() {
  router.push({ name: 'register' })
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="logo-icon">📊</div>
        <h1>Poll Builder</h1>
        <p>Create and manage your polls</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Error Message -->
        <div v-if="error" class="error-box">
          <span>⚠️</span>
          <p>{{ error }}</p>
        </div>

        <!-- Email Field -->
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <span class="icon">✉️</span>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="your@email.com"
              required
              @focus="error = ''"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <span class="icon">🔒</span>
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              required
              @focus="error = ''"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-primary"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">or</div>

      <!-- Register Link -->
      <button type="button" class="btn-secondary" @click="goToRegister">
        Don't have an account? Register now
      </button>

      <!-- Footer -->
      <div class="login-footer">
        <p>💡 Tip: Use your email to log in next time</p>
      </div>
    </div>

    <!-- Illustration -->
    <div class="illustration">
      <div class="chart-bars">
        <div class="bar" style="height: 40%; animation-delay: 0.1s;"></div>
        <div class="bar" style="height: 60%; animation-delay: 0.2s;"></div>
        <div class="bar" style="height: 45%; animation-delay: 0.3s;"></div>
        <div class="bar" style="height: 75%; animation-delay: 0.4s;"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  width: 100%;
  gap: 5rem;
  padding: 2rem clamp(1.2rem, 4vw, 3rem);
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.login-header h1 {
  font-size: 2rem;
  color: var(--text);
  margin: 0.5rem 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.login-header p {
  color: var(--text-soft);
  margin: 0;
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(255, 84, 112, 0.08);
  border: 1px solid rgba(255, 84, 112, 0.35);
  border-radius: var(--radius-sm);
  color: #ff8095;
  font-size: 0.9rem;
  animation: shake 0.4s ease;
}

.error-box p {
  color: #ff8095;
  margin: 0;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-soft);
  font-size: 0.85rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 12px;
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0.8;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.8rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: var(--surface-raised);
  color: var(--text);
  font-family: var(--font-sans);
}

.input-wrapper input::placeholder {
  color: var(--text-faint);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
  background: var(--surface-raised);
}

.toggle-password {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.toggle-password:hover {
  opacity: 1;
}

.btn-primary {
  padding: 0.9rem 1.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, transform 0.1s ease;
  margin-top: 0.5rem;
  font-family: var(--font-sans);
}

.btn-primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  color: var(--text-faint);
  font-size: 0.85rem;
  margin: 1rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: calc(50% - 1.5rem);
  height: 1px;
  background: var(--border);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.btn-secondary {
  padding: 0.8rem 1.5rem;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: var(--font-sans);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: var(--accent);
}

.login-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-faint);
}

.illustration {
  display: none;
  align-items: center;
  justify-content: center;
}

.chart-bars {
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  height: 200px;
}

.bar {
  width: 50px;
  background: linear-gradient(180deg, var(--accent-hover) 0%, var(--accent) 100%);
  border-radius: 10px 10px 0 0;
  animation: grow 0.6s ease-out forwards;
  opacity: 0.85;
  box-shadow: 0 0 40px rgba(108, 92, 231, 0.25);
}

@keyframes grow {
  from {
    height: 0;
  }
}

@media (min-width: 1024px) {
  .login-container {
    gap: 6rem;
  }

  .illustration {
    display: flex;
  }
}

@media (max-width: 640px) {
  .login-container {
    gap: 2rem;
  }

  .login-card {
    padding: 2rem;
  }

  .login-header h1 {
    font-size: 1.6rem;
  }
}
</style>
