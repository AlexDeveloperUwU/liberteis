<template>
  <div class="h-full w-full p-6">
    <PageHeader :title="t('pages.dash.bookings.page.title')" :description="t('pages.dash.bookings.page.description')" />

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <MetricCard icon="calendar-clock" :label="t('pages.dash.bookings.metrics.totals')" :value="metrics.total || 0" />
      <MetricCard icon="calendar-check-2" :label="t('pages.dash.bookings.metrics.done')" :value="metrics.done || 0" />
      <MetricCard icon="calendar-clock" :label="t('pages.dash.bookings.metrics.todo')" :value="metrics.todo || 0" />
    </div>

    <DsCard :title="t('pages.dash.bookings.page.tableTitle')" icon="calendar-clock">
      <FilterBar
        v-model:search-value="searchTerm"
        :search-placeholder="t('pages.other.commons.search.placeholder')"
        class="mb-6">
        <template #filters>
          <SelectMenu v-model="bookingFilter" :options="statusOptions" width="10rem" @update:model-value="loadBookings" />
        </template>
        <template #actions>
          <DsButton icon="calendar-1" @click="$router.push({ name: 'dashBookingsNew' })">
            {{ t("pages.dash.bookings.actions.add") }}
          </DsButton>
        </template>
      </FilterBar>

      <DataTable
        :columns="columns"
        :rows="paginatedBookings"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @sort="toggleSort">
        <template #cell-event="{ row }">
          <span class="truncate max-w-32 block">{{ getEventName(row.eventId) }}</span>
        </template>
        <template #cell-space="{ row }">
          <span class="truncate max-w-32 block">{{ getSpaceName(row.space) }}</span>
        </template>
        <template #cell-bookingDate="{ row }">{{ formatBookingDate(row.bookingDate) }}</template>
        <template #cell-bookedBy="{ row }">
          <span class="truncate max-w-32 block">{{ getBookedByName(row.bookedBy) }}</span>
        </template>
        <template #cell-actions="{ row }">
          <div class="flex items-center gap-2">
            <DsPill as="button" icon="pencil" @click="$router.push({ name: 'dashBookingsEdit', params: { id: row.id } })">
              {{ t("pages.dash.bookings.actions.edit") }}
            </DsPill>
            <DsPill
              as="button"
              :tone="row.deleted ? 'success' : 'danger'"
              :icon="row.deleted ? 'calendar-check-2' : 'trash'"
              @click="handleBookingStatusToggle(row)">
              {{ row.deleted ? t("pages.dash.bookings.actions.reactivate") : t("pages.dash.bookings.actions.deactivate") }}
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

const { t, locale } = useI18n();
const route = useRoute();

const searchTerm = ref("");
const bookingFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const statusOptions = computed(() =>
  ["active", "inactive", "all"].map((value) => ({
    value,
    label: t(`pages.other.commons.status.${value}`),
    icon: { active: "calendar-check-2", inactive: "calendar-x", all: "calendar-clock" }[value],
  })),
);

const columns = computed(() => [
  { key: "id", label: t("pages.other.commons.table.idHeader"), icon: "hash", sortable: true },
  { key: "event", label: t("pages.dash.bookings.table.event"), icon: "calendar-days", sortable: true },
  { key: "space", label: t("pages.dash.bookings.table.space"), icon: "map-pin", sortable: true },
  { key: "bookingDate", label: t("pages.dash.bookings.table.bookingDate"), icon: "clock", sortable: true },
  { key: "bookedBy", label: t("pages.dash.bookings.table.bookedBy"), icon: "user", sortable: true },
  { key: "actions", label: t("pages.dash.bookings.table.actions"), icon: "settings" },
]);

const metrics = ref({
  total: 0,
  done: 0,
  todo: 0,
});

const bookings = ref([]);
const events = ref({});
const spaces = ref({});
const requestedSpaces = new Set();
const allUsers = ref([]);

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

const formatBookingDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(locale.value);
};

const getEventName = (eventId) => {
  if (!eventId) return "";
  return events.value[eventId]?.title || eventId;
};

const getSpaceName = (spaceId) => {
  if (!spaceId) return "";

  if (spaces.value[spaceId]) {
    return spaces.value[spaceId].name;
  }

  if (!requestedSpaces.has(spaceId)) {
    requestedSpaces.add(spaceId);
    axios
      .get(`/api/spaces`, { params: { id: spaceId } })
      .then((response) => {
        if (response.data.success && response.data.data) {
          spaces.value[spaceId] = response.data.data;
        }
      })
      .catch((error) => {
        console.error(`Error cargando espacio ${spaceId}:`, error);
      });
  }
  return spaceId;
};

const getBookedByName = (userId) => {
  const user = allUsers.value.find((u) => u.id === userId);
  return user ? user.name : userId;
};

