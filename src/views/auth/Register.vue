<template>
  <AuthShell>
    <div class="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      <RouterLink to="/login" class="text-sm font-medium text-sky-400 hover:text-sky-300">← Back to sign in</RouterLink>
      <h1 class="mt-6 text-2xl font-bold tracking-tight text-white">Create your account</h1>
      <p class="mt-2 text-sm text-slate-400">
        Your credentials are hashed with SHA-256 before anything is written to storage. We never collect telemetry, never ship marketing scripts, and you can delete your demo workspace at any time.
      </p>

      <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400" for="reg-name">Full name</label>
          <input
            id="reg-name"
            v-model="name"
            type="text"
            autocomplete="name"
            maxlength="80"
            class="auth-input mt-2"
            :class="errors.name ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="touch('name')"
          />
          <p v-if="errors.name" class="mt-1 text-xs text-red-300" role="alert">{{ errors.name }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400" for="reg-email">Email</label>
          <input
            id="reg-email"
            v-model="email"
            type="email"
            autocomplete="email"
            spellcheck="false"
            class="auth-input mt-2"
            :class="errors.email ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="touch('email')"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-300" role="alert">{{ errors.email }}</p>
        </div>
        <div>
          <ListboxField
            v-model="role"
            variant="dark"
            label="Role"
            :options="roleOptions"
            placeholder="Select role"
            :invalid="!!errors.role"
          />
          <p v-if="errors.role" class="mt-1 text-xs text-red-300" role="alert">{{ errors.role }}</p>
        </div>

        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400" for="reg-password">Password</label>
          <PasswordField
            id="reg-password"
            v-model="password"
            class="mt-2"
            autocomplete="new-password"
            :invalid="!!errors.password"
            @blur="touch('password')"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-300" role="alert">{{ errors.password }}</p>
          <ul class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]" aria-live="polite">
            <li
              v-for="rule in passwordChecklist"
              :key="rule.key"
              class="flex items-center gap-1.5"
              :class="rule.ok ? 'text-emerald-300' : 'text-slate-500'"
            >
              <svg class="h-3 w-3 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  v-if="rule.ok"
                  d="M5 8l2.2 2.2L11.4 6"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <circle v-else cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
              </svg>
              {{ rule.label }}
            </li>
          </ul>
        </div>

        <label class="flex items-start gap-2 text-[12px] leading-snug text-slate-300">
          <input
            v-model="accepted"
            type="checkbox"
            class="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-white/20 bg-slate-950/80 text-sky-500 focus:ring-sky-500/30"
          />
          <span>
            I have read and agree to the
            <button type="button" class="font-medium text-sky-400 hover:text-sky-300" @click="openLegal('terms')">Terms of use</button>
            and
            <button type="button" class="font-medium text-sky-400 hover:text-sky-300" @click="openLegal('privacy')">Privacy policy</button>.
          </span>
        </label>
        <p v-if="errors.accepted" class="mt-1 text-xs text-red-300" role="alert">{{ errors.accepted }}</p>

        <p v-if="err" class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {{ err }}
        </p>
        <button
          type="submit"
          class="accent-gradient accent-focus flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold shadow-lg transition hover:brightness-110 disabled:opacity-50"
          :disabled="loading"
        >
          <svg v-if="!loading" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 8v6M22 11h-6" />
          </svg>
          <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25" />
            <path stroke-linecap="round" stroke="currentColor" stroke-width="2" d="M21 12a9 9 0 00-9-9" />
          </svg>
          {{ loading ? "Creating…" : "Create account" }}
        </button>
      </form>

      <footer class="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
        <button type="button" class="inline-flex items-center gap-1 hover:text-slate-200" @click="openLegal('privacy')">
          Privacy policy
        </button>
        <span class="text-slate-700">·</span>
        <button type="button" class="inline-flex items-center gap-1 hover:text-slate-200" @click="openLegal('terms')">
          Terms of use
        </button>
        <span class="text-slate-700">·</span>
        <button type="button" class="inline-flex items-center gap-1 hover:text-slate-200" @click="openLegal('security')">
          Security notes
        </button>
      </footer>
    </div>
  </AuthShell>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import { AUTH, isValidEmailFormat } from "@/utils/authValidation.js";
