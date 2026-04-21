<template>
  <section
    class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-black/[0.02] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
    aria-labelledby="payslip-howitworks-title"
  >
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span class="flex items-center gap-3 text-left">
        <span class="flex h-9 w-9 items-center justify-center rounded-xl accent-soft" aria-hidden="true">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <circle cx="12" cy="12" r="9" />
            <path stroke-linecap="round" d="M12 8v4l3 2" />
          </svg>
        </span>
        <span>
          <h2 id="payslip-howitworks-title" class="text-[15px] font-semibold text-slate-900 dark:text-slate-50">
            How your payslip is generated
          </h2>
          <p class="mt-0.5 text-[12.5px] text-slate-500 dark:text-slate-400">
            Tap any step to see the math — the "Generate my slip" button uses exactly this flow.
          </p>
        </span>
      </span>
      <svg
        class="h-4 w-4 shrink-0 text-slate-400 transition-transform"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </button>

    <transition
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-1"
    >
      <div v-if="open" class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ol class="space-y-3 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
          <li
            v-for="(step, i) in steps"
            :key="step.title"
            class="flex gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40"
          >
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-bold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700">
              {{ String(i + 1).padStart(2, "0") }}
            </span>
            <div class="min-w-0">
              <p class="font-semibold text-slate-900 dark:text-slate-50">{{ step.title }}</p>
              <p class="mt-0.5 text-[12.5px] text-slate-600 dark:text-slate-400">{{ step.body }}</p>
            </div>
          </li>
        </ol>

        <aside class="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Live values for this month
          </p>
          <dl class="mt-3 space-y-2 text-[13px]">
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Hourly rate</dt>
              <dd class="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ formatCurrency(preview.hourlyRate, preview.currency) }}/h</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Expected hours</dt>
              <dd class="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ preview.expectedHours }} h</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Hours logged</dt>
              <dd class="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ preview.loggedHours.toFixed(2) }} h</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Overtime</dt>
              <dd class="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ preview.overtimeHours.toFixed(2) }} h</dd>
            </div>
            <div class="my-2 border-t border-slate-200 dark:border-slate-700" role="separator" />
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Gross</dt>
              <dd class="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ formatCurrency(preview.gross, preview.currency) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Tax ({{ Math.round(preview.taxRate * 100) }}%)</dt>
              <dd class="font-semibold tabular-nums text-slate-900 dark:text-slate-50">{{ formatCurrency(preview.tax, preview.currency) }}</dd>
            </div>
            <div class="flex items-center justify-between rounded-lg px-2 py-1 accent-soft">
              <dt class="font-semibold">Net pay</dt>
              <dd class="font-bold tabular-nums">{{ formatCurrency(preview.net, preview.currency) }}</dd>
            </div>
          </dl>
          <p class="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Numbers refresh live as you log more hours in Time entry — there's no re-run or "submit for approval" step.
          </p>
        </aside>
      </div>
    </transition>
  </section>
</template>

<script setup>
import { computed, ref } from "vue";
import { buildPayslip, formatCurrency } from "@/utils/generatePayslip.js";

const open = ref(false);
const preview = computed(() => buildPayslip());

const steps = [
  {
    title: "Read signed-in user",
    body: "Identity (name, email, role) is pulled from the current session so nothing has to be re-entered.",
  },
  {
    title: "Gather tracked hours",
    body: "Time entries for the selected month are summed from your local timesheet state.",
  },
  {
    title: "Apply role-based rate",
    body: "Admin, employee, and candidate each have a default hourly rate for the demo.",
  },
  {
    title: "Split regular vs overtime",
    body: "Hours over the expected monthly total are paid at 1.5× the base rate.",
  },
  {
    title: "Deduct tax & contributions",
    body: "A flat 22% is applied to the gross amount in this demo.",
  },
  {
    title: "Render a real PDF",
    body: "A single-page PDF is generated in the browser and downloaded instantly — no server round-trip.",
  },
];
</script>
