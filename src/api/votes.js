import { request } from './http'

/**
 * POST /api/polls/{code}/vote
 * The voter_token cookie is set by the server automatically (credentials: 'include').
 * @param {string} code
 * @param {number} optionIndex
 */
export function castVote(code, optionIndex) {
  return request(`/api/polls/${encodeURIComponent(code)}/vote`, {
    method: 'POST',
    body: { optionIndex }
  })
}

/**
 * GET /api/polls/{code}/results
 * @returns {Promise<{ code, question, options, voteCounts, totalVotes, isClosed }>}
 */
export function getResults(code) {
  return request(`/api/polls/${encodeURIComponent(code)}/results`)
}
