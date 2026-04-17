import { ref } from "vue";
import seed from "@/data/notifications.json";

let nid = 1000;

export const notificationItems = ref(seed.map((n) => ({ ...n })));

export function pushNotification({ title, body }) {
  notificationItems.value = [
    {
      id: `live-${++nid}`,
      title: title || "Update",
      body: body || "",
      time: new Date().toISOString(),
      read: false,
    },
    ...notificationItems.value,
  ].slice(0, 40);
}
