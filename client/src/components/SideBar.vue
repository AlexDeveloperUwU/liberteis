<template>
  <div>
    <aside
      :class="[
        'bg-gray-800 text-white h-full p-4 pt-4 transition-transform duration-300 ease-in-out fixed top-0 left-0 z-40',
        isCollapsed ? '-translate-x-full' : 'translate-x-0',
      ]"
      style="width: 12rem; top: 3rem">
      <nav>
        <ul class="space-y-[0.75rem]">
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            class="bg-gray-800 p-3 rounded-md border border-gray-700 hover:border-gray-500 transition-colors duration-200">
            <a href="#" class="flex items-center gap-2">
              <div class="min-w-6 flex justify-center">
                <component :is="item.icon" />
              </div>
              <div
                :class="['transition-all duration-300 ease-in-out', isCollapsed ? 'hidden' : 'block']"
                class="overflow-hidden">
                <span class="whitespace-nowrap transition-opacity duration-300 text-sm font-bold">{{
                  t(item.titleKey)
                }}</span>
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
  props: {
    isCollapsed: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n();

    const menuItems = [
      { titleKey: "components.sidebar.home", icon: "LucideHome" },
      { titleKey: "components.sidebar.analytics", icon: "LucideBarChart" },
      { titleKey: "components.sidebar.team", icon: "LucideUsers" },
      { titleKey: "components.sidebar.reports", icon: "LucideFileText" },
      { titleKey: "components.sidebar.settings", icon: "LucideSettings" },
    ];

    return {
      t,
      menuItems,
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
