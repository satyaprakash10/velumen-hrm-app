<template>
  <header
    class="relative z-40 flex items-center gap-3 px-4 py-5 overflow-visible bg-white border-b shadow-sm sm:py-8 h-14 shrink-0 border-subtle-02 dark:border-gray-800 dark:bg-gray-900 md:gap-4 md:px-6"
  >
    <AppBreadcrumbs class="flex-1 min-w-0 pr-1" />

    <CompanySelector
      class="hidden w-56 min-w-[12rem] max-w-[16rem] shrink-0 md:block"
    />

    <div class="flex items-center justify-end gap-2 shrink-0 md:gap-3">
      <GlobalSearch />
      <NotificationCenter />
      <UserAccountMenu :header-name="headerName" :header-role="headerRole" />
    </div>
  </header>
</template>

<script setup>
import { computed } from "vue";
import CompanySelector from "@/components/layout/CompanySelector.vue";
import UserAccountMenu from "@/components/layout/UserAccountMenu.vue";
import AppBreadcrumbs from "@/components/layout/AppBreadcrumbs.vue";
import NotificationCenter from "@/components/shared/NotificationCenter.vue";
import GlobalSearch from "@/components/shared/GlobalSearch.vue";
import { useUser } from "@/composables/useUser.js";
import { useAuth } from "@/composables/useAuth.js";
import { useCompany } from "@/composables/useCompany.js";

const { profile, displayName } = useUser();
const { user, roleForCompany } = useAuth();
const { currentId } = useCompany();

const headerName = computed(() => user.value?.name || displayName.value);
const headerRole = computed(() => {
  if (user.value) {
    const r = roleForCompany(currentId.value) || user.value.role;
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
  return profile.value.role;
});
</script>
