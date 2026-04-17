import { ref, computed, watch } from "vue";
import companies from "@/data/companies.json";

const STORAGE_KEY = "ess_company_id";

const currentId = ref(
  typeof localStorage !== "undefined"
    ? localStorage.getItem(STORAGE_KEY) || companies[0]?.id || ""
    : companies[0]?.id || "",
);

watch(currentId, (id) => {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
});

export function useCompany() {
  const list = companies;

  const current = computed(() => list.find((c) => c.id === currentId.value) || list[0] || null);

  function setCompany(id) {
    if (list.some((c) => c.id === id)) currentId.value = id;
  }

  return {
    companies: list,
    currentId,
    current,
    setCompany,
  };
}
