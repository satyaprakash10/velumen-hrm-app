<template>
  <div class="border-b border-subtle-02 last:border-b-0">
    <div
      class="relative hidden min-w-[968px] cursor-pointer bg-white transition-colors dark:bg-slate-900 md:grid md:grid-cols-[28px_minmax(120px,1.1fr)_minmax(200px,2.2fr)_minmax(112px,1fr)_minmax(104px,1fr)_minmax(88px,0.85fr)_52px] md:items-stretch md:gap-x-3 md:pl-0 md:pr-6"
      :class="expanded ? 'border-l border-t border-r border-black' : ''"
      role="row"
      tabindex="0"
      :aria-expanded="expanded"
      @click="onRowSurfaceClick"
      @keydown.enter.prevent="$emit('toggle')"
      @keydown.space.prevent="$emit('toggle')"
    >
      <div
        role="cell"
        class="pointer-events-none flex items-center justify-center self-stretch bg-[#F4F7F9] dark:bg-slate-800/80"
      >
        <span class="text-navy/70 dark:text-slate-300">
          <span
            class="block h-4 w-4 transition-transform duration-300 ease-in-out [&>svg]:h-full [&>svg]:w-full"
            :class="expanded ? '-rotate-180' : ''"
            v-html="chevronDownIcon"
          />
        </span>
      </div>
      <span
        role="cell"
        class="text-sm leading-tight pointer-events-none text-accent-orange md:flex md:items-center md:self-stretch md:py-3"
      >
        <span class="font-normal">{{ periodMonth }}</span>
        <span class="font-semibold"> {{ periodYear }}</span>
      </span>
      <a
        v-if="payslip.pdfAvailable !== false"
        role="cell"
        :href="pdfUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="min-w-0 text-sm font-medium leading-snug no-underline truncate text-navy hover:underline md:flex md:items-center md:self-stretch md:py-3"
        @click.stop
      >
        {{ payslip.fileAttachment.file.label }}
      </a>
      <span
        v-else
        role="cell"
        class="min-w-0 text-sm font-medium leading-snug text-gray-500 md:flex md:items-center md:self-stretch md:py-3"
        :title="pdfUnavailableTitle"
      >
        {{ payslip.fileAttachment.file.label }}
        <span class="mt-0.5 block text-xs font-normal text-gray-400"
          >(PDF unavailable)</span
        >
      </span>
      <span
        role="cell"
        class="text-sm text-gray-700 pointer-events-none tabular-nums md:flex md:items-center md:self-stretch md:py-3"
        >{{ payslip.issueDateLabel }}</span
      >
      <div
        role="cell"
        class="flex justify-end pointer-events-none md:items-center md:self-stretch md:py-3"
      >
        <span
          class="inline-flex min-w-[5.5rem] justify-end rounded-md bg-[#CFE7D4] px-2.5 py-1 text-xs font-bold tabular-nums text-net-text"
        >
          {{ formatMoney(payslip.netPay, payslip.currency) }}
        </span>
      </div>
      <div
        role="cell"
        class="pointer-events-none md:flex md:items-center md:self-stretch md:py-3"
      >
        <span
          class="inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          :class="statusBadgeClass(payslip.status)"
        >
          {{ payslip.status }}
        </span>
      </div>
      <div
        ref="menuWrap"
        role="cell"
        class="relative z-20 flex items-center justify-end md:self-stretch md:py-3"
        data-payslip-menu
        @click.stop
      >
        <button
          ref="menuButtonDesktop"
          type="button"
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-[color,background-color,border-color] duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-[#001738] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          aria-label="Payslip actions"
          @click.stop="toggleMenu('desktop')"
        >
          <span
            class="block h-4 w-4 text-current [&>svg]:h-full [&>svg]:w-full"
            v-html="dotsIcon"
          />
        </button>
      </div>
    </div>

    <div class="relative bg-white dark:bg-slate-900 md:hidden">
      <div
        class="flex items-stretch transition-colors cursor-pointer"
        :class="expanded ? 'border-l border-t border-r border-black' : ''"
        role="row"
        tabindex="0"
        :aria-expanded="expanded"
        @click="onMobileRowClick"
        @keydown.enter.prevent="$emit('toggle')"
        @keydown.space.prevent="$emit('toggle')"
      >
        <div
          class="flex w-8 shrink-0 flex-col items-center justify-center self-stretch bg-[#F4F7F9] dark:bg-slate-800/80"
        >
          <span class="text-navy/70 dark:text-slate-300">
            <span
              class="block h-4 w-4 transition-transform duration-300 ease-in-out [&>svg]:h-full [&>svg]:w-full"
              :class="expanded ? 'rotate-180' : ''"
              v-html="chevronDownIcon"
            />
          </span>
        </div>
        <div class="min-w-0 flex-1 space-y-1.5 py-2.5 pl-3 pr-2">
          <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span class="text-sm leading-tight text-accent-orange">
              <span class="font-normal">{{ periodMonth }}</span>
              <span class="font-semibold"> {{ periodYear }}</span>
            </span>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              :class="statusBadgeClass(payslip.status)"
            >
              {{ payslip.status }}
            </span>
          </div>
          <div class="payslip-slip-name-scroll touch-pan-x">
            <span
              class="inline-block text-xs font-medium leading-snug whitespace-nowrap text-navy sm:text-sm"
            >
              {{ payslip.fileAttachment.file.label }}
            </span>
          </div>
          <p class="text-[11px] text-gray-500">
            Issued {{ payslip.issueDateLabel }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              class="rounded-md bg-[#CFE7D4] px-2.5 py-1 text-xs font-bold tabular-nums text-net-text"
            >
              {{ formatMoney(payslip.netPay, payslip.currency) }}
            </span>
          </div>
        </div>
        <div
          ref="menuWrapMobile"
          class="relative z-20 flex shrink-0 items-start py-2.5 pr-3"
          data-payslip-menu
          @click.stop
        >
          <button
            ref="menuButtonMobile"
            type="button"
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-[color,background-color,border-color] duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-[#001738] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-white"
            :aria-expanded="menuOpen"
            aria-haspopup="true"
            aria-label="Payslip actions"
            @click.stop="toggleMenu('mobile')"
          >
            <span
              class="block h-4 w-4 text-current [&>svg]:h-full [&>svg]:w-full"
              v-html="dotsIcon"
            />
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-100 ease-in"
        enter-from-class="scale-95 opacity-0"
        enter-to-class="scale-100 opacity-100"
        leave-from-class="scale-100 opacity-100"
        leave-to-class="scale-95 opacity-0"
      >
        <ul
          v-if="menuOpen"
          ref="menuPopover"
          :style="floatingStyles"
          class="payslip-actions-menu z-[10000] min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-600 dark:bg-slate-900 dark:ring-white/10"
          role="menu"
          aria-label="Payslip actions"
        >
          <li role="none" class="py-0.5">
            <button
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              role="menuitem"
              @click="onMenuDelete"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 [&>svg]:shrink-0"
                v-html="menuIconHtmlForItem({ label: 'Delete', danger: true })"
              />
              Delete
            </button>
          </li>
          <li role="none" class="py-0.5">
            <button
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              role="menuitem"
              @click="onMenuView"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 [&>svg]:shrink-0"
                v-html="menuIconHtmlForItem({ label: 'View' })"
              />
              View
            </button>
          </li>
          <li v-if="payslip.pdfAvailable !== false" role="none" class="py-0.5">
            <a
              :href="pdfUrl"
              download
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              role="menuitem"
              @click="closeMenu"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 [&>svg]:shrink-0"
                v-html="menuIconHtmlForItem({ label: 'Download PDF' })"
              />
              Download PDF
            </a>
          </li>
          <li role="none" class="py-0.5">
            <button
              type="button"
              class="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              role="menuitem"
              @click="onMenuPrint"
            >
              <span
                class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 [&>svg]:shrink-0"
                v-html="menuIconHtmlForItem({ label: 'Print' })"
              />
              Print
            </button>
          </li>
        </ul>
      </Transition>
    </Teleport>

    <div
      class="grid min-w-0 overflow-hidden transition-[grid-template-rows] duration-500 ease-in-out motion-reduce:transition-none"
      :class="expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      :inert="!expanded"
    >
      <div class="min-w-0 min-h-0">
        <div
          class="border-t border-subtle-02 bg-[#F4F7F9]/80"
          :class="expanded ? 'border-l border-r border-black' : ''"
        >
          <div
            class="px-3 py-3 bg-white dark:bg-slate-900 sm:px-4 sm:py-4 md:p-6"
          >
            <div
              class="max-w-full min-w-0 min-h-0 transition-colors duration-200"
            >
              <PayslipDocument :payslip="payslip" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model="deleteDialogOpen"
      title="Delete payslip?"
      :message="deleteConfirmMessage"
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onDeleteConfirmed"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from "vue";
import { autoUpdate, flip, offset, shift, useFloating } from "@floating-ui/vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import PayslipDocument from "./PayslipDocument.vue";
import chevronDownIcon from "@/assets/icons/chevron-down.svg?raw";
import dotsIcon from "@/assets/icons/dots-vertical.svg?raw";
import { menuIconHtmlForItem } from "@/utils/menuActionIcons.js";

const props = defineProps({
  payslip: { type: Object, required: true },
  expanded: { type: Boolean, required: true },
});

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "paid")
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200";
  if (s === "pending")
    return "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200";
  return "bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200";
}

const emit = defineEmits(["toggle", "delete"]);

const menuTriggerKind = ref("desktop");
const menuButtonDesktop = ref(null);
const menuButtonMobile = ref(null);
const menuPopover = ref(null);
const menuWrap = ref(null);
const menuWrapMobile = ref(null);

const menuOpen = ref(false);
const deleteDialogOpen = ref(false);

const deleteConfirmMessage = computed(
  () =>
    `Are you sure you want to delete "${props.payslip.fileAttachment.file.label}"? This action cannot be undone.`,
);

const referenceEl = computed(() =>
  menuTriggerKind.value === "mobile"
    ? menuButtonMobile.value
    : menuButtonDesktop.value,
);

const { floatingStyles, update } = useFloating(referenceEl, menuPopover, {
  open: menuOpen,
  placement: "bottom-end",
  strategy: "fixed",
  transform: false,
  middleware: [offset(4), flip(), shift({ padding: 8 })],
  whileElementsMounted: autoUpdate,
});

function toggleMenu(kind) {
  if (menuOpen.value && menuTriggerKind.value === kind) {
    menuOpen.value = false;
    return;
  }
  menuTriggerKind.value = kind;
  menuOpen.value = true;
}

function menuContains(el) {
  if (!(el instanceof Node)) return false;
  return Boolean(
    (menuWrap.value && menuWrap.value.contains(el)) ||
    (menuWrapMobile.value && menuWrapMobile.value.contains(el)) ||
    (menuPopover.value && menuPopover.value.contains(el)),
  );
}

function onDocumentPointerDown(e) {
  if (!menuOpen.value) return;
  if (menuContains(e.target)) return;
  menuOpen.value = false;
}

function onDocumentKeydown(e) {
  if (e.key === "Escape") menuOpen.value = false;
}

watch(menuOpen, (open) => {
  if (open) {
    nextTick(() => {
      update();
    });
    queueMicrotask(() => {
      document.addEventListener("pointerdown", onDocumentPointerDown, true);
      document.addEventListener("keydown", onDocumentKeydown, true);
    });
  } else {
    document.removeEventListener("pointerdown", onDocumentPointerDown, true);
    document.removeEventListener("keydown", onDocumentKeydown, true);
  }
});

onUnmounted(() => {
  document.removeEventListener("pointerdown", onDocumentPointerDown, true);
  document.removeEventListener("keydown", onDocumentKeydown, true);
});

function onRowSurfaceClick(e) {
  if (e.target instanceof Element && e.target.closest("[data-payslip-menu]"))
    return;
  emit("toggle");
}

function onMobileRowClick(e) {
  if (e.target instanceof Element && e.target.closest("[data-payslip-menu]"))
    return;
  emit("toggle");
}

function closeMenu() {
  menuOpen.value = false;
}

function onMenuDelete() {
  closeMenu();
  deleteDialogOpen.value = true;
}

function onDeleteConfirmed() {
  emit("delete", props.payslip.fileAttachment.accessToken);
}

function onMenuView() {
  closeMenu();
  emit("toggle");
}

function onMenuPrint() {
  closeMenu();
  window.open(pdfUrl.value, "_blank", "noopener,noreferrer");
}

const periodMonth = computed(() => {
  const date = new Date(props.payslip.payrollDate);
  return date.toLocaleDateString("en-US", { month: "long" });
});

const periodYear = computed(() => {
  const date = new Date(props.payslip.payrollDate);
  return String(date.getFullYear());
});

const pdfUrl = computed(
  () => `/payslips/${props.payslip.fileAttachment.accessToken}.pdf`,
);

function formatMoney(amount, currency) {
  const parts = Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${parts.replace(/,/g, " ")} ${currency}`;
}
</script>

<style scoped>
.payslip-actions-menu {
  opacity: 1;
}
</style>
