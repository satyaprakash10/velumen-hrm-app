import { ref, computed, watch } from "vue";
import seed from "@/data/projectsSeed.json";
import { emitActivity } from "@/utils/activityBus.js";
import { authUser } from "@/composables/useAuth.js";
import { authStorageKey } from "@/utils/authStorageKey.js";

const STORAGE_BASE = "ess_projects_v1";

let idSeq = 0;
const list = ref([]);

function load() {
  if (!authUser.value?.id) {
    list.value = [];
    idSeq = 0;
    return;
  }
  const key = authStorageKey(STORAGE_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        list.value = parsed;
        idSeq = list.value.reduce((m, p) => {
          const n = Number(String(p.id).replace(/\D/g, "")) || 0;
          return Math.max(m, n);
        }, 0);
        return;
      }
    }
  } catch {
    /* ignore */
  }
  list.value = seed.map((p) => ({ ...p }));
  idSeq = list.value.length;
}

load();

watch(
  () => authUser.value?.id,
  () => {
    load();
  },
);

watch(
  list,
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

export function useProjects() {
  const projects = computed(() => list.value);

  const projectNames = computed(() =>
    [...list.value.map((p) => p.name).filter(Boolean)].sort((a, b) => a.localeCompare(b)),
  );

  function addProject(row) {
    const name = String(row.name || "").trim();
    if (!name) return null;
    if (list.value.some((p) => p.name.toLowerCase() === name.toLowerCase())) return null;
    const id = `pr-${++idSeq}`;
    const p = {
      id,
      name,
      code: String(row.code || "")
        .trim()
        .slice(0, 8)
        .toUpperCase() || name.slice(0, 3).toUpperCase(),
      description: String(row.description || "").trim(),
    };
    list.value = [...list.value, p];
    emitActivity({
      title: "Project created",
      message: name,
      module: "projects",
    });
    return p;
  }

  function updateProject(id, patch) {
    const i = list.value.findIndex((p) => p.id === id);
    if (i < 0) return false;
    const next = { ...list.value[i], ...patch };
    if (patch.name != null) next.name = String(patch.name).trim();
    if (patch.code != null) next.code = String(patch.code).trim().toUpperCase().slice(0, 8);
    if (patch.description != null) next.description = String(patch.description).trim();
    const dup = list.value.some((p, j) => j !== i && p.name.toLowerCase() === next.name.toLowerCase());
    if (dup) return false;
    list.value = list.value.map((p) => (p.id === id ? next : p));
    emitActivity({
      title: "Project updated",
      message: next.name,
      module: "projects",
    });
    return true;
  }

  function removeProject(id) {
    const p = list.value.find((x) => x.id === id);
    list.value = list.value.filter((x) => x.id !== id);
    if (p) {
      emitActivity({
        title: "Project removed",
        message: p.name,
        module: "projects",
      });
    }
  }

  function findById(id) {
    return list.value.find((p) => p.id === id) || null;
  }

  function ensureNameExists(name) {
    const n = String(name || "").trim();
    if (!n) return;
    if (list.value.some((p) => p.name.toLowerCase() === n.toLowerCase())) return;
    addProject({ name: n, code: n.slice(0, 3).toUpperCase(), description: "" });
  }

  return {
    projects,
    projectNames,
    addProject,
    updateProject,
    removeProject,
    findById,
    ensureNameExists,
  };
}
