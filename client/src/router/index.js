import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import { loadDashboardHomeData, loadUsersData, loadUserEditData } from "./fetchers";

const routes = [
  {
    path: "/",
    name: "index",
    component: () => import("../views/IndexView.vue"),
    meta: { allow: "any", layout: "default" },
  },

  {
    path: "/auth",
    meta: { allow: "any", layout: "auth" },
    children: [
      {
        path: "login",
        name: "authLogin",
        component: () => import("../views/Auth/LoginView.vue"),
        meta: { allow: "any", layout: "auth" },
      },
    ],
  },

  {
    path: "/dash",
    meta: { allow: "normalUser", layout: "dashboard" },
    children: [
      {
        path: "",
        name: "dashboard",
        redirect: "/dash/home",
      },
      {
        path: "home",
        name: "dashHome",
        component: () => import("../views/Dash/HomeView.vue"),
        meta: { allow: "normalUser", layout: "dashboard" },
        beforeEnter: loadDashboardHomeData,
      },

      {
        path: "users",
        name: "dashUsers",
        component: () => import("../views/Dash/UserTableView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        beforeEnter: loadUsersData,
      },
      {
        path: "users/new",
        name: "dashUsersNew",
        component: () => import("../views/Dash/UserFormView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
      },
      {
        path: "users/edit/:id",
        name: "dashUsersEdit",
        component: () => import("../views/Dash/UserFormView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        props: true,
        beforeEnter: loadUserEditData,
      },
    ],
  },

  {
    path: "/info",
    meta: { allow: "any", layout: "info" },
    children: [],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiredPermission = to.meta.allow;

  if (authStore.isAuthenticated) {
    const userExists = await authStore.verifyUserExists();
    if (!userExists) {
      return next({
        name: "authLogin",
        query: { message: "Tu sesión ha expirado porque el usuario ya no existe" },
      });
    }
  }

  if (to.path === "/" && authStore.isAuthenticated) {
    return next({ name: "dashHome" });
  }

  if (!requiredPermission || requiredPermission === "any") {
    return next();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: "authLogin",
      query: { redirect: to.fullPath },
    });
  }

  if (!hasPermission(authStore.userType, requiredPermission)) {
    return next({ name: "index" });
  }

  next();
});

export default router;
