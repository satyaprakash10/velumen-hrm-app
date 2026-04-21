<template>
  <section
    :id="id"
    class="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
  >
    <header class="border-b border-slate-100 px-5 pb-4 pt-5 dark:border-slate-800">
      <h2 class="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-50">
        {{ title }}
      </h2>
      <p
        v-if="description"
        class="mt-1 text-[12.5px] text-slate-500 dark:text-slate-400"
      >
        {{ description }}
      </p>
    </header>
    <div class="px-5 py-5">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
});
</script>
