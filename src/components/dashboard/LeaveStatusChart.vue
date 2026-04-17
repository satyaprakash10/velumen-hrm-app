<template>
  <div class="relative h-[220px] w-full min-h-0">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from "vue";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "vue-chartjs";
import { useDarkMode } from "@/composables/useDarkMode.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const props = defineProps({
  counts: {
    type: Object,
    default: () => ({ Approved: 0, Pending: 0, Rejected: 0 }),
  },
});

const { dark } = useDarkMode();

const chartData = computed(() => {
  const isDark = dark.value;
  const a = isDark ? "rgba(52, 211, 153, 0.55)" : "rgba(16, 185, 129, 0.45)";
  const p = isDark ? "rgba(251, 191, 36, 0.55)" : "rgba(245, 158, 11, 0.45)";
  const r = isDark ? "rgba(248, 113, 113, 0.55)" : "rgba(239, 68, 68, 0.45)";
  const border = isDark ? "rgba(226, 232, 240, 0.35)" : "rgba(15, 23, 42, 0.12)";
  return {
    labels: ["Approved", "Pending", "Rejected"],
    datasets: [
      {
        label: "Leave requests",
        data: [
          props.counts.Approved || 0,
          props.counts.Pending || 0,
          props.counts.Rejected || 0,
        ],
        backgroundColor: [a, p, r],
        borderColor: border,
        borderWidth: 1,
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 26,
        maxBarThickness: 34,
      },
    ],
  };
});

const chartOptions = computed(() => {
  const isDark = dark.value;
  const text = isDark ? "#cbd5e1" : "#64748b";
  const grid = isDark ? "rgba(148, 163, 184, 0.12)" : "rgba(100, 116, 139, 0.16)";
  const font = { family: "Inter, system-ui, sans-serif", size: 11, weight: "500" };
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? "rgba(15, 23, 42, 0.92)" : "rgba(255, 255, 255, 0.96)",
        titleColor: isDark ? "#e2e8f0" : "#0f172a",
        bodyColor: isDark ? "#cbd5e1" : "#334155",
        borderColor: isDark ? "rgba(148, 163, 184, 0.25)" : "rgba(148, 163, 184, 0.35)",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: text, font },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: grid,
          borderDash: [3, 4],
        },
        border: { display: false },
        ticks: { color: text, stepSize: 1, font },
      },
    },
  };
});
</script>
