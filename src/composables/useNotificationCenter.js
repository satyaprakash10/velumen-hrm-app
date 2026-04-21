import { ref, computed } from "vue";
import seed from "@/data/notifications.json";
import { authUser } from "@/composables/useAuth.js";

/**
 * Notification Center
 * ---------------------------------------------------------------------------
 * A lightweight, secure, real-time notification store.
 *
 * Design notes:
 *  - Per-user, persisted in localStorage so notifications survive refreshes.
 *    The storage key is scoped by the authenticated user id; signed-out
 *    sessions use a sandboxed "anon" bucket.
 *  - Cross-tab sync via `BroadcastChannel` (primary) with a `storage` event
 *    fallback. Every mutation fans out to listeners in other tabs so the
 *    inbox stays in lockstep across windows.
 *  - Sensitive fields (passwords, tokens, hashes, session ids, raw auth
 *    headers) are stripped defensively before anything is persisted.
 *  - Capped at MAX_ITEMS so the store can't grow unbounded in production.
 *  - Undo / redo is implemented with bounded snapshot stacks so the Activity
 *    page can let users recover from accidental dismisses / clears.
 *  - A shared `panelOpen` ref lets the real-time push toaster know whether
 *    the full inbox is currently visible, so it doesn't double-announce.
 */

const MAX_ITEMS = 120;
const HISTORY_MAX = 30;
const CHANNEL_NAME = "ess-notifications";
const STORAGE_VERSION = "v2";
const SEED_MARKER = "ess_notifications_seed_loaded";

const CATEGORIES = ["all", "auth", "activity", "system"];

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordhash",
  "password_hash",
  "token",
  "accesstoken",
  "refreshtoken",
  "authorization",
  "cookie",
  "session",
  "secret",
  "apikey",
  "api_key",
]);

/**
 * Default routes for a notification based on its module. Used when the
 * caller hasn't supplied an explicit `to`. We always prefer an explicit
 * value — this is just a sensible fallback.
 */
const MODULE_ROUTE_MAP = {
  tasks: "/task-board",
  "task-board": "/task-board",
  projects: "/projects",
  time: "/timesheet",
  timesheet: "/timesheet",
  leaves: "/leaves",
  payroll: "/my-payslips",
  payslips: "/my-payslips",
  documents: "/docs",
  docs: "/docs",
  benefits: "/benefits",
  orgchart: "/orgchart",
  "my-team": "/my-team",
  profile: "/my-information",
  hr: "/my-information",
  auth: "/activity",
  system: "/activity",
};

function sanitize(payload) {
  if (!payload || typeof payload !== "object") return {};
  const out = {};
  for (const [k, v] of Object.entries(payload)) {
    if (SENSITIVE_KEYS.has(String(k).toLowerCase())) continue;
    if (typeof v === "function") continue;
    if (v === undefined) continue;
    out[k] = v;
  }
  return out;
}

function storageKey(uid) {
  return `ess_notifications_${uid || "anon"}_${STORAGE_VERSION}`;
}

function safeJSON(str, fallback) {
  try {
    const v = JSON.parse(str);
    return v;
  } catch {
    return fallback;
  }
}

function loadFromStorage(uid) {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(storageKey(uid));
  if (!raw) return null;
  const parsed = safeJSON(raw, null);
  return Array.isArray(parsed) ? parsed : null;
}

function writeToStorage(uid, list) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(list));
  } catch {
    /* quota / private mode — silently degrade */
  }
}

function currentUid() {
  try {
    return authUser?.value?.id || "anon";
  } catch {
    return "anon";
  }
}

function safePath(p) {
  if (typeof p !== "string") return null;
  if (!p.startsWith("/")) return null;
  if (p.startsWith("//")) return null;
  return p.slice(0, 200);
}

function resolveRoute(module, fallback) {
  if (fallback) return safePath(fallback);
  if (!module) return null;
  const key = String(module).toLowerCase();
  return MODULE_ROUTE_MAP[key] || null;
}

