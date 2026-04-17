<template>
  <div class="min-h-full bg-page-bg px-4 py-6 dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1 class="page-title mb-1">Benefits</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Review coverage and change enrollment for eligible programs.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <article
          v-for="b in items"
          :key="b.id"
          class="relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <h2 class="text-lg font-semibold text-navy dark:text-slate-100">{{ b.name }}</h2>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ b.provider }} · {{ b.tier }}</p>
            </div>
            <div class="flex shrink-0 items-start gap-2">
              <span
                class="inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase"
                :class="b.enrolled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'"
              >
                {{ b.enrolled ? "Enrolled" : "Not enrolled" }}
              </span>
              <DropdownMenu aria-label="Benefit actions" :items="menuItemsFor(b)" />
            </div>
          </div>
          <p class="mt-3 flex-1 text-sm text-gray-700 dark:text-gray-300">{{ b.description }}</p>
          <p v-if="b.renewal" class="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Renewal: {{ b.renewal }}
          </p>
        </article>
      </div>
    </div>

    <ModalPanel v-model="detailOpen">
      <template #title>{{ active?.name }}</template>
      <template v-if="active" #badges>
        <StatusBadge
          :class="
            active.enrolled
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
          "
        >
          {{ active.enrolled ? "Enrolled" : "Not enrolled" }}
        </StatusBadge>
      </template>
      <template v-if="active" #actions>
        <DropdownMenu aria-label="Benefit actions" :items="benefitDetailModalMenu(active)" />
      </template>
      <dl v-if="active" class="space-y-3">
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Provider</dt><dd class="mt-0.5">{{ active.provider }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Tier</dt><dd class="mt-0.5">{{ active.tier }}</dd></div>
        <div v-if="active.renewal"><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Renewal</dt><dd class="mt-0.5">{{ active.renewal }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Description</dt><dd class="mt-0.5 whitespace-pre-wrap">{{ active.description }}</dd></div>
      </dl>
    </ModalPanel>

    <ConfirmDialog
      v-model="confirmWaiveOpen"
      title="Waive this benefit?"
      :message="waiveMessage"
      confirm-label="Waive"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onWaiveConfirmed"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import seed from "@/data/benefits.json";
import { useToast } from "@/composables/useToast.js";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";

const items = ref(seed.map((b) => ({ ...b })));
const toast = useToast();

const detailOpen = ref(false);
const confirmWaiveOpen = ref(false);
const active = ref(null);
const waiveTarget = ref(null);

const waiveMessage = "You will be opted out of this program for the current plan year (demo).";

function benefitDetailModalMenu(b) {
  return [
    {
      label: "Edit enrollment",
      action: () => {
        detailOpen.value = false;
        toast.info("Enrollment changes apply in the next open period (demo).", { module: "benefits", action: "update" });
      },
    },
    {
      label: b.enrolled ? "Waive / opt out" : "Enroll",
      danger: b.enrolled,
      action: () => {
        detailOpen.value = false;
        if (!b.enrolled) {
          enroll(b.id);
          return;
        }
        waiveTarget.value = b;
        confirmWaiveOpen.value = true;
      },
    },
  ];
}

function menuItemsFor(b) {
  return [
    {
      label: "View details",
      action: () => {
        active.value = b;
        detailOpen.value = true;
      },
    },
    {
      label: b.enrolled ? "Waive / opt out" : "Enroll",
      danger: b.enrolled,
      action: () => {
        if (!b.enrolled) {
          enroll(b.id);
          return;
        }
        waiveTarget.value = b;
        confirmWaiveOpen.value = true;
      },
    },
  ];
}

function enroll(id) {
  const b = items.value.find((x) => x.id === id);
  if (!b || b.enrolled) return;
  b.enrolled = true;
  toast.success(`Enrolled in ${b.name}.`, { module: "benefits", action: "create" });
}

function onWaiveConfirmed() {
  const b = waiveTarget.value;
  waiveTarget.value = null;
  if (!b) return;
  const row = items.value.find((x) => x.id === b.id);
  if (!row || !row.enrolled) return;
  row.enrolled = false;
  toast.push(`You opted out of ${row.name}.`, "info", { module: "benefits", action: "update" });
}

</script>
