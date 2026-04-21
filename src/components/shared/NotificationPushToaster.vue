<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-[245] flex justify-center px-3 pt-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:justify-end sm:px-0 sm:pt-0"
      aria-live="polite"
    >
      <TransitionGroup name="push-stack" tag="div" class="flex w-full max-w-[22rem] flex-col items-stretch gap-2 sm:w-[22rem]">
        <article
          v-for="p in queue"
          :key="p.id"
          class="push-card pointer-events-auto relative overflow-hidden rounded-2xl border bg-white/95 p-0 shadow-2xl ring-1 ring-black/[0.04] backdrop-blur-xl dark:bg-slate-900/95 dark:ring-white/10"
          :class="cardBorder(p.severity)"
          role="status"
        >
          <span
            class="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
            :class="accentBar(p.severity)"
            aria-hidden="true"
          />
          <div class="flex items-start gap-3 px-4 pb-3 pt-3.5">
            <div
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1"
              :class="iconWrap(p.severity)"
              aria-hidden="true"
            >
              <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="iconFor(p)" />
            </div>
            <div class="min-w-0 flex-1">
              <header class="flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                    {{ categoryLabel(p.category) }}
                    <span v-if="p.module" class="ml-1 font-semibold text-slate-400 dark:text-slate-500">· {{ p.module }}</span>
                  </p>
                  <h3 class="mt-0.5 truncate text-[13.5px] font-semibold text-slate-900 dark:text-slate-50">
                    {{ p.title }}
                  </h3>
                </div>
                <button
                  type="button"
                  class="-mr-1 -mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
                  :aria-label="`Dismiss ${p.title}`"
                  @click="close(p.id)"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              <p v-if="p.body" class="mt-1 line-clamp-2 text-[12px] leading-snug text-slate-600 dark:text-slate-400">
                {{ p.body }}
              </p>
              <div class="mt-2 flex items-center gap-2">
                <button
                  v-if="p.to"
                  type="button"
                  class="inline-flex h-7 items-center gap-1 rounded-md bg-slate-900 px-2 text-[11px] font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  @click="openItem(p)"
                >
                  View
                  <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="inline-flex h-7 items-center rounded-md px-2 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  @click="markRead(p.id); close(p.id)"
                >
                  Mark read
                </button>
                <span class="ml-auto text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
                  just now
                </span>
              </div>
            </div>
          </div>
          <div class="h-[3px] w-full overflow-hidden bg-slate-100 dark:bg-slate-800" aria-hidden="true">
            <span
              class="push-progress block h-full"
              :class="progressBar(p.severity)"
            />
          </div>
        </article>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useNotificationCenter } from "@/composables/useNotificationCenter.js";
import { useAppSettings } from "@/composables/useAppSettings.js";

const router = useRouter();
const { lastPush, markRead, panelOpen } = useNotificationCenter();
const { settings } = useAppSettings();

const AUTO_DISMISS_MS = 6200;
const MAX_VISIBLE = 3;
const queue = ref([]);
const timers = new Map();
const seen = new Set();
const visible = ref(true);

watch(
  lastPush,
  (item) => {
    if (!item) return;
    if (seen.has(item.id)) return;
    seen.add(item.id);

    if (!settings.notifications.enablePush) return;
    if (!settings.notifications.channels?.[item.category]) return;
    if (panelOpen.value) return;
    if (!visible.value) return;

    queue.value = [...queue.value, item].slice(-MAX_VISIBLE);
    if (settings.notifications.enableSound) ping();
    const t = window.setTimeout(() => close(item.id), AUTO_DISMISS_MS);
    timers.set(item.id, t);
  },
  { flush: "post" },
);

function close(id) {
  queue.value = queue.value.filter((p) => p.id !== id);
  const t = timers.get(id);
  if (t) {
    window.clearTimeout(t);
    timers.delete(id);
  }
}

function openItem(p) {
  markRead(p.id);
  close(p.id);
  if (p.to) router.push(p.to).catch(() => {});
}

function onVisibility() {
  visible.value = document.visibilityState === "visible";
}

onMounted(() => {
  visible.value = document.visibilityState === "visible";
  document.addEventListener("visibilitychange", onVisibility);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", onVisibility);
  for (const t of timers.values()) window.clearTimeout(t);
  timers.clear();
});

function categoryLabel(cat) {
  switch (cat) {
    case "auth":
      return "Security";
    case "system":
      return "System";
    default:
      return "Activity";
  }
}

function cardBorder(sev) {
  switch (sev) {
    case "success":
      return "border-emerald-200/80 dark:border-emerald-900/60";
    case "warning":
      return "border-amber-200/80 dark:border-amber-900/60";
    case "error":
      return "border-rose-200/80 dark:border-rose-900/60";
    default:
      return "border-sky-200/80 dark:border-sky-900/60";
  }
}

function accentBar(sev) {
  switch (sev) {
    case "success":
      return "bg-gradient-to-b from-emerald-400 to-emerald-600";
    case "warning":
      return "bg-gradient-to-b from-amber-400 to-orange-500";
    case "error":
      return "bg-gradient-to-b from-rose-400 to-rose-600";
    default:
      return "bg-gradient-to-b from-sky-400 to-indigo-500";
  }
}

function iconWrap(sev) {
  switch (sev) {
    case "success":
      return "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900/60";
    case "warning":
      return "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900/60";
    case "error":
      return "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900/60";
    default:
      return "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900/60";
  }
}

function progressBar(sev) {
  switch (sev) {
    case "success":
      return "bg-gradient-to-r from-emerald-400 to-emerald-600";
    case "warning":
      return "bg-gradient-to-r from-amber-400 to-orange-500";
    case "error":
      return "bg-gradient-to-r from-rose-400 to-rose-600";
    default:
      return "bg-gradient-to-r from-sky-400 to-indigo-500";
  }
}

const ICON_SUCCESS = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M5.2 8.3l2 2 3.6-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_WARNING = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.5l6 11H2L8 2.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.7" r="0.9" fill="currentColor"/></svg>`;
const ICON_ERROR = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
const ICON_BELL = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.55 9.43C12.44 9.43 13.94 4.48 10 3.27 10 1.95 9.12 1 8 1S6 1.95 6 3.27C2.07 4.49 3.58 9.43 2.47 9.43 1.62 9.43 1 10.25 1 11.28S1.6 13 2.33 13h11.34C14.4 13 15 12.31 15 11.28s-.62-1.85-1.45-1.85z" stroke="currentColor" stroke-width="1.3"/></svg>`;

function iconFor(p) {
  if (p.severity === "success") return ICON_SUCCESS;
  if (p.severity === "warning") return ICON_WARNING;
  if (p.severity === "error") return ICON_ERROR;
  return ICON_BELL;
}

function ping() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.07, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.26);
    o.onended = () => ctx.close().catch(() => {});
  } catch {
    /* soft chime is best-effort */
  }
}
</script>

<style scoped>
.push-card {
  --push-progress-duration: 6200ms;
}

.push-progress {
  width: 100%;
  transform-origin: left;
  animation: push-shrink var(--push-progress-duration) linear forwards;
}

@keyframes push-shrink {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}

.push-stack-enter-active {
  transition:
    opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.push-stack-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.push-stack-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.96);
}
.push-stack-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.98);
}
.push-stack-move {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
