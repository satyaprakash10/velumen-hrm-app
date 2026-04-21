<template>
  <section class="space-y-3" aria-labelledby="subtasks-heading">
    <header class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <h3
          id="subtasks-heading"
          class="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
        >
          Subtasks
        </h3>
        <span
          v-if="items.length"
          class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <span class="tabular-nums">{{ doneCount }}</span>
          <span class="text-slate-400">/</span>
          <span class="tabular-nums">{{ items.length }}</span>
        </span>
      </div>
      <div
        v-if="items.length"
        class="relative h-1 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
        aria-hidden="true"
      >
        <span
          class="accent-gradient absolute inset-y-0 left-0 transition-[width] duration-300"
          :style="{ width: `${progressPct}%` }"
        />
      </div>
    </header>

    <ul
      v-if="items.length"
      ref="listRef"
      class="space-y-1.5"
      role="list"
    >
      <li
        v-for="(sub, i) in items"
        :key="sub.id"
        :data-index="i"
        class="subtask-row group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition-[border-color,box-shadow,background-color] dark:border-slate-700 dark:bg-slate-900"
        :class="[
          draggingId === sub.id
            ? 'pointer-events-none opacity-0'
            : '',
          dragOverId === sub.id && draggingId && draggingId !== sub.id
            ? 'accent-border shadow-[0_4px_18px_color-mix(in_srgb,var(--accent-fg)_25%,transparent)]'
            : '',
        ]"
      >
        <button
          type="button"
          class="flex h-5 w-5 shrink-0 cursor-grab items-center justify-center rounded text-slate-300 transition hover:bg-slate-100 hover:text-slate-500 active:cursor-grabbing dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Drag to reorder"
          :disabled="items.length <= 1"
          @pointerdown.stop="startDrag($event, sub.id)"
        >
          <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="6" cy="4" r="1" fill="currentColor" />
            <circle cx="10" cy="4" r="1" fill="currentColor" />
            <circle cx="6" cy="8" r="1" fill="currentColor" />
            <circle cx="10" cy="8" r="1" fill="currentColor" />
            <circle cx="6" cy="12" r="1" fill="currentColor" />
            <circle cx="10" cy="12" r="1" fill="currentColor" />
          </svg>
        </button>

        <label class="flex shrink-0 cursor-pointer items-center">
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="sub.done"
            :aria-label="`Mark ${sub.title} as ${sub.done ? 'not done' : 'done'}`"
            @change="toggle(sub)"
          />
          <span
            class="flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 border-slate-300 bg-white transition peer-checked:accent-bg peer-checked:accent-border peer-focus-visible:shadow-[0_0_0_3px_var(--accent-ring)] dark:border-slate-600 dark:bg-slate-900"
          >
            <svg
              v-if="sub.done"
              class="h-3 w-3"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8l2.5 2.5L12 5" />
            </svg>
          </span>
        </label>

        <input
          v-if="editingId === sub.id"
          ref="editorRef"
          :value="editingValue"
          type="text"
          maxlength="200"
          class="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[13px] text-slate-900 outline-none transition focus:border-[color:var(--accent-fg)] focus:shadow-[0_0_0_3px_var(--accent-ring)] dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
          @input="editingValue = $event.target.value"
          @keydown.enter.prevent="commitEdit(sub)"
          @keydown.esc.prevent="cancelEdit"
          @blur="commitEdit(sub)"
        />
        <button
          v-else
          type="button"
          class="min-w-0 flex-1 truncate rounded px-1 py-0.5 text-left text-[13px] transition focus:outline-none focus-visible:bg-slate-100 dark:focus-visible:bg-slate-800"
          :class="sub.done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'"
          @click="startEdit(sub)"
        >
          {{ sub.title }}
        </button>

        <div class="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            :aria-label="`Edit ${sub.title}`"
            @click="startEdit(sub)"
          >
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
            :aria-label="`Delete ${sub.title}`"
            @click="remove(sub)"
          >
            <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </li>
    </ul>

    <p
      v-else
      class="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2.5 text-[12px] text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
    >
      Break the work down into small steps. Add your first subtask below.
    </p>

    <form class="flex items-center gap-2" @submit.prevent="addNew">
      <input
        v-model="draft"
        type="text"
        maxlength="200"
        placeholder="Add a subtask…"
        class="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 outline-none transition focus:border-[color:var(--accent-fg)] focus:shadow-[0_0_0_3px_var(--accent-ring)] dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
      />
      <button
        type="submit"
        class="accent-gradient accent-focus inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2.5 text-[12px] font-semibold transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!draft.trim()"
      >
        <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </form>

    <!-- Drag ghost: teleported out of the list so the moving row isn't clipped -->
    <Teleport to="body">
      <article
        v-if="draggingSub"
        class="pointer-events-none fixed z-[10500] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[13px] shadow-[0_20px_40px_rgba(2,6,23,0.25)] dark:border-slate-700 dark:bg-slate-900"
        :style="ghostStyle"
        aria-hidden="true"
      >
        <span class="flex items-center gap-2">
          <span
            class="flex h-[18px] w-[18px] items-center justify-center rounded-md border-2"
            :class="draggingSub.done ? 'accent-bg accent-border' : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900'"
          >
            <svg
              v-if="draggingSub.done"
              class="h-3 w-3"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 8l2.5 2.5L12 5" />
            </svg>
          </span>
          <span
            class="truncate"
            :class="draggingSub.done ? 'text-slate-400 line-through dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'"
          >
            {{ draggingSub.title }}
          </span>
        </span>
      </article>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref } from "vue";

