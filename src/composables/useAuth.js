import { ref, computed } from "vue";
import { hashPassword, timingSafeEqualHex } from "@/utils/authCrypto.js";
import { AUTH, isValidEmailFormat } from "@/utils/authValidation.js";
import { emitAuthActivity } from "@/utils/activityBus.js";

const TOKEN_KEY = "ess_auth_user";
const REGISTRY_KEY = "ess_user_registry_v1";
const LOCK_KEY = "ess_auth_lockout_v1";

/** SHA-256("password123") — demo password for all seeded accounts */
const DEMO_HASH = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f";

const DEMO_USERS = [
  {
    id: "u-admin",
    email: "admin@example.com",
    passwordHash: DEMO_HASH,
    name: "Alex Morgan",
    role: "admin",
  },
  {
    id: "u-emp",
    email: "employee@example.com",
    passwordHash: DEMO_HASH,
    name: "Jamie Lee",
    role: "employee",
  },
  {
    id: "u-cand",
    email: "candidate@example.com",
    passwordHash: DEMO_HASH,
    name: "Taylor Kim",
    role: "candidate",
  },
  {
    id: "u-ted",
    email: "ted.ferguson@example.com",
    passwordHash: DEMO_HASH,
    name: "Ted Ferguson",
    role: "employee",
  },
];

const MEMBERSHIPS = {
  "u-admin": { "co-1": "admin", "co-2": "employee" },
  "u-emp": { "co-1": "employee", "co-2": "employee" },
  "u-cand": { "co-1": "candidate", "co-2": "candidate" },
  "u-ted": { "co-1": "employee", "co-2": "employee" },
};

export const authUser = ref(null);
const user = authUser;

const registeredUsers = ref([]);

function newUserId() {
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function normalizeRole(r) {
  const x = String(r || "employee").toLowerCase();
  if (x === "admin" || x === "employee" || x === "candidate") return x;
  return "employee";
}

function loadRegistry() {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) registeredUsers.value = parsed;
  } catch {
    /* ignore */
  }
}

function saveRegistry() {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(registeredUsers.value));
  } catch {
    /* ignore */
  }
}

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      user.value = parsed;
    }
  } catch {
    /* ignore */
  }
}

