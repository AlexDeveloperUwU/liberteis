<template>
  <nav
    class="bg-gray-800 text-white flex items-center justify-between px-6 py-3 shadow-md fixed top-0 left-0 w-full z-50">
    <div class="flex items-center gap-3">
      <button
        @click="$emit('toggle-sidebar')"
        class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200">
        <LucideMenu v-if="isCollapsed" />
        <LucideChevronLeft v-else />
      </button>
      <div class="text-xl font-semibold flex items-center gap-2">
        <CalendarClock />
        <span>{{ t("components.navbar.title") }}</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <div class="relative" @click.stop>
        <button
          @click.stop="toggleLanguageMenu"
          class="flex items-center gap-1 text-gray-400 hover:text-white py-1 px-2 rounded hover:bg-gray-700 transition">
          <Languages class="h-5 w-5" />
          <span class="text-sm">{{ currentLanguageLabel }}</span>
          <ChevronDown class="h-4 w-4" :class="{ 'transform rotate-180': showLanguageMenu }" />
        </button>

        <div v-if="showLanguageMenu" class="absolute right-0 mt-4 w-32 bg-gray-700 rounded shadow-lg py-1 z-10">
          <button
            @click="setLocale('en')"
            class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition"
            :class="{ 'bg-gray-600': locale === 'en' }">
            English
          </button>
          <button
            @click="setLocale('es')"
            class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition"
            :class="{ 'bg-gray-600': locale === 'es' }">
            Español
          </button>
          <button
            @click="setLocale('gl')"
            class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition"
            :class="{ 'bg-gray-600': locale === 'gl' }">
            Galego
          </button>
        </div>
      </div>
      <div class="relative" @click.stop>
        <button
          @click.stop="toggleUserMenu"
          class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700 hover:border-gray-500 transition-colors">
          <img :src="getImageUrl('logopfp', 'png')" alt="User Avatar" class="w-full h-full object-cover" />
        </button>

        <div v-if="showUserMenu" class="absolute right-0 mt-4 w-48 bg-gray-700 rounded shadow-lg py-1 z-10">
          <button
            @click="handleLogout"
            class="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600 transition">
            {{ t("components.navbar.logout") }}
          </button>
        </div>
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
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useMainStore } from "../stores/mainStore";
import { useAuthStore } from "../stores/authStore";
import { i18n } from "../i18n";

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true,
  },
});

const { t, locale } = useI18n();
const showLanguageMenu = ref(false);
const showUserMenu = ref(false);
const mainStore = useMainStore();
const authStore = useAuthStore();

const toggleLanguageMenu = () => {
  showLanguageMenu.value = !showLanguageMenu.value;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
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

const currentLanguageLabel = computed(() => {
  return locale.value.toUpperCase();
});

const closeOnOutsideClick = () => {
  showLanguageMenu.value = false;
  showUserMenu.value = false;
};

onMounted(() => {
  document.addEventListener("click", closeOnOutsideClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeOnOutsideClick);
});

const getImageUrl = (name, ext) => {
  return new URL(`../assets/img/${name}.${ext}`, import.meta.url).href;
};
</script>

<style scoped>
.relative {
  position: relative;
}
</style>
