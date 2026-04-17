<template>
  <AuthShell>
    <div class="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      <RouterLink to="/login" class="text-sm font-medium text-sky-400 hover:text-sky-300">← Back to sign in</RouterLink>
      <h1 class="mt-6 text-2xl font-bold tracking-tight text-white">Reset password</h1>
      <p class="mt-2 text-sm text-slate-400">
        In production this would trigger a signed, time-limited reset link. Here we only confirm the request.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400">Work email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="auth-input mt-2"
            :class="errors.email ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="validateEmailField"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-red-300" role="alert">{{ errors.email }}</p>
        </div>
        <p v-if="msg" class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100" role="status">
          {{ msg }}
        </p>
        <p v-if="err" class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200" role="alert">
          {{ err }}
        </p>
        <button
          type="submit"
          class="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? "Sending…" : "Send reset link" }}
        </button>
      </form>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from "vue";
import { RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import { isValidEmailFormat } from "@/utils/authValidation.js";
import AuthShell from "@/components/auth/AuthShell.vue";

const { forgotPassword } = useAuth();

const email = ref("");
const msg = ref("");
const err = ref("");
const loading = ref(false);

const errors = reactive({ email: "" });

function validateEmailField() {
  errors.email = "";
  const e = email.value.trim();
  if (!e) errors.email = "Email is required.";
  else if (!isValidEmailFormat(e)) errors.email = "Enter a valid email address.";
}

async function onSubmit() {
  msg.value = "";
  err.value = "";
  validateEmailField();
  if (errors.email) return;
  loading.value = true;
  try {
    const r = await forgotPassword(email.value);
    msg.value = r.message || "Check your email.";
  } catch (e) {
    err.value = e?.message || "Request failed.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-input {
  @apply w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20;
}
</style>