const props = defineProps({
  items: { type: Array, default: () => [] },
});

const emit = defineEmits(["add", "toggle", "update", "remove", "reorder"]);

const listRef = ref(null);
const editorRef = ref(null);
const editingId = ref(null);
const editingValue = ref("");
const draft = ref("");

const doneCount = computed(
  () => props.items.filter((s) => s.done).length,
);
const progressPct = computed(() =>
  props.items.length ? Math.round((doneCount.value / props.items.length) * 100) : 0,
);

/* ----------------------------------------------------------------- *
 *  Inline edit
 * ----------------------------------------------------------------- */

function startEdit(sub) {
  editingId.value = sub.id;
  editingValue.value = sub.title;
  nextTick(() => {
    const el = editorRef.value;
    const node = Array.isArray(el) ? el[0] : el;
    node?.focus?.();
    node?.select?.();
  });
}

function cancelEdit() {
  editingId.value = null;
  editingValue.value = "";
}

function commitEdit(sub) {
  if (editingId.value !== sub.id) return;
  const next = editingValue.value.trim();
  editingId.value = null;
  editingValue.value = "";
  if (!next || next === sub.title) return;
  emit("update", { id: sub.id, title: next });
}

function toggle(sub) {
  emit("toggle", { id: sub.id, done: !sub.done });
}

function remove(sub) {
  emit("remove", { id: sub.id });
}

function addNew() {
  const v = draft.value.trim();
  if (!v) return;
  emit("add", v);
  draft.value = "";
}

/* ----------------------------------------------------------------- *
 *  Pointer-based drag reorder
 *
 *  The moving row is hidden in place (opacity 0) and a clone of its
 *  visible state is teleported to <body> as a "ghost" that follows the
 *  pointer. This avoids the usual overflow / flow reshuffling issues.
 * ----------------------------------------------------------------- */

const draggingId = ref(null);
const dragOverId = ref(null);
const ghostOrigin = ref({ left: 0, top: 0, width: 0 });
const ghostOffset = ref({ x: 0, y: 0 });
let startY = 0;
let startX = 0;
let pointerSession = null;

const draggingSub = computed(() =>
  draggingId.value ? props.items.find((s) => s.id === draggingId.value) : null,
);

const ghostStyle = computed(() => {
  if (!draggingId.value) return null;
  const { left, top, width } = ghostOrigin.value;
  const { x, y } = ghostOffset.value;
  return {
    left: `${left + x}px`,
    top: `${top + y}px`,
    width: `${width}px`,
    transform: "rotate(-1.2deg)",
  };
});

function startDrag(e, id) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const row = e.currentTarget?.closest?.("[data-index]");
  if (!row) return;
  const rect = row.getBoundingClientRect();
  ghostOrigin.value = {
    left: rect.left,
    top: rect.top,
    width: rect.width,
  };
  ghostOffset.value = { x: 0, y: 0 };
  startX = e.clientX;
  startY = e.clientY;
  draggingId.value = id;
  dragOverId.value = id;
  pointerSession = { pointerId: e.pointerId };
  try {
    e.currentTarget.setPointerCapture(e.pointerId);
  } catch {
    /* ignore */
  }
  window.addEventListener("pointermove", onMove, { passive: false });
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);
}

function onMove(ev) {
  if (!pointerSession || ev.pointerId !== pointerSession.pointerId) return;
  ghostOffset.value = {
    x: ev.clientX - startX,
    y: ev.clientY - startY,
  };
  const row = document
    .elementsFromPoint(ev.clientX, ev.clientY)
    ?.find((el) => el?.hasAttribute?.("data-index") && listRef.value?.contains(el));
  if (row) {
    const hoveredIndex = Number(row.getAttribute("data-index"));
    const hoveredItem = props.items[hoveredIndex];
    if (hoveredItem) dragOverId.value = hoveredItem.id;
  }
  if (ev.pointerType === "touch") ev.preventDefault();
}

function onUp(ev) {
  if (!pointerSession || ev.pointerId !== pointerSession.pointerId) return;
  const fromIndex = props.items.findIndex((s) => s.id === draggingId.value);
  const toIndex = props.items.findIndex((s) => s.id === dragOverId.value);
  draggingId.value = null;
  dragOverId.value = null;
  pointerSession = null;
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onUp);
  if (
    fromIndex >= 0 &&
    toIndex >= 0 &&
    fromIndex !== toIndex
  ) {
    emit("reorder", { fromIndex, toIndex });
  }
}

onUnmounted(() => {
  window.removeEventListener("pointermove", onMove);
  window.removeEventListener("pointerup", onUp);
  window.removeEventListener("pointercancel", onUp);
});
</script>

<style scoped>
.subtask-row {
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.12s ease;
}
</style>
