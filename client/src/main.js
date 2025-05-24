import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import axios from "axios";
import App from "./App.vue";
import router from "./router";
import { createI18nInstance } from "./i18n";
import { useMainStore } from "./stores/mainStore";

axios.defaults.withCredentials = true;

const initApp = () => {
  try {
    const app = createApp(App);
    const pinia = createPinia();
    app.use(pinia);

    const mainStore = useMainStore();
    const i18n = createI18nInstance(mainStore);

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
