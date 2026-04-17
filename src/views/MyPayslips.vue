<template>
  <div class="min-h-full bg-page-bg px-4 py-6 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1
        class="mb-6 text-[26px] font-bold leading-tight tracking-tight text-gray-900 md:text-[28px]"
      >
        My payslips
      </h1>

      <div
        class="overflow-hidden rounded-xl bg-white shadow-card ring-1 ring-black/[0.04]"
      >
        <CurrencyTabs v-model="activeCurrency" :tabs="currencyTabItems" />

        <div
          class="flex flex-col gap-3 border-b border-subtle-02 bg-white px-4 py-3.5 dark:border-gray-800 dark:bg-gray-900 sm:flex-row sm:items-center sm:justify-between md:px-6"
        >
          <nav
            class="text-sm text-gray-500 md:hidden dark:text-gray-400"
            aria-label="Section"
          >
            <span>Payslips</span>
            <span class="mx-2 font-normal text-gray-300 dark:text-gray-600"
              >&gt;</span
            >
            <span class="font-semibold text-navy dark:text-gray-100">{{
              displayYear
            }}</span>
          </nav>
          <label class="min-w-0 flex-1 sm:max-w-xs md:order-first md:mr-auto">
            <span class="sr-only">Search payslips</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Search period, status, filename…"
              class="w-full rounded-lg border border-subtle-02 bg-white px-3 py-2 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
          </label>
          <div class="relative flex shrink-0 items-center group md:ml-auto">
            <div
              class="pointer-events-none absolute right-full top-1/2 z-10 mr-2 hidden -translate-y-1/2 sm:block"
              role="tooltip"
            >
              <div
                class="relative whitespace-nowrap rounded-lg bg-[#1A3E6D] px-3 py-2 text-xs font-medium leading-none text-white opacity-0 shadow-[0_8px_24px_rgba(26,62,109,0.35)] transition-all duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
              >
                View salary evolution
                <span
                  class="absolute left-full top-1/2 -translate-y-1/2 border-y-[6px] border-l-[7px] border-y-transparent border-l-[#1A3E6D]"
                  aria-hidden="true"
                />
              </div>
            </div>
            <button
              type="button"
              class="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl p-0 shadow-sm ring-1 ring-black/10 transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A3E6D]/50 focus-visible:ring-offset-2"
              aria-label="View salary evolution"
              @click="salaryModalOpen = true"
            >
              <img
                :src="salaryEvolutionIconUrl"
                alt=""
                class="h-10 w-10 object-cover"
                width="40"
                height="40"
                draggable="false"
              />
            </button>
          </div>
        </div>

        <PayslipTable
          :payslips="displayedPayslips"
          :year="displayYear"
          :loading="loading"
          :sort-field="sortField"
          :sort-dir="sortDir"
          @sort="toggleSort"
          @delete="removePayslip"
        />
      </div>
    </div>

    <SalaryModal
      :visible="salaryModalOpen"
      :payslips="sortedPayslips"
      :currency="activeCurrency"
      @close="salaryModalOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { usePayslips } from "@/composables/usePayslips.js";
import CurrencyTabs from "@/components/payslips/CurrencyTabs.vue";
import PayslipTable from "@/components/payslips/PayslipTable.vue";
import SalaryModal from "@/components/payslips/SalaryModal.vue";
import salaryEvolutionIconUrl from "@/assets/icons/salary-evolution-trailing.svg?url";

const salaryModalOpen = ref(false);
const searchQuery = ref("");

const {
  loading,
  activeCurrency,
  currencyTabItems,
  displayYear,
  sortedPayslips,
  sortField,
  sortDir,
  toggleSort,
  removePayslip,
} = usePayslips();

const displayedPayslips = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return sortedPayslips.value;
  return sortedPayslips.value.filter((p) => {
    const label = p.fileAttachment?.file?.label || "";
    const period = new Date(p.payrollDate).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
    const hay =
      `${label} ${period} ${p.status} ${p.issueDateLabel}`.toLowerCase();
    return hay.includes(q);
  });
});
</script>
