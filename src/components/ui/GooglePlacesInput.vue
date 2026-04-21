<template>
  <div ref="rootRef" class="relative w-full">
    <div class="relative">
      <span
        class="pointer-events-none absolute left-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-slate-400 dark:text-slate-500"
        aria-hidden="true"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 9c0 6-7.5 12-7.5 12S4.5 15 4.5 9a7.5 7.5 0 0115 0z" />
        </svg>
      </span>
      <input
        ref="inputRef"
        v-model="text"
        type="text"
        autocomplete="off"
        class="w-full pl-10 pr-9"
        :class="inputFieldClass(invalid)"
        :placeholder="placeholder"
        :aria-expanded="dropdownOpen"
        aria-haspopup="listbox"
        role="combobox"
        @input="onInput"
        @focus="onFocus"
        @keydown.down.prevent="moveHighlight(1)"
        @keydown.up.prevent="moveHighlight(-1)"
        @keydown.enter.prevent="commitHighlight"
        @keydown.esc="close"
        @blur="onBlur"
      />
      <span
        v-if="fetching"
        class="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-slate-400"
        aria-hidden="true"
      >
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25" />
          <path stroke-linecap="round" stroke="currentColor" stroke-width="2" d="M21 12a9 9 0 00-9-9" />
        </svg>
      </span>
      <button
        v-else-if="text"
        type="button"
        class="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label="Clear location"
        @mousedown.prevent="clear"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <transition
      enter-active-class="transition duration-150 ease-out"
      leave-active-class="transition duration-100 ease-in"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <ul
        v-if="dropdownOpen && !usesLiveApi"
        role="listbox"
        class="scrollbar-kit absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-[0_18px_40px_rgba(15,23,42,0.12)] ring-1 ring-black/[0.03] dark:border-slate-700 dark:bg-slate-900 dark:ring-white/10"
      >
        <li v-if="!filtered.length" class="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">
          Use this as a free-form location, or keep typing for more suggestions.
        </li>
        <li
          v-for="(option, i) in filtered"
          :key="option"
          role="option"
          :aria-selected="i === highlight"
          class="flex cursor-pointer items-center gap-2.5 px-4 py-2 text-[13px] transition-colors"
          :class="
            i === highlight
              ? 'bg-sky-50 text-slate-900 dark:bg-sky-950/40 dark:text-white'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800'
          "
          @mousedown.prevent="choose(option)"
          @mouseenter="highlight = i"
        >
          <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400" aria-hidden="true">
            <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 8.5a1.6 1.6 0 100-3.2 1.6 1.6 0 000 3.2z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12.8 6.8C12.8 10.5 8 14.5 8 14.5S3.2 10.5 3.2 6.8a4.8 4.8 0 019.6 0z" />
            </svg>
          </span>
          <span class="truncate" v-html="highlightMatch(option, query)" />
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { inputFieldClass } from "@/utils/formFieldClasses.js";
import { loadGoogleMaps } from "@/composables/useGoogleMapsLoader.js";
import locationSeed from "@/data/locationSeed.json";

const props = defineProps({
  modelValue: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  placeholder: { type: String, default: "Start typing a city or country…" },
});

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref(null);
const rootRef = ref(null);
const text = ref(props.modelValue || "");
const query = ref("");
const highlight = ref(-1);
const focused = ref(false);
const fetching = ref(false);
let liveAutocomplete = null;
let blurTimer = null;
let fetchingTimer = null;

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const usesLiveApi = ref(false);

watch(
  () => props.modelValue,
  (v) => {
    if (v !== text.value) text.value = v || "";
  },
);

watch(text, (v) => {
  query.value = v || "";
});

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return locationSeed.slice(0, 10);
  return locationSeed
    .filter((loc) => loc.toLowerCase().includes(q))
    .slice(0, 10);
});

const dropdownOpen = computed(() => focused.value && !usesLiveApi.value);

function onInput(e) {
  const v = e?.target?.value ?? text.value;
  text.value = v;
  emit("update:modelValue", v);
  highlight.value = filtered.value.length ? 0 : -1;
  // Brief "fetching" pulse so the UI conveys that suggestions are being
  // looked up — matches what real async place APIs would show.
  fetching.value = true;
  if (fetchingTimer) window.clearTimeout(fetchingTimer);
  fetchingTimer = window.setTimeout(() => {
    fetching.value = false;
  }, 220);
}

function onFocus() {
  focused.value = true;
}

function onBlur() {
  if (blurTimer) window.clearTimeout(blurTimer);
  blurTimer = window.setTimeout(() => {
    focused.value = false;
    emit("update:modelValue", text.value.trim());
  }, 120);
}

function close() {
  focused.value = false;
}

function clear() {
  text.value = "";
  emit("update:modelValue", "");
  highlight.value = -1;
  inputRef.value?.focus();
}

function moveHighlight(delta) {
  if (!filtered.value.length) return;
  const next = (highlight.value + delta + filtered.value.length) % filtered.value.length;
  highlight.value = next;
}

function commitHighlight() {
  if (highlight.value < 0) {
    emit("update:modelValue", text.value.trim());
    close();
    return;
  }
  const option = filtered.value[highlight.value];
  if (option) choose(option);
}

function choose(option) {
  text.value = option;
  emit("update:modelValue", option);
  close();
}

/**
 * Escape HTML and highlight the matched substring. Kept local so we don't
 * need a sanitizer — only a plain text option with a single emphasised
 * substring ever makes it into innerHTML.
 */
function highlightMatch(option, q) {
  const safe = String(option).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const trimmed = (q || "").trim();
  if (!trimmed) return safe;
  const idx = safe.toLowerCase().indexOf(trimmed.toLowerCase());
  if (idx < 0) return safe;
  const before = safe.slice(0, idx);
  const match = safe.slice(idx, idx + trimmed.length);
  const after = safe.slice(idx + trimmed.length);
  return `${before}<mark class="bg-transparent font-semibold text-sky-700 dark:text-sky-300">${match}</mark>${after}`;
}

function handleDocClick(e) {
  if (!focused.value) return;
  if (!rootRef.value) return;
  if (rootRef.value.contains(e.target)) return;
  focused.value = false;
}

onMounted(async () => {
  document.addEventListener("mousedown", handleDocClick);
  if (!apiKey || !inputRef.value) return;
  try {
    await loadGoogleMaps(apiKey);
    const g = window.google;
    if (!g?.maps?.places) return;
    usesLiveApi.value = true;
    liveAutocomplete = new g.maps.places.Autocomplete(inputRef.value, {
      fields: ["formatted_address", "geometry", "name"],
      types: ["geocode"],
    });
    liveAutocomplete.addListener("place_changed", () => {
      const place = liveAutocomplete.getPlace();
      const addr = place?.formatted_address || place?.name || "";
      if (addr) {
        text.value = addr;
        emit("update:modelValue", addr);
      }
    });
  } catch {
    /* fall back to the built-in demo list */
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleDocClick);
  if (blurTimer) window.clearTimeout(blurTimer);
  if (fetchingTimer) window.clearTimeout(fetchingTimer);
  liveAutocomplete = null;
});
</script>
