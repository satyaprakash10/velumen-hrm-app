<template>
  <div class="min-h-full bg-page-bg px-4 py-6 transition-colors dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <DailyStatusHero class="mb-8" />

      <div class="mb-8">
        <RuleBasedInsights />
      </div>

      <h1 class="page-title mb-1">Dashboard</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Welcome back, {{ displayName.split(" ")[0] || "there" }}.
      </p>

      <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="card in summaryCards"
          :key="card.key"
          class="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm ring-1 ring-slate-900/[0.03] transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
        >
          <div class="flex items-start gap-4">
            <span
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-inner ring-1 ring-black/5 dark:ring-white/10"
              :class="card.iconWrap"
              aria-hidden="true"
            >
              <span class="h-5 w-5 [&>svg]:block [&>svg]:h-full [&>svg]:w-full" v-html="card.icon" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                {{ card.label }}
              </p>
              <p class="mt-1.5 text-2xl font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {{ card.value }}
              </p>
              <p
                v-if="card.hint"
                class="mt-1 text-[11px] text-slate-500 dark:text-slate-400"
              >
                {{ card.hint }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
          <h2 class="text-sm font-semibold text-navy dark:text-slate-100">
            Net pay trend (USD)
          </h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            From payslips linked to your signed-in account (demo: by email).
          </p>
          <div class="mt-4">
            <SalaryLineChart currency="USD" />
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
          <h2 class="text-sm font-semibold text-navy dark:text-slate-100">
            Leave requests by status
          </h2>
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your leave records for this account on this device.
          </p>
          <div class="mt-4">
            <LeaveStatusChart :counts="statusCounts" />
          </div>
        </section>
      </div>

      <div class="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] lg:col-span-2 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
          <h2 class="text-sm font-semibold text-navy dark:text-slate-100">Recent activity</h2>
          <ul class="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
            <li
              v-if="!recentActivity.length"
              class="py-3 text-sm text-gray-500 dark:text-gray-400"
            >
              No recent activity yet. Payslip notices and leave updates will appear here.
            </li>
            <li
              v-for="item in recentActivity"
              :key="item.id"
              class="flex gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#001738]/25 dark:bg-sky-400/40"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ item.text }}</p>
                <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {{ formatActivityDate(item.date) }}
                </p>
              </div>
            </li>
          </ul>
        </section>

        <section class="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-900/[0.03] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5">
          <h2 class="text-sm font-semibold text-navy dark:text-slate-100">Quick actions</h2>
          <div class="mt-4 flex flex-col gap-2">
            <router-link
              to="/leaves"
              class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-navy transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Apply for leave
            </router-link>
            <router-link
              to="/my-payslips"
              class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-navy transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              View payslips
            </router-link>
            <router-link
              to="/timesheet"
              class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-navy transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Log time
            </router-link>
            <router-link
              to="/my-information"
              class="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-navy transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Update profile
            </router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useLeaves } from "@/composables/useLeaves.js";
import { useUser } from "@/composables/useUser.js";
import { usePayslipDataset } from "@/composables/usePayslipDataset.js";
import SalaryLineChart from "@/components/dashboard/SalaryLineChart.vue";
import LeaveStatusChart from "@/components/dashboard/LeaveStatusChart.vue";
import DailyStatusHero from "@/components/dashboard/DailyStatusHero.vue";
import RuleBasedInsights from "@/components/dashboard/RuleBasedInsights.vue";

import iconCurrency from "@/assets/icons/dashboard.svg?raw";
import iconLeaves from "@/assets/icons/leaves.svg?raw";
import iconBell from "@/assets/icons/notification.svg?raw";

function getEntry(p, key) {
  return p.payslipEntries?.find((e) => e.key === key);
}

const { approvedDaysYtd, pendingCount, statusCounts, leaves } = useLeaves();
const { displayName } = useUser();
const { visiblePayslipsRaw } = usePayslipDataset();

const salaryYtdPrimary = computed(() => {
  const year = new Date().getFullYear();
  const rows = visiblePayslipsRaw.value.filter(
    (p) => new Date(p.payrollDate).getFullYear() === year,
  );
  const byCurr = new Map();
  for (const p of rows) {
    const net = getEntry(p, "NET PAY");
    if (!net || net.amount == null) continue;
    const c = net.currency || "USD";
    byCurr.set(c, (byCurr.get(c) || 0) + Number(net.amount));
  }
  if (byCurr.size === 0) {
    return { empty: true, text: "—" };
  }
  const order = ["USD", "EUR", "GBP"];
  const primary = [...byCurr.keys()].sort((a, b) => {
    const ia = order.indexOf(a);
    const ib = order.indexOf(b);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.localeCompare(b);
  })[0];
  const amount = byCurr.get(primary);
  return {
    empty: false,
    text: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: primary,
      maximumFractionDigits: 0,
    }).format(amount),
  };
});

const recentActivity = computed(() => {
  const items = [];
  const slips = [...visiblePayslipsRaw.value]
    .sort((a, b) => new Date(b.payrollDate) - new Date(a.payrollDate))
    .slice(0, 4);
  for (const p of slips) {
    const d = new Date(p.payrollDate);
    const label = d.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    const dateStr = p.fileAttachment?.file?.createTime || p.payrollDate;
    items.push({
      id: `ps-${p.fileAttachment?.accessToken || p.payrollDate}`,
      text: `Payslip available for ${label}`,
      date: dateStr,
    });
  }
  for (const l of leaves.value.filter((x) => x.status === "Pending")) {
    items.push({
      id: l.id,
      text: `Leave request (${l.type}) is pending approval`,
      date: l.startDate,
    });
  }
  items.sort((a, b) => new Date(b.date) - new Date(a.date));
  return items.slice(0, 6);
});

const summaryCards = computed(() => [
  {
    key: "ytd",
    label: "Net pay (YTD)",
    value: salaryYtdPrimary.value.empty ? "—" : salaryYtdPrimary.value.text,
    hint: salaryYtdPrimary.value.empty
      ? "No payslips for your account this calendar year."
      : "",
    icon: iconCurrency,
    iconWrap: "from-sky-500 to-indigo-600 dark:from-sky-400 dark:to-indigo-500",
  },
  {
    key: "leave",
    label: "Approved leave days (YTD)",
    value: String(approvedDaysYtd.value),
    hint: "Approved days with start date in the current calendar year.",
    icon: iconLeaves,
    iconWrap: "from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500",
  },
  {
    key: "pending",
    label: "Pending approvals",
    value: String(pendingCount.value),
    hint: "Your leave requests awaiting a decision.",
    icon: iconBell,
    iconWrap: "from-amber-500 to-orange-600 dark:from-amber-400 dark:to-orange-500",
  },
]);

function formatActivityDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
}
</script>
