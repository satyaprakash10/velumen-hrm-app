import { computed } from "vue";
import { useLeaves } from "@/composables/useLeaves.js";
import { useTimeEntry } from "@/composables/useTimeEntry.js";
import { useTaskBoard } from "@/composables/useTaskBoard.js";

/**
 * Rule-based “insights” — no AI, no network. Deterministic hints from local data.
 */
export function useLocalInsights() {
  const { pendingCount, approvedDaysYtd } = useLeaves();
  const { weekTotal, expectedHours, entries } = useTimeEntry();
  const { tasks } = useTaskBoard();

  const insights = computed(() => {
    const out = [];

    if (pendingCount.value > 0) {
      out.push({
        key: "leave-pending",
        tone: "amber",
        title: "Leave approvals",
        body: `You have ${pendingCount.value} leave request(s) waiting — check Leaves for status.`,
      });
    }

    const openTasks = tasks.value.filter((t) => t.column !== "done").length;
    if (openTasks > 5) {
      out.push({
        key: "tasks-many",
        tone: "sky",
        title: "Task focus",
        body: `${openTasks} tasks are not done yet. Consider moving one item to “In progress” only after finishing or parking another.`,
      });
    }

    const gap = Number(expectedHours.value) - Number(weekTotal.value);
    if (gap > 4) {
      out.push({
        key: "time-under",
        tone: "slate",
        title: "Time entry",
        body: `About ${gap.toFixed(1)}h under your expected hours this week — log time or adjust with your manager.`,
      });
    } else if (gap < -8) {
      out.push({
        key: "time-over",
        tone: "emerald",
        title: "Capacity check",
        body: "You are significantly over expected hours — great for delivery, but watch burnout and balance.",
      });
    }

    if (approvedDaysYtd.value > 20) {
      out.push({
        key: "leave-ytd",
        tone: "emerald",
        title: "Time off",
        body: `${approvedDaysYtd.value} approved leave days YTD — keep your team informed on upcoming breaks.`,
      });
    }

    if (!entries.value.length) {
      out.push({
        key: "no-entries",
        tone: "sky",
        title: "Timesheet",
        body: "No time entries in this demo week yet — add your first row or use the floating timer.",
      });
    }

    return out.slice(0, 4);
  });

  return { insights };
}
