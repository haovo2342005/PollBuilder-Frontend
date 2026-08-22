<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { register } from '../api/auth'
import { setSession } from '../auth/session'
import { ApiError } from '../api/http'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMessage = ref(null)

const USERNAME_MIN = 3
const USERNAME_MAX = 20
const PASSWORD_MIN = 8

function validate() {
  const trimmedUsername = username.value.trim()

  if (trimmedUsername.length < USERNAME_MIN || trimmedUsername.length > USERNAME_MAX) {
    return `Tên đăng nhập phải từ ${USERNAME_MIN} đến ${USERNAME_MAX} ký tự.`
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
    return 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới.'
  }
  if (password.value.length < PASSWORD_MIN) {
    return `Mật khẩu phải có ít nhất ${PASSWORD_MIN} ký tự.`
  }
  if (password.value !== confirmPassword.value) {
    return 'Mật khẩu nhập lại không khớp.'
  }
  return null
}

async function handleSubmit() {
  errorMessage.value = null

  const validationError = validate()
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  submitting.value = true
  try {
    const result = await register({
      username: username.value.trim(),
      password: password.value
    })
    setSession(result)

    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : { name: 'create-poll' })
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError ? err.detail || err.title : 'Không thể đăng ký. Thử lại sau.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="wrap">
    <h1 class="title">Tạo tài khoản</h1>
    <p class="subtitle">Cần tài khoản để tạo poll và quản lý poll của bạn.</p>

    <form class="card" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="field">
        <label for="username">Tên đăng nhập</label>
        <input
          id="username"
          v-model="username"
          type="text"
          autocomplete="username"
          maxlength="20"
          placeholder="3-20 ký tự, chữ/số/gạch dưới"
        />
      </div>

      <div class="field">
        <label for="password">Mật khẩu</label>
        <input
          id="password"
          v-model="password"
          type="password"
          autocomplete="new-password"
          placeholder="Ít nhất 8 ký tự"
        />
      </div>

      <div class="field">
        <label for="confirm-password">Nhập lại mật khẩu</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
        />
      </div>

      <button class="btn submit-btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
      </button>

      <p class="switch-link">
        Đã có tài khoản?
        <router-link :to="{ name: 'login', query: route.query }">Đăng nhập</router-link>
      </p>
    </form>
  </section>
</template>

<style scoped>
.wrap {
  width: 100%;
  max-width: 420px;
}

.title {
  font-size: clamp(1.6rem, 4vw, 2.1rem);
}

.subtitle {
  margin: 0.5rem 0 1.6rem;
}

.field input[type='password'] {
  font-family: var(--font-body);
  font-size: 1rem;
  padding: 0.65rem 0.8rem;
  border: 1.5px solid var(--line);
  border-radius: 4px;
  background: #fff;
  color: var(--ink);
}

.field input[type='password']:focus {
  border-color: var(--ink);
}

.submit-btn {
  width: 100%;
  margin-top: 0.6rem;
}

.switch-link {
  margin: 1.1rem 0 0;
  font-size: 0.88rem;
  text-align: center;
}
</style>
