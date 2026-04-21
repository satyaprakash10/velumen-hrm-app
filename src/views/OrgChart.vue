<template>
  <div class="min-h-full bg-page-bg px-4 py-6 dark:bg-gray-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[900px]">
      <h1 class="page-title mb-1 dark:text-gray-100">Organizational chart</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Explore reporting lines. Use expand/collapse on each node.
      </p>

      <div class="mt-8 rounded-xl border border-subtle-02 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Root: <span class="font-semibold text-gray-900 dark:text-gray-100">{{ tree.root.name }}</span>
          </p>
          <button
            type="button"
            class="rounded-lg border border-subtle-02 px-3 py-1.5 text-sm font-medium text-navy transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-800"
            @click="expandAll"
          >
            Expand all
          </button>
        </div>
        <ul class="mt-6 list-none space-y-4 pl-0">
          <OrgChartNode :node="tree.root" />
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, provide } from "vue";
import tree from "@/data/orgChart.json";
import OrgChartNode from "@/components/org/OrgChartNode.vue";
import { useToast } from "@/composables/useToast.js";
import { emitActivity } from "@/utils/activityBus.js";
import { usePageActivity } from "@/composables/usePageActivity.js";

const toast = useToast();
const orgExpandTick = ref(0);
provide("orgExpandTick", orgExpandTick);

usePageActivity({
  title: "Org chart opened",
  module: "orgchart",
  to: "/orgchart",
});

function expandAll() {
  orgExpandTick.value += 1;
  toast.success("All visible branches expanded.", { module: "orgchart" });
  emitActivity({
    title: "Org chart expanded",
    message: "All visible branches expanded.",
    module: "orgchart",
    severity: "info",
    toast: false,
    silent: true,
    context: { event: "orgchart_expand_all" },
  });
}
</script>
