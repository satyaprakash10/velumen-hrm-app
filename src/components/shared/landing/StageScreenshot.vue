<template>
  <!--
    Landing hero / raster preview: skeleton while the image decodes, optional
    `fill` for absolute inset layout inside a sized parent.
  -->
  <figure
    class="stage-shot relative h-full w-full overflow-hidden bg-slate-900"
    :class="fill ? 'absolute inset-0 min-h-0' : ''"
  >
    <div
      v-if="!loaded"
      class="stage-skeleton absolute inset-0 flex flex-col gap-3 p-4 sm:p-5"
      aria-hidden="true"
    >
      <div class="flex items-center gap-2">
        <div class="h-5 w-20 rounded-md bg-slate-700/70" />
        <div class="ml-auto h-5 w-14 rounded-md bg-slate-700/70" />
      </div>
      <div class="grid grid-cols-3 gap-2">
        <div class="h-16 rounded-lg bg-slate-800/70" />
        <div class="h-16 rounded-lg bg-slate-800/70" />
        <div class="h-16 rounded-lg bg-slate-800/70" />
      </div>
      <div class="flex-1 rounded-xl bg-slate-800/60" />
      <div class="space-y-2">
        <div class="h-3 w-2/3 rounded bg-slate-700/60" />
        <div class="h-3 w-1/2 rounded bg-slate-700/60" />
        <div class="h-3 w-3/4 rounded bg-slate-700/60" />
      </div>
    </div>

    <img
      ref="imgEl"
      :src="resolvedSrc"
      :alt="alt"
      :loading="eager ? 'eager' : 'lazy'"
      decoding="async"
      draggable="false"
      class="stage-image h-full w-full object-cover object-top transition-[opacity,transform] duration-500"
      :class="[loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.01]', imgClass]"
      :style="imgStyle"
      @load="onLoad"
      @error="onError"
    />

    <template v-if="loaded && regions.length">
      <span
        v-for="(r, i) in regions"
        :key="i"
        class="pointer-events-none absolute rounded-md bg-slate-900/70 backdrop-blur-md ring-1 ring-white/10"
        :style="{
          top: `${r.top}%`,
          left: `${r.left}%`,
          width: `${r.width}%`,
          height: `${r.height}%`,
        }"
        aria-hidden="true"
      />
    </template>

    <div
      v-if="loaded"
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/30"
      aria-hidden="true"
    />
  </figure>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { publicUrl } from "@/utils/publicAsset.js";

const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: "" },
  eager: { type: Boolean, default: false },
  fill: { type: Boolean, default: false },
  imgClass: { type: String, default: "" },
  imgStyle: { type: Object, default: () => ({}) },
  regions: { type: Array, default: () => [] },
});

const imgEl = ref(null);
const loaded = ref(false);

const resolvedSrc = computed(() => publicUrl(props.src));

function onLoad() {
  loaded.value = true;
}

function onError() {
  loaded.value = false;
}

function syncLoadedFromImage() {
  const el = imgEl.value;
  if (el && el.complete && el.naturalWidth > 0) {
    loaded.value = true;
  }
}

watch(
  () => resolvedSrc.value,
  () => {
    loaded.value = false;
    nextTick(() => syncLoadedFromImage());
  },
);

onMounted(() => {
  nextTick(() => syncLoadedFromImage());
});
</script>

<style scoped>
.stage-skeleton {
  background: linear-gradient(
    130deg,
    rgba(30, 41, 59, 0.75) 0%,
    rgba(51, 65, 85, 0.5) 50%,
    rgba(30, 41, 59, 0.75) 100%
  );
  background-size: 220% 220%;
  animation: stage-shimmer 2.2s linear infinite;
}

.stage-skeleton > * {
  animation: stage-pulse 1.6s ease-in-out infinite;
}

@keyframes stage-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: -100% 50%;
  }
}

@keyframes stage-pulse {
  0%,
  100% {
    opacity: 0.55;
  }
  50% {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage-skeleton,
  .stage-skeleton > * {
    animation: none;
  }
  .stage-image {
    transition: none;
  }
}
</style>
