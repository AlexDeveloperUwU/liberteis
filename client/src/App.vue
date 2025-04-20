<template>
  <div class="flex h-screen">
    <SideBar />
    <div class="flex flex-col flex-1">
      <NavBar />
      <Suspense>
        <template #default>
          <main class="flex-1 overflow-auto">
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
</template>

<script setup>
import NavBar from "./components/NavBar.vue";
import SideBar from "./components/SideBar.vue";
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
