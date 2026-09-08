<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.spaces.page.title')" :description="t('pages.dash.spaces.page.description')" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard icon="map-pin" :label="t('pages.dash.spaces.metrics.totals')" :value="metrics.total || 0" />
      <MetricCard icon="check-circle" :label="t('pages.dash.spaces.metrics.active')" :value="metrics.active || 0" />
      <MetricCard icon="x-circle" :label="t('pages.dash.spaces.metrics.inactive')" :value="metrics.inactive || 0" />
    </div>

    <DsCard :title="t('pages.dash.spaces.page.tableTitle')" icon="map-pin">
      <FilterBar
        v-model:search-value="searchTerm"
        :search-placeholder="t('pages.other.commons.search.placeholder')"
        class="mb-6">
        <template #filters>
          <SelectMenu v-model="spaceFilter" :options="statusOptions" width="10rem" @update:model-value="loadSpaces" />
        </template>
        <template #actions>
          <DsButton icon="plus" @click="$router.push({ name: 'dashSpacesNew' })">
            {{ t("pages.dash.spaces.actions.add") }}
          </DsButton>
        </template>
      </FilterBar>

      <DataTable
        :columns="columns"
        :rows="paginatedSpaces"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="toggleSort">
        <template #cell-info="{ row }">
          <span class="truncate max-w-40 block" :title="row.info">{{ row.info }}</span>
        </template>
        <template #cell-createdBy="{ row }">
          <span class="truncate max-w-32 block">{{ getCreatedByName(row.createdBy) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <DsPill as="button" icon="pencil" @click="$router.push({ name: 'dashSpacesEdit', params: { id: row.id } })">
              {{ t("pages.dash.spaces.actions.edit") }}
            </DsPill>
            <DsPill
              v-if="!isSystemSpace(row)"
              as="button"
              :tone="row.deleted ? 'success' : 'danger'"
              :icon="row.deleted ? 'check-circle' : 'trash'"
              @click="handleSpaceStatusToggle(row)">
              {{ row.deleted ? t("pages.dash.spaces.actions.reactivate") : t("pages.dash.spaces.actions.delete") }}
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
const spaceFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const statusOptions = computed(() =>
  ["active", "inactive", "all"].map((value) => ({
    value,
    label: t(`pages.other.commons.status.${value}`),
    icon: { active: "check-circle", inactive: "x-circle", all: "map-pin" }[value],
  })),
);

const columns = computed(() => [
  { key: "id", label: t("pages.other.commons.table.idHeader"), icon: "hash", sortable: true },
  { key: "name", label: t("pages.dash.spaces.table.name"), icon: "bookmark", sortable: true },
  { key: "location", label: t("pages.dash.spaces.table.location"), icon: "map-pin", sortable: true },
  { key: "info", label: t("pages.dash.spaces.table.info"), icon: "clipboard-list", sortable: true },
  { key: "createdBy", label: t("pages.dash.spaces.table.createdBy"), icon: "user", sortable: true },
  { key: "actions", label: t("pages.dash.spaces.table.actions"), icon: "settings" },
]);

const metrics = ref({
  total: 0,
  active: 0,
  inactive: 0,
});

const spaces = ref([]);

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

const filteredSpaces = computed(() => {
  let result = spaces.value;

  if (searchTerm.value.trim()) {
    result = result.filter((space) => {
      const displayValues = {
        id: space.id?.toString() || "",
        name: space.name || "",
        location: space.location || "",
        info: space.info || "",
        createdBy: space.createdBy || "",
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
        case "location":
          valueA = a.location?.toLowerCase() || "";
          valueB = b.location?.toLowerCase() || "";
          break;
        case "info":
          valueA = a.info?.toLowerCase() || "";
          valueB = b.info?.toLowerCase() || "";
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
  return Math.max(1, Math.ceil(filteredSpaces.value.length / itemsPerPage));
});

const paginatedSpaces = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredSpaces.value.slice(start, end);
});

const loadSpaces = async () => {
  try {
    isLoading.value = true;

    const response = await axios.get("/api/spaces", {
      params: {
        status: spaceFilter.value,
      },
    });

    spaces.value = response.data.data || [];

    if (response.data.metrics) {
      metrics.value = response.data.metrics;
    } else {
      try {
        const metricsResponse = await axios.get("/api/spaces/count");
        if (metricsResponse.data && metricsResponse.data.success) {
          metrics.value = metricsResponse.data.data;
        }
      } catch (error) {
        console.error("Error cargando métricas:", error);
      }
    }

    currentPage.value = 1;
  } catch (error) {
    console.error("Error cargando espacios:", error);
    spaces.value = [];
  } finally {
    isLoading.value = false;
  }
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

onMounted(async () => {
  loadUsers();

  if (route.meta.initialData) {
    if (route.meta.initialData.metrics) {
      metrics.value = route.meta.initialData.metrics;
    }

    if (route.meta.initialData.spaces) {
      spaces.value = route.meta.initialData.spaces;
    }
  } else {
    await loadSpaces();
  }
});

const isSystemSpace = (space) => {
  return space.createdBy === "System";
};

const getCreatedByName = (createdById) => {
  if (createdById === "System") {
    return "Sistema";
  }

  const user = allUsers.value.find((u) => u.id === createdById);
  return user ? user.name : createdById;
};

const refreshMetrics = async () => {
  try {
    const metricsResponse = await axios.get("/api/spaces/count");
    if (metricsResponse.data && metricsResponse.data.success) {
      metrics.value = metricsResponse.data.data;
    }
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }
};

const modal = useModal();
const toast = useToast();

const handleSpaceStatusToggle = async (space) => {
  const isDeactivating = !space.deleted;

  modal.confirm(
    isDeactivating
      ? t("pages.dash.spaces.modals.deactivate.text", { name: space.name })
      : t("pages.dash.spaces.modals.reactivate.text", { name: space.name }),
    isDeactivating ? t("pages.dash.spaces.modals.deactivate.title") : t("pages.dash.spaces.modals.reactivate.title"),
    {
      actions: [
        {
          label: t("pages.other.commons.cancel"),
          type: "default",
        },
        {
          label: isDeactivating ? t("pages.dash.spaces.actions.deactivate") : t("pages.dash.spaces.actions.reactivate"),
          type: isDeactivating ? "danger" : "secondary",
          onClick: async () => {
            try {
              const response = await axios.patch(`/api/spaces/toggle`, null, {
                params: { id: space.id },
              });

              if (response.data.success) {
                toast.success(
                  isDeactivating
                    ? t("pages.dash.spaces.toasts.deactivated")
                    : t("pages.dash.spaces.toasts.reactivated"),
                );

                if (spaceFilter.value === "all") {
                  space.deleted = isDeactivating;
                } else {
                  spaces.value = spaces.value.filter((s) => s.id !== space.id);
                }

                await refreshMetrics();
              }
            } catch (error) {
              toast.error(t("pages.other.commons.errors.generic"));
              console.error("Error toggling space status:", error);
            }
          },
        },
      ],
    },
  );
};
</script>
