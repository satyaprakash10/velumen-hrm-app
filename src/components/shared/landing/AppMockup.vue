<template>
  <div class="relative">
    <!-- Ambient glow behind the preview -->
    <div
      class="pointer-events-none absolute -inset-6 rounded-[48px] bg-gradient-to-br from-sky-500/20 via-indigo-500/10 to-fuchsia-500/20 blur-3xl"
      aria-hidden="true"
    />

    <!-- Primary: main dashboard-style screenshot -->
    <div
      class="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70 p-2 shadow-[0_40px_120px_rgba(2,6,23,0.55)] backdrop-blur-xl"
    >
      <div class="rounded-2xl border border-white/5 bg-gradient-to-b from-slate-950 to-slate-900">
        <!-- Window chrome -->
        <div class="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
          <span class="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
          <span class="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span class="mx-3 truncate text-[11px] font-semibold text-slate-500">
            {{ brand }} workspace · Task board
          </span>
          <span class="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        <!-- Real screenshot stage + inset timer modal (square, bottom-right) -->
        <div class="relative h-[340px] w-full overflow-hidden sm:h-[420px] md:h-[480px]">
          <StageScreenshot
            :src="dashboardShot"
            :alt="`${brand} workspace — task board`"
            eager
            fill
          />

          <!--
            Timer confirm / entry modal — cropped to the dialog only via object-position + scale.
            Sits in a square tile at the bottom-right, above the main board art.
          -->
          <div
            class="floating-modal pointer-events-none absolute bottom-2 right-2 z-20 sm:bottom-3 sm:right-3 md:bottom-4 md:right-4"
            aria-hidden="true"
          >
            <div
              class="relative aspect-square w-[7.25rem] overflow-hidden rounded-2xl border border-white/20 bg-slate-950/90 shadow-[0_22px_55px_rgba(2,6,23,0.75)] ring-1 ring-white/15 sm:w-[8.25rem] md:w-36"
            >
              <StageScreenshot
                :src="modalShot"
                :alt="`${brand} — timer entry confirmation modal`"
                eager
                fill
                img-class="scale-[2.35] sm:scale-[2.2] md:scale-[2.05] origin-[56%_44%]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- "Real UI" reassurance badge -->
    <div
      class="absolute -bottom-4 left-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/90 px-3 py-2 text-[11px] font-semibold text-slate-200 shadow-lg backdrop-blur-md sm:-bottom-5 sm:left-6"
    >
      <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
        <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M5 8l2.2 2.2L11.4 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </span>
      <span>Real product UI · not a mockup</span>
    </div>
  </div>
</template>

<script setup>
import { BRAND } from "@/config/brand.js";
import StageScreenshot from "@/components/shared/landing/StageScreenshot.vue";

const brand = BRAND.name;
const dashboardShot = "/landing/task-board.png";
/** Full-page export is zoomed/cropped in the hero tile so only the modal reads. */
const modalShot = "/landing/time-detail.png";
</script>

<style scoped>
.floating-modal {
  animation: drift 9s ease-in-out infinite;
  will-change: transform;
}

@keyframes drift {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .floating-modal {
    animation: none;
  }
}
</style>
