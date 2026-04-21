<template>
  <div class="expandable">
    <!--
      `bodyRef` always renders the full content. We decide whether to clamp
      with an inline `max-height` (plus a fade mask) once we've measured the
      natural height — no `-webkit-line-clamp` race, no fighting with Vue's
      reactive class binding.
    -->
    <div
      ref="bodyRef"
      class="expandable-body whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300"
      :class="[
        overflowing && !expanded ? 'is-clamped' : '',
        measured ? '' : 'is-measuring',
      ]"
      :style="bodyStyle"
    >
      <slot>{{ text }}</slot>
    </div>

    <button
      v-if="overflowing"
      type="button"
      class="mt-2 inline-flex items-center gap-1 rounded-md text-[12px] font-semibold accent-text transition hover:brightness-110 focus:outline-none focus-visible:shadow-[0_0_0_3px_var(--accent-ring)]"
      :aria-expanded="expanded"
      @click="toggle"
    >
      {{ expanded ? "See less" : "See more" }}
      <svg
        class="h-3 w-3 transition-transform duration-300"
        :class="expanded ? 'rotate-180' : ''"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  text: { type: String, default: "" },
  /** Visible line count while collapsed. Three is the usual sweet spot. */
  maxLines: { type: Number, default: 3 },
});

const bodyRef = ref(null);
const expanded = ref(false);
const overflowing = ref(false);
const collapsedHeight = ref(0);
const fullHeight = ref(0);
const measured = ref(false);

/**
 * Inline max-height drives the fold animation. Unmeasured → no constraint
 * (renders naturally so we can measure). Measured + overflowing + collapsed
 * → collapsedHeight. Expanded → fullHeight, which the transition animates to
 * and then we release the lock on `after-leave` style tidy-up.
 */
const bodyStyle = computed(() => {
  if (!measured.value || !overflowing.value) return null;
  return {
    maxHeight: expanded.value
      ? `${fullHeight.value}px`
      : `${collapsedHeight.value}px`,
  };
});

function readLineHeight(el) {
  const style = window.getComputedStyle(el);
  const lh = parseFloat(style.lineHeight);
  if (Number.isFinite(lh) && lh > 0) return lh;
  // `normal` computed line-height falls back to font-size × 1.625
  // (matches Tailwind's `leading-relaxed` used on the body).
  const fs = parseFloat(style.fontSize) || 14;
  return fs * 1.625;
}

function measure() {
  const el = bodyRef.value;
  if (!el) return;

  // Release any constraint first so scrollHeight reports the natural size
  // of the content; Tailwind classes that add padding / borders do not
  // interfere because scrollHeight already accounts for them.
  const prevInline = el.style.maxHeight;
  el.style.maxHeight = "none";
  const wasClamped = el.classList.contains("is-clamped");
  if (wasClamped) el.classList.remove("is-clamped");
  // Force layout so the unconstrained measurement is accurate.
  void el.offsetHeight;
  const natural = el.scrollHeight;
  if (wasClamped) el.classList.add("is-clamped");
  el.style.maxHeight = prevInline;

  const lineHeight = readLineHeight(el);
  const collapsed = Math.round(lineHeight * props.maxLines);

  collapsedHeight.value = collapsed;
  fullHeight.value = natural;
  // Require at least ~half a line of overflow to avoid flickering the
  // control on/off when the content sits right at the limit.
  overflowing.value = natural > collapsed + Math.round(lineHeight * 0.5);
  if (!overflowing.value) expanded.value = false;
  measured.value = true;
}

function toggle() {
  expanded.value = !expanded.value;
  // When opening, remeasure first in case the text was just updated or the
  // layout changed — stops the transition from snapping to a stale height.
  if (expanded.value) measure();
}

watch(
  () => props.text,
  () => {
    // Text changed → drop expansion and re-measure against the new content.
    expanded.value = false;
    measured.value = false;
    requestAnimationFrame(measure);
  },
);

let resizeObserver = null;

onMounted(() => {
  // Measure twice: once immediately for a snappy first paint, once on the
  // next frame in case fonts / layout are still settling. Much more reliable
  // than a single measure that can happen before typography is finalised.
  measure();
  requestAnimationFrame(measure);
  if ("ResizeObserver" in window && bodyRef.value) {
    resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(bodyRef.value);
  }
  window.addEventListener("resize", measure);
});

onUnmounted(() => {
  resizeObserver?.disconnect();
  resizeObserver = null;
  window.removeEventListener("resize", measure);
});
</script>

<style scoped>
.expandable-body {
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/*
 * While measuring we drop the transition so the brief natural-height state
 * doesn't animate before we know whether we need to clamp. The class is
 * only present for ~1 frame and then removed by `measured.value = true`.
 */
.expandable-body.is-measuring {
  transition: none;
}

/*
 * Soft fade on the bottom edge signals "there's more below" without
 * shouting about it. Paired with the inline max-height above, this is what
 * actually clamps the visible content.
 */
.expandable-body.is-clamped {
  mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 70%,
    rgba(0, 0, 0, 0.25) 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    #000 0%,
    #000 70%,
    rgba(0, 0, 0, 0.25) 100%
  );
}

@media (prefers-reduced-motion: reduce) {
  .expandable-body {
    transition: none;
  }
}
</style>
