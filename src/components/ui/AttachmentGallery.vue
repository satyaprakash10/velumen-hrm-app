<template>
  <div class="relative">
    <div
      ref="trackRef"
      class="scrollbar-kit flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
      @scroll.passive="onScroll"
    >
      <article
        v-for="(att, i) in attachments"
        :key="att.id"
        class="group relative flex shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
        :style="{ width: slideWidth }"
      >
        <button
          v-if="isImage(att)"
          type="button"
          class="flex h-full w-full items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
          :aria-label="`Zoom ${att.name}`"
          @click="open(i)"
        >
          <img
            :src="att.dataUrl"
            :alt="att.name"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            draggable="false"
          />
        </button>
        <a
          v-else
          :href="att.dataUrl"
          :download="att.name"
          class="flex h-full w-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-600 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <svg class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5M9 13h6M9 17h4" />
          </svg>
          <span class="text-[11px] font-semibold uppercase tracking-wider">
            {{ extensionOf(att) }}
          </span>
        </a>

        <span class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/60 via-black/30 to-transparent px-3 py-2 text-[11px] font-semibold text-white">
          <span class="truncate">{{ att.name }}</span>
          <span class="shrink-0 tabular-nums text-white/80">{{ prettySize(att.size) }}</span>
        </span>
      </article>
    </div>

    <template v-if="attachments.length > 1">
      <button
        v-if="!atStart"
        type="button"
        class="absolute left-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md ring-1 ring-black/10 transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:bg-slate-900/90 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-slate-800"
        aria-label="Previous attachment"
        @click="scroll(-1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 18L9 12l6-6" />
        </svg>
      </button>
      <button
        v-if="!atEnd"
        type="button"
        class="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md ring-1 ring-black/10 transition hover:bg-white hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30 dark:bg-slate-900/90 dark:text-slate-100 dark:ring-white/10 dark:hover:bg-slate-800"
        aria-label="Next attachment"
        @click="scroll(1)"
      >
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 6l6 6-6 6" />
        </svg>
      </button>
      <div
        class="pointer-events-none mt-1 flex justify-center gap-1.5"
        aria-hidden="true"
      >
        <span
          v-for="(att, i) in attachments"
          :key="`dot-${att.id}`"
          class="h-1.5 rounded-full transition-all"
          :class="i === activeIndex ? 'w-4 bg-slate-700 dark:bg-slate-200' : 'w-1.5 bg-slate-300 dark:bg-slate-700'"
        />
      </div>
    </template>

    <ImageZoomModal
      v-if="zoomIndex != null"
      :attachments="attachments"
      :start-index="zoomIndex"
      @close="zoomIndex = null"
    />
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import ImageZoomModal from "@/components/ui/ImageZoomModal.vue";

const props = defineProps({
  attachments: { type: Array, default: () => [] },
  aspect: { type: String, default: "16 / 10" },
});

const trackRef = ref(null);
const zoomIndex = ref(null);
const activeIndex = ref(0);
const atStart = ref(true);
const atEnd = ref(false);

const slideWidth = computed(() => {
  if (props.attachments.length <= 1) return "100%";
  return "min(320px, 80%)";
});

function isImage(att) {
  return typeof att?.type === "string" && att.type.startsWith("image/");
}

function extensionOf(att) {
  const name = String(att?.name || "").toLowerCase();
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "FILE";
  return name.slice(idx + 1, idx + 6).toUpperCase() || "FILE";
}

function prettySize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function scroll(direction) {
  const el = trackRef.value;
  if (!el) return;
  const amount = el.clientWidth * 0.9 * Math.sign(direction);
  el.scrollBy({ left: amount, behavior: "smooth" });
}

function onScroll() {
  const el = trackRef.value;
  if (!el) return;
  const max = el.scrollWidth - el.clientWidth;
  atStart.value = el.scrollLeft <= 4;
  atEnd.value = max <= 4 ? true : el.scrollLeft >= max - 4;
  const idx = Math.round((el.scrollLeft / Math.max(1, max)) * (props.attachments.length - 1));
  activeIndex.value = Math.max(0, Math.min(idx, props.attachments.length - 1));
}

function open(index) {
  if (!isImage(props.attachments[index])) return;
  zoomIndex.value = index;
}

onMounted(() => {
  nextTick(onScroll);
});
</script>
