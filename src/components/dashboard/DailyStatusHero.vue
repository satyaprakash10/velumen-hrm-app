<template>
  <section
    class="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-[#0c1929] to-sky-950 p-6 text-white shadow-xl ring-1 ring-white/10 md:p-8 dark:from-slate-950 dark:via-[#0a1628] dark:to-sky-950/80"
  >
    <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" aria-hidden="true" />

    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-200/80">Today</p>
        <h2 class="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
          <span class="text-white">{{ greeting }}, {{ firstName }}</span>
        </h2>
        <p class="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">“{{ quote }}”</p>
        <p class="mt-2 text-xs text-slate-500">Rule-based daily line — no AI, no tracking cookies.</p>
      </div>
      <div class="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#0c1929] shadow-lg transition hover:bg-sky-50"
          @click="openTimerAndStart"
        >
          <svg class="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start timer
        </button>
        <router-link
          to="/timesheet"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
        >
          Log time manually
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import quotes from "@/data/dailyQuotes.json";
import { useAuth } from "@/composables/useAuth.js";
import { useUser } from "@/composables/useUser.js";
import { useTimeTracker } from "@/composables/useTimeTracker.js";

const { user } = useAuth();
const { displayName } = useUser();
const { start, minimized, isIdle } = useTimeTracker();

const fullName = computed(() => user.value?.name || displayName.value || "there");

const firstName = computed(() => {
  const n = fullName.value.trim();
  return n.split(/\s+/)[0] || "there";
});

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
});

const quote = computed(() => {
  const d = new Date();
  const seed = d.getFullYear() * 1000 + (d.getMonth() + 1) * 50 + d.getDate();
  const idx = Math.abs(seed) % quotes.length;
  return quotes[idx] || quotes[0];
});

function openTimerAndStart() {
  minimized.value = false;
  if (isIdle.value) start("Focused work");
}
</script>
