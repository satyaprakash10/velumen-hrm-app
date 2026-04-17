<template>
  <div ref="rootRef" class="relative">
    <span v-if="label" class="mb-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ label }}</span>
    <div class="flex gap-2">
      <div class="relative min-w-0 flex-1">
        <input
          ref="inputRef"
          v-model="input"
          type="text"
          role="combobox"
          :aria-expanded="open"
          :aria-controls="listId"
          :aria-activedescendant="activeId"
          autocomplete="off"
          :class="inputClassResolved"
          :placeholder="placeholder"
          @focus="open = true"
          @input="onInput"
          @keydown.down.prevent="moveActive(1)"
          @keydown.up.prevent="moveActive(-1)"
          @keydown.enter.prevent="onEnter"
          @keydown.escape="close"
        />
        <Transition
          enter-active-class="transition duration-150 ease-out"
          leave-active-class="transition duration-100 ease-in"
          enter-from-class="opacity-0 scale-[0.99] -translate-y-0.5"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ul
            v-if="open && (filtered.length || canAddCurrent)"
            :id="listId"
            v-ess-scrollbar
            class="absolute z-[300] mt-1 max-h-52 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl ring-1 ring-slate-900/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
            role="listbox"
          >
            <li v-for="(name, i) in filtered" :key="name">
              <button
                :id="optId(i)"
                type="button"
                role="option"
                :aria-selected="i === activeIdx"
                class="flex w-full px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-800"
                :class="i === activeIdx ? 'bg-sky-50 dark:bg-sky-950/50' : ''"
                @mousedown.prevent
                @click="pick(name)"
              >
                {{ name }}
              </button>
            </li>
            <li v-if="canAddCurrent">
              <button
                type="button"
                class="flex w-full items-center gap-2 border-t border-slate-100 px-3 py-2 text-left text-sm font-semibold text-sky-700 dark:border-slate-700 dark:text-sky-300"
                @mousedown.prevent
                @click="addCurrent"
              >
                <span class="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-200">
                  <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </span>
                Add “{{ inputTrim }}”
              </button>
            </li>
          </ul>
        </Transition>
      </div>
      <button
        v-if="canAddCurrent"
        type="button"
        class="shrink-0 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-800 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-200 dark:hover:bg-sky-900/40"
        @click="addCurrent"
      >
        Add
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, useId } from "vue";
import { useProjects } from "@/composables/useProjects.js";
import { inputFieldClass } from "@/utils/formFieldClasses.js";

const props = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
  placeholder: { type: String, default: "Search or type a project…" },
  invalid: { type: Boolean, default: false },
  inputClass: {
    type: String,
    default: "",
  },
  extraNames: { type: Array, default: () => [] },
});

const defaultInputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100";

const inputClassResolved = computed(() => {
  if (props.invalid) return inputFieldClass(true);
  return props.inputClass || defaultInputClass;
});

const emit = defineEmits(["update:modelValue"]);

const { projectNames, ensureNameExists } = useProjects();

const rootRef = ref(null);
const inputRef = ref(null);
const open = ref(false);
const input = ref(props.modelValue);
const activeIdx = ref(0);

const listId = useId();
const baseId = useId();

watch(
  () => props.modelValue,
  (v) => {
    if (v !== input.value) input.value = v ?? "";
  },
);

function onInput(e) {
  const v = e?.target?.value ?? "";
  emit("update:modelValue", v);
}

const inputTrim = computed(() => input.value.trim());

const mergedNames = computed(() => {
  const set = new Set(projectNames.value.map((n) => n.toLowerCase()));
  const out = [...projectNames.value];
  for (const x of props.extraNames) {
    const s = String(x || "").trim();
    if (!s) continue;
    const k = s.toLowerCase();
    if (!set.has(k)) {
      set.add(k);
      out.push(s);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
});

const filtered = computed(() => {
  const q = inputTrim.value.toLowerCase();
  if (!q) return mergedNames.value.slice(0, 12);
  return mergedNames.value.filter((n) => n.toLowerCase().includes(q)).slice(0, 12);
});

const canAddCurrent = computed(() => {
  const t = inputTrim.value;
  if (t.length < 2) return false;
  return !mergedNames.value.some((n) => n.toLowerCase() === t.toLowerCase());
});

watch([filtered, open], () => {
  activeIdx.value = 0;
});

function optId(i) {
  return `${baseId}-opt-${i}`;
}

const activeId = computed(() => {
  if (!open.value || !filtered.value.length) return undefined;
  const i = Math.min(activeIdx.value, filtered.value.length - 1);
  return optId(Math.max(0, i));
});

function moveActive(delta) {
  if (!open.value) {
    open.value = true;
    return;
  }
  const n = filtered.value.length;
  if (!n) return;
  activeIdx.value = (activeIdx.value + delta + n) % n;
}

function pick(name) {
  input.value = name;
  emit("update:modelValue", name);
  close();
}

function addCurrent() {
  const t = inputTrim.value;
  if (t.length < 2) return;
  ensureNameExists(t);
  input.value = t;
  emit("update:modelValue", t);
  close();
}

function onEnter() {
  if (open.value && filtered.value.length) {
    const i = Math.min(activeIdx.value, filtered.value.length - 1);
    pick(filtered.value[Math.max(0, i)]);
    return;
  }
  if (canAddCurrent.value) {
    addCurrent();
    return;
  }
  if (inputTrim.value.length >= 2) {
    pick(inputTrim.value);
  }
}

function close() {
  open.value = false;
}

function onDoc(e) {
  const t = e.target;
  if (t instanceof Node && rootRef.value?.contains(t)) return;
  close();
}

onMounted(() => {
  document.addEventListener("pointerdown", onDoc, true);
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDoc, true);
});
</script>
