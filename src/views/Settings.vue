<template>
  <div class="min-h-full bg-page-bg px-4 py-6 transition-colors dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto flex max-w-[1100px] flex-col gap-6 lg:flex-row lg:gap-8">
      <!-- Side nav -->
      <aside class="shrink-0 lg:sticky lg:top-6 lg:h-fit lg:w-60">
        <p class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Settings
        </p>
        <h1 class="page-title mt-1">Preferences</h1>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Fine-tune how the app looks, notifies and secures your session.
        </p>

        <!--
          Mobile: a proper listbox menu that jumps to the section. Keeps the
          chrome calm on phones / tablets instead of a horizontally scrolling
          rail that easily hides options behind the edge of the screen.
        -->
        <div class="mt-5 lg:hidden">
          <label class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Jump to section
          </label>
          <SearchableListbox
            v-model="activeSection"
            class="mt-1.5 block"
            :options="sectionOptions"
            :searchable="false"
            placeholder="Choose section"
            @update:model-value="scrollTo"
          />
        </div>

        <!-- Desktop: column of pill buttons that react to scroll position -->
        <nav
          class="mt-5 hidden flex-col gap-0.5 lg:flex"
          aria-label="Settings sections"
        >
          <a
            v-for="s in sections"
            :key="s.id"
            :href="`#${s.id}`"
            class="inline-flex w-full shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[12.5px] font-semibold transition"
            :class="
              activeSection === s.id
                ? 'sidebar-link-active'
                : 'border-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            "
            @click.prevent="scrollTo(s.id)"
          >
            <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="s.icon" />
            {{ s.label }}
          </a>
        </nav>
      </aside>

      <!-- Panels -->
      <div class="min-w-0 flex-1 space-y-6">
        <!-- Appearance -->
        <SettingsCard id="appearance" title="Appearance" description="Control the look of the workspace.">
          <div class="flex flex-col gap-4">
            <SettingsRow
              label="Theme"
              hint="Light feels crisp for payroll; dark keeps long sessions easier on the eyes."
            >
              <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-[12px] font-semibold dark:border-slate-700 dark:bg-slate-900">
                <button
                  v-for="opt in [{ id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }]"
                  :key="opt.id"
                  type="button"
                  class="accent-tab inline-flex h-8 items-center gap-1.5 rounded-lg px-3"
                  :class="
                    (opt.id === 'dark') === dark
                      ? 'accent-tab-active'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  "
                  @click="setDark(opt.id === 'dark')"
                >
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path v-if="opt.id === 'light'" stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    <path v-else stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  {{ opt.label }}
                </button>
              </div>
            </SettingsRow>

            <SettingsRow label="Density" hint="Comfortable = generous padding. Compact squeezes more onto each page.">
              <div class="inline-flex rounded-xl border border-slate-200 bg-white p-1 text-[12px] font-semibold dark:border-slate-700 dark:bg-slate-900">
                <button
                  v-for="d in ['comfortable', 'compact']"
                  :key="d"
                  type="button"
                  class="accent-tab inline-flex h-8 items-center rounded-lg px-3 capitalize"
                  :class="
                    settings.appearance.density === d
                      ? 'accent-tab-active'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  "
                  @click="settings.appearance.density = d"
                >
                  {{ d }}
                </button>
              </div>
            </SettingsRow>

            <SettingsRow label="Accent" hint="Used for primary buttons, links and tab selection.">
              <div class="flex items-center gap-2">
                <button
                  v-for="a in accents"
                  :key="a.id"
                  type="button"
                  class="h-7 w-7 rounded-full ring-offset-2 transition"
                  :class="[
                    a.bg,
                    settings.appearance.accent === a.id
                      ? 'ring-2 ring-slate-900 dark:ring-white ring-offset-white dark:ring-offset-slate-950'
                      : 'ring-0',
                  ]"
                  :aria-label="a.label"
                  :aria-pressed="settings.appearance.accent === a.id"
                  @click="settings.appearance.accent = a.id"
                />
              </div>
            </SettingsRow>
          </div>
        </SettingsCard>

        <!-- Notifications -->
        <SettingsCard id="notifications" title="Notifications" description="Decide what interrupts you in real time.">
          <div class="flex flex-col gap-4">
            <SettingsRow label="In-app push popup" hint="The bold card that slides in when something happens while you're active.">
              <ToggleSwitch v-model="settings.notifications.enablePush" aria-label="Enable push popups" />
            </SettingsRow>
            <SettingsRow label="Sound" hint="A gentle chime plays alongside push popups.">
              <ToggleSwitch
                v-model="settings.notifications.enableSound"
                :disabled="!settings.notifications.enablePush"
                aria-label="Enable notification sound"
              />
            </SettingsRow>

            <div class="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                Channels
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Muting a channel silences toasts and push popups for that category. History is still kept
                in Activity so you can review anything you missed.
              </p>
              <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div
                  v-for="ch in channels"
                  :key="ch.id"
                  class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div class="min-w-0">
                    <p class="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100">
                      {{ ch.label }}
                    </p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ ch.hint }}</p>
                  </div>
                  <ToggleSwitch
                    :model-value="settings.notifications.channels[ch.id]"
                    :aria-label="`Toggle ${ch.label} channel`"
                    @update:model-value="settings.notifications.channels[ch.id] = $event"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              class="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              @click="sendTestPush"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5l2 2L13 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Send a test notification
            </button>
          </div>
        </SettingsCard>

        <!-- Security -->
        <SettingsCard id="security" title="Security" description="Harden your sign-in and session lifecycle.">
          <div class="flex flex-col gap-4">
            <SettingsRow
              label="Change password"
              hint="Demo-only in this browser. In production this would post to your identity provider."
            >
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-900 bg-slate-900 px-3 text-[12px] font-semibold text-white transition hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                @click="passwordDialog = true"
              >
                Update password
              </button>
            </SettingsRow>

            <SettingsRow
              label="Auto-lock"
              hint="Automatically sign you out after this many minutes of inactivity. Set 0 to disable."
            >
              <div class="flex items-center gap-2">
                <input
                  v-model.number="settings.security.autoLockMinutes"
                  type="number"
                  min="0"
                  max="240"
                  class="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
                <span class="text-[11px] text-slate-500 dark:text-slate-400">min</span>
              </div>
            </SettingsRow>

            <SettingsRow
              label="Remember this device"
              hint="Skips the email field after your next sign-in on this browser."
            >
              <ToggleSwitch
                v-model="settings.security.rememberDevice"
                aria-label="Remember this device"
              />
            </SettingsRow>

            <SettingsRow
              label="Confirm destructive actions"
              hint="Always ask before deleting, clearing logs, or other irreversible steps."
            >
              <ToggleSwitch
                v-model="settings.security.requireConfirmForDestructive"
                aria-label="Confirm destructive actions"
              />
            </SettingsRow>

            <SettingsRow
              label="End session"
              hint="Sign out on this device. Any other signed-in tabs will pick up the change automatically."
            >
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200 dark:hover:bg-rose-900/50"
                @click="onSignOut"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 17l5-5-5-5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12H9" />
                </svg>
                Sign out
              </button>
            </SettingsRow>
          </div>
        </SettingsCard>

        <!-- Privacy & Data -->
        <SettingsCard id="privacy" title="Privacy & data" description="Everything here happens inside this browser.">
          <div class="flex flex-col gap-4">
            <SettingsRow label="Cross-tab sync" hint="Keeps notifications and preferences identical across open tabs.">
              <ToggleSwitch v-model="settings.privacy.crossTabSync" aria-label="Cross-tab sync" />
            </SettingsRow>
            <SettingsRow label="Export activity log" hint="Download every notification and activity event as JSON.">
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="exportActivity"
              >
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 10l5 5 5-5" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 15V3" />
                </svg>
                Download JSON
              </button>
            </SettingsRow>
            <SettingsRow label="Clear activity log" hint="Wipes all notifications. You'll still be able to undo from the Activity page.">
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40"
                @click="confirmAndClearActivity"
              >
                Clear log
              </button>
            </SettingsRow>
            <SettingsRow label="Reset preferences" hint="Restore all settings on this page to their defaults.">
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                @click="reset"
              >
                Reset to defaults
              </button>
            </SettingsRow>
          </div>
        </SettingsCard>

        <!-- About -->
        <SettingsCard id="about" title="About" description="Build metadata for this workspace.">
          <dl class="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <dt class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Product</dt>
              <dd class="mt-1 font-semibold text-slate-900 dark:text-slate-100">{{ brandName }}</dd>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <dt class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Storage</dt>
              <dd class="mt-1 font-medium text-slate-700 dark:text-slate-300">localStorage + sessionStorage</dd>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <dt class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Realtime</dt>
              <dd class="mt-1 font-medium text-slate-700 dark:text-slate-300">BroadcastChannel (in-browser)</dd>
            </div>
            <div class="rounded-lg border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-950/40">
              <dt class="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Signed-in user</dt>
              <dd class="mt-1 font-medium text-slate-700 dark:text-slate-300">{{ user?.email || "—" }}</dd>
            </div>
          </dl>
        </SettingsCard>
      </div>
    </div>

    <ConfirmDialog
      v-model="passwordDialog"
      title="Update password"
      message="In this demo, password changes are handled via the registration flow. Production builds would wire in a secure change-password API and MFA re-verification here."
      confirm-label="Got it"
      cancel-label="Close"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useAppSettings } from "@/composables/useAppSettings.js";
