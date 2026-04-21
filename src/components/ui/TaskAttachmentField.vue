<template>
  <div class="space-y-3">
    <label
      ref="dropzoneRef"
      class="group relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-slate-400 hover:bg-slate-100 focus-within:border-slate-400 focus-within:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-slate-500 dark:hover:bg-slate-900"
      :class="dragActive ? 'accent-border accent-soft' : ''"
      @dragenter.prevent="dragActive = true"
      @dragover.prevent="dragActive = true"
      @dragleave.prevent="dragActive = false"
      @drop.prevent="onDrop"
    >
      <span
        class="flex h-10 w-10 items-center justify-center rounded-xl accent-soft"
        aria-hidden="true"
      >
        <svg v-if="!busy" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v12m-4-4l4 4 4-4" />
          <path stroke-linecap="round" d="M4 20h16" />
        </svg>
        <svg v-else class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity="0.25" />
          <path stroke-linecap="round" stroke="currentColor" stroke-width="2" d="M21 12a9 9 0 00-9-9" />
        </svg>
      </span>
      <span class="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
        {{ busy ? "Processing…" : dragActive ? "Drop to attach" : "Drag & drop or click to attach" }}
      </span>
      <span class="text-[11px] text-slate-500 dark:text-slate-400">
        Images or PDFs · up to {{ prettyMax }} each · {{ maxFiles }} files max
      </span>
      <input
        ref="inputRef"
        type="file"
        class="sr-only"
        :multiple="maxFiles > 1"
        :accept="acceptAttr"
        @change="onInputChange"
      />
    </label>

    <p
      v-if="error"
      class="flex items-center gap-1.5 text-[11.5px] text-rose-600 dark:text-rose-300"
      role="alert"
    >
      <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.6" />
        <path d="M8 5v3.4M8 10.5v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      </svg>
      {{ error }}
    </p>

    <ul
      v-if="modelValue.length"
      class="grid grid-cols-2 gap-2 sm:grid-cols-3"
      aria-label="Task attachments"
    >
      <li
        v-for="att in modelValue"
        :key="att.id"
        class="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
      >
        <div class="flex aspect-square items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img
            v-if="isImage(att)"
            :src="att.dataUrl"
            :alt="att.name"
            class="h-full w-full object-cover"
            loading="lazy"
            draggable="false"
          />
          <div v-else class="flex flex-col items-center gap-1.5 p-3 text-slate-500 dark:text-slate-300">
            <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8l-5-5z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v5h5" />
            </svg>
            <span class="text-[10px] font-semibold uppercase tracking-wider">
              {{ extensionOf(att) }}
            </span>
          </div>
        </div>
        <div class="flex items-center justify-between gap-1 px-2 py-1.5">
          <span class="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700 dark:text-slate-200">
            {{ att.name }}
          </span>
          <span class="shrink-0 text-[10px] font-medium tabular-nums text-slate-400">
            {{ prettySize(att.size) }}
          </span>
        </div>
        <button
          type="button"
          class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-slate-900/60 text-white opacity-0 shadow-sm transition hover:bg-rose-600 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          :aria-label="`Remove ${att.name}`"
          @click="remove(att.id)"
        >
          <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  accept: { type: Array, default: () => ["image/*", "application/pdf"] },
  maxFiles: { type: Number, default: 6 },
  maxBytes: { type: Number, default: 5 * 1024 * 1024 },
});

const emit = defineEmits(["update:modelValue"]);

const inputRef = ref(null);
const dropzoneRef = ref(null);
const dragActive = ref(false);
const busy = ref(false);
const error = ref("");

const acceptAttr = computed(() => props.accept.join(","));
const prettyMax = computed(() => prettySize(props.maxBytes));

function prettySize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

function isImage(att) {
  return typeof att?.type === "string" && att.type.startsWith("image/");
}

function extensionOf(att) {
  const name = String(att?.name || "").toLowerCase();
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "FILE";
  return name.slice(idx + 1, idx + 6).toUpperCase() || "FILE";
}

/**
 * Strip the filename of anything that could confuse downstream rendering or
 * disk naming. Keeps it safe to round-trip through JSON / HTML / download
 * attributes without surprises.
 */
function sanitizeName(name) {
  return String(name || "attachment")
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]+/g, " ")
    .trim()
    .slice(0, 120) || "attachment";
}

function mimeAllowed(type) {
  if (!props.accept?.length) return true;
  return props.accept.some((rule) => {
    if (rule.endsWith("/*")) {
      return type.startsWith(rule.slice(0, -1));
    }
    return rule === type;
  });
}

function randomId() {
  return `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Read failed"));
    reader.readAsDataURL(file);
  });
}

async function addFiles(list) {
  error.value = "";
  const files = Array.from(list || []);
  if (!files.length) return;
  if (props.modelValue.length + files.length > props.maxFiles) {
    error.value = `You can attach at most ${props.maxFiles} files.`;
    return;
  }

  busy.value = true;
  try {
    const accepted = [];
    for (const file of files) {
      if (!mimeAllowed(file.type)) {
        error.value = `"${file.name}" has an unsupported file type.`;
        continue;
      }
      if (file.size > props.maxBytes) {
        error.value = `"${file.name}" is over the ${prettyMax.value} limit.`;
        continue;
      }
      // Data URLs are safe to persist as JSON and safe to render via <img>
      // src. We never eval or innerHTML the bytes, so the stored value can't
      // execute as code on re-hydration.
      const dataUrl = await readFile(file);
      accepted.push({
        id: randomId(),
        name: sanitizeName(file.name),
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
        createdAt: new Date().toISOString(),
      });
    }
    if (accepted.length) {
      emit("update:modelValue", [...props.modelValue, ...accepted]);
    }
  } finally {
    busy.value = false;
    if (inputRef.value) inputRef.value.value = "";
  }
}

function onInputChange(e) {
  const files = e.target?.files;
  if (files?.length) addFiles(files);
}

function onDrop(e) {
  dragActive.value = false;
  const files = e.dataTransfer?.files;
  if (files?.length) addFiles(files);
}

function remove(id) {
  emit(
    "update:modelValue",
    props.modelValue.filter((a) => a.id !== id),
  );
}
</script>