const filteredBookings = computed(() => {
  let result = bookings.value;

  if (searchTerm.value.trim()) {
    result = result.filter((booking) => {
      const displayValues = {
        id: booking.id?.toString() || "",
        event: getEventName(booking.eventId) || "",
        space: getSpaceName(booking.space) || "",
        bookingDate: formatBookingDate(booking.bookingDate) || "",
        bookedBy: getBookedByName(booking.bookedBy) || "",
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
        case "event":
          valueA = getEventName(a.eventId)?.toLowerCase() || "";
          valueB = getEventName(b.eventId)?.toLowerCase() || "";
          break;
        case "space":
          valueA = getSpaceName(a.space)?.toLowerCase() || "";
          valueB = getSpaceName(b.space)?.toLowerCase() || "";
          break;
        case "bookingDate":
          valueA = a.bookingDate ? new Date(a.bookingDate).getTime() : 0;
          valueB = b.bookingDate ? new Date(b.bookingDate).getTime() : 0;
          break;
        case "bookedBy":
          valueA = getBookedByName(a.bookedBy)?.toLowerCase() || "";
          valueB = getBookedByName(b.bookedBy)?.toLowerCase() || "";
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
  return Math.max(1, Math.ceil(filteredBookings.value.length / itemsPerPage));
});

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredBookings.value.slice(start, end);
});

const loadEventsInfo = (eventsList) => {
  if (!Array.isArray(eventsList)) return;
  for (const event of eventsList) {
    if (event && event.id) {
      events.value[event.id] = event;
    }
  }
};

const loadSpacesInfo = (spacesList) => {
  if (!Array.isArray(spacesList)) return;
  for (const space of spacesList) {
    if (space && space.id) {
      spaces.value[space.id] = space;
    }
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

const loadBookings = async () => {
  try {
    isLoading.value = true;

    const response = await axios.get("/api/bookings", {
      params: {
        status: bookingFilter.value,
      },
    });

    bookings.value = response.data.data || [];

    try {
      const metricsResponse = await axios.get("/api/bookings/count");
      if (metricsResponse.data && metricsResponse.data.success) {
        metrics.value = metricsResponse.data.data;
      }
    } catch (error) {
      console.error("Error cargando métricas:", error);
    }

    if (Object.keys(events.value).length === 0) {
      try {
        const eventsResponse = await axios.get("/api/events");
        if (eventsResponse.data.success) {
          loadEventsInfo(eventsResponse.data.data);
        }
      } catch (error) {
        console.error("Error cargando eventos:", error);
      }
    }

    currentPage.value = 1;
  } catch (error) {
    console.error("Error cargando reservas:", error);
    bookings.value = [];
  } finally {
    isLoading.value = false;
  }
};

const refreshMetrics = async () => {
  try {
    const metricsResponse = await axios.get("/api/bookings/count");
    if (metricsResponse.data && metricsResponse.data.success) {
      metrics.value = metricsResponse.data.data;
    }
  } catch (error) {
    console.error("Error cargando métricas:", error);
  }
};

onMounted(async () => {
  loadUsers();

  if (route.meta.initialData) {
    if (route.meta.initialData.metrics) {
      metrics.value = route.meta.initialData.metrics;
    }

    if (route.meta.initialData.events) {
      loadEventsInfo(route.meta.initialData.events);
    }

    if (route.meta.initialData.spaces) {
      loadSpacesInfo(route.meta.initialData.spaces);
    }

    if (route.meta.initialData.bookings) {
      bookings.value = route.meta.initialData.bookings;
    }

    if (!route.meta.initialData.bookings || !route.meta.initialData.events) {
      await loadBookings();
    }
  } else {
    await loadBookings();
  }
});

const modal = useModal();
const toast = useToast();
const handleBookingStatusToggle = async (booking) => {
  const isDeactivating = !booking.deleted;
  const bookingLabel = getEventName(booking.eventId);
  const modalText = isDeactivating
    ? t("pages.dash.bookings.modals.deactivate.text", { name: bookingLabel })
    : t("pages.dash.bookings.modals.reactivate.text", { name: bookingLabel });

  modal.confirm(
    modalText,
    isDeactivating
      ? t("pages.dash.bookings.modals.deactivate.title")
      : t("pages.dash.bookings.modals.reactivate.title"),
    {
      actions: [
        {
          label: t("pages.other.commons.cancel"),
          type: "default",
        },
        {
          label: isDeactivating
            ? t("pages.dash.bookings.actions.deactivate")
            : t("pages.dash.bookings.actions.reactivate"),
          type: isDeactivating ? "danger" : "secondary",
          onClick: async () => {
            try {
              const response = await axios.patch(`/api/bookings/toggle`, null, {
                params: { id: booking.id, scope: "single" },
              });

              if (response.data.success) {
                toast.success(
                  isDeactivating
                    ? t("pages.dash.bookings.toasts.deactivated", { name: bookingLabel })
                    : t("pages.dash.bookings.toasts.reactivated", { name: bookingLabel }),
                );

                if (bookingFilter.value === "all") {
                  booking.deleted = isDeactivating;
                } else {
                  bookings.value = bookings.value.filter((b) => b.id !== booking.id);
                }

                await refreshMetrics();
              }
            } catch (error) {
              toast.error(t("pages.other.commons.errors.generic"));
              console.error("Error toggling booking status:", error);
            }
          },
        },
      ],
    },
  );
};
</script>
