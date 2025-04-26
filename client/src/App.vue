<template>
  <div class="h-screen bg-gray-900 flex flex-col">
    <NavBar class="fixed top-0 left-0 w-full z-50" @toggle-sidebar="toggleSidebar" :isCollapsed="isSidebarCollapsed" />
    <div class="flex flex-1 pt-14">
      <SideBar
        class="fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-40"
        :isCollapsed="isSidebarCollapsed"
        @transitionend="onSidebarToggled" />
      <div
        class="flex-1 overflow-auto bg-gray-900"
        :style="{
          marginLeft: isMobile ? '0' : isSidebarCollapsed ? '5rem' : '12rem',
          transition: 'margin-left 0.3s ease-in-out',
        }">
        <Suspense>
          <template #default>
            <main class="flex-1 p-4">
              <router-view />
            </main>
          </template>
          <template #fallback>
            <div class="overlay">
              <span class="loader"></span>
            </div>
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
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

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #1e2939;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loader {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: block;
  margin: 15px auto;
  position: relative;
  color: #fff;
  box-sizing: border-box;
  animation: animloader 1s linear infinite alternate;
}

@keyframes animloader {
  0% {
    box-shadow:
      -38px -6px,
      -14px 6px,
      14px -6px;
  }

  33% {
    box-shadow:
      -38px 6px,
      -14px -6px,
      14px 6px;
  }

  66% {
    box-shadow:
      -38px -6px,
      -14px 6px,
      14px -6px;
  }

  100% {
    box-shadow:
      -38px 6px,
      -14px -6px,
      14px 6px;
  }
}
</style>
