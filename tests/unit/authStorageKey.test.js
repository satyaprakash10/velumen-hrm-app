import { describe, it, expect, vi, beforeEach } from "vitest";

const authUser = vi.hoisted(() => ({ value: null }));

vi.mock("@/composables/useAuth.js", () => ({
  authUser,
}));

import { authStorageKey } from "@/utils/authStorageKey.js";

describe("authStorageKey", () => {
  beforeEach(() => {
    authUser.value = null;
  });

  it("uses preauth namespace when logged out", () => {
    expect(authStorageKey("ess_tasks_v1")).toBe("ess_tasks_v1__preauth");
  });

  it("namespaces by user id when logged in", () => {
    authUser.value = { id: "u-demo-1", email: "x@y.com" };
    expect(authStorageKey("ess_tasks_v1")).toBe("ess_tasks_v1__u-demo-1");
  });
});
