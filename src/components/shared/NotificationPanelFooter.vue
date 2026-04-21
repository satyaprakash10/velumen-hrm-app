<template>
  <div
    class="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200/80 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
    :class="mobile ? 'pb-[max(0.625rem,env(safe-area-inset-bottom))]' : ''"
  >
    <span class="inline-flex items-center gap-1.5">
      <span
        class="relative flex h-2 w-2"
        aria-hidden="true"
      >
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
        <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Real-time stream connected
    </span>
    <div class="flex items-center gap-3">
      <span class="font-medium tabular-nums">
        {{ unreadCount }} unread · {{ totalCount }} total
      </span>
      <button
        v-if="showActivityLink"
        type="button"
        class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-100/70 dark:text-sky-300 dark:hover:bg-sky-900/30"
        @click="$emit('view-all')"
      >
        View all
        <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  totalCount: { type: Number, default: 0 },
  unreadCount: { type: Number, default: 0 },
  mobile: { type: Boolean, default: false },
  showActivityLink: { type: Boolean, default: false },
});

defineEmits(["view-all"]);
</script>
