<template>
  <div class="relative h-full overflow-hidden p-4 sm:p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Dashboard</p>
        <p class="mt-1 text-[14px] font-semibold text-white">Welcome back, Alex</p>
      </div>
      <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Online
      </span>
    </div>

    <div class="mt-4 grid grid-cols-3 gap-3">
      <div
        v-for="(tile, i) in tiles"
        :key="tile.label"
        class="rounded-xl border border-white/5 bg-white/[0.03] p-3"
        :style="{ animationDelay: `${i * 60}ms` }"
      >
        <p class="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">{{ tile.label }}</p>
        <p class="mt-1.5 text-xl font-bold tabular-nums text-white">{{ tile.value }}</p>
        <p class="mt-1 text-[10px] text-slate-500">{{ tile.hint }}</p>
      </div>
    </div>

    <div class="mt-4 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
      <div class="flex items-center justify-between">
        <p class="text-[11px] font-semibold text-white">Hours · last 7 days</p>
        <p class="text-[10px] text-slate-500">32.4h</p>
      </div>
      <div class="mt-3 flex h-20 items-end gap-1.5">
        <span
          v-for="(h, i) in bars"
          :key="i"
          class="flex-1 rounded-t-md bg-gradient-to-t from-sky-500/30 via-sky-400/60 to-indigo-400/80"
          :style="{ height: `${h}%` }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const tiles = [
  { label: "Payslip (net)", value: "£4,120", hint: "April cycle" },
  { label: "Leave balance", value: "14 d", hint: "5 pending" },
  { label: "Tasks in flight", value: "7", hint: "2 blocked" },
];
const bars = [40, 55, 30, 70, 60, 82, 48];
</script>