function readLockState() {
  try {
    const raw = sessionStorage.getItem(LOCK_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLockState(o) {
  try {
    sessionStorage.setItem(LOCK_KEY, JSON.stringify(o));
  } catch {
    /* ignore */
  }
}

function isLocked(email) {
  const em = String(email).trim().toLowerCase();
  const st = readLockState();
  const until = st[em]?.until;
  return typeof until === "number" && until > Date.now();
}

function registerFailure(email) {
  const em = String(email).trim().toLowerCase();
  const st = readLockState();
  const cur = st[em] || { fails: 0 };
  cur.fails = (cur.fails || 0) + 1;
  if (cur.fails >= 8) {
    cur.until = Date.now() + 120_000;
    cur.fails = 0;
  }
  st[em] = cur;
  writeLockState(st);
}

function clearFailures(email) {
  const em = String(email).trim().toLowerCase();
  const st = readLockState();
  delete st[em];
  writeLockState(st);
}

if (typeof localStorage !== "undefined") loadRegistry();
if (typeof sessionStorage !== "undefined") loadFromStorage();

function resolveRoleForCompany(userRow, companyId) {
  if (!userRow) return null;
  const cid = companyId || "co-1";
  const m = userRow.memberships;
  if (m && typeof m === "object" && m[cid]) return m[cid];
  const map = MEMBERSHIPS[userRow.id];
  if (map && map[cid]) return map[cid];
  return userRow.role;
}

export function useAuth() {
  const isAuthenticated = computed(() => user.value != null);

  function persist(u) {
    user.value = u;
    try {
      if (u) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(u));
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }

  async function login(email, password) {
    const em = String(email).trim().toLowerCase();
    const pw = String(password);
    if (!em || !pw) {
      const err = new Error("Email and password are required.");
      err.code = "AUTH";
      throw err;
    }
    if (!isValidEmailFormat(em)) {
      const err = new Error("Enter a valid email address.");
      err.code = "AUTH";
      throw err;
    }
    if (isLocked(em)) {
      emitAuthActivity({
        title: "Sign-in blocked",
        message: `Account ${em} is temporarily locked after repeated failures.`,
        severity: "error",
        context: { email: em, event: "locked" },
      });
      const err = new Error("Too many attempts. Try again in a couple of minutes.");
      err.code = "LOCKED";
      throw err;
    }

    const hash = await hashPassword(pw);
    const pool = [...DEMO_USERS, ...registeredUsers.value];
    const found = pool.find((x) => String(x.email).trim().toLowerCase() === em);
    if (!found || !timingSafeEqualHex(found.passwordHash, hash)) {
      registerFailure(em);
      emitAuthActivity({
        title: "Failed sign-in attempt",
        message: `Invalid credentials for ${em}.`,
        severity: "warning",
        context: { email: em, event: "login_failed" },
      });
      const err = new Error("Invalid email or password.");
      err.code = "AUTH";
      throw err;
    }

    clearFailures(em);
    const { passwordHash: _h, ...safe } = found;
    persist(safe);
    const firstName = String(safe.name || "").trim().split(/\s+/)[0] || "there";
    emitAuthActivity({
      title: "Signed in",
      message: `Welcome back, ${firstName} 👋`,
      body: `Signed in as ${safe.email}.`,
      severity: "success",
      context: { email: safe.email, role: safe.role, event: "login" },
    });
    return safe;
  }

  async function register(payload) {
    const rawEmail = String(payload.email || "").trim();
    const em = rawEmail.toLowerCase();
    const name = String(payload.name || "").trim();
    const pw = String(payload.password || "");

    if (!isValidEmailFormat(em)) {
      const err = new Error("Enter a valid email address.");
      err.code = "INVALID_EMAIL";
      throw err;
    }
    if (name.length < AUTH.nameMin || name.length > AUTH.nameMax) {
      const err = new Error(`Name must be between ${AUTH.nameMin} and ${AUTH.nameMax} characters.`);
      err.code = "NAME";
      throw err;
    }
    if (pw.length < AUTH.passwordMin || pw.length > AUTH.passwordMax) {
      const err = new Error(`Use between ${AUTH.passwordMin} and ${AUTH.passwordMax} characters for your password.`);
      err.code = "WEAK";
      throw err;
    }

    const pool = [...DEMO_USERS, ...registeredUsers.value];
    if (pool.some((x) => String(x.email).trim().toLowerCase() === em)) {
      const err = new Error("An account with this email already exists.");
      err.code = "DUP";
      throw err;
    }

    const roleNorm = normalizeRole(payload.role);
    const passwordHash = await hashPassword(pw);
    const row = {
      id: newUserId(),
      email: rawEmail,
      passwordHash,
      name,
      role: roleNorm,
      memberships: { "co-1": roleNorm, "co-2": roleNorm },
    };
    registeredUsers.value = [...registeredUsers.value, row];
    saveRegistry();
    const { passwordHash: _ph, ...safe } = row;
    persist(safe);
    const firstName = String(safe.name || "").trim().split(/\s+/)[0] || "there";
    emitAuthActivity({
      title: "Account created",
      message: `Welcome aboard, ${firstName} 🎉`,
      body: `Your ${safe.role} workspace is ready to go.`,
      severity: "success",
      context: { email: safe.email, role: safe.role, event: "register" },
    });
    return safe;
  }

  function forgotPassword(email) {
    const em = String(email || "").trim();
    if (!em) {
      return Promise.reject(new Error("Email is required."));
    }
    if (!isValidEmailFormat(em)) {
      return Promise.reject(new Error("Enter a valid email address."));
    }
    return Promise.resolve({
      ok: true,
      message: "If an account exists, reset instructions would be sent (connect your API in production).",
    });
  }

  function logout() {
    const previous = user.value;
    persist(null);
    if (previous) {
      const firstName = String(previous.name || "").trim().split(/\s+/)[0];
      emitAuthActivity({
        title: "Signed out",
        message: firstName ? `See you soon, ${firstName} 👋` : "Session ended.",
        body: "Your session has ended on this device.",
        severity: "info",
        context: { email: previous.email, event: "logout" },
      });
    }
  }

  function roleForCompany(companyId) {
    return resolveRoleForCompany(user.value, companyId);
  }

  return {
    user,
    isAuthenticated,
    login,
    register,
    forgotPassword,
    logout,
    roleForCompany,
  };
}

const COMPANY_KEY = "ess_company_id";

export function getEffectiveRole() {
  if (!authUser.value) return null;
  let cid = "co-1";
  try {
    cid = localStorage.getItem(COMPANY_KEY) || "co-1";
  } catch {
    /* ignore */
  }
  return resolveRoleForCompany(authUser.value, cid);
}
