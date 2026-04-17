<template>
  <li class="org-node">
    <div
      class="rounded-xl border border-subtle-02 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <p class="font-semibold text-gray-900 dark:text-gray-100">{{ node.name }}</p>
      <p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{{ node.title }}</p>
      <a
        :href="`mailto:${node.email}`"
        class="mt-2 inline-block text-sm font-medium text-navy underline-offset-2 hover:underline dark:text-sky-400"
      >
        {{ node.email }}
      </a>
      <div v-if="hasChildren" class="mt-3">
        <button
          type="button"
          class="text-xs font-semibold uppercase tracking-wide text-navy hover:underline dark:text-sky-400"
          @click="expanded = !expanded"
        >
          {{ expanded ? "Collapse" : "Expand" }} ({{ node.children.length }})
        </button>
      </div>
    </div>
    <ul v-if="hasChildren && expanded" class="mt-3 space-y-3 border-l-2 border-subtle-02 pl-4 dark:border-gray-700">
      <OrgChartNode v-for="ch in node.children" :key="ch.id" :node="ch" />
    </ul>
  </li>
</template>

<script setup>
import { ref, computed, inject, watch } from "vue";
import OrgChartNode from "./OrgChartNode.vue";

const props = defineProps({
  node: { type: Object, required: true },
});

const expanded = ref(true);
const orgExpandTick = inject("orgExpandTick", ref(0));

watch(
  () => orgExpandTick.value,
  () => {
    expanded.value = true;
  },
);

const hasChildren = computed(
  () => Array.isArray(props.node.children) && props.node.children.length > 0,
);
</script>
