<template>
  <div class="relative min-h-full bg-page-bg px-4 py-6 dark:bg-slate-950 md:px-6 md:py-8">
    <div class="mx-auto max-w-[1600px]">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 class="page-title mb-1">Task board</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Drag cards between columns with touch or mouse; open the drawer to add or edit tasks. Data stays in this browser (demo).
          </p>
          <p v-if="filtersActive" class="mt-1 text-xs font-medium text-sky-700 dark:text-sky-300">
            Showing {{ filteredTasks.length }} of {{ tasks.length }} tasks
          </p>
        </div>
      </div>

      <div
        class="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200/90 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 xl:flex-row xl:flex-wrap xl:items-end"
      >
        <label class="min-w-0 flex-1 xl:max-w-sm">
          <span class="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Search</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Title, description, tags, project…"
            class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-950 dark:text-gray-100"
          />
        </label>
        <div class="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:max-w-4xl">
          <ListboxField v-model="filterColumn" label="Column" :options="columnFilterOptions" placeholder="All columns" />
          <ListboxField v-model="filterProjectId" label="Project" :options="projectFilterOptions" placeholder="All projects" />
          <ListboxField v-model="filterTag" label="Tag" :options="tagFilterOptions" placeholder="All tags" />
        </div>
        <button
          v-if="filtersActive"
          type="button"
          class="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          @click="clearTaskFilters"
        >
          Clear filters
        </button>
      </div>

      <div class="scrollbar-kit mt-8 overflow-x-auto pb-2">
        <div class="flex min-h-[min(70vh,720px)] gap-4 pb-2" style="min-width: min(100%, 1480px)">
          <section
            v-for="col in columns"
            :key="col.id"
            :data-task-column="col.id"
            class="task-column relative flex min-h-0 w-[min(100%,280px)] shrink-0 flex-col rounded-2xl border-2 bg-white/90 shadow-sm transition-colors duration-200 dark:bg-slate-900/90"
            :class="columnClasses(col.id)"
          >
            <header class="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
              <h2 class="text-sm font-semibold text-navy dark:text-slate-100">{{ col.title }}</h2>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ (filteredTasksByColumn[col.id] || []).length }} tasks</p>
            </header>
            <div
              class="scrollbar-kit flex min-h-0 max-h-[min(65vh,560px)] flex-1 flex-col gap-2 overflow-y-auto p-3"
            >
              <div class="flex flex-col gap-2">
                <article
                  v-for="t in filteredTasksByColumn[col.id] || []"
                  :key="t.id"
                  class="task-card group relative cursor-grab touch-manipulation rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sky-300 hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-950 dark:hover:border-sky-600"
                  :class="[
                    draggingId === t.id
                      ? 'task-card--slot border-dashed border-slate-300 opacity-40 dark:border-slate-600'
                      : 'transition-[box-shadow,border-color] duration-200 ease-out',
                  ]"
                  @pointerdown="onCardPointerDown($event, t, col.id)"
                >
                  <div class="absolute right-1 top-1 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100" @click.stop @pointerdown.stop>
                    <DropdownMenu
                      :aria-label="`Actions for ${t.title}`"
                      :items="cardMenuItems(t)"
                      placement="bottom-end"
                    />
                  </div>
                  <div
                    v-if="coverImage(t)"
                    class="-mx-3 -mt-3 mb-3 aspect-[16/9] overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      :src="coverImage(t)"
                      :alt="`${t.title} cover`"
                      class="h-full w-full object-cover"
                      loading="lazy"
                      draggable="false"
                    />
                  </div>
                  <p class="pr-8 text-sm font-medium text-gray-900 dark:text-gray-100">{{ t.title }}</p>
                  <p v-if="t.description" class="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                    {{ t.description }}
                  </p>
                  <p v-if="projectLabel(t.projectId)" class="mt-1 text-xs text-sky-700 dark:text-sky-300">
                    {{ projectLabel(t.projectId) }}
                  </p>
                  <div v-if="(t.tags || []).length" class="mt-2 flex flex-wrap gap-1">
                    <span
                      v-for="tag in t.tags"
                      :key="tag"
                      class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <div v-if="(t.comments || []).length || (t.attachments || []).length || (t.subtasks || []).length" class="mt-2 flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                    <span v-if="(t.comments || []).length" class="inline-flex items-center gap-1">
                      <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M2.5 4a1.5 1.5 0 011.5-1.5h8A1.5 1.5 0 0113.5 4v5A1.5 1.5 0 0112 10.5H6L3 13V4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
                      </svg>
                      {{ (t.comments || []).length }}
                    </span>
                    <span v-if="(t.attachments || []).length" class="inline-flex items-center gap-1">
                      <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M11 5.5l-5 5a2 2 0 102.8 2.8l6-6a3.4 3.4 0 10-4.8-4.8l-6 6a4.8 4.8 0 106.8 6.8L14 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      {{ (t.attachments || []).length }}
                    </span>
                    <span
                      v-if="(t.subtasks || []).length"
                      class="inline-flex items-center gap-1 tabular-nums"
                      :class="subtasksComplete(t) ? 'text-emerald-600 dark:text-emerald-400' : ''"
                    >
                      <svg class="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <rect x="2.5" y="3" width="11" height="3" rx="0.8" stroke="currentColor" stroke-width="1.4" />
                        <rect x="2.5" y="10" width="11" height="3" rx="0.8" stroke="currentColor" stroke-width="1.4" />
                        <path d="M4.6 4.5l0.9 0.9L7 3.9" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      {{ subtaskDoneCount(t) }}/{{ (t.subtasks || []).length }}
                    </span>
                  </div>
                  <div
                    v-if="timerTaskId === t.id && !timerIdle"
                    class="mt-2 flex flex-wrap items-center gap-2"
                    @click.stop
                    @pointerdown.stop
                  >
                    <span
                      class="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-semibold tabular-nums text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-100"
                    >
                      <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {{ timerFormatted }}
                    </span>
                    <button
                      v-if="timerRunning"
                      type="button"
                      class="rounded-lg border border-amber-300 bg-white px-2 py-1 text-[11px] font-semibold text-amber-950 shadow-sm transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/80 dark:text-amber-100 dark:hover:bg-amber-900/50"
                      @click="pauseTimer"
                    >
                      Pause
                    </button>
                    <button
                      v-else
                      type="button"
                      class="rounded-lg border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-900 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100 dark:hover:bg-emerald-900/40"
                      @click="resumeTimer"
                    >
                      Resume
                    </button>
                    <button
                      type="button"
                      class="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                      @click="resetTimer"
                    >
                      Reset
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <button
      type="button"
      class="fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#001738] text-white shadow-lg ring-2 ring-white/20 transition-[transform,box-shadow] duration-200 hover:scale-105 hover:bg-[#0a2540] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-400/50 dark:bg-sky-600 dark:hover:bg-sky-500"
      aria-label="Add task"
      @click="openCreateDrawer"
    >
      <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Backdrop + drawer -->
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      leave-active-class="transition-opacity duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-[90] bg-slate-900/40 backdrop-blur-[2px] dark:bg-black/50"
        aria-hidden="true"
        @click="closeDrawer"
      />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      leave-active-class="transition-transform duration-250 ease-in"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="drawerOpen"
        class="fixed inset-y-0 right-0 z-[95] flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="drawerTitleId"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 :id="drawerTitleId" class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {{ drawerMode === "edit" ? "Edit task" : "New task" }}
          </h2>
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Close"
            @click="closeDrawer"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form
          v-ess-scrollbar
          class="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4"
          @submit.prevent="saveDrawer"
        >
          <div class="space-y-4">
            <label class="block">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Title</span>
              <input
                v-model="draft.title"
                type="text"
                maxlength="200"
                :class="inputFieldClass(!!formErrors.title)"
                placeholder="Task title"
              />
              <p v-if="formErrors.title" class="mt-1 text-xs text-red-600">{{ formErrors.title }}</p>
            </label>
            <label class="block">
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Description</span>
              <textarea
                v-model="draft.description"
                rows="4"
                :class="inputFieldClass(!!formErrors.description)"
                class="resize-y"
                placeholder="What needs to be done?"
              />
              <p v-if="formErrors.description" class="mt-1 text-xs text-red-600">{{ formErrors.description }}</p>
            </label>
            <ListboxField
              v-model="draft.projectId"
              label="Project"
              :options="projectOptions"
              placeholder="No project"
              :invalid="!!formErrors.projectId"
            />
            <p v-if="formErrors.projectId" class="-mt-2 text-xs text-red-600">{{ formErrors.projectId }}</p>
            <ListboxField
              v-model="draft.column"
              label="Column"
              :options="columnOptions"
              placeholder="Column"
              :invalid="!!formErrors.column"
            />
            <p v-if="formErrors.column" class="-mt-2 text-xs text-red-600">{{ formErrors.column }}</p>
            <TagMultiPicker v-model="draft.tags" label="Tags" :suggested-tags="uniqueTags" hint="Type to search, Enter to add a tag. Optional." />

            <div>
              <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Attachments</span>
              <TaskAttachmentField v-model="draft.attachments" class="mt-1.5 block" />
            </div>

            <TaskSubtasks
              :items="draft.subtasks"
              @add="onDraftSubtaskAdd"
              @toggle="onDraftSubtaskToggle"
              @update="onDraftSubtaskUpdate"
              @remove="onDraftSubtaskRemove"
              @reorder="onDraftSubtaskReorder"
            />
          </div>
          <div class="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-6 dark:border-slate-800">
            <button type="submit" :class="btnPrimaryClass" class="inline-flex items-center gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ drawerMode === "edit" ? "Save changes" : "Create task" }}
            </button>
            <button type="button" :class="btnSecondaryClass" @click="closeDrawer">Cancel</button>
          </div>
        </form>
      </aside>
    </Transition>

    <ModalPanel v-model="detailOpen" :icon="TASK_MODAL_ICON" expandable>
      <template #title>{{ active?.title }}</template>
      <template #subtitle>
        <span v-if="active && projectLabel(active.projectId)">{{ projectLabel(active.projectId) }}</span>
      </template>
      <div class="space-y-4">
        <AttachmentGallery
          v-if="active && (active.attachments || []).length"
          :attachments="active.attachments"
        />
        <ExpandableText
          v-if="active?.description"
          :text="active.description"
        />
        <div v-if="(active?.tags || []).length" class="flex flex-wrap gap-1">
          <span
            v-for="tag in active.tags"
            :key="tag"
            class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {{ tag }}
          </span>
        </div>
        <TaskSubtasks
          v-if="active"
          :items="active.subtasks || []"
          @add="onDetailSubtaskAdd"
          @toggle="onDetailSubtaskToggle"
          @update="onDetailSubtaskUpdate"
          @remove="onDetailSubtaskRemove"
          @reorder="onDetailSubtaskReorder"
        />
        <div v-if="active">
          <label class="text-xs font-medium text-gray-600 dark:text-gray-400">Column</label>
          <ListboxField
            class="mt-1"
            :model-value="active.column"
            label=""
            :options="columnOptions"
            @update:modelValue="onDetailColumnChange"
          />
        </div>
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Comments</h3>
          <ul v-ess-scrollbar class="mt-2 max-h-48 space-y-2 overflow-y-auto">
            <li
              v-for="c in active?.comments || []"
              :key="c.id"
              class="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <p class="text-gray-900 dark:text-gray-100">{{ c.text }}</p>
              <p class="mt-1 text-[11px] text-gray-500">{{ c.author }} · {{ formatTime(c.at) }}</p>
            </li>
          </ul>
          <form class="mt-3 flex items-center gap-2" @submit.prevent="postComment">
            <input
              v-model="commentText"
              type="text"
              placeholder="Write a comment…"
              :class="inlineInputFieldClass(false)"
              class="min-w-0 flex-1"
            />
            <button type="submit" :class="btnPrimaryClass" class="inline-flex h-11 shrink-0 items-center gap-2 px-5">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Post
            </button>
          </form>
        </div>
        <div class="flex flex-wrap gap-2" @click.stop>
          <template v-if="active && timerTaskId === active.id && !timerIdle">
            <span class="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold tabular-nums text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
              <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ timerFormatted }}
            </span>
            <button
              v-if="timerRunning"
              type="button"
              :class="btnSecondaryClass"
              class="inline-flex items-center gap-2"
              @click="pauseTimer"
            >
              Pause
            </button>
            <button
              v-else
              type="button"
              :class="btnPrimaryClass"
              class="inline-flex items-center gap-2"
              @click="resumeTimer"
            >
              Resume
            </button>
            <button type="button" :class="btnSecondaryClass" @click="resetTimer">Reset</button>
          </template>
          <template v-else>
            <button type="button" :class="btnPrimaryClass" class="inline-flex items-center gap-2" @click="onTrackTimeFromDetail">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Track time
            </button>
          </template>
          <button type="button" :class="btnSecondaryClass" @click="openEditFromDetail">Edit in drawer</button>
        </div>
      </div>
    </ModalPanel>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Delete task?"
      :message="deleteTarget ? `Remove “${deleteTarget.title}”? This cannot be undone.` : ''"
      confirm-label="Delete"
      cancel-label="Cancel"
      variant="danger"
      @confirm="onDeleteConfirmed"
    />

    <!--
      Drag ghost — teleported out of the kanban scroll containers so the card
      floats above every column and never gets clipped by `overflow` rules.
      The in-place card remains as a dashed placeholder so other cards don't
      jump around while the user is mid-drag.
    -->
    <Teleport to="body">
      <transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-150 ease-in"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <article
          v-if="draggingTask"
          class="drag-ghost rounded-xl border border-sky-400 bg-white p-3 shadow-[0_30px_60px_rgba(56,189,248,0.38)] dark:border-sky-500 dark:bg-slate-950"
          :style="dragGhostStyle"
          aria-hidden="true"
        >
          <p class="pr-6 text-sm font-medium text-gray-900 dark:text-gray-100">
            {{ draggingTask.title }}
          </p>
          <p
            v-if="draggingTask.description"
            class="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400"
          >
            {{ draggingTask.description }}
          </p>
          <p
            v-if="projectLabel(draggingTask.projectId)"
            class="mt-1 text-xs text-sky-700 dark:text-sky-300"
          >
            {{ projectLabel(draggingTask.projectId) }}
          </p>
          <div
            v-if="(draggingTask.tags || []).length"
            class="mt-2 flex flex-wrap gap-1"
          >
            <span
              v-for="tag in draggingTask.tags"
              :key="tag"
              class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { reactive, ref, watch, useId, computed, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTaskBoard } from "@/composables/useTaskBoard.js";
