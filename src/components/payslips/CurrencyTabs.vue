<template>
  <div
    class="payslip-scroll-x flex h-12 min-w-0 items-stretch gap-3 rounded-t-xl px-2 sm:gap-6 sm:px-3"
    style="background: var(--theme-nav-header-bg, #001738)"
    role="tablist"
    aria-label="Currency"
  >
    <button
      v-for="tab in tabs"
      :key="tab.code"
      role="tab"
      type="button"
      :aria-selected="tab.code === modelValue"
      class="flex min-h-0 shrink-0 items-center justify-center px-5 text-sm uppercase tracking-wide transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001738]"
      :class="
        tab.code === modelValue
          ? 'cursor-pointer bg-[#FF6600] font-bold text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)] ring-2 ring-white/25'
          : 'cursor-pointer bg-transparent font-medium text-white hover:bg-white/10 active:scale-[0.98]'
      "
      @click="$emit('update:modelValue', tab.code)"
    >
      {{ tabLabel(tab) }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
})

defineEmits(['update:modelValue'])

function tabLabel(tab) {
  return `${tab.code} (${tab.count})`
}
</script>
