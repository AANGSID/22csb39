import { generateRandomCode } from './codegen'

// localStorage key
const STORE_KEY = 'shortly_store_v1'

/*
store schema:
{
  [shortcode]: {
    longUrl: string,
    createdAt: number (ms),
    expiresAt: number (ms),
    custom: boolean,
    clicks: [ { ts: number, referrer: string, language: string } ]
  },
  ...
}
*/

function loadStore() {
  const raw = localStorage.getItem(STORE_KEY)
  return raw ? JSON.parse(raw) : {}
}
function saveStore(store) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function listAll() {
  return loadStore()
}

export function getByShortcode(code) {
  const store = loadStore()
  return store[code] ?? null
}

function isUnique(store, code) {
  return !Object.prototype.hasOwnProperty.call(store, code)
}

export function createShortcode(longUrl, validityMinutes, preferredCode = null) {
  const store = loadStore()
  const createdAt = Date.now()
  const minutes = (typeof validityMinutes === 'number' && validityMinutes > 0) ? validityMinutes : 30
  const expiresAt = createdAt + minutes * 60 * 1000

  if (preferredCode) {
    if (!/^[a-zA-Z0-9_-]{3,40}$/.test(preferredCode)) {
      return { success: false, error: 'Preferred shortcode must be combination of both alphabet and numeric (3-40 chars).' }
    }
    if (!isUnique(store, preferredCode)) {
      return { success: false, error: ' Sorry !! Preferred shortcode is already in use.' }
    }
    const item = { longUrl, createdAt, expiresAt, custom: true, clicks: [] }
    store[preferredCode] = item
    saveStore(store)
    return { success: true, code: preferredCode, item }
  }

  // auto-generate unique code
  let tries = 0
  let len = 6
  while (tries < 1000) {
    const code = generateRandomCode(len)
    if (isUnique(store, code)) {
      const item = { longUrl, createdAt, expiresAt, custom: false, clicks: [] }
      store[code] = item
      saveStore(store)
      return { success: true, code, item }
    }
    tries++
    if (tries % 50 === 0) len++ // expand length if many collisions
  }
  return { success: false, error: 'Unable to generate unique shortcode — try again.' }
}

export function recordClick(code, metadata = {}) {
  const store = loadStore()
  if (!store[code]) return false
  store[code].clicks.push({
    ts: Date.now(),
    referrer: metadata.referrer || '',
    language: metadata.language || '',
  })
  saveStore(store)
  return true
}

export function removeShortcode(code) {
  const store = loadStore()
  if (store[code]) {
    delete store[code]
    saveStore(store)
    return true
  }
  return false
}

export function clearAll() {
  localStorage.removeItem(STORE_KEY)
}
