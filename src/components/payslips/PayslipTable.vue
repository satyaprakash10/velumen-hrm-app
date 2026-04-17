<template>
  <div
    class="max-w-full min-w-0 payslip-scroll-x"
    role="table"
    aria-label="Payslips"
  >
    <div role="rowgroup" class="hidden md:block">
      <div
        class="sticky top-0 z-20 hidden min-w-[968px] grid-cols-[28px_minmax(120px,1.1fr)_minmax(200px,2.2fr)_minmax(112px,1fr)_minmax(104px,1fr)_minmax(88px,0.85fr)_52px] items-stretch gap-x-3 border-b border-subtle-02 bg-white pr-6 text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-gray-400 shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 md:grid md:pl-0"
      >
        <div
          class="relative flex items-center justify-center self-stretch bg-transparent"
        >
          <span class="sr-only">Expand or collapse payslip row</span>
        </div>
        <div class="flex items-center py-3 text-left" role="columnheader">
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded px-1 py-0.5 text-left font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 active:scale-[0.98]"
            :aria-sort="periodAriaSort"
            @click="$emit('sort', 'date')"
          >
            Period
            <span class="sr-only">{{ sortHint("date") }}</span>
            <span
              aria-hidden="true"
              class="text-[10px] font-normal normal-case"
              >{{ sortChevron("date") }}</span
            >
          </button>
        </div>
        <span
          class="flex min-w-0 items-center py-3 text-left"
          role="columnheader"
          >Payslip name</span
        >
        <span class="flex items-center py-3 text-left" role="columnheader"
          >Issue date</span
        >
        <div
          class="flex items-center justify-end py-3 text-right"
          role="columnheader"
        >
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 active:scale-[0.98]"
            :aria-sort="netAriaSort"
            @click="$emit('sort', 'net')"
          >
            Net salary
            <span class="sr-only">{{ sortHint("net") }}</span>
            <span
              aria-hidden="true"
              class="text-[10px] font-normal normal-case"
              >{{ sortChevron("net") }}</span
            >
          </button>
        </div>
        <span class="flex items-center py-3 text-left" role="columnheader"
          >Status</span
        >
        <div class="flex items-center justify-center py-3" aria-hidden="true" />
      </div>
    </div>

    <div v-if="loading" role="status" aria-live="polite" aria-busy="true">
      <span class="sr-only">Loading payslips</span>
      <PayslipTableSkeleton :rows="skeletonRows" />
    </div>

    <div v-else role="rowgroup">
      <template v-if="payslips.length">
        <PayslipRow
          v-for="payslip in payslips"
          :key="payslip.fileAttachment.accessToken"
          :payslip="payslip"
          :expanded="openAccessToken === payslip.fileAttachment.accessToken"
          @toggle="onRowToggle(payslip.fileAttachment.accessToken)"
          @delete="onRowDelete"
        />
      </template>

      <div
        v-else
        class="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center"
        role="status"
      >
        <p class="text-sm font-medium text-gray-700">No payslips to show</p>
        <p class="max-w-sm text-sm text-gray-500">
          There are no payslips for this currency, or they may have been
          removed. Try another currency tab or check back later.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import PayslipRow from "./PayslipRow.vue";
import PayslipTableSkeleton from "./PayslipTableSkeleton.vue";

const props = defineProps({
  payslips: {
    type: Array,
    required: true,
  },
  year: {
    type: Number,
    default: () => new Date().getFullYear(),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  sortField: {
    type: String,
    default: "date",
  },
  sortDir: {
    type: String,
    default: "desc",
  },
});

const emit = defineEmits(["delete", "sort"]);

const skeletonRows = 5;

const periodAriaSort = computed(() => ariaSortFor("date"));
const netAriaSort = computed(() => ariaSortFor("net"));

function ariaSortFor(field) {
  if (props.sortField !== field) return "none";
  return props.sortDir === "asc" ? "ascending" : "descending";
}

function sortChevron(field) {
  if (props.sortField !== field) return "↕";
  return props.sortDir === "asc" ? "↑" : "↓";
}

function sortHint(field) {
  if (props.sortField !== field)
    return `Sort by ${field === "date" ? "date" : "net pay"}`;
  return props.sortDir === "asc"
    ? "Sorted ascending, press to reverse"
    : "Sorted descending, press to reverse";
}

const openAccessToken = ref(null);

watch(
  () => props.payslips,
  (list) => {
    if (!list.length) {
      openAccessToken.value = null;
      return;
    }
    const tokens = new Set(list.map((p) => p.fileAttachment.accessToken));
    if (openAccessToken.value == null || !tokens.has(openAccessToken.value)) {
      openAccessToken.value = list[0].fileAttachment.accessToken;
    }
  },
  { immediate: true },
);

function onRowToggle(token) {
  openAccessToken.value = openAccessToken.value === token ? null : token;
}

function onRowDelete(token) {
  emit("delete", token);
}
</script>
