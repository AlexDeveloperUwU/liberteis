<template>
  <aside class="sidebar-container bg-background-100 border-r-[1.5px] border-background-300" :class="[isMobile && isCollapsed ? 'sidebar-hidden' : '']">
    <nav class="sidebar-nav" :style="sidebarStyle">
      <ul class="space-y-3">
        <li v-for="(item, index) in menuItems" :key="index" class="bg-background-200 p-3 rounded-md border-[1.5px] border-background-400 hover:border-primary-400 hover:bg-background-300 transition-all duration-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.05)]">
          <a href="#" class="flex items-center gap-2">
            <div class="sidebar-icon text-primary-600">
              <component :is="item.icon" />
            </div>
            <span v-if="!isCollapsed || isMobile" class="sidebar-text text-text-800">
              {{ t(item.titleKey) }}
            </span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
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
import { ref, onMounted, computed } from "vue";
import { useMainStore } from "../stores/mainStore";

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
    const mainStore = useMainStore();

    const menuItems = [
      { titleKey: "components.sidebar.home", icon: "LucideHome" },
      { titleKey: "components.sidebar.analytics", icon: "LucideBarChart" },
      { titleKey: "components.sidebar.team", icon: "LucideUsers" },
      { titleKey: "components.sidebar.reports", icon: "LucideFileText" },
      { titleKey: "components.sidebar.settings", icon: "LucideSettings" },
    ];

    const sidebarStyle = computed(() => {
      return {
        width: isMobile.value ? '12rem' : props.isCollapsed ? '5rem' : '12rem'
      };
    });

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
      locale: mainStore.locale,
      sidebarStyle
    };
  },
};
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  height: calc(100vh - 3.5rem);
  left: 0;
  top: 3.5rem;
  z-index: 40;
  transition: transform 0.3s ease;
  box-shadow: 4px 0 15px -3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .sidebar-hidden {
    transform: translateX(-100%);
  }
}

.sidebar-nav {
  height: 100%;
  padding: 1rem;
  overflow-y: auto;
  transition: width 0.3s ease;
}

.sidebar-icon {
  min-width: 1.5rem;
  display: flex;
  justify-content: center;
}

.sidebar-text {
  white-space: nowrap;
  font-size: 1rem;
  font-family: 'K2D', sans-serif;
  overflow: hidden;
}
</style>
