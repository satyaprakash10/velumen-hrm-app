<template>
  <div ref="rootRef" class="min-w-0">
    <span id="ess-company-label" class="sr-only">Organization</span>
    <button
      type="button"
      ref="btnRef"
      class="flex w-full max-w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition-[border-color,box-shadow,transform] duration-200 hover:border-slate-300 hover:shadow-md focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-900 dark:hover:border-slate-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/25"
      :class="open ? 'border-sky-400 ring-2 ring-sky-500/15 dark:border-sky-500/60' : ''"
      :aria-expanded="open"
      aria-haspopup="listbox"
      aria-labelledby="ess-company-label"
      :title="triggerTitle"
      @click.stop="toggle"
    >
      <span class="min-w-0 flex-1">
        <span class="block truncate text-xs font-bold text-slate-900 dark:text-slate-100">{{ current?.shortName }}</span>
        <span class="block truncate text-[10px] text-slate-500 dark:text-slate-400">{{ current?.region }}</span>
      </span>
      <svg
        class="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 dark:text-slate-500"
        :class="open ? 'rotate-180' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-[0.98] -translate-y-1"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-[0.99] translate-y-0.5"
      >
        <div
          v-if="open"
          ref="popoverRef"
          :style="popoverStyle"
          class="flex max-h-[min(320px,60vh)] w-[var(--cs-w,min(100vw-2rem,18rem))] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1 shadow-2xl ring-1 ring-slate-900/[0.06] dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
          role="listbox"
          :aria-activedescendant="activeId"
        >
          <p class="border-b border-slate-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:text-slate-500">
            Switch organization
          </p>
          <ul class="max-h-56 overflow-y-auto p-1">
            <li v-for="c in companies" :key="c.id">
              <button
                type="button"
                role="option"
                :id="'co-opt-' + c.id"
                :aria-selected="c.id === currentId"
                :title="optionTooltip(c)"
                class="flex w-full items-start gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors duration-150"
                :class="
                  c.id === currentId
                    ? 'bg-sky-50 font-semibold text-sky-900 dark:bg-sky-950/60 dark:text-sky-100'
                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
                "
                @click="pick(c.id)"
              >
                <span
                  class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 [&>svg]:shrink-0"
                  :class="c.id === currentId ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300' : ''"
                  v-html="buildingIcon"
                />
                <span class="min-w-0 flex-1">
                  <span class="block font-medium leading-snug">{{ c.shortName }}</span>
                  <span class="mt-0.5 block text-xs font-normal text-slate-500 dark:text-slate-400">{{ c.region }}</span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from "vue";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import { useCompany } from "@/composables/useCompany.js";
import { menuIconHtml } from "@/utils/menuActionIcons.js";

const { companies, current, currentId, setCompany } = useCompany();

const buildingIcon = menuIconHtml("building");

const triggerTitle = computed(() => {
  const c = current.value;
  if (!c?.name) return "";
  return c.name;
});

function optionTooltip(c) {
  return `${c.name} — ${c.region}`;
}

const open = ref(false);
const rootRef = ref(null);
const btnRef = ref(null);
const popoverRef = ref(null);

const activeId = computed(() => {
  const c = companies.find((x) => x.id === currentId);
  return c ? `co-opt-${c.id}` : undefined;
});

const referenceEl = computed(() => btnRef.value);

const { floatingStyles, update } = useFloating(referenceEl, popoverRef, {
  open,
  placement: "bottom-start",
  strategy: "fixed",
  transform: false,
  middleware: [offset(10), flip(), shift({ padding: 16 })],
  whileElementsMounted: autoUpdate,
});

const Z_LIST = 12000;

const popoverStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: Z_LIST,
}));

function toggle() {
  open.value = !open.value;
}

function pick(id) {
  setCompany(id);
  open.value = false;
}

watch(open, (v) => {
  if (v) {
    nextTick(() => {
      update();
      const w = rootRef.value?.getBoundingClientRect().width;
      if (popoverRef.value && w) {
        const minW = Math.max(Math.round(w), 240);
        popoverRef.value.style.setProperty("--cs-w", `${minW}px`);
      }
    });
    queueMicrotask(() => document.addEventListener("pointerdown", onDoc, true));
  } else {
    document.removeEventListener("pointerdown", onDoc, true);
  }
});

function onDoc(e) {
  if (!open.value) return;
  const t = e.target;
  if (t instanceof Node) {
    if (rootRef.value?.contains(t) || popoverRef.value?.contains(t)) return;
  }
  open.value = false;
}

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDoc, true);
});
</script>
