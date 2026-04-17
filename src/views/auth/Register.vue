<template>
  <AuthShell>
    <div class="rounded-3xl border border-white/10 bg-slate-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-10">
      <RouterLink to="/login" class="text-sm font-medium text-sky-400 hover:text-sky-300">← Back to sign in</RouterLink>
      <h1 class="mt-6 text-2xl font-bold tracking-tight text-white">Create account</h1>
      <p class="mt-2 text-sm text-slate-400">
        Accounts are stored only in this browser with SHA-256 password hashes. Each user has separate app data.
      </p>

      <form class="mt-8 space-y-5" @submit.prevent="onSubmit">
        <div>
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400">Full name</label>
          <input
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
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
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
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-400">Password (10+ chars)</label>
          <input
            v-model="password"
            type="password"
            autocomplete="new-password"
            maxlength="128"
            class="auth-input mt-2"
            :class="errors.password ? 'border-red-500/60 ring-1 ring-red-500/30' : ''"
            @blur="touch('password')"
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
          {{ loading ? "Creating…" : "Register" }}
        </button>
      </form>
    </div>
  </AuthShell>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, RouterLink } from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import { AUTH, isValidEmailFormat } from "@/utils/authValidation.js";
import AuthShell from "@/components/auth/AuthShell.vue";
import ListboxField from "@/components/ui/ListboxField.vue";

const router = useRouter();
const { register } = useAuth();

const name = ref("");
const email = ref("");
const password = ref("");
const role = ref("employee");
const err = ref("");
const loading = ref(false);

const errors = reactive({
  name: "",
  email: "",
  role: "",
  password: "",
});

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "candidate", label: "Candidate" },
  { value: "admin", label: "Admin" },
];

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
  }
}

function validateForm() {
  ["name", "email", "role", "password"].forEach((k) => validateField(k));
  return !errors.name && !errors.email && !errors.role && !errors.password;
}

async function onSubmit() {
  err.value = "";
  if (!validateForm()) return;
  loading.value = true;
  try {
    await register({ name: name.value, email: email.value, password: password.value, role: role.value });
    router.replace("/dashboard");
  } catch (e) {
    err.value = e?.message || "Registration failed.";
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
