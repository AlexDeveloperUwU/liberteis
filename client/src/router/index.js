import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
    meta: { allow: "normalUser" },
  },
  {
    path: "/auth/register",
    name: "register",
    component: () => import("../views/RegisterView.vue"),
    meta: { allow: "any" },
  },
  {
    path: "/auth/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
    meta: { allow: "any" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiredPermission = to.meta.allow;

  if (!requiredPermission || requiredPermission === 'any') {
    return next();
  }

  if (!authStore.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath }  
    });
  }

  if (!hasPermission(authStore.userType, requiredPermission)) {
    return next({ name: 'home' });
  }

  next();
});

export default router;
