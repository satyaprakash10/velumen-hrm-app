<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition duration-200 ease-out focus:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-ring)] disabled:cursor-not-allowed disabled:opacity-60"
    :class="
      modelValue
        ? 'accent-gradient border-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
        : 'border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700'
    "
    :disabled="disabled"
    @click="toggle"
  >
    <span
      class="inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-out"
      :class="modelValue ? 'translate-x-[1.375rem]' : 'translate-x-0.5'"
    />
  </button>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, required: true },
  ariaLabel: { type: String, default: "Toggle" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

function toggle() {
  if (props.disabled) return;
  emit("update:modelValue", !props.modelValue);
}
</script>
