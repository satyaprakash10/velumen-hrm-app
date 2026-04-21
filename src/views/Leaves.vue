<template>
  <div class="min-h-full bg-page-bg px-4 py-6 dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1 class="page-title mb-1">Leave management</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Request time off and track your leave history.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div
          v-for="b in balanceCards"
          :key="b.label"
          class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {{ b.label }}
          </p>
          <p class="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">{{ b.value }}</p>
        </div>
      </div>

      <div class="mt-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 class="text-lg font-semibold text-navy dark:text-slate-100">Apply for leave</h2>
        <form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
          <label class="block md:col-span-2">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Leave type</span>
            <SearchableListbox
              v-model="form.type"
              class="mt-1.5 block"
              :options="leaveTypeOptions"
              placeholder="Select type"
              :searchable="false"
              :invalid="v$.type.$error"
            />
            <p v-if="v$.type.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.type.$errors[0]?.$message }}
            </p>
          </label>
          <label class="block">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Start date</span>
            <DatePickerField v-model="form.startDate" class="mt-1.5 block" :invalid="v$.startDate.$error" />
            <p v-if="v$.startDate.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.startDate.$errors[0]?.$message }}
            </p>
          </label>
          <label class="block">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">End date</span>
            <DatePickerField v-model="form.endDate" class="mt-1.5 block" :invalid="v$.endDate.$error" />
            <p v-if="v$.endDate.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.endDate.$errors[0]?.$message }}
            </p>
          </label>
          <label class="block md:col-span-2">
            <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Reason</span>
            <textarea
              v-model="form.reason"
              rows="3"
              :class="inputFieldClass(v$.reason.$error)"
              placeholder="Brief reason for your request"
            />
            <p v-if="v$.reason.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
              {{ v$.reason.$errors[0]?.$message }}
            </p>
          </label>
          <div class="md:col-span-2">
            <button type="submit" :class="btnPrimaryClass">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Submit request
            </button>
          </div>
        </form>
      </div>

      <div class="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between md:px-6 dark:border-slate-800">
          <h2 class="text-lg font-semibold text-navy dark:text-slate-100">
            Leave history
          </h2>
          <label class="block w-full sm:max-w-xs">
            <span class="sr-only">Search table</span>
            <input
              v-model="tableQuery"
              type="search"
              placeholder="Search type, status, reason…"
              :class="inputFieldClass(false)"
            />
          </label>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-[720px] w-full text-left text-sm">
            <thead class="border-b border-slate-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">Type</th>
                <th class="px-6 py-3">Dates</th>
                <th class="px-6 py-3">Days</th>
                <th class="px-6 py-3">Status</th>
                <th class="px-6 py-3">Reason</th>
                <th class="w-14 px-2 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="row in filteredLeaves" :key="row.id" class="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1"
                      :class="leaveIconTone(row.type)"
                      aria-hidden="true"
                    >
                      <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="leaveIconFor(row.type)" />
                    </span>
                    <button
                      type="button"
                      class="table-title-link text-left text-gray-900 dark:text-gray-100"
                      @click="openView(row)"
                    >
                      <span class="table-title-link-text">{{ row.type }}</span>
                    </button>
                  </div>
                </td>
                <td class="px-6 py-3 tabular-nums text-gray-700 dark:text-gray-300">
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-3.5 w-3.5 text-slate-400" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3" />
                      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                    {{ row.startDate }} – {{ row.endDate }}
                  </span>
                </td>
                <td class="px-6 py-3 tabular-nums text-gray-700 dark:text-gray-300">{{ row.days }}</td>
                <td class="px-6 py-3">
                  <span
                    class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                    :class="statusClass(row.status)"
                  >
                    <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="3.5" fill="currentColor" />
                    </svg>
                    {{ row.status }}
                  </span>
                </td>
                <td class="max-w-[200px] truncate px-6 py-3 text-gray-600 dark:text-gray-400" :title="row.reason">
                  {{ row.reason }}
                </td>
                <td class="px-2 py-2 text-right align-middle">
                  <DropdownMenu
                    aria-label="Leave row actions"
                    :items="menuItemsFor(row)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="!filteredLeaves.length"
          class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
          role="status"
        >
          No matching leave records.
        </div>
      </div>
    </div>

    <ModalPanel v-model="viewOpen" :icon="activeRow ? leaveIconFor(activeRow.type) : ''">
      <template #title>Leave request</template>
      <template v-if="activeRow" #badges>
        <StatusBadge :class="statusClass(activeRow.status)">{{ activeRow.status }}</StatusBadge>
      </template>
      <template #subtitle>Dates, status, and reason for this request.</template>
      <template v-if="activeRow" #actions>
        <DropdownMenu
          aria-label="Leave request actions"
          :items="detailModalMenuFor(activeRow)"
        />
      </template>
      <div v-if="activeRow" class="space-y-4">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ModalFact
            label="Leave type"
            :value="activeRow.type"
            icon="tag"
            :tone="leaveTone(activeRow.type)"
            badge
          />
          <ModalFact
            label="Status"
            :value="activeRow.status"
            :icon="statusIcon(activeRow.status)"
            :tone="statusTone(activeRow.status)"
            badge
          />
          <ModalFact
            label="Dates"
            :value="`${activeRow.startDate} → ${activeRow.endDate}`"
            icon="calendar"
            tone="sky"
          />
          <ModalFact
            label="Duration"
            :value="`${activeRow.days} day${activeRow.days === 1 ? '' : 's'}`"
            icon="clock"
            tone="indigo"
          />
        </div>
        <div>
          <p class="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            Reason
          </p>
          <p class="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {{ activeRow.reason || "—" }}
          </p>
        </div>
      </div>
    </ModalPanel>

    <ModalPanel v-model="editOpen">
      <template #title>Edit leave</template>
      <template #subtitle>Update the fields below, then save your changes.</template>
      <form v-if="activeRow" class="space-y-4" @submit.prevent="saveEdit">
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Type</span>
          <SearchableListbox
            v-model="editForm.type"
            class="mt-1.5 block"
            :options="leaveTypeOptions"
            placeholder="Select type"
            :searchable="false"
            :invalid="ev$.type.$error"
          />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Start</span>
          <DatePickerField v-model="editForm.startDate" class="mt-1.5 block" :invalid="ev$.startDate.$error" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">End</span>
          <DatePickerField v-model="editForm.endDate" class="mt-1.5 block" :invalid="ev$.endDate.$error" />
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Reason</span>
          <textarea v-model="editForm.reason" rows="3" :class="inputFieldClass(ev$.reason.$error)" />
        </label>
        <div class="flex flex-wrap gap-2 pt-2">
          <button type="submit" :class="btnPrimaryClass">Save</button>
          <button type="button" :class="btnSecondaryClass" @click="editOpen = false">Cancel</button>
        </div>
      </form>
    </ModalPanel>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Delete leave record?"
      :message="deleteMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, minLength, helpers } from "@vuelidate/validators";
