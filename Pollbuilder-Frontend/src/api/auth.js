import { request } from './http'

/**
 * POST /auth/register
 * @param {{ username: string, password: string }} input
 * @returns {Promise<{ token, username, expiresAt }>}
 */
export function register(input) {
  return request('/auth/register', { method: 'POST', body: input })
}

/**
 * POST /auth/login
 * @param {{ username: string, password: string }} input
 * @returns {Promise<{ token, username, expiresAt }>}
 */
export function login(input) {
  return request('/auth/login', { method: 'POST', body: input })
}

/**
 * GET /auth/me
 * Used on app startup to check whether a stored token is still valid.
 * @returns {Promise<{ id, username, createdAt }>}
 */
export function me() {
  return request('/auth/me')
}
