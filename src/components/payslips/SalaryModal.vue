<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex p-3 transition-opacity duration-300 ease-out bg-black/45 sm:p-5 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="salary-modal-title"
        @click.self="emit('close')"
      >
        <transition
          enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-[0.96] translate-y-3"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="opacity-0 scale-[0.98] translate-y-2"
        >
          <div
            v-if="visible"
            ref="panelRef"
            class="salary-evolution-modal flex min-h-0 w-full max-w-none flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(26,51,91,0.2)] ring-1 ring-black/[0.06]"
            @keydown="onPanelKeydown"
          >
            <header
              class="flex items-start justify-between gap-4 px-6 py-5 border-b shrink-0 border-subtle-02 sm:items-center sm:px-8 sm:py-6"
            >
              <div
                class="flex flex-col flex-1 min-w-0 gap-4 sm:flex-row sm:items-center sm:gap-5"
              >
                <p
                  class="shrink-0 text-xs font-normal leading-none text-[#6B7280]"
                >
                  {{ employerName }}
                </p>
                <span
                  class="hidden h-6 w-px shrink-0 bg-[#E5E7EB] sm:block"
                  aria-hidden="true"
                />
                <div class="min-w-0">
                  <h2
                    id="salary-modal-title"
                    class="text-lg font-bold leading-tight tracking-tight text-[#1A335B] sm:text-xl"
                  >
                    Gross/Net Salary Evolution
                  </h2>
                  <p
                    class="mt-1 text-sm font-normal leading-snug text-[#6B7280]"
                  >
                    TF2019 - Ted Ferguson
                  </p>
                </div>
              </div>
              <button
                type="button"
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1e3a61] text-white shadow-sm transition hover:bg-[#172e4f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a61]/45 focus-visible:ring-offset-2"
                aria-label="Close"
                @click="emit('close')"
              >
                <span
                  class="inline-flex h-5 w-5 items-center justify-center [&>svg]:block [&>svg]:h-full [&>svg]:w-full [&_path]:fill-current"
                  v-html="closeIcon"
                />
              </button>
            </header>

            <div
              class="flex flex-col flex-1 min-h-0 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
            >
              <div
                class="flex min-h-[min(320px,calc(100vh-14rem))] w-full flex-1 flex-col rounded-2xl border-2 border-dashed border-subtle-02 bg-white px-4 py-8 sm:px-8 sm:py-10"
              >
                <div
                  v-if="chartBars.length"
                  class="flex h-[220px] w-full flex-1 items-end gap-1.5 sm:gap-2"
                  role="img"
                  :aria-label="`Net salary by month in ${currency}`"
                >
                  <div
                    v-for="(b, i) in chartBars"
                    :key="i"
                    class="flex flex-col items-center justify-end flex-1 min-w-0 min-h-0 gap-2"
                  >
                    <span
                      class="text-[10px] font-medium tabular-nums text-navy/80 sm:text-xs"
                    >
                      {{ formatMoneyShort(b.net) }}
                    </span>
                    <div
                      class="w-full max-w-[48px] rounded-t-md bg-gradient-to-t from-[#001738] to-[#1e3a61] transition-all"
                      :style="{
                        height: `${8 + Math.round((b.pct / 100) * 140)}px`,
                      }"
                    />
                    <span class="text-[10px] text-gray-500">{{ b.label }}</span>
                  </div>
                </div>
                <div
                  v-else
                  class="flex justify-center flex-1 w-full salary-evolution-art"
                  aria-hidden="true"
                  v-html="artIllustration"
                />
                <p
                  class="mt-6 text-center text-sm font-normal leading-relaxed text-[#6B7280]"
                >
                  {{
                    chartBars.length
                      ? "Net pay trend for the selected currency (most recent periods)."
                      : "No payslip data in this currency yet."
                  }}
                </p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";
import closeIcon from "@/assets/icons/close.svg?raw";
import artIllustration from "@/assets/illustrations/salary-evolution-art.svg?raw";
import { BRAND } from "@/config/brand.js";

const employerName = BRAND.documentEmployerName;

const props = defineProps({
  visible: { type: Boolean, default: false },
  payslips: { type: Array, default: () => [] },
  currency: { type: String, default: "USD" },
});

const emit = defineEmits(["close"]);

const panelRef = ref(null);

const chartBars = computed(() => {
  const list = [...props.payslips]
    .filter((p) => p.currency === props.currency)
    .sort((a, b) => new Date(a.payrollDate) - new Date(b.payrollDate))
    .slice(-12);
  if (!list.length) return [];
  const max = Math.max(...list.map((p) => p.netPay), 1);
  return list.map((p) => ({
    label: new Date(p.payrollDate).toLocaleDateString(undefined, {
      month: "short",
    }),
    net: p.netPay,
    pct: Math.round((p.netPay / max) * 100),
  }));
});

function formatMoneyShort(n) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function getFocusableElements(root) {
  if (!root) return [];
  return [...root.querySelectorAll(FOCUSABLE)].filter(
    (el) => !el.hasAttribute("disabled"),
  );
}

function onDocumentKeydown(e) {
  if (e.key === "Escape" && props.visible) emit("close");
}

function onPanelKeydown(e) {
  if (e.key !== "Tab" || !panelRef.value) return;
  const nodes = getFocusableElements(panelRef.value);
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else if (document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

watch(
  () => props.visible,
  async (v) => {
    document.body.style.overflow = v ? "hidden" : "";
    if (v) {
      await nextTick();
      const closeBtn = panelRef.value?.querySelector(
        'button[aria-label="Close"]',
      );
      closeBtn?.focus();
    }
  },
);

onMounted(() => document.addEventListener("keydown", onDocumentKeydown));
onUnmounted(() => document.removeEventListener("keydown", onDocumentKeydown));
</script>

<style scoped>
.salary-evolution-art :deep(svg) {
  display: block;
  width: 100%;
  max-width: 200px;
  height: auto;
}
</style>
