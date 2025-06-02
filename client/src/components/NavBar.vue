<template>
  <nav class="navbar fixed top-0 left-0 w-full z-50 bg-background-100 border-b-[1.5px] border-background-300">
    <div class="flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-3">
        <button
          v-if="currentLayout === 'dashboard'"
          @click="toggleSidebar"
          class="flex items-center justify-center w-8 h-8 rounded-md bg-background-200 hover:bg-background-300 text-text-800 hover:shadow-md transition-all duration-200">
          <LucideMenu v-if="mainStore.sidebarCollapsed" />
          <LucideChevronLeft v-else />
        </button>
        <div class="text-xl font-semibold flex items-center gap-2 text-text-950">
          <CalendarClock class="text-primary-600" />
          <span class="k2d">{{ configStore.getConfigValue("appName", "EvenTeis") }}</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton
              class="flex items-center gap-1 text-text-800 py-1 px-2 rounded bg-background-200 hover:bg-background-300 transition">
              <Languages class="h-5 w-5 text-primary-600" />
              <span class="text-sm text-text-800">{{ currentLanguageLabel }}</span>
              <ChevronDown class="h-4 w-4" aria-hidden="true" />
            </MenuButton>
          </div>

          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <MenuItems
              class="absolute right-0 mt-3 w-32 origin-top-right rounded-md bg-background-100 border-[1.5px] border-background-300 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] ring-1 ring-black/5 focus:outline-none">
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="setLocale('en')"
                    class="block w-full text-left px-4 py-2 text-sm transition-all duration-150 border-l-[3px] border-transparent"
                    :class="[
                      locale === 'en'
                        ? 'bg-primary-100 border-l-primary-500 font-medium text-primary-700'
                        : active
                          ? 'border-l-primary-400 text-primary-600 bg-primary-50'
                          : 'text-text-800 hover:bg-primary-100 hover:text-primary-600 hover:border-l-primary-300',
                    ]">
                    English
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="setLocale('es')"
                    class="block w-full text-left px-4 py-2 text-sm transition-all duration-150 border-l-[3px] border-transparent"
                    :class="[
                      locale === 'es'
                        ? 'bg-primary-100 border-l-primary-500 font-medium text-primary-700'
                        : active
                          ? 'border-l-primary-400 text-primary-600 bg-primary-50'
                          : 'text-text-800 hover:bg-primary-100 hover:text-primary-600 hover:border-l-primary-300',
                    ]">
                    Español
                  </button>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <button
                    @click="setLocale('gl')"
                    class="block w-full text-left px-4 py-2 text-sm transition-all duration-150 border-l-[3px] border-transparent"
                    :class="[
                      locale === 'gl'
                        ? 'bg-primary-100 border-l-primary-500 font-medium text-primary-700'
                        : active
                          ? 'border-l-primary-400 text-primary-600 bg-primary-50'
                          : 'text-text-800 hover:bg-primary-100 hover:text-primary-600 hover:border-l-primary-300',
                    ]">
                    Galego
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>

        <Menu as="div" class="relative inline-block text-left">
          <div>
            <MenuButton
              class="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-400 hover:border-primary-500 transition-colors flex items-center justify-center bg-white p-0">
              <img
                :src="getImageUrl('default', 'png')"
                alt="User Avatar"
                class="block w-full h-full object-cover object-center m-0 p-0" />
            </MenuButton>
          </div>
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95">
            <MenuItems
              class="absolute right-0 mt-3 w-48 origin-top-right rounded-md bg-background-100 border border-background-300 shadow-lg">
              <div class="py-1">
                <MenuItem v-slot="{ active }">
                  <button
                    @click="toggleTheme"
                    class="w-full text-left px-4 py-2 text-sm transition-all duration-150 border-l-[3px] border-transparent flex items-center"
                    :class="[
                      active
                        ? 'border-l-primary-500 text-primary-600 bg-primary-50'
                        : 'text-text-800 hover:bg-primary-50 hover:text-primary-600 hover:border-l-primary-300',
                    ]">
                    <Sun v-if="isDarkTheme" class="inline-block mr-2 h-4 w-4" />
                    <Moon v-else class="inline-block mr-2 h-4 w-4" />
                    {{ isDarkTheme ? t("components.navbar.lightMode") : t("components.navbar.darkMode") }}
                  </button>
                </MenuItem>
                <MenuItem v-if="authStore.isAuthenticated" v-slot="{ active }">
                  <button
                    @click="handleLogout"
                    class="w-full text-left px-4 py-2 text-sm transition-all duration-150 border-l-[3px] border-transparent flex items-center"
                    :class="[
                      active
                        ? 'border-l-accent-500 text-accent-600 bg-accent-50'
                        : 'text-text-800 hover:bg-accent-50 hover:text-accent-600 hover:border-l-accent-300',
                    ]">
                    <LogOut class="inline-block mr-2 h-4 w-4" />
                    {{ t("components.navbar.logout") }}
                  </button>
                </MenuItem>
                <MenuItem v-else v-slot="{ active }">
                  <button
                    @click="handleLogin"
                    class="w-full text-left px-4 py-2 text-sm transition-all duration-150 border-l-[3px] border-transparent flex items-center"
                    :class="[
                      active
                        ? 'border-l-primary-500 text-primary-600 bg-primary-50'
                        : 'text-text-800 hover:bg-primary-50 hover:text-primary-600 hover:border-l-primary-300',
                    ]">
                    <LogOut class="inline-block mr-2 h-4 w-4 rotate-180" />
                    {{ t("components.navbar.login") }}
                  </button>
                </MenuItem>
              </div>
            </MenuItems>
          </transition>
        </Menu>
      </div>
    </div>
  </nav>
