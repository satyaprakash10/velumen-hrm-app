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

      <header
        v-if="isMobile"
        class="flex shrink-0 flex-wrap items-center justify-end gap-2 border-b border-subtle-02 bg-white px-3 py-2.5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:hidden"
      >
        <CompanySelector
          class="mr-auto min-w-0 w-[min(14rem,calc(100%-9rem))] max-w-[60%] shrink"
        />
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-navy transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          :aria-pressed="dark"
          :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleDark"
        >
          <svg
            v-if="!dark"
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
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
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
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </button>
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

    <ToastStack />
    <TimeTrackerWidget />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/layout/Sidebar.vue";
import AppHeader from "@/components/layout/AppHeader.vue";
import CompanySelector from "@/components/layout/CompanySelector.vue";
import ToastStack from "@/components/shared/ToastStack.vue";
import TimeTrackerWidget from "@/components/shared/TimeTrackerWidget.vue";
import { useDarkMode } from "@/composables/useDarkMode.js";
import { useToast } from "@/composables/useToast.js";
import { pushNotification } from "@/composables/useNotificationCenter.js";

const { dark, toggle: toggleDark } = useDarkMode();
const toast = useToast();

function onEssActivity(e) {
  const d = e.detail || {};
  if (d.toast !== false) {
    toast.info(d.message || d.body || d.title || "Update", {
      module: d.module,
    });
  }
  if (d.notify !== false && (d.title || d.message || d.body)) {
    pushNotification({
      title: d.title || "Activity",
      body: d.message || d.body || "",
    });
  }
}

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
  window.addEventListener("ess-activity", onEssActivity);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("ess-activity", onEssActivity);
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
