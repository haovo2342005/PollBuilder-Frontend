<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BASE_URL } from '../api/http'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordMatch = computed(() => {
  return formData.value.password === formData.value.confirmPassword
})

const isFormValid = computed(() => {
  return (
    formData.value.username.trim().length >= 3 &&
    formData.value.email.trim() &&
    formData.value.password.length >= 8 &&
    passwordMatch.value
  )
})

async function handleRegister() {
  if (!passwordMatch.value) {
    error.value = 'Passwords do not match'
    return
  }

  error.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.value.username.trim(),
        email: formData.value.email.trim(),
        password: formData.value.password
      })
    })

    if (!response.ok) {
      let message = 'Registration failed'
      try {
        const data = await response.json()
        if (data?.title) message = data.title
        if (data?.errors) {
          const first = Object.values(data.errors).flat()[0]
          if (first) message = first
        }
        if (data?.detail) message = data.detail
      } catch (_) {}
      throw new Error(message)
    }

    // Đăng ký thành công → không lưu token, chuyển sang trang Login
    await response.json()
    router.push({ name: 'login' })
  } catch (err) {
    error.value = err.message || 'Registration failed'
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="register-container">
    <div class="register-card">
      <!-- Header -->
      <div class="register-header">
        <div class="logo-icon">📊</div>
        <h1>Create account</h1>
        <p>Start creating polls today</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Error Message -->
        <div v-if="error" class="error-box">
          <span>⚠️</span>
          <p>{{ error }}</p>
        </div>

        <!-- Username Field -->
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <span class="icon">👤</span>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              placeholder="username"
              autocomplete="username"
              minlength="3"
              required
              @focus="error = ''"
            />
          </div>
          <small v-if="formData.username.length > 0 && formData.username.length < 3" class="hint">
            Minimum 3 characters
          </small>
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
              autocomplete="email"
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
              autocomplete="new-password"
              minlength="8"
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
          <small v-if="formData.password.length > 0 && formData.password.length < 8" class="hint">
            Minimum 8 characters
          </small>
        </div>

        <!-- Confirm Password Field -->
        <div class="form-group">
          <label for="confirmPassword">Confirm password</label>
          <div class="input-wrapper">
            <span class="icon">🔐</span>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="new-password"
              required
              @focus="error = ''"
            />
          </div>
          <small v-if="formData.confirmPassword && !passwordMatch" class="hint error">
            Passwords do not match
          </small>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          class="btn-primary"
          :disabled="!isFormValid || isLoading"
        >
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <!-- Divider -->
      <div class="divider">or</div>

      <!-- Login Link -->
      <button type="button" class="btn-secondary" @click="goToLogin">
        Already have an account? Login now
      </button>

      <!-- Footer -->
      <div class="register-footer">
        <p>✨ Free, no credit card required</p>
      </div>
    </div>

    <!-- Illustration -->
    <div class="illustration">
      <div class="rocket">🚀</div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  gap: 4rem;
  padding: 2rem;
}

.register-card {
  width: 100%;
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.5s ease-out;
  color-scheme: light;
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

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.register-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0.5rem 0;
  font-weight: 700;
}

.register-header p {
  color: #999;
  margin: 0;
  font-size: 0.95rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 10px;
  color: #c33;
  font-size: 0.9rem;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
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
  z-index: 1;
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 2.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  background: #ffffff;
  color: #1a1a1a;
  -webkit-text-fill-color: #1a1a1a;
  caret-color: #1a1a1a;
}

.input-wrapper input::placeholder {
  color: #999;
  -webkit-text-fill-color: #999;
  opacity: 1;
}

.input-wrapper input:-webkit-autofill,
.input-wrapper input:-webkit-autofill:hover,
.input-wrapper input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1a1a1a !important;
  caret-color: #1a1a1a;
  box-shadow: 0 0 0 1000px #ffffff inset !important;
  transition: background-color 5000s ease-in-out 0s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
  background: #ffffff;
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

.hint {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.2rem;
}

.hint.error {
  color: #e74c3c;
  font-weight: 600;
}

.btn-primary {
  padding: 0.9rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.divider {
  text-align: center;
  color: #ccc;
  font-size: 0.9rem;
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
  background: #e0e0e0;
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
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.register-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.85rem;
  color: #999;
}

.illustration {
  display: none;
  align-items: center;
  justify-content: center;
  font-size: 8rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@media (min-width: 1024px) {
  .register-container {
    gap: 6rem;
  }

  .illustration {
    display: flex;
  }
}

@media (max-width: 640px) {
  .register-container {
    gap: 2rem;
  }

  .register-card {
    padding: 2rem;
  }

  .register-header h1 {
    font-size: 1.6rem;
  }
}
</style>