import { useProjects } from "@/composables/useProjects.js";
import { useToast } from "@/composables/useToast.js";
import { useTimeTracker } from "@/composables/useTimeTracker.js";
import { inputFieldClass, inlineInputFieldClass, btnPrimaryClass, btnSecondaryClass } from "@/utils/formFieldClasses.js";
import ModalPanel from "@/components/ui/ModalPanel.vue";
import ConfirmDialog from "@/components/ui/ConfirmDialog.vue";
import DropdownMenu from "@/components/ui/DropdownMenu.vue";
import ListboxField from "@/components/ui/ListboxField.vue";
import TagMultiPicker from "@/components/ui/TagMultiPicker.vue";
import TaskAttachmentField from "@/components/ui/TaskAttachmentField.vue";
import AttachmentGallery from "@/components/ui/AttachmentGallery.vue";
import TaskSubtasks from "@/components/ui/TaskSubtasks.vue";
import ExpandableText from "@/components/ui/ExpandableText.vue";

const route = useRoute();
const router = useRouter();

const {
  columns,
  tasks,
  getById,
  addTask,
  updateTask,
  moveTask,
  addComment,
  removeTask,
  cloneTask,
  addSubtask,
  updateSubtask,
  removeSubtask,
  reorderSubtasks,
} = useTaskBoard();
const { projects, findById } = useProjects();
const toast = useToast();
const {
  reset: resetTimer,
  setProjectName: setTimerProject,
  start: startTimer,
  pause: pauseTimer,
  resume: resumeTimer,
  minimized: timerMinimized,
  setActiveTaskId,
  running: timerRunning,
  activeTaskId: timerTaskId,
  formatted: timerFormatted,
  isIdle: timerIdle,
} = useTimeTracker();

