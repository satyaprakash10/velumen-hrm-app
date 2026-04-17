import { computed } from "vue";
import payslipsData from "@/data/payslips.json";
import { authUser } from "@/composables/useAuth.js";
import { filterPayslipsForViewer } from "@/utils/payslipAccess.js";

/**
 * Payslip rows visible to the current session user (by auth email). Used for charts,
 * dashboard KPIs, and the payslips list — keeps UI and documents aligned per account.
 */
export function usePayslipDataset() {
  const visiblePayslipsRaw = computed(() =>
    filterPayslipsForViewer(payslipsData, authUser.value?.email),
  );
  return { visiblePayslipsRaw };
}
