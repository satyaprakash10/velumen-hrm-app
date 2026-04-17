const KEY = "ess_timer_pending_entry";

/**
 * Persists a draft time entry before navigating to the timesheet for confirmation.
 * @param {{ date: string, hours: number, project: string, notes?: string, trackedLabel?: string }} payload
 */
export function stashTimerEntry(payload) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({
        v: 1,
        date: payload.date,
        hours: Number(payload.hours),
        project: String(payload.project ?? "").trim(),
        notes: String(payload.notes ?? "").trim(),
        trackedLabel: String(payload.trackedLabel ?? "").trim(),
      }),
    );
  } catch {
    /* ignore quota */
  }
}

/** Reads and removes the pending payload (single use). */
export function takeTimerEntryPending() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    sessionStorage.removeItem(KEY);
    const o = JSON.parse(raw);
    if (!o || typeof o !== "object") return null;
    return o;
  } catch {
    return null;
  }
}
