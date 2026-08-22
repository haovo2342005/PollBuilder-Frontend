<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../api/auth'
import { setSession } from '../auth/session'
import { ApiError } from '../api/http'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const submitting = ref(false)
const errorMessage = ref(null)

async function handleSubmit() {
  errorMessage.value = null

  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Nhập đầy đủ tên đăng nhập và mật khẩu.'
    return
  }

  submitting.value = true
  try {
    const result = await login({
      username: username.value.trim(),
      password: password.value
    })
    setSession(result)

    const redirect = route.query.redirect
    router.push(typeof redirect === 'string' ? redirect : { name: 'create-poll' })
  } catch (err) {
    errorMessage.value =
      err instanceof ApiError ? err.detail || err.title : 'Không thể đăng nhập. Thử lại sau.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="wrap">
    <h1 class="title">Đăng nhập</h1>
    <p class="subtitle">Đăng nhập để tạo và quản lý poll của bạn.</p>

    <form class="card" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="error-banner">{{ errorMessage }}</div>

      <div class="field">
        <label for="username">Tên đăng nhập</label>
        <input id="username" v-model="username" type="text" autocomplete="username" maxlength="20" />
      </div>

      <div class="field">
        <label for="password">Mật khẩu</label>
        <input id="password" v-model="password" type="password" autocomplete="current-password" />
      </div>

      <button class="btn submit-btn" type="submit" :disabled="submitting">
        {{ submitting ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>

      <p class="switch-link">
        Chưa có tài khoản?
        <router-link :to="{ name: 'register', query: route.query }">Đăng ký</router-link>
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
