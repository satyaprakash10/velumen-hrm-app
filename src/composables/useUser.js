import { ref, computed, watch } from "vue";
import userData from "@/data/user.json";
import { authUser } from "@/composables/useAuth.js";
import { authStorageKey } from "@/utils/authStorageKey.js";

const STORAGE_BASE = "ess_user_profile_v1";

const profile = ref({ ...userData });

function splitName(full) {
  const s = String(full || "").trim();
  if (!s) return { first: "", last: "" };
  const parts = s.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function loadProfile() {
  if (!authUser.value?.id) {
    profile.value = { ...userData };
    return;
  }
  const key = authStorageKey(STORAGE_BASE);
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      profile.value = { ...userData, ...parsed };
      return;
    }
  } catch {
    /* ignore */
  }
  const { first, last } = splitName(authUser.value.name);
  profile.value = {
    ...userData,
    email: authUser.value.email || userData.email,
    firstName: first || userData.firstName,
    lastName: last || userData.lastName,
  };
}

loadProfile();

watch(
  () => authUser.value?.id,
  () => {
    loadProfile();
  },
);

export function useUser() {
  const displayName = computed(
    () => `${profile.value.firstName} ${profile.value.lastName}`.trim() || "Employee",
  );

  const initials = computed(() => {
    const f = profile.value.firstName?.[0] || "";
    const l = profile.value.lastName?.[0] || "";
    return (f + l).toUpperCase() || "E";
  });

  function saveProfile(partial) {
    profile.value = { ...profile.value, ...partial };
    if (!authUser.value?.id) return;
    try {
      localStorage.setItem(authStorageKey(STORAGE_BASE), JSON.stringify(profile.value));
    } catch {
      /* ignore */
    }
  }

  function setAvatarPreview(dataUrl) {
    profile.value = { ...profile.value, avatarUrl: dataUrl };
    if (!authUser.value?.id) return;
    try {
      localStorage.setItem(authStorageKey(STORAGE_BASE), JSON.stringify(profile.value));
    } catch {
      /* ignore */
    }
  }

  /**
   * Cover image sits behind the avatar on the profile page. Accepts a data
   * URL (from FileReader) or null/"" to clear. Stored in the same per-user
   * profile bucket so it survives reloads like the rest of the profile data.
   */
  function setCoverPreview(dataUrl) {
    const value = dataUrl || "";
    profile.value = { ...profile.value, coverUrl: value };
    if (!authUser.value?.id) return;
    try {
      localStorage.setItem(authStorageKey(STORAGE_BASE), JSON.stringify(profile.value));
    } catch {
      /* ignore */
    }
  }

  return {
    profile,
    displayName,
    initials,
    saveProfile,
    setAvatarPreview,
    setCoverPreview,
  };
}
