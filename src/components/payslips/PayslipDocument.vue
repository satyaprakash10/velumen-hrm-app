<template>
  <div
    id="payslip-print-area"
    class="payslip-doc min-w-0 w-full max-w-full bg-white text-[#111827]"
  >
    <div
      class="mx-auto w-full min-w-0 max-w-[min(100%,56rem)] print:max-w-none"
    >
      <header
        class="min-w-0 gap-4 px-4 pt-4 pb-2 border-subtle-02 sm:px-6 sm:pb-0 sm:pt-5 md:px-8"
      >
        <div class="flex shrink-0 flex-col gap-2.5">
          <div class="flex items-center justify-end gap-2">
            <button
              type="button"
              class="inline-flex p-0 leading-none transition bg-transparent border-0 cursor-pointer shrink-0 rounded-xl hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 focus-visible:ring-offset-2"
              aria-label="Zoom in"
              @click="zoom = Math.min(zoom + 0.08, 1.2)"
            >
              <img
                :src="zoomInIconUrl"
                alt=""
                class="block w-8 h-8"
                width="32"
                height="32"
                draggable="false"
              />
            </button>
            <button
              type="button"
              class="inline-flex p-0 leading-none transition bg-transparent border-0 cursor-pointer shrink-0 rounded-xl hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 focus-visible:ring-offset-2"
              aria-label="Zoom out"
              @click="zoom = Math.max(zoom - 0.08, 0.85)"
            >
              <img
                :src="zoomOutIconUrl"
                alt=""
                class="block w-8 h-8"
                width="32"
                height="32"
                draggable="false"
              />
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div class="min-w-0">
              <img
                src="/logo-mark.svg"
                :alt="employerName"
                class="h-auto w-[92px] shrink-0 object-contain object-left"
                width="92"
                height="80"
              />
            </div>
            <h2
              class="text-right text-xl mt-12 font-light leading-tight tracking-tight text-[#6B7280] md:text-[22px]"
            >
              Payslip
            </h2>
          </div>
        </div>
      </header>

      <div
        class="payslip-zoom-viewport payslip-scrollbar min-w-0 w-full max-w-full overflow-x-auto overflow-y-auto overscroll-x-contain print:!overflow-visible"
      >
        <div
          class="px-4 pt-5 pb-8 transition-transform duration-200 ease-out payslip-zoom-canvas sm:px-6 sm:pb-10 sm:pt-6 md:px-8"
          :style="zoomCanvasStyle"
        >
          <div
            class="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch"
          >
            <div class="flex min-h-0 min-w-0 flex-col bg-[#F0F3F8] p-4 sm:p-5">
              <dl class="space-y-4 text-sm">
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Employer
                  </dt>
                  <dd class="mt-1 font-medium leading-snug text-[#111827]">
                    {{ employerName }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Employer address
                  </dt>
                  <dd class="mt-1 font-medium leading-snug text-[#111827]">
                    {{ employerAddress }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Country
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">{{ country }}</dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Pay Period
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">
                    {{ payPeriodLabel }}
                  </dd>
                </div>
              </dl>
            </div>
            <div
              class="flex min-h-0 min-w-0 flex-col justify-center rounded-xl border border-subtle-02 bg-[#E7F3EA] p-4 sm:p-5"
            >
              <p
                class="text-center text-xs font-medium uppercase tracking-wide text-[#047857]"
              >
                Net Pay
              </p>
              <p
                class="mt-2 text-center text-2xl font-bold tabular-nums tracking-tight text-[#065F46] md:text-[28px]"
              >
                {{ formatMoney(netPay, currency) }}
              </p>
            </div>
          </div>

          <div
            class="mt-4 rounded-xl border border-subtle-02 bg-[#F0F3F8] p-5 md:p-6"
          >
            <div
              class="grid gap-6 text-sm md:grid-cols-2 md:gap-x-10 md:gap-y-4"
            >
              <dl class="space-y-4">
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Employee name
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">
                    {{ employeeName }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Employee ID
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">
                    {{ employeeId }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Employee Position
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">
                    {{ position }}
                  </dd>
                </div>
              </dl>
              <dl class="space-y-4">
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">Email</dt>
                  <dd class="mt-1 font-medium text-[#111827]">{{ email }}</dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Hire date
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">
                    {{ hireDate }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[13px] font-normal text-[#6B7280]">
                    Payment Method
                  </dt>
                  <dd class="mt-1 font-medium text-[#111827]">
                    {{ paymentMethod }}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <section class="mt-8">
            <h3 class="mb-3 text-[15px] font-semibold text-[#6B7280]">
              Summary
            </h3>
            <div
              class="bg-white payslip-scroll-x border-y border-x-0 border-subtle-02"
            >
              <table class="w-full min-w-[480px] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-subtle-02">
                    <th
                      class="px-4 py-3 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Pay currency
                    </th>
                    <th
                      class="px-4 py-3 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Entitlements
                    </th>
                    <th
                      class="px-4 py-3 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Deductions
                    </th>
                    <th
                      class="px-4 py-3 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Net pay
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-subtle-02 bg-[#FAFAFA]">
                    <td class="px-4 py-3 font-medium text-[#111827]">
                      {{ currency }}
                    </td>
                    <td
                      class="px-4 py-3 text-right tabular-nums text-[#111827]"
                    >
                      {{ formatNum(gross) }}
                    </td>
                    <td
                      class="px-4 py-3 text-right tabular-nums text-[#111827]"
                    >
                      {{ formatNum(deductions) }}
                    </td>
                    <td
                      class="px-4 py-3 text-right tabular-nums font-semibold text-[#111827]"
                    >
                      {{ formatNum(netPay) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="mt-8">
            <h3 class="mb-4 text-[15px] font-semibold text-[#6B7280]">
              Details
            </h3>
            <p class="mb-2 text-sm font-semibold text-[#374151]">
              Entitlements
            </p>
            <div
              class="mb-6 bg-white payslip-scroll-x border-y border-x-0 border-subtle-02"
            >
              <table class="w-full min-w-[400px] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-subtle-02">
                    <th
                      class="px-4 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Payelement
                    </th>
                    <th
                      class="px-4 py-2.5 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Amount
                    </th>
                    <th
                      class="px-4 py-2.5 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Currency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, i) in entitlementRows"
                    :key="'e-' + i"
                    class="border-b border-subtle-02 bg-[#FAFAFA] last:border-0"
                  >
                    <td class="px-4 py-2.5 text-[#111827]">{{ row.label }}</td>
                    <td
                      class="px-4 py-2.5 text-right tabular-nums text-[#111827]"
                    >
                      {{ formatNum(row.amount) }}
                    </td>
                    <td class="px-4 py-2.5 text-right text-[#111827]">
                      {{ currency }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="mb-2 text-sm font-semibold text-[#374151]">Deductions</p>
            <div
              class="bg-white payslip-scroll-x border-y border-x-0 border-subtle-02"
            >
              <table class="w-full min-w-[400px] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-subtle-02">
                    <th
                      class="px-4 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Payelement
                    </th>
                    <th
                      class="px-4 py-2.5 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Amount
                    </th>
                    <th
                      class="px-4 py-2.5 text-right text-xs font-medium text-[#6B7280]"
                    >
                      Currency
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(row, i) in deductionRows"
                    :key="'d-' + i"
                    class="border-b bg-[#FAFAFA] border-subtle-02 last:border-0"
                  >
                    <td class="px-4 py-2.5 text-[#111827]">{{ row.label }}</td>
                    <td
                      class="px-4 py-2.5 text-right tabular-nums text-[#111827]"
                    >
                      {{ formatNum(row.amount) }}
                    </td>
                    <td class="px-4 py-2.5 text-right text-[#111827]">
                      {{ currency }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="mt-8">
            <h3 class="mb-3 text-[15px] font-semibold text-[#6B7280]">
              Banking details
            </h3>
            <div
              class="bg-white payslip-scroll-x border-y border-x-0 border-subtle-02"
            >
              <table class="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr class="border-b border-subtle-02">
                    <th
                      class="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Bank name
                    </th>
                    <th
                      class="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      SWIFT
                    </th>
                    <th
                      class="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Beneficiary name
                    </th>
                    <th
                      class="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Acc. number
                    </th>
                    <th
                      class="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Account currency
                    </th>
                    <th
                      class="px-3 py-2.5 text-left text-xs font-medium text-[#6B7280]"
                    >
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b bg-[#FAFAFA] border-subtle-02">
                    <td class="px-3 py-3 text-[#111827]">
                      {{ banking.bankName }}
                    </td>
                    <td class="px-3 py-3 text-[#111827]">
                      {{ banking.swift }}
                    </td>
                    <td class="px-3 py-3 text-[#111827]">
                      {{ banking.beneficiary }}
                    </td>
                    <td class="px-3 py-3 tabular-nums text-[#111827]">
                      {{ banking.account }}
                    </td>
                    <td class="px-3 py-3 text-[#111827]">{{ currency }}</td>
                    <td class="px-3 py-3 text-[#111827]">{{ banking.type }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer
            class="mt-10 border-t border-subtle-02 pt-6 text-center text-xs leading-relaxed text-[#9CA3AF]"
          >
            <p>This document has been generated for demo purposes ({{ BRAND.name }}).</p>
            <p class="mt-0.5">© All rights reserved</p>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import zoomInIconUrl from "@/assets/icons/zoom-in-secondary-light.svg?url";
import zoomOutIconUrl from "@/assets/icons/zoom-out-secondary-light.svg?url";
import { BRAND } from "@/config/brand.js";

const props = defineProps({
  payslip: { type: Object, required: true },
});

const zoom = ref(1);

const zoomCanvasStyle = computed(() => {
  const z = zoom.value;
  return {
    transform: `scale(${z})`,
    transformOrigin: "top left",
    width: `${100 / z}%`,
  };
});

const employerName = BRAND.documentEmployerName;
const employerAddress = "325 Court Street, Brooklyn, NY 11231";
const country = "USA";
const employeeName = "Ted Ferguson";
const employeeId = "TF2019";
const position = "Product Manager";
const email = "ted.ferguson@example.com";
const hireDate = "15 Jan 2019";
const paymentMethod = "Bank";
const banking = {
  bankName: "First National Bank of New York",
  swift: "FNBUS33XXX",
  beneficiary: "Ted Ferguson",
  account: "123456789012",
  type: "Primary",
};

const currency = computed(() => props.payslip.currency);
const gross = computed(() => props.payslip.gross);
const netPay = computed(() => props.payslip.netPay);
const deductions = computed(() => props.payslip.deductions);

const payPeriodLabel = computed(() => {
  const d = new Date(props.payslip.payrollDate);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
});

const entitlementRows = computed(() => {
  if (props.payslip.entitlementLines?.length)
    return props.payslip.entitlementLines;
  return [{ label: "62100 - Basic Salary", amount: gross.value }];
});

const deductionRows = computed(() => {
  if (props.payslip.deductionLines?.length) return props.payslip.deductionLines;
  return [{ label: "Total deductions", amount: deductions.value }];
});

function formatNum(n) {
  return Number(n).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMoney(amount, curr) {
  const parts = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${parts.replace(/,/g, " ")} ${curr}`;
}
</script>

<style scoped>
.payslip-doc {
  position: relative;
}
</style>
