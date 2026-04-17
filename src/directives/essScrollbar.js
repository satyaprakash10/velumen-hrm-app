/**
 * Thin overlay scrollbar: thumb is subtle until hover or while scrolling.
 * Add class `ess-scrollbar` + this directive on overflow containers.
 */
export const essScrollbar = {
  mounted(el) {
    el.classList.add("ess-scrollbar");
    const onScroll = () => {
      el.classList.add("ess-scrollbar--scrolling");
      clearTimeout(el._essScrollT);
      el._essScrollT = window.setTimeout(() => {
        el.classList.remove("ess-scrollbar--scrolling");
      }, 900);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    el._essScrollOnScroll = onScroll;
  },
  unmounted(el) {
    if (el._essScrollOnScroll) {
      el.removeEventListener("scroll", el._essScrollOnScroll);
    }
    clearTimeout(el._essScrollT);
  },
};
