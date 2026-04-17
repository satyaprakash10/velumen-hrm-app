<template>
  <Teleport to="body">
    <div
      ref="shellRef"
      class="pointer-events-none fixed z-[200] touch-manipulation"
      :class="[
        hasCustomPos ? '' : defaultCornerClass,
        dragging ? '' : 'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        dragging ? 'touch-none' : '',
      ]"
      :style="shellStyle"
      aria-live="polite"
    >
      <!-- Micro: draggable icon chip (Teams / PiP style) -->
      <div
        v-if="minimized && micro"
        data-drag-handle
        class="pointer-events-auto flex h-14 w-14 cursor-grab touch-manipulation flex-col items-center justify-center rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl ring-1 ring-slate-900/[0.06] backdrop-blur-md active:cursor-grabbing dark:border-slate-600 dark:bg-slate-900/95 dark:ring-white/10"
        @pointerdown="onDragStart"
      >
        <span class="text-sky-600 dark:text-sky-400" aria-hidden="true">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <span class="mt-0.5 max-w-[3.25rem] truncate text-center text-[10px] font-bold tabular-nums leading-none text-slate-800 dark:text-slate-100">
          {{ microTimeLabel }}
        </span>
      </div>

      <div
        v-else
        class="pointer-events-auto flex max-w-[min(100vw-1.5rem,20rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-2xl ring-1 ring-slate-900/[0.06] backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:ring-white/10"
        :class="minimized ? 'w-auto min-w-[200px]' : 'w-full min-w-[280px]'"
      >
        <div
          data-drag-handle
          class="flex min-h-12 cursor-grab touch-manipulation select-none items-center gap-2 border-b border-slate-100 px-3 py-2.5 active:cursor-grabbing dark:border-slate-800 sm:min-h-0 sm:py-2"
          :class="[minimized ? 'border-0' : '', dragging ? 'bg-slate-50/80 dark:bg-slate-800/50' : '']"
          @pointerdown="onDragStart"
        >
          <span
            class="flex shrink-0 text-slate-400 opacity-70 dark:text-slate-500"
            aria-hidden="true"
            title="Drag to move"
          >
            <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm8-12a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <div class="min-w-0 flex-1">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Timer</p>
            <p class="truncate text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">{{ formatted }}</p>
          </div>
          <button
            v-if="minimized"
            type="button"
            class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            title="Minimize to floating icon"
            aria-label="Minimize to floating icon"
            @pointerdown.stop
            @click="setMicro(true)"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
          <button
            type="button"
            class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            :aria-expanded="!minimized"
            :aria-label="minimized ? 'Expand timer' : 'Minimize timer'"
            @pointerdown.stop
            @click="toggleMinimize"
          >
            <svg v-if="minimized" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div
          v-if="minimized && !micro && !isIdle"
          class="flex flex-wrap items-center gap-1 border-t border-slate-100 px-2 py-1.5 dark:border-slate-800"
          @pointerdown.stop
        >
          <button
            v-if="running"
            type="button"
            class="inline-flex min-w-[4.5rem] flex-1 items-center justify-center gap-1 rounded-lg bg-amber-50 px-2 py-1.5 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-200 dark:hover:bg-amber-900/40"
            title="Pause"
            @click="pause"
          >
            <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Pause
          </button>
          <button
            v-else-if="isPaused"
            type="button"
            class="inline-flex min-w-[4.5rem] flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/40"
            title="Resume"
            @click="resume"
          >
            <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            Resume
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Reset timer"
            @click="reset"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            type="button"
            class="inline-flex min-w-[5rem] flex-1 items-center justify-center gap-1 rounded-lg bg-sky-600 px-2 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-sky-500 dark:hover:bg-sky-400"
            :disabled="isIdle"
            title="Add to timesheet"
            @click="queueAddEntry"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add
          </button>
        </div>

        <div v-if="!minimized" v-ess-scrollbar class="max-h-[min(70vh,420px)] space-y-3 overflow-y-auto px-3 pb-3 pt-1" @pointerdown.stop>
          <ProjectPickerField
            v-model="projectNameModel"
            label="Project"
            placeholder="Search projects or type new…"
            :invalid="!!fieldErrors.project"
            @pointerdown.stop
          />
          <p v-if="fieldErrors.project" class="text-xs text-red-600 dark:text-red-400">{{ fieldErrors.project }}</p>
          <label class="block">
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">Task / description</span>
            <input
              v-model="labelModel"
              type="text"
              maxlength="200"
              :class="inputFieldClass(!!fieldErrors.task)"
              placeholder="e.g. Timer UX — pause control"
              @blur="setLabel(labelModel)"
              @pointerdown.stop
            />
            <p v-if="fieldErrors.task" class="mt-1 text-xs text-red-600 dark:text-red-400">{{ fieldErrors.task }}</p>
          </label>
          <div class="flex flex-wrap gap-2">
            <template v-if="isIdle">
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400"
                @click="onStart"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start
              </button>
            </template>
            <template v-else>
              <button
                v-if="running"
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-900/30"
                @click="pause"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </button>
              <button
                v-else
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-900/30"
                @click="resume"
              >
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Resume
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
                title="Clear timer"
                @click="reset"
              >
                Reset
              </button>
            </template>
          </div>
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200 dark:hover:bg-sky-900/50"
            :disabled="isIdle"
            @click="queueAddEntry"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add to timesheet
          </button>
          <router-link
            to="/timesheet"
            class="block text-center text-xs font-medium text-sky-600 underline-offset-2 transition hover:underline dark:text-sky-400"
            @click="collapseTimer"
          >
            Open time entry
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useTimeTracker } from "@/composables/useTimeTracker.js";
import { stashTimerEntry } from "@/composables/timerEntryBridge.js";
import { useToast } from "@/composables/useToast.js";
import ProjectPickerField from "@/components/ui/ProjectPickerField.vue";
import { inputFieldClass } from "@/utils/formFieldClasses.js";

