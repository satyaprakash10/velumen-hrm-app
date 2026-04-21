<template>
  <div
    class="group relative flex gap-3 px-4 py-3 transition-colors"
    :class="item.read ? 'bg-transparent' : 'bg-sky-50/40 dark:bg-sky-950/20'"
  >
    <span
      class="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full transition-opacity"
      :class="[toneBar, item.read ? 'opacity-0' : 'opacity-100']"
      aria-hidden="true"
    />

    <div
      class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1"
      :class="toneIconWrap"
      aria-hidden="true"
    >
      <span class="h-4 w-4 [&>svg]:h-full [&>svg]:w-full" v-html="iconSvg" />
    </div>

    <button
      type="button"
      class="flex min-w-0 flex-1 flex-col text-left transition hover:text-slate-900 dark:hover:text-white"
      @click="onActivate"
    >
      <span class="flex items-start justify-between gap-2">
        <span class="truncate text-[13px] font-semibold text-slate-900 dark:text-slate-50">
          {{ item.title }}
        </span>
        <span class="shrink-0 text-[10px] font-medium tabular-nums text-slate-400 dark:text-slate-500">
          {{ relativeTime }}
        </span>
      </span>
      <span
        v-if="item.body"
        class="mt-0.5 line-clamp-2 text-[12px] leading-snug text-slate-600 dark:text-slate-400"
      >
        {{ item.body }}
      </span>
      <span
        v-if="item.module || item.context?.event || item.to"
        class="mt-1.5 flex flex-wrap items-center gap-1.5"
      >
        <span
          v-if="item.module"
          class="inline-flex items-center rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {{ item.module }}
        </span>
        <span
          v-if="item.context?.event"
          class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          :class="toneChip"
        >
          {{ formatEvent(item.context.event) }}
        </span>
        <span
          v-if="item.to"
          class="inline-flex items-center gap-1 rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
        >
          <svg class="h-2.5 w-2.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          View
        </span>
        <span
          v-if="!item.read"
          class="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-300"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-sky-500 dark:bg-sky-400" aria-hidden="true" />
          New
        </span>
      </span>
    </button>

    <button
      type="button"
      class="ml-1 mt-0.5 hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-700 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:hover:bg-slate-800 dark:hover:text-slate-200 sm:inline-flex"
      :aria-label="`Dismiss notification ${item.title}`"
      @click.stop="$emit('dismiss', item.id)"
    >
      <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
});

const emit = defineEmits(["mark-read", "dismiss", "navigate"]);

function onActivate() {
  emit("mark-read", props.item.id);
  if (props.item.to) {
    emit("navigate", props.item);
  }
}

const TONE_BY_SEVERITY = {
  info: {
    bar: "bg-sky-400",
    wrap: "bg-sky-50 text-sky-600 ring-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:ring-sky-900/60",
    chip: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  },
  success: {
    bar: "bg-emerald-400",
    wrap: "bg-emerald-50 text-emerald-600 ring-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:ring-emerald-900/60",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  warning: {
    bar: "bg-amber-400",
    wrap: "bg-amber-50 text-amber-600 ring-amber-100 dark:bg-amber-950/60 dark:text-amber-300 dark:ring-amber-900/60",
    chip: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
  error: {
    bar: "bg-rose-400",
    wrap: "bg-rose-50 text-rose-600 ring-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:ring-rose-900/60",
    chip: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
  },
};

const CATEGORY_ICON = {
  auth: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><rect x="3.5" y="7" width="9" height="6.5" rx="1.4" stroke="currentColor" stroke-width="1.6"/><circle cx="8" cy="10" r="1" fill="currentColor"/></svg>`,
  activity: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 8h2.3l1.8-4.5L8.5 12l1.7-4 .8 1.5h3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  system: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.6"/><path d="M8 5v3.2l2 1.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`,
};

const SEVERITY_ICON = {
  success: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M5.2 8.3l2 2 3.6-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  warning: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.5l6 11H2L8 2.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 7v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="11.7" r="0.9" fill="currentColor"/></svg>`,
  error: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6"/><path d="M5.8 5.8l4.4 4.4M10.2 5.8l-4.4 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
};

const tone = computed(
  () => TONE_BY_SEVERITY[props.item.severity] || TONE_BY_SEVERITY.info,
);

const toneBar = computed(() => tone.value.bar);
const toneIconWrap = computed(() => tone.value.wrap);
const toneChip = computed(() => tone.value.chip);

const iconSvg = computed(() => {
  if (props.item.severity === "warning" || props.item.severity === "error") {
    return SEVERITY_ICON[props.item.severity];
  }
  if (props.item.severity === "success") return SEVERITY_ICON.success;
  return CATEGORY_ICON[props.item.category] || CATEGORY_ICON.activity;
});

const relativeTime = computed(() => formatRelative(props.item.time));

function formatRelative(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  if (diff < 45_000) return "just now";
  if (diff < 60 * 60_000) return `${Math.max(1, Math.round(diff / 60_000))}m`;
  if (diff < 24 * 60 * 60_000) return `${Math.round(diff / 3_600_000)}h`;
  if (diff < 7 * 24 * 60 * 60_000) return `${Math.round(diff / 86_400_000)}d`;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function formatEvent(evt) {
  return String(evt).replace(/_/g, " ");
}
</script>
