import { request } from './http'

/**
 * POST /polls/{code}/vote
 * The voter_token cookie is set by the server automatically (credentials: 'include').
 * @param {string} code
 * @param {number} optionIndex
 */
export function castVote(code, optionIndex) {
  return request(`/polls/${encodeURIComponent(code)}/vote`, {
    method: 'POST',
    body: { optionIndex }
  })
}

/**
 * GET /polls/{code}/results
 * @returns {Promise<{ code, question, options, voteCounts, totalVotes, isClosed }>}
 */
export function getResults(code) {
  return request(`/polls/${encodeURIComponent(code)}/results`)
}
