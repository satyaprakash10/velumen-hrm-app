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
        class="fixed inset-0 z-[10100] flex items-center justify-center bg-black/40 p-4 sm:p-6"
        role="presentation"
        @click.self="onCancel"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          leave-active-class="transition duration-150 ease-in"
          enter-from-class="opacity-0 translate-y-2 scale-[0.98]"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-[0.98]"
        >
          <div
            v-if="modelValue"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="titleId"
            :aria-describedby="descId"
            class="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_16px_48px_rgba(26,51,91,0.14)] ring-1 ring-black/[0.06] dark:bg-slate-900 dark:ring-white/10 sm:p-8"
            @click.stop
          >
            <h2
              :id="titleId"
              class="text-lg font-bold leading-tight tracking-tight text-navy dark:text-slate-100"
            >
              {{ title }}
            </h2>
            <p
              :id="descId"
              class="mt-3 text-sm leading-relaxed text-gray-600 dark:text-slate-300"
            >
              {{ message }}
            </p>
            <div
              class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
            >
              <button
                type="button"
                class="inline-flex h-11 w-full items-center justify-center rounded-xl border border-subtle-02 bg-white px-5 text-sm font-semibold text-navy transition hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:w-auto"
                @click="onCancel"
              >
                {{ cancelLabel }}
              </button>
              <button
                type="button"
                class="inline-flex h-11 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:w-auto"
                :class="
                  variant === 'danger'
                    ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600'
                    : 'bg-navy hover:bg-navy/90 focus-visible:ring-navy/40 dark:bg-sky-600 dark:hover:bg-sky-500'
                "
                @click="onConfirm"
              >
                {{ confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useId, watch, onUnmounted } from "vue";

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
      };
      document.addEventListener("keydown", escHandler);
    }
  },
);

onUnmounted(() => {
  if (escHandler) document.removeEventListener("keydown", escHandler);
});
</script>
