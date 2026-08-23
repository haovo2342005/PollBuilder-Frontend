const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  console.error(
    'VITE_API_BASE_URL is not set. Create a .env file (see .env.example).'
  )
}

export class ApiError extends Error {
  constructor(status, problem) {
    const message = extractMessage(problem, status)
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.title = problem?.title ?? 'Request failed'
    this.detail = problem?.detail ?? null
    this.errors = problem?.errors ?? null
  }
}

function extractMessage(problem, status) {
  if (!problem) {
    return `Request failed (${status})`
  }

  // ASP.NET validation errors: { errors: { Field: ["msg1", "msg2"] } }
  if (problem.errors && typeof problem.errors === 'object') {
    const messages = Object.values(problem.errors)
      .flat()
      .filter((m) => typeof m === 'string' && m.trim())

    if (messages.length > 0) {
      return messages.join(' ')
    }
  }

  return problem.detail || problem.title || `Request failed (${status})`
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = {}

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  const token = localStorage.getItem('token')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

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
    throw new ApiError(res.status, payload)
  }

  return payload
}

export { BASE_URL }