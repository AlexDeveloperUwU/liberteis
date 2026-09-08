<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.categories.page.title')" :description="t('pages.dash.categories.page.description')" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard icon="bookmark" :label="t('pages.dash.categories.metrics.totals')" :value="metrics.total || 0" />
      <MetricCard icon="bookmark" :label="t('pages.dash.categories.metrics.active')" :value="metrics.active || 0" />
      <MetricCard icon="bookmark" :label="t('pages.dash.categories.metrics.inactive')" :value="metrics.inactive || 0" />
    </div>

    <DsCard :title="t('pages.dash.categories.page.tableTitle')" icon="bookmark">
      <FilterBar
        v-model:search-value="searchTerm"
        :search-placeholder="t('pages.other.commons.search.placeholder')"
        class="mb-6">
        <template #filters>
          <SelectMenu v-model="categoryFilter" :options="statusOptions" width="10rem" @update:model-value="loadCategories" />
        </template>
        <template #actions>
          <DsButton icon="plus" @click="$router.push({ name: 'dashCategoriesNew' })">
            {{ t("pages.dash.categories.actions.add") }}
          </DsButton>
        </template>
      </FilterBar>

      <DataTable
        :columns="columns"
        :rows="paginatedCategories"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="toggleSort">
        <template #cell-spaces="{ row }">
          <div v-if="row.spaces && row.spaces.length" class="flex flex-wrap gap-1">
            <DsPill v-for="spaceId in row.spaces.slice(0, 3)" :key="spaceId" tone="primary">
              {{ getSpaceName(spaceId) }}
            </DsPill>
            <DsPill v-if="row.spaces.length > 3" tone="neutral">+{{ row.spaces.length - 3 }}</DsPill>
          </div>
          <span v-else class="text-text-500">{{ t("pages.dash.categories.table.noSpaces") }}</span>
        </template>
        <template #cell-createdBy="{ row }">
          <span class="truncate max-w-32 block">{{ getCreatedByName(row.createdBy) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <DsPill as="button" icon="pencil" @click="$router.push({ name: 'dashCategoriesEdit', params: { id: row.id } })">
              {{ t("pages.dash.categories.actions.edit") }}
            </DsPill>
            <DsPill
              as="button"
              :tone="row.deleted ? 'success' : 'danger'"
              :icon="row.deleted ? 'check-circle' : 'trash'"
              @click="handleCategoryStatusToggle(row)">
              {{ row.deleted ? t("pages.dash.categories.actions.reactivate") : t("pages.dash.categories.actions.delete") }}
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
import PageHeader from "@/components/data/PageHeader.vue";
import MetricCard from "@/components/core/MetricCard.vue";
import DsCard from "@/components/core/DsCard.vue";
import FilterBar from "@/components/data/FilterBar.vue";
import SelectMenu from "@/components/forms/SelectMenu.vue";
import DsButton from "@/components/core/DsButton.vue";
import DataTable from "@/components/data/DataTable.vue";
import DsPill from "@/components/core/DsPill.vue";
import DsPagination from "@/components/navigation/DsPagination.vue";

const { t } = useI18n();
const route = useRoute();

const searchTerm = ref("");
const categoryFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const statusOptions = computed(() =>
  ["active", "inactive", "all"].map((value) => ({ value, label: t(`pages.other.commons.status.${value}`), icon: "bookmark" })),
);

const columns = computed(() => [
  { key: "id", label: t("pages.other.commons.table.idHeader"), icon: "hash", sortable: true },
  { key: "name", label: t("pages.dash.categories.table.name"), icon: "bookmark", sortable: true },
  { key: "spaces", label: t("pages.dash.categories.table.spaces"), icon: "map-pin", sortable: true },
  { key: "createdBy", label: t("pages.dash.categories.table.createdBy"), icon: "user", sortable: true },
  { key: "actions", label: t("pages.dash.categories.table.actions"), icon: "settings" },
]);

const metrics = ref({
  total: 0,
  active: 0,
  inactive: 0,
});

const categories = ref([]);
const spaces = ref({});
const requestedSpaces = new Set();

const isLoading = ref(false);
const allUsers = ref([]);

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

const filteredCategories = computed(() => {
  let result = categories.value;

  if (searchTerm.value.trim()) {
    result = result.filter((category) => {
      const displayValues = {
        id: category.id?.toString() || "",
        name: category.name || "",
        createdBy: category.createdBy || "",
        spaces: category.spaces?.map((spaceId) => getSpaceName(spaceId)).join(" ") || "",
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
        case "spaces":
          valueA = a.spaces?.length || 0;
          valueB = b.spaces?.length || 0;
          break;
        case "createdBy":
          valueA = getCreatedByName(a.createdBy)?.toLowerCase() || "";
          valueB = getCreatedByName(b.createdBy)?.toLowerCase() || "";
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
  return Math.max(1, Math.ceil(filteredCategories.value.length / itemsPerPage));
});

const paginatedCategories = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredCategories.value.slice(start, end);
});

const loadCategories = async () => {
  try {
    isLoading.value = true;

    const response = await axios.get("/api/categories", {
      params: {
        status: categoryFilter.value,
      },
    });

    categories.value = response.data.data || [];

    if (response.data.metrics) {
      metrics.value = response.data.metrics;
    } else {
      try {
        const metricsResponse = await axios.get("/api/categories/count");
        if (metricsResponse.data && metricsResponse.data.success) {
          metrics.value = metricsResponse.data.data;
        }
      } catch (error) {
        console.error("Error cargando métricas:", error);
      }
    }

    await loadSpaceInfo();

    currentPage.value = 1;
  } catch (error) {
    console.error("Error cargando categorías:", error);
    categories.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadSpaceInfo = async () => {
  const spaceIds = new Set();
  categories.value.forEach((category) => {
    if (category.spaces && Array.isArray(category.spaces)) {
      category.spaces.forEach((spaceId) => {
        if (spaceId && !spaces.value[spaceId] && !requestedSpaces.has(spaceId)) {
          spaceIds.add(spaceId);
        }
      });
    }
  });

  for (const spaceId of spaceIds) {
    requestedSpaces.add(spaceId);
    try {
      const response = await axios.get(`/api/spaces`, {
        params: { id: spaceId, includeInactive: true },
      });
      if (response.data.success && response.data.data) {
        spaces.value[spaceId] = response.data.data;
      }
    } catch (error) {
      console.error(`Error cargando espacio ${spaceId}:`, error);
    }
  }
};

const getSpaceName = (spaceId) => {
  if (spaces.value[spaceId]) {
    return spaces.value[spaceId].name;
  }
  if (!requestedSpaces.has(spaceId)) {
    requestedSpaces.add(spaceId);
    axios
      .get(`/api/spaces`, {
        params: { id: spaceId, includeInactive: true },
      })
      .then((response) => {
        if (response.data.success && response.data.data) {
          spaces.value[spaceId] = response.data.data;
        }
      })
      .catch((error) => {
        console.error(`Error cargando espacio puntual ${spaceId}:`, error);
      });
  }
  return spaceId;
};

onMounted(async () => {
  loadUsers();

  if (route.meta.initialData) {
    if (route.meta.initialData.metrics) {
      metrics.value = route.meta.initialData.metrics;
    }

    if (route.meta.initialData.spaces && Array.isArray(route.meta.initialData.spaces)) {
      for (const space of route.meta.initialData.spaces) {
        if (space && space.id) {
          spaces.value[space.id] = space;
        }
      }
    }

    if (route.meta.initialData.categories) {
      categories.value = route.meta.initialData.categories;
      await loadSpaceInfo();
    }
  } else {
    await loadCategories();
  }
});

const getCreatedByName = (createdById) => {
  if (createdById === "System") {
    return "Sistema";
  }

  const user = allUsers.value.find((u) => u.id === createdById);
  return user ? user.name : createdById;
};

const loadUsers = async () => {
  try {
    const response = await axios.get("/api/users", { params: { status: "active" } });
    if (response.data.success) {
      allUsers.value = response.data.data;
    }
  } catch (error) {
    console.error("Error cargando usuarios:", error);
  }
};

const refreshMetrics = async () => {
  try {
    const metricsResponse = await axios.get("/api/categories/count");
    if (metricsResponse.data && metricsResponse.data.success) {
      metrics.value = metricsResponse.data.data;
    }
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }
};

const modal = useModal();
const toast = useToast();

const handleCategoryStatusToggle = async (category) => {
  const isDeactivating = !category.deleted;

  modal.confirm(
    isDeactivating
      ? t("pages.dash.categories.modals.deactivate.text", { name: category.name })
      : t("pages.dash.categories.modals.reactivate.text", { name: category.name }),
    isDeactivating
      ? t("pages.dash.categories.modals.deactivate.title")
      : t("pages.dash.categories.modals.reactivate.title"),
    {
      actions: [
        {
          label: t("pages.other.commons.cancel"),
          type: "default",
        },
        {
          label: isDeactivating
            ? t("pages.dash.categories.actions.deactivate")
            : t("pages.dash.categories.actions.reactivate"),
          type: isDeactivating ? "danger" : "secondary",
          onClick: async () => {
            try {
              const response = await axios.patch(`/api/categories/toggle`, null, {
                params: { id: category.id },
              });

              if (response.data.success) {
                toast.success(
                  isDeactivating
                    ? t("pages.dash.categories.toasts.deactivated")
                    : t("pages.dash.categories.toasts.reactivated"),
                );

                if (categoryFilter.value === "all") {
                  category.deleted = isDeactivating;
                } else {
                  categories.value = categories.value.filter((c) => c.id !== category.id);
                }

                await refreshMetrics();
              }
            } catch (error) {
              toast.error(t("pages.other.commons.errors.generic"));
              console.error("Error toggling category status:", error);
            }
          },
        },
      ],
    },
  );
};
</script>
