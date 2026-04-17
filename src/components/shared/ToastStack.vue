<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-0 top-0 z-[240] flex max-w-[min(100vw-1rem,22rem)] flex-col gap-3 p-4 sm:p-5"
      aria-live="polite"
    >
      <TransitionGroup name="toast-stack">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm shadow-2xl backdrop-blur-md transition-[transform,opacity] duration-200"
          :class="toastClass(t.type)"
          role="status"
        >
          <span
            class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/80 text-current shadow-sm ring-1 ring-black/5 dark:bg-slate-800/90 dark:ring-white/10"
            aria-hidden="true"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <g v-html="iconPaths(t)" />
            </svg>
          </span>
          <p class="min-w-0 flex-1 pt-0.5 leading-snug">{{ t.message }}</p>
          <button
            type="button"
            class="shrink-0 rounded-lg p-1.5 text-current opacity-60 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            aria-label="Dismiss"
            @click="dismiss(t.id)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
      return "border-emerald-200/80 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500/15 dark:border-emerald-800/80 dark:bg-emerald-950/85 dark:text-emerald-50 dark:ring-emerald-400/20";
    case "error":
      return "border-red-200/80 bg-red-50/90 text-red-950 ring-1 ring-red-500/15 dark:border-red-900/80 dark:bg-red-950/85 dark:text-red-50 dark:ring-red-400/20";
    default:
      return "border-slate-200/80 bg-white/90 text-slate-900 ring-1 ring-slate-900/5 dark:border-slate-700/90 dark:bg-slate-900/90 dark:text-slate-50 dark:ring-white/10";
  }
}
</script>

<style scoped>
.toast-stack-enter-active {
  transition:
    opacity 0.28s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-stack-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.toast-stack-enter-from {
  opacity: 0;
  transform: translateX(16px) translateY(-6px) scale(0.96);
}
.toast-stack-leave-to {
  opacity: 0;
  transform: translateX(12px) scale(0.98);
}
.toast-stack-move {
  transition: transform 0.24s ease;
}
</style>
