import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { authUser } from "@/composables/useAuth.js";
import { usePayslipDataset } from "@/composables/usePayslipDataset.js";

function getEntry(p, key) {
  return p.payslipEntries?.find((e) => e.key === key);
}

function getCurrency(p) {
  return p.payslipEntries?.[0]?.currency || "USD";
}

function enrichPayslip(p) {
  const netEntry = getEntry(p, "NET PAY");
  const grossEntry = getEntry(p, "GROSS");
  const deductionsEntry = getEntry(p, "TOTAL DEDUCTIONS");
  const token = p.fileAttachment?.accessToken;
  const missingPdf = p.fileAttachment?.missingPdf === true;
  const issueSource = p.fileAttachment?.file?.createTime || p.payrollDate;
  const issueDate = new Date(issueSource);

  return {
    ...p,
    currency: getCurrency(p),
    netPay: netEntry?.amount ?? 0,
    gross: grossEntry?.amount ?? 0,
    deductions: deductionsEntry?.amount ?? 0,
    deductionLines: p.deductionLines,
    entitlementLines: p.entitlementLines,
    issueDateLabel: issueDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    status: p.status || "Paid",
    // Demo: public static files; production should gate PDF bytes on the server.
    pdfUrl: token ? `/payslips/${token}.pdf` : null,
    pdfAvailable: Boolean(token) && !missingPdf,
  };
}

export function usePayslips() {
  const route = useRoute();
  const router = useRouter();
  const { visiblePayslipsRaw } = usePayslipDataset();

  const loading = ref(true);
  const deletedAccessTokens = ref(new Set());
  const sortField = ref("date");
  const sortDir = ref("desc");
  const activeCurrency = ref("USD");
  const currencyQueryInvalid = ref(false);

  const availableCurrencies = computed(() => {
    const set = new Set(visiblePayslipsRaw.value.map(getCurrency));
    return [...set].sort((a, b) => {
      if (a === "USD") return -1;
      if (b === "USD") return 1;
      return a.localeCompare(b);
    });
  });

  const defaultCurrency = computed(
    () => availableCurrencies.value[0] || "USD",
  );

  const currencyTabItems = computed(() =>
    availableCurrencies.value.map((code) => ({
      code,
      count: visiblePayslipsRaw.value.filter((p) => getCurrency(p) === code)
        .length,
    })),
  );

  function resolveCurrencyFromQuery() {
    const raw = route.query.currency;
    if (raw == null || raw === "") {
      currencyQueryInvalid.value = false;
      return defaultCurrency.value;
    }
    const code = String(raw).toUpperCase();
    if (availableCurrencies.value.includes(code)) {
      currencyQueryInvalid.value = false;
      return code;
    }
    currencyQueryInvalid.value = true;
    return defaultCurrency.value;
  }

  watch(
    () => route.query.currency,
    () => {
      const next = resolveCurrencyFromQuery();
      if (next !== activeCurrency.value) activeCurrency.value = next;
    },
    { immediate: true },
  );

  watch(activeCurrency, (c) => {
    const raw = route.query.currency;
    const normalized =
      raw == null || raw === "" ? "" : String(raw).toUpperCase();
    if (normalized === c) return;
    router.replace({
      path: route.path,
      query: { ...route.query, currency: c },
    });
  });

  const displayYear = computed(() => {
    const rows = visiblePayslipsRaw.value;
    if (!rows.length) return new Date().getFullYear();
    const years = rows.map((p) => new Date(p.payrollDate).getFullYear());
    return Math.max(...years);
  });

  watch(
    availableCurrencies,
    (codes) => {
      if (!codes.length) return;
      if (!codes.includes(activeCurrency.value)) {
        activeCurrency.value = codes[0];
      }
    },
    { immediate: true },
  );

  watch(
    () => authUser.value?.id,
    () => {
      deletedAccessTokens.value = new Set();
    },
  );

  const filteredPayslips = computed(() => {
    return visiblePayslipsRaw.value
      .filter((p) => getCurrency(p) === activeCurrency.value)
      .filter((p) => !deletedAccessTokens.value.has(p.fileAttachment.accessToken))
      .map(enrichPayslip);
  });

  const sortedPayslips = computed(() => {
    const list = [...filteredPayslips.value];
    const dir = sortDir.value === "asc" ? 1 : -1;
    if (sortField.value === "net") {
      list.sort((a, b) => dir * (a.netPay - b.netPay));
    } else {
      list.sort(
        (a, b) =>
          dir *
          (new Date(a.payrollDate) - new Date(b.payrollDate)),
      );
    }
    return list;
  });

  function toggleSort(field) {
    if (sortField.value === field) {
      sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
    } else {
      sortField.value = field;
      sortDir.value = field === "date" ? "desc" : "desc";
    }
  }

  function removePayslip(accessToken) {
    deletedAccessTokens.value = new Set([
      ...deletedAccessTokens.value,
      accessToken,
    ]);
  }

  let loadingTimer;
  onMounted(() => {
    loadingTimer = window.setTimeout(() => {
      loading.value = false;
    }, 320);
  });
  onUnmounted(() => {
    if (loadingTimer) window.clearTimeout(loadingTimer);
  });

  return {
    loading,
    activeCurrency,
    availableCurrencies,
    currencyTabItems,
    currencyQueryInvalid,
    defaultCurrency,
    displayYear,
    sortedPayslips,
    sortField,
    sortDir,
    toggleSort,
    removePayslip,
  };
}
