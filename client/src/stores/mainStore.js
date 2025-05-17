import { ref } from "vue";
import { defineStore } from "pinia";

export const useMainStore = defineStore("main", () => {
  const locale = ref(localStorage.getItem("locale") || "gl");
  const theme = ref(localStorage.getItem("theme") || "system");

  const setLocale = (lang) => {
    locale.value = lang;
    localStorage.setItem("locale", lang);
  };

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    if (newTheme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", newTheme);
    }
    applyTheme();
  };

  const applyTheme = () => {
    if (theme.value === "dark" || 
       (theme.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return {
    locale,
    theme,
    setLocale,
    setTheme,
    applyTheme
  };
});
