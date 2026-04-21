<template>
  <router-view />
  <ToastStack />
  <NotificationPushToaster />
</template>

<script setup>
import { onMounted, onUnmounted, watch } from "vue";
import ToastStack from "@/components/shared/ToastStack.vue";
import NotificationPushToaster from "@/components/shared/NotificationPushToaster.vue";
import { useToast } from "@/composables/useToast.js";
import { pushNotification } from "@/composables/useNotificationCenter.js";
import { useAppSettings } from "@/composables/useAppSettings.js";
import { applyAccent, applyDensity } from "@/utils/accentTheme.js";

const toast = useToast();
const { settings } = useAppSettings();

const TOAST_BY_SEVERITY = {
  success: "success",
  error: "error",
  warning: "error",
  info: "info",
};

/**
 * Global activity bridge. Lives at the App root so toasts fire even when the
 * current route is outside MainLayout (auth screens, landing). Notifications
 * always land in the center for audit; channel mutes only silence the toast
 * and push popup, never the historical record.
 */
function onEssActivity(e) {
  const d = e.detail || {};
  const severity = ["info", "success", "warning", "error"].includes(d.severity)
    ? d.severity
    : "info";
  const category = ["auth", "activity", "system"].includes(d.category)
    ? d.category
    : "activity";

  const channelEnabled = settings.notifications.channels?.[category] !== false;

  if (d.toast !== false && channelEnabled) {
    const toastType = TOAST_BY_SEVERITY[severity] || "info";
    const text = d.message || d.body || d.title || "Update";
    toast[toastType](text, { module: d.module });
  }

  if (d.notify !== false && (d.title || d.message || d.body)) {
    pushNotification({
      title: d.title || "Activity",
      body: d.message || d.body || "",
      module: d.module || null,
      category,
      severity,
      context: d.context || null,
      to: d.to || null,
      // Silent events (e.g. page views) skip the real-time push popup but
      // still land in the inbox so the audit timeline stays complete.
      silent: d.silent === true,
    });
  }
}

watch(
  () => settings.appearance?.accent,
  (val) => {
    applyAccent(val);
  },
  { immediate: true },
);

watch(
  () => settings.appearance?.density,
  (val) => {
    applyDensity(val);
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("ess-activity", onEssActivity);
});

onUnmounted(() => {
  window.removeEventListener("ess-activity", onEssActivity);
});
</script>
