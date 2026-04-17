<template>
  <div class="min-h-full bg-page-bg px-4 py-6 transition-colors dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1 class="page-title mb-1 dark:text-gray-100">Documents</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        HR policies and personal files. Downloads are simulated in this demo.
      </p>

      <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <label class="block min-w-0 flex-1">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Search</span>
          <input
            v-model="query"
            type="search"
            placeholder="Name or category…"
            class="mt-1.5 w-full rounded-lg border border-subtle-02 bg-white px-3 py-2.5 text-sm outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
        </label>
        <div class="sm:w-64">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Category</span>
          <SearchableListbox
            v-model="category"
            class="mt-1.5 block"
            :options="categoryOptions"
            placeholder="All categories"
            :searchable="true"
          />
        </div>
      </div>

      <div class="mt-8 overflow-hidden rounded-xl border border-subtle-02 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div class="overflow-x-auto">
          <table class="min-w-[640px] w-full text-left text-sm">
            <thead class="border-b border-subtle-02 bg-gray-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
              <tr>
                <th class="px-6 py-3">Name</th>
                <th class="px-6 py-3">Category</th>
                <th class="px-6 py-3">Updated</th>
                <th class="px-6 py-3">Size</th>
                <th class="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-subtle-02 dark:divide-gray-800">
              <tr v-for="d in filtered" :key="d.id" class="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                <td class="px-6 py-3">
                  <span class="font-medium text-gray-900 dark:text-gray-100">{{ d.name }}</span>
                  <span
                    v-if="d.confidential"
                    class="ml-2 inline-flex rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                  >
                    Confidential
                  </span>
                </td>
                <td class="px-6 py-3 text-gray-700 dark:text-gray-300">{{ d.category }}</td>
                <td class="px-6 py-3 tabular-nums text-gray-600 dark:text-gray-400">{{ formatDate(d.updatedAt) }}</td>
                <td class="px-6 py-3 tabular-nums text-gray-600 dark:text-gray-400">{{ d.sizeKb }} KB</td>
                <td class="px-2 py-2 text-right align-middle">
                  <DropdownMenu aria-label="Document actions" :items="docMenuItems(d)" />
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
          No documents match your filters.
        </div>
      </div>
    </div>

    <ModalPanel v-model="detailOpen">
      <template #title>{{ activeDoc?.name }}</template>
      <template v-if="activeDoc" #badges>
        <StatusBadge
          v-if="activeDoc.confidential"
          class="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          Confidential
        </StatusBadge>
        <StatusBadge class="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {{ activeDoc.category }}
        </StatusBadge>
      </template>
      <template v-if="activeDoc" #actions>
        <DropdownMenu aria-label="Document actions" :items="docDetailModalMenu(activeDoc)" />
      </template>
      <dl v-if="activeDoc" class="space-y-3">
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Category</dt><dd class="mt-0.5">{{ activeDoc.category }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Updated</dt><dd class="mt-0.5 tabular-nums">{{ formatDate(activeDoc.updatedAt) }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Size</dt><dd class="mt-0.5">{{ activeDoc.sizeKb }} KB</dd></div>
      </dl>
    </ModalPanel>

    <ConfirmDialog
      v-model="deleteDocOpen"
      title="Remove document?"
      message="This removes the file from your list in this demo (not from any server)."
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onDeleteDocConfirmed"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import seed from "@/data/documents.json";
import { useToast } from "@/composables/useToast.js";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import SearchableListbox from "@/components/ui/SearchableListbox.vue";

const docs = ref(seed.map((d) => ({ ...d })));
const query = ref("");
const category = ref("");
const toast = useToast();
const detailOpen = ref(false);
const deleteDocOpen = ref(false);
const activeDoc = ref(null);

const categories = computed(() => {
  const s = new Set(docs.value.map((d) => d.category));
  return [...s].sort();
});

const categoryOptions = computed(() => [
  { value: "", label: "All categories" },
  ...categories.value.map((c) => ({ value: c, label: c })),
]);

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return docs.value.filter((d) => {
    if (category.value && d.category !== category.value) return false;
    if (!q) return true;
    return (
      d.name.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q)
    );
  });
});

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function download(d) {
  toast.success(`Preparing download: ${d.name}`, { module: "documents", action: "download" });
}

function docMenuItems(d) {
  return [
    {
      label: "View details",
      action: () => {
        activeDoc.value = d;
        detailOpen.value = true;
      },
    },
    {
      label: "Download",
      action: () => download(d),
    },
  ];
}

function docDetailModalMenu(d) {
  return [
    {
      label: "Download",
      action: () => download(d),
    },
    {
      label: "Rename",
      action: () => toast.info("Rename is not available in this demo.", { module: "documents", action: "update" }),
    },
    {
      label: "Delete",
      danger: true,
      action: () => {
        activeDoc.value = d;
        detailOpen.value = false;
        deleteDocOpen.value = true;
      },
    },
  ];
}

function onDeleteDocConfirmed() {
  const id = activeDoc.value?.id;
  deleteDocOpen.value = false;
  if (id == null) {
    activeDoc.value = null;
    return;
  }
  const i = docs.value.findIndex((x) => x.id === id);
  if (i >= 0) docs.value.splice(i, 1);
  toast.push("Document removed from your list.", "info", { module: "documents", action: "delete" });
  activeDoc.value = null;
}
</script>
