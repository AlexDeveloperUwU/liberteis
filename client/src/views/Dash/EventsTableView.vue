<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.events.page.title')" :description="t('pages.dash.events.page.description')" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard icon="calendar-days" :label="t('pages.dash.events.metrics.totals')" :value="metrics.total || 0" />
      <MetricCard icon="calendar-check-2" :label="t('pages.dash.events.metrics.active')" :value="metrics.active || 0" />
      <MetricCard icon="calendar-x" :label="t('pages.dash.events.metrics.inactive')" :value="metrics.inactive || 0" />
    </div>

    <DsCard :title="t('pages.dash.events.page.tableTitle')" icon="calendar-days">
      <FilterBar
        v-model:search-value="searchTerm"
        :search-placeholder="t('pages.other.commons.search.placeholder')"
        class="mb-6">
        <template #filters>
          <SelectMenu v-model="eventFilter" :options="statusOptions" width="10rem" @update:model-value="loadEvents" />
        </template>
        <template #actions>
          <DsButton icon="plus" @click="$router.push({ name: 'dashEventsNew' })">
            {{ t("pages.dash.events.actions.add") }}
          </DsButton>
        </template>
      </FilterBar>

      <DataTable
        :columns="columns"
        :rows="paginatedEvents"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="toggleSort">
        <template #cell-info="{ row }">
          <span class="truncate max-w-32 block">{{ row.info }}</span>
        </template>
        <template #cell-duration="{ row }">{{ row.duration }} min</template>
        <template #cell-category="{ row }">
          <DsPill v-if="row.category" tone="primary">{{ getCategoryName(row.category) }}</DsPill>
          <span v-else class="text-text-500">{{ t("pages.dash.events.table.noCategory") }}</span>
        </template>
        <template #cell-createdBy="{ row }">
          <span class="truncate max-w-32 block">{{ getCreatedByName(row.createdBy) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <DsPill as="button" icon="pencil" @click="$router.push({ name: 'dashEventsEdit', params: { id: row.id } })">
              {{ t("pages.dash.events.actions.edit") }}
            </DsPill>
            <DsPill
              as="button"
              :tone="row.deleted ? 'success' : 'danger'"
              :icon="row.deleted ? 'calendar-check-2' : 'trash'"
              @click="handleEventStatusToggle(row)">
              {{ row.deleted ? t("pages.dash.events.actions.reactivate") : t("pages.dash.events.actions.deactivate") }}
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
const eventFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const statusOptions = computed(() =>
  ["active", "inactive", "all"].map((value) => ({
    value,
    label: t(`pages.other.commons.status.${value}`),
    icon: { active: "calendar-check-2", inactive: "calendar-x", all: "calendar-days" }[value],
  })),
);

const columns = computed(() => [
  { key: "id", label: t("pages.other.commons.table.idHeader"), icon: "hash", sortable: true },
  { key: "title", label: t("pages.dash.events.table.title"), icon: "calendar-days", sortable: true },
  { key: "info", label: t("pages.dash.events.table.info"), icon: "file-text", sortable: true },
  { key: "duration", label: t("pages.dash.events.table.duration"), icon: "clock", sortable: true },
  { key: "category", label: t("pages.dash.events.table.category"), icon: "bookmark", sortable: true },
  { key: "createdBy", label: t("pages.dash.events.table.createdBy"), icon: "user", sortable: true },
  { key: "actions", label: t("pages.dash.events.table.actions"), icon: "settings" },
]);

const metrics = ref({
  total: 0,
  active: 0,
  inactive: 0,
});

const events = ref([]);
const categories = ref({});
const requestedCategories = new Set();

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

const filteredEvents = computed(() => {
  let result = events.value;

  if (searchTerm.value.trim()) {
    result = result.filter((event) => {
      const displayValues = {
        id: event.id?.toString() || "",
        title: event.title || "",
        info: event.info || "",
        duration: event.duration?.toString() || "",
        category: getCategoryName(event.category) || "",
        createdBy: event.createdBy || "",
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
        case "title":
          valueA = a.title?.toLowerCase() || "";
          valueB = b.title?.toLowerCase() || "";
          break;
        case "info":
          valueA = a.info?.toLowerCase() || "";
          valueB = b.info?.toLowerCase() || "";
          break;
        case "duration":
          valueA = a.duration || 0;
          valueB = b.duration || 0;
          break;
        case "category":
          valueA = getCategoryName(a.category)?.toLowerCase() || "";
          valueB = getCategoryName(b.category)?.toLowerCase() || "";
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
  return Math.max(1, Math.ceil(filteredEvents.value.length / itemsPerPage));
});

const paginatedEvents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredEvents.value.slice(start, end);
});

const loadEvents = async () => {
  try {
    isLoading.value = true;

    const response = await axios.get("/api/events", {
      params: {
        status: eventFilter.value,
      },
    });

    events.value = response.data.data || [];

    if (response.data.metrics) {
      metrics.value = response.data.metrics;
    } else {
      try {
        const metricsResponse = await axios.get("/api/events/count");
        if (metricsResponse.data && metricsResponse.data.success) {
          metrics.value = metricsResponse.data.data;
        }
      } catch (error) {
        console.error("Error cargando métricas:", error);
      }
    }

    await loadCategoriesInfo();

    currentPage.value = 1;
  } catch (error) {
    console.error("Error cargando eventos:", error);
    events.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadCategoriesInfo = async () => {
  const categoryIds = new Set();
  events.value.forEach((event) => {
    if (event.category && !categories.value[event.category] && !requestedCategories.has(event.category)) {
      categoryIds.add(event.category);
    }
  });

  for (const categoryId of categoryIds) {
    requestedCategories.add(categoryId);
    try {
      const response = await axios.get(`/api/categories`, {
        params: { id: categoryId, includeInactive: true },
      });
      if (response.data.success && response.data.data) {
        categories.value[categoryId] = response.data.data;
      }
    } catch (error) {
      console.error(`Error cargando categoría ${categoryId}:`, error);
    }
  }
};

const getCategoryName = (categoryId) => {
  if (!categoryId) return "";

  if (categories.value[categoryId]) {
    return categories.value[categoryId].name;
  }

  if (!requestedCategories.has(categoryId)) {
    requestedCategories.add(categoryId);
    axios
      .get(`/api/categories`, {
        params: { id: categoryId, includeInactive: true },
      })
      .then((response) => {
        if (response.data.success && response.data.data) {
          categories.value[categoryId] = response.data.data;
        }
      })
      .catch((error) => {
        console.error(`Error cargando categoría puntual ${categoryId}:`, error);
      });
  }
  return categoryId;
};

onMounted(async () => {
  loadUsers();

  if (route.meta.initialData) {
    if (route.meta.initialData.metrics) {
      metrics.value = route.meta.initialData.metrics;
    }

    if (route.meta.initialData.categories && Array.isArray(route.meta.initialData.categories)) {
      for (const category of route.meta.initialData.categories) {
        if (category && category.id) {
          categories.value[category.id] = category;
        }
      }
    }

    if (route.meta.initialData.events) {
      events.value = route.meta.initialData.events;
      await loadCategoriesInfo();
    }
  } else {
    await loadEvents();
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
    const metricsResponse = await axios.get("/api/events/count");
    if (metricsResponse.data && metricsResponse.data.success) {
      metrics.value = metricsResponse.data.data;
    }
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }
};

const modal = useModal();
const toast = useToast();
const handleEventStatusToggle = async (event) => {
  const isDeactivating = !event.deleted;
  const modalText = isDeactivating
    ? t("pages.dash.events.modals.deactivate.text", { name: event.title })
    : t("pages.dash.events.modals.reactivate.text", { name: event.title });

  modal.confirm(
    modalText,
    isDeactivating ? t("pages.dash.events.modals.deactivate.title") : t("pages.dash.events.modals.reactivate.title"),
    {
      actions: [
        {
          label: t("pages.other.commons.cancel"),
          type: "default",
        },
        {
          label: isDeactivating ? t("pages.dash.events.actions.deactivate") : t("pages.dash.events.actions.reactivate"),
          type: isDeactivating ? "danger" : "secondary",
          onClick: async () => {
            try {
              const response = await axios.patch(`/api/events/toggle`, null, {
                params: { id: event.id },
              });

              if (response.data.success) {
                toast.success(
                  isDeactivating
                    ? t("pages.dash.events.toasts.deactivated", { name: event.title })
                    : t("pages.dash.events.toasts.reactivated", { name: event.title }),
                );

                if (eventFilter.value === "all") {
                  event.deleted = isDeactivating;
                } else {
                  events.value = events.value.filter((e) => e.id !== event.id);
                }

                await refreshMetrics();
              }
            } catch (error) {
              toast.error(t("pages.other.commons.errors.generic"));
              console.error("Error toggling event status:", error);
            }
          },
        },
      ],
    },
  );
};
</script>
