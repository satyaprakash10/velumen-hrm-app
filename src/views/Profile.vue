<template>
  <div class="min-h-full bg-page-bg px-4 py-6 transition-colors dark:bg-slate-950 md:px-10 md:py-8">
    <div class="mx-auto max-w-[720px]">
      <h1 class="page-title mb-1">My profile</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Your details as shown in the HR directory.
      </p>

      <form
        class="mt-8 space-y-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors md:p-8 dark:border-slate-800 dark:bg-slate-900"
        @submit.prevent="onSave"
      >
        <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div class="relative">
            <div
              class="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#E8EDF3] text-xl font-semibold text-navy ring-2 ring-white shadow-md dark:bg-slate-800 dark:text-slate-100"
            >
              <img
                v-if="local.avatarUrl"
                :src="local.avatarUrl"
                alt=""
                class="h-full w-full object-cover"
              />
              <span v-else>{{ initials }}</span>
            </div>
            <label
              class="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-navy text-white shadow-md transition hover:bg-navy/90 dark:bg-sky-600 dark:hover:bg-sky-500"
            >
              <span class="sr-only">Upload photo</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="onAvatar"
              />
            </label>
          </div>
          <div class="min-w-0 flex-1 text-center sm:text-left">
            <p class="font-semibold text-gray-900 dark:text-gray-100">{{ displayName }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ profile.role }} · {{ profile.employeeId }}</p>
          </div>
        </div>

        <section>
          <h2 class="text-sm font-semibold text-navy dark:text-slate-100">Personal</h2>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">First name</span>
              <input
                v-model="local.firstName"
                type="text"
                :class="inputFieldClass(v$.firstName.$error)"
              />
              <p v-if="v$.firstName.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {{ v$.firstName.$errors[0]?.$message }}
              </p>
            </label>
            <label class="block">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Last name</span>
              <input
                v-model="local.lastName"
                type="text"
                :class="inputFieldClass(v$.lastName.$error)"
              />
              <p v-if="v$.lastName.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {{ v$.lastName.$errors[0]?.$message }}
              </p>
            </label>
            <label class="block sm:col-span-2">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Email</span>
              <input
                v-model="local.email"
                type="email"
                :class="inputFieldClass(v$.email.$error)"
              />
              <p v-if="v$.email.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {{ v$.email.$errors[0]?.$message }}
              </p>
            </label>

            <div class="sm:col-span-2">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Country</span>
              <SearchableListbox
                v-model="local.countryCode"
                class="mt-1.5 block"
                :options="countryOptions"
                placeholder="Select country"
                :invalid="v$.countryCode.$error"
              />
              <p v-if="v$.countryCode.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {{ v$.countryCode.$errors[0]?.$message }}
              </p>
            </div>

            <label class="block sm:col-span-2">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Phone</span>
              <div class="mt-1.5 flex items-center gap-2">
                <span
                  class="inline-flex h-11 min-w-[4.25rem] shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-sm font-semibold tabular-nums text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                  :title="activeCountryName || 'Country code'"
                >
                  <span class="text-lg leading-none" aria-hidden="true">{{ activeFlag }}</span>
                  <span>{{ activeDial }}</span>
                </span>
                <input
                  v-model="local.phoneNational"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  :class="[inlineInputFieldClass(v$.phoneNational.$error), 'min-w-0 flex-1']"
                  :placeholder="phonePlaceholder"
                />
              </div>
              <p v-if="v$.phoneNational.$error" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                {{ v$.phoneNational.$errors[0]?.$message }}
              </p>
              <p v-else class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Enter your national number without the country code. Leave blank if you prefer not to share a phone.
              </p>
            </label>
          </div>
        </section>

        <section>
          <h2 class="text-sm font-semibold text-navy dark:text-slate-100">
            Position &amp; reporting
          </h2>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            How you’re set up in the org chart: your title, team, who you report to, and where you usually work.
            Updates here are stored on this device for the signed-in account.
          </p>
          <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="sm:col-span-2">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Job title</span>
              <SearchableListbox
                v-model="local.role"
                class="mt-1.5 block"
                :options="roleOptions"
                placeholder="Select job title"
              />
            </div>
            <div>
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Department</span>
              <SearchableListbox
                v-model="local.department"
                class="mt-1.5 block"
                :options="deptOptions"
                placeholder="Select department"
              />
            </div>
            <div>
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Manager</span>
              <SearchableListbox
                v-model="local.manager"
                class="mt-1.5 block"
                :options="managerOptions"
                placeholder="Select manager"
              />
            </div>
            <div class="sm:col-span-2">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Location</span>
              <GooglePlacesInput
                v-model="local.location"
                class="mt-1.5 block"
                :invalid="false"
                placeholder="Search a place (Google) or type manually"
              />
              <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                With a Maps API key, suggestions appear as you type. Otherwise this is a standard text field.
              </p>
            </div>
          </div>
        </section>

        <div class="flex flex-wrap items-center gap-3">
          <button type="submit" :class="btnPrimaryClass">
            Save changes
          </button>
          <p v-if="savedHint" class="text-sm text-emerald-700 dark:text-emerald-400" role="status">
            {{ savedHint }}
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email, minLength, helpers } from "@vuelidate/validators";
import { useUser } from "@/composables/useUser.js";
import { inputFieldClass, inlineInputFieldClass, btnPrimaryClass } from "@/utils/formFieldClasses.js";
import countries from "@/data/countries.json";
import { flagEmojiFromIso2 } from "@/utils/countryFlag.js";
import profileOptions from "@/data/profileOptions.json";
import SearchableListbox from "@/components/ui/SearchableListbox.vue";
import GooglePlacesInput from "@/components/ui/GooglePlacesInput.vue";
import {
  splitStoredPhone,
  toE164,
  isPhoneValidForCountry,
} from "@/utils/phone.js";