import AuthShell from "@/components/auth/AuthShell.vue";
import ListboxField from "@/components/ui/ListboxField.vue";
import PasswordField from "@/components/ui/PasswordField.vue";
import { downloadPdf } from "@/utils/pdfDownload.js";
import { LEGAL_DOCUMENTS } from "@/data/legal.js";

const router = useRouter();
const { register } = useAuth();

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("employee");
const accepted = ref(false);
const err = ref("");
const loading = ref(false);

const errors = reactive({
  name: "",
  email: "",
  role: "",
  password: "",
  accepted: "",
});

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "candidate", label: "Candidate" },
  { value: "admin", label: "Admin" },
];

const passwordChecklist = computed(() => {
  const p = password.value;
  return [
    { key: "length", label: `${AUTH.passwordMin}+ characters`, ok: p.length >= AUTH.passwordMin },
    { key: "upper", label: "Uppercase letter", ok: /[A-Z]/.test(p) },
    { key: "lower", label: "Lowercase letter", ok: /[a-z]/.test(p) },
    { key: "number", label: "Number", ok: /\d/.test(p) },
    { key: "symbol", label: "Symbol or space", ok: /[^A-Za-z0-9]/.test(p) },
    { key: "notName", label: "No name or email", ok: passwordNotObvious(p) },
  ];
});

function passwordNotObvious(pw) {
  if (!pw) return false;
  const lower = pw.toLowerCase();
  const emailLocal = String(email.value || "").split("@")[0].toLowerCase();
  const namePieces = String(name.value || "")
    .toLowerCase()
    .split(/\s+/)
    .filter((p) => p.length >= 3);
  if (emailLocal && emailLocal.length >= 3 && lower.includes(emailLocal)) return false;
  return !namePieces.some((piece) => lower.includes(piece));
}

function touch(k) {
  validateField(k);
}

function validateField(k) {
  errors[k] = "";
  if (k === "name") {
    const n = name.value.trim();
    if (!n) errors.name = "Name is required.";
    else if (n.length < AUTH.nameMin) errors.name = `Use at least ${AUTH.nameMin} characters.`;
    else if (n.length > AUTH.nameMax) errors.name = `Use at most ${AUTH.nameMax} characters.`;
  }
  if (k === "email") {
    const e = email.value.trim();
    if (!e) errors.email = "Email is required.";
    else if (!isValidEmailFormat(e)) errors.email = "Enter a valid email address.";
  }
  if (k === "role") {
    if (!["employee", "candidate", "admin"].includes(role.value)) errors.role = "Select a role.";
  }
  if (k === "password") {
    const p = password.value;
    if (!p) errors.password = "Password is required.";
    else if (p.length < AUTH.passwordMin) errors.password = `Use at least ${AUTH.passwordMin} characters.`;
    else if (p.length > AUTH.passwordMax) errors.password = `Use at most ${AUTH.passwordMax} characters.`;
    else if (!passwordChecklist.value.slice(0, 4).every((r) => r.ok)) {
      errors.password = "Use a mix of upper, lower and numeric characters.";
    }
  }
  if (k === "accepted") {
    errors.accepted = accepted.value ? "" : "Please accept the Terms and Privacy policy to continue.";
  }
}

function validateForm() {
  ["name", "email", "role", "password", "accepted"].forEach((k) => validateField(k));
  return !errors.name && !errors.email && !errors.role && !errors.password && !errors.accepted;
}

async function onSubmit() {
  err.value = "";
  if (!validateForm()) return;
  loading.value = true;
  try {
    await register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });
    router.replace("/dashboard");
  } catch (e) {
    err.value = e?.message || "Registration failed.";
  } finally {
    loading.value = false;
  }
}

function openLegal(kind) {
  const doc = LEGAL_DOCUMENTS[kind];
  if (!doc) return;
  downloadPdf({
    filename: doc.filename,
    title: doc.title,
    subtitle: doc.subtitle,
    body: doc.body,
    footer: doc.footer,
  });
}
</script>

<style scoped>
.auth-input {
  @apply w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20;
}
</style>
