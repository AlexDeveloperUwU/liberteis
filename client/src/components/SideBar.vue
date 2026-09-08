<template>
  <aside
    class="sidebar-container bg-background-100 border-r-[1.5px] border-background-300 shadow-sidebar flex flex-col items-stretch"
    :class="[isMobile && isCollapsed ? 'sidebar-hidden' : '']">
    <nav class="sidebar-nav flex-1 w-full" :style="sidebarStyle">
      <ul class="space-y-3 w-full">
        <li v-for="(item, index) in menuItems" :key="index" class="rounded-md w-full">
          <router-link
            :to="item.route"
            class="flex items-center gap-2 p-3 bg-background-200 rounded-md border-[1.5px] border-background-400 hover:border-primary-400 hover:bg-background-300 transition-all duration-200 shadow-sm w-full"
            active-class="bg-primary-100 border-primary-500 shadow-nav-active">
            <span class="sidebar-icon text-primary-600">
              <component :is="resolveIcon(item.icon)" class="w-5 h-5" />
            </span>
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
          <img :src="logoImg" :alt="t('components.sidebar.logoAlt')" class="w-4 h-4" />
        </div>
        <div v-if="!isCollapsed || isMobile" class="sidebar-version text-xs text-text-600">
          <span>{{ mainStore.version || "..." }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { useMainStore } from "../stores/mainStore";
import { useAuthStore } from "../stores/authStore";
import { hasPermission } from "../utils/permissions";
import { resolveIcon } from "./icons.js";
import logoImg from "@/assets/img/logo.png";

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits(["update:isCollapsed"]);

const { t } = useI18n();
const isMobile = ref(window.innerWidth <= 768);
const mainStore = useMainStore();
const authStore = useAuthStore();

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  if (props.isCollapsed !== mainStore.sidebarCollapsed) {
    emit("update:isCollapsed", mainStore.sidebarCollapsed);
  }

  mainStore.fetchVersion();

  window.addEventListener("resize", detectMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", detectMobile);
});

const menuItems = computed(() => {
  const items = [
    { titleKey: "components.sidebar.home", icon: "home", route: "/dash/home", permission: "normalUser" },
    { titleKey: "components.sidebar.events", icon: "calendar-days", route: "/dash/events", permission: "managerUser" },
    { titleKey: "components.sidebar.bookings", icon: "calendar-clock", route: "/dash/bookings", permission: "normalUser" },
    { titleKey: "components.sidebar.categories", icon: "bookmark", route: "/dash/categories", permission: "managerUser" },
    { titleKey: "components.sidebar.spaces", icon: "map-pin", route: "/dash/spaces", permission: "managerUser" },
    { titleKey: "components.sidebar.users", icon: "users", route: "/dash/users", permission: "managerUser" },
    { titleKey: "components.sidebar.settings", icon: "settings", route: "/dash/settings", permission: "adminUser" },
  ];

  return items.filter((item) => hasPermission(authStore.userType, item.permission));
});

const sidebarStyle = computed(() => ({
  width: isMobile.value ? "12rem" : props.isCollapsed ? "5rem" : "12rem",
}));
</script>

<style scoped>
.sidebar-container {
  position: fixed;
  height: calc(100vh - 3.5rem);
  left: 0;
  top: 3.5rem;
  z-index: 40;
  transition: transform 0.3s ease;
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
