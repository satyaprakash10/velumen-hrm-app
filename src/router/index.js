import { createRouter, createWebHistory } from "vue-router";
import menuLinks from "@/data/menuLinks.json";
import MainLayout from "@/layouts/MainLayout.vue";
import { authUser, getEffectiveRole } from "@/composables/useAuth.js";
import { formatPageTitle } from "@/config/brand.js";

const viewModules = {
  dashboard: () => import("@/views/Dashboard.vue"),
  "my-payslips": () => import("@/views/MyPayslips.vue"),
  leaves: () => import("@/views/Leaves.vue"),
  "my-information": () => import("@/views/Profile.vue"),
  projects: () => import("@/views/Projects.vue"),
  "task-board": () => import("@/views/TaskBoard.vue"),
  timesheet: () => import("@/views/TimeEntry.vue"),
  benefits: () => import("@/views/Benefits.vue"),
  docs: () => import("@/views/Documents.vue"),
  orgchart: () => import("@/views/OrgChart.vue"),
  "my-team": () => import("@/views/MyTeam.vue"),
};

const fallbackView = () => import("@/views/PlaceholderView.vue");

function formatTitle(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const appChildren = menuLinks
  .filter((link) => link.enabled)
  .sort((a, b) => a.ordinal - b.ordinal)
  .map((link) => ({
    path: link.path,
    name: link.title,
    component: viewModules[link.path] || fallbackView,
    meta: {
      title: formatTitle(link.title),
      allowedRoles: link.allowedRoles || ["admin", "employee", "candidate"],
      requiresAuth: true,
    },
  }));

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/Login.vue"),
    meta: { guest: true, title: "Sign in" },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/Register.vue"),
    meta: { guest: true, title: "Register" },
  },
  {
    path: "/forgot-password",
    name: "forgot-password",
    component: () => import("@/views/auth/ForgotPassword.vue"),
    meta: { guest: true, title: "Forgot password" },
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: "/dashboard" },
      ...appChildren,
      {
        path: ":pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFound.vue"),
        meta: { title: "Not found", requiresAuth: true },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const authed = !!authUser.value;
  const needsAuth = to.matched.some((r) => r.meta.requiresAuth);
  const guestOnly = to.meta.guest === true;

  if (needsAuth && !authed) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }
  if (guestOnly && authed) {
    return "/dashboard";
  }

  const role = getEffectiveRole();
  if (authed && to.meta.allowedRoles && role && !to.meta.allowedRoles.includes(role)) {
    return { path: "/dashboard" };
  }

  const title = to.meta?.title;
  document.title = formatPageTitle(title);
});

export default router;
