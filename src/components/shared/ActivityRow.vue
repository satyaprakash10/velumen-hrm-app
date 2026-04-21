<template>
  <div
    class="group relative flex items-start gap-4 px-4 py-3.5 transition-colors"
    :class="item.read ? 'bg-transparent' : 'bg-sky-50/40 dark:bg-sky-950/15'"
  >
    <span
      class="absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity"
      :class="[toneBar, item.read ? 'opacity-0' : 'opacity-100']"
      aria-hidden="true"
    />

    <div class="flex shrink-0 flex-col items-center gap-2">
      <div
        class="flex h-9 w-9 items-center justify-center rounded-xl ring-1"
        :class="toneWrap"
        aria-hidden="true"
      >
        <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="icon" />
      </div>
      <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {{ clockTime }}
      </span>
    </div>

    <button
      type="button"
      class="flex min-w-0 flex-1 flex-col text-left"
      @click="$emit('open')"
    >
      <span class="flex items-start justify-between gap-3">
        <span class="min-w-0 truncate text-[14px] font-semibold text-slate-900 dark:text-slate-50">
          {{ item.title }}
        </span>
        <span
          v-if="!item.read"
          class="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:bg-sky-900/50 dark:text-sky-200"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-sky-500" aria-hidden="true" />
          New
        </span>
      </span>
      <p
        v-if="item.body"
        class="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-slate-600 dark:text-slate-400"
      >
        {{ item.body }}
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider">
        <span
          v-if="item.module"
          class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {{ item.module }}
        </span>
        <span
          v-if="item.context?.event"
          class="inline-flex items-center rounded-md px-1.5 py-0.5"
          :class="toneChip"
        >
          {{ formatEvent(item.context.event) }}
        </span>
        <span
          v-if="item.context?.email"
          class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 normal-case tracking-normal text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {{ item.context.email }}
        </span>
        <span
          v-if="item.to"
          class="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
        >
          <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Open {{ routeLabel }}
        </span>
      </div>
    </button>

    <div class="flex shrink-0 flex-col items-end gap-2">
      <span class="text-[11px] font-semibold text-slate-500 tabular-nums dark:text-slate-400">
        {{ relativeTime }}
      </span>
      <div class="flex items-center gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
        <button
          v-if="!item.read"
          type="button"
          class="inline-flex h-7 items-center rounded-md px-2 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/30"
          @click.stop="$emit('mark-read')"
        >
          Mark read
        </button>
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          aria-label="Dismiss"
          @click.stop="$emit('dismiss')"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
});

defineEmits(["mark-read", "dismiss", "open"]);

