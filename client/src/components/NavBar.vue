<template>
  <nav class="navbar fixed top-0 left-0 w-full z-50 bg-background-100 border-b-[1.5px] border-background-300 shadow-navbar">
    <div class="flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-3">
        <button
          v-if="currentLayout === 'dashboard'"
          @click="toggleSidebar"
          :aria-label="t('components.navbar.toggleSidebar')"
          class="flex items-center justify-center w-8 h-8 rounded-md bg-background-200 hover:bg-background-300 text-text-800 hover:shadow-md transition-all duration-200">
          <LucideMenu v-if="mainStore.sidebarCollapsed" />
          <LucideChevronLeft v-else />
        </button>
        <router-link
          to="/"
          class="text-xl font-semibold flex items-center gap-2 text-text-950 hover:text-primary-600 transition-colors">
          <CalendarClock class="text-primary-600" />
          <span class="font-display">{{ configStore.getConfigValue("appName", "EvenTeis") }}</span>
        </router-link>
      </div>

      <div class="flex items-center gap-4">
        <DropdownMenu :items="localeItems" width="8rem">
          <template #trigger>
            <button
              class="flex items-center gap-1 text-text-800 py-1 px-2 rounded bg-background-200 hover:bg-background-300 transition">
              <Languages class="h-5 w-5 text-primary-600" />
              <span class="text-sm text-text-800">{{ currentLanguageLabel }}</span>
              <ChevronDown class="h-4 w-4" aria-hidden="true" />
            </button>
          </template>
        </DropdownMenu>

        <DropdownMenu :items="userItems" width="12rem">
          <template #trigger>
            <button
              class="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-400 hover:border-primary-500 transition-colors flex items-center justify-center bg-primary-100 p-0">
              <div class="w-full h-full flex items-center justify-center text-primary-700 font-bold font-display">
                <template v-if="authStore.isAuthenticated">
                  {{ getUserInitial() }}
                </template>
                <User v-else class="h-4 w-4 text-primary-700" />
              </div>
            </button>
          </template>
        </DropdownMenu>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { CalendarClock, Languages, ChevronDown, Menu as LucideMenu, ChevronLeft as LucideChevronLeft, User } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useMainStore } from "../stores/mainStore";
import { useAuthStore } from "../stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { useRoute, useRouter } from "vue-router";
import { ensureLocaleLoaded } from "@/i18n";
import DropdownMenu from "./navigation/DropdownMenu.vue";

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["toggle-sidebar"]);

const route = useRoute();
const router = useRouter();

const currentLayout = computed(() => {
  return route.meta.layout || "default";
});

const { t, locale } = useI18n();
const mainStore = useMainStore();
const authStore = useAuthStore();
const configStore = useConfigStore();

const toggleSidebar = () => {
  emit("toggle-sidebar");
  mainStore.setSidebarCollapsed(!props.isCollapsed);
};

const setLocale = async (lang) => {
  await ensureLocaleLoaded(lang);
  locale.value = lang;
  mainStore.setLocale(lang);
};

const handleLogout = () => authStore.logout();

const handleLogin = () => {
  window.location.href = "/auth/login";
};

const navigateToConfig = () => router.push("/dash/config");

const currentLanguageLabel = computed(() => locale.value.toUpperCase());

const isDarkTheme = computed(() => {
  return (
    mainStore.theme === "dark" ||
    (mainStore.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
});

const toggleTheme = () => {
  mainStore.setTheme(isDarkTheme.value ? "light" : "dark");
};

const localeItems = computed(() => [
  { label: "English", selected: locale.value === "en", onClick: () => setLocale("en") },
  { label: "Español", selected: locale.value === "es", onClick: () => setLocale("es") },
  { label: "Galego", selected: locale.value === "gl", onClick: () => setLocale("gl") },
]);

const userItems = computed(() => {
  const items = [
    {
      label: isDarkTheme.value ? t("components.navbar.lightMode") : t("components.navbar.darkMode"),
      icon: isDarkTheme.value ? "sun" : "moon",
      onClick: toggleTheme,
    },
  ];
  if (authStore.isAuthenticated) {
    items.push(
      { label: t("components.navbar.settings"), icon: "settings", onClick: navigateToConfig },
      { label: t("components.navbar.logout"), icon: "log-out", tone: "danger", onClick: handleLogout },
    );
  } else {
    items.push({ label: t("components.navbar.login"), icon: "log-out", onClick: handleLogin });
  }
  return items;
});

onMounted(() => {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", mainStore.applyTheme);
});

onBeforeUnmount(() => {
  window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", mainStore.applyTheme);
});

const getUserInitial = () => {
  if (authStore.user?.name) {
    const nameParts = authStore.user.name.split(" ").filter((part) => part.length > 0);
    if (nameParts.length > 1) {
      return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  }
  return "U";
};
</script>

<style scoped>
.navbar {
  height: 3.5rem;
}
</style>
