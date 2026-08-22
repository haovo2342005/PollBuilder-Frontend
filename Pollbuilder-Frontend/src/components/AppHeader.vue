<script setup>
import { useRouter } from 'vue-router'
import { session, isAuthenticated, clearSession } from '../auth/session'

const router = useRouter()

function handleLogout() {
  clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="header">
    <router-link to="/" class="wordmark">
      <span class="mark">◆</span>
      Poll Builder
    </router-link>

    <nav class="nav">
      <template v-if="isAuthenticated()">
        <router-link class="nav-link" :to="{ name: 'my-polls' }">Poll của tôi</router-link>
        <span class="username">{{ session.username }}</span>
        <button class="btn btn-ghost logout-btn" type="button" @click="handleLogout">
          Đăng xuất
        </button>
      </template>
      <template v-else>
        <router-link class="nav-link" :to="{ name: 'login' }">Đăng nhập</router-link>
        <router-link class="btn btn-ghost register-btn" :to="{ name: 'register' }">
          Đăng ký
        </router-link>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.header {
  padding: 1.4rem clamp(1.2rem, 4vw, 3rem);
  border-bottom: 1.5px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  text-decoration: none;
  color: var(--ink);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.mark {
  color: var(--accent-live);
}

.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  color: var(--ink);
}

.username {
  font-size: 0.85rem;
  color: var(--ink-soft);
  font-family: var(--font-mono);
}

.logout-btn,
.register-btn {
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
}
</style>
