import { reactive, watch } from "vue";

/**
 * App-level preferences.
 *
 * Persisted to localStorage per install. Everything here is non-sensitive UI
 * preference data — no PII or auth secrets are stored via this composable.
 *
 * Consumed by the Settings page, the notification center, the push toaster,
 * and a few minor UI surfaces.
 */

const STORAGE_KEY = "ess_app_settings_v1";

const DEFAULTS = {
  notifications: {
    enablePush: true,
    enableSound: false,
    channels: {
      auth: true,
      activity: true,
      system: true,
    },
  },
  security: {
    rememberDevice: true,
    autoLockMinutes: 0,
    requireConfirmForDestructive: true,
  },
  appearance: {
    density: "comfortable",
    accent: "sky",
  },
  privacy: {
    crossTabSync: true,
  },
};

function clone(v) {
  return JSON.parse(JSON.stringify(v));
}

function deepMerge(target, patch) {
  if (!patch || typeof patch !== "object") return target;
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object") {
      deepMerge(target[k], v);
    } else {
      target[k] = v;
    }
  }
  return target;
}

function load() {
  const base = clone(DEFAULTS);
  if (typeof localStorage === "undefined") return base;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") deepMerge(base, parsed);
    return base;
  } catch {
    return base;
  }
}

export const settings = reactive(load());

let persistScheduled = false;

function persist() {
  if (persistScheduled) return;
  persistScheduled = true;
  queueMicrotask(() => {
    persistScheduled = false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  });
}

watch(settings, persist, { deep: true });

export function useAppSettings() {
  function reset() {
    const base = clone(DEFAULTS);
    for (const k of Object.keys(settings)) delete settings[k];
    for (const [k, v] of Object.entries(base)) settings[k] = v;
  }

  function setChannel(category, enabled) {
    settings.notifications.channels[category] = Boolean(enabled);
  }

  return { settings, reset, setChannel };
}
