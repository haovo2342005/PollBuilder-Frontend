import { reactive, readonly } from 'vue'

const STORAGE_KEY = 'pollbuilder.session'

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { token: null, username: null }
    const parsed = JSON.parse(raw)
    return {
      token: parsed.token ?? null,
      username: parsed.username ?? null
    }
  } catch {
    return { token: null, username: null }
  }
}

const state = reactive(loadInitial())

function persist() {
  if (state.token) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: state.token, username: state.username })
    )
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * Called after a successful /auth/login or /auth/register response.
 */
function setSession({ token, username }) {
  state.token = token
  state.username = username
  persist()
}

/**
 * JWT is stateless: "logging out" just means the client forgets the
 * token. There is nothing to invalidate server-side.
 */
function clearSession() {
  state.token = null
  state.username = null
  persist()
}

function isAuthenticated() {
  return !!state.token
}

export const session = readonly(state)
export { setSession, clearSession, isAuthenticated }
