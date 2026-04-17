<template>
  <div
    class="min-w-[920px] divide-y divide-subtle-02 border-b border-subtle-02"
    aria-hidden="true"
  >
    <div
      v-for="n in rows"
      :key="n"
      class="grid grid-cols-[28px_minmax(120px,1.1fr)_minmax(200px,2.2fr)_minmax(112px,1fr)_minmax(104px,1fr)_minmax(88px,0.85fr)_40px] items-center gap-x-3 py-3 pr-6"
    >
      <div class="h-8 self-stretch bg-[#F4F7F9]" />
      <div class="h-4 w-20 animate-pulse rounded bg-gray-200" />
      <div class="h-4 max-w-[min(100%,280px)] animate-pulse rounded bg-gray-200" />
      <div class="h-4 w-16 animate-pulse rounded bg-gray-200" />
      <div class="ml-auto h-7 w-20 animate-pulse rounded-md bg-gray-200" />
      <div class="h-5 w-12 animate-pulse rounded-full bg-gray-200" />
      <div class="h-8 w-8 animate-pulse rounded-lg bg-gray-200" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Number, default: 5 },
});
</script>
