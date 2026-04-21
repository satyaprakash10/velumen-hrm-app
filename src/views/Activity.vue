<template>
  <div class="min-h-full bg-page-bg px-4 py-6 transition-colors dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Workspace telemetry
          </p>
          <h1 class="page-title mt-1">Activity</h1>
          <p class="mt-1 max-w-[520px] text-sm text-slate-500 dark:text-slate-400">
            Every sign-in, every task move, every timesheet tweak — kept locally in your browser so you
            can review what changed, when, and undo anything that shouldn't have.
          </p>
        </div>

        <div class="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            :disabled="!undoable"
            :title="undoable ? `Undo ${peekUndo()}` : 'Nothing to undo'"
            @click="onUndo"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4.5 7h6.1a3.4 3.4 0 010 6.8H7.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M6.6 4.6L3.6 7l3 2.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Undo
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            :disabled="!redoable"
            :title="redoable ? `Redo ${peekRedo()}` : 'Nothing to redo'"
            @click="onRedo"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M11.5 7H5.4a3.4 3.4 0 000 6.8h3.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
              <path d="M9.4 4.6L12.4 7l-3 2.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Redo
          </button>
          <button
            type="button"
            class="accent-gradient accent-focus inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="unreadCount === 0"
            @click="markAllRead"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 8l3 3 8-8M8 11l3 3 3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            Mark all read
          </button>
          <button
            type="button"
            class="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-40 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
            :disabled="items.length === 0"
            @click="clearAll"
          >
            Clear log
          </button>
        </div>
      </header>

      <!-- Stats strip -->
      <section class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ActivityStat
          v-for="stat in statCards"
          :key="stat.key"
          :stat="stat"
          :active="activeTab === stat.key"
          @click="activeTab = stat.key"
        />
      </section>

      <!-- Toolbar -->
      <section
        class="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm ring-1 ring-black/[0.02] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:ring-white/5 md:flex-row md:items-center md:gap-4 md:p-4"
      >
        <label class="relative min-w-0 flex-1">
          <span class="sr-only">Search activity</span>
          <svg
            class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-3.8-3.8" stroke-linecap="round" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Search titles, modules, events…"
            class="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 shadow-inner transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
        </label>

        <div
          class="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 text-[11px] font-semibold text-slate-600 shadow-inner dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300"
          role="tablist"
          aria-label="Severity filter"
        >
          <button
            v-for="sev in severityOptions"
            :key="sev.id"
            type="button"
            role="tab"
            :aria-selected="severity === sev.id"
            class="accent-tab inline-flex h-7 items-center gap-1.5 rounded-lg px-2"
            :class="
              severity === sev.id
                ? 'accent-tab-active'
                : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            "
            @click="severity = sev.id"
          >
            <span
              class="h-1.5 w-1.5 rounded-full"
              :class="sev.dot"
              aria-hidden="true"
            />
            {{ sev.label }}
          </button>
        </div>

        <label
          class="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <input v-model="onlyUnread" type="checkbox" class="h-3.5 w-3.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
          Unread only
        </label>
      </section>

      <!-- Timeline -->
      <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
        <header class="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <span>Timeline</span>
          <span class="font-medium normal-case tracking-normal">
            {{ filteredCount }} of {{ items.length }} entries
          </span>
        </header>

        <div v-if="groupedItems.length === 0" class="px-6 py-14 text-center">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 text-sky-600 dark:from-sky-950/60 dark:via-indigo-950/40 dark:to-purple-950/60 dark:text-sky-300">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 7h8M8 12h8M8 17h5" />
              <rect x="3" y="3" width="18" height="18" rx="3" stroke-linecap="round" />
            </svg>
          </div>
          <p class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
            {{ items.length === 0 ? "Nothing logged yet" : "No entries match the filters" }}
          </p>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {{
              items.length === 0
                ? "Start using the app — tasks, timers, leaves, auth events all show up here automatically."
                : "Try another category, remove the search, or clear the unread filter."
            }}
          </p>
        </div>

        <ul v-else class="divide-y divide-slate-100 dark:divide-slate-800">
          <li v-for="group in groupedItems" :key="group.label" class="bg-white dark:bg-slate-900">
            <header class="sticky top-0 z-[1] flex items-center justify-between bg-slate-50/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 backdrop-blur dark:bg-slate-950/80 dark:text-slate-400">
              <span>{{ group.label }}</span>
              <span class="font-semibold normal-case tracking-normal">{{ group.items.length }}</span>
            </header>
            <ol class="divide-y divide-slate-100 dark:divide-slate-800">
              <li v-for="item in group.items" :key="item.id">
                <ActivityRow
                  :item="item"
                  @mark-read="markRead(item.id)"
                  @dismiss="dismiss(item.id)"
                  @open="openItem(item)"
                />
              </li>
            </ol>
          </li>
        </ul>
      </section>

      <p class="mt-4 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <svg class="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5 8l2.2 2.2L11.4 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
        </svg>
        Activity is stored only in this browser with per-user scoping. No credentials, tokens or payloads leave your device.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useNotificationCenter } from "@/composables/useNotificationCenter.js";