const drawerTitleId = useId();

const TASK_MODAL_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" class="h-full w-full"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 10l2 2 4-4"/></svg>`;

const draggingId = ref(null);
const dragOverColId = ref(null);
const dragOffset = ref({ x: 0, y: 0 });
// Captured once at drag start — the original card's viewport position & size.
// The ghost clone (teleported to <body>) uses this as its anchor so it floats
// above columns regardless of their overflow clipping rules.
const dragOrigin = ref({ left: 0, top: 0, width: 0, height: 0 });

const draggingTask = computed(() =>
  draggingId.value ? getById(draggingId.value) : null,
);

const dragGhostStyle = computed(() => {
  if (!draggingId.value) return null;
  const { left, top, width, height } = dragOrigin.value;
  const { x, y } = dragOffset.value;
  return {
    position: "fixed",
    left: `${left + x}px`,
    top: `${top + y}px`,
    width: `${width}px`,
    height: `${height}px`,
    pointerEvents: "none",
    zIndex: 9999,
    willChange: "transform",
  };
});

const drawerOpen = ref(false);
const drawerMode = ref("create");
const editingId = ref(null);

const draft = reactive({
  title: "",
  description: "",
  projectId: "",
  column: "pending",
  tags: [],
  attachments: [],
  subtasks: [],
});

const formErrors = reactive({
  title: "",
  description: "",
  projectId: "",
  column: "",
});

const detailOpen = ref(false);
const active = ref(null);
const commentText = ref("");

const deleteOpen = ref(false);
const deleteTarget = ref(null);

/** Suppress opening detail when finishing a drag. */
const ignoreCardOpen = ref(false);

const DRAG_THRESHOLD_PX = 12;
let cardPointerSession = null;

/**
 * Lightweight column feedback: default neutral border, a soft
 * idle-drop indication while any card is being dragged, and a clear sky
 * border on the column directly under the pointer. Keeps the visual noise
 * off the column body so the moving card stays the focus.
 */
function columnClasses(id) {
  const dragging = draggingId.value != null;
  const isTarget = dragOverColId.value === id;
  if (isTarget) {
    return "border-sky-400 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.35)] dark:border-sky-500";
  }
  if (dragging) {
    return "border-slate-200/70 border-dashed dark:border-slate-700";
  }
  return "border-transparent dark:border-transparent";
}

function resolveColumnFromPoint(clientX, clientY) {
  if (typeof document === "undefined" || !document.elementsFromPoint) return null;
  const stack = document.elementsFromPoint(clientX, clientY);
  if (!stack?.length) return null;
  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    const col = el.closest?.("[data-task-column]");
    if (col) {
      const id = col.getAttribute("data-task-column");
      if (id) return id;
    }
  }
  return null;
}

function clearCardPointerListeners() {
  if (!cardPointerSession) return;
  window.removeEventListener("pointermove", cardPointerSession.move);
  window.removeEventListener("pointerup", cardPointerSession.up);
  window.removeEventListener("pointercancel", cardPointerSession.up);
  cardPointerSession = null;
}

function onCardPointerDown(e, t, colId) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  const el = e.target;
  if (el instanceof Element) {
    if (el.closest("button, a, input, textarea, select, [data-dropdown-menu], [role='menu']")) return;
  }

  clearCardPointerListeners();
  const cardEl = e.currentTarget;
  const startX = e.clientX;
  const startY = e.clientY;

  function move(ev) {
    if (!cardPointerSession || ev.pointerId !== cardPointerSession.pointerId) return;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!cardPointerSession.moved && Math.hypot(dx, dy) <= DRAG_THRESHOLD_PX) return;
    if (!cardPointerSession.moved) {
      cardPointerSession.moved = true;
      // Snapshot the original card rect *before* the in-place card becomes a
      // semi-transparent slot, so the ghost clone can float right where the
      // user picked it up.
      const rect = cardEl.getBoundingClientRect();
      dragOrigin.value = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
      draggingId.value = cardPointerSession.taskId;
      ignoreCardOpen.value = true;
      try {
        cardEl.setPointerCapture(ev.pointerId);
      } catch {
        /* ignore */
      }
    }
    dragOffset.value = { x: dx, y: dy };
    dragOverColId.value = resolveColumnFromPoint(ev.clientX, ev.clientY);
    if (ev.pointerType === "touch") ev.preventDefault();
  }

  function up(ev) {
    if (!cardPointerSession || ev.pointerId !== cardPointerSession.pointerId) return;
    const session = cardPointerSession;
    clearCardPointerListeners();
    try {
      cardEl.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }

    if (session.moved) {
      const dropCol = resolveColumnFromPoint(ev.clientX, ev.clientY) ?? dragOverColId.value;
      if (dropCol && session.taskId && dropCol !== session.fromCol) {
        moveTask(session.taskId, dropCol);
      }
      draggingId.value = null;
      dragOverColId.value = null;
      dragOffset.value = { x: 0, y: 0 };
      dragOrigin.value = { left: 0, top: 0, width: 0, height: 0 };
      window.setTimeout(() => {
        ignoreCardOpen.value = false;
      }, 120);
    } else {
      const task = getById(session.taskId);
      if (task && !ignoreCardOpen.value) openView(task);
    }
  }

  cardPointerSession = {
    taskId: t.id,
    fromCol: colId,
    pointerId: e.pointerId,
    moved: false,
    move,
    up,
  };

  window.addEventListener("pointermove", move, { passive: false });
  window.addEventListener("pointerup", up);
  window.addEventListener("pointercancel", up);
}

onUnmounted(() => {
  clearCardPointerListeners();
  draggingId.value = null;
  dragOverColId.value = null;
  dragOffset.value = { x: 0, y: 0 };
  dragOrigin.value = { left: 0, top: 0, width: 0, height: 0 };
});

const searchQuery = ref("");
const filterColumn = ref("");
const filterProjectId = ref("");
const filterTag = ref("");

const columnFilterOptions = computed(() => [
  { value: "", label: "All columns" },
  ...columns.map((c) => ({ value: c.id, label: c.title })),
]);

const projectFilterOptions = computed(() => [
  { value: "", label: "All projects" },
  ...projects.value.map((p) => ({ value: p.id, label: p.name })),
]);

const uniqueTags = computed(() => {
  const s = new Set();
  for (const t of tasks.value) {
    for (const x of t.tags || []) {
      if (x) s.add(x);
    }
  }
  return [...s].sort((a, b) => a.localeCompare(b));
});

const tagFilterOptions = computed(() => [
  { value: "", label: "All tags" },
  ...uniqueTags.value.map((tag) => ({ value: tag, label: tag })),
]);

const filtersActive = computed(
  () =>
    Boolean(searchQuery.value.trim()) ||
    Boolean(filterColumn.value) ||
    Boolean(filterProjectId.value) ||
    Boolean(filterTag.value),
);

const filteredTasks = computed(() => {
  let list = tasks.value;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter((t) => {
      const title = (t.title || "").toLowerCase();
      const desc = (t.description || "").toLowerCase();
      const tags = (t.tags || []).join(" ").toLowerCase();
      const proj = (t.projectId ? findById(t.projectId)?.name || "" : "").toLowerCase();
      return title.includes(q) || desc.includes(q) || tags.includes(q) || proj.includes(q);
    });
  }
  if (filterColumn.value) list = list.filter((t) => t.column === filterColumn.value);
  if (filterProjectId.value) list = list.filter((t) => t.projectId === filterProjectId.value);
  if (filterTag.value) list = list.filter((t) => (t.tags || []).includes(filterTag.value));
  return list;
});

const filteredTasksByColumn = computed(() => {
  const map = Object.fromEntries(columns.map((c) => [c.id, []]));
  for (const t of filteredTasks.value) {
    const col = columns.some((c) => c.id === t.column) ? t.column : "pending";
    map[col].push(t);
  }
  return map;
});

function clearTaskFilters() {
  searchQuery.value = "";
  filterColumn.value = "";
  filterProjectId.value = "";
  filterTag.value = "";
}

const projectOptions = computed(() => [
  { value: "", label: "No project" },
  ...projects.value.map((p) => ({ value: p.id, label: p.name })),
]);

const columnOptions = computed(() => columns.map((c) => ({ value: c.id, label: c.title })));

function projectLabel(id) {
  if (!id) return "";
  return findById(id)?.name || "";
}

/* ------------------------------------------------------------------- *
 *  Subtask handlers
 *  - *Draft* handlers mutate the in-drawer draft, committed on Save.
 *  - *Detail* handlers act on the store immediately for inline edits in
 *    the read-only detail modal.
 * ------------------------------------------------------------------- */

function makeSubtaskId() {
  return `st-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function onDraftSubtaskAdd(title) {
  const trimmed = String(title || "").trim();
  if (!trimmed) return;
  draft.subtasks = [
    ...draft.subtasks,
    {
      id: makeSubtaskId(),
      title: trimmed,
      done: false,
      createdAt: new Date().toISOString(),
    },
  ];
}

