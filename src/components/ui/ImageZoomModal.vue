<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        class="fixed inset-0 z-[10400] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Attachment preview"
        @click.self="close"
      >
        <!-- Toolbar -->
        <header
          class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 text-white sm:px-6"
        >
          <p class="pointer-events-auto min-w-0 truncate rounded-md bg-black/40 px-2 py-1 text-[12px] font-semibold text-white/90">
            {{ current?.name }}
          </p>
          <div class="pointer-events-auto flex items-center gap-1 rounded-xl bg-slate-900/60 p-1 text-white backdrop-blur-sm">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40"
              aria-label="Zoom out"
              :disabled="scale <= MIN"
              @click="zoomBy(-0.25)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" d="M8 11h6M21 21l-3.8-3.8" />
              </svg>
            </button>
            <span class="w-14 text-center text-[11px] font-semibold tabular-nums">
              {{ Math.round(scale * 100) }}%
            </span>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40"
              aria-label="Zoom in"
              :disabled="scale >= MAX"
              @click="zoomBy(0.25)"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" d="M11 8v6M8 11h6M21 21l-3.8-3.8" />
              </svg>
            </button>
            <button
              type="button"
              class="ml-1 flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              @click="reset"
            >
              Reset
            </button>
            <a
              :href="current?.dataUrl"
              :download="current?.name"
              class="ml-1 flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v11m0 0l-4-4m4 4l4-4" />
                <path stroke-linecap="round" d="M4 20h16" />
              </svg>
              Download
            </a>
          </div>
          <button
            type="button"
            class="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/60 text-white backdrop-blur-sm transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Close preview"
            @click="close"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <!-- Image -->
        <div
          class="relative flex h-full w-full items-center justify-center overflow-hidden select-none"
          @wheel.prevent="onWheel"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <img
            v-if="current"
            :src="current.dataUrl"
            :alt="current.name"
            class="max-h-[90vh] max-w-[92vw] rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] transition-transform duration-100"
            :style="imageStyle"
            draggable="false"
          />
        </div>

        <!-- Prev / next -->
        <template v-if="attachments.length > 1">
          <button
            type="button"
            class="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40"
            aria-label="Previous"
            :disabled="index === 0"
            @click="step(-1)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 18L9 12l6-6" />
            </svg>
          </button>
          <button
            type="button"
            class="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-white backdrop-blur-sm transition hover:bg-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:opacity-40"
            aria-label="Next"
            :disabled="index === attachments.length - 1"
            @click="step(1)"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <footer class="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <p class="rounded-full bg-slate-900/60 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
              {{ index + 1 }} / {{ attachments.length }}
            </p>
          </footer>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  attachments: { type: Array, default: () => [] },
  startIndex: { type: Number, default: 0 },
});

const emit = defineEmits(["close"]);

const MIN = 0.5;
const MAX = 4;

const index = ref(props.startIndex);
const scale = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const dragging = ref(false);
let dragStart = null;

const current = computed(
  () => props.attachments[index.value] || props.attachments[0] || null,
);

const imageStyle = computed(() => ({
  transform: `translate3d(${translateX.value}px, ${translateY.value}px, 0) scale(${scale.value})`,
  cursor: scale.value > 1 ? (dragging.value ? "grabbing" : "grab") : "default",
}));

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function reset() {
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
}

function zoomBy(delta) {
  scale.value = clamp(Number((scale.value + delta).toFixed(2)), MIN, MAX);
  if (scale.value <= 1) {
    translateX.value = 0;
    translateY.value = 0;
  }
}

function step(direction) {
  const n = props.attachments.length;
  if (!n) return;
  index.value = clamp(index.value + direction, 0, n - 1);
  reset();
}

function close() {
  emit("close");
}

function onWheel(e) {
  zoomBy(-Math.sign(e.deltaY) * 0.18);
}

function onPointerDown(e) {
  if (scale.value <= 1) return;
  dragging.value = true;
  dragStart = {
    x: e.clientX,
    y: e.clientY,
    tx: translateX.value,
    ty: translateY.value,
    pointerId: e.pointerId,
  };
  e.target?.setPointerCapture?.(e.pointerId);
}

function onPointerMove(e) {
  if (!dragging.value || !dragStart) return;
  translateX.value = dragStart.tx + (e.clientX - dragStart.x);
  translateY.value = dragStart.ty + (e.clientY - dragStart.y);
}

function onPointerUp(e) {
  dragging.value = false;
  try {
    e.target?.releasePointerCapture?.(e.pointerId);
  } catch {
    /* ignore */
  }
  dragStart = null;
}

function onKey(e) {
  if (e.key === "Escape") close();
  else if (e.key === "ArrowRight") step(1);
  else if (e.key === "ArrowLeft") step(-1);
  else if (e.key === "+" || e.key === "=") zoomBy(0.25);
  else if (e.key === "-" || e.key === "_") zoomBy(-0.25);
  else if (e.key === "0") reset();
}

watch(
  () => props.startIndex,
  (v) => {
    index.value = v;
    reset();
  },
);

onMounted(() => {
  document.documentElement.style.overflow = "hidden";
  document.addEventListener("keydown", onKey);
});

onUnmounted(() => {
  document.documentElement.style.overflow = "";
  document.removeEventListener("keydown", onKey);
});
</script>
