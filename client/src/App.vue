<template>
  <div class="app-wrapper bg-background-200">
    <NavBar v-if="currentLayout === 'dashboard' || route.path === '/'" @toggle-sidebar="toggleSidebar" :isCollapsed="isSidebarCollapsed" />

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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import NavBar from "./components/NavBar.vue";
import SideBar from "./components/SideBar.vue";
import { useConfigStore } from "@/stores/configStore";

const configStore = useConfigStore();
const route = useRoute();
const isSidebarCollapsed = ref(true);
const isMobile = ref(false);

const currentLayout = computed(() => {
  return route.meta.layout || 'default';
});

const contentClasses = computed(() => {
  if (isMobile.value) return 'dashboard-content';

  return isSidebarCollapsed.value
    ? 'dashboard-content dashboard-content-collapsed'
    : 'dashboard-content dashboard-content-expanded';
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  if (isMobile.value) isSidebarCollapsed.value = true;
};

const onSidebarToggled = () => {
  const event = new CustomEvent("sidebar-toggled");
  window.dispatchEvent(event);
};

onMounted(async () => {
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
  display: flex;
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
