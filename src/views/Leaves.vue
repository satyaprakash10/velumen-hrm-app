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
                <td class="px-6 py-3 text-gray-900 dark:text-gray-100">{{ row.type }}</td>
                <td class="px-6 py-3 tabular-nums text-gray-700 dark:text-gray-300">
                  {{ row.startDate }} – {{ row.endDate }}
                </td>
                <td class="px-6 py-3 tabular-nums text-gray-700 dark:text-gray-300">{{ row.days }}</td>
                <td class="px-6 py-3">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase"
                    :class="statusClass(row.status)"
                  >
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

    <ModalPanel v-model="viewOpen">
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
      <dl v-if="activeRow" class="space-y-3">
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Type</dt><dd class="mt-0.5">{{ activeRow.type }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Dates</dt><dd class="mt-0.5 tabular-nums">{{ activeRow.startDate }} – {{ activeRow.endDate }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Days</dt><dd class="mt-0.5">{{ activeRow.days }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Reason</dt><dd class="mt-0.5 whitespace-pre-wrap">{{ activeRow.reason }}</dd></div>
      </dl>
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

const { leaves, addLeave, updateLeave, removeLeave, approvedDaysYtd } = useLeaves();
const toast = useToast();

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
function detailModalMenuFor(row) {
  return [
    {
      label: "Edit",
      action: () => {
        viewOpen.value = false;
        openEditForRow(row);
      },
    },
    {
      label: "Delete",
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
      action: () => {
        activeRow.value = row;
        viewOpen.value = true;
      },
    },
    {
      label: "Edit",
      action: () => openEditForRow(row),
    },
    {
      label: "Delete",
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
