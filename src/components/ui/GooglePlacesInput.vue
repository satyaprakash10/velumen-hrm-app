<template>
  <div class="relative w-full">
    <div class="relative">
      <input
        ref="inputRef"
        v-model="text"
        type="text"
        autocomplete="off"
        class="w-full"
        :class="inputFieldClass(invalid)"
        :placeholder="placeholder"
        @blur="onBlurSync"
      />
      <p v-if="hint" class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        {{ hint }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { inputFieldClass } from "@/utils/formFieldClasses.js";
import { loadGoogleMaps } from "@/composables/useGoogleMapsLoader.js";

const props = defineProps({
  modelValue: { type: String, default: "" },
  invalid: { type: Boolean, default: false },
  placeholder: { type: String, default: "Start typing an address or city…" },
});

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref(null);
const text = ref(props.modelValue || "");
let autocomplete = null;

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const hint = apiKey
  ? ""
  : "Add VITE_GOOGLE_MAPS_API_KEY to enable live Google place suggestions.";

watch(
  () => props.modelValue,
  (v) => {
    if (v !== text.value) text.value = v || "";
  },
);

function onBlurSync() {
  emit("update:modelValue", text.value.trim());
}

onMounted(async () => {
  if (!apiKey || !inputRef.value) return;
  try {
    await loadGoogleMaps(apiKey);
    const g = window.google;
    if (!g?.maps?.places) return;
    autocomplete = new g.maps.places.Autocomplete(inputRef.value, {
      fields: ["formatted_address", "geometry", "name"],
      types: ["geocode"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const addr = place?.formatted_address || place?.name || "";
      if (addr) {
        text.value = addr;
        emit("update:modelValue", addr);
      }
    });
  } catch {
    /* ignore — fallback to plain text */
  }
});

onBeforeUnmount(() => {
  autocomplete = null;
});
</script>
