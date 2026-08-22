import { request } from './http'

/**
 * POST /polls
 * @param {{ question: string, options: string[] }} input
 * @returns {Promise<{ code, question, options, isClosed, createdAt }>}
 */
export function createPoll(input) {
  return request('/polls', { method: 'POST', body: input })
}

/**
 * GET /polls/{code}
 * @returns {Promise<{ code, question, options, isClosed, createdAt }>}
 */
export function getPoll(code) {
  return request(`/polls/${encodeURIComponent(code)}`)
}

/**
 * POST /polls/{code}/close
 */
export function closePoll(code) {
  return request(`/polls/${encodeURIComponent(code)}/close`, { method: 'POST' })
}

/**
 * GET /polls/mine — polls created by the logged-in account.
 * @returns {Promise<Array<{ code, question, options, isClosed, createdAt, creatorUsername }>>}
 */
export function getMyPolls() {
  return request('/polls/mine')
}
