const BASE_URL = import.meta.env.VITE_API_BASE_URL

if (!BASE_URL) {
  console.error(
    'VITE_API_BASE_URL is not set. Create a .env file (see .env.example).'
  )
}

export class ApiError extends Error {
  constructor(status, problem) {
    super(problem?.detail || problem?.title || `Request failed (${status})`)
    this.name = 'ApiError'
    this.status = status
    this.title = problem?.title ?? 'Request failed'
    this.detail = problem?.detail ?? null
  }
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
