import { computed } from "vue";
import menuLinks from "@/data/menuLinks.json";
import teamMembers from "@/data/teamMembers.json";
import documents from "@/data/documents.json";
import leaves from "@/data/leaves.json";
import { useTaskBoard } from "@/composables/useTaskBoard.js";
import { useProjects } from "@/composables/useProjects.js";
import { notificationItems } from "@/composables/useNotificationCenter.js";

/**
 * Global search
 * ---------------------------------------------------------------------------
 * A tiny in-memory index that unions the relevant app data (pages, tasks,
 * projects, team, documents, leaves, notifications) behind a single query.
 *
 * The index is computed lazily from reactive sources, so results always
 * reflect the latest state (including newly created tasks, notifications,
 * etc.). Scoring is intentionally simple but good enough for a few hundred
 * rows: title matches > body matches > tag matches, with a prefix boost.
 */

function formatTitle(key) {
  return String(key || "")
    .split("_")
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        : w.toLowerCase(),
    )
    .join(" ");
}

const PAGE_ICON = `<svg viewBox="0 0 16 16" fill="none"><rect x="3.5" y="2.5" width="9" height="11" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M6 6h4M6 8.5h4M6 11h2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
const TASK_ICON = `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M5 7.5l1.8 1.8L11 5.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PROJECT_ICON = `<svg viewBox="0 0 16 16" fill="none"><path d="M2.5 5l5.5-3 5.5 3v6l-5.5 3-5.5-3V5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const TEAM_ICON = `<svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="2.5" stroke="currentColor" stroke-width="1.4"/><path d="M2 13c.4-2 2-3.2 4-3.2S9.6 11 10 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="11.5" cy="6.5" r="1.8" stroke="currentColor" stroke-width="1.3"/></svg>`;
const DOC_ICON = `<svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h5l3 3V13a.5.5 0 01-.5.5h-7A.5.5 0 014 13V2.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 2.5v3h3" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`;
const LEAVE_ICON = `<svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" stroke="currentColor" stroke-width="1.4"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`;
const BELL_ICON = `<svg viewBox="0 0 16 16" fill="none"><path d="M13.55 9.43C12.44 9.43 13.94 4.48 10 3.27 10 1.95 9.12 1 8 1S6 1.95 6 3.27C2.07 4.49 3.58 9.43 2.47 9.43 1.62 9.43 1 10.25 1 11.28S1.6 13 2.33 13h11.34C14.4 13 15 12.31 15 11.28s-.62-1.85-1.45-1.85z" stroke="currentColor" stroke-width="1.3"/></svg>`;

const TASK_COLUMN_TO_LABEL = {
  pending: "To do",
  in_progress: "In progress",
  review: "In review",
  done: "Done",
};

function score(q, ...fields) {
  if (!q) return 0;
  const needle = q.toLowerCase();
  let best = 0;
  for (let i = 0; i < fields.length; i += 1) {
    const val = String(fields[i] || "").toLowerCase();
    if (!val) continue;
    const idx = val.indexOf(needle);
    if (idx < 0) continue;
    const fieldWeight = [60, 34, 22, 12][i] ?? 6;
    let s = fieldWeight;
    if (idx === 0) s += 20;
    if (val === needle) s += 20;
    if (val.split(/\s+/).includes(needle)) s += 8;
    if (s > best) best = s;
  }
  return best;
}

export function useGlobalSearch() {
  const { tasks } = useTaskBoard();
  const { projects } = useProjects();

  const pages = menuLinks
    .filter((l) => l.enabled)
    .map((l) => ({
      id: `page-${l.path}`,
      type: "Page",
      title: formatTitle(l.title),
      body: `Jump to ${formatTitle(l.title)}`,
      to: `/${l.path}`,
      tags: [l.path, l.title],
      icon: PAGE_ICON,
      tone: "sky",
    }));

  const tasksIndex = computed(() =>
    tasks.value.map((t) => ({
      id: `task-${t.id}`,
      type: "Task",
      title: t.title,
      body: t.description || TASK_COLUMN_TO_LABEL[t.column] || "Task",
      to: `/task-board?task=${encodeURIComponent(t.id)}`,
      tags: [t.column, ...(t.tags || [])],
      meta: TASK_COLUMN_TO_LABEL[t.column] || t.column,
      icon: TASK_ICON,
      tone: "violet",
    })),
  );

  const projectsIndex = computed(() =>
    projects.value.map((p) => ({
      id: `proj-${p.id}`,
      type: "Project",
      title: p.name,
      body: p.description || p.code || "",
      to: `/projects`,
      tags: [p.code || "", p.id],
      meta: p.code || "",
      icon: PROJECT_ICON,
      tone: "amber",
    })),
  );

  const teamIndex = teamMembers.map((m) => ({
    id: `team-${m.id}`,
    type: "Team",
    title: m.name,
    body: `${m.role} · ${m.location || ""}`.trim().replace(/·\s*$/, ""),
    to: `/my-team`,
    tags: [m.email, m.reportsTo || ""],
    meta: m.role || "",
    icon: TEAM_ICON,
    tone: "emerald",
  }));

  const docsIndex = documents.map((d) => ({
    id: `doc-${d.id}`,
    type: "Document",
    title: d.name,
    body: `${d.category || "Document"}${d.confidential ? " · confidential" : ""}`,
    to: `/docs`,
    tags: [d.category || ""],
    meta: d.category || "",
    icon: DOC_ICON,
    tone: "slate",
  }));

  const leavesIndex = leaves.map((l) => ({
    id: `leave-${l.id}`,
    type: "Leave",
    title: `${l.type} · ${l.startDate} → ${l.endDate}`,
    body: l.reason || `${l.days} day${l.days === 1 ? "" : "s"} · ${l.status}`,
    to: `/leaves`,
    tags: [l.type, l.status],
    meta: l.status,
    icon: LEAVE_ICON,
    tone: "rose",
  }));

  const notificationsIndex = computed(() =>
    notificationItems.value.map((n) => ({
      id: `notif-${n.id}`,
      type: "Notification",
      title: n.title,
      body: n.body || "",
      to: n.to || "/activity",
      tags: [n.module, n.category, n.context?.event],
      meta: n.category,
      icon: BELL_ICON,
      tone: "indigo",
    })),
  );

  function search(query) {
    const q = String(query || "").trim();
    if (!q) return [];
    const needle = q.toLowerCase();

    const allGroups = [
      { label: "Pages", items: pages },
      { label: "Tasks", items: tasksIndex.value },
      { label: "Projects", items: projectsIndex.value },
      { label: "People", items: teamIndex },
      { label: "Documents", items: docsIndex },
      { label: "Leaves", items: leavesIndex },
      { label: "Notifications", items: notificationsIndex.value },
    ];

    const results = [];
    for (const group of allGroups) {
      for (const item of group.items) {
        const s = score(
          needle,
          item.title,
          item.body,
          (item.tags || []).join(" "),
          item.meta || "",
        );
        if (s > 0) results.push({ ...item, group: group.label, score: s });
      }
    }
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 40);
  }

  return { search };
}
