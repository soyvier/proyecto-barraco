const STORAGE_KEY = 'proyecto-barraco';

function getStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { attempts: [] };
  } catch {
    return { attempts: [] };
  }
}

function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveAttempt(attempt) {
  const store = getStore();
  store.attempts.push(attempt);
  saveStore(store);
}

export function getAttempts() {
  return getStore().attempts;
}

export function getAttemptById(id) {
  return getStore().attempts.find((a) => a.id === id) || null;
}

export function clearAttempts() {
  saveStore({ attempts: [] });
}
