/**
 * Activity bus
 * ---------------------------------------------------------------------------
 * App-wide channel for user-facing activity. Used by MainLayout to bridge
 * into toasts + the persistent notification center.
 *
 * `category` controls how the event is classified in the inbox:
 *   - "activity" (default) — feature usage (tasks, time, projects, leaves…)
 *   - "auth"               — sign-in, sign-out, register, failed attempts
 *   - "system"             — app-wide, non user-initiated events
 *
 * `severity` is one of "info" | "success" | "warning" | "error" and drives
 * the accent color in the UI.
 *
 * Security: this function NEVER logs raw secrets. Callers should pass only
 * identifying metadata (module name, title, user-visible message). If a
 * caller accidentally passes a password-like field it is dropped by the
 * downstream normalizer in `useNotificationCenter`.
 *
 * @typedef {Object} ActivityPayload
 * @property {string}  [title]    Short headline shown in the inbox
 * @property {string}  [message]  Detail body (also used for toast text)
 * @property {string}  [body]     Alias for `message`
 * @property {string}  [module]   Feature area e.g. "tasks", "time", "auth"
 * @property {"activity"|"auth"|"system"} [category="activity"]
 * @property {"info"|"success"|"warning"|"error"} [severity="info"]
 * @property {boolean} [toast=true]  Show a toast (set false to silence)
 * @property {boolean} [notify=true] Add to notification center
 * @property {boolean} [silent=false] Skip the real-time push popup. The
 *   event still lands in the inbox; only the ephemeral popup is suppressed.
 *   Use for events the user just triggered themselves (the view already
 *   shows its own feedback) or passive events like page visits.
 * @property {Object}  [context]  Optional metadata ({ email, role, … })
 *
 * @param {ActivityPayload} payload
 */
export function emitActivity(payload) {
  try {
    const detail = {
      category: "activity",
      severity: "info",
      ...(payload || {}),
    };
    window.dispatchEvent(new CustomEvent("ess-activity", { detail }));
    localStorage.setItem("ess_activity_ping", String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * Convenience helper for auth-related activity. Always classified as "auth".
 * @param {Omit<ActivityPayload, 'category'>} payload
 */
export function emitAuthActivity(payload) {
  emitActivity({
    module: "auth",
    ...(payload || {}),
    category: "auth",
  });
}