function normalizeItem(n) {
  const safe = sanitize(n || {});
  const module = safe.module || null;
  return {
    id:
      safe.id ||
      `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(safe.title || "Update").slice(0, 140),
    body: String(safe.body || safe.message || "").slice(0, 400),
    time: safe.time || new Date().toISOString(),
    read: Boolean(safe.read ?? false),
    category: ["auth", "activity", "system"].includes(safe.category)
      ? safe.category
      : "activity",
    severity: ["info", "success", "warning", "error"].includes(safe.severity)
      ? safe.severity
      : "info",
    module,
    icon: safe.icon || null,
    to: resolveRoute(module, safe.to),
    context: safe.context ? sanitize(safe.context) : null,
  };
}

function dedupeSort(list) {
  const map = new Map();
  for (const item of list) {
    if (!item?.id) continue;
    map.set(item.id, item);
  }
  return Array.from(map.values())
    .sort((a, b) => (a.time < b.time ? 1 : a.time > b.time ? -1 : 0))
    .slice(0, MAX_ITEMS);
}

/* --------------------------------------------------------------------- *
 *  Initial seed (once per browser, so we have something to look at)
 * --------------------------------------------------------------------- */

const initialUid = currentUid();
const existing = loadFromStorage(initialUid);
const seedLoaded =
  typeof localStorage !== "undefined" &&
  localStorage.getItem(SEED_MARKER) === "1";

let initial;
if (existing && existing.length) {
  initial = existing.map(normalizeItem);
} else if (!seedLoaded) {
  initial = seed.map((n) =>
    normalizeItem({ ...n, category: n.category || "system", severity: n.severity || "info" }),
  );
  writeToStorage(initialUid, initial);
  try {
    localStorage.setItem(SEED_MARKER, "1");
  } catch {
    /* ignore */
  }
} else {
  initial = [];
}

export const notificationItems = ref(dedupeSort(initial));

/** Shared state: is the inbox popover/sheet currently open? */
export const notificationPanelOpen = ref(false);

/** Published to listeners (like the push toaster) when a brand-new item arrives. */
export const lastPush = ref(null);

/* --------------------------------------------------------------------- *
 *  Undo / Redo snapshot stacks
 * --------------------------------------------------------------------- */

const undoStack = [];
const redoStack = [];
const undoable = ref(false);
const redoable = ref(false);

function snapshot() {
  return notificationItems.value.map((n) => ({ ...n }));
}

function syncFlags() {
  undoable.value = undoStack.length > 0;
  redoable.value = redoStack.length > 0;
}

function recordBefore(label) {
  undoStack.push({ label, items: snapshot() });
  if (undoStack.length > HISTORY_MAX) undoStack.shift();
  redoStack.length = 0;
  syncFlags();
}

function applySnapshot(items) {
  notificationItems.value = dedupeSort(items.map(normalizeItem));
  persist();
  broadcast("replace", { items: notificationItems.value });
}

function undo() {
  if (!undoStack.length) return false;
  const entry = undoStack.pop();
  redoStack.push({ label: entry.label, items: snapshot() });
  if (redoStack.length > HISTORY_MAX) redoStack.shift();
  applySnapshot(entry.items);
  syncFlags();
  return true;
}

function redo() {
  if (!redoStack.length) return false;
  const entry = redoStack.pop();
  undoStack.push({ label: entry.label, items: snapshot() });
  if (undoStack.length > HISTORY_MAX) undoStack.shift();
  applySnapshot(entry.items);
  syncFlags();
  return true;
}

function peekUndo() {
  return undoStack.length ? undoStack[undoStack.length - 1].label : null;
}

function peekRedo() {
  return redoStack.length ? redoStack[redoStack.length - 1].label : null;
}

/* --------------------------------------------------------------------- *
 *  Cross-tab channel
 * --------------------------------------------------------------------- */

let channel = null;
try {
  if (typeof BroadcastChannel !== "undefined") {
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.addEventListener("message", (evt) => {
      const msg = evt.data || {};
      if (msg.type === "replace" && Array.isArray(msg.items)) {
        notificationItems.value = dedupeSort(msg.items.map(normalizeItem));
      } else if (msg.type === "push" && msg.item) {
        const item = normalizeItem(msg.item);
        notificationItems.value = dedupeSort([item, ...notificationItems.value]);
        lastPush.value = item;
      }
    });
  }
} catch {
  /* ignore */
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (evt) => {
    if (!evt.key) return;
    if (evt.key !== storageKey(currentUid())) return;
    const next = safeJSON(evt.newValue, null);
    if (Array.isArray(next)) {
      notificationItems.value = dedupeSort(next.map(normalizeItem));
    }
  });
}

function broadcast(type, payload) {
  if (!channel) return;
  try {
    channel.postMessage({ type, ...payload });
  } catch {
    /* ignore */
  }
}

function persist() {
  writeToStorage(currentUid(), notificationItems.value);
}

/* --------------------------------------------------------------------- *
 *  Public mutations
 * --------------------------------------------------------------------- */

export function pushNotification(input) {
  const item = normalizeItem(input);
  notificationItems.value = dedupeSort([item, ...notificationItems.value]);
  persist();
  broadcast("push", { item });
  // `silent` items still land in the inbox for audit purposes but never
  // trigger the real-time push popup. Used for passive events like page
  // visits, where a popup every time the user clicks a link is noise.
  if (!input?.silent) {
    lastPush.value = item;
  }
  return item;
}

export function markNotificationRead(id) {
  const target = notificationItems.value.find((n) => n.id === id);
  if (!target || target.read) return;
  recordBefore("Mark read");
  const next = notificationItems.value.map((n) =>
    n.id === id ? { ...n, read: true } : n,
  );
  notificationItems.value = next;
  persist();
  broadcast("replace", { items: next });
}

export function markAllNotificationsRead() {
  if (!notificationItems.value.some((n) => !n.read)) return;
  recordBefore("Mark all read");
  const next = notificationItems.value.map((n) =>
    n.read ? n : { ...n, read: true },
  );
  notificationItems.value = next;
  persist();
  broadcast("replace", { items: next });
}

export function dismissNotification(id) {
  const exists = notificationItems.value.some((n) => n.id === id);
  if (!exists) return;
  recordBefore("Dismiss");
  const next = notificationItems.value.filter((n) => n.id !== id);
  notificationItems.value = next;
  persist();
  broadcast("replace", { items: next });
}

export function clearAllNotifications() {
  if (!notificationItems.value.length) return;
  recordBefore("Clear all");
  notificationItems.value = [];
  persist();
  broadcast("replace", { items: [] });
}

/* --------------------------------------------------------------------- *
 *  Composable wrapper
 * --------------------------------------------------------------------- */

export function useNotificationCenter() {
  const items = notificationItems;

  const unreadCount = computed(
    () => items.value.filter((n) => !n.read).length,
  );

  const countsByCategory = computed(() => {
    const base = { all: items.value.length, auth: 0, activity: 0, system: 0 };
    for (const n of items.value) {
      if (base[n.category] != null) base[n.category] += 1;
    }
    return base;
  });

  return {
    items,
    unreadCount,
    countsByCategory,
    categories: CATEGORIES,
    push: pushNotification,
    markRead: markNotificationRead,
    markAllRead: markAllNotificationsRead,
    dismiss: dismissNotification,
    clearAll: clearAllNotifications,
    undo,
    redo,
    undoable,
    redoable,
    peekUndo,
    peekRedo,
    panelOpen: notificationPanelOpen,
    lastPush,
  };
}