function onDraftSubtaskToggle({ id, done }) {
  draft.subtasks = draft.subtasks.map((s) =>
    s.id === id ? { ...s, done: Boolean(done) } : s,
  );
}

function onDraftSubtaskUpdate({ id, title }) {
  const trimmed = String(title || "").trim();
  if (!trimmed) return;
  draft.subtasks = draft.subtasks.map((s) =>
    s.id === id ? { ...s, title: trimmed } : s,
  );
}

function onDraftSubtaskRemove({ id }) {
  draft.subtasks = draft.subtasks.filter((s) => s.id !== id);
}

function onDraftSubtaskReorder({ fromIndex, toIndex }) {
  const list = [...draft.subtasks];
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return;
  }
  const [moved] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, moved);
  draft.subtasks = list;
}

function onDetailSubtaskAdd(title) {
  if (!active.value) return;
  addSubtask(active.value.id, title);
  refreshActive();
}
function onDetailSubtaskToggle({ id, done }) {
  if (!active.value) return;
  updateSubtask(active.value.id, id, { done });
  refreshActive();
}
function onDetailSubtaskUpdate({ id, title }) {
  if (!active.value) return;
  updateSubtask(active.value.id, id, { title });
  refreshActive();
}
function onDetailSubtaskRemove({ id }) {
  if (!active.value) return;
  removeSubtask(active.value.id, id);
  refreshActive();
}
function onDetailSubtaskReorder({ fromIndex, toIndex }) {
  if (!active.value) return;
  reorderSubtasks(active.value.id, fromIndex, toIndex);
  refreshActive();
}

