<template>
  <aside
    class="sidebar-container bg-background-100 border-r-[1.5px] border-background-300 flex flex-col items-stretch"
    :class="[isMobile && isCollapsed ? 'sidebar-hidden' : '']">
    <nav class="sidebar-nav flex-1 w-full" :style="sidebarStyle">
      <ul class="space-y-3 w-full">
        <li v-for="(item, index) in menuItems" :key="index" class="rounded-md w-full">
          <router-link
            :to="item.route"
            class="flex items-center gap-2 p-3 bg-background-200 rounded-md border-[1.5px] border-background-400 hover:border-primary-400 hover:bg-background-300 transition-all duration-200 shadow-[0_2px_4px_0_rgba(0,0,0,0.05)] w-full"
            active-class="bg-primary-100 border-primary-500 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
            <div class="sidebar-icon text-primary-600">
              <component :is="item.icon" />
            </div>
            <span v-if="!isCollapsed || isMobile" class="sidebar-text text-text-800">
              {{ t(item.titleKey) }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div
      class="sidebar-footer border-t border-background-300 flex items-center justify-center w-full"
      :style="sidebarStyle">
      <div class="flex items-center w-full justify-center">
        <div class="sidebar-logo">
          <img :src="logoImg" alt="Logo" class="w-4 h-4" />
        </div>
        <div v-if="!isCollapsed || isMobile" class="sidebar-version text-xs text-text-600">
          <span>{{ mainStore.version || "..." }}</span>
        </div>
      </div>
    </div>
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
  MapPin as LucideMapPin,
  Bookmark as LucideBookmark,
  CalendarDays as LucideCalendarDays,
} from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref, onMounted, computed } from "vue";
import { useMainStore } from "../stores/mainStore";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import logoImg from "@/assets/img/logo.png";

export default {
  components: {
    LucideMenu,
    LucideChevronLeft,
    LucideHome,
    LucideBarChart,
    LucideUsers,
    LucideFileText,
    LucideSettings,
    LucideMapPin,
    LucideBookmark,
    LucideCalendarDays,
  },
  props: {
    isCollapsed: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:isCollapsed"],
  setup(props, { emit }) {
    const { t } = useI18n();
    const isMobile = ref(window.innerWidth <= 768);
    const mainStore = useMainStore();
    const authStore = useAuthStore();

    onMounted(() => {
      if (props.isCollapsed !== mainStore.sidebarCollapsed) {
        emit("update:isCollapsed", mainStore.sidebarCollapsed);
      }

      // Obtener la versión al montar el componente
      mainStore.fetchVersion();

      window.addEventListener("resize", detectMobile);
    });

    const menuItems = computed(() => {
      const items = [
        {
          titleKey: "components.sidebar.home",
          icon: "LucideHome",
          route: "/dash/home",
          permission: "normalUser",
        },
        {
          titleKey: "components.sidebar.events",
          icon: "LucideCalendarDays",
          route: "/dash/events",
          permission: "managerUser",
        },
        {
          titleKey: "components.sidebar.categories",
          icon: "LucideBookmark",
          route: "/dash/categories",
          permission: "managerUser",
        },
        {
          titleKey: "components.sidebar.spaces",
          icon: "LucideMapPin",
          route: "/dash/spaces",
          permission: "managerUser",
        },
        {
          titleKey: "components.sidebar.users",
          icon: "LucideUsers",
          route: "/dash/users",
          permission: "managerUser",
        },
      ];

      return items.filter((item) => hasPermission(authStore.userType, item.permission));
    });

    const sidebarStyle = computed(() => {
      return {
        width: isMobile.value ? "12rem" : props.isCollapsed ? "5rem" : "12rem",
      };
    });

    const detectMobile = () => {
      isMobile.value = window.innerWidth <= 768;
    };

    return {
      t,
      menuItems,
      isMobile,
      locale: mainStore.locale,
      sidebarStyle,
      mainStore,
      logoImg,
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
  font-family: "K2D", sans-serif;
  overflow: hidden;
}

.sidebar-footer {
  min-height: 3rem;
  transition: width 0.3s ease;
}

.sidebar-logo {
  min-width: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-version {
  font-family: "K2D", sans-serif;
  white-space: nowrap;
}
</style>
