<template>
  <aside
    class="sidebar-shell fixed top-0 left-0 z-[60] flex h-full flex-col border border-[#607493] bg-white shadow-[4px_0_32px_rgba(0,21,41,0.1)] transition-[width,transform,border-color,background-color] duration-300 ease-out select-none dark:border-slate-700 dark:bg-slate-950 md:z-40 md:shadow-none"
    :class="[
      collapsed ? 'w-[72px]' : 'w-[260px]',
      collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0',
    ]"
    role="navigation"
    aria-label="Main navigation"
  >
    <!-- Expanded: classic single row — logo + title | rail toggle (simple, icon always high-contrast) -->
    <div
      v-if="!collapsed"
      class="flex shrink-0 items-stretch border-b border-white/10"
      style="background: var(--theme-nav-header-bg, #001738)"
    >
      <!--
        Brand link: taps take the user to the public landing page. Keeps the
        app identity clickable from every screen without having to discover
        a separate "home" route.
      -->
      <router-link
        to="/welcome"
        class="group flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-3 pr-2 transition hover:bg-white/[0.05] focus:outline-none focus-visible:bg-white/[0.08] md:py-3"
        :aria-label="`${brandName} — go to landing`"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition group-hover:scale-[1.03]"
          aria-hidden="true"
        >
          <img src="/logo-mark.svg" :alt="brandName" class="h-7 w-7 object-contain md:h-7 md:w-7" width="28" height="28" />
        </div>
        <div class="min-w-0 flex-1 leading-snug">
          <span class="block text-[12px] font-semibold text-white">{{ brandName }}</span>
          <span class="block text-[12px] font-semibold text-white/90">{{ brandTagline }}</span>
        </div>
      </router-link>
      <button
        type="button"
        class="sidebar-collapse-btn hidden w-9 min-w-[2.25rem] shrink-0 items-center justify-center self-stretch border-l border-white/20 bg-white/[0.08] transition hover:bg-white/[0.14] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white/40 md:inline-flex"
        aria-label="Collapse sidebar"
        @click="$emit('toggle')"
      >
        <span
          class="pointer-events-none flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#001738] shadow-md ring-1 ring-black/10 [&>svg]:block [&>svg]:h-[18px] [&>svg]:w-[18px]"
          v-html="iconSvgs['chevron-left']"
        />
      </button>
    </div>

    <!-- Collapsed: logo separate on top; toggle below at corner -->
    <div
      v-else
      class="shrink-0 border-b border-white/10"
      style="background: var(--theme-nav-header-bg, #001738)"
    >
      <div class="flex flex-col gap-2 px-2 pb-2.5 pt-3 md:px-3">
        <router-link
          to="/welcome"
          class="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-black/5 transition hover:scale-[1.05]"
          :aria-label="`${brandName} — go to landing`"
        >
          <img src="/logo-mark.svg" alt="" class="h-6 w-6 object-contain" width="28" height="28" />
        </router-link>
        <div class="flex w-full min-w-0 justify-end pr-0.5">
          <button
            type="button"
            class="sidebar-collapse-btn hidden items-center justify-center rounded-full border border-white/25 bg-white/[0.12] p-1 shadow-inner transition hover:bg-white/[0.18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 md:inline-flex"
            aria-label="Expand sidebar"
            @click="$emit('toggle')"
          >
            <span
              class="pointer-events-none flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#001738] shadow-md ring-1 ring-black/10 [&>svg]:block [&>svg]:h-4 [&>svg]:w-4"
              v-html="iconSvgs['chevron-right']"
            />
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="!collapsed"
      class="shrink-0 border-b border-[#607493] border-subtle-02 bg-white px-4 pb-4 pt-5 text-center transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900"
    >
      <div class="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800" aria-hidden="true">
        <img src="/logo-mark.svg" alt="" class="h-7 w-7 object-contain" width="28" height="28" />
      </div>
      <p class="text-[15px] font-bold leading-tight text-[#536D82] dark:text-slate-200">
        {{ currentCompany?.shortName || "Org" }}
      </p>
      <p class="mt-1 text-xs font-normal text-[#536D82] dark:text-slate-400">
        {{ currentCompany?.name || "" }}
      </p>

      <div class="mt-4 grid grid-cols-3 gap-1">
        <router-link
          to="/dashboard"
          class="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-[#001738] dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
          active-class="bg-gradient-to-br from-sky-50 to-indigo-50/90 font-bold text-[#001738] shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)] dark:from-sky-950/50 dark:to-indigo-950/40 dark:text-sky-100 dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]"
          title="Dashboard home"
          @click="$emit('navigate')"
        >
          <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="iconSvgs.launchpad" />
          <span class="leading-tight">Home</span>
        </router-link>
        <router-link
          to="/docs"
          class="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-[#001738] dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
          active-class="bg-gradient-to-br from-sky-50 to-indigo-50/90 font-bold text-[#001738] shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)] dark:from-sky-950/50 dark:to-indigo-950/40 dark:text-sky-100 dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]"
          title="Documents"
          @click="$emit('navigate')"
        >
          <span class="relative inline-flex h-5 w-5 items-center justify-center">
            <span class="[&>svg]:h-full [&>svg]:w-full" v-html="iconSvgs.documents" />
          </span>
          <span class="leading-tight">Docs</span>
        </router-link>
        <router-link
          to="/timesheet"
          class="flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-semibold text-slate-700 transition-all duration-200 hover:bg-sky-50 hover:text-[#001738] dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white"
          active-class="bg-gradient-to-br from-sky-50 to-indigo-50/90 font-bold text-[#001738] shadow-[inset_0_0_0_1px_rgba(14,165,233,0.35)] dark:from-sky-950/50 dark:to-indigo-950/40 dark:text-sky-100 dark:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)]"
          title="Time entry & timer"
          @click="$emit('navigate')"
        >
          <span class="h-5 w-5 [&>svg]:h-full [&>svg]:w-full" v-html="iconSvgs['time-entry']" />
          <span class="leading-tight">Time</span>
        </router-link>
      </div>
    </div>

    <div class="mx-3 shrink-0 border-t border-subtle-02" aria-hidden="true" />

    <nav
      v-ess-scrollbar
      class="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white px-2 py-3 transition-colors duration-300 dark:bg-slate-950"
    >
      <ul class="space-y-1">
        <li v-for="link in sortedLinks" :key="link.path">
          <router-link
            :to="`/${link.path}`"
            custom
            v-slot="{ href, navigate, isActive }"
          >
            <a
              :href="href"
              class="group flex items-center gap-3 rounded-xl py-2.5 text-sm font-medium transition-all duration-200 ease-out"
              :class="navItemClass(isActive, collapsed)"
              :title="collapsed ? formatTitle(link.title) : undefined"
              @click.prevent="
                () => {
                  navigate();
                  $emit('navigate');
                }
              "
            >
              <span
                class="h-5 w-5 shrink-0 text-slate-600 transition-colors group-hover:text-sky-700 dark:text-slate-400 dark:group-hover:text-sky-300 [&>svg]:h-full [&>svg]:w-full"
                :class="isActive ? 'text-sky-700 dark:text-sky-300' : ''"
                v-html="iconSvgs[link.icon]"
              />
              <transition name="slide-text">
                <span v-if="!collapsed" class="truncate">{{ formatTitle(link.title) }}</span>
              </transition>
            </a>
          </router-link>
        </li>
      </ul>
    </nav>

    <div
      class="shrink-0 border-t border-subtle-02 bg-[#EEF2F7] px-2 py-3 text-center text-[11px] text-[#94A3B8] transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
    >
      <!-- Theme toggle: visible on all widths inside the sidebar. Prominent on
           mobile since the mobile header no longer carries a theme button. -->
      <div
        v-if="!collapsed"
        class="mb-2 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 p-1 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300"
        role="group"
        aria-label="Appearance"
      >
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 transition"
          :class="
            !dark
              ? 'bg-gradient-to-br from-amber-200/80 to-amber-100 text-amber-900 shadow-inner dark:from-amber-400/40 dark:to-amber-300/30'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/60'
          "
          :aria-pressed="!dark"
          aria-label="Switch to light mode"
          @click="!dark ? null : toggleDark()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Light
        </button>
        <button
          type="button"
          class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 transition"
          :class="
            dark
              ? 'bg-gradient-to-br from-indigo-500 to-slate-800 text-white shadow-inner'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/60'
          "
          :aria-pressed="dark"
          aria-label="Switch to dark mode"
          @click="dark ? null : toggleDark()"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          Dark
        </button>
      </div>
      <button
        v-else
        type="button"
        class="mb-2 flex h-9 w-full items-center justify-center rounded-xl text-slate-600 transition hover:bg-white/80 dark:text-slate-400 dark:hover:bg-slate-800"
        :aria-pressed="dark"
        :aria-label="dark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleDark"
      >
        <svg v-if="!dark" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </button>

      <button
        v-if="!collapsed"
        type="button"
        class="group mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-50 px-3 py-2.5 text-[13px] font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50 hover:shadow-[0_6px_20px_rgba(244,63,94,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/35 dark:border-rose-900/70 dark:from-rose-950/50 dark:via-slate-900 dark:to-rose-950/40 dark:text-rose-200 dark:hover:border-rose-700 dark:hover:from-rose-900/50 dark:hover:to-rose-900/40"
        @click="signOut"
      >
        <span
          class="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-rose-600 shadow-inner ring-1 ring-rose-200 transition group-hover:bg-rose-600 group-hover:text-white dark:bg-slate-900 dark:text-rose-300 dark:ring-rose-900/70 dark:group-hover:bg-rose-600 dark:group-hover:text-white"
          aria-hidden="true"
          v-html="signOutIcon"
        />
        <span>Sign out</span>
      </button>
      <button
        v-else
        type="button"
        class="mb-3 flex h-9 w-full items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/70 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
        aria-label="Sign out"
        @click="signOut"
      >
        <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" aria-hidden="true" v-html="signOutIcon" />
      </button>
      <transition name="slide-text">
        <span v-if="!collapsed">{{ copyrightLine }}</span>
        <span v-else class="text-[10px] text-[#94A3B8]">©</span>
      </transition>
    </div>
  </aside>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import menuLinks from "@/data/menuLinks.json";

