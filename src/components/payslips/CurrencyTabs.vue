<template>
  <div
    class="payslip-scroll-x flex h-12 min-w-0 items-stretch gap-2 rounded-t-xl px-2 sm:gap-3 sm:px-3"
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
      class="flex min-h-0 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm uppercase tracking-wide transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#001738]"
      :class="[
        tab.code === modelValue
          ? 'cursor-pointer bg-[#FF6600] font-bold text-white shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]'
          : tab.count > 0
            ? 'cursor-pointer bg-transparent font-medium text-white/90 hover:bg-white/10 active:scale-[0.98]'
            : 'cursor-pointer bg-transparent font-medium text-white/40 hover:bg-white/5 active:scale-[0.98]',
      ]"
      @click="$emit('update:modelValue', tab.code)"
    >
      <span
        class="inline-flex h-6 w-6 items-center justify-center rounded-md text-[13px] font-bold leading-none"
        :class="
          tab.code === modelValue
            ? 'bg-white/20 text-white ring-1 ring-white/30'
            : 'bg-white/[0.06] text-white/80 ring-1 ring-white/10'
        "
        aria-hidden="true"
      >
        {{ symbolFor(tab.code) }}
      </span>
      <span class="flex items-baseline gap-1">
        <span>{{ tab.code }}</span>
        <span
          class="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          :class="
            tab.code === modelValue
              ? 'bg-white/20 text-white'
              : tab.count > 0
                ? 'bg-white/10 text-white/90'
                : 'bg-white/5 text-white/50'
          "
        >
          {{ tab.count }}
        </span>
      </span>
    </button>
  </div>
</template>

<script setup>
import { currencySymbol } from "@/utils/currency.js";

defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    required: true,
  },
});

defineEmits(["update:modelValue"]);

function symbolFor(code) {
  return currencySymbol(code);
}
</script>
