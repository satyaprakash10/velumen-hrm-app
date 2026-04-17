import { ref } from "vue";

const toasts = ref([]);
let seq = 0;

/**
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {{ module?: string, action?: string }} [opts] module e.g. leaves, time, documents; action e.g. delete, download
 */
export function useToast() {
  function push(message, type = "info", opts = {}) {
    const id = ++seq;
    const payload =
      typeof opts === "string"
        ? { module: opts, action: undefined }
        : { module: opts?.module, action: opts?.action };
    toasts.value = [...toasts.value, { id, message, type, ...payload }];
    const ms = type === "error" ? 5200 : 3800;
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
