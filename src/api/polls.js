import { request } from './http'

/**
 * POST /api/polls
 * @param {{ question: string, options: string[] }} input
 * @returns {Promise<{ code, question, options, isClosed, createdAt }>}
 */
export function createPoll(input) {
  return request('/api/polls', { method: 'POST', body: input })
}

/**
 * GET /api/polls/{code}
 * @returns {Promise<{ code, question, options, isClosed, createdAt }>}
 */
export function getPoll(code) {
  return request(`/api/polls/${encodeURIComponent(code)}`)
}

/**
 * POST /api/polls/{code}/close
 */
export function closePoll(code) {
  return request(`/api/polls/${encodeURIComponent(code)}/close`, { method: 'POST' })
}
