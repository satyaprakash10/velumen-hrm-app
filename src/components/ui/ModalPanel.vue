<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[10200] flex items-end justify-center bg-slate-900/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
        role="presentation"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          leave-active-class="transition duration-150 ease-in"
          enter-from-class="opacity-0 translate-y-3 sm:translate-y-0 sm:scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 sm:scale-100"
          leave-from-class="opacity-100 translate-y-0 sm:scale-100"
          leave-to-class="opacity-0 translate-y-2 sm:scale-[0.99]"
        >
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="$slots.subtitle ? subtitleId : undefined"
            class="modal-card w-full overflow-hidden rounded-t-2xl border border-slate-200/90 bg-white shadow-[0_24px_80px_-12px_rgba(15,23,42,0.35)] ring-1 ring-slate-900/[0.06] dark:border-slate-700/90 dark:bg-slate-900 dark:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.55)] dark:ring-white/[0.08] sm:rounded-2xl"
            :class="
              isExpanded
                ? 'max-h-[min(94vh,960px)] max-w-4xl'
                : 'max-h-[min(92vh,760px)] max-w-lg'
            "
            @click.stop
          >
            <div class="accent-gradient h-1 w-full" aria-hidden="true" />
            <header
              class="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-5 pb-4 pt-5 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900 sm:px-6"
            >
              <div class="flex min-w-0 flex-1 items-start gap-3">
                <span
                  v-if="$slots.icon || icon"
                  class="accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  aria-hidden="true"
                >
                  <slot name="icon">
                    <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="icon" />
                  </slot>
                </span>
                <div class="min-w-0 flex-1">
                  <h2 :id="titleId" class="text-lg font-semibold tracking-tight text-[#001738] dark:text-slate-100">
                    <slot name="title">Details</slot>
                  </h2>
                <div
                  v-if="$slots.badges"
                  class="mt-2.5 flex flex-wrap items-center gap-2"
                  aria-label="Status"
                >
                  <slot name="badges" />
                </div>
                  <p
                    v-if="$slots.subtitle"
                    :id="subtitleId"
                    class="text-sm leading-snug text-slate-500 dark:text-slate-400"
                    :class="$slots.badges ? 'mt-2' : 'mt-1.5'"
                  >
                    <slot name="subtitle" />
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-1 sm:gap-2">
                <div v-if="$slots.actions" class="flex items-center" @click.stop>
                  <slot name="actions" />
                </div>
                <button
                  v-if="expandable"
                  type="button"
                  class="hidden rounded-xl p-2 text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:inline-flex"
                  :aria-label="isExpanded ? 'Collapse modal' : 'Expand modal'"
                  :aria-pressed="isExpanded"
                  @click="toggleExpanded"
                >
                  <svg
                    v-if="!isExpanded"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
                  </svg>
                  <svg
                    v-else
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-200/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label="Close"
                  @click="close"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </header>
            <div
              v-ess-scrollbar
              class="modal-body overflow-y-auto px-5 py-5 text-sm leading-relaxed text-slate-700 dark:text-slate-200 sm:px-6"
              :class="
                isExpanded
                  ? 'max-h-[min(78vh,780px)]'
                  : 'max-h-[min(72vh,560px)]'
              "
            >
              <slot />
            </div>
            <footer
              v-if="$slots.footer"
              class="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4 dark:border-slate-800 dark:bg-slate-950/40 sm:flex-row sm:justify-end sm:px-6"
            >
              <slot name="footer" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onUnmounted, ref, useId, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /**
   * Optional inline SVG for the header icon chip. Prefer the `icon` slot
   * when you need more than a simple markup string.
   */
  icon: { type: String, default: "" },
  /**
   * When true, the header shows a maximize / minimize button that toggles
   * the modal between its default width and a wider layout with a smooth
   * transition. Expansion resets automatically when the modal closes.
   */
  expandable: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const titleId = useId();
const subtitleId = useId();

const isExpanded = ref(false);

function toggleExpanded() {
  isExpanded.value = !isExpanded.value;
}

function close() {
  emit("update:modelValue", false);
}

let escHandler = null;

watch(
  () => props.modelValue,
  (open) => {
    if (escHandler) {
      document.removeEventListener("keydown", escHandler);
      escHandler = null;
    }
    if (open) {
      escHandler = (e) => {
        if (e.key === "Escape") close();
      };
      document.addEventListener("keydown", escHandler);
    } else {
      // Reset the size the moment the modal closes so the next open always
      // starts from the compact layout — less surprising than remembering
      // a previous session's state.
      isExpanded.value = false;
    }
  },
);

onUnmounted(() => {
  if (escHandler) document.removeEventListener("keydown", escHandler);
});
</script>

<style scoped>
/*
 * Smooth size transition when toggling the expand button. We animate the
 * max-width / max-height so the card grows in place instead of snapping.
 */
.modal-card {
  transition:
    max-width 0.32s cubic-bezier(0.16, 1, 0.3, 1),
    max-height 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-body {
  transition: max-height 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .modal-card,
  .modal-body {
    transition: none;
  }
}
</style>
