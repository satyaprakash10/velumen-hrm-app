<template>
  <div class="h-full overflow-hidden p-4 sm:p-6">
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Leaves</p>
      <p class="text-[10px] text-slate-500">Annual · UTC+0</p>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3">
      <div
        v-for="s in summary"
        :key="s.label"
        class="rounded-xl border border-white/5 bg-white/[0.03] p-3"
      >
        <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{{ s.label }}</p>
        <p class="mt-1 text-xl font-bold tabular-nums text-white">{{ s.value }}</p>
        <p class="mt-1 text-[10px] text-slate-500">{{ s.hint }}</p>
      </div>
    </div>

    <div class="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
      <div class="flex items-center justify-between">
        <p class="text-[11px] font-semibold text-white">Upcoming absences</p>
        <p class="text-[10px] text-slate-500">{{ rows.length }} requests</p>
      </div>
      <ul class="mt-3 space-y-2">
        <li
          v-for="r in rows"
          :key="r.who"
          class="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
        >
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" :class="r.avatar">
            {{ r.initials }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[11.5px] font-semibold text-white">{{ r.who }}</p>
            <p class="truncate text-[10.5px] text-slate-400">{{ r.range }} · {{ r.type }}</p>
          </div>
          <span
            class="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            :class="r.statusClass"
          >
            {{ r.status }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const summary = [
  { label: "Taken", value: "8 d", hint: "YTD" },
  { label: "Approved", value: "3 d", hint: "pending start" },
  { label: "Remaining", value: "14 d", hint: "out of 25" },
];
const rows = [
  {
    who: "Jamie Lee",
    initials: "JL",
    avatar: "bg-gradient-to-br from-sky-400 to-indigo-500",
    range: "May 12 – May 16",
    type: "Annual",
    status: "Approved",
    statusClass: "bg-emerald-500/15 text-emerald-300",
  },
  {
    who: "Taylor Kim",
    initials: "TK",
    avatar: "bg-gradient-to-br from-fuchsia-400 to-violet-500",
    range: "May 20",
    type: "Sick",
    status: "Pending",
    statusClass: "bg-amber-500/15 text-amber-300",
  },
  {
    who: "Alex Morgan",
    initials: "AM",
    avatar: "bg-gradient-to-br from-emerald-400 to-teal-500",
    range: "Jun 3 – Jun 7",
    type: "WFH",
    status: "Review",
    statusClass: "bg-sky-500/15 text-sky-300",
  },
];
</script>
