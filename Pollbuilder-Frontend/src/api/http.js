import { session, clearSession } from '../auth/session'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  // Fail loudly in dev instead of silently calling a relative path.
  console.error(
    'VITE_API_BASE_URL is not set. Create a .env file (see .env.example).'
  )
}

/**
 * Error shape thrown by `request()`. Mirrors ASP.NET's ProblemDetails so
 * views can show `error.title` / `error.detail` directly.
 */
export class ApiError extends Error {
  constructor(status, problem) {
    super(problem?.detail || problem?.title || `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.title = problem?.title ?? 'Request failed'
    this.detail = problem?.detail ?? null
  }
}

/**
 * Thin fetch wrapper shared by every API call.
 * - Always sends/receives cookies (needed for the voter_token cookie set by VoteService).
 * - Attaches `Authorization: Bearer <token>` automatically when a session exists.
 * - Parses ASP.NET ProblemDetails bodies into a typed ApiError.
 * - Returns `null` for 204 No Content responses.
 * - Clears a stale/expired session on 401 so the UI falls back to "logged out".
 */
export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (session.token) headers['Authorization'] = `Bearer ${session.token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  if (res.status === 204) {
    return null
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : null

  if (!res.ok) {
    if (res.status === 401 && session.token) {
      // Token was rejected (expired/invalid) — drop it so the app
      // reflects "logged out" instead of silently failing every call.
      clearSession()
    }
    throw new ApiError(res.status, payload)
  }

  return payload
}

export { BASE_URL }
