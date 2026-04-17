<template>
  <div class="min-h-full bg-page-bg px-4 py-6 dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1 class="page-title mb-1">Time entry</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Week of {{ weekOf }} · Expected {{ expectedHours }}h
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Logged</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {{ weekTotal.toFixed(1) }}h
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Variance</p>
          <p
            class="mt-2 text-2xl font-semibold tabular-nums"
            :class="variance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'"
          >
            {{ variance >= 0 ? "+" : "" }}{{ variance.toFixed(1) }}h
          </p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Entries</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {{ entries.length }}
          </p>
        </div>
      </div>

      <div class="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-lg font-semibold text-navy dark:text-slate-100">Add entry</h2>
        <form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
          <label class="block">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Date</span>
            <DatePickerField v-model="form.date" class="mt-1.5 block" :invalid="v$.date.$error" />
            <p v-if="v$.date.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.date.$errors[0]?.$message }}
            </p>
          </label>
          <label class="block">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Hours</span>
            <input
              v-model.number="form.hours"
              type="number"
              min="0"
              step="0.25"
              :class="inputFieldClass(v$.hours.$error)"
            />
            <p v-if="v$.hours.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.hours.$errors[0]?.$message }}
            </p>
          </label>
          <div class="block md:col-span-2">
            <ProjectPickerField
              v-model="form.project"
              label="Project"
              placeholder="Search, select, or add a project…"
              :input-class="inputFieldClass(v$.project.$error)"
              :extra-names="entryProjectNames"
            />
            <p v-if="v$.project.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.project.$errors[0]?.$message }}
            </p>
          </div>
          <label class="block md:col-span-2">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
            <input
              v-model="form.notes"
              type="text"
              :class="inputFieldClass(false)"
              placeholder="Optional"
            />
          </label>
          <div class="md:col-span-2">
            <button type="submit" :class="btnPrimaryClass">
              Add to timesheet
            </button>
          </div>
        </form>
      </div>

      <div class="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="border-b border-slate-200 px-6 py-4 text-lg font-semibold text-navy dark:border-slate-800 dark:text-slate-100">
          This week
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-[720px] w-full text-left text-sm">
            <thead class="border-b border-slate-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">Date</th>
                <th class="px-6 py-3">Hours</th>
                <th class="px-6 py-3">Project</th>
                <th class="px-6 py-3">Notes</th>
                <th class="w-14 px-2 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="row in entries" :key="row.id" class="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                <td class="px-6 py-3 tabular-nums text-gray-900 dark:text-gray-100">{{ row.date }}</td>
                <td class="px-6 py-3 tabular-nums text-gray-700 dark:text-gray-300">{{ row.hours }}</td>
                <td class="px-6 py-3 text-gray-900 dark:text-gray-100">{{ row.project }}</td>
                <td class="max-w-xs truncate px-6 py-3 text-gray-600 dark:text-gray-400" :title="row.notes">
                  {{ row.notes || "—" }}
                </td>
                <td class="px-2 py-2 text-right align-middle">
                  <DropdownMenu aria-label="Time entry actions" :items="menuItemsFor(row)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="!entries.length"
          class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
          role="status"
        >
          No entries yet.
        </div>
      </div>
    </div>

    <ModalPanel v-model="viewOpen">
      <template #title>Time entry</template>
      <template v-if="active" #badges>
        <StatusBadge class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Logged</StatusBadge>
      </template>
      <template v-if="active" #actions>
        <DropdownMenu aria-label="Time entry actions" :items="detailModalMenuFor(active)" />
      </template>
      <dl v-if="active" class="space-y-3">
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Date</dt><dd class="mt-0.5 tabular-nums">{{ active.date }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Hours</dt><dd class="mt-0.5">{{ active.hours }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Project</dt><dd class="mt-0.5">{{ active.project }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Notes</dt><dd class="mt-0.5 whitespace-pre-wrap">{{ active.notes || "—" }}</dd></div>
      </dl>
    </ModalPanel>

    <ModalPanel v-model="editOpen">
      <template #title>Edit entry</template>
      <form v-if="active" class="space-y-4" @submit.prevent="saveEdit">
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Date</span>
          <DatePickerField v-model="editForm.date" class="mt-1.5 block" :invalid="ev$.date.$error" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Hours</span>
          <input v-model.number="editForm.hours" type="number" min="0" step="0.25" :class="inputFieldClass(ev$.hours.$error)" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Project</span>
          <input v-model="editForm.project" type="text" :class="inputFieldClass(ev$.project.$error)" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
          <input v-model="editForm.notes" type="text" :class="inputFieldClass(false)" />
        </label>
        <div class="flex flex-wrap gap-2 pt-2">
          <button type="submit" :class="btnPrimaryClass">Save</button>
          <button type="button" :class="btnSecondaryClass" @click="editOpen = false">Cancel</button>
        </div>
      </form>
    </ModalPanel>

    <ModalPanel v-model="timerConfirmOpen">
      <template #title>Add tracked time</template>
      <template #subtitle>
        Review or edit this entry before saving it to your timesheet.
      </template>
      <template #badges>
        <span
          v-if="timerTrackedLabel"
          class="inline-flex max-w-full items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-900 dark:bg-sky-950/80 dark:text-sky-200"
        >
          <span class="truncate">{{ timerTrackedLabel }}</span>
        </span>
      </template>
      <div class="space-y-5">
        <div
          class="rounded-xl border border-sky-100 bg-gradient-to-br from-sky-50/90 to-indigo-50/50 p-4 dark:border-sky-900/50 dark:from-sky-950/40 dark:to-indigo-950/30"
        >
          <p class="text-[11px] font-semibold uppercase tracking-wide text-sky-700/80 dark:text-sky-300/90">
            Tracked duration
          </p>
          <p class="mt-1 text-2xl font-bold tabular-nums text-[#001738] dark:text-slate-100">
            {{ timerHoursDisplay }}h
          </p>
          <p class="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Rounded to the nearest 15 minutes. You can adjust hours below.
          </p>
        </div>
        <form class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="confirmTimerEntry">
          <label class="block sm:col-span-2">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Date</span>
            <DatePickerField v-model="timerDraft.date" class="mt-1.5 block" />
          </label>
          <label class="block">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Hours</span>
            <input
              v-model.number="timerDraft.hours"
              type="number"
              min="0.25"
              max="24"
              step="0.25"
              :class="inputFieldClass(false)"
            />
          </label>
          <div class="block sm:col-span-2">
            <ProjectPickerField
              v-model="timerDraft.project"
              label="Project"
              placeholder="Search, select, or add…"
              :input-class="inputFieldClass(false)"
              :extra-names="entryProjectNames"
            />
          </div>
          <label class="block sm:col-span-2">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
            <input
              v-model="timerDraft.notes"
              type="text"
              :class="inputFieldClass(false)"
              placeholder="Optional"
            />
          </label>
          <div class="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" :class="btnPrimaryClass">Save to timesheet</button>
            <button type="button" :class="btnSecondaryClass" @click="cancelTimerEntry">Cancel</button>
          </div>
        </form>
      </div>
    </ModalPanel>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Remove time entry?"
      :message="deleteMsg"
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import useVuelidate from "@vuelidate/core";
import { required, minValue, maxValue, minLength, helpers } from "@vuelidate/validators";
import { useTimeEntry } from "@/composables/useTimeEntry.js";
import { useTimeTracker } from "@/composables/useTimeTracker.js";
import { takeTimerEntryPending } from "@/composables/timerEntryBridge.js";
import { useToast } from "@/composables/useToast.js";
import { inputFieldClass, btnPrimaryClass, btnSecondaryClass } from "@/utils/formFieldClasses.js";
import DatePickerField from "@/components/ui/DatePickerField.vue";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import ProjectPickerField from "@/components/ui/ProjectPickerField.vue";
import { emitActivity } from "@/utils/activityBus.js";

const {
  weekOf,
  expectedHours,
  entries,
  weekTotal,
  variance,
  addEntry,
  updateEntry,
  removeEntryById,
} = useTimeEntry();
const toast = useToast();
const route = useRoute();
const router = useRouter();
const { reset: resetTimer } = useTimeTracker();

const entryProjectNames = computed(() => {
  const s = new Set();
  for (const e of entries.value) {
    const p = e.project?.trim();
    if (p) s.add(p);
  }
  return [...s];
});

const timerConfirmOpen = ref(false);
const timerTrackedLabel = ref("");
const timerDraft = reactive({
  date: "",
  hours: 0.25,
  project: "",
  notes: "",
});

const timerHoursDisplay = computed(() => {
  const h = Number(timerDraft.hours);
  if (Number.isNaN(h)) return "—";
  return (Math.round(h * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
});

function openTimerConfirmFromBridge() {
  const q = route.query.timerEntry;
  if (q !== "1" && q !== 1) return;
  const p = takeTimerEntryPending();
  if (!p) {
    router.replace({ path: "/timesheet", query: {} });
    return;
  }
  timerDraft.date = typeof p.date === "string" ? p.date : new Date().toISOString().slice(0, 10);
  const h = Number(p.hours);
  timerDraft.hours = Number.isFinite(h) ? Math.min(24, Math.max(0.25, h)) : 0.25;
  timerDraft.project = typeof p.project === "string" ? p.project : "";
  timerDraft.notes = typeof p.notes === "string" ? p.notes : "";
  timerTrackedLabel.value = typeof p.trackedLabel === "string" ? p.trackedLabel : "";
  timerConfirmOpen.value = true;
  nextTick(() => {
    router.replace({ path: "/timesheet", query: {} });
  });
}

onMounted(() => {
  openTimerConfirmFromBridge();
});

watch(
  () => route.query.timerEntry,
  () => openTimerConfirmFromBridge(),
);

watch(timerConfirmOpen, (open) => {
  if (!open) timerTrackedLabel.value = "";
});

function confirmTimerEntry() {
  const project = timerDraft.project?.trim();
  if (!project || project.length < 2) {
    toast.error("Enter a project (at least 2 characters).", { module: "time" });
    return;
  }
  if (!timerDraft.date) {
    toast.error("Pick a date.", { module: "time" });
    return;
  }
  const h = Number(timerDraft.hours);
  if (Number.isNaN(h) || h <= 0 || h > 24) {
    toast.error("Hours must be between 0.25 and 24.", { module: "time" });
    return;
  }
  addEntry({
    date: timerDraft.date,
    hours: h,
    project,
    notes: timerDraft.notes?.trim() || "",
  });
  emitActivity({
    title: "Timer saved to timesheet",
    message: `${h}h · ${project}`,
    module: "time",
  });
  resetTimer();
  timerConfirmOpen.value = false;
  timerTrackedLabel.value = "";
  toast.success("Tracked time added to your timesheet.", { module: "time", action: "create" });
}

function cancelTimerEntry() {
  timerConfirmOpen.value = false;
  timerTrackedLabel.value = "";
}

const form = reactive({
  date: "",
  hours: 8,
  project: "",
  notes: "",
});

const viewOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const active = ref(null);

const editForm = reactive({
  date: "",
  hours: 8,
  project: "",
  notes: "",
});

const rules = {
  date: { required: helpers.withMessage("Date is required", required) },
  hours: {
    required: helpers.withMessage("Hours are required", required),
    minValue: helpers.withMessage("At least 0h", minValue(0)),
    maxValue: helpers.withMessage("Max 24h per row", maxValue(24)),
  },
  project: {
    required: helpers.withMessage("Project is required", required),
    minLength: helpers.withMessage("At least 2 characters", minLength(2)),
  },
};

const editRules = computed(() => ({
  date: { required: helpers.withMessage("Date is required", required) },
  hours: {
    required: helpers.withMessage("Hours are required", required),
    minValue: helpers.withMessage("At least 0h", minValue(0)),
    maxValue: helpers.withMessage("Max 24h per row", maxValue(24)),
  },
  project: {
    required: helpers.withMessage("Project is required", required),
    minLength: helpers.withMessage("At least 2 characters", minLength(2)),
  },
}));

const v$ = useVuelidate(rules, form);
const ev$ = useVuelidate(editRules, editForm);

const deleteMsg = "This will delete the selected row from your timesheet.";

function openEditForEntry(row) {
  active.value = row;
  editForm.date = row.date;
  editForm.hours = row.hours;
  editForm.project = row.project;
  editForm.notes = row.notes || "";
  ev$.value.$reset();
  editOpen.value = true;
}

function detailModalMenuFor(row) {
  return [
    {
      label: "Edit",
      action: () => {
        viewOpen.value = false;
        openEditForEntry(row);
      },
    },
    {
      label: "Delete",
      danger: true,
      action: () => {
        active.value = row;
        viewOpen.value = false;
        deleteOpen.value = true;
      },
    },
  ];
}

function menuItemsFor(row) {
  return [
    {
      label: "View",
      action: () => {
        active.value = row;
        viewOpen.value = true;
      },
    },
    {
      label: "Edit",
      action: () => openEditForEntry(row),
    },
    {
      label: "Delete",
      danger: true,
      action: () => {
        active.value = row;
        deleteOpen.value = true;
      },
    },
  ];
}

function onSubmit() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  addEntry({ ...form });
  emitActivity({
    title: "Time entry added",
    message: `${form.hours}h · ${form.project}`,
    module: "time",
  });
  toast.success("Time entry added.", { module: "time", action: "create" });
  form.notes = "";
  v$.value.$reset();
}

function saveEdit() {
  ev$.value.$touch();
  if (ev$.value.$invalid || !active.value) return;
  updateEntry(active.value.id, {
    date: editForm.date,
    hours: Number(editForm.hours),
    project: editForm.project.trim(),
    notes: editForm.notes?.trim() || "",
  });
  toast.success("Entry updated.", { module: "time", action: "update" });
  editOpen.value = false;
  ev$.value.$reset();
}

function onDeleteConfirmed() {
  if (!active.value) return;
  removeEntryById(active.value.id);
  toast.push("Entry removed.", "info", { module: "time", action: "delete" });
  active.value = null;
}
</script>