function refreshActive() {
  if (!active.value) return;
  const fresh = getById(active.value.id);
  if (fresh) active.value = fresh;
}

function subtaskDoneCount(t) {
  return (t?.subtasks || []).filter((s) => s.done).length;
}

function subtasksComplete(t) {
  const list = t?.subtasks || [];
  return list.length > 0 && list.every((s) => s.done);
}

/**
 * First image attachment becomes the card's cover photo. Non-image
 * attachments (PDFs etc.) don't show on the card — they live in the detail
 * modal's gallery instead.
 */
function coverImage(t) {
  const atts = t?.attachments || [];
  for (const a of atts) {
    if (typeof a?.type === "string" && a.type.startsWith("image/") && a.dataUrl) {
      return a.dataUrl;
    }
  }
  return null;
}

function resetFormErrors() {
  formErrors.title = "";
  formErrors.description = "";
  formErrors.projectId = "";
  formErrors.column = "";
}

function validateDrawer() {
  resetFormErrors();
  let ok = true;
  const title = draft.title.trim();
  if (title.length < 2) {
    formErrors.title = "Enter a title (at least 2 characters).";
    ok = false;
  }
  if (draft.description.length > 2000) {
    formErrors.description = "Description must be 2000 characters or less.";
    ok = false;
  }
  const colIds = new Set(columns.map((c) => c.id));
  if (!colIds.has(draft.column)) {
    formErrors.column = "Pick a valid column.";
    ok = false;
  }
  if (draft.projectId && !findById(draft.projectId)) {
    formErrors.projectId = "Selected project is no longer available.";
    ok = false;
  }
  return ok;
}

