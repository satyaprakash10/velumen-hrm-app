<template>
  <div
    class="relative shrink-0 border-b border-slate-200/80 bg-gradient-to-br from-white via-slate-50/80 to-indigo-50/60 px-4 pt-4 pb-0 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40"
    :class="mobile ? 'pt-2' : ''"
  >
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <h2
            id="notif-title"
            class="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-50"
          >
            Notifications
          </h2>
          <span
            v-if="unreadCount > 0"
            class="inline-flex h-5 items-center rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 px-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
          >
            {{ unreadCount }} new
          </span>
        </div>
        <p class="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          Live updates from your workspace, signed in this browser
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <button
          type="button"
          class="inline-flex h-8 items-center gap-1 rounded-lg border border-transparent px-2 text-[11px] font-semibold text-slate-600 transition hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800"
          :class="onlyUnread ? 'border-sky-400/60 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200' : ''"
          :aria-pressed="onlyUnread"
          @click="$emit('toggle-unread')"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle
              cx="8"
              cy="8"
              r="3.5"
              :fill="onlyUnread ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
          Unread
        </button>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Close notifications"
          @click="$emit('close')"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div
      class="-mx-4 mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none px-4 pb-2"
      role="tablist"
      aria-label="Notification categories"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        :aria-selected="activeTab === tab.id"
        class="accent-tab group relative inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold"
        :class="
          activeTab === tab.id
            ? 'accent-tab-active border-transparent'
            : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800'
        "
        @click="$emit('tab', tab.id)"
      >
        <span class="h-3.5 w-3.5 [&>svg]:h-full [&>svg]:w-full" v-html="tab.icon" />
        <span>{{ tab.label }}</span>
        <span
          v-if="counts[tab.id] > 0"
          class="ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-tight"
          :class="
            activeTab === tab.id
              ? 'bg-white/25 text-white'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
          "
        >
          {{ counts[tab.id] }}
        </span>
      </button>

      <div class="ml-auto flex shrink-0 items-center gap-1 pl-2">
        <button
          type="button"
          class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-sky-700 transition hover:bg-sky-100/60 disabled:cursor-not-allowed disabled:opacity-40 dark:text-sky-300 dark:hover:bg-sky-900/30"
          :disabled="unreadCount === 0"
          @click="$emit('mark-all')"
        >
          Mark all read
        </button>
        <button
          type="button"
          class="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
          @click="$emit('clear-all')"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  unreadCount: { type: Number, default: 0 },
  activeTab: { type: String, default: "all" },
  counts: { type: Object, default: () => ({ all: 0, auth: 0, activity: 0, system: 0 }) },
  onlyUnread: { type: Boolean, default: false },
  mobile: { type: Boolean, default: false },
});

defineEmits(["close", "tab", "toggle-unread", "mark-all", "clear-all"]);

const ICON_ALL = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 4.5h10M3 8h10M3 11.5h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
const ICON_ACTIVITY = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 8h2.3l1.8-4.5L8.5 12l1.7-4 .8 1.5h3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_AUTH = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="3.5" y="7" width="9" height="6.5" rx="1.4" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg>`;
const ICON_SYSTEM = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 5v3.2l2 1.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;

const tabs = [
  { id: "all", label: "All", icon: ICON_ALL },
  { id: "activity", label: "Activity", icon: ICON_ACTIVITY },
  { id: "auth", label: "Security", icon: ICON_AUTH },
  { id: "system", label: "System", icon: ICON_SYSTEM },
];
</script>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
.scrollbar-none {
  scrollbar-width: none;
}
</style>
