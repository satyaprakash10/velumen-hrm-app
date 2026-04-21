<template>
  <div
    class="inline-flex min-w-0 gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-700 dark:bg-slate-900"
    role="radiogroup"
    :aria-label="ariaLabel"
  >
    <button
      v-for="opt in options"
      :key="opt.code"
      type="button"
      role="radio"
      :aria-checked="modelValue === opt.code"
      class="accent-tab inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[12px] font-semibold"
      :class="
        modelValue === opt.code
          ? 'accent-tab-active'
          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
      "
      @click="$emit('update:modelValue', opt.code)"
    >
      <span
        class="inline-flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ring-1"
        :class="
          modelValue === opt.code
            ? 'bg-white/20 ring-white/30 text-current'
            : opt.iconWrap
        "
        aria-hidden="true"
      >
        {{ opt.symbol }}
      </span>
      <span>{{ opt.code }}</span>
    </button>
  </div>
</template>

<script setup>
/**
 * A compact currency picker used on time entries and anywhere else the
 * workspace needs a quick code selector. Visual style matches the Settings
 * page's segmented controls so the whole app feels coherent.
 *
 * Exposes the canonical list for other views that want to render the
 * matching symbol without duplicating the table.
 */

defineProps({
  modelValue: { type: String, default: "USD" },
  ariaLabel: { type: String, default: "Currency" },
});

defineEmits(["update:modelValue"]);

const options = [
  {
    code: "USD",
    symbol: "$",
    label: "US Dollar",
    iconWrap: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-900/60",
  },
  {
    code: "EUR",
    symbol: "€",
    label: "Euro",
    iconWrap: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900/60",
  },
  {
    code: "INR",
    symbol: "₹",
    label: "Indian Rupee",
    iconWrap: "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-900/60",
  },
];
</script>