</template>

<script setup>
import {
  CalendarClock,
  Languages,
  ChevronDown,
  Menu as LucideMenu,
  ChevronLeft as LucideChevronLeft,
  LogOut,
  Moon,
  Sun,
} from "lucide-vue-next";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useMainStore } from "../stores/mainStore";
import { useAuthStore } from "../stores/authStore";
import { useConfigStore } from "@/stores/configStore";
import { i18n } from "../i18n";
import { useRoute } from "vue-router";

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["toggle-sidebar"]);

const route = useRoute();

const currentLayout = computed(() => {
  return route.meta.layout || "default";
});

const { t, locale } = useI18n();
const showLanguageMenu = ref(false);
const showUserMenu = ref(false);
const mainStore = useMainStore();
const authStore = useAuthStore();
const configStore = useConfigStore();

const toggleSidebar = () => {
  emit("toggle-sidebar");
  mainStore.setSidebarCollapsed(!props.isCollapsed);
};

const setLocale = (lang) => {
  mainStore.setLocale(lang);
  i18n.global.locale.value = lang;
  showLanguageMenu.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  showUserMenu.value = false;
};

const handleLogin = () => {
  window.location.href = "/auth/login";
  showUserMenu.value = false;
};

const currentLanguageLabel = computed(() => {
  return locale.value.toUpperCase();
});

const closeOnOutsideClick = () => {
  showLanguageMenu.value = false;
  showUserMenu.value = false;
};

const isDarkTheme = computed(() => {
  return (
    mainStore.theme === "dark" ||
    (mainStore.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  );
});

const toggleTheme = () => {
  mainStore.setTheme(isDarkTheme.value ? "light" : "dark");
};

onMounted(() => {
  document.addEventListener("click", closeOnOutsideClick);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", mainStore.applyTheme);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeOnOutsideClick);
  window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", mainStore.applyTheme);
});

const getImageUrl = (name, ext) => {
  return new URL(`../assets/img/${name}.${ext}`, import.meta.url).href;
};
</script>

<style scoped>
.navbar {
  height: 3.5rem;
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.08);
}

.relative {
  position: relative;
}

.shadow-lg {
  box-shadow:
    0 4px 15px -2px rgba(0, 0, 0, 0.08),
    0 2px 8px -1px rgba(0, 0, 0, 0.05);
}
</style>
