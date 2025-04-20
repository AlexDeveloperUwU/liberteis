<template>
  <nav class="bg-gray-800 text-white flex items-center justify-between px-6 py-3 shadow-md">
    <div class="flex items-center gap-3">
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

        <div v-if="showLanguageMenu" class="absolute right-0 mt-1 w-32 bg-gray-700 rounded shadow-lg py-1 z-10">
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
      <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700">
        <img :src="getImageUrl('logopfp', 'png')" alt="User Avatar" class="w-full h-full object-cover" />
      </div>
    </div>
  </nav>
</template>

<script>
import { CalendarClock, Languages, ChevronDown } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

function getImageUrl(name, ext) {
  return new URL(`../assets/img/${name}.${ext}`, import.meta.url).href;
}

export default {
  components: {
    CalendarClock,
    Languages,
    ChevronDown,
  },
  setup() {
    const { t, locale } = useI18n();
    const showLanguageMenu = ref(false);

    const toggleLanguageMenu = () => {
      showLanguageMenu.value = !showLanguageMenu.value;
    };

    const setLocale = (lang) => {
      locale.value = lang;
      localStorage.setItem("locale", lang);
      showLanguageMenu.value = false;
    };

    const currentLanguageLabel = computed(() => {
      return locale.value.toUpperCase();
    });

    const closeOnOutsideClick = (event) => {
      showLanguageMenu.value = false;
    };

    onMounted(() => {
      document.addEventListener("click", closeOnOutsideClick);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("click", closeOnOutsideClick);
    });

    return {
      t,
      locale,
      setLocale,
      showLanguageMenu,
      toggleLanguageMenu,
      currentLanguageLabel,
      getImageUrl,
    };
  },
};
</script>

<style scoped>
.relative {
  position: relative;
}
</style>
