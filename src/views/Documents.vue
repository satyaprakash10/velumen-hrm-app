<template>
  <div class="min-h-full bg-page-bg px-4 py-6 transition-colors dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <h1 class="page-title mb-1 dark:text-gray-100">Documents</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        HR policies and personal files. Click a row name to view — downloads are real PDFs generated in the browser.
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
                <th class="w-14 px-2 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody class="divide-y divide-subtle-02 dark:divide-gray-800">
              <tr v-for="d in filtered" :key="d.id" class="hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                <td class="px-6 py-3">
                  <div class="flex items-center gap-3">
                    <span
                      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-50 to-indigo-50 text-sky-600 ring-1 ring-sky-100 dark:from-sky-950/60 dark:to-indigo-950/40 dark:text-sky-300 dark:ring-sky-900/60"
                      aria-hidden="true"
                    >
                      <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5M9 13h6M9 17h4" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      class="table-title-link text-left font-medium text-gray-900 dark:text-gray-100"
                      @click="openDetail(d)"
                    >
                      <span class="table-title-link-text">{{ d.name }}</span>
                    </button>
                    <span
                      v-if="d.confidential"
                      class="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900/60"
                    >
                      <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M8 2l5 2v5c0 3.5-2.5 6-5 6s-5-2.5-5-6V4l5-2z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                      </svg>
                      Confidential
                    </span>
                  </div>
                </td>
                <td class="px-6 py-3">
                  <span class="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <span class="h-1.5 w-1.5 rounded-full" :class="categoryDotClass(d.category)" aria-hidden="true" />
                    {{ d.category }}
                  </span>
                </td>
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

    <ModalPanel v-model="detailOpen" :icon="DOC_MODAL_ICON">
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
      <div v-if="activeDoc" class="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <ModalFact
          label="Category"
          :value="activeDoc.category"
          icon="folder"
          :tone="categoryTone(activeDoc.category)"
          badge
        />
        <ModalFact
          label="Last updated"
          :value="formatDate(activeDoc.updatedAt)"
          icon="calendar"
          tone="sky"
        />
        <ModalFact
          label="File size"
          :value="`${activeDoc.sizeKb} KB`"
          icon="size"
          tone="indigo"
        />
        <ModalFact
          label="Access"
          :value="activeDoc.confidential ? 'Confidential' : 'Shared'"
          icon="shield"
          :tone="activeDoc.confidential ? 'amber' : 'emerald'"
          badge
        />
      </div>
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
import { downloadPdf } from "@/utils/pdfDownload.js";
import { emitActivity } from "@/utils/activityBus.js";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import StatusBadge from "@/components/ui/StatusBadge.vue";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import SearchableListbox from "@/components/ui/SearchableListbox.vue";
import ModalFact from "@/components/shared/ModalFact.vue";
import { usePageActivity } from "@/composables/usePageActivity.js";

usePageActivity({
  title: "Documents opened",
  module: "documents",
  to: "/docs",
});

const DOC_MODAL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="h-full w-full"><path stroke-linecap="round" stroke-linejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z"/><path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5M9 13h6M9 17h4"/></svg>`;

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

function openDetail(d) {
  activeDoc.value = d;
  detailOpen.value = true;
  emitActivity({
    title: "Document viewed",
    message: d.name,
    module: "documents",
    severity: "info",
    toast: false,
    silent: true,
    context: { event: "document_view", documentId: d.id },
  });
}

function download(d) {
  try {
    const filename = d.name.toLowerCase().endsWith(".pdf")
      ? d.name
      : `${d.name}.pdf`;
    downloadPdf({
      filename,
      title: d.name.replace(/\.pdf$/i, ""),
      subtitle: `${d.category || "Document"} · Updated ${formatDate(d.updatedAt)}`,
      body: buildDocumentBody(d),
      footer: "Generated by the Velumen workspace demo — not a legally binding document.",
    });
    toast.success(`Downloaded ${d.name}.`, { module: "documents", action: "download" });
    emitActivity({
      title: "Document downloaded",
      message: d.name,
      module: "documents",
      severity: "success",
      toast: false,
      silent: true,
      context: { event: "document_download", documentId: d.id },
    });
  } catch {
    toast.error(`Couldn't download ${d.name}.`, { module: "documents", action: "download" });
  }
}

function buildDocumentBody(d) {
  const sections = [
    `Name: ${d.name}`,
    `Category: ${d.category}`,
    `Last updated: ${formatDate(d.updatedAt)}`,
    `Size on disk: ${d.sizeKb} KB`,
    `Access level: ${d.confidential ? "Confidential — internal use only" : "Shared with employees"}`,
    "",
    "Overview",
    "--------",
    `This is a demonstration document produced client-side by the Velumen workspace. It stands in for the "${d.name}" file you would normally download from HR or the payroll provider.`,
    "",
    "Key points",
    "----------",
    "1. All data lives in this browser — nothing is uploaded.",
    "2. The PDF above is generated on the fly, so what you see is what you got.",
    "3. Swap in a real file endpoint in production by replacing the downloadPdf() call with a fetch to your storage service.",
    "",
    "If this were a real file we would include the full policy, signature blocks, and internal references here.",
  ];
  return sections.join("\n");
}

function categoryDotClass(category) {
  switch (String(category || "").toLowerCase()) {
    case "hr":
      return "bg-sky-500";
    case "payroll":
      return "bg-emerald-500";
    case "benefits":
      return "bg-violet-500";
    case "policies":
    case "policy":
      return "bg-amber-500";
    default:
      return "bg-slate-400";
  }
}

function categoryTone(category) {
  switch (String(category || "").toLowerCase()) {
    case "hr":
      return "sky";
    case "payroll":
      return "emerald";
    case "benefits":
      return "violet";
    case "policies":
    case "policy":
      return "amber";
    default:
      return "slate";
  }
}

function docMenuItems(d) {
  return [
    {
      label: "View details",
      icon: "eye",
      action: () => openDetail(d),
    },
    {
      label: "Download PDF",
      icon: "download",
      action: () => download(d),
    },
  ];
}

function docDetailModalMenu(d) {
  return [
    {
      label: "Download PDF",
      icon: "download",
      action: () => download(d),
    },
    {
      label: "Rename",
      icon: "pencil",
      action: () => toast.info("Rename isn't available in this demo.", { module: "documents", action: "update" }),
    },
    { divider: true },
    {
      label: "Delete",
      icon: "trash",
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
  const row = activeDoc.value;
  deleteDocOpen.value = false;
  if (!row) return;
  const i = docs.value.findIndex((x) => x.id === row.id);
  if (i >= 0) docs.value.splice(i, 1);
  toast.push("Document removed from your list.", "info", { module: "documents", action: "delete" });
  emitActivity({
    title: "Document removed",
    message: row.name,
    module: "documents",
    severity: "warning",
    toast: false,
    silent: true,
    context: { event: "document_delete", documentId: row.id },
  });
  activeDoc.value = null;
}
</script>