import { useLeaves } from "@/composables/useLeaves.js";
import { useToast } from "@/composables/useToast.js";
import { inputFieldClass, btnPrimaryClass, btnSecondaryClass } from "@/utils/formFieldClasses.js";
import SearchableListbox from "@/components/ui/SearchableListbox.vue";
import DatePickerField from "@/components/ui/DatePickerField.vue";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import ModalFact from "@/components/shared/ModalFact.vue";
import { usePageActivity } from "@/composables/usePageActivity.js";

const { leaves, addLeave, updateLeave, removeLeave, approvedDaysYtd } = useLeaves();
const toast = useToast();

usePageActivity({
  title: "Leaves opened",
  module: "leaves",
  to: "/leaves",
});

const leaveTypes = [
  "Annual leave",
  "Sick leave",
  "Personal leave",
  "Unpaid leave",
];

const leaveTypeOptions = leaveTypes.map((t) => ({ value: t, label: t }));

const form = reactive({
  type: "",
  startDate: "",
  endDate: "",
  reason: "",
});

const tableQuery = ref("");
const viewOpen = ref(false);
const editOpen = ref(false);
const deleteOpen = ref(false);
const activeRow = ref(null);

const editForm = reactive({
  type: "",
  startDate: "",
  endDate: "",
  reason: "",
});

const rules = {
  type: { required: helpers.withMessage("Select a leave type", required) },
  startDate: { required: helpers.withMessage("Start date is required", required) },
  endDate: {
    required: helpers.withMessage("End date is required", required),
    afterOrSame: helpers.withMessage(
      "End date must be on or after start date",
      (value) => {
        if (!value || !form.startDate) return true;
        return new Date(value) >= new Date(form.startDate);
      },
    ),
  },
  reason: {
    required: helpers.withMessage("Reason is required", required),
    minLength: helpers.withMessage("At least 5 characters", minLength(5)),
  },
};

const editRules = computed(() => ({
  type: { required: helpers.withMessage("Select a leave type", required) },
  startDate: { required: helpers.withMessage("Start date is required", required) },
  endDate: {
    required: helpers.withMessage("End date is required", required),
    afterOrSame: helpers.withMessage(
      "End date must be on or after start date",
      (value) => {
        if (!value || !editForm.startDate) return true;
        return new Date(value) >= new Date(editForm.startDate);
      },
    ),
  },
  reason: {
    required: helpers.withMessage("Reason is required", required),
    minLength: helpers.withMessage("At least 5 characters", minLength(5)),
  },
}));

const v$ = useVuelidate(rules, form);
const ev$ = useVuelidate(editRules, editForm);

const filteredLeaves = computed(() => {
  const q = tableQuery.value.trim().toLowerCase();
  if (!q) return leaves.value;
  return leaves.value.filter(
    (row) =>
      row.type.toLowerCase().includes(q) ||
      row.status.toLowerCase().includes(q) ||
      row.reason.toLowerCase().includes(q) ||
      `${row.startDate} ${row.endDate}`.includes(q),
  );
});

const balanceCards = computed(() => [
  { label: "Annual balance (mock)", value: "18 days" },
  { label: "Taken (YTD)", value: `${approvedDaysYtd.value} days` },
  { label: "Pending requests", value: String(leaves.value.filter((l) => l.status === "Pending").length) },
]);

