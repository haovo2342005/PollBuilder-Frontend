import * as signalR from '@microsoft/signalr'
import { BASE_URL } from '../api/http'

/**
 * Opens one SignalR connection to the RealtimeService hub (proxied through
 * the API Gateway at /hubs/poll), joins the group for `pollCode`, and calls
 * `onResults` every time the server broadcasts an updated tally.
 *
 * Returns a `stop()` function — call it when the component unmounts to
 * leave the group and close the connection cleanly.
 */
export function connectToPollResults(pollCode, onResults, { onStatusChange } = {}) {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/poll`, {
      withCredentials: true
    })
    .withAutomaticReconnect([0, 1000, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  connection.on('ReceiveResults', (message) => {
    onResults(message)
  })

  connection.onreconnecting(() => onStatusChange?.('reconnecting'))
  connection.onreconnected(() => {
    onStatusChange?.('connected')
    connection.invoke('JoinPollGroup', pollCode).catch(() => {
      /* group is rejoined on next successful start; safe to ignore here */
    })
  })
  connection.onclose(() => onStatusChange?.('disconnected'))

  let stopped = false

  const start = async () => {
    onStatusChange?.('connecting')
    try {
      await connection.start()
      await connection.invoke('JoinPollGroup', pollCode)
      if (!stopped) onStatusChange?.('connected')
    } catch (err) {
      onStatusChange?.('disconnected')
      console.error('SignalR connection failed:', err)
    }
  }

  start()

  return async function stop() {
    stopped = true
    try {
      await connection.invoke('LeavePollGroup', pollCode)
    } catch {
      /* connection may already be closed — nothing to clean up */
    }
    await connection.stop()
  }
}
