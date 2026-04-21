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
        class="fixed inset-0 z-[10100] flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-[2px] sm:p-6"
        role="presentation"
        @click.self="onCancel"
      >
        <Transition
          enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          leave-active-class="transition duration-150 ease-in"
          enter-from-class="opacity-0 translate-y-2 scale-[0.97]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-[0.98]"
        >
          <!--
            Compact confirmation modal: icon-led header, clean body, and
            small balanced buttons instead of the old full-width bars.
          -->
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descId"
            class="confirm-dialog relative w-full max-w-[380px] overflow-hidden rounded-2xl bg-white shadow-[0_18px_48px_rgba(2,6,23,0.22)] ring-1 ring-slate-900/[0.06] dark:bg-slate-900 dark:ring-white/10"
            @click.stop
          >
            <span
              class="pointer-events-none absolute inset-x-0 top-0 h-1"
              :class="accentBar"
              aria-hidden="true"
            />
            <header class="flex items-start gap-3 px-5 pt-5">
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                :class="iconWrap"
                aria-hidden="true"
              >
                <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="headerIcon" />
              </span>
              <div class="min-w-0 flex-1">
                <h2
                  :id="titleId"
                  class="text-[15px] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-50"
                >
                  {{ title }}
                </h2>
                <p
                  :id="descId"
                  class="mt-1.5 text-[13px] leading-relaxed text-slate-600 dark:text-slate-400"
                >
                  {{ message }}
                </p>
              </div>
              <button
                type="button"
                class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close"
                @click="onCancel"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>
            <footer class="flex items-center justify-end gap-2 px-5 pb-5 pt-4">
              <button
                type="button"
                class="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="onCancel"
              >
                {{ cancelLabel }}
              </button>
              <button
                ref="confirmRef"
                type="button"
                class="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-3 text-[12px] font-semibold text-white shadow-sm transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-900"
                :class="confirmButtonClass"
                @click="onConfirm"
              >
                <span class="h-3 w-3 [&>svg]:h-full [&>svg]:w-full" aria-hidden="true" v-html="confirmIcon" />
                {{ confirmLabel }}
              </button>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, useId, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: "Confirm" },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: "Confirm" },
  cancelLabel: { type: String, default: "Cancel" },
  variant: { type: String, default: "primary" },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const titleId = useId();
const descId = useId();
const confirmRef = ref(null);

const isDanger = computed(() => props.variant === "danger");

const accentBar = computed(() =>
  isDanger.value
    ? "bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600"
    : "accent-gradient",
);

const iconWrap = computed(() =>
  isDanger.value
    ? "bg-rose-50 text-rose-600 ring-1 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/60"
    : "accent-soft ring-1 ring-[color:var(--accent-fg)]/20",
);

const confirmButtonClass = computed(() =>
  isDanger.value
    ? "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-500 dark:bg-rose-500 dark:hover:bg-rose-600"
    : "accent-bg focus-visible:ring-[color:var(--accent-fg)]",
);

const DANGER_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 17h.01"/><path stroke-linecap="round" stroke-linejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`;
const PRIMARY_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>`;
const CONFIRM_ICON_DANGER = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 6h10M12 6v7.5a.5.5 0 01-.5.5H4.5a.5.5 0 01-.5-.5V6m2 0V4a1 1 0 011-1h2a1 1 0 011 1v2"/></svg>`;
const CONFIRM_ICON_PRIMARY = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 8.5l2.5 2.5L12 5.5"/></svg>`;

const headerIcon = computed(() => (isDanger.value ? DANGER_ICON : PRIMARY_ICON));
const confirmIcon = computed(() =>
  isDanger.value ? CONFIRM_ICON_DANGER : CONFIRM_ICON_PRIMARY,
);

function close() {
  emit("update:modelValue", false);
}

function onCancel() {
  emit("cancel");
  close();
}

function onConfirm() {
  emit("confirm");
  close();
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
        if (e.key === "Escape") onCancel();
        else if (e.key === "Enter") onConfirm();
      };
      document.addEventListener("keydown", escHandler);
      nextTick(() => confirmRef.value?.focus());
    }
  },
);

onUnmounted(() => {
  if (escHandler) document.removeEventListener("keydown", escHandler);
});
</script>