import dashboardIcon from "@/assets/icons/dashboard.svg?raw";
import employeesIcon from "@/assets/icons/employees.svg?raw";
import launchpadIcon from "@/assets/icons/launchpad.svg?raw";
import timeEntryIcon from "@/assets/icons/time-entry.svg?raw";
import leavesIcon from "@/assets/icons/leaves.svg?raw";
import benefitsIcon from "@/assets/icons/benefits.svg?raw";
import orgChartIcon from "@/assets/icons/organizational-chart.svg?raw";
import myTeamIcon from "@/assets/icons/my-team.svg?raw";
import documentsIcon from "@/assets/icons/documents.svg?raw";
import newsIcon from "@/assets/icons/news.svg?raw";
import chevronLeftIcon from "@/assets/icons/chevron-left.svg?raw";
import chevronRightIcon from "@/assets/icons/chevron-right.svg?raw";
import notificationIcon from "@/assets/icons/notification.svg?raw";

const briefcaseIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>`;
const kanbanIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>`;
const activityIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`;
const settingsIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`;
import { useAuth } from "@/composables/useAuth.js";
import { useCompany } from "@/composables/useCompany.js";
import { useDarkMode } from "@/composables/useDarkMode.js";
import { canAccessNavLink } from "@/utils/navAccess.js";
import { menuIconHtml } from "@/utils/menuActionIcons.js";
import { BRAND } from "@/config/brand.js";

