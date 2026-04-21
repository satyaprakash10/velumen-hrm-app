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
          class="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
        >
          <div class="flex items-start gap-3">
            <span
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1"
              :class="benefitIconTone(b)"
              aria-hidden="true"
            >
              <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="benefitIconFor(b)" />
            </span>
            <div class="min-w-0 flex-1">
              <button
                type="button"
                class="table-title-link text-left text-lg font-semibold text-navy dark:text-slate-100"
                @click="openDetail(b)"
              >
                <span class="table-title-link-text">{{ b.name }}</span>
              </button>
              <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{{ b.provider }} · {{ b.tier }}</p>
            </div>
            <div class="flex shrink-0 items-start gap-2">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
                :class="b.enrolled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'"
              >
                <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="3.5" fill="currentColor" />
                </svg>
                {{ b.enrolled ? "Enrolled" : "Not enrolled" }}
              </span>
              <DropdownMenu aria-label="Benefit actions" :items="menuItemsFor(b)" />
            </div>
          </div>
          <p class="mt-3 flex-1 text-sm text-gray-700 dark:text-gray-300">{{ b.description }}</p>
          <p v-if="b.renewal" class="mt-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.3" />
              <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
            </svg>
            Renewal: {{ b.renewal }}
          </p>
        </article>
      </div>
    </div>

    <ModalPanel v-model="detailOpen" :icon="active ? benefitIconFor(active) : ''">
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
      <div v-if="active" class="space-y-4">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ModalFact label="Provider" :value="active.provider" icon="briefcase" tone="indigo" />
          <ModalFact label="Tier" :value="active.tier" icon="badge" tone="violet" />
          <ModalFact
            v-if="active.renewal"
            label="Renewal"
            :value="active.renewal"
            icon="calendar"
            tone="sky"
          />
          <ModalFact
            label="Status"
            :value="active.enrolled ? 'Enrolled' : 'Not enrolled'"
            :icon="active.enrolled ? 'check' : 'info'"
            :tone="active.enrolled ? 'emerald' : 'slate'"
            badge
          />
        </div>
        <div>
          <p class="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
            About
          </p>
          <p class="mt-1.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-slate-700 dark:text-slate-300">
            {{ active.description }}
          </p>
        </div>
      </div>
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
import { emitActivity } from "@/utils/activityBus.js";
import { usePageActivity } from "@/composables/usePageActivity.js";

usePageActivity({
  title: "Benefits opened",
  module: "benefits",
  to: "/benefits",
});
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import ModalFact from "@/components/shared/ModalFact.vue";

const items = ref(seed.map((b) => ({ ...b })));
const toast = useToast();

const detailOpen = ref(false);
const confirmWaiveOpen = ref(false);
const active = ref(null);
const waiveTarget = ref(null);

const waiveMessage = "You will be opted out of this program for the current plan year (demo).";

function openDetail(b) {
  active.value = b;
  detailOpen.value = true;
}

function benefitDetailModalMenu(b) {
  return [
    {
      label: "Edit enrollment",
      icon: "pencil",
      action: () => {
        detailOpen.value = false;
        toast.info("Enrollment changes apply in the next open period (demo).", { module: "benefits", action: "update" });
      },
    },
    { divider: true },
    {
      label: b.enrolled ? "Waive / opt out" : "Enroll",
      icon: b.enrolled ? "clipboardList" : "check",
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
      icon: "eye",
      action: () => openDetail(b),
    },
    {
      label: b.enrolled ? "Waive / opt out" : "Enroll",
      icon: b.enrolled ? "clipboardList" : "check",
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

const BENEFIT_ICONS = {
  health: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  dental: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3C8 3 6 5 6 8c0 2 1 3 1 5s0 4 1 6 2 2 3 0l1-4 1 4c1 2 2 2 3 0s1-4 1-6 1-3 1-5c0-3-2-5-6-5z"/></svg>`,
  vision: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="7" cy="13" r="3"/><circle cx="17" cy="13" r="3"/><path stroke-linecap="round" d="M10 13h4M3 10l2-4h4M21 10l-2-4h-4"/></svg>`,
  retirement: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 20V8l8-4 8 4v12"/><path stroke-linecap="round" d="M10 20v-5a2 2 0 014 0v5"/></svg>`,
  life: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.5-7-10a5 5 0 019.5-2A5 5 0 0119 11c0 5.5-7 10-7 10z"/></svg>`,
  wellness: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 13a8 8 0 1116 0v6H4v-6z"/><path stroke-linecap="round" d="M9 16h6"/></svg>`,
  default: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path stroke-linecap="round" d="M7 10h10M7 14h6"/></svg>`,
};

function benefitIconFor(b) {
  const key = String(b.category || b.name || "").toLowerCase();
  if (key.includes("dental")) return BENEFIT_ICONS.dental;
  if (key.includes("vision") || key.includes("eye")) return BENEFIT_ICONS.vision;
  if (key.includes("retire") || key.includes("401")) return BENEFIT_ICONS.retirement;
  if (key.includes("life")) return BENEFIT_ICONS.life;
  if (key.includes("well") || key.includes("gym") || key.includes("fitness")) return BENEFIT_ICONS.wellness;
  if (key.includes("health") || key.includes("medical")) return BENEFIT_ICONS.health;
  return BENEFIT_ICONS.default;
}

function benefitIconTone(b) {
  const key = String(b.category || b.name || "").toLowerCase();
  if (key.includes("dental") || key.includes("vision"))
    return "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60";
  if (key.includes("retire") || key.includes("401"))
    return "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900/60";
  if (key.includes("life"))
    return "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-900/60";
  if (key.includes("well") || key.includes("gym"))
    return "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60";
  return "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/60";
}

function enroll(id) {
  const b = items.value.find((x) => x.id === id);
  if (!b || b.enrolled) return;
  b.enrolled = true;
  toast.success(`Enrolled in ${b.name}.`, { module: "benefits", action: "create" });
  emitActivity({
    title: "Benefit enrolled",
    message: `${b.name} · ${b.provider}`,
    module: "benefits",
    severity: "success",
    toast: false,
    silent: true,
    context: { event: "benefit_enroll", benefitId: b.id },
  });
}

function onWaiveConfirmed() {
  const b = waiveTarget.value;
  waiveTarget.value = null;
  if (!b) return;
  const row = items.value.find((x) => x.id === b.id);
  if (!row || !row.enrolled) return;
  row.enrolled = false;
  toast.push(`You opted out of ${row.name}.`, "info", { module: "benefits", action: "update" });
  emitActivity({
    title: "Benefit waived",
    message: `${row.name} · ${row.provider}`,
    module: "benefits",
    severity: "warning",
    toast: false,
    silent: true,
    context: { event: "benefit_waive", benefitId: row.id },
  });
}

</script>
