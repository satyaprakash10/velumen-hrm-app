<template>
  <div class="relative">
    <button
      type="button"
      ref="anchorRef"
      class="flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm shadow-sm transition-[border-color,box-shadow] duration-200"
      :class="invalid ? errBtn : okBtn"
      :aria-expanded="open"
      aria-haspopup="dialog"
      @click="open = !open"
    >
      <span class="min-w-0 truncate tabular-nums">{{ displayLabel }}</span>
      <span class="shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </span>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-95 translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="open"
          ref="popoverRef"
          :style="popoverStyle"
          class="w-[min(100vw-2rem,20rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
          role="dialog"
          aria-label="Choose date"
          @click.stop
        >
          <div class="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Previous month"
              @click="shiftMonth(-1)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p class="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {{ monthTitle }}
            </p>
            <button
              type="button"
              class="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Next month"
              @click="shiftMonth(1)"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <span v-for="d in weekDays" :key="d">{{ d }}</span>
          </div>
          <div class="mt-1 grid grid-cols-7 gap-1">
            <button
              v-for="(cell, idx) in cells"
              :key="idx"
              type="button"
              :disabled="!cell.inMonth"
              class="aspect-square rounded-lg text-xs font-medium tabular-nums transition duration-150"
              :class="cellClass(cell)"
              @click="pick(cell)"
            >
              {{ cell.day }}
            </button>
          </div>
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
  invalid: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const open = ref(false);
const anchorRef = ref(null);
const popoverRef = ref(null);

const okBtn =
  "border-slate-200 bg-white text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-400/25";
const errBtn =
  "border-2 border-red-500 bg-white text-gray-900 focus:border-red-600 focus:ring-2 focus:ring-red-500/25 dark:border-red-500 dark:bg-red-950/20 dark:text-gray-100";

const view = ref(parseYmd(props.modelValue) || new Date());

const referenceEl = computed(() => anchorRef.value);

const { floatingStyles, update } = useFloating(referenceEl, popoverRef, {
  open,
  placement: "bottom-start",
  strategy: "fixed",
  transform: false,
  middleware: [offset(8), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

/** Above ModalPanel (z-10200) and ConfirmDialog; inline z-index avoids stacking-context issues inside modals. */
const Z_POPOVER = 12000;

const popoverStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: Z_POPOVER,
}));

const weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const monthTitle = computed(() =>
  view.value.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
);

const displayLabel = computed(() => {
  if (!props.modelValue) return "Select date";
  const d = parseYmd(props.modelValue);
  if (!d) return "Select date";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

const cells = computed(() => {
  const y = view.value.getFullYear();
  const m = view.value.getMonth();
  const first = new Date(y, m, 1);
  const startPad = (first.getDay() + 6) % 7;
  const dim = new Date(y, m + 1, 0).getDate();
  const prevDim = new Date(y, m, 0).getDate();
  const list = [];

  for (let i = 0; i < startPad; i += 1) {
    const day = prevDim - startPad + i + 1;
    list.push({
      inMonth: false,
      day,
      date: new Date(y, m - 1, day),
    });
  }
  for (let d = 1; d <= dim; d += 1) {
    list.push({
      inMonth: true,
      day: d,
      date: new Date(y, m, d),
    });
  }
  let next = 1;
  while (list.length % 7 !== 0 || list.length < 42) {
    list.push({
      inMonth: false,
      day: next,
      date: new Date(y, m + 1, next),
    });
    next += 1;
    if (list.length > 48) break;
  }
  return list;
});

function shiftMonth(delta) {
  const d = new Date(view.value);
  d.setMonth(d.getMonth() + delta);
  view.value = d;
}

function toYmd(d) {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function parseYmd(s) {
  if (!s || typeof s !== "string") return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function pick(cell) {
  if (!cell.inMonth) return;
  emit("update:modelValue", toYmd(cell.date));
  open.value = false;
}

function cellClass(cell) {
  const sel = props.modelValue && toYmd(cell.date) === props.modelValue;
  if (!cell.inMonth)
    return "cursor-default text-slate-300 opacity-40 dark:text-slate-600";
  if (sel) return "bg-sky-600 text-white shadow-sm dark:bg-sky-500";
  return "text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800";
}

watch(
  () => props.modelValue,
  (v) => {
    const d = parseYmd(v);
    if (d) view.value = d;
  },
);

function onDoc(e) {
  if (!open.value) return;
  const t = e.target;
  if (t instanceof Node) {
    if (anchorRef.value?.contains(t) || popoverRef.value?.contains(t)) return;
  }
  open.value = false;
}

watch(open, (v) => {
  if (v) {
    nextTick(() => update());
    queueMicrotask(() => {
      document.addEventListener("pointerdown", onDoc, true);
    });
  } else {
    document.removeEventListener("pointerdown", onDoc, true);
  }
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDoc, true);
});
</script>