const signOutIcon = menuIconHtml("logout");

const brandName = BRAND.name;
const brandTagline = BRAND.tagline;

defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["toggle", "navigate"]);

const router = useRouter();
const { user, roleForCompany, logout } = useAuth();
const { current: currentCompany, currentId } = useCompany();
const { dark, toggle: toggleDark } = useDarkMode();

const year = new Date().getFullYear();

const copyrightLine = computed(() => `${BRAND.copyrightHolder} © ${year}`);

const iconSvgs = {
  dashboard: dashboardIcon,
  employees: employeesIcon,
  launchpad: launchpadIcon,
  "time-entry": timeEntryIcon,
  leaves: leavesIcon,
  benefits: benefitsIcon,
  "organizational-chart": orgChartIcon,
  "my-team": myTeamIcon,
  documents: documentsIcon,
  news: newsIcon,
  "chevron-left": chevronLeftIcon,
  "chevron-right": chevronRightIcon,
  notification: notificationIcon,
  briefcase: briefcaseIcon,
  kanban: kanbanIcon,
  activity: activityIcon,
  settings: settingsIcon,
};

const effectiveRole = computed(() => {
  if (!user.value) return "guest";
  return roleForCompany(currentId.value) || user.value.role;
});

const sortedLinks = computed(() =>
  menuLinks
    .filter((l) => l.enabled && canAccessNavLink(l, effectiveRole.value))
    .sort((a, b) => a.ordinal - b.ordinal),
);

function navItemClass(isActive, collapsed) {
  const inactive =
    "border border-transparent text-slate-700 accent-hover-bg dark:text-slate-300 dark:hover:bg-slate-800/90 dark:hover:text-white px-3";
  // Accent-aware active state: soft background tint, subtle border tint, and
  // a 3px inset "bar" in the accent color. All driven by CSS vars so the
  // Settings → Appearance pick repaints the whole sidebar.
  const active = "sidebar-link-active px-3";
  const collapsedPad = collapsed ? "justify-center px-2" : "";
  if (isActive) return [active, collapsedPad].filter(Boolean).join(" ");
  return [inactive, collapsedPad].filter(Boolean).join(" ");
}

function formatTitle(key) {
  return key
    .split("_")
    .map((word, i) =>
      i === 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase(),
    )
    .join(" ");
}

function signOut() {
  logout();
  router.replace("/login");
}
</script>

<style scoped>
.sidebar-collapse-btn :deep(svg) {
  display: block;
  color: inherit;
  flex-shrink: 0;
}
.sidebar-collapse-btn :deep(svg path) {
  fill: currentColor;
}

.slide-text-enter-active,
.slide-text-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.slide-text-enter-from,
.slide-text-leave-to {
  opacity: 0;
  transform: translateX(-4px);
}
</style>
