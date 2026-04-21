<template>
  <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60">
    <span
      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1"
      :class="toneWrap"
      aria-hidden="true"
    >
      <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="iconSvg" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
        {{ label }}
      </p>
      <p
        v-if="!badge"
        class="mt-0.5 truncate text-[13px] font-semibold tabular-nums text-slate-800 dark:text-slate-100"
        :title="String(value ?? '')"
      >
        <slot>{{ value ?? "—" }}</slot>
      </p>
      <p
        v-else
        class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
        :class="badgeClass"
      >
        <span v-if="badgeDot" class="h-1.5 w-1.5 rounded-full" :class="badgeDot" aria-hidden="true" />
        {{ value ?? "—" }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: "" },
  icon: { type: String, default: "info" },
  tone: { type: String, default: "slate" },
  badge: { type: Boolean, default: false },
});

const TONE_WRAP = {
  sky: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60",
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60",
  amber: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/60",
  rose: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/60",
  violet: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/60",
  indigo: "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:ring-indigo-900/60",
  slate: "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700",
};

const TONE_BADGE = {
  sky: {
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  amber: {
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  rose: {
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  violet: {
    chip: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  indigo: {
    chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    dot: "bg-indigo-500",
  },
  slate: {
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
    dot: "bg-slate-400",
  },
};

const ICONS = {
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path stroke-linecap="round" d="M3.5 9h17M8 3v4M16 3v4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path stroke-linecap="round" d="M12 7v5l3 2"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5A2.5 2.5 0 015.5 5h3.4a1 1 0 01.7.3l1.6 1.6a1 1 0 00.7.3H18.5A2.5 2.5 0 0121 9.7V17a3 3 0 01-3 3H6a3 3 0 01-3-3V7.5z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5"/></svg>`,
  size: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M4 12V6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2h-6M4 12h8m-8 0v6a2 2 0 002 2h4"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3l7 3v5c0 4.2-3 7.7-7 9-4-1.3-7-4.8-7-9V6l7-3z"/></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="7" width="17" height="13" rx="2"/><path stroke-linecap="round" d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3.5 12h17"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="8" r="3.6"/><path stroke-linecap="round" d="M4 20c1.2-3.4 4-5 8-5s6.8 1.6 8 5"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path stroke-linecap="round" d="M4 7l8 6 8-6"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-6-5.5-6-10a6 6 0 1112 0c0 4.5-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/></svg>`,
  tag: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.3L12.3 21a1.5 1.5 0 01-2.1 0L3 13.8V5a2 2 0 012-2h8.8a1.5 1.5 0 011 .4L21 10.2a1.5 1.5 0 010 2.1z"/><circle cx="8" cy="8" r="1.5"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M5 12l4 4L19 7"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="8.5"/><path stroke-linecap="round" d="M12 11v5M12 8v.01"/></svg>`,
  hash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.5-7-10a5 5 0 019.5-2A5 5 0 0119 11c0 5.5-7 10-7 10z"/></svg>`,
  badge: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="9" r="4"/><path stroke-linecap="round" d="M8 12.5l-2 8 6-3 6 3-2-8"/></svg>`,
};

const toneWrap = computed(() => TONE_WRAP[props.tone] || TONE_WRAP.slate);
const iconSvg = computed(() => ICONS[props.icon] || ICONS.info);

const badgeClass = computed(() => {
  const t = TONE_BADGE[props.tone] || TONE_BADGE.slate;
  return t.chip;
});

const badgeDot = computed(() => {
  const t = TONE_BADGE[props.tone] || TONE_BADGE.slate;
  return t.dot;
});
</script>
