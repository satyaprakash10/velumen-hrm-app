<template>
  <div class="relative flex min-h-screen overflow-hidden bg-slate-950 text-slate-100">
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.22),transparent),radial-gradient(ellipse_60%_40%_at_100%_50%,rgba(99,102,241,0.12),transparent)]"
      aria-hidden="true"
    />

    <aside
      class="relative hidden w-[min(52%,640px)] shrink-0 flex-col justify-between border-r border-white/10 bg-gradient-to-b from-slate-900/95 to-slate-950 p-10 lg:flex xl:p-14"
    >
      <div>
        <RouterLink to="/login" class="inline-flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/20">
            <img src="/logo-mark.svg" :alt="brandName" class="h-9 w-9 object-contain" width="36" height="36" />
          </span>
          <span class="text-lg font-bold tracking-tight text-white">{{ brandTitle }}</span>
        </RouterLink>
        <p class="mt-8 max-w-md text-sm leading-relaxed text-slate-400">
          One place for time, payslips, leave, and tasks — built for teams who want clarity without clutter.
        </p>
      </div>

      <div class="mt-12 space-y-4">
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Inside the app</p>
        <div class="grid gap-3">
          <div
            class="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur transition hover:border-sky-500/30"
          >
            <div class="mb-3 flex gap-2">
              <span class="h-2 w-2 rounded-full bg-red-400/80" />
              <span class="h-2 w-2 rounded-full bg-amber-400/80" />
              <span class="h-2 w-2 rounded-full bg-emerald-400/80" />
            </div>
            <div class="space-y-2 rounded-lg bg-slate-900/80 p-3 ring-1 ring-white/5">
              <div class="h-2 w-3/5 rounded bg-sky-500/40" />
              <div class="h-2 w-4/5 rounded bg-slate-600/60" />
              <div class="mt-3 grid grid-cols-3 gap-2">
                <div class="h-14 rounded-lg bg-gradient-to-br from-sky-500/20 to-transparent ring-1 ring-sky-400/20" />
                <div class="h-14 rounded-lg bg-slate-800/80 ring-1 ring-white/5" />
                <div class="h-14 rounded-lg bg-slate-800/80 ring-1 ring-white/5" />
              </div>
            </div>
            <p class="mt-3 text-xs font-medium text-slate-300">Dashboard &amp; insights</p>
          </div>
          <div
            class="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl backdrop-blur transition hover:border-indigo-500/30"
          >
            <div class="flex gap-2">
              <div class="h-16 flex-1 rounded-xl bg-slate-800/90 ring-1 ring-white/5" />
              <div class="h-16 flex-1 rounded-xl bg-slate-800/90 ring-1 ring-white/5" />
              <div class="h-16 flex-1 rounded-xl bg-gradient-to-b from-indigo-500/25 to-slate-900/80 ring-1 ring-indigo-400/25" />
            </div>
            <p class="mt-3 text-xs font-medium text-slate-300">Task board &amp; time</p>
          </div>
        </div>
      </div>

      <p class="mt-12 text-xs text-slate-500">Illustrative UI previews — not live data.</p>
    </aside>

    <main class="relative flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8">
      <div class="w-full max-w-[420px]">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";
import { BRAND } from "@/config/brand.js";

const brandName = BRAND.name;
const brandTitle = computed(() => `${BRAND.name} — ${BRAND.tagline}`);
</script>
