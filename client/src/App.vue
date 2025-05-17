<template>
  <div class="h-screen lt-gb flex flex-col bg-background-200">
    <NavBar class="fixed top-0 left-0 w-full z-50" @toggle-sidebar="toggleSidebar" :isCollapsed="isSidebarCollapsed" />
    <div class="flex flex-1 pt-14">
      <SideBar
        class="fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-40"
        :isCollapsed="isSidebarCollapsed"
        @transitionend="onSidebarToggled" />
      <div class="flex-1 overflow-auto" :style="{
        marginLeft: isMobile ? '0' : isSidebarCollapsed ? '5rem' : '12rem',
        transition: 'margin-left 0.3s ease-in-out',
      }">
        <Suspense>
          <template #default>
            <main class="flex-1 min-h-screen bg-background-200">
              <router-view />
            </main>
          </template>
          <template #fallback>
            <div class="overlay bg-background-200 flex items-center justify-center min-h-screen">
              <span class="loader"></span>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import NavBar from "./components/NavBar.vue";
import SideBar from "./components/SideBar.vue";

const isSidebarCollapsed = ref(true);
const isMobile = ref(window.innerWidth <= 768);

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

const detectMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

const onSidebarToggled = () => {
  const event = new CustomEvent("sidebar-toggled");
  window.dispatchEvent(event);
};

window.addEventListener("resize", detectMobile);
</script>
