<template>
  <div class="app-wrapper bg-background-200">
    <NavBar @toggle-sidebar="toggleSidebar" :isCollapsed="isSidebarCollapsed" />

    <div v-if="currentLayout === 'dashboard'" class="dashboard-layout">
      <SideBar :isCollapsed="isSidebarCollapsed" />
      <main :class="contentClasses">
        <router-view />
      </main>
    </div>

    <main v-else-if="route.path === '/'" class="home-content">
      <router-view />
    </main>

    <main v-else class="full-content">
      <router-view />
    </main>

    <Toasts />
    <Modals />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import SideBar from "./components/SideBar.vue";
import Toasts from "@/components/Toasts.vue";
import Modals from "@/components/Modals.vue";
import { useConfigStore } from "@/stores/configStore";
import { useMainStore } from "@/stores/mainStore";

const configStore = useConfigStore();
const mainStore = useMainStore();
const route = useRoute();
const isSidebarCollapsed = ref(mainStore.sidebarCollapsed);
const isMobile = ref(false);

const currentLayout = computed(() => {
  return route.meta.layout || "default";
});

const contentClasses = computed(() => {
  if (isMobile.value) return "dashboard-content";

  return isSidebarCollapsed.value
    ? "dashboard-content dashboard-content-collapsed"
    : "dashboard-content dashboard-content-expanded";
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  mainStore.setSidebarCollapsed(isSidebarCollapsed.value);
  onSidebarToggled();
};

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value && !isSidebarCollapsed.value) {
    isSidebarCollapsed.value = true;
    mainStore.setSidebarCollapsed(true);
  }
};

const onSidebarToggled = () => {
  const event = new CustomEvent("sidebar-toggled");
  window.dispatchEvent(event);
};

watch(
  () => mainStore.sidebarCollapsed,
  (newValue) => {
    if (isSidebarCollapsed.value !== newValue) {
      isSidebarCollapsed.value = newValue;
    }
  },
);

onMounted(async () => {
  isSidebarCollapsed.value = mainStore.sidebarCollapsed;

  detectMobile();
  window.addEventListener("resize", detectMobile);
  await configStore.loadAllConfigs();
});
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
}

.dashboard-layout {
  padding-top: 3.5rem;
  min-height: calc(100vh - 3.5rem);
}

.dashboard-content {
  flex: 1;
  transition: margin-left 0.3s ease;
}

@media (min-width: 769px) {
  .dashboard-content-collapsed {
    margin-left: 5rem;
  }

  .dashboard-content-expanded {
    margin-left: 12rem;
  }
}

.home-content {
  padding-top: 3.5rem;
  min-height: calc(100vh - 3.5rem);
}

.full-content {
  min-height: 100vh;
}
</style>
