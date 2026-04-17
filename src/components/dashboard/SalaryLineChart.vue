<template>
  <div class="relative h-[260px] w-full min-h-0">
    <p
      v-if="!series.labels.length"
      class="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500 dark:text-slate-400"
    >
      No payslip history for your account in this currency.
    </p>
    <Line v-else :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";
import { monthlyNetSeriesFromRows } from "@/utils/payslipChart.js";
import { usePayslipDataset } from "@/composables/usePayslipDataset.js";
import { useDarkMode } from "@/composables/useDarkMode.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps({
  currency: { type: String, default: "USD" },
});

const { dark } = useDarkMode();
const { visiblePayslipsRaw } = usePayslipDataset();

const series = computed(() =>
  monthlyNetSeriesFromRows(visiblePayslipsRaw.value, props.currency),
);

const chartData = computed(() => {
  const isDark = dark.value;
  const line = isDark ? "#38bdf8" : "#0ea5e9";
  const fill = isDark ? "rgba(56, 189, 248, 0.14)" : "rgba(14, 165, 233, 0.12)";
  return {
    labels: series.value.labels,
    datasets: [
      {
        label: `Net pay (${props.currency})`,
        data: series.value.data,
        borderColor: line,
        backgroundColor: fill,
        fill: true,
        tension: 0.4,
        borderWidth: 1.75,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBorderWidth: 2,
        pointBackgroundColor: isDark ? "#0f172a" : "#ffffff",
        pointBorderColor: line,
        pointHoverBackgroundColor: line,
        pointHoverBorderColor: isDark ? "#e2e8f0" : "#ffffff",
      },
    ],
  };
});

const chartOptions = computed(() => {
  const isDark = dark.value;
  const grid = isDark ? "rgba(148, 163, 184, 0.14)" : "rgba(100, 116, 139, 0.18)";
  const text = isDark ? "#cbd5e1" : "#64748b";
  const font = { family: "Inter, system-ui, sans-serif", size: 11, weight: "500" };
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: text,
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: "line",
          font,
        },
      },
      tooltip: {
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.96)",
        titleColor: isDark ? "#e2e8f0" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label(ctx) {
            const v = ctx.parsed?.y;
            if (v == null) return "";
            return new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: props.currency,
              maximumFractionDigits: 0,
            }).format(v);
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: grid,
          borderDash: [3, 4],
          drawTicks: false,
        },
        border: { display: false },
        ticks: { color: text, maxRotation: 45, minRotation: 0, font },
      },
      y: {
        grid: {
          color: grid,
          borderDash: [3, 4],
        },
        border: { display: false },
        ticks: {
          color: text,
          font,
          callback(value) {
            return new Intl.NumberFormat(undefined, {
              notation: "compact",
              maximumFractionDigits: 1,
            }).format(value);
          },
        },
      },
    },
  };
});
</script>