const { profile, displayName, initials, saveProfile, setAvatarPreview } = useUser();

const parsed = splitStoredPhone(profile.value.phone, profile.value.countryCode || "US");

const local = reactive({
  ...profile.value,
  countryCode: parsed.countryCode,
  phoneNational: parsed.national,
  location: profile.value.location || "",
});

const savedHint = ref("");

const countryOptions = countries.map((c) => ({
  value: c.code,
  label: `${c.name} (${c.dial})`,
  flag: flagEmojiFromIso2(c.code),
}));

function ensureOption(list, value) {
  const base = list.map((x) => ({ value: x, label: x }));
  if (value && !base.some((o) => o.value === value)) {
    return [{ value, label: value }, ...base];
  }
  return base;
}

const roleOptions = computed(() => ensureOption(profileOptions.roles, local.role));
const deptOptions = computed(() =>
  ensureOption(profileOptions.departments, local.department),
);
const managerOptions = computed(() =>
  ensureOption(profileOptions.managers, local.manager),
);

const activeDial = computed(() => {
  const c = countries.find((x) => x.code === local.countryCode);
  return c?.dial || "+";
});

const activeCountryName = computed(() => {
  const c = countries.find((x) => x.code === local.countryCode);
  return c?.name || "";
});

const activeFlag = computed(() => flagEmojiFromIso2(local.countryCode));

const phonePlaceholder = computed(() => {
  if (local.countryCode === "US") return "7185550142";
  if (local.countryCode === "GB") return "7700900123";
  return "National number";
});

const rules = computed(() => ({
  firstName: {
    required: helpers.withMessage("First name is required", required),
    minLength: helpers.withMessage("At least 1 character", minLength(1)),
  },
  lastName: {
    required: helpers.withMessage("Last name is required", required),
    minLength: helpers.withMessage("At least 1 character", minLength(1)),
  },
  email: {
    required: helpers.withMessage("Email is required", required),
    email: helpers.withMessage("Enter a valid email", email),
  },
  countryCode: {
    required: helpers.withMessage("Country is required", required),
  },
  phoneNational: {
    valid: helpers.withMessage(
      "Enter a valid phone number for the selected country (or leave blank)",
      (val) => isPhoneValidForCountry(val, local.countryCode),
    ),
  },
}));

const v$ = useVuelidate(rules, local);

function onSave() {
  v$.value.$touch();
  if (v$.value.$invalid) return;

  const e164 = toE164(local.phoneNational, local.countryCode);

  saveProfile({
    firstName: local.firstName,
    lastName: local.lastName,
    email: local.email,
    countryCode: local.countryCode,
    phone: e164 || "",
    role: local.role,
    department: local.department,
    location: local.location,
    manager: local.manager,
  });
  const nextPhone = splitStoredPhone(
    profile.value.phone,
    profile.value.countryCode || "US",
  );
  Object.assign(local, profile.value, {
    phoneNational: nextPhone.national,
  });
  savedHint.value = "Changes saved locally.";
  window.setTimeout(() => {
    savedHint.value = "";
  }, 3200);
  v$.value.$reset();
}

function onAvatar(e) {
  const file = e.target?.files?.[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") setAvatarPreview(reader.result);
  };
  reader.readAsDataURL(file);
  e.target.value = "";
}
</script>
