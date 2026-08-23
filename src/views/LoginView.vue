<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { BASE_URL } from '../api/http'

const router = useRouter()
const route = useRoute()
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const formData = ref({
  username: '',
  password: ''
})

const isFormValid = computed(() => {
  return formData.value.username.trim() && formData.value.password.length >= 8
})

async function handleLogin() {
  error.value = ''
  isLoading.value = true

  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.value.username.trim(),
        password: formData.value.password
      })
    })

    if (!response.ok) {
      let message = 'Incorrect username or password'
      try {
        const data = await response.json()
        if (data?.title) message = data.title
        if (data?.errors) {
          const first = Object.values(data.errors).flat()[0]
          if (first) message = first
        }
      } catch (_) {}
      throw new Error(message)
    }

    const data = await response.json()
    // Backend returns: { token, username, expiresAt }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({
      username: data.username,
      expiresAt: data.expiresAt
    }))

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    if (redirect) {
      router.push(redirect)
    } else {
      router.push({ name: 'dashboard' })
    }
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
  <div class="auth-page">
    <div class="auth-bg" />
    <div class="auth-shell">
      <div class="auth-card">
        <div class="brand">
          <div class="brand-logo">
            <span class="bar b1" /><span class="bar b2" /><span class="bar b3" />
          </div>
          <h1>Poll Builder</h1>
          <p>Create &amp; manage live polls</p>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div v-if="error" class="alert alert-error">
            <span>⚠</span>
            <p>{{ error }}</p>
          </div>

          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrap">
              <input
                id="username"
                v-model="formData.username"
                type="text"
                placeholder="your username"
                autocomplete="username"
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
                autocomplete="current-password"
                required
                @focus="error = ''"
              />
              <button type="button" class="eye" @click="showPassword = !showPassword" tabindex="-1">
                {{ showPassword ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <button type="submit" class="btn btn-full" :disabled="!isFormValid || isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <div class="auth-footer">
          <span>New here?</span>
          <button type="button" class="link-btn" @click="goToRegister">Create an account</button>
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
    radial-gradient(ellipse 70% 50% at 15% 20%, rgba(124, 92, 252, 0.3), transparent 55%),
    radial-gradient(ellipse 50% 40% at 85% 70%, rgba(233, 79, 255, 0.18), transparent 50%);
  pointer-events: none;
}

.auth-shell {
  position: relative;
  width: 100%;
  max-width: 420px;
  animation: fadeUp 0.5s ease both;
}

.auth-card {
  background: rgba(18, 18, 28, 0.85);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 2.5rem 2rem;
  backdrop-filter: blur(24px);
  box-shadow: var(--shadow-md), var(--shadow-glow);
}

.brand {
  text-align: center;
  margin-bottom: 2rem;
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
  font-size: 1.75rem;
  margin-bottom: 0.35rem;
}

.brand p {
  font-size: 0.95rem;
  color: var(--text-soft);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.form-group label {
  font-size: 0.78rem;
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
  padding: 0.9rem 1rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  color: var(--text);
  font-size: 0.98rem;
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
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.eye:hover {
  color: var(--text);
}

.btn-full {
  width: 100%;
  margin-top: 0.35rem;
  padding: 1rem;
  font-size: 1rem;
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.alert-error {
  background: rgba(255, 77, 109, 0.1);
  border: 1px solid rgba(255, 77, 109, 0.35);
  color: #ff8a9e;
}

.alert p {
  color: inherit;
  margin: 0;
}

.auth-footer {
  margin-top: 1.75rem;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-soft);
  display: flex;
  align-items: center;
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

.link-btn:hover {
  text-decoration: underline;
}
</style>
