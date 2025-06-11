<template>
  <div class="h-full w-full p-6">
    <h1 class="text-3xl font-bold text-text-950 mb-2 k2d">{{ t("pages.dash.users.page.title") }}</h1>
    <p class="text-text-800 mb-6">{{ t("pages.dash.users.page.description") }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <Users class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.users.metrics.totals") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.total || 0 }}</h2>
      </div>

      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-success-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <UserCheck class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.users.metrics.active") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.active || 0 }}</h2>
      </div>

      <div
        class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-accent-400 transition-all duration-200">
        <div class="flex items-center gap-2 mb-2">
          <UserX class="w-5 h-5 text-primary-600" />
          <p class="font-medium text-text-800">{{ t("pages.dash.users.metrics.inactive") }}</p>
        </div>
        <h2 class="text-2xl font-bold text-text-950">{{ metrics.inactive || 0 }}</h2>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div
        class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-background-300">
            <thead>
              <tr class="border-b border-background-300">
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <Hash class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">ID</span>
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <User class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.users.table.name") }}
                    </span>
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <Mail class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.users.table.email") }}
                    </span>
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <Settings class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.users.table.userType") }}
                    </span>
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <User class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.users.table.createdBy") }}
                    </span>
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <Activity class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.users.table.lastSeen") }}
                    </span>
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <UserCog class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.users.table.actions") }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-background-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-primary-50/60 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-text-900 bg-background-200/50 px-2 py-1 rounded">
                    {{ user.id }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="ml-4">
                    <div class="text-sm text-text-800">{{ user.name }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-800">{{ user.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div
                    class="text-sm font-semibold"
                    :class="{
                      'text-primary-700': user.type === 'normalUser',
                      'text-secondary-700': user.type === 'managerUser',
                      'text-accent-700': user.type === 'adminUser',
                    }">
                    {{ t(`pages.dash.users.types.${user.type}`) }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-text-800">{{ user.createdBy }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span
                      :class="[
                        'w-2 h-2 rounded-full',
                        isUserActive(user.lastLogin) ? 'bg-primary-500' : 'bg-background-400',
                      ]"></span>
                    <span class="text-sm text-text-800">
                      {{
                        user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString()
                          : t("pages.dash.users.table.neverLogged")
                      }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <button
                      @click="$router.push({ name: 'dashUsersEdit', params: { id: user.id } })"
                      class="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors duration-150">
                      <Pencil class="w-3 h-3 text-primary-600" />
                      {{ t("pages.dash.users.actions.edit") }}
                    </button>
                    <button
                      class="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-accent-100 text-accent-800 border border-accent-200 hover:bg-accent-200 transition-colors duration-150">
                      <Trash class="w-3 h-3 text-primary-600" />
                      {{ t("pages.dash.users.actions.delete") }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Users, UserCheck, UserX, Hash, User, Mail, Activity, UserCog, Settings, Pencil, Trash } from "lucide-vue-next";
import { useI18n } from "vue-i18n";
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const metrics = ref(
  route.meta.initialData?.metrics || {
    total: 0,
    active: 0,
    inactive: 0,
  },
);

const users = ref(route.meta.initialData?.users || []);

const isUserActive = (lastLogin) => {
  if (!lastLogin) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(lastLogin) > thirtyDaysAgo;
};
</script>

<style>
.shadow-md {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.08),
    0 2px 4px -1px rgba(0, 0, 0, 0.04);
}

.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.08),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.08),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
