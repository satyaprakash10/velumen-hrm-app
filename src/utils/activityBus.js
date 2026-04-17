/**
 * Lightweight app-wide activity channel (no WebSocket). Same-tab + optional cross-tab via storage ping.
 * MainLayout bridges this to toasts + notification center.
 *
 * @param {{ title?: string, message?: string, body?: string, module?: string, toast?: boolean, notify?: boolean }} payload
 */
export function emitActivity(payload) {
  try {
    window.dispatchEvent(new CustomEvent("ess-activity", { detail: { ...payload } }));
    localStorage.setItem("ess_activity_ping", String(Date.now()));
  } catch {
    /* ignore */
  }
}
