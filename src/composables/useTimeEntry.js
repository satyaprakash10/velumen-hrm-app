import { ref, computed, watch } from "vue";
import seed from "@/data/timeEntries.json";
import { authUser } from "@/composables/useAuth.js";
import { authStorageKey } from "@/utils/authStorageKey.js";

const STORAGE_BASE = "ess_time_entries_v1";

let idSeq = 0;

const weekOf = ref(seed.weekOf);
const expectedHours = ref(seed.expectedHours);
// Exported so the payslip generator (and other passive consumers) can derive
// summaries from the user's tracked hours without instantiating the full
// composable / subscribing to its lifecycle hooks.
export const entries = ref([]);

const ALLOWED_CURRENCIES = new Set(["USD", "EUR", "INR"]);

function normalizeEntry(e) {
  const code = String(e.currency || "USD").toUpperCase();
  return {
    ...e,
    id: e.id || `te-${++idSeq}`,
    hours: Number(e.hours || 0),
    project: String(e.project || "").trim(),
    notes: String(e.notes || "").trim(),
    currency: ALLOWED_CURRENCIES.has(code) ? code : "USD",
  };
}

function load() {
  if (!authUser.value?.id) {
    weekOf.value = seed.weekOf;
    expectedHours.value = seed.expectedHours;
    entries.value = [];
    idSeq = 0;
    return;
  }
  const key = authStorageKey(STORAGE_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        weekOf.value = parsed.weekOf ?? seed.weekOf;
        expectedHours.value = parsed.expectedHours ?? seed.expectedHours;
        const list = Array.isArray(parsed.entries) ? parsed.entries : [];
        entries.value = list.map((e) => normalizeEntry({ ...e }));
        idSeq = entries.value.reduce((m, e) => {
          const n = Number(String(e.id).replace(/\D/g, "")) || 0;
          return Math.max(m, n);
        }, 0);
        return;
      }
    }
  } catch {
    /* ignore */
  }
  weekOf.value = seed.weekOf;
  expectedHours.value = seed.expectedHours;
  entries.value = seed.entries.map((e) =>
    normalizeEntry({ ...e, id: `te-${++idSeq}` }),
  );
}

load();

watch(
  () => authUser.value?.id,
  () => {
    load();
  },
);

watch(
  [weekOf, expectedHours, entries],
  () => {
    if (!authUser.value?.id) return;
    try {
      localStorage.setItem(
        authStorageKey(STORAGE_BASE),
        JSON.stringify({
          weekOf: weekOf.value,
          expectedHours: expectedHours.value,
          entries: entries.value,
        }),
      );
    } catch {
      /* ignore */
    }
  },
  { deep: true },
);

export function useTimeEntry() {
  const weekTotal = computed(() =>
    entries.value.reduce((s, e) => s + Number(e.hours || 0), 0),
  );

  const variance = computed(() => weekTotal.value - expectedHours.value);

  function addEntry(row) {
    entries.value = [
      ...entries.value,
      normalizeEntry({
        date: row.date,
        hours: Number(row.hours),
        project: row.project.trim(),
        notes: row.notes?.trim() || "",
        currency: row.currency || "USD",
      }),
    ];
  }

  function updateEntry(id, patch) {
    entries.value = entries.value.map((e) =>
      e.id === id ? { ...e, ...patch } : e,
    );
  }

  function removeEntry(index) {
    entries.value = entries.value.filter((_, i) => i !== index);
  }

  function removeEntryById(id) {
    entries.value = entries.value.filter((e) => e.id !== id);
  }

  return {
    weekOf,
    expectedHours,
    entries,
    weekTotal,
    variance,
    addEntry,
    updateEntry,
    removeEntry,
    removeEntryById,
  };
}
