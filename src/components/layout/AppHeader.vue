<template>
  <header
    class="relative z-40 flex h-14 shrink-0 items-center gap-3 overflow-visible border-b border-subtle-02 bg-white px-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:gap-4 md:px-6"
  >
    <nav class="min-w-0 flex-1 overflow-hidden pr-1 text-sm text-gray-600 dark:text-gray-400" aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li v-for="(crumb, i) in crumbs" :key="crumb.path || i" class="flex items-center gap-2">
          <router-link
            v-if="crumb.to && i < crumbs.length - 1"
            :to="crumb.to"
            class="text-gray-500 transition hover:text-navy dark:text-gray-400 dark:hover:text-white"
          >
            {{ crumb.label }}
          </router-link>
          <span
            v-else
            class="font-semibold text-navy dark:text-gray-100"
            :aria-current="i === crumbs.length - 1 ? 'page' : undefined"
          >
            {{ crumb.label }}
          </span>
          <span
            v-if="i < crumbs.length - 1"
            class="text-gray-300"
            aria-hidden="true"
          >
            /
          </span>
        </li>
      </ol>
    </nav>

    <CompanySelector class="hidden w-56 min-w-[12rem] max-w-[16rem] shrink-0 md:block" />

    <div class="flex shrink-0 items-center justify-end gap-2 md:gap-3">
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 dark:text-gray-200 dark:hover:bg-gray-800"
        :aria-pressed="dark"
        :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleDark"
      >
        <svg v-if="!dark" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      <div ref="notifWrap" class="relative">
        <button
          type="button"
          class="relative flex h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 dark:text-gray-200 dark:hover:bg-gray-800"
          :aria-expanded="notifOpen"
          aria-haspopup="true"
          aria-label="Notifications"
          @click="notifOpen = !notifOpen"
        >
          <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="bellIcon" />
          <span
            v-if="unreadCount > 0"
            class="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white"
          >
            {{ unreadCount > 9 ? "9+" : unreadCount }}
          </span>
        </button>
        <transition
          enter-active-class="transition duration-150 ease-out"
          leave-active-class="transition duration-100 ease-in"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="notifOpen"
            class="absolute right-0 top-full z-[80] mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-subtle-02 bg-white py-2 shadow-[0_12px_40px_rgba(0,21,41,0.12)] ring-1 ring-black/[0.04] dark:border-gray-700 dark:bg-gray-900"
            role="menu"
          >
            <p class="border-b border-subtle-02 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:border-gray-700">
              Notifications
            </p>
            <ul class="max-h-72 overflow-y-auto">
              <li v-for="n in items" :key="n.id">
                <button
                  type="button"
                  class="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-gray-50 dark:hover:bg-gray-800"
                  :class="n.read ? 'opacity-75' : 'bg-orange-50/50'"
                  @click="markRead(n.id)"
                >
                  <span
                    class="mt-1 h-2 w-2 shrink-0 rounded-full"
                    :class="n.read ? 'bg-gray-300' : 'bg-amber-500'"
                    aria-hidden="true"
                  />
                  <span class="min-w-0">
                    <span class="block text-sm font-medium text-gray-900 dark:text-gray-100">{{
                      n.title
                    }}</span>
                    <span class="mt-0.5 block text-xs text-gray-600 dark:text-gray-400">{{
                      n.body
                    }}</span>
                    <span class="mt-1 block text-[11px] text-gray-400">{{
                      formatTime(n.time)
                    }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </transition>
      </div>

      <UserAccountMenu :header-name="headerName" :header-role="headerRole" />
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import menuLinks from "@/data/menuLinks.json";
import bellIcon from "@/assets/icons/notification.svg?raw";
import { notificationItems } from "@/composables/useNotificationCenter.js";
import CompanySelector from "@/components/layout/CompanySelector.vue";
import UserAccountMenu from "@/components/layout/UserAccountMenu.vue";
import { useUser } from "@/composables/useUser.js";
import { useAuth } from "@/composables/useAuth.js";
import { useCompany } from "@/composables/useCompany.js";
import { useDarkMode } from "@/composables/useDarkMode.js";

const route = useRoute();
const { profile, displayName } = useUser();
const { user, roleForCompany } = useAuth();
const { currentId } = useCompany();
const { dark, toggle: toggleDark } = useDarkMode();

const headerName = computed(() => user.value?.name || displayName.value);
const headerRole = computed(() => {
  if (user.value) {
    const r = roleForCompany(currentId.value) || user.value.role;
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
  return profile.value.role;
});

const items = notificationItems;
const notifOpen = ref(false);
const notifWrap = ref(null);

const unreadCount = computed(
  () => items.value.filter((n) => !n.read).length,
);

const crumbs = computed(() => {
  const path = route.path.replace(/^\//, "") || "dashboard";
  if (path === "dashboard") {
    return [{ label: "Dashboard" }];
  }
  const link = menuLinks.find((l) => l.path === path);
  const label = link
    ? formatTitle(link.title)
    : route.meta?.title || "Page";
  return [{ label: "Home", to: "/dashboard" }, { label }];
});

function formatTitle(key) {
  return key
    .split("_")
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        : w.toLowerCase(),
    )
    .join(" ");
}

function formatTime(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function markRead(id) {
  const n = items.value.find((x) => x.id === id);
  if (n) n.read = true;
}

function onDocClick(e) {
  if (!notifWrap.value?.contains(e.target)) notifOpen.value = false;
}

watch(notifOpen, (open) => {
  if (open) {
    document.addEventListener("click", onDocClick);
  } else {
    document.removeEventListener("click", onDocClick);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", onDocClick);
});
</script>
