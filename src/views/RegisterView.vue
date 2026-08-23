<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { BASE_URL } from '../api/http'

const router = useRouter()
const isLoading = ref(false)
const error = ref('')
const success = ref('')
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
  success.value = ''
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

    await response.json()
    success.value = 'Account created successfully! Redirecting to login...'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1500)
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
  <div class="auth-page">
    <div class="auth-bg" />
    <div class="auth-shell">
      <div class="auth-card">
        <div class="brand">
          <div class="brand-logo">
            <span class="bar b1" /><span class="bar b2" /><span class="bar b3" />
          </div>
          <h1>Create account</h1>
          <p>Start building live polls</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div v-if="error" class="alert alert-error">
            <span>⚠</span>
            <p>{{ error }}</p>
          </div>
          <div v-if="success" class="alert alert-success">
            <span>✓</span>
            <p>{{ success }}</p>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrap">
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

          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrap">
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

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrap">
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
              <button type="button" class="eye" @click="showPassword = !showPassword" tabindex="-1">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
            <small v-if="formData.password.length > 0 && formData.password.length < 8" class="hint">
              Minimum 8 characters
            </small>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm password</label>
            <div class="input-wrap">
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
            <small v-if="formData.confirmPassword && !passwordMatch" class="hint error-hint">
              Passwords do not match
            </small>
          </div>

          <button type="submit" class="btn btn-full" :disabled="!isFormValid || isLoading">
            {{ isLoading ? 'Creating...' : 'Create account' }}
          </button>
        </form>

        <div class="auth-footer">
          <span>Already have an account?</span>
          <button type="button" class="link-btn" @click="goToLogin">Sign in</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 1.5rem;
}

.auth-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 85% 15%, rgba(124, 92, 252, 0.28), transparent 55%),
    radial-gradient(ellipse 50% 40% at 15% 80%, rgba(233, 79, 255, 0.15), transparent 50%);
  pointer-events: none;
}

.auth-shell {
  position: relative;
  width: 100%;
  max-width: 440px;
  animation: fadeUp 0.5s ease both;
}

.auth-card {
  background: rgba(18, 18, 28, 0.85);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 2.25rem 2rem;
  backdrop-filter: blur(24px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.brand {
  text-align: center;
  margin-bottom: 1.75rem;
}

.brand-logo {
  display: inline-flex;
  align-items: flex-end;
  gap: 4px;
  height: 28px;
  margin-bottom: 1rem;
}

.brand-logo .bar {
  width: 7px;
  border-radius: 3px;
  background: var(--gradient);
}

.brand-logo .b1 { height: 12px; }
.brand-logo .b2 { height: 20px; }
.brand-logo .b3 { height: 28px; }

.brand h1 {
  font-size: 1.65rem;
  margin-bottom: 0.3rem;
}

.brand p {
  font-size: 0.92rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-soft);
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrap input {
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text);
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-wrap input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.input-wrap input::placeholder {
  color: var(--text-faint);
}

.eye {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: var(--text-faint);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  text-transform: uppercase;
}

.eye:hover { color: var(--text); }

.hint {
  font-size: 0.78rem;
  color: var(--text-faint);
}

.error-hint { color: #ff8a9e; }

.btn-full {
  width: 100%;
  margin-top: 0.4rem;
  padding: 0.95rem;
  font-size: 1rem;
}

.alert {
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
}

.alert-error {
  background: rgba(255, 77, 109, 0.1);
  border: 1px solid rgba(255, 77, 109, 0.35);
  color: #ff8a9e;
}

.alert-success {
  background: rgba(46, 229, 157, 0.1);
  border: 1px solid rgba(46, 229, 157, 0.35);
  color: #6effc4;
}

.alert p { color: inherit; margin: 0; }

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-soft);
  display: flex;
  justify-content: center;
  gap: 0.4rem;
}

.link-btn {
  background: none;
  border: none;
  color: var(--accent-hover);
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
}

.link-btn:hover { text-decoration: underline; }
</style>