const TONE = {
  info: {
    bar: "bg-sky-400",
    wrap: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900/60",
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  success: {
    bar: "bg-emerald-400",
    wrap: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900/60",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  warning: {
    bar: "bg-amber-400",
    wrap: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900/60",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  error: {
    bar: "bg-rose-400",
    wrap: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900/60",
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
};

/**
 * Icons are resolved in a specificity ladder:
 *   1. Exact context.event match (e.g. "document_download" → download arrow).
 *   2. Module fallback (e.g. "payroll" → wallet; "leaves" → calendar).
 *   3. Category fallback (auth / system / activity).
 * Keeps the inbox visually scannable: every row's icon tells you what the
 * user actually did, not just which module produced the event.
 */
const EVENT_ICON = {
  // Auth
  login: `<svg viewBox="0 0 16 16" fill="none"><path d="M10 4h2.5A1.5 1.5 0 0114 5.5v5A1.5 1.5 0 0112.5 12H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M7 4l-3 4 3 4M4 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  login_failed: `<svg viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="6.5" rx="1.4" stroke="currentColor" stroke-width="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 11l4 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  locked: `<svg viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="6.5" rx="1.4" stroke="currentColor" stroke-width="1.5"/><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg>`,
  logout: `<svg viewBox="0 0 16 16" fill="none"><path d="M7 4H4.5A1.5 1.5 0 003 5.5v5A1.5 1.5 0 004.5 12H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 4l3 4-3 4M13 8H7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  register: `<svg viewBox="0 0 16 16" fill="none"><circle cx="7" cy="6" r="2.5" stroke="currentColor" stroke-width="1.5"/><path d="M2 13c.7-2 2.5-3 5-3s4.3 1 5 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M12 3v4M14 5h-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  // Documents
  document_view: `<svg viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/></svg>`,
  document_download: `<svg viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 13h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
  document_delete: `<svg viewBox="0 0 16 16" fill="none"><path d="M3 4h10M12.5 4v9.5a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V4m2 0V3a1 1 0 011-1h3a1 1 0 011 1v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Tasks
  task_create: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 6v4M6 8h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  task_update: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  task_move: `<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10m-4-3l4 3-4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  comment: `<svg viewBox="0 0 16 16" fill="none"><path d="M2.5 4a1.5 1.5 0 011.5-1.5h8A1.5 1.5 0 0113.5 4v5A1.5 1.5 0 0112 10.5H6L3 13V4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  task_clone: `<svg viewBox="0 0 16 16" fill="none"><rect x="4.5" y="4.5" width="8" height="8" rx="1.4" stroke="currentColor" stroke-width="1.5"/><path d="M3 10V3.5A1 1 0 014 2.5h6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  // Leaves
  leave_request: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M6 10l1.5 1.5L10.5 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  leave_update: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8.5 9l2-2 1 1-2 2H8.5V9z" fill="currentColor"/></svg>`,
  leave_delete: `<svg viewBox="0 0 16 16" fill="none"><path d="M3 4h10M12.5 4v9.5a.5.5 0 01-.5.5H4a.5.5 0 01-.5-.5V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,

  // Benefits
  benefit_enroll: `<svg viewBox="0 0 16 16" fill="none"><path d="M8 14s-5-3.5-5-8a3 3 0 015.5-1.5A3 3 0 0113 6c0 4.5-5 8-5 8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  benefit_waive: `<svg viewBox="0 0 16 16" fill="none"><path d="M8 14s-5-3.5-5-8a3 3 0 015.5-1.5A3 3 0 0113 6c0 4.5-5 8-5 8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 3l10 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  // Payroll
  payslip_generate: `<svg viewBox="0 0 16 16" fill="none"><rect x="3" y="2.5" width="10" height="11" rx="1.4" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 6h5M5.5 8h5M5.5 10h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  // Time
  timer_saved: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3l2 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  time_entry: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3l2 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,

  // Generic
  page_view: `<svg viewBox="0 0 16 16" fill="none"><path d="M2 8s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" stroke-width="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/></svg>`,
  orgchart_expand_all: `<svg viewBox="0 0 16 16" fill="none"><rect x="6" y="2" width="4" height="3" rx="0.6" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="9" width="4" height="3" rx="0.6" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="9" width="4" height="3" rx="0.6" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v2M4 9V7h8v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const MODULE_ICON = {
  auth: EVENT_ICON.login,
  tasks: EVENT_ICON.task_create,
  "task-board": EVENT_ICON.task_create,
  leaves: EVENT_ICON.leave_request,
  documents: `<svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h5l3 3V13a.5.5 0 01-.5.5h-7A.5.5 0 014 13V2.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 2.5v3h3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  docs: `<svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h5l3 3V13a.5.5 0 01-.5.5h-7A.5.5 0 014 13V2.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 2.5v3h3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  benefits: EVENT_ICON.benefit_enroll,
  payroll: EVENT_ICON.payslip_generate,
  payslips: EVENT_ICON.payslip_generate,
  time: EVENT_ICON.timer_saved,
  timesheet: EVENT_ICON.timer_saved,
  orgchart: EVENT_ICON.orgchart_expand_all,
  "my-team": `<svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="2.4" stroke="currentColor" stroke-width="1.5"/><path d="M2 13c.6-2 2-3 4-3s3.4 1 4 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="6.5" r="1.8" stroke="currentColor" stroke-width="1.3"/></svg>`,
  projects: `<svg viewBox="0 0 16 16" fill="none"><path d="M2.5 4.5A1.5 1.5 0 014 3h2.5l1.5 1.5H12a1.5 1.5 0 011.5 1.5v5A1.5 1.5 0 0112 12.5H4A1.5 1.5 0 012.5 11v-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  profile: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.6" stroke="currentColor" stroke-width="1.5"/><path d="M3 13c.8-2.2 2.7-3.2 5-3.2s4.2 1 5 3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const CAT_ICON = {
  auth: EVENT_ICON.login,
  activity: `<svg viewBox="0 0 16 16" fill="none"><path d="M1.5 8h2.3l1.8-4.5L8.5 12l1.7-4 .8 1.5h3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  system: `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.2l2 1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const tone = computed(() => TONE[props.item.severity] || TONE.info);
const toneBar = computed(() => tone.value.bar);
const toneWrap = computed(() => tone.value.wrap);
const toneChip = computed(() => tone.value.chip);

const icon = computed(() => {
  const evt = String(props.item.context?.event || "").toLowerCase();
  if (evt && EVENT_ICON[evt]) return EVENT_ICON[evt];
  const mod = String(props.item.module || "").toLowerCase();
  if (mod && MODULE_ICON[mod]) return MODULE_ICON[mod];
  return CAT_ICON[props.item.category] || CAT_ICON.activity;
});

const clockTime = computed(() => {
  try {
    return new Date(props.item.time).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
});

const relativeTime = computed(() => formatRelative(props.item.time));

const routeLabel = computed(() => {
  const p = props.item.to;
  if (!p) return "";
  const seg = p.replace(/^\//, "").split("/")[0] || "";
  return seg.replace(/-/g, " ");
});

function formatRelative(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  if (diff < 45_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.max(1, Math.round(diff / 60_000))}m ago`;
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / 3_600_000)}h ago`;
  if (diff < 7 * 24 * 60 * 60_000) return `${Math.round(diff / 86_400_000)}d ago`;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatEvent(evt) {
  return String(evt).replace(/_/g, " ");
}
</script>
