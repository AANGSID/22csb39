// loggingMiddleware.js
// Exports logEvent(type, meta) — MUST be used instead of console.log
const LOG_KEY = 'shortly_logs_v1'

function loadLogs() {
  const raw = localStorage.getItem(LOG_KEY)
  return raw ? JSON.parse(raw) : []
}
function saveLogs(logs) {
  localStorage.setItem(LOG_KEY, JSON.stringify(logs))
}

/**
 * logEvent(type: string, meta: object)
 * - stores log entries in localStorage
 */
export function logEvent(type, meta = {}) {
  const logs = loadLogs()
  logs.push({
    ts: Date.now(),
    type,
    meta
  })
  saveLogs(logs)
}
