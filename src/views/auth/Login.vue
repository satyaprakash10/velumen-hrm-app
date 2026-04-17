<template>
  <AuthShell>
    <div class="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      <h1 class="text-2xl font-bold tracking-tight text-white">Sign in</h1>
      <p class="mt-2 text-sm text-slate-400">Secure session in this browser — passwords are verified with SHA-256 (demo).</p>

      <form class="mt-8 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="username"
            class="auth-input mt-2"
            :class="errors.email ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="validateEmailField"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-300" role="alert">{{ errors.email }}</p>
        </div>
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="auth-input mt-2"
            :class="errors.password ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="validatePasswordField"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-red-300" role="alert">{{ errors.password }}</p>
        </div>
        <p v-if="err" class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {{ err }}
        </p>
        <button
          type="submit"
          class="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? "Signing in…" : "Sign in" }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-400">
        <RouterLink class="font-medium text-sky-400 hover:text-sky-300" to="/forgot-password">Forgot password?</RouterLink>
      </p>
      <p class="mt-2 text-center text-sm text-slate-400">
        No account?
        <RouterLink class="font-medium text-sky-400 hover:text-sky-300" to="/register">Register</RouterLink>
      </p>

      <div class="mt-8 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-xs text-slate-400">
        <p class="font-semibold text-slate-200">Demo accounts</p>
        <p class="mt-1">Password for all: <code class="rounded bg-white/10 px-1.5 py-0.5 text-sky-200">password123</code></p>
        <ul class="mt-2 list-inside list-disc space-y-0.5 text-slate-400">
          <li>admin@example.com</li>
          <li>employee@example.com</li>
          <li>candidate@example.com</li>
          <li>ted.ferguson@example.com (sample payslips)</li>
        </ul>
      </div>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import { isValidEmailFormat } from "@/utils/authValidation.js";
import AuthShell from "@/components/auth/AuthShell.vue";

const router = useRouter();
const route = useRoute();
const { login } = useAuth();

const email = ref("");
const password = ref("");
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
</script>

<style scoped>
.auth-input {
  @apply w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20;
}
</style>
