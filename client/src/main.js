import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
import { createI18nInstance } from "./i18n";
import { useMainStore } from "./stores/mainStore";

axios.defaults.withCredentials = true;

// Cierra la sesión del frontend cuando el backend indica que la sesión ya no es válida (401).
// El estado del frontend vive en localStorage y no expira por sí solo, así que sin esto
// la interfaz seguiría mostrando al usuario como conectado aunque la sesión del servidor
// haya caducado. No actúa sobre 403 (autenticado pero sin permisos).
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/api/auth/login") || url.includes("/api/auth/logout");
    const wasLoggedIn = Boolean(localStorage.getItem("auth_user"));

    if (status === 401 && !isAuthEndpoint && wasLoggedIn) {
      localStorage.removeItem("auth_user");
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

const initApp = async () => {
  try {
    const app = createApp(App);
    const pinia = createPinia();
    app.use(pinia);

    const mainStore = useMainStore();
    const i18n = await createI18nInstance(mainStore);

    mainStore.applyTheme();

    app.use(router);
    app.use(i18n);
    app.mount("#app");

    const preloader = document.getElementById("preloader");
    if (preloader) {
      setTimeout(() => {
        preloader.style.opacity = "0";
        preloader.style.transition = "opacity 0.5s ease";
        setTimeout(() => {
          preloader.style.display = "none";
        }, 500);
      }, 1400);
    }
  } catch (e) {
    console.error("Error initializing app:", e);
    const errorDiv = document.createElement("div");
    errorDiv.style.padding = "20px";
    errorDiv.style.color = "red";
    errorDiv.textContent = "Error cargando la aplicación. Por favor, inténtelo de nuevo.";
    document.body.appendChild(errorDiv);
  }
};

initApp();
