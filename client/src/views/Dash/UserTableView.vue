<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.users.page.title')" :description="t('pages.dash.users.page.description')" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard icon="users" :label="t('pages.dash.users.metrics.totals')" :value="metrics.total || 0" />
      <MetricCard icon="user-check" :label="t('pages.dash.users.metrics.active')" :value="metrics.active || 0" />
      <MetricCard icon="user-minus" :label="t('pages.dash.users.metrics.inactive')" :value="metrics.inactive || 0" />
    </div>

    <DsCard :title="t('pages.dash.users.page.tableTitle')" icon="users">
      <FilterBar
        v-model:search-value="searchTerm"
        :search-placeholder="t('pages.other.commons.search.placeholder')"
        class="mb-6">
        <template #filters>
          <SelectMenu v-model="userFilter" :options="statusOptions" width="10rem" @update:model-value="loadUsers" />
        </template>
        <template #actions>
          <DsButton icon="user-plus" @click="$router.push({ name: 'dashUsersNew' })">
            {{ t("pages.dash.users.actions.add") }}
          </DsButton>
        </template>
      </FilterBar>

      <DataTable
        :columns="columns"
        :rows="paginatedUsers"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="toggleSort">
        <template #cell-type="{ row }">{{ t(`pages.dash.users.types.${row.type}`) }}</template>
        <template #cell-createdBy="{ row }">
          <span class="truncate max-w-32 block">{{ getCreatedByName(row.createdBy) }}</span>
        </template>
        <template #cell-lastLogin="{ row }">
          <StatusDot :tone="isUserActive(row.lastLogin) ? 'active' : 'idle'" :label="formatLastLogin(row)" />
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <DsPill as="button" icon="pencil" @click="$router.push({ name: 'dashUsersEdit', params: { id: row.id } })">
              {{ t("pages.dash.users.actions.edit") }}
            </DsPill>
            <DsPill
              v-if="!isAdminAccount(row) && row.id !== authStore.userId"
              as="button"
              :tone="row.deleted ? 'success' : 'danger'"
              :icon="row.deleted ? 'user-check' : 'user-minus'"
              @click="handleUserStatusToggle(row)">
              {{ row.deleted ? t("pages.dash.users.actions.reactivate") : t("pages.dash.users.actions.deactivate") }}
            </DsPill>
          </div>
        </template>
      </DataTable>

      <div class="mt-6">
        <DsPagination v-model:page="currentPage" :total-pages="totalPages" />
      </div>
    </DsCard>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useModal } from "@/composables/useModal";
import { useToast } from "@/composables/useToast";
import { useAuthStore } from "@/stores/authStore";
import PageHeader from "@/components/data/PageHeader.vue";
import MetricCard from "@/components/core/MetricCard.vue";
import DsCard from "@/components/core/DsCard.vue";
import FilterBar from "@/components/data/FilterBar.vue";
import SelectMenu from "@/components/forms/SelectMenu.vue";
import DsButton from "@/components/core/DsButton.vue";
import DataTable from "@/components/data/DataTable.vue";
import DsPill from "@/components/core/DsPill.vue";
import StatusDot from "@/components/core/StatusDot.vue";
import DsPagination from "@/components/navigation/DsPagination.vue";

const { t } = useI18n();
const route = useRoute();
const authStore = useAuthStore();
const searchTerm = ref("");
const userFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const statusOptions = computed(() =>
  ["active", "inactive", "all"].map((value) => ({
    value,
    label: t(`pages.other.commons.status.${value}`),
    icon: { active: "user-check", inactive: "user-minus", all: "users" }[value],
  })),
);

const columns = computed(() => [
  { key: "id", label: t("pages.other.commons.table.idHeader"), icon: "hash", sortable: true },
  { key: "name", label: t("pages.dash.users.table.name"), icon: "user", sortable: true },
  { key: "email", label: t("pages.dash.users.table.email"), icon: "mail", sortable: true },
  { key: "type", label: t("pages.dash.users.table.userType"), icon: "settings", sortable: true },
  { key: "createdBy", label: t("pages.dash.users.table.createdBy"), icon: "user", sortable: true },
  { key: "lastLogin", label: t("pages.dash.users.table.lastSeen"), icon: "activity", sortable: true },
  { key: "actions", label: t("pages.dash.users.table.actions"), icon: "user-cog" },
]);

const metrics = ref(
  route.meta.initialData?.metrics || {
    total: 0,
    active: 0,
    inactive: 0,
  },
);

const users = ref(route.meta.initialData?.users || []);
const isLoading = ref(false);

const sortColumn = ref("");
const sortDirection = ref("asc");

const toggleSort = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }

  currentPage.value = 1;
};

