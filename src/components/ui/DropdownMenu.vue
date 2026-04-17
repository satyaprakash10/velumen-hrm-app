<template>
  <div
    ref="wrapRef"
    class="relative flex shrink-0 items-center justify-end"
    data-dropdown-menu
    @click.stop
  >
    <button
      ref="btnRef"
      type="button"
      class="dropdown-trigger flex h-9 w-9 items-center justify-center rounded-lg border text-slate-600 shadow-sm transition-[color,background-color,border-color,transform] duration-200 hover:text-[#001738] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 active:scale-[0.97] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
      :class="open ? 'border-slate-300 bg-slate-100 dark:border-slate-500 dark:bg-slate-700' : 'border-slate-200 bg-white dark:border-slate-600'"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="ariaLabel"
      @click.stop="toggle"
    >
      <span class="pointer-events-none block h-4 w-4 text-current [&>svg]:h-full [&>svg]:w-full" v-html="dotsIcon" />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-100 ease-in"
        enter-from-class="opacity-0 scale-95 translate-y-0.5"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <ul
          v-if="open"
          ref="popoverRef"
          v-ess-scrollbar
          :style="popoverStyle"
          class="max-h-[min(480px,calc(100dvh-4rem))] min-w-[192px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
          role="menu"
          :aria-label="ariaLabel"
        >
          <li v-for="(item, i) in items" :key="i" role="none" :class="item.divider ? 'list-none py-1' : 'py-0.5'">
            <hr
              v-if="item.divider"
              class="my-0.5 border-t border-slate-200 dark:border-slate-600"
              role="separator"
            />
            <button
              v-else-if="item.action"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors duration-150"
              :class="
                item.danger
                  ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50'
                  : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
              "
              @click="onPick(item)"
            >
              <span
                v-if="iconHtml(item)"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 [&>svg]:shrink-0"
                :class="item.danger ? 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400' : ''"
                v-html="iconHtml(item)"
              />
              <span class="min-w-0 flex-1">{{ item.label }}</span>
            </button>
            <a
              v-else-if="item.href"
              :href="item.href"
              role="menuitem"
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              @click="close"
            >
              <span
                v-if="iconHtml(item)"
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 [&>svg]:shrink-0"
                v-html="iconHtml(item)"
              />
              <span class="min-w-0 flex-1">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import dotsIcon from "@/assets/icons/dots-vertical.svg?raw";
import { menuIconHtmlForItem } from "@/utils/menuActionIcons.js";

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  ariaLabel: { type: String, default: "Row actions" },
  placement: { type: String, default: "bottom-end" },
});

const emit = defineEmits(["action"]);

const open = ref(false);
const wrapRef = ref(null);
const btnRef = ref(null);
const popoverRef = ref(null);

const referenceEl = computed(() => btnRef.value);

const { floatingStyles, update } = useFloating(referenceEl, popoverRef, {
  open,
  placement: props.placement,
  strategy: "fixed",
  transform: false,
  middleware: [offset(6), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

/** Above ModalPanel (z-10200). */
const Z_MENU = 12000;

const popoverStyle = computed(() => ({
  ...floatingStyles.value,
  zIndex: Z_MENU,
}));

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function iconHtml(item) {
  return menuIconHtmlForItem(item);
}

function onPick(item) {
  if (typeof item.action === "function") item.action();
  emit("action", item);
  close();
}

function menuContains(el) {
  if (!(el instanceof Node)) return false;
  return Boolean(
    (wrapRef.value && wrapRef.value.contains(el)) ||
      (popoverRef.value && popoverRef.value.contains(el)),
  );
}

function onDocPointerDown(e) {
  if (!open.value) return;
  if (menuContains(e.target)) return;
  open.value = false;
}

function onDocKeydown(e) {
  if (e.key === "Escape") open.value = false;
}

watch(open, (v) => {
  if (v) {
    nextTick(() => update());
    queueMicrotask(() => {
      document.addEventListener("pointerdown", onDocPointerDown, true);
      document.addEventListener("keydown", onDocKeydown, true);
    });
  } else {
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onDocKeydown, true);
  }
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocPointerDown, true);
  document.removeEventListener("keydown", onDocKeydown, true);
});

defineExpose({ close, open: () => (open.value = true) });
</script>
