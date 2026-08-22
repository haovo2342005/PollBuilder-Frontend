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
 * - Parses ASP.NET ProblemDetails bodies into a typed ApiError.
 * - Returns `null` for 204 No Content responses.
 */
export async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  })

  if (res.status === 204) {
    return null
  }

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const payload = isJson ? await res.json() : null

  if (!res.ok) {
    throw new ApiError(res.status, payload)
  }

  return payload
}

export { BASE_URL }
