<template>
  <div class="min-h-full bg-page-bg px-4 py-6 dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1 class="page-title mb-1">My team</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        People you work with most often. Open the menu for profile, email, and copy actions.
      </p>

      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label class="block min-w-0 flex-1">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Search</span>
          <input
            v-model="query"
            type="search"
            placeholder="Name, role, or location…"
            :class="inputFieldClass(false)"
          />
        </label>
      </div>

      <div class="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="overflow-x-auto">
          <table class="min-w-[720px] w-full text-left text-sm">
            <thead class="border-b border-slate-200 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">Name</th>
                <th class="px-6 py-3">Role</th>
                <th class="px-6 py-3">Location</th>
                <th class="px-6 py-3">Reports to</th>
                <th class="w-14 px-2 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr v-for="m in filtered" :key="m.id" class="hover:bg-gray-50/80 dark:hover:bg-slate-800/50">
                <td class="px-6 py-3">
                  <p class="font-medium text-gray-900 dark:text-gray-100">{{ m.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ m.email }}</p>
                </td>
                <td class="px-6 py-3 text-gray-800 dark:text-gray-200">{{ m.role }}</td>
                <td class="px-6 py-3 text-gray-600 dark:text-gray-400">{{ m.location }}</td>
                <td class="px-6 py-3 text-gray-700 dark:text-gray-300">{{ m.reportsTo }}</td>
                <td class="px-2 py-2 text-right align-middle">
                  <DropdownMenu aria-label="Teammate actions" :items="teamMenuItems(m)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div
          v-if="!filtered.length"
          class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
          role="status"
        >
          No teammates match your search.
        </div>
      </div>
    </div>

    <ModalPanel v-model="detailOpen">
      <template #title>{{ active?.name }}</template>
      <template v-if="active" #badges>
        <StatusBadge class="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Active</StatusBadge>
      </template>
      <template v-if="active" #actions>
        <DropdownMenu aria-label="Teammate profile actions" :items="teamDetailModalMenu(active)" />
      </template>
      <dl v-if="active" class="space-y-3">
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Email</dt><dd class="mt-0.5"><a :href="`mailto:${active.email}`" class="font-medium text-sky-600 underline dark:text-sky-400">{{ active.email }}</a></dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Role</dt><dd class="mt-0.5">{{ active.role }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Location</dt><dd class="mt-0.5">{{ active.location }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Reports to</dt><dd class="mt-0.5">{{ active.reportsTo }}</dd></div>
      </dl>
    </ModalPanel>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import seed from "@/data/teamMembers.json";
import { useToast } from "@/composables/useToast.js";
import { inputFieldClass } from "@/utils/formFieldClasses.js";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";

const members = ref(seed.map((m) => ({ ...m })));
const query = ref("");
const toast = useToast();
const detailOpen = ref(false);
const active = ref(null);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return members.value;
  return members.value.filter(
    (m) =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q),
  );
});

function teamDetailModalMenu(m) {
  return [
    {
      label: "Email",
      href: `mailto:${m.email}`,
    },
    {
      label: "Copy email",
      action: () => copyEmail(m),
    },
    {
      label: "Edit in HRIS",
      action: () => {
        detailOpen.value = false;
        toast.info("Profile updates are managed in HRIS (demo).", { module: "team", action: "update" });
      },
    },
  ];
}

function teamMenuItems(m) {
  return [
    {
      label: "View profile",
      action: () => {
        active.value = m;
        detailOpen.value = true;
      },
    },
    {
      label: "Email",
      href: `mailto:${m.email}`,
    },
    {
      label: "Copy email",
      action: () => copyEmail(m),
    },
  ];
}

async function copyEmail(m) {
  try {
    await navigator.clipboard.writeText(m.email);
    toast.success(`Copied ${m.email}`, { module: "team" });
  } catch {
    toast.error("Could not copy — select the address manually.", { module: "team" });
  }
}
</script>
