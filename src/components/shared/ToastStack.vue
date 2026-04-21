<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-0 top-0 z-[240] flex max-w-[min(100vw-1rem,20rem)] flex-col gap-2 p-3 sm:p-4"
      aria-live="polite"
    >
      <TransitionGroup name="toast-stack">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] shadow-md backdrop-blur-md"
          :class="toastClass(t.type)"
          role="status"
        >
          <span
            class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
            :class="iconBg(t.type)"
            aria-hidden="true"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <g v-html="iconPaths(t)" />
            </svg>
          </span>
          <p class="min-w-0 flex-1 leading-snug">{{ t.message }}</p>
          <button
            type="button"
            class="shrink-0 rounded-md p-1 text-current opacity-50 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            aria-label="Dismiss"
            @click="dismiss(t.id)"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from "@/composables/useToast.js";
import { getToastIconPaths } from "@/utils/toastIcons.js";

const { toasts, dismiss } = useToast();

function iconPaths(t) {
  return getToastIconPaths({
    module: t.module,
    action: t.action,
    type: t.type,
  });
}

function toastClass(type) {
  switch (type) {
    case "success":
      return "bg-white text-slate-800 ring-1 ring-emerald-200/70 dark:bg-slate-900 dark:text-slate-50 dark:ring-emerald-500/25";
    case "error":
      return "bg-white text-slate-800 ring-1 ring-rose-200/70 dark:bg-slate-900 dark:text-slate-50 dark:ring-rose-500/25";
    default:
      return "bg-white text-slate-800 ring-1 ring-slate-200/80 dark:bg-slate-900 dark:text-slate-50 dark:ring-white/10";
  }
}

function iconBg(type) {
  switch (type) {
    case "success":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300";
    case "error":
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300";
    default:
      return "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300";
  }
}
</script>

<style scoped>
.toast-stack-enter-active {
  transition:
    opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-stack-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}
.toast-stack-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
.toast-stack-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
.toast-stack-move {
  transition: transform 0.2s ease;
}
</style>
