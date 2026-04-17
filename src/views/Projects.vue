<template>
  <div class="min-h-full bg-page-bg px-4 py-6 dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[1100px]">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="page-title mb-1">Projects</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Create and maintain projects used across time entry and the task board.
          </p>
        </div>
        <button type="button" :class="btnPrimaryClass" class="inline-flex items-center gap-2" @click="openCreate">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New project
        </button>
      </div>

      <div
        class="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label class="min-w-0 flex-1 sm:max-w-md">
          <span class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Search</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search name, code, description…"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100"
          />
        </label>
        <div class="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:max-w-lg sm:grid-cols-2">
          <ListboxField v-model="sortOption" label="Sort" :options="sortOptions" placeholder="Sort by…" />
          <ListboxField v-model="descriptionFilter" label="Description" :options="descriptionOptions" placeholder="Filter…" />
        </div>
        <button
          v-if="filtersActive"
          type="button"
          class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>

      <div class="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div class="scrollbar-kit max-h-[min(70vh,720px)] overflow-x-auto overflow-y-auto">
          <table class="w-full min-w-[640px] text-left text-sm">
          <thead class="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-gray-400">
            <tr>
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3">Code</th>
              <th class="px-6 py-3">Description</th>
              <th class="w-14 px-3 py-3 text-right" aria-label="Actions" />
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            <tr v-for="p in displayedProjects" :key="p.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
              <td class="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{{ p.name }}</td>
              <td class="px-6 py-3 tabular-nums text-gray-600 dark:text-gray-300">{{ p.code }}</td>
              <td class="max-w-md truncate px-6 py-3 text-gray-600 dark:text-gray-400" :title="p.description">
                {{ p.description || "—" }}
              </td>
              <td class="px-2 py-2 text-right">
                <DropdownMenu aria-label="Project actions" :items="rowMenuItems(p)" placement="bottom-end" />
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <p v-if="!projects.length" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No projects yet.
        </p>
        <p v-else-if="!displayedProjects.length" class="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
          No projects match your search or filters.
        </p>
      </div>
    </div>

    <ModalPanel v-model="editorOpen">
      <template #title>{{ editingId ? "Edit project" : "New project" }}</template>
      <form class="space-y-4" @submit.prevent="save">
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Name</span>
          <input v-model="form.name" type="text" maxlength="120" :class="inputFieldClass(!!fieldErrors.name)" />
          <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Code</span>
          <input v-model="form.code" type="text" maxlength="8" :class="inputFieldClass(!!fieldErrors.code)" />
          <p v-if="fieldErrors.code" class="mt-1 text-xs text-red-600">{{ fieldErrors.code }}</p>
        </label>
        <label class="block">
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Description</span>
          <textarea
            v-model="form.description"
            rows="3"
            maxlength="500"
            :class="inputFieldClass(!!fieldErrors.description)"
            class="resize-y"
          />
          <p v-if="fieldErrors.description" class="mt-1 text-xs text-red-600">{{ fieldErrors.description }}</p>
        </label>
        <div class="flex flex-wrap gap-2 pt-2">
          <button type="submit" :class="btnPrimaryClass" class="inline-flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Save
          </button>
          <button type="button" :class="btnSecondaryClass" @click="editorOpen = false">Cancel</button>
        </div>
      </form>
    </ModalPanel>

    <ModalPanel v-model="viewOpen">
      <template #title>{{ viewProject?.name }}</template>
      <template #subtitle>
        <span class="tabular-nums">{{ viewProject?.code }}</span>
      </template>
      <div v-if="viewProject" class="space-y-3 text-sm text-slate-700 dark:text-slate-300">
        <div>
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</span>
          <p class="mt-1 whitespace-pre-wrap">{{ viewProject.description || "—" }}</p>
        </div>
      </div>
    </ModalPanel>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Delete project?"
      :message="deleteTarget ? `Remove “${deleteTarget.name}” from the catalog.` : ''"
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import { useProjects } from "@/composables/useProjects.js";
import { useToast } from "@/composables/useToast.js";
import { inputFieldClass, btnPrimaryClass, btnSecondaryClass } from "@/utils/formFieldClasses.js";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import ListboxField from "@/components/ui/ListboxField.vue";