function openCreateDrawer() {
  drawerMode.value = "create";
  editingId.value = null;
  draft.title = "";
  draft.description = "";
  draft.projectId = "";
  draft.column = "pending";
  draft.tags = [];
  draft.attachments = [];
  draft.subtasks = [];
  resetFormErrors();
  drawerOpen.value = true;
}

function openEditDrawer(t) {
  drawerMode.value = "edit";
  editingId.value = t.id;
  draft.title = t.title;
  draft.description = t.description || "";
  draft.projectId = t.projectId || "";
  draft.column = t.column || "pending";
  draft.tags = [...(t.tags || [])];
  draft.attachments = (t.attachments || []).map((a) => ({ ...a }));
  draft.subtasks = (t.subtasks || []).map((s) => ({ ...s }));
  resetFormErrors();
  drawerOpen.value = true;
  detailOpen.value = false;
}

function closeDrawer() {
  drawerOpen.value = false;
}

function saveDrawer() {
  if (!validateDrawer()) return;
  const payload = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    projectId: draft.projectId || "",
    column: draft.column,
    tags: [...draft.tags],
    attachments: draft.attachments.map((a) => ({ ...a })),
    subtasks: draft.subtasks.map((s) => ({ ...s })),
  };
  if (drawerMode.value === "edit" && editingId.value) {
    updateTask(editingId.value, payload);
    toast.success("Task updated.", { module: "tasks", action: "update" });
  } else {
    addTask(payload);
    toast.success("Task created.", { module: "tasks", action: "create" });
  }
  drawerOpen.value = false;
}