import { useToast } from "@/composables/useToast.js";
import ActivityRow from "@/components/shared/ActivityRow.vue";
import ActivityStat from "@/components/shared/ActivityStat.vue";

const router = useRouter();
const toast = useToast();
const {
  items,
  unreadCount,
  countsByCategory,
  markRead,
  markAllRead: markAllReadStore,
  dismiss,
  clearAll: clearAllStore,
  undo,
  redo,
  undoable,
  redoable,
  peekUndo,
  peekRedo,
} = useNotificationCenter();

const search = ref("");
const onlyUnread = ref(false);
const severity = ref("any");
const activeTab = ref("all");

const severityOptions = [
  { id: "any", label: "Any", dot: "bg-slate-400" },
  { id: "info", label: "Info", dot: "bg-sky-400" },
  { id: "success", label: "Success", dot: "bg-emerald-400" },
  { id: "warning", label: "Warning", dot: "bg-amber-400" },
  { id: "error", label: "Error", dot: "bg-rose-400" },
];

const statCards = computed(() => [
  {
    key: "all",
    label: "All events",
    value: countsByCategory.value.all,
    hint: `${unreadCount.value} unread`,
    tone: "slate",
  },
  {
    key: "activity",
    label: "Activity",
    value: countsByCategory.value.activity,
    hint: "Task / time / project actions",
    tone: "sky",
  },
  {
    key: "auth",
    label: "Security",
    value: countsByCategory.value.auth,
    hint: "Sign-ins, lockouts, registrations",
    tone: "amber",
  },
  {
    key: "system",
    label: "System",
    value: countsByCategory.value.system,
    hint: "Payroll, HR, reminders",
    tone: "indigo",
  },
]);

const filteredItems = computed(() => {
  const q = search.value.trim().toLowerCase();
  return items.value.filter((n) => {
    if (activeTab.value !== "all" && n.category !== activeTab.value) return false;
    if (severity.value !== "any" && n.severity !== severity.value) return false;
    if (onlyUnread.value && n.read) return false;
    if (!q) return true;
    return (
      n.title.toLowerCase().includes(q) ||
      (n.body || "").toLowerCase().includes(q) ||
      (n.module || "").toLowerCase().includes(q) ||
      (n.context?.event || "").toLowerCase().includes(q)
    );
  });
});

const filteredCount = computed(() => filteredItems.value.length);

const groupedItems = computed(() => {
  const list = filteredItems.value;
  if (!list.length) return [];
  const groups = new Map();
  for (const item of list) {
    const key = dayLabel(item.time);
    if (!groups.has(key)) groups.set(key, { label: key, items: [] });
    groups.get(key).items.push(item);
  }
  return Array.from(groups.values());
});

function dayLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const t = d.getTime();
  if (t >= startOfToday) return "Today";
  if (t >= startOfYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}

function openItem(item) {
  markRead(item.id);
  if (item.to) {
    router.push(item.to).catch(() => {});
  }
}

function markAllRead() {
  if (unreadCount.value === 0) return;
  markAllReadStore();
  toast.success("Marked everything as read. Undo in the toolbar.");
}

function clearAll() {
  if (items.value.length === 0) return;
  clearAllStore();
  toast.info("Activity log cleared. Undo in the toolbar to bring it back.");
}

function onUndo() {
  if (undo()) toast.info("Last action reverted.");
}

function onRedo() {
  if (redo()) toast.info("Change re-applied.");
}
</script>
