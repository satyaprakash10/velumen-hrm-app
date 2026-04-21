<template>
  <div class="relative shrink-0">
    <button
      ref="triggerRef"
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded-xl text-navy transition hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-navy/25 dark:text-gray-200 dark:hover:bg-gray-800"
      :aria-expanded="open"
      aria-haspopup="dialog"
      aria-label="Search the workspace"
      @click="openModal"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-3.8-3.8" />
      </svg>
    </button>

    <Teleport to="body">
      <!-- Scrim -->
      <transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-[10000] bg-slate-900/50 backdrop-blur-sm"
          aria-hidden="true"
          @click="close"
        />
      </transition>

      <!-- Dialog -->
      <transition
        enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 -translate-y-3 scale-[0.98]"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 -translate-y-2 scale-[0.98]"
      >
        <div
          v-if="open"
          ref="panelRef"
          class="search-panel fixed left-1/2 z-[10001] flex w-[min(100vw-1rem,720px)] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(2,6,23,0.35)] ring-1 ring-black/[0.04] dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
        >
          <header class="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
            <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl accent-soft" aria-hidden="true">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="7" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-3.8-3.8" />
              </svg>
            </span>
            <input
              ref="inputRef"
              v-model="query"
              type="search"
              autocomplete="off"
              spellcheck="false"
              class="min-w-0 flex-1 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-slate-50"
              placeholder="Search tasks, projects, docs, people, notifications…"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="activateHighlighted"
              @keydown.esc="close"
            />
            <button
              v-if="query"
              type="button"
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Clear search"
              @click="clearQuery"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span class="hidden items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 sm:inline-flex">
              Esc
            </span>
          </header>

          <div
            ref="listRef"
            class="scrollbar-kit relative max-h-[60vh] min-h-[120px] overflow-y-auto"
          >
            <!-- Empty state -->
            <div v-if="!query" class="px-5 py-8">
              <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                Suggested
              </p>
              <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  v-for="sug in suggestions"
                  :key="sug.label"
                  type="button"
                  class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-[13px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
                  @click="query = sug.query"
                >
                  <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg accent-soft" v-html="sug.icon" />
                  <span class="min-w-0">
                    <span class="block truncate">{{ sug.label }}</span>
                    <span class="block truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {{ sug.hint }}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            <!--
              Skeleton rows while the debounce is still in flight. Gives the
              modal a tangible sense of "I'm looking something up" even on
              slow networks or while the index warms up.
            -->
            <ul v-else-if="showSkeleton" class="py-1" aria-busy="true" aria-live="polite">
              <li
                v-for="n in 5"
                :key="`sk-${n}`"
                class="flex items-center gap-3 px-4 py-2.5"
              >
                <span class="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-slate-200/80 dark:bg-slate-800" />
                <span class="min-w-0 flex-1 space-y-1.5">
                  <span class="block h-3 w-2/3 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
                  <span class="block h-2.5 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800/70" />
                </span>
                <span class="h-4 w-10 shrink-0 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800" />
              </li>
            </ul>

            <div v-else-if="!results.length" class="px-6 py-12 text-center">
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <circle cx="11" cy="11" r="7" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-3.8-3.8" />
                </svg>
              </div>
              <p class="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                Nothing matches "{{ query }}"
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Try a task name, a project code, a teammate, or a page.
              </p>
            </div>

            <ul v-else class="py-1">
              <template v-for="(row, i) in flatResults" :key="row.id">
                <li
                  v-if="row.kind === 'header'"
                  class="px-4 py-2 pt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500"
                >
                  {{ row.label }}
                </li>
                <li v-else>
                  <button
                    :id="`gs-item-${i}`"
                    type="button"
                    class="flex w-full items-start gap-3 px-4 py-2.5 text-left transition"
                    :class="
                      highlight === row.flatIdx
                        ? 'bg-slate-100 dark:bg-slate-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    "
                    @mousemove="highlight = row.flatIdx"
                    @click="activate(row.item)"
                  >
                    <span
                      class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1"
                      :class="toneWrap(row.item.tone)"
                      aria-hidden="true"
                    >
                      <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="row.item.icon" />
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="flex items-center gap-2">
                        <span class="min-w-0 truncate text-[14px] font-semibold text-slate-900 dark:text-slate-50">
                          {{ row.item.title }}
                        </span>
                        <span
                          class="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          :class="toneChip(row.item.tone)"
                        >
                          {{ row.item.type }}
                        </span>
                      </span>
                      <span
                        v-if="row.item.body"
                        class="mt-0.5 block truncate text-[12px] text-slate-500 dark:text-slate-400"
                      >
                        {{ row.item.body }}
                      </span>
                    </span>
                    <span
                      v-if="row.item.meta"
                      class="ml-2 shrink-0 self-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {{ row.item.meta }}
                    </span>
                  </button>
                </li>
              </template>
            </ul>
          </div>

          <footer class="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-semibold dark:border-slate-700 dark:bg-slate-900">↑</kbd>
              <kbd class="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-semibold dark:border-slate-700 dark:bg-slate-900">↓</kbd>
              to move
            </span>
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-semibold dark:border-slate-700 dark:bg-slate-900">↵</kbd>
              to open
            </span>
            <span class="flex items-center gap-1">
              <kbd class="rounded border border-slate-300 bg-white px-1.5 py-0.5 font-semibold dark:border-slate-700 dark:bg-slate-900">Esc</kbd>
              to close
            </span>
          </footer>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useGlobalSearch } from "@/composables/useGlobalSearch.js";

