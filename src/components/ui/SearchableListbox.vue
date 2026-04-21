<template>
  <div ref="rootRef" class="relative w-full">
    <button
      type="button"
      ref="btnRef"
      class="flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm shadow-sm transition-[border-color,box-shadow] duration-200"
      :class="invalid ? err : ok"
      :aria-expanded="open"
      aria-haspopup="listbox"
      @click="open = !open"
    >
      <span class="flex min-w-0 flex-1 items-center gap-2 truncate">
        <span
          v-if="selectedFlag"
          class="shrink-0 text-lg leading-none"
          aria-hidden="true"
        >{{ selectedFlag }}</span>
        <span class="min-w-0 truncate">{{ displayText }}</span>
      </span>
      <svg
        v-if="loading"
        class="h-4 w-4 shrink-0 animate-spin text-slate-400 dark:text-slate-500"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25" />
        <path stroke-linecap="round" stroke="currentColor" stroke-width="2" d="M21 12a9 9 0 00-9-9" />
      </svg>
      <svg
        v-else
        class="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
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
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-[0.98]"
      >
        <div
          v-if="open"
          ref="popoverRef"
          :style="popoverStyle"
          class="flex max-h-[min(320px,70vh)] w-[var(--lb-w,100%)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
          role="listbox"
        >
          <div v-if="searchable" class="border-b border-slate-100 p-2 dark:border-slate-800">
            <input
              v-model="q"
              type="search"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="Search…"
              @keydown.stop
            />
          </div>
          <ul v-ess-scrollbar class="max-h-56 overflow-y-auto p-1">
            <li v-for="opt in filteredOptions" :key="opt.value">
              <button
                type="button"
                role="option"
                :aria-selected="opt.value === modelValue"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors"
                :class="
                  opt.value === modelValue
                    ? 'bg-sky-50 font-medium text-sky-900 dark:bg-sky-950/60 dark:text-sky-100'
                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
                "
                @click="pick(opt)"
              >
                <span
                  v-if="opt.flag"
                  class="shrink-0 text-lg leading-none"
                  aria-hidden="true"
                >{{ opt.flag }}</span>
                <span class="min-w-0 truncate">{{ opt.label }}</span>
              </button>
            </li>
            <li v-if="!filteredOptions.length" class="px-3 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              No matches
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: "Select…" },
  invalid: { type: Boolean, default: false },
  searchable: { type: Boolean, default: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const q = ref("");
const rootRef = ref(null);
const btnRef = ref(null);
const popoverRef = ref(null);

const ok =
  "border-slate-200 bg-white text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/25";
const err =
  "border-2 border-red-500 bg-white text-gray-900 focus:border-red-600 focus:ring-2 focus:ring-red-500/30 dark:border-red-500 dark:bg-red-950/20 dark:text-gray-100";

const referenceEl = computed(() => btnRef.value);

const { floatingStyles, update } = useFloating(referenceEl, popoverRef, {
  open,
  placement: "bottom-start",
  strategy: "fixed",
  transform: false,
  middleware: [offset(6), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

/** Above ModalPanel (z-10200); inline z-index keeps popovers above modals. */
const Z_LISTBOX = 12000;

const popoverStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: Z_LISTBOX,
}));

const selectedOption = computed(() =>
  props.options.find((x) => x.value === props.modelValue),
);

const selectedFlag = computed(() => selectedOption.value?.flag || "");

const displayText = computed(() => {
  const o = selectedOption.value;
  return o?.label || props.placeholder;
});

const filteredOptions = computed(() => {
  const list = props.options || [];
  const s = q.value.trim().toLowerCase();
  if (!s) return list;
  return list.filter(
    (o) =>
      String(o.label).toLowerCase().includes(s) ||
      String(o.value).toLowerCase().includes(s),
  );
});

function pick(opt) {
  emit("update:modelValue", opt.value);
  open.value = false;
  q.value = "";
}

watch(open, (v) => {
  if (v) {
    nextTick(() => {
      update();
      const w = rootRef.value?.getBoundingClientRect().width;
      if (popoverRef.value && w) {
        popoverRef.value.style.setProperty("--lb-w", `${Math.max(w, 220)}px`);
      }
    });
  }
});

function onDoc(e) {
  if (!open.value) return;
  const t = e.target;
  if (t instanceof Node) {
    if (rootRef.value?.contains(t) || popoverRef.value?.contains(t)) return;
  }
  open.value = false;
}

watch(open, (v) => {
  if (v) {
    queueMicrotask(() => document.addEventListener("pointerdown", onDoc, true));
  } else {
    document.removeEventListener("pointerdown", onDoc, true);
  }
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDoc, true);
});
</script>