const deleteMessage = computed(() =>
  activeRow.value
    ? `Remove this ${activeRow.value.type} request (${activeRow.value.startDate} – ${activeRow.value.endDate})?`
    : "",
);

function statusClass(s) {
  if (s === "Approved") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200";
  if (s === "Pending") return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200";
  if (s === "Rejected") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
}

function openEditForRow(row) {
  activeRow.value = row;
  editForm.type = row.type;
  editForm.startDate = row.startDate;
  editForm.endDate = row.endDate;
  editForm.reason = row.reason;
  ev$.value.$reset();
  editOpen.value = true;
}

/** Edit + Delete for detail modal (same behavior as table row, without View). */
function openView(row) {
  activeRow.value = row;
  viewOpen.value = true;
}

const LEAVE_ICONS = {
  annual: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2a5 5 0 00-5 5c0 3 5 10 5 10s5-7 5-10a5 5 0 00-5-5z"/><circle cx="12" cy="7" r="1.5" fill="currentColor"/></svg>`,
  sick: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M8 13h8M12 9v8"/><rect x="3.5" y="3.5" width="17" height="17" rx="3"/></svg>`,
  personal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="3.5"/><path stroke-linecap="round" stroke-linejoin="round" d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></svg>`,
  unpaid: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8.5"/><path stroke-linecap="round" d="M12 7v5l3 2"/></svg>`,
  wfh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path stroke-linecap="round" stroke-linejoin="round" d="M4 11l8-7 8 7v9a2 2 0 01-2 2H6a2 2 0 01-2-2v-9z"/><path stroke-linecap="round" d="M10 22v-6h4v6"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path stroke-linecap="round" d="M3 9h18M8 3v4M16 3v4"/></svg>`,
};

function leaveIconFor(type) {
  const key = String(type || "").toLowerCase();
  if (key.includes("sick")) return LEAVE_ICONS.sick;
  if (key.includes("personal")) return LEAVE_ICONS.personal;
  if (key.includes("unpaid")) return LEAVE_ICONS.unpaid;
  if (key.includes("home") || key.includes("wfh") || key.includes("remote")) return LEAVE_ICONS.wfh;
  if (key.includes("annual") || key.includes("vacation") || key.includes("pto")) return LEAVE_ICONS.annual;
  return LEAVE_ICONS.default;
}

function leaveIconTone(type) {
  const key = String(type || "").toLowerCase();
  if (key.includes("sick")) return "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/60";
  if (key.includes("personal")) return "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/60";
  if (key.includes("unpaid")) return "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700";
  if (key.includes("home") || key.includes("remote")) return "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/60";
  return "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60";
}

function leaveTone(type) {
  const key = String(type || "").toLowerCase();
  if (key.includes("sick")) return "rose";
  if (key.includes("personal")) return "violet";
  if (key.includes("unpaid")) return "slate";
  if (key.includes("home") || key.includes("remote")) return "amber";
  return "sky";
}

function statusTone(status) {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "emerald";
    case "pending":
    case "review":
      return "amber";
    case "rejected":
      return "rose";
    default:
      return "slate";
  }
}

function statusIcon(status) {
  switch (String(status || "").toLowerCase()) {
    case "approved":
      return "check";
    case "rejected":
      return "info";
    default:
      return "clock";
  }
}

function detailModalMenuFor(row) {
  return [
    {
      label: "Edit",
      icon: "pencil",
      action: () => {
        viewOpen.value = false;
        openEditForRow(row);
      },
    },
    { divider: true },
    {
      label: "Delete",
      icon: "trash",
      danger: true,
      action: () => {
        activeRow.value = row;
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
      icon: "eye",
      action: () => {
        activeRow.value = row;
        viewOpen.value = true;
      },
    },
    {
      label: "Edit",
      icon: "pencil",
      action: () => openEditForRow(row),
    },
    { divider: true },
    {
      label: "Delete",
      icon: "trash",
      danger: true,
      action: () => {
        activeRow.value = row;
        deleteOpen.value = true;
      },
    },
  ];
}

function onSubmit() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  addLeave({
    type: form.type,
    startDate: form.startDate,
    endDate: form.endDate,
    reason: form.reason.trim(),
  });
  toast.success("Leave request submitted for approval.", { module: "leaves" });
  form.type = "";
  form.startDate = "";
  form.endDate = "";
  form.reason = "";
  v$.value.$reset();
}

function saveEdit() {
  ev$.value.$touch();
  if (ev$.value.$invalid || !activeRow.value) return;
  updateLeave(activeRow.value.id, {
    type: editForm.type,
    startDate: editForm.startDate,
    endDate: editForm.endDate,
    reason: editForm.reason.trim(),
  });
  toast.success("Leave updated.", { module: "leaves", action: "update" });
  editOpen.value = false;
  ev$.value.$reset();
}

function onDeleteConfirmed() {
  if (!activeRow.value) return;
  removeLeave(activeRow.value.id);
  toast.push("Leave record removed.", "info", { module: "leaves", action: "delete" });
  activeRow.value = null;
}
</script>