const router = useRouter();
const { search } = useGlobalSearch();

const open = ref(false);
const query = ref("");
const highlight = ref(0);
const triggerRef = ref(null);
const panelRef = ref(null);
const inputRef = ref(null);
const listRef = ref(null);

// Debounced search so every keystroke doesn't reshuffle the list mid-type.
const debouncedQuery = ref("");
const pending = ref(false);
let debounceTimer = null;
watch(query, (v) => {
  if (debounceTimer) window.clearTimeout(debounceTimer);
  if (v) pending.value = true;
  debounceTimer = window.setTimeout(() => {
    debouncedQuery.value = v;
    pending.value = false;
  }, 140);
});

const results = computed(() => search(debouncedQuery.value));
const showSkeleton = computed(() => query.value && pending.value);

/** Flattened list with group headers + index pointers for keyboard nav. */
const flatResults = computed(() => {
  const rows = [];
  let flatIdx = 0;
  let prevGroup = null;
  for (const item of results.value) {
    if (item.group && item.group !== prevGroup) {
      rows.push({ kind: "header", label: item.group, id: `hdr-${item.group}` });
      prevGroup = item.group;
    }
    rows.push({ kind: "item", item, flatIdx, id: item.id });
    flatIdx += 1;
  }
  return rows;
});

const selectableCount = computed(() => results.value.length);

const suggestions = [
  {
    label: "Open task board",
    hint: "Kanban, filters, timers",
    query: "tasks",
    icon: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 7.5l1.8 1.8L11 5.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    label: "My payslips",
    hint: "Payroll history and exports",
    query: "payslip",
    icon: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  {
    label: "Leaves",
    hint: "Upcoming, pending, history",
    query: "leave",
    icon: `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  },
  {
    label: "Activity log",
    hint: "Audit trail with undo/redo",
    query: "signed in",
    icon: `<svg viewBox="0 0 16 16" fill="none"><path d="M1.5 8h2.3l1.8-4.5L8.5 12l1.7-4 .8 1.5h3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
];

function openModal() {
  open.value = true;
}

function close() {
  open.value = false;
}

function clearQuery() {
  query.value = "";
  nextTick(() => inputRef.value?.focus());
}

function move(delta) {
  if (!selectableCount.value) return;
  highlight.value =
    (highlight.value + delta + selectableCount.value) % selectableCount.value;
  nextTick(scrollHighlightIntoView);
}

function scrollHighlightIntoView() {
  const el = document.getElementById(`gs-item-${highlight.value}`);
  if (!el || !listRef.value) return;
  const rect = el.getBoundingClientRect();
  const host = listRef.value.getBoundingClientRect();
  if (rect.top < host.top) {
    listRef.value.scrollBy({ top: rect.top - host.top - 8, behavior: "smooth" });
  } else if (rect.bottom > host.bottom) {
    listRef.value.scrollBy({ top: rect.bottom - host.bottom + 8, behavior: "smooth" });
  }
}

function activateHighlighted() {
  const item = results.value[highlight.value];
  if (item) activate(item);
}

function activate(item) {
  close();
  if (item?.to) {
    router.push(item.to).catch(() => {});
  }
}

function toneWrap(tone) {
  switch (tone) {
    case "violet":
      return "bg-violet-50 text-violet-600 ring-violet-100 dark:bg-violet-950/60 dark:text-violet-300 dark:ring-violet-900/60";
    case "emerald":
      return "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900/60";
    case "amber":
      return "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900/60";
    case "rose":
      return "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900/60";
    case "slate":
      return "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700";
    case "indigo":
      return "bg-indigo-50 text-indigo-600 ring-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-900/60";
    case "sky":
    default:
      return "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900/60";
  }
}

function toneChip(tone) {
  switch (tone) {
    case "violet":
      return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300";
    case "emerald":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "amber":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "rose":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
    case "slate":
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
    case "indigo":
      return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300";
    case "sky":
    default:
      return "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  }
}

function onKey(e) {
  if (e.key === "Escape" && open.value) close();
  // Also let Cmd/Ctrl + K summon the modal globally.
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    if (!open.value) openModal();
  }
}

watch(open, (v) => {
  if (v) {
    document.documentElement.classList.add("gs-open");
    nextTick(() => inputRef.value?.focus());
  } else {
    document.documentElement.classList.remove("gs-open");
    highlight.value = 0;
    query.value = "";
  }
});

watch(results, () => {
  highlight.value = 0;
});

if (typeof document !== "undefined") {
  document.addEventListener("keydown", onKey);
}

onUnmounted(() => {
  document.removeEventListener("keydown", onKey);
  if (debounceTimer) window.clearTimeout(debounceTimer);
  document.documentElement.classList.remove("gs-open");
});
</script>

<style scoped>
.search-panel {
  top: clamp(2.5rem, 8vh, 5rem);
  max-height: calc(100vh - 4rem);
}

@media (max-width: 640px) {
  .search-panel {
    top: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    transform: none;
    width: auto;
  }
  .search-panel > header {
    padding-top: 0.875rem;
  }
}
</style>
