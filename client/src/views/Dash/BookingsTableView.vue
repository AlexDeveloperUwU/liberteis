<template>
  <div class="h-full w-full p-6">
    <h1 class="text-3xl font-bold text-text-950 mb-2 k2d">{{ t("pages.dash.bookings.page.title") }}</h1>
    <p class="text-text-800 mb-6">{{ t("pages.dash.bookings.page.description") }}</p>

    <div class="responsive-container mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div
          class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
          <div class="flex items-center gap-2 mb-2">
            <CalendarClock class="w-5 h-5 text-primary-600" />
            <p class="font-medium text-text-800">{{ t("pages.dash.bookings.metrics.totals") }}</p>
          </div>
          <h2 class="text-2xl font-bold text-text-950">{{ metrics.total || 0 }}</h2>
        </div>

        <div
          class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
          <div class="flex items-center gap-2 mb-2">
            <CalendarCheck class="w-5 h-5 text-primary-600" />
            <p class="font-medium text-text-800">{{ t("pages.dash.bookings.metrics.done") }}</p>
          </div>
          <h2 class="text-2xl font-bold text-text-950">{{ metrics.done || 0 }}</h2>
        </div>

        <div
          class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
          <div class="flex items-center gap-2 mb-2">
            <CalendarClock class="w-5 h-5 text-primary-600" />
            <p class="font-medium text-text-800">{{ t("pages.dash.bookings.metrics.todo") }}</p>
          </div>
          <h2 class="text-2xl font-bold text-text-950">{{ metrics.todo || 0 }}</h2>
        </div>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div
        class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <div class="flex items-center mb-6 pb-4 border-b border-background-400">
          <div
            class="p-2 bg-primary-100 rounded-lg border border-primary-500 mr-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
            <CalendarClock class="w-5 h-5 text-primary-600" />
          </div>
          <h2 class="text-xl font-bold text-text-900 k2d">
            {{ t("pages.dash.bookings.page.tableTitle") }}
          </h2>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div class="relative flex-1 max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-text-500" />
            </div>
            <input
              type="text"
              v-model="searchTerm"
              class="block w-full h-10 pl-10 pr-3 py-2 rounded-lg text-sm bg-background-50 border border-background-300 placeholder-text-500 text-text-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
              :placeholder="t('pages.other.commons.search.placeholder') || 'Buscar...'" />
            <div
              v-if="searchTerm"
              @click="searchTerm = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
              <X class="h-4 w-4 text-text-400 hover:text-text-600" />
            </div>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Listbox v-model="bookingFilter" @update:model-value="loadBookings">
              <div class="relative w-full sm:w-40">
                <ListboxButton
                  class="h-10 px-3 rounded-lg text-sm font-medium shadow-sm bg-background-50 border border-background-300 text-text-800 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-all duration-200 flex items-center justify-between w-full">
                  <span class="block truncate text-left">
                    {{ t(`pages.other.commons.status.${bookingFilter}`) || bookingFilter }}
                  </span>
                  <ChevronDown class="w-4 h-4 text-text-400 ml-2" />
                </ListboxButton>
                <transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95">
                  <ListboxOptions
                    class="absolute z-30 mt-1 w-40 bg-background-50 border border-background-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm origin-top-right">
                    <ListboxOption
                      v-for="filter in ['active', 'inactive', 'all']"
                      :key="filter"
                      :value="filter"
                      v-slot="{ active, selected }">
                      <li
                        :class="[
                          selected
                            ? 'bg-primary-100 border-l-primary-500 text-primary-800'
                            : active
                              ? 'bg-primary-50 border-l-primary-300 text-primary-600'
                              : 'text-text-800',
                          'cursor-pointer select-none relative py-2 pl-10 pr-4 transition-all duration-150 border-l-[3px]',
                          selected ? 'border-l-[3px]' : active ? 'border-l-[3px]' : 'border-transparent',
                        ]">
                        <div class="flex items-center">
                          <component :is="filterIcons[filter]" class="mr-2 h-4 w-4 text-primary-600" />
                          <span :class="[selected ? 'font-medium' : 'font-normal']">
                            {{ t(`pages.other.commons.status.${filter}`) }}
                          </span>
                        </div>
                        <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600">
                          <Check class="w-4 h-4 text-primary-600" />
                        </span>
                      </li>
                    </ListboxOption>
                  </ListboxOptions>
                </transition>
              </div>
            </Listbox>

            <button
              @click="$router.push({ name: 'dashBookingsNew' })"
              class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors duration-150 cursor-pointer whitespace-nowrap w-full sm:w-auto">
              <CalendarPlus class="w-4 h-4 mr-2" />
              <span>{{ t("pages.dash.bookings.actions.add") || "Añadir reserva" }}</span>
            </button>
          </div>
        </div>

        <div class="responsive-table-container overflow-x-auto">
          <table class="responsive-table w-full divide-y divide-background-300">
            <thead class="bg-background-50">
              <tr class="border-b border-background-300">
                <th scope="col" class="px-6 py-4 text-left sticky-column sticky left-0 bg-background-50 z-10">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('id')">
                    <Hash class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">ID</span>
                    <SortIcon :active="sortColumn === 'id'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('event')">
                    <CalendarRange class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.bookings.table.event") }}
                    </span>
                    <SortIcon :active="sortColumn === 'event'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('space')">
                    <MapPin class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.bookings.table.space") }}
                    </span>
                    <SortIcon :active="sortColumn === 'space'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('bookingDate')">
                    <Clock class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.bookings.table.bookingDate") }}
                    </span>
                    <SortIcon :active="sortColumn === 'bookingDate'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('bookedBy')">
                    <User class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.bookings.table.bookedBy") }}
                    </span>
                    <SortIcon :active="sortColumn === 'bookedBy'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <Settings class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.bookings.table.actions") }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-background-200">
              <tr v-for="booking in paginatedBookings" :key="booking.id" class="group">
                <td
                  class="px-6 py-4 whitespace-nowrap sticky-column sticky left-0 bg-background-100 group-hover:bg-primary-50 transition-colors duration-150 z-20">
                  <span class="text-sm text-text-800">
                    {{ booking.id }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="ml-4">
                    <div class="text-sm text-text-800 truncate max-w-32">{{ getEventName(booking.eventId) }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="text-sm text-text-800 truncate max-w-32">{{ getSpaceName(booking.space) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="text-sm text-text-800">{{ formatBookingDate(booking.bookingDate) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="text-sm text-text-800 truncate max-w-32">{{ getBookedByName(booking.bookedBy) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="flex items-center gap-2">
                    <button
                      @click="$router.push({ name: 'dashBookingsEdit', params: { id: booking.id } })"
                      class="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors duration-150 cursor-pointer">
                      <Pencil class="w-3 h-3 text-primary-600" />
                      {{ t("pages.dash.bookings.actions.edit") }}
                    </button>
                    <button
                      @click="handleBookingStatusToggle(booking)"
                      :class="[
                        'px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border transition-colors duration-150',
                        booking.deleted
                          ? 'bg-secondary-100 text-secondary-800 border-secondary-200 hover:bg-secondary-200'
                          : 'bg-accent-100 text-accent-800 border-accent-200 hover:bg-accent-200',
                      ]">
                      <component
                        :is="booking.deleted ? CalendarCheck : Trash"
                        class="w-3 h-3"
                        :class="booking.deleted ? 'text-secondary-600' : 'text-accent-600'" />
                      {{
                        booking.deleted
                          ? t("pages.dash.bookings.actions.reactivate")
                          : t("pages.dash.bookings.actions.deactivate")
                      }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 flex justify-end items-center">
          <div class="flex items-center gap-2">
            <button
              @click="currentPage = Math.max(1, currentPage - 1)"
              :disabled="currentPage === 1"
              :class="[
                'h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center transition-colors duration-150',
                currentPage === 1
                  ? 'bg-background-100 text-text-400 border border-background-300 cursor-not-allowed'
                  : 'bg-background-50 text-text-700 border border-background-300 hover:bg-background-200 cursor-pointer',
              ]"
              aria-label="Previous page">
              <ChevronLeft class="w-4 h-4" />
            </button>

            <div
              class="text-sm font-medium text-text-700 px-4 h-10 rounded-lg border border-background-300 bg-background-50 flex items-center justify-center shadow-sm">
              {{ t("pages.other.commons.pagination.page") }} {{ currentPage }}
              {{ t("pages.other.commons.pagination.of") }} {{ totalPages }}
            </div>

            <button
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
              :disabled="currentPage === totalPages"
              :class="[
                'h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center transition-colors duration-150',
                currentPage === totalPages
                  ? 'bg-background-100 text-text-400 border border-background-300 cursor-not-allowed'
                  : 'bg-background-50 text-text-700 border border-background-300 hover:bg-background-200 cursor-pointer',
              ]"
              aria-label="Next page">
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  Hash,
  User,
  Settings,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Search,
  X,
  ChevronUp,
  CalendarClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarRange,
  Clock,
  MapPin,
} from "lucide-vue-next";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch, h, defineComponent } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useModal } from "@/composables/useModal";
import { useToast } from "@/composables/useToast";

const { t, locale } = useI18n();
const route = useRoute();

const searchTerm = ref("");
const bookingFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const filterIcons = {
  active: CalendarCheck,
  inactive: CalendarX,
  all: CalendarClock,
};

const metrics = ref({
  total: 0,
  done: 0,
  todo: 0,
});

const bookings = ref([]);
const events = ref({});
const spaces = ref({});
const requestedSpaces = new Set();
const users = ref({});

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

const SortIcon = defineComponent({
  props: {
    active: Boolean,
    direction: String,
  },
  setup(props) {
    return () => {
      if (!props.active) {
        return h("span", { class: "ml-1 text-text-400 opacity-0 group-hover:opacity-100 transition-opacity" }, [
          h(ChevronUp, { class: "w-3 h-3" }),
        ]);
      }

      return h("span", { class: "ml-1 text-primary-600" }, [
        props.direction === "asc" ? h(ChevronUp, { class: "w-3 h-3" }) : h(ChevronDown, { class: "w-3 h-3" }),
      ]);
    };
  },
});

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
  if (users.value[userId]) {
    return users.value[userId];
  }

  loadUserName(userId);
  return userId;
};

const loadUserName = async (userId) => {
  if (users.value[userId] !== undefined) return;

  try {
    const response = await axios.get(`/api/users?id=${userId}`);
    if (response.data.data && response.data.data.name) {
      users.value[userId] = response.data.data.name;
    }
  } catch (error) {
    console.error(`Error cargando nombre de usuario ${userId}:`, error);
    users.value[userId] = userId;
  }
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

onMounted(async () => {
  if (route.meta.initialData) {
    if (route.meta.initialData.metrics) {
      metrics.value = route.meta.initialData.metrics;
    }

    if (route.meta.initialData.events) {
      loadEventsInfo(route.meta.initialData.events);
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
                await loadBookings();
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
