<template>
  <nav class="bg-gray-800 text-white flex items-center justify-between px-6 py-3 shadow-md">
    <div class="flex items-center gap-3">
      <div class="text-xl font-semibold flex items-center gap-2">
        <LayoutDashboard />
        <span>Dashboard</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button class="text-gray-400 hover:text-white">
        <Languages />
      </button>
      <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-700">
        <img src="https://randomuser.me/api/portraits/women/60.jpg" alt="User Avatar" class="w-full h-full object-cover">
      </div>
    </div>
  </nav>
</template>

<script>
import { LayoutDashboard, Languages } from 'lucide-vue-next';

export default {
  components: {
    LayoutDashboard,
    Languages
  }
};
</script>

<style scoped></style>