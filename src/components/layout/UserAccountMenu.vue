<template>
  <div ref="rootRef" class="relative shrink-0">
    <button
      type="button"
      ref="btnRef"
      class="flex max-w-[180px] items-center gap-1.5 rounded-lg border border-transparent py-1 pl-0.5 pr-1.5 transition hover:border-slate-200/80 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:hover:border-slate-600 dark:hover:bg-slate-800/80"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="`Account menu for ${headerName}`"
      @click.stop="open = !open"
    >
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-[11px] font-semibold text-slate-800 ring-2 ring-white dark:from-slate-600 dark:to-slate-700 dark:text-slate-100 dark:ring-slate-900"
      >
        <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="" class="h-full w-full object-cover" />
        <span v-else>{{ initials }}</span>
      </span>
      <span class="hidden min-w-0 flex-col text-left sm:flex">
        <span class="truncate text-[13px] font-semibold leading-tight text-gray-900 dark:text-gray-100">{{ headerName }}</span>
        <span class="truncate text-[11px] leading-tight text-gray-500 dark:text-gray-400">{{ headerRole }}</span>
      </span>
      <svg
        class="hidden h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 sm:block"
        :class="open ? '-rotate-180' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-[0.97] -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-[0.98] -translate-y-0.5"
      >
        <div
          v-if="open"
          ref="popoverRef"
          :style="popoverStyle"
          class="w-[min(calc(100vw-2rem),11.5rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white/95 py-1 shadow-2xl ring-1 ring-slate-900/[0.06] backdrop-blur-md dark:border-slate-600 dark:bg-slate-900/95 dark:ring-white/10"
          role="menu"
          aria-label="Account"
        >
          <div class="border-b border-slate-100 px-2.5 py-2 dark:border-slate-800">
            <p class="truncate text-[13px] font-semibold leading-tight text-slate-900 dark:text-slate-100">{{ headerName }}</p>
            <p class="truncate text-[11px] leading-tight text-slate-500 dark:text-slate-400">{{ headerRole }}</p>
          </div>
          <div class="py-1">
            <RouterLink
              to="/my-information"
              role="menuitem"
              class="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
              @click="close"
            >
              <span
                class="flex h-3.5 w-3.5 items-center justify-center text-slate-500 dark:text-slate-400 [&>svg]:h-full [&>svg]:w-full"
                aria-hidden="true"
                v-html="profileIcon"
              />
              Profile
            </RouterLink>
            <RouterLink
              to="/settings"
              role="menuitem"
              class="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
              @click="close"
            >
              <span
                class="flex h-3.5 w-3.5 items-center justify-center text-slate-500 dark:text-slate-400 [&>svg]:h-full [&>svg]:w-full"
                aria-hidden="true"
                v-html="settingsIcon"
              />
              Settings
            </RouterLink>
            <RouterLink
              to="/activity"
              role="menuitem"
              class="flex items-center gap-2 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
              @click="close"
            >
              <span
                class="flex h-3.5 w-3.5 items-center justify-center text-slate-500 dark:text-slate-400 [&>svg]:h-full [&>svg]:w-full"
                aria-hidden="true"
                v-html="activityIcon"
              />
              Activity
            </RouterLink>
          </div>
          <hr class="my-0 border-t border-slate-100 dark:border-slate-800" role="separator" />
          <button
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[12.5px] font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
            @click="onSignOut"
          >
            <span
              class="flex h-3.5 w-3.5 items-center justify-center text-red-500 dark:text-red-400 [&>svg]:h-full [&>svg]:w-full"
              aria-hidden="true"
              v-html="signOutIcon"
            />
            Sign out
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import { useUser } from "@/composables/useUser.js";
import { useAuth } from "@/composables/useAuth.js";
import { menuIconHtml } from "@/utils/menuActionIcons.js";

const profileIcon = menuIconHtml("user");
const settingsIcon = menuIconHtml("cog");
const signOutIcon = menuIconHtml("logout");

const activityIcon = `<svg viewBox="0 0 16 16" fill="none"><path d="M1.5 8h2.3l1.8-4.5L8.5 12l1.7-4 .8 1.5h3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const router = useRouter();
const { profile, initials } = useUser();
const { logout } = useAuth();

defineProps({
  headerName: { type: String, required: true },
  headerRole: { type: String, required: true },
});

const open = ref(false);
const rootRef = ref(null);
const btnRef = ref(null);
const popoverRef = ref(null);

const referenceEl = computed(() => btnRef.value);

const { floatingStyles, update } = useFloating(referenceEl, popoverRef, {
  open,
  placement: "bottom-end",
  strategy: "fixed",
  transform: false,
  middleware: [offset(8), flip(), shift({ padding: 12 })],
  whileElementsMounted: autoUpdate,
});

const Z_MENU = 12000;

const popoverStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: Z_MENU,
}));

function close() {
  open.value = false;
}

function onSignOut() {
  close();
  logout();
  router.replace("/login");
}

function onDocPointerDown(e) {
  if (!open.value) return;
  const t = e.target;
  if (t instanceof Node) {
    if (rootRef.value?.contains(t) || popoverRef.value?.contains(t)) return;
  }
  open.value = false;
}

watch(open, (v) => {
  if (v) {
    nextTick(() => update());
    queueMicrotask(() => document.addEventListener("pointerdown", onDocPointerDown, true));
  } else {
    document.removeEventListener("pointerdown", onDocPointerDown, true);
  }
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
});
</script>