const POS_KEY = "ess_timer_pos_v1";

const router = useRouter();
const toast = useToast();

const {
  running,
  label,
  projectName,
  minimized,
  micro,
  formatted,
  isIdle,
  isPaused,
  currentElapsedMs,
  start,
  resume,
  pause,
  reset,
  setLabel,
  setProjectName,
  setActiveTaskId,
  toggleMinimize,
  setMicro,
  expandFromMicro,
} = useTimeTracker();

const shellRef = ref(null);
const pos = ref(null);
const dragging = ref(false);

const labelModel = ref(label.value);
watch(label, (v) => {
  labelModel.value = v;
});

const projectNameModel = ref(projectName.value);
watch(projectName, (v) => {
  projectNameModel.value = v;
});
watch(projectNameModel, (v) => {
  setProjectName(v);
  if (fieldErrors.project) fieldErrors.project = "";
});

const fieldErrors = reactive({ project: "", task: "" });

watch(labelModel, () => {
  if (fieldErrors.task) fieldErrors.task = "";
});

const microTimeLabel = computed(() => {
  if (isIdle.value) return "Timer";
  return formatted.value;
});

const defaultCornerClass = computed(() =>
  pos.value != null && pos.value.left != null ? "" : "bottom-4 right-4",
);

function validateTimerFields() {
  fieldErrors.project = "";
  fieldErrors.task = "";
  let ok = true;
  const p = (projectNameModel.value || "").trim();
  if (!p) {
    fieldErrors.project = "Select or enter a project (at least 2 characters).";
    ok = false;
  } else if (p.length < 2) {
    fieldErrors.project = "Project name must be at least 2 characters.";
    ok = false;
  }
  const task = (labelModel.value || "").trim();
  if (!task) {
    fieldErrors.task = "Enter what you are working on.";
    ok = false;
  } else if (task.length < 2) {
    fieldErrors.task = "Task description should be at least 2 characters.";
    ok = false;
  }
  return ok;
}

function onStart() {
  if (!validateTimerFields()) return;
  const p = projectNameModel.value?.trim();
  if (p) setProjectName(p);
  setActiveTaskId("");
  start(labelModel.value?.trim() || "Focused work");
}

const hasCustomPos = computed(() => pos.value != null && pos.value.left != null);

const shellStyle = computed(() => {
  if (!pos.value || pos.value.left == null) return {};
  return {
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
    right: "auto",
    bottom: "auto",
  };
});

function roundHoursFromMs(ms) {
  const h = ms / 3600000;
  const q = Math.round(h * 4) / 4;
  return Math.min(24, Math.max(0.25, q));
}

