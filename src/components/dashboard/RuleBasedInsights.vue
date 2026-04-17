<template>
  <section
    v-if="insights.length"
    class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
  >
    <div class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-navy dark:text-slate-100">Local insights</h2>
        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Deterministic tips from your data in this browser — not AI-generated.
        </p>
      </div>
      <span
        class="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
      >
        AI-free
      </span>
    </div>
    <ul class="mt-4 space-y-3">
      <li
        v-for="item in insights"
        :key="item.key"
        class="flex gap-3 rounded-xl border px-4 py-3"
        :class="toneClass(item.tone)"
      >
        <span class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current opacity-60" aria-hidden="true" />
        <div class="min-w-0">
          <p class="text-sm font-semibold">{{ item.title }}</p>
          <p class="mt-1 text-xs opacity-90">{{ item.body }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { useLocalInsights } from "@/composables/useLocalInsights.js";

const { insights } = useLocalInsights();

function toneClass(tone) {
  const map = {
    amber: "border-amber-200 bg-amber-50/80 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100",
    sky: "border-sky-200 bg-sky-50/80 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100",
    slate: "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100",
    emerald: "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100",
  };
  return map[tone] || map.slate;
}
</script>
