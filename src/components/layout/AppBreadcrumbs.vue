<template>
  <nav
    class="min-w-0 overflow-hidden text-[13px] text-gray-600 dark:text-gray-400"
    aria-label="Breadcrumb"
  >
    <ol class="flex items-center gap-x-1.5">
      <li
        v-for="(crumb, i) in crumbs"
        :key="crumb.path || i"
        class="flex min-w-0 items-center gap-1.5"
        :class="i < crumbs.length - 1 ? 'shrink-0' : 'min-w-0 shrink'"
      >
        <router-link
          v-if="crumb.to && i < crumbs.length - 1"
          :to="crumb.to"
          class="inline-flex items-center gap-1 rounded-md px-1 text-slate-500 transition hover:bg-slate-100 hover:text-navy dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <span v-if="crumb.icon" class="h-3.5 w-3.5 [&>svg]:h-full [&>svg]:w-full" aria-hidden="true" v-html="crumb.icon" />
          <span class="truncate">{{ crumb.label }}</span>
        </router-link>
        <span
          v-else
          class="truncate font-semibold text-navy dark:text-gray-100"
          :aria-current="i === crumbs.length - 1 ? 'page' : undefined"
        >
          {{ crumb.label }}
        </span>
        <svg
          v-if="i < crumbs.length - 1"
          class="h-3 w-3 shrink-0 text-slate-300 dark:text-slate-600"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import menuLinks from "@/data/menuLinks.json";

const route = useRoute();

const HOME_ICON = `<svg viewBox="0 0 16 16" fill="none"><path d="M2.5 7.5L8 3l5.5 4.5V13a1 1 0 01-1 1h-9a1 1 0 01-1-1V7.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

const crumbs = computed(() => {
  const path = route.path.replace(/^\//, "") || "dashboard";
  if (path === "dashboard") {
    return [{ label: "Dashboard", icon: HOME_ICON }];
  }
  const link = menuLinks.find((l) => l.path === path);
  const label = link ? formatTitle(link.title) : route.meta?.title || "Page";
  return [
    { label: "Home", to: "/dashboard", icon: HOME_ICON },
    { label },
  ];
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
</script>
