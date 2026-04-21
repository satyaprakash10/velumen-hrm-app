<template>
  <button
    type="button"
    class="group relative overflow-hidden rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:bg-slate-900"
    :class="
      active
        ? 'border-slate-900/20 ring-2 ring-sky-500/30 dark:border-white/10 dark:ring-sky-400/40'
        : 'border-slate-200 dark:border-slate-800'
    "
  >
    <span
      class="pointer-events-none absolute inset-x-0 top-0 h-[2px] rounded-b-full bg-gradient-to-r"
      :class="toneBar"
      aria-hidden="true"
    />
    <div class="flex items-center justify-between">
      <span class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {{ stat.label }}
      </span>
      <span
        class="inline-flex h-6 min-w-[2rem] items-center justify-center rounded-full px-2 text-[11px] font-bold"
        :class="toneChip"
      >
        {{ stat.value }}
      </span>
    </div>
    <p class="mt-3 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-50">
      {{ stat.value }}
    </p>
    <p v-if="stat.hint" class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
      {{ stat.hint }}
    </p>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  stat: { type: Object, required: true },
  active: { type: Boolean, default: false },
});

const TONE = {
  slate: {
    bar: "from-slate-400/80 via-slate-500 to-slate-600",
    chip: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  },
  sky: {
    bar: "from-sky-400 via-sky-500 to-indigo-500",
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-200",
  },
  amber: {
    bar: "from-amber-400 via-orange-500 to-rose-500",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200",
  },
  indigo: {
    bar: "from-indigo-400 via-violet-500 to-purple-500",
    chip: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-200",
  },
};

const toneBar = computed(() => TONE[props.stat.tone]?.bar || TONE.slate.bar);
const toneChip = computed(() => TONE[props.stat.tone]?.chip || TONE.slate.chip);
</script>
