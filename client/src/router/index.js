import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import axios from "axios";
import {
  loadDashboardHomeData,
  loadUsersData,
  loadUserEditData,
  loadUserConfigData,
  loadSpacesData,
  loadSpaceEditData,
  loadCategoriesData,
  loadCategoryEditData,
  loadEventsData,
} from "./fetchers";

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
      {
        path: "config",
        name: "dashUserConfig",
        component: () => import("../views/Dash/UserConfigView.vue"),
        meta: { 
          allow: "normalUser", 
          layout: "dashboard"
        },
        beforeEnter: loadUserConfigData,
      },

      {
        path: "spaces",
        name: "dashSpaces",
        component: () => import("../views/Dash/SpacesTableView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        beforeEnter: loadSpacesData,
      },
      {
        path: "spaces/new",
        name: "dashSpacesNew",
        component: () => import("../views/Dash/SpacesFormView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
      },
      {
        path: "spaces/edit/:id",
        name: "dashSpacesEdit",
        component: () => import("../views/Dash/SpacesFormView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        props: true,
        beforeEnter: loadSpaceEditData,
      },

      {
        path: "categories",
        name: "dashCategories",
        component: () => import("../views/Dash/CategoriesTableView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        beforeEnter: loadCategoriesData,
      },
      {
        path: "categories/new",
        name: "dashCategoriesNew",
        component: () => import("../views/Dash/CategoriesFormView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        beforeEnter: async (to) => {
          try {
            const spacesResponse = await axios.get("/api/spaces");
            to.meta.initialData = {
              spaces: spacesResponse.data.success ? spacesResponse.data.data : [],
              error: !spacesResponse.data.success,
              errorMessage: !spacesResponse.data.success ? spacesResponse.data.message : null,
            };
          } catch (error) {
            console.error("Error loading spaces:", error.message || error);
            to.meta.initialData = {
              spaces: [],
              error: true,
              errorMessage: "Error de conexión al cargar espacios disponibles",
            };
          }
        },
      },
      {
        path: "categories/edit/:id",
        name: "dashCategoriesEdit",
        component: () => import("../views/Dash/CategoriesFormView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        props: true,
        beforeEnter: loadCategoryEditData,
      },
      
      {
        path: "events",
        name: "dashEvents",
        component: () => import("../views/Dash/EventsTableView.vue"),
        meta: { allow: "managerUser", layout: "dashboard" },
        beforeEnter: loadEventsData,
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
