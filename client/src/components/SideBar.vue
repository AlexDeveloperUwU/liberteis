<template>
  <div>
    <aside
      :class="[
        'bg-gray-800 text-white h-full p-4 pt-4 transition-transform duration-300 ease-in-out fixed z-40',
        isMobile ? (isCollapsed ? '-translate-x-full' : 'translate-x-0') : 'translate-x-0',
        isMobile ? 'left-0' : 'left-0',
      ]"
      :style="{
        width: isMobile ? '12rem' : isCollapsed ? '5rem' : '12rem',
        top: '3.5rem',
        transition: 'width 0.3s ease-in-out',
      }">
      <nav>
        <ul class="space-y-[0.75rem]">
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            class="bg-gray-800 p-3 rounded-md border border-gray-700 hover:border-gray-500 transition-colors duration-200">
            <a href="#" class="flex items-center gap-2">
              <div class="min-w-6 flex justify-center">
                <component :is="item.icon" />
              </div>
              <div v-if="!isCollapsed || isMobile" class="overflow-hidden">
                <span class="whitespace-nowrap text-sm font-bold">{{ t(item.titleKey) }}</span>
              </div>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script>
import {
  Menu as LucideMenu,
  ChevronLeft as LucideChevronLeft,
  Home as LucideHome,
  BarChart as LucideBarChart,
  Users as LucideUsers,
  FileText as LucideFileText,
  Settings as LucideSettings,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref, onMounted } from "vue";

export default {
  components: {
    LucideMenu,
    LucideChevronLeft,
    LucideHome,
    LucideBarChart,
    LucideUsers,
    LucideFileText,
    LucideSettings,
  },
  props: {
    isCollapsed: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();
    const isMobile = ref(window.innerWidth <= 768);

    const menuItems = [
      { titleKey: "components.sidebar.home", icon: "LucideHome" },
      { titleKey: "components.sidebar.analytics", icon: "LucideBarChart" },
      { titleKey: "components.sidebar.team", icon: "LucideUsers" },
      { titleKey: "components.sidebar.reports", icon: "LucideFileText" },
      { titleKey: "components.sidebar.settings", icon: "LucideSettings" },
    ];

    const detectMobile = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    onMounted(() => {
      window.addEventListener("resize", detectMobile);
    });

    return {
      t,
      menuItems,
      isMobile,
    };
  },
};
</script>

<style scoped>
.min-w-6 {
  min-width: 1.5rem;
}

aside {
  flex-shrink: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.5);
  transition: transform 0.3s ease-in-out;
}
</style>
