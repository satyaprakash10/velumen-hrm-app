<template>
  <div ref="rootRef" class="relative shrink-0">
    <button
      ref="btnRef"
      type="button"
      class="relative flex h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 dark:text-gray-200 dark:hover:bg-gray-800"
      :aria-expanded="open"
      aria-haspopup="dialog"
      :aria-label="triggerLabel"
      @click.stop="toggle"
    >
      <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="bellIcon" />
      <transition
        enter-active-class="transition duration-200 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-50"
        enter-to-class="opacity-100 scale-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-50"
      >
        <span
          v-if="unreadCount > 0"
          :key="unreadCount"
          class="notif-badge absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 px-1 text-[10px] font-bold leading-none text-white shadow-md ring-0 dark:border-gray-900"
          aria-hidden="true"
        >
          {{ unreadCount > 9 ? "9+" : unreadCount }}
        </span>
      </transition>
    </button>

    <Teleport to="body">
      <!-- Scrim (mobile) -->
      <transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open && isMobile"
          class="fixed inset-0 z-[9998] bg-slate-900/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="close"
        />
      </transition>

      <!-- Desktop floating popover -->
      <transition
        enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-[0.96] -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-[0.98] -translate-y-0.5"
      >
        <div
          v-if="open && !isMobile"
          ref="panelRef"
          :style="popoverStyle"
          class="notif-panel w-[min(calc(100vw-2rem),26rem)] origin-top-right overflow-hidden rounded-2xl border border-slate-200/80 bg-white/98 shadow-[0_24px_80px_rgba(0,21,41,0.18)] ring-1 ring-black/[0.04] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-900/95 dark:ring-white/10"
          role="dialog"
          aria-labelledby="notif-title"
        >
          <NotificationPanelHeader
            :unread-count="unreadCount"
            :active-tab="activeTab"
            :counts="countsByCategory"
            :only-unread="onlyUnread"
            @close="close"
            @tab="activeTab = $event"
            @toggle-unread="onlyUnread = !onlyUnread"
            @mark-all="handleMarkAll"
            @clear-all="handleClearAll"
          />

          <NotificationList
            :groups="groupedItems"
            :filtered-count="filteredItems.length"
            :total-count="items.length"
            @mark-read="markRead"
            @dismiss="dismiss"
            @navigate="onNavigate"
          />

          <NotificationPanelFooter
            :total-count="items.length"
            :unread-count="unreadCount"
            :show-activity-link="true"
            @view-all="goToActivity"
          />
        </div>
      </transition>

      <!-- Mobile bottom sheet -->
      <transition
        enter-active-class="transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
        leave-active-class="transition duration-200 ease-in"
        enter-from-class="translate-y-full opacity-70"
        enter-to-class="translate-y-0 opacity-100"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-full opacity-70"
      >
        <div
          v-if="open && isMobile"
          ref="panelRef"
          class="notif-sheet fixed inset-x-0 bottom-0 z-[9999] flex max-h-[92vh] flex-col overflow-hidden rounded-t-3xl border-t border-slate-200/80 bg-white shadow-[0_-24px_80px_rgba(0,21,41,0.28)] dark:border-slate-700 dark:bg-slate-950"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notif-title"
        >
          <div class="flex justify-center pt-2.5 pb-1" aria-hidden="true">
            <span class="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700" />
          </div>

          <NotificationPanelHeader
            :unread-count="unreadCount"
            :active-tab="activeTab"
            :counts="countsByCategory"
            :only-unread="onlyUnread"
            mobile
            @close="close"
            @tab="activeTab = $event"
            @toggle-unread="onlyUnread = !onlyUnread"
            @mark-all="handleMarkAll"
            @clear-all="handleClearAll"
          />

          <div class="flex-1 overflow-y-auto overscroll-contain">
            <NotificationList
              :groups="groupedItems"
              :filtered-count="filteredItems.length"
              :total-count="items.length"
              mobile
              @mark-read="markRead"
              @dismiss="dismiss"
              @navigate="onNavigate"
            />
          </div>

          <NotificationPanelFooter
            :total-count="items.length"
            :unread-count="unreadCount"
            :show-activity-link="true"
            mobile
            @view-all="goToActivity"
          />
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import bellIcon from "@/assets/icons/notification.svg?raw";
import { useNotificationCenter } from "@/composables/useNotificationCenter.js";
import NotificationPanelHeader from "@/components/shared/NotificationPanelHeader.vue";
import NotificationList from "@/components/shared/NotificationList.vue";
import NotificationPanelFooter from "@/components/shared/NotificationPanelFooter.vue";

