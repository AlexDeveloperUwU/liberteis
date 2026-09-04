import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { useAuthStore } from "./authStore";

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
  const authStore = useAuthStore();

  const locale = ref(authStore.user?.lang || getLocalStorageItem("locale", "gl"));
  const theme = ref(authStore.user?.theme || getLocalStorageItem("theme", "system"));
  const sidebarCollapsed = ref(getLocalStorageItem("sidebarCollapsed", "true") === "true");
  const version = ref(null);

  const setLocale = async (lang) => {
    locale.value = lang;
    setLocalStorageItem("locale", lang);

    if (authStore.isAuthenticated) {
      await authStore.updateUserProfile({ lang });
    }
  };

  const setTheme = async (newTheme) => {
    theme.value = newTheme;
    if (newTheme === "system") {
      removeLocalStorageItem("theme");
    } else {
      setLocalStorageItem("theme", newTheme);
    }

    if (authStore.isAuthenticated) {
      await authStore.updateUserProfile({ theme: newTheme });
    }

    applyTheme();
  };

  const setSidebarCollapsed = (collapsed) => {
    sidebarCollapsed.value = collapsed;
    setLocalStorageItem("sidebarCollapsed", collapsed.toString());
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

  const fetchVersion = async () => {
    if (version.value) return;
    try {
      const response = await fetch("/api/utils/version");
      const data = await response.json();

      if (data.success && data.data) {
        version.value = data.data.version || "N/A";
      } else {
        version.value = "N/A";
      }
    } catch (error) {
      console.error("Error fetching version:", error);
      version.value = "Error";
    }
  };

  applyTheme();

  watch(
    () => authStore.user,
    (newUser) => {
      if (newUser) {
        if (newUser.lang) locale.value = newUser.lang;
        if (newUser.theme) theme.value = newUser.theme;
        applyTheme();
      }
    },
    { immediate: true },
  );

  return {
    locale,
    theme,
    sidebarCollapsed,
    version,
    setLocale,
    setTheme,
    setSidebarCollapsed,
    fetchVersion,
    applyTheme,
  };
});
