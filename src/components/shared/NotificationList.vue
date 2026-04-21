<template>
  <div
    class="scrollbar-kit relative"
    :class="mobile ? '' : 'max-h-[min(60vh,440px)] overflow-y-auto'"
  >
    <div v-if="filteredCount === 0" class="px-6 py-10 text-center">
      <div
        class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 text-sky-600 dark:from-sky-950/60 dark:via-indigo-950/40 dark:to-purple-950/60 dark:text-sky-300"
        aria-hidden="true"
      >
        <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.4-1.4A7 7 0 0019 11V9a7 7 0 10-14 0v2a7 7 0 00.4 4.6L4 17h5m6 0a3 3 0 11-6 0m6 0H9" />
        </svg>
      </div>
      <p class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {{ totalCount === 0 ? "You're all caught up" : "Nothing matches this filter" }}
      </p>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {{
          totalCount === 0
            ? "New activity in your workspace will show up here in real time."
            : "Try another tab or clear the unread filter to see more."
        }}
      </p>
    </div>

    <template v-else>
      <section
        v-for="group in groups"
        :key="group.label"
        class="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
      >
        <header
          class="sticky top-0 z-[1] flex items-center justify-between bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:bg-slate-900/95 dark:text-slate-500 dark:supports-[backdrop-filter]:bg-slate-900/70"
        >
          <span>{{ group.label }}</span>
          <span class="font-semibold normal-case tracking-normal text-slate-400 dark:text-slate-500">
            {{ group.items.length }}
          </span>
        </header>
        <ul class="divide-y divide-slate-100 dark:divide-slate-800">
          <li v-for="item in group.items" :key="item.id">
            <NotificationItem
              :item="item"
              @mark-read="$emit('mark-read', $event)"
              @dismiss="$emit('dismiss', $event)"
              @navigate="$emit('navigate', $event)"
            />
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<script setup>
import NotificationItem from "@/components/shared/NotificationItem.vue";

defineProps({
  groups: { type: Array, default: () => [] },
  filteredCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
  mobile: { type: Boolean, default: false },
});

defineEmits(["mark-read", "dismiss", "navigate"]);
</script>
