import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import axios from "axios";

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
        beforeEnter: async (to) => {
          try {
            const metricsResponse = await axios.get("/api/bookings/count");

            to.meta.initialData = {
              metrics: metricsResponse.data.code === 200 ? metricsResponse.data.data : {},
            };
          } catch (error) {
            console.error("Error fetching data:", error.message || error);
          }
        },
      },
      {
        path: "users",
        name: "dashUsers",
        component: () => import("../views/Dash/UserTableView.vue"),
        meta: { allow: "normalUser", layout: "dashboard" },
        beforeEnter: async (to) => {
          try {
            const [metricsResponse, usersResponse] = await Promise.all([
              axios.get("/api/users/count"),
              axios.get("/api/users"),
            ]);

            to.meta.initialData = {
              metrics: metricsResponse.data.code === 200 ? metricsResponse.data.data : {},
              users: usersResponse.data.code === 200 ? usersResponse.data.data : [],
            };
          } catch (error) {
            console.error("Error fetching data:", error.message || error);
          }
        },
      },
      {
        path: "users/new",
        name: "dashUsersNew",
        component: () => import("../views/Dash/UserFormView.vue"),
        meta: { allow: "normalUser", layout: "dashboard" },
      },
      {
        path: "users/edit/:id",
        name: "dashUsersEdit",
        component: () => import("../views/Dash/UserFormView.vue"),
        meta: { allow: "normalUser", layout: "dashboard" },
        props: true,
        beforeEnter: async (to) => {
          try {
            const userId = to.params.id;
            const userResponse = await axios.get(`/api/users?id=${userId}`);

            to.meta.initialData = {
              user: userResponse.data.code === 200 ? userResponse.data.data : null,
            };
          } catch (error) {
            console.error("Error fetching user data:", error.message || error);
            to.meta.initialData = { user: null, error: true };
          }
        },
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