import { useDarkMode } from "@/composables/useDarkMode.js";
import { useAuth } from "@/composables/useAuth.js";
import { useToast } from "@/composables/useToast.js";
import { BRAND } from "@/config/brand.js";
import { pushNotification } from "@/composables/useNotificationCenter.js";
import SettingsCard from "@/components/shared/SettingsCard.vue";
import SettingsRow from "@/components/shared/SettingsRow.vue";
import ToggleSwitch from "@/components/ui/ToggleSwitch.vue";
import SearchableListbox from "@/components/ui/SearchableListbox.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import { notificationItems, clearAllNotifications } from "@/composables/useNotificationCenter.js";

const router = useRouter();
const toast = useToast();
const { dark, setDark } = useDarkMode();
const { user, logout } = useAuth();
const { settings, reset } = useAppSettings();

const brandName = BRAND.name;

const passwordDialog = ref(false);

const accents = [
  { id: "sky", label: "Sky", bg: "bg-gradient-to-br from-sky-400 to-indigo-600" },
  { id: "violet", label: "Violet", bg: "bg-gradient-to-br from-violet-400 to-fuchsia-600" },
  { id: "emerald", label: "Emerald", bg: "bg-gradient-to-br from-emerald-400 to-teal-600" },
  { id: "amber", label: "Amber", bg: "bg-gradient-to-br from-amber-400 to-rose-500" },
  { id: "slate", label: "Slate", bg: "bg-gradient-to-br from-slate-500 to-slate-800" },
];

