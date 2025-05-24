import { ref } from "vue";
import { defineStore } from "pinia";

const getLocalStorageItem = (key, defaultValue) => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (e) {
    console.error(`Error accessing localStorage for ${key}:`, e);
    return defaultValue;
  }
};

const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`Error setting localStorage for ${key}:`, e);
  }
};

const removeLocalStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Error removing localStorage for ${key}:`, e);
  }
};

export const useMainStore = defineStore("main", () => {
  const locale = ref(getLocalStorageItem("locale", "gl"));
  const theme = ref(getLocalStorageItem("theme", "system"));

  const setLocale = (lang) => {
    locale.value = lang;
    setLocalStorageItem("locale", lang);
  };

  const setTheme = (newTheme) => {
    theme.value = newTheme;
    if (newTheme === "system") {
      removeLocalStorageItem("theme");
    } else {
      setLocalStorageItem("theme", newTheme);
    }
    applyTheme();
  };

  const applyTheme = () => {
    try {
      if (
        theme.value === "dark" ||
        (theme.value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Error applying theme:", e);
    }
  };

  return {
    locale,
    theme,
    setLocale,
    setTheme,
    applyTheme,
  };
});
