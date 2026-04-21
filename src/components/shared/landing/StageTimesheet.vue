<template>
  <div class="h-full overflow-hidden p-4 sm:p-6">
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Timesheet</p>
      <p class="text-[10px] text-slate-500">Week 18 · Mon – Sun</p>
    </div>

    <div class="mt-4 overflow-hidden rounded-xl border border-white/5 bg-white/[0.03]">
      <table class="w-full text-left text-[11px] text-slate-300">
        <thead>
          <tr class="border-b border-white/5 bg-white/[0.02]">
            <th class="px-3 py-2 font-semibold">Project</th>
            <th v-for="d in days" :key="d" class="px-2 py-2 text-center font-semibold text-slate-400">{{ d }}</th>
            <th class="px-3 py-2 text-right font-semibold text-slate-400">Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.project" class="border-b border-white/5 last:border-0">
            <td class="whitespace-nowrap px-3 py-2 font-semibold text-white">{{ row.project }}</td>
            <td
              v-for="(h, i) in row.hours"
              :key="i"
              class="px-2 py-2 text-center tabular-nums"
              :class="h > 0 ? 'text-slate-100' : 'text-slate-600'"
            >
              {{ h > 0 ? `${h}h` : "—" }}
            </td>
            <td class="px-3 py-2 text-right font-semibold text-white tabular-nums">{{ total(row.hours) }}h</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex items-center justify-between rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2.5">
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20">
          <span class="absolute inset-0 animate-ping rounded-full bg-sky-400/40" />
          <svg class="relative h-3.5 w-3.5 text-sky-200" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
            <path d="M8 5v3l2 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
        <div>
          <p class="text-[11px] font-semibold text-white">Timer running · Payroll revamp</p>
          <p class="text-[10px] text-sky-200/80">Started at 13:04 · persists on refresh</p>
        </div>
      </div>
      <span class="text-[12px] font-bold tabular-nums text-white">01:48:12</span>
    </div>
  </div>
</template>

<script setup>
const days = ["M", "T", "W", "T", "F", "S", "S"];
const rows = [
  { project: "Payroll revamp", hours: [2.5, 3, 2, 1.5, 0, 0, 0] },
  { project: "Notification v2", hours: [1, 2, 3, 2, 2, 0, 0] },
  { project: "HR onboarding", hours: [0, 1, 2, 1, 1, 0, 0] },
];
function total(arr) {
  return arr.reduce((a, b) => a + b, 0);
}
</script>
