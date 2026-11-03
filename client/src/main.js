import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import { setUnauthorizedHandler } from "./utils/http";
import App from "./App.vue";
import router from "./router";
import { createI18nInstance } from "./i18n";
import { useMainStore } from "./stores/mainStore";
import { useAuthStore } from "./stores/authStore";

setUnauthorizedHandler((error) => {
  const url = error.config?.url || "";
  const isAuthEndpoint = url.includes("/api/auth/login") || url.includes("/api/auth/logout");
  const wasLoggedIn = Boolean(localStorage.getItem("auth_user"));

  if (!isAuthEndpoint && wasLoggedIn) {
    const authStore = useAuthStore();
    authStore.user = null;
    authStore.userVerified = false;
    localStorage.removeItem("auth_user");
    if (window.location.pathname !== "/error/401") {
      window.location.href = "/error/401";
    }
  }
});

const initApp = async () => {
  try {
    const app = createApp(App);
    const pinia = createPinia();
    app.use(pinia);

    const authStore = useAuthStore();
    await authStore.initSession();

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
