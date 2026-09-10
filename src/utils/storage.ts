/**
 * Resilient localStorage utility with quota protection, automatic cleanup,
 * and graceful fallback to in-memory storage.
 */

// In-memory fallback if localStorage is unavailable or quota is exceeded
const memoryStore = new Map<string, string>();

// Non-critical keys that can be safely evicted when storage quota is reached (ranked by least critical)
const EVICTION_CANDIDATE_KEYS = [
  'lbu_audit_logs',
  'lbu_attendance_records',
  'lbu_materials',
  'lbu_submissions',
  'lbu_assignments',
  'lbu_notifications',
  'lbu_quiz_results',
  'lbu_quizzes',
  'lbu_threads',
  'lbu_student_requests',
  'lbu_admin_users',
  'lbu_active_students',
];

/**
 * Safely retrieve an item from localStorage with fallback to memoryStore
 */
export function safeStorageGet<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null && raw !== undefined) {
      try {
        return JSON.parse(raw) as T;
      } catch {
        // If it's a raw unquoted string (or was saved as plain string) and defaultValue is a string
        if (typeof defaultValue === 'string') {
          return raw as unknown as T;
        }
      }
    }
  } catch (e) {
    // If parsing fails or access is blocked
  }

  // Fallback to memory
  const memRaw = memoryStore.get(key);
  if (memRaw !== undefined && memRaw !== null) {
    try {
      return JSON.parse(memRaw) as T;
    } catch {
      if (typeof defaultValue === 'string') {
        return memRaw as unknown as T;
      }
      return defaultValue;
    }
  }

  return defaultValue;
}

/**
 * Clean up bloated or redundant keys if quota is tight
 */
export function pruneStorageIfFull(): void {
  try {
    for (const key of EVICTION_CANDIDATE_KEYS) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    }
  } catch (e) {
    // Ignore cleanup errors
  }
}

/**
 * Safely save an item to localStorage with automatic quota management
 */
export function safeStorageSet(key: string, value: any): boolean {
  if (value === undefined) {
    safeStorageRemove(key);
    return true;
  }

  let serialized = '';
  try {
    serialized = JSON.stringify(value);
  } catch (e) {
    try {
      serialized = String(value);
    } catch {
      console.warn(`[SafeStorage] Failed to serialize key "${key}":`, e);
      return false;
    }
  }

  // Always keep in-memory backup
  memoryStore.set(key, serialized);

  try {
    localStorage.setItem(key, serialized);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err?.name === 'QuotaExceededError' ||
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (typeof err?.message === 'string' && err.message.toLowerCase().includes('quota'));

    if (isQuotaError) {
      console.warn(`[SafeStorage] Quota exceeded on "${key}". Freeing non-critical cache...`);
      pruneStorageIfFull();

      // Try one more time after pruning
      try {
        localStorage.setItem(key, serialized);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage] Could not write "${key}" to localStorage after pruning. Using in-memory fallback.`);
        return false;
      }
    } else {
      console.warn(`[SafeStorage] Storage write failed for "${key}":`, err);
      return false;
    }
  }
}

/**
 * Safely remove an item
 */
export function safeStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
  memoryStore.delete(key);
}
