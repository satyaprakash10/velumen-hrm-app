<template>
  <div class="h-full overflow-hidden p-4 sm:p-6">
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        Notification center
      </p>
      <span class="inline-flex h-5 items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2 text-[10px] font-bold uppercase tracking-wider text-white">
        3 new
      </span>
    </div>

    <div class="mt-3 flex items-center gap-1.5">
      <span
        v-for="tab in tabs"
        :key="tab.id"
        class="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
        :class="
          tab.active
            ? 'border-transparent bg-white text-slate-900'
            : 'border-white/10 text-slate-300'
        "
      >
        {{ tab.label }}
      </span>
    </div>

    <ul class="mt-3 space-y-2">
      <li
        v-for="n in items"
        :key="n.title"
        class="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5"
      >
        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1" :class="n.iconBg">
          <span class="h-3.5 w-3.5 [&>svg]:h-full [&>svg]:w-full" v-html="n.icon" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[11.5px] font-semibold text-white">{{ n.title }}</p>
          <p class="truncate text-[10.5px] text-slate-400">{{ n.body }}</p>
          <div class="mt-1 flex items-center gap-1.5">
            <span class="inline-flex items-center rounded bg-white/5 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-300">
              {{ n.module }}
            </span>
            <span class="inline-flex items-center gap-1 rounded bg-sky-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-300">
              <svg class="h-2 w-2" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              View
            </span>
          </div>
        </div>
        <span class="shrink-0 text-[10px] font-semibold tabular-nums text-slate-500">{{ n.when }}</span>
      </li>
    </ul>

    <div class="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[10px] text-slate-400">
      <span class="inline-flex items-center gap-1.5">
        <span class="relative flex h-2 w-2" aria-hidden="true">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Real-time stream connected
      </span>
      <span class="font-medium tabular-nums text-slate-500">3 unread · 12 total</span>
    </div>
  </div>
</template>

<script setup>
const tabs = [
  { id: "all", label: "All", active: true },
  { id: "activity", label: "Activity" },
  { id: "auth", label: "Security" },
  { id: "system", label: "System" },
];

const ICON_BELL = `<svg viewBox="0 0 16 16" fill="none"><path d="M13.55 9.43C12.44 9.43 13.94 4.48 10 3.27 10 1.95 9.12 1 8 1S6 1.95 6 3.27C2.07 4.49 3.58 9.43 2.47 9.43 1.62 9.43 1 10.25 1 11.28S1.6 13 2.33 13h11.34C14.4 13 15 12.31 15 11.28s-.62-1.85-1.45-1.85z" stroke="currentColor" stroke-width="1.3"/></svg>`;
const ICON_LOCK = `<svg viewBox="0 0 16 16" fill="none"><rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M5.2 8.3l2 2 3.6-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const items = [
  {
    title: "Signed in from Chrome · macOS",
    body: "Alex · admin · co-1",
    module: "auth",
    when: "just now",
    icon: ICON_LOCK,
    iconBg: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  },
  {
    title: "Timer saved: Payroll revamp",
    body: "1h 48m · billable",
    module: "time",
    when: "12m",
    icon: ICON_CHECK,
    iconBg: "bg-emerald-500/15 text-emerald-200 ring-emerald-500/30",
  },
  {
    title: "April payslip is ready",
    body: "Net £4,120 · paid on the 28th",
    module: "payroll",
    when: "2h",
    icon: ICON_BELL,
    iconBg: "bg-sky-500/15 text-sky-200 ring-sky-500/30",
  },
];
</script>