function openView(t) {
  if (ignoreCardOpen.value) return;
  active.value = getById(t.id) || t;
  commentText.value = "";
  detailOpen.value = true;
  router.replace({ query: { ...route.query, task: t.id } });
}

function openEditFromDetail() {
  if (!active.value) return;
  openEditDrawer(active.value);
}

function trackTimeForTask(t) {
  if (!t) return;
  const title = (t.title || "").trim() || "Task";
  const proj = t.projectId ? findById(t.projectId)?.name?.trim() : "";
  resetTimer();
  setTimerProject(proj || "Work");
  setActiveTaskId(t.id);
  timerMinimized.value = false;
  startTimer(title);
  toast.success("Timer started with this task.", { module: "tasks", action: "timer" });
}

function onTrackTimeFromDetail() {
  if (!active.value) return;
  trackTimeForTask(active.value);
}

function onDetailColumnChange(col) {
  if (!active.value) return;
  moveTask(active.value.id, col);
  active.value = getById(active.value.id) || active.value;
}

function postComment() {
  if (!active.value) return;
  const text = commentText.value.trim();
  if (!text) return;
  addComment(active.value.id, text);
  commentText.value = "";
  active.value = getById(active.value.id) || active.value;
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function taskShareUrl(id) {
  const path = router.resolve({ path: "/task-board", query: { task: id } }).href;
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${path}`;
  }
  return path;
}

async function copyTaskUrl(id) {
  const url = taskShareUrl(id);
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Task link copied.", { module: "tasks", action: "copy" });
  } catch {
    toast.push("Could not copy link.", "info", { module: "tasks" });
  }
}

function cardMenuItems(t) {
  return [
    {
      label: "View",
      icon: "eye",
      action: () => openView(t),
    },
    {
      label: "Edit",
      icon: "pencil",
      action: () => openEditDrawer(t),
    },
    {
      label: "Track time",
      icon: "timer",
      action: () => trackTimeForTask(t),
    },
    {
      label: "Mark as complete",
      icon: "check",
      action: () => {
        moveTask(t.id, "done");
        toast.success("Marked complete.", { module: "tasks", action: "complete" });
      },
    },
    {
      label: "Copy task URL",
      icon: "link",
      action: () => copyTaskUrl(t.id),
    },
    {
      label: "Clone task",
      icon: "duplicate",
      action: () => {
        const row = cloneTask(t.id);
        if (row) toast.success("Task cloned.", { module: "tasks", action: "clone" });
      },
    },
    { divider: true },
    {
      label: "Delete",
      danger: true,
      icon: "trash",
      action: () => {
        deleteTarget.value = t;
        deleteOpen.value = true;
      },
    },
  ];
}

function onDeleteConfirmed() {
  const t = deleteTarget.value;
  deleteTarget.value = null;
  if (!t) return;
  removeTask(t.id);
  if (active.value?.id === t.id) {
    detailOpen.value = false;
    active.value = null;
    const q = { ...route.query };
    delete q.task;
    router.replace({ query: q });
  }
  toast.push("Task removed.", "info", { module: "tasks", action: "delete" });
}

watch(
  () => route.query.task,
  (tid) => {
    if (!tid || typeof tid !== "string") return;
    const t = getById(tid);
    if (!t) {
      detailOpen.value = false;
      active.value = null;
      return;
    }
    if (drawerOpen.value) return;
    active.value = t;
    commentText.value = "";
    detailOpen.value = true;
  },
  { immediate: true },
);

watch(detailOpen, (open) => {
  if (!open && route.query.task) {
    const q = { ...route.query };
    delete q.task;
    router.replace({ query: q });
  }
});
</script>

<style scoped>
/*
 * The in-place card is replaced with a dashed slot so siblings don't shift
 * while the user is dragging. The actual moving card is a teleported ghost
 * clone (see the Teleport block above) which renders above every column and
 * never gets clipped by a scroll container's overflow rules.
 */
.task-card--slot {
  cursor: grabbing;
  transition:
    opacity 0.12s ease,
    border-color 0.12s ease;
}

.task-column {
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}
</style>

<style>
/* Unscoped so the Teleport-rendered ghost inherits the rotation + cursor. */
.drag-ghost {
  transform: rotate(-1.8deg);
  cursor: grabbing;
  transition:
    transform 0.12s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.18s ease;
  backface-visibility: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .task-card--slot,
  .task-column,
  .drag-ghost {
    transition: none !important;
    transform: none !important;
  }
}
</style>
