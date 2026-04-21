<template>
  <div
    class="flex flex-col gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0 dark:border-slate-800 sm:flex-row sm:items-center sm:gap-6"
  >
    <div class="min-w-0 flex-1">
      <p class="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">
        {{ label }}
      </p>
      <p v-if="hint" class="mt-0.5 text-[12px] leading-snug text-slate-500 dark:text-slate-400">
        {{ hint }}
      </p>
    </div>
    <div class="flex shrink-0 items-center">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  hint: { type: String, default: "" },
});
</script>