function queueAddEntry() {
  if (!validateTimerFields()) return;
  const ms = currentElapsedMs();
  if (ms < 60000) {
    toast.info("Track at least one minute before adding to the timesheet.", { module: "time" });
    return;
  }
  if (running.value) pause();

  const finalMs = currentElapsedMs();
  const hours = roundHoursFromMs(finalMs);
  const project = (projectNameModel.value || projectName.value || labelModel.value || label.value || "Work").trim() || "Work";
  const notes = (labelModel.value || label.value || "").trim();

  stashTimerEntry({
    date: new Date().toISOString().slice(0, 10),
    hours,
    project,
    notes,
    trackedLabel: [projectNameModel.value || projectName.value, labelModel.value || label.value].filter(Boolean).join(" — "),
  });

  minimized.value = true;
  micro.value = false;
  router.push({ path: "/timesheet", query: { timerEntry: "1" } });
}

function loadPos() {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (typeof p.left === "number" && typeof p.top === "number") pos.value = p;
  } catch {
    /* ignore */
  }
}

function savePos() {
  if (!pos.value) return;
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(pos.value));
  } catch {
    /* ignore */
  }
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function snapToEdges(left, top, w, h) {
  const margin = 8;
  const zone = 36;
  let l = left;
  let t = top;
  if (l <= zone) l = margin;
  else if (l + w >= window.innerWidth - zone) l = window.innerWidth - w - margin;
  if (t <= zone) t = margin;
  else if (t + h >= window.innerHeight - zone) t = window.innerHeight - h - margin;
  return { left: l, top: t };
}

let dragCleanup = null;

function onDragStart(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const handle = e.currentTarget;
  const shell = shellRef.value;
  if (!shell) return;

  const rect = shell.getBoundingClientRect();
  if (pos.value == null || pos.value.left == null) {
    pos.value = { left: rect.left, top: rect.top };
  }

  dragging.value = true;
  const originX = e.clientX - pos.value.left;
  const originY = e.clientY - pos.value.top;
  const startX = e.clientX;
  const startY = e.clientY;
  let dragMoved = false;

  try {
    handle.setPointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }

  function move(ev) {
    if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > 12) {
      dragMoved = true;
    }
    const el = shellRef.value;
    if (!el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    pos.value = {
      left: clamp(ev.clientX - originX, 8, window.innerWidth - w - 8),
      top: clamp(ev.clientY - originY, 8, window.innerHeight - h - 8),
    };
    if (ev.pointerType === "touch") ev.preventDefault();
  }

  function up(ev) {
    dragging.value = false;
    try {
      handle.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    const el = shellRef.value;
    if (el && pos.value) {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const snapped = snapToEdges(pos.value.left, pos.value.top, w, h);
      pos.value = snapped;
    }
    savePos();

    if (minimized.value && micro.value && !dragMoved) {
      expandFromMicro();
    }

    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
    dragCleanup = null;
  }

  window.addEventListener("pointermove", move, { passive: false });
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
  dragCleanup = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    window.removeEventListener("pointercancel", up);
  };

  e.preventDefault();
}

function onResize() {
  if (!pos.value || shellRef.value == null) return;
  const el = shellRef.value;
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  pos.value = {
    left: clamp(pos.value.left, 8, window.innerWidth - w - 8),
    top: clamp(pos.value.top, 8, window.innerHeight - h - 8),
  };
  savePos();
}

function onDocOutside(e) {
  if (minimized.value) return;
  const el = shellRef.value;
  if (!el || !(e.target instanceof Node) || el.contains(e.target)) return;
  toggleMinimize();
}

watch(minimized, (m) => {
  if (m) {
    document.removeEventListener("pointerdown", onDocOutside, true);
  } else {
    nextTick(() => document.addEventListener("pointerdown", onDocOutside, true));
  }
});

onMounted(() => {
  loadPos();
  window.addEventListener("resize", onResize);
  if (!minimized.value) {
    nextTick(() => document.addEventListener("pointerdown", onDocOutside, true));
  }
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocOutside, true);
  window.removeEventListener("resize", onResize);
  if (dragCleanup) dragCleanup();
});

function collapseTimer() {
  minimized.value = true;
  micro.value = false;
}
</script>
