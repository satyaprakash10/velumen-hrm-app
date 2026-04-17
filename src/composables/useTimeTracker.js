import { ref, computed, watch } from "vue";
import { authUser } from "@/composables/useAuth.js";
import { authStorageKey } from "@/utils/authStorageKey.js";

const STORAGE_BASE = "ess_time_tracker_v1";

const running = ref(false);
const label = ref("");
const projectName = ref("");
const baseMs = ref(0);
const startedAt = ref(null);
const minimized = ref(true);
/** When true with minimized, only a small draggable chip is shown (Teams-style). */
const micro = ref(false);
const tick = ref(0);
/** When set, floating timer is bound to this task (shown on task card). */
const activeTaskId = ref("");

let intervalId = null;

function persist() {
  if (!authUser.value?.id) return;
  try {
    localStorage.setItem(
      authStorageKey(STORAGE_BASE),
      JSON.stringify({
        label: label.value,
        projectName: projectName.value,
        running: running.value,
        baseMs: baseMs.value,
        startedAt: startedAt.value,
        minimized: minimized.value,
        micro: micro.value,
        activeTaskId: activeTaskId.value,
      }),
    );
  } catch {
    /* ignore */
  }
}

function load() {
  stopTicker();
  running.value = false;
  startedAt.value = null;
  baseMs.value = 0;
  tick.value = 0;
  label.value = "";
  projectName.value = "";
  minimized.value = true;
  micro.value = false;
  activeTaskId.value = "";

  if (!authUser.value?.id) return;

  try {
    const raw = localStorage.getItem(authStorageKey(STORAGE_BASE));
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.label === "string") label.value = s.label;
    if (typeof s.projectName === "string") projectName.value = s.projectName;
    else if (typeof s.label === "string" && s.label && s.projectName == null) {
      projectName.value = s.label;
    }
    if (typeof s.activeTaskId === "string") activeTaskId.value = s.activeTaskId;
    baseMs.value = Number(s.baseMs) || 0;
    minimized.value = s.minimized !== false;
    micro.value = Boolean(s.micro);
    if (s.running && s.startedAt) {
      running.value = true;
      startedAt.value = s.startedAt;
    }
  } catch {
    /* ignore */
  }
  if (running.value) startTicker();
}

function startTicker() {
  stopTicker();
  intervalId = window.setInterval(() => {
    tick.value += 1;
  }, 1000);
}

function stopTicker() {
  if (intervalId != null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

load();

watch(
  () => authUser.value?.id,
  () => {
    load();
  },
);

if (running.value) startTicker();

const elapsedMs = computed(() => {
  tick.value;
  if (!running.value || startedAt.value == null) return baseMs.value;
  return baseMs.value + (Date.now() - startedAt.value);
});

const formatted = computed(() => {
  const total = Math.max(0, Math.floor(elapsedMs.value / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

const isPaused = computed(() => !running.value && baseMs.value > 0);
const isIdle = computed(() => !running.value && baseMs.value === 0);

watch(
  [label, projectName, running, baseMs, startedAt, minimized, micro, activeTaskId],
  () => {
    persist();
  },
  { deep: true },
);

function currentElapsedMs() {
  if (running.value && startedAt.value != null) {
    return baseMs.value + (Date.now() - startedAt.value);
  }
  return baseMs.value;
}

export function useTimeTracker() {
  function start(text = "") {
    const t = typeof text === "string" ? text.trim() : "";
    if (t) label.value = t;
    else if (!label.value) label.value = "Focused work";

    if (running.value) return;

    if (baseMs.value > 0) {
      resume();
      return;
    }

    baseMs.value = 0;
    startedAt.value = Date.now();
    running.value = true;
    minimized.value = false;
    micro.value = false;
    tick.value = 0;
    startTicker();
    persist();
  }

  function resume() {
    if (running.value) return;
    if (!label.value) label.value = "Focused work";
    running.value = true;
    startedAt.value = Date.now();
    startTicker();
    persist();
  }

  function pause() {
    if (!running.value || startedAt.value == null) return;
    baseMs.value += Date.now() - startedAt.value;
    startedAt.value = null;
    running.value = false;
    stopTicker();
    persist();
  }

  function stop() {
    pause();
  }

  function reset() {
    stopTicker();
    running.value = false;
    startedAt.value = null;
    baseMs.value = 0;
    tick.value = 0;
    label.value = "";
    projectName.value = "";
    activeTaskId.value = "";
    minimized.value = true;
    micro.value = false;
    persist();
  }

  function setLabel(text) {
    label.value = text;
    persist();
  }

  function setProjectName(text) {
    projectName.value = typeof text === "string" ? text : "";
    persist();
  }

  function setActiveTaskId(id) {
    activeTaskId.value = typeof id === "string" ? id : "";
    persist();
  }

  function toggleMinimize() {
    minimized.value = !minimized.value;
    if (!minimized.value) micro.value = false;
    persist();
  }

  function setMicro(next) {
    micro.value = Boolean(next);
    if (micro.value) minimized.value = true;
    persist();
  }

  function expandFromMicro() {
    micro.value = false;
    minimized.value = true;
    persist();
  }

  return {
    running,
    label,
    projectName,
    minimized,
    micro,
    activeTaskId,
    elapsedMs,
    formatted,
    isPaused,
    isIdle,
    currentElapsedMs,
    start,
    resume,
    pause,
    stop,
    reset,
    setLabel,
    setProjectName,
    setActiveTaskId,
    toggleMinimize,
    setMicro,
    expandFromMicro,
  };
}
