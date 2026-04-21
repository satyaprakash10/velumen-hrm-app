<template>
  <div
    class="flex h-screen overflow-hidden bg-page-bg transition-colors duration-300 dark:bg-slate-950"
  >
    <transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isMobile && !sidebarCollapsed"
        class="fixed inset-0 z-[50] bg-black/40 md:hidden"
        @click="sidebarCollapsed = true"
      />
    </transition>

    <Sidebar
      :collapsed="sidebarCollapsed"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @navigate="onSidebarNavigate"
    />

    <div
      class="flex min-h-0 min-w-0 flex-1 flex-col transition-[margin] duration-300 ease-out"
      :class="mainMarginClass"
    >
      <AppHeader class="hidden md:flex" />

      <template v-if="isMobile">
        <header
          class="flex shrink-0 items-center gap-1.5 border-b border-subtle-02 bg-white px-3 py-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:hidden"
        >
          <router-link
            to="/welcome"
            class="flex shrink-0 items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            :aria-label="`${brandName} — go to landing`"
          >
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--theme-nav-header-bg,#001738)] text-white shadow-sm ring-1 ring-black/10">
              <img src="/logo-mark.svg" alt="" class="h-5 w-5 object-contain" width="20" height="20" />
            </span>
            <span class="hidden min-w-0 flex-col leading-tight sm:flex">
              <span class="truncate text-[12px] font-semibold text-navy dark:text-slate-100">{{ brandName }}</span>
            </span>
          </router-link>
          <CompanySelector
            class="ml-1 mr-auto min-w-0 flex-1 max-w-[44%] shrink"
          />
          <GlobalSearch />
          <NotificationCenter />
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow-sm transition hover:brightness-110"
            style="background: var(--theme-nav-header-bg, #001738)"
            :aria-label="
              sidebarCollapsed ? 'Open navigation menu' : 'Close navigation menu'
            "
            @click="sidebarCollapsed = !sidebarCollapsed"
          >
            <svg
              v-if="sidebarCollapsed"
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg
              v-else
              class="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </header>
        <div
          class="flex shrink-0 items-center border-b border-subtle-02 bg-white/90 px-3 py-2 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80 md:hidden"
        >
          <AppBreadcrumbs class="min-w-0 flex-1" />
        </div>
      </template>

      <main
        class="scrollbar-kit min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <TimeTrackerWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs.vue";
import CompanySelector from "@/components/layout/CompanySelector.vue";
import NotificationCenter from "@/components/shared/NotificationCenter.vue";
import GlobalSearch from "@/components/shared/GlobalSearch.vue";
import TimeTrackerWidget from "@/components/shared/TimeTrackerWidget.vue";
import { BRAND } from "@/config/brand.js";

const brandName = BRAND.name;

const sidebarCollapsed = ref(false);
const isMobile = ref(false);

const mainMarginClass = computed(() => {
  if (isMobile.value) return "ml-0";
  return sidebarCollapsed.value ? "ml-[72px]" : "ml-[260px]";
});

function handleResize() {
  const mobile = window.innerWidth < 768;
  isMobile.value = mobile;
  if (mobile) sidebarCollapsed.value = true;
}

function onSidebarNavigate() {
  if (isMobile.value) sidebarCollapsed.value = true;
}

onMounted(() => {
  handleResize();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