const normalizeString = (str) => {
  return str
    ? str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
    : "";
};

const textIncludes = (text, searchTerm) => {
  if (!text) return false;

  const normalizedText = normalizeString(text);
  const normalizedTerm = normalizeString(searchTerm);

  const searchWords = normalizedTerm.split(/\s+/).filter((word) => word.length > 0);

  if (searchWords.length === 0) return false;

  return searchWords.every((word) => normalizedText.includes(word));
};

const formatLastLogin = (user) =>
  user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t("pages.dash.users.table.neverLogged");

const filteredUsers = computed(() => {
  let result = users.value;

  if (searchTerm.value.trim()) {
    result = result.filter((user) => {
      const displayValues = {
        id: user.id?.toString() || "",
        name: user.name || "",
        email: user.email || "",
        type: t(`pages.dash.users.types.${user.type}`) || user.type || "",
        originalType: user.type || "",
        createdBy: user.createdBy || "",
        lastLogin: formatLastLogin(user),
      };

      return Object.values(displayValues).some((value) => textIncludes(value, searchTerm.value));
    });
  }

  if (sortColumn.value) {
    result = [...result].sort((a, b) => {
      let valueA, valueB;

      switch (sortColumn.value) {
        case "id":
          valueA = a.id;
          valueB = b.id;
          break;
        case "name":
          valueA = a.name?.toLowerCase() || "";
          valueB = b.name?.toLowerCase() || "";
          break;
        case "email":
          valueA = a.email?.toLowerCase() || "";
          valueB = b.email?.toLowerCase() || "";
          break;
        case "type":
          valueA = a.type || "";
          valueB = b.type || "";
          break;
        case "createdBy":
          valueA = getCreatedByName(a.createdBy)?.toLowerCase() || "";
          valueB = getCreatedByName(b.createdBy)?.toLowerCase() || "";
          break;
        case "lastLogin":
          valueA = a.lastLogin ? new Date(a.lastLogin).getTime() : 0;
          valueB = b.lastLogin ? new Date(b.lastLogin).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (valueA === valueB) {
        return 0;
      }

      const direction = sortDirection.value === "asc" ? 1 : -1;

      if (valueA < valueB) {
        return -1 * direction;
      } else {
        return 1 * direction;
      }
    });
  }

  return result;
});

watch(searchTerm, () => {
  currentPage.value = 1;
});

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredUsers.value.length / itemsPerPage));
});

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredUsers.value.slice(start, end);
});

const loadUsers = async () => {
  try {
    isLoading.value = true;
    const response = await axios.get("/api/users", {
      params: {
        status: userFilter.value,
      },
    });

    users.value = response.data.data || [];

    currentPage.value = 1;
  } catch (error) {
    console.error("Error cargando usuarios:", error);

    users.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!route.meta.initialData) {
    loadUsers();
  }
});

const isUserActive = (lastLogin) => {
  if (!lastLogin) return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return new Date(lastLogin) > thirtyDaysAgo;
};

const isAdminAccount = (user) => {
  return user.createdBy === "System" && user.name === "Administrador";
};

const getCreatedByName = (createdById) => {
  if (createdById === "System") {
    return "Sistema";
  }

  const creator = users.value.find((u) => u.id === createdById);
  return creator ? creator.name : createdById;
};

const modal = useModal();
const toast = useToast();

const handleUserStatusToggle = async (user) => {
  const isDeactivating = !user.deleted;
  const modalText = isDeactivating
    ? t("pages.dash.users.modals.deactivate.text", { name: user.name })
    : t("pages.dash.users.modals.reactivate.text", { name: user.name });

  modal.confirm(
    modalText,
    isDeactivating ? t("pages.dash.users.modals.deactivate.title") : t("pages.dash.users.modals.reactivate.title"),
    {
      actions: [
        {
          label: t("pages.other.commons.cancel"),
          type: "default",
          keepOpen: true,
        },
        {
          label: isDeactivating ? t("pages.dash.users.actions.deactivate") : t("pages.dash.users.actions.reactivate"),
          type: isDeactivating ? "danger" : "secondary",
          onClick: async (modalId) => {
            try {
              const response = await axios.patch(`/api/users/toggle`, null, {
                params: { id: user.id },
              });

              if (response.data.success) {
                toast.success(
                  isDeactivating ? t("pages.dash.users.toasts.deactivated") : t("pages.dash.users.toasts.reactivated"),
                );
                await loadUsers();
                modal.remove(modalId);
              } else {
                throw new Error("No success");
              }
            } catch (error) {
              toast.error(t("pages.other.commons.errors.generic"));
              console.error("Error toggling user status:", error);
              throw error;
            }
          },
        },
      ],
    },
  );
};
</script>
