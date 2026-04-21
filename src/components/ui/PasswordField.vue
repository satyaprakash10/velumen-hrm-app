<template>
  <div class="relative">
    <input
      ref="inputRef"
      :value="modelValue"
      :type="visible ? 'text' : 'password'"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :placeholder="placeholder"
      :class="['auth-field pr-11', invalidClass]"
      @input="onInput"
      @blur="$emit('blur', $event)"
    />
    <button
      type="button"
      class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
      :aria-label="visible ? 'Hide password' : 'Show password'"
      :aria-pressed="visible"
      tabindex="-1"
      @click="toggle"
    >
      <svg
        v-if="visible"
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l18 18" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.58 10.58a3 3 0 104.24 4.24" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.88 5.09A10.94 10.94 0 0112 5c4.48 0 8.27 2.94 9.54 7a11.16 11.16 0 01-3.09 4.48M6.12 6.12A11.2 11.2 0 002.46 12a11 11 0 0014.42 6.12" />
      </svg>
      <svg
        v-else
        class="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.46 12C3.73 7.94 7.52 5 12 5s8.27 2.94 9.54 7c-1.27 4.06-5.06 7-9.54 7s-8.27-2.94-9.54-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  autocomplete: { type: String, default: "current-password" },
  maxlength: { type: [String, Number], default: 128 },
  invalid: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "blur"]);

const inputRef = ref(null);
const visible = ref(false);

const invalidClass = computed(() =>
  props.invalid ? "border-red-500/60 ring-1 ring-red-500/30" : "",
);

function onInput(e) {
  emit("update:modelValue", e.target?.value ?? "");
}

function toggle() {
  visible.value = !visible.value;
  // Return focus to the input after toggling so the caret stays put.
  requestAnimationFrame(() => inputRef.value?.focus({ preventScroll: true }));
}
</script>

<style scoped>
/*
 * Stand-alone so the component works on any background. Matches the auth
 * shell input styling the Login / Register pages were already using.
 */
.auth-field {
  width: 100%;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(2, 6, 23, 0.8);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #fff;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}
.auth-field::placeholder {
  color: rgba(100, 116, 139, 0.9);
}
.auth-field:focus {
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}
</style>
