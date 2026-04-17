import { ref, computed, watch } from "vue";
import seed from "@/data/leaves.json";
import { authUser } from "@/composables/useAuth.js";
import { authStorageKey } from "@/utils/authStorageKey.js";

const STORAGE_BASE = "ess_leaves_v1";

const leaves = ref([]);

function inCurrentCalendarYear(isoDate) {
  const y = new Date(isoDate).getFullYear();
  return y === new Date().getFullYear();
}

function load() {
  if (!authUser.value?.id) {
    leaves.value = [];
    return;
  }
  const key = authStorageKey(STORAGE_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        leaves.value = parsed.map((r) => ({ ...r }));
        return;
      }
    }
  } catch {
    /* ignore */
  }
  leaves.value = seed.map((r) => ({ ...r }));
}

load();

watch(
  () => authUser.value?.id,
  () => {
    load();
  },
);

watch(
  leaves,
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

export function useLeaves() {
  const approvedDaysYtd = computed(() =>
    leaves.value
      .filter(
        (l) =>
          l.status === "Approved" &&
          inCurrentCalendarYear(l.startDate),
      )
      .reduce((sum, l) => sum + (l.days || 0), 0),
  );

  const pendingCount = computed(
    () => leaves.value.filter((l) => l.status === "Pending").length,
  );

  const statusCounts = computed(() => {
    const c = { Approved: 0, Pending: 0, Rejected: 0 };
    for (const l of leaves.value) {
      if (c[l.status] !== undefined) c[l.status] += 1;
    }
    return c;
  });

  function addLeave({ type, startDate, endDate, reason }) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(
      1,
      Math.round((end - start) / (86400 * 1000)) + 1,
    );
    const row = {
      id: `lv-${Date.now()}`,
      type,
      startDate,
      endDate,
      days,
      status: "Pending",
      reason: reason || "",
    };
    leaves.value = [row, ...leaves.value];
    return row;
  }

  function updateLeave(id, patch) {
    leaves.value = leaves.value.map((l) => {
      if (l.id !== id) return l;
      const next = { ...l, ...patch };
      if (patch.startDate != null || patch.endDate != null) {
        const s = new Date(next.startDate);
        const e = new Date(next.endDate);
        next.days = Math.max(
          1,
          Math.round((e - s) / (86400 * 1000)) + 1,
        );
      }
      return next;
    });
  }

  function removeLeave(id) {
    leaves.value = leaves.value.filter((l) => l.id !== id);
  }

  return {
    leaves,
    approvedDaysYtd,
    pendingCount,
    statusCounts,
    addLeave,
    updateLeave,
    removeLeave,
  };
}
