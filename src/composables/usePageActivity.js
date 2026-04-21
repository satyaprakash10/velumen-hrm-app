import { onMounted } from "vue";
import { emitActivity } from "@/utils/activityBus.js";

/**
 * Record an activity entry when a page mounts. Used for passive views like
 * "Org chart", "My team", or the payslips dashboard where the act of opening
 * the page is itself the meaningful user action to audit.
 *
 * Kept deliberately lightweight:
 *   - No toast (`toast: false`)
 *   - No real-time push popup (`silent: true`)
 *   - Severity "info"
 *
 * The event still lands in the notification center so the Activity page
 * shows a full timeline, but the user isn't interrupted with a popup every
 * time they switch routes.
 *
 * @param {{ title: string, module: string, message?: string, to?: string }} opts
 */
export function usePageActivity(opts) {
  onMounted(() => {
    emitActivity({
      title: opts.title,
      message: opts.message || `Opened ${opts.title}`,
      module: opts.module,
      severity: "info",
      category: "activity",
      toast: false,
      silent: true,
      to: opts.to,
      context: { event: "page_view", page: opts.module },
    });
  });
}
