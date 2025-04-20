<template>
  <div class="flex">
    <aside
      :class="[
        'bg-gray-800 text-white h-screen p-4 pt-4 transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-18' : 'w-56',
      ]">
      <div class="flex mb-6 pl-2">
        <button
          @click="toggleSidebar"
          class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200">
          <div class="min-w-6 flex justify-center">
            <LucideMenu v-if="isCollapsed" />
            <LucideChevronLeft v-else />
          </div>
          <div
            :class="['transition-all duration-300 ease-in-out', isCollapsed ? 'max-w-0' : 'max-w-full']"
            class="overflow-hidden">
            <transition name="fade-delayed">
              <span v-if="!isCollapsed" class="whitespace-nowrap transition-opacity duration-300 text-sm">{{
                t("components.sidebar.close")
              }}</span>
            </transition>
          </div>
        </button>
      </div>
      <nav>
        <ul class="space-y-4">
          <li v-for="(item, index) in menuItems" :key="index">
            <a href="#" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors duration-200">
              <div class="min-w-6 flex justify-center">
                <component :is="item.icon" />
              </div>
              <div
                :class="['transition-all duration-300 ease-in-out', isCollapsed ? 'max-w-0' : 'max-w-full']"
                class="overflow-hidden">
                <transition name="fade-delayed">
                  <span v-if="!isCollapsed" class="whitespace-nowrap transition-opacity duration-300 text-sm">{{
                    t(item.titleKey)
                  }}</span>
                </transition>
              </div>
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
  Settings as LucideSettings,
} from "lucide-vue-next";
import { ref } from "vue";
import { useI18n } from "vue-i18n";

export default {
  components: {
    LucideMenu,
    LucideChevronLeft,
    LucideHome,
    LucideBarChart,
    LucideUsers,
    LucideFileText,
    LucideSettings,
  },
  setup() {
    const { t } = useI18n();
    const isCollapsed = ref(true);

    const menuItems = [
      { titleKey: "components.sidebar.home", icon: "LucideHome" },
      { titleKey: "components.sidebar.analytics", icon: "LucideBarChart" },
      { titleKey: "components.sidebar.team", icon: "LucideUsers" },
      { titleKey: "components.sidebar.reports", icon: "LucideFileText" },
      { titleKey: "components.sidebar.settings", icon: "LucideSettings" },
    ];

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    return {
      t,
      isCollapsed,
      menuItems,
      toggleSidebar,
    };
  },
};
</script>

<style scoped>
.min-w-6 {
  min-width: 1.5rem;
}

.fade-delayed-enter-active,
.fade-delayed-leave-active {
  transition: opacity 0.3s ease;
  transition-delay: 0.15s;
}

.fade-delayed-enter-from,
.fade-delayed-leave-to {
  opacity: 0;
}
</style>
