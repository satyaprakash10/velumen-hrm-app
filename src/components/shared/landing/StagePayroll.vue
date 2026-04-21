<template>
  <div class="h-full overflow-hidden p-4 sm:p-6">
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Payslips</p>
      <p class="text-[10px] text-slate-500">Paid on the 28th</p>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3">
      <div class="col-span-2 rounded-xl border border-white/5 bg-gradient-to-br from-sky-500/15 via-indigo-500/10 to-transparent p-4">
        <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-200">April net pay</p>
        <p class="mt-1 text-3xl font-bold tabular-nums text-white">£4,120.50</p>
        <p class="mt-1 text-[11px] text-slate-300">Gross £5,300 · Tax £860 · NI £320</p>
        <div class="mt-3 flex gap-1.5">
          <span
            v-for="b in bars"
            :key="b.label"
            class="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="b.dot" />
            {{ b.label }}
          </span>
        </div>
      </div>
      <div class="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
        <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">YTD</p>
        <p class="mt-1 text-xl font-bold tabular-nums text-white">£16,482</p>
        <p class="mt-1 text-[10px] text-slate-500">4 payslips</p>
        <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <span class="block h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style="width: 33%" />
        </div>
      </div>
    </div>

    <div class="mt-4 overflow-hidden rounded-xl border border-white/5 bg-white/[0.03]">
      <table class="w-full text-left text-[11px] text-slate-300">
        <thead>
          <tr class="border-b border-white/5 bg-white/[0.02]">
            <th class="px-3 py-2 font-semibold">Period</th>
            <th class="px-3 py-2 font-semibold text-slate-400">Gross</th>
            <th class="px-3 py-2 font-semibold text-slate-400">Net</th>
            <th class="px-3 py-2 text-right font-semibold text-slate-400">Slip</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in payslips" :key="r.period" class="border-b border-white/5 last:border-0">
            <td class="px-3 py-2 font-semibold text-white">{{ r.period }}</td>
            <td class="px-3 py-2 tabular-nums">{{ r.gross }}</td>
            <td class="px-3 py-2 tabular-nums text-white">{{ r.net }}</td>
            <td class="px-3 py-2 text-right">
              <span class="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-sky-200">
                <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 2v9m0 0l-3-3m3 3l3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M3 13h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                </svg>
                PDF
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const bars = [
  { label: "Base", dot: "bg-sky-400" },
  { label: "Bonus", dot: "bg-violet-400" },
  { label: "Expenses", dot: "bg-emerald-400" },
];
const payslips = [
  { period: "Apr 2025", gross: "£5,300", net: "£4,120.50" },
  { period: "Mar 2025", gross: "£5,120", net: "£3,982.00" },
  { period: "Feb 2025", gross: "£5,120", net: "£3,982.00" },
  { period: "Jan 2025", gross: "£5,120", net: "£3,982.00" },
];
</script>