const channels = [
  { id: "activity", label: "Activity", hint: "Tasks, time, projects" },
  { id: "auth", label: "Security", hint: "Sign-ins, lockouts" },
  { id: "system", label: "System", hint: "Payroll, HR, reminders" },
];

const SECTION_ICON_APP = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12l4-8 4 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/></svg>`;
const SECTION_ICON_BELL = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.55 9.43C12.44 9.43 13.94 4.48 10 3.27 10 1.95 9.12 1 8 1S6 1.95 6 3.27C2.07 4.49 3.58 9.43 2.47 9.43 1.62 9.43 1 10.25 1 11.28S1.6 13 2.33 13h11.34C14.4 13 15 12.31 15 11.28s-.62-1.85-1.45-1.85z" stroke="currentColor" stroke-width="1.4"/></svg>`;
const SECTION_ICON_SHIELD = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1.5l5.5 2v4.9c0 3.2-2.4 5.9-5.5 6.6C4.9 14.3 2.5 11.6 2.5 8.4V3.5L8 1.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M5.8 8l1.6 1.6L10.4 6.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const SECTION_ICON_LOCK = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
const SECTION_ICON_INFO = `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="M8 7v4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="5" r="0.9" fill="currentColor"/></svg>`;

const sections = [
  { id: "appearance", label: "Appearance", icon: SECTION_ICON_APP },
  { id: "notifications", label: "Notifications", icon: SECTION_ICON_BELL },
  { id: "security", label: "Security", icon: SECTION_ICON_SHIELD },
  { id: "privacy", label: "Privacy & data", icon: SECTION_ICON_LOCK },
  { id: "about", label: "About", icon: SECTION_ICON_INFO },
];

const sectionOptions = sections.map((s) => ({ value: s.id, label: s.label }));

const activeSection = ref("appearance");

let observer = null;

onMounted(() => {
  if (!("IntersectionObserver" in window)) return;
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]?.target?.id) {
        activeSection.value = visible[0].target.id;
      }
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.3, 0.6, 1] },
  );
  sections.forEach((s) => {
    const el = document.getElementById(s.id);
    if (el) observer.observe(el);
  });
});

onUnmounted(() => {
  observer?.disconnect();
});

function scrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  activeSection.value = id;
}

function onSignOut() {
  logout();
  router.replace("/login");
}

function sendTestPush() {
  pushNotification({
    title: "Test notification",
    body: "If you can see this popup, real-time alerts are working on this device.",
    category: "system",
    severity: "success",
    module: "system",
    to: "/activity",
  });
}

function exportActivity() {
  try {
    const data = JSON.stringify(notificationItems.value, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `activity-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
    toast.success("Activity exported.");
  } catch {
    toast.error("Couldn't export activity log.");
  }
}

function confirmAndClearActivity() {
  if (settings.security.requireConfirmForDestructive) {
    if (!window.confirm("Clear the entire activity log? You can undo it from the Activity page.")) {
      return;
    }
  }
  clearAllNotifications();
  toast.info("Activity log cleared. Undo from the Activity page if needed.");
}
</script>
