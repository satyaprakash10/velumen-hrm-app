import { ref, computed, watch } from "vue";
import seed from "@/data/tasksSeed.json";
import { emitActivity } from "@/utils/activityBus.js";
import { authUser } from "@/composables/useAuth.js";
import { authStorageKey } from "@/utils/authStorageKey.js";

const STORAGE_BASE = "ess_tasks_v1";

const COLUMNS = [
  { id: "pending", title: "Pending" },
  { id: "todo", title: "To do" },
  { id: "in_progress", title: "In progress" },
  { id: "bugs", title: "Bugs" },
  { id: "done", title: "Done" },
];

const COLUMN_IDS = new Set(COLUMNS.map((c) => c.id));

let tid = 0;
const tasks = ref([]);

function normalizeTask(raw) {
  const t = { ...raw };
  if (!COLUMN_IDS.has(t.column)) {
    if (t.column === "todo") t.column = "todo";
    else if (t.column === "in_progress") t.column = "in_progress";
    else if (t.column === "done") t.column = "done";
    else t.column = "pending";
  }
  if (!Array.isArray(t.comments)) t.comments = [];
  if (!Array.isArray(t.tags)) t.tags = [];
  if (typeof t.description !== "string") t.description = "";
  return t;
}

function load() {
  if (!authUser.value?.id) {
    tasks.value = [];
    tid = 0;
    return;
  }
  const key = authStorageKey(STORAGE_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        tasks.value = parsed.map(normalizeTask);
        tid = tasks.value.reduce((m, t) => {
          const n = Number(String(t.id).replace(/\D/g, "")) || 0;
          return Math.max(m, n);
        }, 0);
        return;
      }
    }
  } catch {
    /* ignore */
  }
  tasks.value = (seed.tasks || []).map((t) =>
    normalizeTask({
      ...t,
      description: t.description || "",
      tags: Array.isArray(t.tags) ? t.tags : [],
      comments: Array.isArray(t.comments) ? t.comments.map((c) => ({ ...c })) : [],
    }),
  );
  tid = tasks.value.length;
}

load();

watch(
  () => authUser.value?.id,
  () => {
    load();
  },
);

watch(
  tasks,
  (v) => {
    if (!authUser.value?.id) return;
    try {
      localStorage.setItem(authStorageKey(STORAGE_BASE), JSON.stringify(v));
    } catch {
      /* ignore */
    }
  },
  { deep: true },
);

export function useTaskBoard() {
  const columns = COLUMNS;

  const tasksByColumn = computed(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    for (const t of tasks.value) {
      const col = COLUMN_IDS.has(t.column) ? t.column : "pending";
      map[col].push(t);
    }
    return map;
  });

  function getById(id) {
    return tasks.value.find((x) => x.id === id) || null;
  }

  function addTask(payload) {
    const title = String(payload.title || "").trim();
    if (!title) return null;
    const row = normalizeTask({
      id: `tk-${++tid}`,
      title,
      column: COLUMN_IDS.has(payload.column) ? payload.column : "pending",
      projectId: payload.projectId || "",
      description: String(payload.description || "").trim(),
      tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : [],
      comments: [],
    });
    tasks.value = [...tasks.value, row];
    emitActivity({ title: "Task created", message: title, module: "tasks" });
    return row;
  }

  function updateTask(id, patch) {
    const i = tasks.value.findIndex((x) => x.id === id);
    if (i < 0) return false;
    const next = { ...tasks.value[i], ...patch };
    if (patch.title != null) next.title = String(patch.title).trim();
    if (patch.description != null) next.description = String(patch.description).trim();
    if (patch.tags != null) next.tags = Array.isArray(patch.tags) ? patch.tags.filter(Boolean) : [];
    if (patch.column != null && COLUMN_IDS.has(patch.column)) next.column = patch.column;
    if (patch.projectId != null) next.projectId = patch.projectId;
    tasks.value = tasks.value.map((t) => (t.id === id ? next : t));
    emitActivity({ title: "Task updated", message: next.title, module: "tasks" });
    return true;
  }

  function moveTask(id, column) {
    if (!COLUMN_IDS.has(column)) return;
    const t = tasks.value.find((x) => x.id === id);
    if (!t) return;
    t.column = column;
    tasks.value = [...tasks.value];
    emitActivity({
      title: "Task moved",
      message: `${t.title} → ${COLUMNS.find((c) => c.id === column)?.title || column}`,
      module: "tasks",
    });
  }

  function addComment(taskId, text, author = "You") {
    const t = tasks.value.find((x) => x.id === taskId);
    if (!t) return;
    const c = {
      id: `c-${Date.now()}`,
      text: String(text || "").trim(),
      at: new Date().toISOString(),
      author,
    };
    if (!c.text) return;
    t.comments = [...(t.comments || []), c];
    tasks.value = [...tasks.value];
    emitActivity({
      title: "Comment added",
      message: t.title,
      module: "tasks",
    });
  }

  function removeTask(id) {
    tasks.value = tasks.value.filter((t) => t.id !== id);
  }

  function cloneTask(id) {
    const t = tasks.value.find((x) => x.id === id);
    if (!t) return null;
    const row = normalizeTask({
      id: `tk-${++tid}`,
      title: `${t.title} (copy)`,
      column: "pending",
      projectId: t.projectId || "",
      description: t.description || "",
      tags: [...(t.tags || [])],
      comments: [],
    });
    tasks.value = [...tasks.value, row];
    emitActivity({ title: "Task cloned", message: row.title, module: "tasks" });
    return row;
  }

  return {
    columns,
    tasks,
    tasksByColumn,
    getById,
    addTask,
    updateTask,
    moveTask,
    addComment,
    removeTask,
    cloneTask,
  };
}