const {
  items,
  unreadCount,
  countsByCategory,
  markRead,
  markAllRead,
  dismiss,
  clearAll,
  panelOpen,
} = useNotificationCenter();

const router = useRouter();

const open = ref(false);
const activeTab = ref("all");
const onlyUnread = ref(false);
const isMobile = ref(false);

const rootRef = ref(null);
const btnRef = ref(null);
const panelRef = ref(null);

const { floatingStyles, update } = useFloating(btnRef, panelRef, {
  open,
  placement: "bottom-end",
  strategy: "fixed",
  transform: false,
  middleware: [offset(10), flip(), shift({ padding: 12 })],
  whileElementsMounted: autoUpdate,
});

const POPOVER_Z = 9999;

const popoverStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: POPOVER_Z,
}));

const triggerLabel = computed(() => {
  if (unreadCount.value === 0) return "Notifications";
  return `Notifications (${unreadCount.value} unread)`;
});

const filteredItems = computed(() => {
  let list = items.value;
  if (activeTab.value !== "all") {
    list = list.filter((n) => n.category === activeTab.value);
  }
  if (onlyUnread.value) {
    list = list.filter((n) => !n.read);
  }
  return list;
});

const groupedItems = computed(() => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;

  const groups = {
    today: { label: "Today", items: [] },
    yesterday: { label: "Yesterday", items: [] },
    week: { label: "Earlier this week", items: [] },
    older: { label: "Older", items: [] },
  };

  for (const item of filteredItems.value) {
    const t = new Date(item.time).getTime();
    if (Number.isNaN(t)) {
      groups.older.items.push(item);
      continue;
    }
    if (t >= startOfToday) groups.today.items.push(item);
    else if (t >= startOfYesterday) groups.yesterday.items.push(item);
    else if (t >= startOfWeek) groups.week.items.push(item);
    else groups.older.items.push(item);
  }

  return Object.values(groups).filter((g) => g.items.length > 0);
});

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function handleMarkAll() {
  markAllRead();
}

function handleClearAll() {
  clearAll();
}

function onNavigate(item) {
  if (!item?.to) return;
  close();
  router.push(item.to).catch(() => {
    /* swallow redundant navigation */
  });
}

function goToActivity() {
  close();
  router.push("/activity").catch(() => {});
}

function onResize() {
  isMobile.value = window.innerWidth < 768;
}

function onDocPointerDown(e) {
  if (!open.value) return;
  const target = e.target;
  if (!(target instanceof Node)) return;
  if (rootRef.value?.contains(target)) return;
  if (panelRef.value?.contains(target)) return;
  close();
}

function onKey(e) {
  if (e.key === "Escape" && open.value) close();
}

watch(open, (v) => {
  panelOpen.value = v;
  if (v) {
    nextTick(() => update());
    queueMicrotask(() => {
      document.addEventListener("pointerdown", onDocPointerDown, true);
      document.addEventListener("keydown", onKey);
    });
    if (isMobile.value) {
      document.documentElement.style.overflow = "hidden";
    }
  } else {
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onKey);
    document.documentElement.style.overflow = "";
  }
});

onMounted(() => {
  onResize();
  window.addEventListener("resize", onResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", onResize);
  document.removeEventListener("pointerdown", onDocPointerDown, true);
  document.removeEventListener("keydown", onKey);
  document.documentElement.style.overflow = "";
});
</script>

<style scoped>
.notif-badge {
  animation: notif-pop 0.32s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes notif-pop {
  0% {
    transform: scale(0.6);
  }
  60% {
    transform: scale(1.12);
  }
  100% {
    transform: scale(1);
  }
}

.notif-panel {
  max-height: min(80vh, 640px);
  display: flex;
  flex-direction: column;
}
</style>
