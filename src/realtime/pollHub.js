import * as signalR from '@microsoft/signalr'
import { BASE_URL } from '../api/http'

export function connectToPollResults(pollCode, onResults, { onStatusChange, onError } = {}) {
  const token = localStorage.getItem('token')

  if (!token) {
    onStatusChange?.('disconnected')
    onError?.('You must be logged in to view live results.')
    return async function stop() {}
  }

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/poll`, {
      accessTokenFactory: () => token,
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
    connection.invoke('JoinPollGroup', pollCode).catch((err) => {
      onError?.(err?.message || 'Failed to rejoin poll group.')
      onStatusChange?.('disconnected')
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
      const message =
        err?.message ||
        'SignalR connection failed. Only the poll creator can view live results.'
      onError?.(message)
      console.error('SignalR connection failed:', err)
    }
  }

  start()

  return async function stop() {
    stopped = true
    try {
      await connection.invoke('LeavePollGroup', pollCode)
    } catch {
    }
    await connection.stop()
  }
}
