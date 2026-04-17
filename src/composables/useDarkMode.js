import { ref, watch } from "vue";

const STORAGE_KEY = "ess_dark_mode";

const dark = ref(false);

if (typeof document !== "undefined") {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "1") dark.value = true;
    else if (s === "0") dark.value = false;
    else
      dark.value = window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    dark.value = false;
  }
  applyDark(dark.value);
}

function applyDark(v) {
  const on = Boolean(v);
  const el = document.documentElement;
  el.classList.toggle("dark", on);
  el.style.colorScheme = on ? "dark" : "light";
  el.setAttribute("data-theme", on ? "dark" : "light");
  try {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", on ? "#020617" : "#f0f2f5");
  } catch {
    /* ignore */
  }
}

let watchStarted = false;

export function useDarkMode() {
  if (!watchStarted && typeof document !== "undefined") {
    watchStarted = true;
    watch(
      dark,
      (v) => {
        applyDark(v);
        try {
          localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
        } catch {
          /* ignore */
        }
      },
      { flush: "post" },
    );
  }

  function toggle() {
    dark.value = !dark.value;
  }

  function setDark(v) {
    dark.value = Boolean(v);
  }

  return { dark, toggle, setDark };
}
