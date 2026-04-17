<template>
  <div ref="rootRef" class="relative">
    <span
      v-if="label"
      class="mb-1 block text-xs font-medium"
      :class="variant === 'dark' ? 'text-slate-400' : 'text-gray-600 dark:text-gray-400'"
      >{{ label }}</span
    >
    <button
      type="button"
      ref="btnRef"
      class="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm shadow-sm transition focus:outline-none focus:ring-2"
      :class="triggerClass"
      :aria-expanded="open"
      :aria-haspopup="listbox"
      @click.stop="open = !open"
    >
      <span class="min-w-0 truncate">{{ displayLabel }}</span>
      <svg
        class="h-4 w-4 shrink-0"
        :class="variant === 'dark' ? 'text-slate-400' : 'text-slate-400'"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-100 ease-in"
        enter-from-class="opacity-0 scale-[0.98] -translate-y-0.5"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ul
          v-if="open"
          ref="listRef"
          v-ess-scrollbar
          class="fixed z-[13000] max-h-56 min-w-[var(--lb-w,12rem)] overflow-auto rounded-xl border py-1 shadow-xl"
          :class="
            variant === 'dark'
              ? 'border-white/10 bg-slate-900 shadow-black/40'
              : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-900'
          "
          :style="floatingStyle"
          role="listbox"
        >
          <li v-for="opt in options" :key="String(opt.value)">
            <button
              type="button"
              role="option"
              class="flex w-full px-3 py-2 text-left text-sm"
              :class="
                variant === 'dark'
                  ? opt.value === modelValue
                    ? 'bg-sky-500/20 font-medium text-white'
                    : 'text-slate-200 hover:bg-white/10'
                  : opt.value === modelValue
                    ? 'bg-sky-50 font-medium text-slate-800 dark:bg-sky-950/50 dark:text-slate-100'
                    : 'text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800'
              "
              @click="pick(opt.value)"
            >
              {{ opt.label }}
            </button>
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";

const props = defineProps({
  modelValue: { type: [String, Number], default: "" },
  options: { type: Array, default: () => [] },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "Select…" },
  invalid: { type: Boolean, default: false },
  /** Use on dark auth panels (slate-900). */
  variant: { type: String, default: "default" },
});

const triggerClass = computed(() => {
  if (props.variant === "dark") {
    return props.invalid
      ? "border-2 border-red-400/80 bg-slate-950/80 text-white focus:ring-red-500/30"
      : "border border-white/10 bg-slate-950/80 text-white focus:border-sky-500/50 focus:ring-sky-500/25";
  }
  return props.invalid
    ? "border-2 border-red-500 bg-white focus:ring-red-500/30 dark:border-red-500 dark:bg-red-950/20"
    : "border-slate-200 bg-white focus:border-sky-500 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/25";
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const rootRef = ref(null);
const btnRef = ref(null);
const listRef = ref(null);

const listbox = "listbox";

const displayLabel = computed(() => {
  const o = props.options.find((x) => x.value === props.modelValue);
  return o?.label ?? props.placeholder;
});

const floatingStyle = ref({});

function positionList() {
  const b = btnRef.value?.getBoundingClientRect();
  if (!b) return;
  floatingStyle.value = {
    top: `${b.bottom + 6}px`,
    left: `${b.left}px`,
    width: `${b.width}px`,
    "--lb-w": `${b.width}px`,
  };
}

function pick(v) {
  emit("update:modelValue", v);
  open.value = false;
}

watch(open, (v) => {
  if (v) {
    nextTick(() => {
      positionList();
      queueMicrotask(() => document.addEventListener("pointerdown", onDoc, true));
    });
  } else {
    document.removeEventListener("pointerdown", onDoc, true);
  }
});

function onDoc(e) {
  const t = e.target;
  if (t instanceof Node && (rootRef.value?.contains(t) || listRef.value?.contains(t))) return;
  open.value = false;
}

onMounted(() => {
  window.addEventListener("resize", positionList);
  window.addEventListener("scroll", positionList, true);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDoc, true);
  window.removeEventListener("resize", positionList);
  window.removeEventListener("scroll", positionList, true);
});
</script>
