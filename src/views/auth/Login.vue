<template>
  <AuthShell>
    <div class="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      <div class="flex items-center gap-2.5">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30" aria-hidden="true">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 11V7a4 4 0 118 0v4" />
          </svg>
        </span>
        <h1 class="text-2xl font-bold tracking-tight text-white">Sign in</h1>
      </div>
      <p class="mt-2 text-sm text-slate-400">
        Your session is protected with SHA-256 hashing, timing-safe comparison, and lockout after repeated failures.
      </p>

      <form class="mt-8 space-y-5" novalidate @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400" for="login-email">Email</label>
          <input
            id="login-email"
            v-model.trim="email"
            type="email"
            autocomplete="username"
            spellcheck="false"
            class="auth-input mt-2"
            :class="errors.email ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="validateEmailField"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-300" role="alert">{{ errors.email }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400" for="login-password">Password</label>
          <PasswordField
            id="login-password"
            v-model="password"
            class="mt-2"
            autocomplete="current-password"
            :invalid="!!errors.password"
            @blur="validatePasswordField"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-300" role="alert">{{ errors.password }}</p>
        </div>

        <label class="flex items-center gap-2 text-[12px] text-slate-400">
          <input
            v-model="rememberDevice"
            type="checkbox"
            class="h-3.5 w-3.5 rounded border-white/20 bg-slate-950/80 text-sky-500 focus:ring-sky-500/30"
          />
          Remember this device
          <span class="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-500">
            <svg class="h-3 w-3 text-emerald-400" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M5 8l2.2 2.2L11.4 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4" />
            </svg>
            Encrypted on this device
          </span>
        </label>

        <p v-if="err" class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {{ err }}
        </p>
        <button
          type="submit"
          class="accent-gradient accent-focus flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold shadow-lg transition hover:brightness-110 disabled:opacity-50"
          :disabled="loading"
        >
          <svg v-if="!loading" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 17l5-5-5-5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H3" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 4v16" />
          </svg>
          <svg v-else class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25" />
            <path stroke-linecap="round" stroke="currentColor" stroke-width="2" d="M21 12a9 9 0 00-9-9" />
          </svg>
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-400">
        <RouterLink class="font-medium text-sky-400 hover:text-sky-300" to="/forgot-password">
          Forgot password?
        </RouterLink>
      </p>
      <p class="mt-2 text-center text-sm text-slate-400">
        No account?
        <RouterLink class="font-medium text-sky-400 hover:text-sky-300" to="/register">
          Create one
        </RouterLink>
      </p>

      <footer class="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-500">
        <button type="button" class="inline-flex items-center gap-1 hover:text-slate-200" @click="openLegal('privacy')">
          <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 1.5l5.5 2v4.9c0 3.2-2.4 5.9-5.5 6.6C4.9 14.3 2.5 11.6 2.5 8.4V3.5L8 1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
          </svg>
          Privacy policy
        </button>
        <button type="button" class="inline-flex items-center gap-1 hover:text-slate-200" @click="openLegal('terms')">
          <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3" y="2.5" width="10" height="11" rx="1.5" stroke="currentColor" stroke-width="1.3" />
            <path d="M5.5 6h5M5.5 8.5h5M5.5 11h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          Terms of use
        </button>
        <button type="button" class="inline-flex items-center gap-1 hover:text-slate-200" @click="openLegal('security')">
          <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="3.5" y="7" width="9" height="6.5" rx="1.4" stroke="currentColor" stroke-width="1.3" />
            <path d="M5 7V5a3 3 0 116 0v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
          </svg>
          Security notes
        </button>
      </footer>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import { isValidEmailFormat } from "@/utils/authValidation.js";
import AuthShell from "@/components/auth/AuthShell.vue";
import PasswordField from "@/components/ui/PasswordField.vue";
import { downloadPdf } from "@/utils/pdfDownload.js";
import { LEGAL_DOCUMENTS } from "@/data/legal.js";

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref("");
const password = ref("");
const rememberDevice = ref(true);
const err = ref("");
const loading = ref(false);

const errors = reactive({
  email: "",
  password: "",
});

function validateEmailField() {
  errors.email = "";
  const e = email.value.trim();
  if (!e) errors.email = "Email is required.";
  else if (!isValidEmailFormat(e)) errors.email = "Enter a valid email address.";
}

function validatePasswordField() {
  errors.password = "";
  if (!password.value) errors.password = "Password is required.";
}

function validateForm() {
  validateEmailField();
  validatePasswordField();
  return !errors.email && !errors.password;
}

async function onSubmit() {
  err.value = "";
  if (!validateForm()) return;
  loading.value = true;
  try {
    await login(email.value, password.value);
    const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "/dashboard";
    router.replace(redirect.startsWith("/") ? redirect : "/dashboard");
  } catch (e) {
    err.value = e?.message || "Sign in failed.";
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
  @apply w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20;
}
</style>
