import { ref } from "vue";

const toasts = ref([]);
let seq = 0;

/**
 * Toast lifetimes are tuned to feel glanceable — a quick pop, read the line,
 * gone. Errors stick around a touch longer so the user can actually parse
 * what went wrong before it disappears.
 */
const TOAST_MS = {
  success: 2400,
  info: 2600,
  error: 3600,
};

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {{ module?: string, action?: string, duration?: number }} [opts]
 */
export function useToast() {
  function push(message, type = "info", opts = {}) {
    const id = ++seq;
    const payload =
      typeof opts === "string"
        ? { module: opts, action: undefined }
        : { module: opts?.module, action: opts?.action };
    toasts.value = [...toasts.value, { id, message, type, ...payload }];
    const ms = Number.isFinite(opts?.duration)
      ? Math.max(800, opts.duration)
      : TOAST_MS[type] ?? TOAST_MS.info;
    window.setTimeout(() => dismiss(id), ms);
    return id;
  }

  function dismiss(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  function success(msg, opts) {
    return push(msg, "success", opts ?? {});
  }
  function error(msg, opts) {
    return push(msg, "error", opts ?? {});
  }
  function info(msg, opts) {
    return push(msg, "info", opts ?? {});
  }

  return { toasts, push, dismiss, success, error, info };
}
