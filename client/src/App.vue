<template>
  <div class="flex h-screen">
    <SideBar />

    <div class="flex flex-col flex-1">
      <NavBar />

      <main class="flex-1 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import SideBar from './components/SideBar.vue';
</script>

<style scoped></style>