const { projects, addProject, updateProject, removeProject } = useProjects();
const toast = useToast();

const searchQuery = ref("");
const sortOption = ref("name_asc");
const descriptionFilter = ref("all");

const sortOptions = [
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "code_asc", label: "Code A–Z" },
  { value: "code_desc", label: "Code Z–A" },
];

const descriptionOptions = [
  { value: "all", label: "All projects" },
  { value: "with", label: "With description" },
  { value: "without", label: "No description" },
];

const filtersActive = computed(() => {
  return Boolean(searchQuery.value.trim()) || descriptionFilter.value !== "all";
});

const displayedProjects = computed(() => {
  let list = projects.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const code = (p.code || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(q) || code.includes(q) || desc.includes(q);
    });
  }
  if (descriptionFilter.value === "with") {
    list = list.filter((p) => String(p.description || "").trim().length > 0);
  } else if (descriptionFilter.value === "without") {
    list = list.filter((p) => !String(p.description || "").trim().length);
  }
  const key = sortOption.value;
  const dir = key.endsWith("_desc") ? -1 : 1;
  const byCode = key.startsWith("code");
  return [...list].sort((a, b) => {
    const A = byCode ? String(a.code || "") : String(a.name || "");
    const B = byCode ? String(b.code || "") : String(b.name || "");
    return dir * A.localeCompare(B, undefined, { sensitivity: "base" });
  });
});

function clearFilters() {
  searchQuery.value = "";
  descriptionFilter.value = "all";
}

const editorOpen = ref(false);
const editingId = ref(null);
const fieldErrors = reactive({ name: "", code: "", description: "" });
const form = reactive({ name: "", code: "", description: "" });

const viewOpen = ref(false);
const viewProject = ref(null);

const deleteOpen = ref(false);
const deleteTarget = ref(null);

function clearErrors() {
  fieldErrors.name = "";
  fieldErrors.code = "";
  fieldErrors.description = "";
}

function validateForm() {
  clearErrors();
  let ok = true;
  const name = form.name.trim();
  if (name.length < 2) {
    fieldErrors.name = "Enter a name with at least 2 characters.";
    ok = false;
  }
  const code = form.code.trim();
  if (code.length > 8) {
    fieldErrors.code = "Code must be 8 characters or fewer.";
    ok = false;
  }
  if (form.description.length > 500) {
    fieldErrors.description = "Description must be 500 characters or less.";
    ok = false;
  }
  return ok;
}

function openCreate() {
  editingId.value = null;
  clearErrors();
  form.name = "";
  form.code = "";
  form.description = "";
  editorOpen.value = true;
}

function openEdit(p) {
  editingId.value = p.id;
  clearErrors();
  form.name = p.name;
  form.code = p.code;
  form.description = p.description || "";
  editorOpen.value = true;
}

function openView(p) {
  viewProject.value = p;
  viewOpen.value = true;
}

function rowMenuItems(p) {
  return [
    { label: "View", icon: "eye", action: () => openView(p) },
    { label: "Edit", icon: "pencil", action: () => openEdit(p) },
    {
      label: "Delete",
      danger: true,
      icon: "trash",
      action: () => {
        deleteTarget.value = p;
        deleteOpen.value = true;
      },
    },
  ];
}

function save() {
  if (!validateForm()) return;
  const name = form.name.trim();
  if (!editingId.value) {
    const row = addProject({ name, code: form.code, description: form.description });
    if (!row) {
      fieldErrors.name = "A project with this name already exists.";
      return;
    }
    toast.success("Project created.", { module: "projects", action: "create" });
  } else {
    const ok = updateProject(editingId.value, {
      name,
      code: form.code,
      description: form.description,
    });
    if (!ok) {
      fieldErrors.name = "Could not save (duplicate name?).";
      return;
    }
    toast.success("Project updated.", { module: "projects", action: "update" });
  }
  editorOpen.value = false;
}

function onDeleteConfirmed() {
  const t = deleteTarget.value;
  deleteTarget.value = null;
  if (!t) return;
  removeProject(t.id);
  if (viewProject.value?.id === t.id) {
    viewOpen.value = false;
    viewProject.value = null;
  }
  toast.push("Project removed.", "info", { module: "projects", action: "delete" });
}
</script>
