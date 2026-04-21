import { ref, onMounted, onUnmounted } from "vue";

/**
 * Track how far the user has scrolled through a referenced element.
 *
 *   0  — the element's top has just entered the viewport bottom
 *   1  — the element's bottom is about to leave the viewport top
 *
 * The handler is throttled to `requestAnimationFrame` so it stays cheap even
 * on a dozen sections. All updates happen passively and respect the user's
 * `prefers-reduced-motion` preference (returns a static 0 if reduced motion).
 */
export function useScrollProgress(elRef) {
  const progress = ref(0);
  let ticking = false;
  let reduced = false;

  function readMotion() {
    try {
      reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      reduced = false;
    }
  }

  function compute() {
    ticking = false;
    const el = elRef.value;
    if (!el) return;
    if (reduced) {
      progress.value = 0;
      return;
    }
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const total = Math.max(rect.height - vh, 1);
    const raw = (0 - rect.top) / total;
    progress.value = Math.min(1, Math.max(0, raw));
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(compute);
  }

  onMounted(() => {
    readMotion();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    compute();
  });

  onUnmounted(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  });

  return { progress };
}

/**
 * One-shot reveal-on-scroll: attaches an IntersectionObserver to each element
 * matching `selector` within `root` and adds the `is-in` class on first
 * visibility. Cleans up on unmount. Useful for staggered fade/slide-up
 * entrances without pulling in a full animation library.
 */
export function useRevealOnScroll(root, selector = "[data-reveal]") {
  let observer = null;

  function attach() {
    const host = root?.value || document;
    if (!("IntersectionObserver" in window)) {
      host.querySelectorAll(selector).forEach((el) => el.classList.add("is-in"));
      return;
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    host.querySelectorAll(selector).forEach((el) => observer.observe(el));
  }

  onMounted(() => {
    window.requestAnimationFrame(attach);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });
}
