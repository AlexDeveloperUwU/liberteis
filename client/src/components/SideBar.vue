<template>
  <div class="flex">
    <!-- Sidebar -->
    <aside :class="['bg-gray-800 text-white h-screen p-4 pt-4 transition-all duration-400 ease-in-out', isCollapsed ? 'w-18' : 'w-56']">
      <div class="flex mb-6 pl-2">
        <button @click="toggleSidebar" class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200">
          <div class="min-w-6 flex justify-center">
            <LucideMenu v-if="isCollapsed" />
            <LucideChevronLeft v-else />
          </div>
          <span v-if="!isCollapsed" class="whitespace-nowrap transition-opacity duration-300 text-sm">Cerrar menú</span>
        </button>
      </div>
      <nav>
        <ul class="space-y-4">
          <li v-for="(item, index) in menuItems" :key="index">
            <a href="#" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <div class="min-w-6 flex justify-center">
                <component :is="item.icon" />
              </div>
              <span v-if="!isCollapsed" class="whitespace-nowrap transition-opacity duration-300 text-sm">{{ item.title }}</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<script>
import {
  Menu as LucideMenu,
  ChevronLeft as LucideChevronLeft,
  Home as LucideHome,
  BarChart as LucideBarChart,
  Users as LucideUsers,
  FileText as LucideFileText,
  Settings as LucideSettings
} from 'lucide-vue-next';

export default {
  data() {
    return {
      isCollapsed: true,
      menuItems: [
        { title: 'Home', icon: 'LucideHome' },
        { title: 'Analytics', icon: 'LucideBarChart' },
        { title: 'Team', icon: 'LucideUsers' },
        { title: 'Reports', icon: 'LucideFileText' },
        { title: 'Settings', icon: 'LucideSettings' }
      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
    }
  },
  components: {
    LucideMenu,
    LucideChevronLeft,
    LucideHome,
    LucideBarChart,
    LucideUsers,
    LucideFileText,
    LucideSettings
  }
};
</script>

<style scoped>
.min-w-6 {
  min-width: 1.5rem;
}
</style>
