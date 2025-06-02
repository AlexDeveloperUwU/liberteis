import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";

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
      {
        path: "register",
        name: "authRegister",
        component: () => import("../views/Auth/RegisterView.vue"),
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
      },
      {
        path: "users",
        name: "dashUsers",
        component: () => import("../views/Dash/UserTableView.vue"),
        meta: { allow: "normalUser", layout: "dashboard" },
      },
    ],
  },
  {
    path: "/info",
    meta: { allow: "any", layout: "info" },
    children: [
      /* 
      {
        path: "display",
        name: "infoDisplay",
        component: () => import("../views/Info/InfoDisplayView.vue"),
        meta: { allow: "any", layout: "info" },
      },
      {
        path: "planning",
        name: "infoPlanning",
        component: () => import("../views/Info/InfoPlanningView.vue"),
        meta: { allow: "any", layout: "info" },
      },
      {
        path: "event",
        name: "infoEvent",
        component: () => import("../views/Info/InfoEventView.vue"),
        meta: { allow: "any", layout: "info" },
      }
      */
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiredPermission = to.meta.allow;

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
    return next({ name: "home" });
  }

  next();
});

export default router;
