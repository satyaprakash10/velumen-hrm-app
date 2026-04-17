<template>
  <div ref="rootRef" class="relative">
    <span v-if="label" class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{{ label }}</span>

    <!-- Selected tags (removable) -->
    <div v-if="(modelValue || []).length" class="mb-2 flex flex-wrap gap-1.5">
      <span
        v-for="tag in modelValue"
        :key="tag"
        class="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 pl-2.5 pr-1 py-0.5 text-xs font-medium text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100"
      >
        {{ tag }}
        <button
          type="button"
          class="rounded-full p-0.5 text-sky-700 transition hover:bg-sky-200/80 dark:text-sky-200 dark:hover:bg-sky-800"
          :aria-label="`Remove ${tag}`"
          @click="removeTag(tag)"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </span>
    </div>

    <!-- Combobox: type to filter suggestions; Enter adds tag -->
    <div
      class="rounded-xl border px-2 py-1.5 transition"
      :class="
        invalid
          ? 'border-2 border-red-500 dark:border-red-500'
          : 'border-slate-200 bg-white dark:border-slate-600 dark:bg-slate-950'
      "
    >
      <div class="flex gap-2">
        <input
          ref="inputRef"
          v-model="input"
          type="text"
          role="combobox"
          :aria-expanded="listOpen"
          :aria-controls="listId"
          autocomplete="off"
          class="min-w-0 flex-1 border-0 bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          :placeholder="placeholder"
          @focus="listOpen = true"
          @keydown.enter.prevent="commitInput"
          @keydown.escape="closeList"
        />
        <button
          v-if="canAddFromInput"
          type="button"
          class="shrink-0 self-center rounded-lg bg-sky-600 px-2 py-1 text-xs font-semibold text-white hover:bg-sky-500 dark:bg-sky-500"
          @click="commitInput"
        >
          Add
        </button>
      </div>
      <Transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-100 ease-in"
        enter-from-class="opacity-0 -translate-y-0.5"
        enter-to-class="opacity-100 translate-y-0"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ul
          v-if="listOpen && (filteredPickList.length || canAddFromInput)"
          :id="listId"
          v-ess-scrollbar
          class="mt-1 max-h-40 overflow-y-auto rounded-lg border border-slate-100 bg-slate-50/90 py-1 dark:border-slate-700 dark:bg-slate-900/95"
          role="listbox"
        >
          <li v-for="opt in filteredPickList" :key="opt">
            <button
              type="button"
              class="flex w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-white dark:text-slate-100 dark:hover:bg-slate-800"
              role="option"
              @mousedown.prevent
              @click="addTag(opt)"
            >
              {{ opt }}
            </button>
          </li>
          <li v-if="canAddFromInput && inputTrim">
            <button
              type="button"
              class="flex w-full items-center gap-2 border-t border-slate-200 px-3 py-2 text-left text-sm font-semibold text-sky-700 dark:border-slate-700 dark:text-sky-300"
              @mousedown.prevent
              @click="commitInput"
            >
              <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add “{{ inputTrim }}”
            </button>
          </li>
        </ul>
      </Transition>
    </div>
    <p v-if="hint" class="mt-1 text-xs text-slate-500 dark:text-slate-400">{{ hint }}</p>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, useId } from "vue";
import seedTags from "@/data/taskTags.json";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  /** Extra tag strings merged into suggestions (e.g. tags used elsewhere in the app). */
  suggestedTags: { type: Array, default: () => [] },
  label: { type: String, default: "Tags" },
  invalid: { type: Boolean, default: false },
  hint: { type: String, default: "Type to search, Enter to add. Optional." },
  placeholder: { type: String, default: "Search or add tag…" },
});

const emit = defineEmits(["update:modelValue"]);

const rootRef = ref(null);
const inputRef = ref(null);
const input = ref("");
const listOpen = ref(false);
const listId = useId();

const selectedSet = computed(() => new Set(props.modelValue || []));

/** Pool: seed file + parent suggestions + current selection + session-only additions */
const sessionExtras = ref([]);

const tagPool = computed(() => {
  const set = new Set();
  for (const x of seedTags) if (x) set.add(String(x).trim());
  for (const x of props.suggestedTags || []) if (x) set.add(String(x).trim());
  for (const x of props.modelValue || []) if (x) set.add(String(x).trim());
  for (const x of sessionExtras.value) if (x) set.add(String(x).trim());
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
});

const inputTrim = computed(() => input.value.trim());

const filteredPickList = computed(() => {
  const q = inputTrim.value.toLowerCase();
  let list = tagPool.value.filter((t) => !selectedSet.value.has(t));
  if (q) list = list.filter((t) => t.toLowerCase().includes(q));
  return list.slice(0, 14);
});

const canAddFromInput = computed(() => {
  const t = inputTrim.value;
  if (t.length < 2) return false;
  if (selectedSet.value.has(t)) return false;
  return true;
});

watch(input, () => {
  listOpen.value = true;
});

function addTag(raw) {
  const t = String(raw || "").trim();
  if (t.length < 2) return;
  if (selectedSet.value.has(t)) return;
  emit("update:modelValue", [...(props.modelValue || []), t]);
  if (!seedTags.includes(t) && !(props.suggestedTags || []).includes(t)) {
    sessionExtras.value = [...sessionExtras.value, t];
  }
  input.value = "";
}

function commitInput() {
  if (canAddFromInput.value) addTag(inputTrim.value);
}

function removeTag(tag) {
  emit(
    "update:modelValue",
    (props.modelValue || []).filter((x) => x !== tag),
  );
}

function closeList() {
  listOpen.value = false;
}

function onDoc(e) {
  const t = e.target;
  if (t instanceof Node && rootRef.value?.contains(t)) return;
  listOpen.value = false;
}

onMounted(() => document.addEventListener("pointerdown", onDoc, true));
onUnmounted(() => document.removeEventListener("pointerdown", onDoc, true));
</script>
