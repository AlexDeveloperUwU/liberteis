<template>
  <div class="h-full w-full p-6">
    <h1 class="text-3xl font-bold text-text-950 mb-2 k2d">{{ t("pages.dash.categories.page.title") }}</h1>
    <p class="text-text-800 mb-6">{{ t("pages.dash.categories.page.description") }}</p>

    <div class="responsive-container mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div
          class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
          <div class="flex items-center gap-2 mb-2">
            <Bookmark class="w-5 h-5 text-primary-600" />
            <p class="font-medium text-text-800">{{ t("pages.dash.categories.metrics.totals") }}</p>
          </div>
          <h2 class="text-2xl font-bold text-text-950">{{ metrics.total || 0 }}</h2>
        </div>

        <div
          class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
          <div class="flex items-center gap-2 mb-2">
            <BookmarkCheck class="w-5 h-5 text-primary-600" />
            <p class="font-medium text-text-800">{{ t("pages.dash.categories.metrics.active") }}</p>
          </div>
          <h2 class="text-2xl font-bold text-text-950">{{ metrics.active || 0 }}</h2>
        </div>

        <div
          class="bg-background-100 p-4 shadow-md hover:shadow-xl rounded-lg flex flex-col border-[1.5px] border-background-300 hover:border-primary-400 transition-all duration-200">
          <div class="flex items-center gap-2 mb-2">
            <BookmarkX class="w-5 h-5 text-primary-600" />
            <p class="font-medium text-text-800">{{ t("pages.dash.categories.metrics.inactive") }}</p>
          </div>
          <h2 class="text-2xl font-bold text-text-950">{{ metrics.inactive || 0 }}</h2>
        </div>
      </div>
    </div>

    <div class="gap-6 mt-6">
      <div
        class="bg-background-100 p-6 rounded-lg border-[1.5px] border-background-300 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-200">
        <div class="flex items-center mb-6 pb-4 border-b border-background-400">
          <div
            class="p-2 bg-primary-100 rounded-lg border border-primary-500 mr-3 shadow-[0_2px_8px_0_rgba(0,0,0,0.15)]">
            <Bookmark class="w-5 h-5 text-primary-600" />
          </div>
          <h2 class="text-xl font-bold text-text-900 k2d">
            {{ t("pages.dash.categories.page.tableTitle") }}
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
            <Listbox v-model="categoryFilter" @update:model-value="loadCategories">
              <div class="relative w-full sm:w-40">
                <ListboxButton
                  class="h-10 px-3 rounded-lg text-sm font-medium shadow-sm bg-background-50 border border-background-300 text-text-800 focus:outline-none focus:ring-2 focus:ring-primary-500 hover:border-primary-300 transition-all duration-200 flex items-center justify-between w-full">
                  <span class="block truncate text-left">
                    {{ t(`pages.other.commons.status.${categoryFilter}`) || categoryFilter }}
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
              @click="$router.push({ name: 'dashCategoriesNew' })"
              class="h-10 px-4 rounded-lg text-sm font-medium shadow-sm flex items-center justify-center bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors duration-150 cursor-pointer whitespace-nowrap w-full sm:w-auto">
              <BookmarkPlus class="w-4 h-4 mr-2" />
              <span>{{ t("pages.dash.categories.actions.add") || "Añadir categoría" }}</span>
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
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('name')">
                    <BookMarked class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.categories.table.name") }}
                    </span>
                    <SortIcon :active="sortColumn === 'name'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('spaces')">
                    <MapPin class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.categories.table.spaces") }}
                    </span>
                    <SortIcon :active="sortColumn === 'spaces'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2 cursor-pointer" @click="toggleSort('createdBy')">
                    <User class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.categories.table.createdBy") }}
                    </span>
                    <SortIcon :active="sortColumn === 'createdBy'" :direction="sortDirection" />
                  </div>
                </th>
                <th scope="col" class="px-6 py-4 text-left">
                  <div class="flex items-center gap-2">
                    <Settings class="w-4 h-4 text-primary-600" />
                    <span class="text-sm font-bold text-text-800 uppercase tracking-wider">
                      {{ t("pages.dash.categories.table.actions") }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-background-200">
              <tr v-for="category in paginatedCategories" :key="category.id" class="group">
                <td
                  class="px-6 py-4 whitespace-nowrap sticky-column sticky left-0 bg-background-100 group-hover:bg-primary-50 transition-colors duration-150 z-20">
                  <span class="text-sm text-text-800">
                    {{ category.id }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="ml-4">
                    <div class="text-sm text-text-800">{{ category.name }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="text-sm text-text-800">
                    <div v-if="category.spaces && category.spaces.length" class="flex flex-wrap gap-1">
                      <div
                        v-for="(spaceId, index) in category.spaces.slice(0, 3)"
                        :key="spaceId"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800 border border-primary-200">
                        {{ getSpaceName(spaceId) }}
                      </div>
                      <div
                        v-if="category.spaces.length > 3"
                        class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-background-100 text-text-500 border border-background-200">
                        +{{ category.spaces.length - 3 }}
                      </div>
                    </div>
                    <div v-else class="text-text-500">{{ t("pages.dash.categories.table.noSpaces") }}</div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="text-sm text-text-800 truncate max-w-32">{{ getCreatedByName(category.createdBy) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap group-hover:bg-primary-50 transition-colors duration-150">
                  <div class="flex items-center gap-2">
                    <button
                      @click="$router.push({ name: 'dashCategoriesEdit', params: { id: category.id } })"
                      class="px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800 border border-primary-200 hover:bg-primary-200 transition-colors duration-150 cursor-pointer">
                      <Pencil class="w-3 h-3 text-primary-600" />
                      {{ t("pages.dash.categories.actions.edit") }}
                    </button>
                    <button
                      @click="handleCategoryStatusToggle(category)"
                      :class="[
                        'px-3 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border transition-colors duration-150',
                        category.deleted
                          ? 'bg-secondary-100 text-secondary-800 border-secondary-200 hover:bg-secondary-200'
                          : 'bg-accent-100 text-accent-800 border-accent-200 hover:bg-accent-200',
                      ]">
                      <component
                        :is="category.deleted ? BookmarkCheck : Trash"
                        class="w-3 h-3"
                        :class="category.deleted ? 'text-secondary-600' : 'text-accent-600'" />
                      {{
                        category.deleted
                          ? t("pages.dash.categories.actions.reactivate")
                          : t("pages.dash.categories.actions.delete")
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
  BookMarked,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Search,
  X,
  ChevronUp,
  MapPin,
  Bookmark,
  BookmarkCheck,
  BookmarkX,
  BookmarkPlus,
} from "lucide-vue-next";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/vue";
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import { useModal } from "@/composables/useModal";
import { useToast } from "@/composables/useToast";

const { t } = useI18n();
const route = useRoute();

const searchTerm = ref("");
const categoryFilter = ref("active");
const currentPage = ref(1);
const itemsPerPage = 5;

const filterIcons = {
  active: BookmarkCheck,
  inactive: BookmarkX,
  all: Bookmark,
};

const metrics = ref({
  total: 0,
  active: 0,
  inactive: 0,
});

const categories = ref([]);
const spaces = ref({});
const requestedSpaces = new Set();

const isLoading = ref(false);
const users = ref({});

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

    // Cargar información de espacios
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
    axios.get(`/api/spaces`, {
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
  if (route.meta.initialData) {
    // Usar datos del fetcher
    if (route.meta.initialData.metrics) {
      metrics.value = route.meta.initialData.metrics;
    }

    if (route.meta.initialData.spaces && Array.isArray(route.meta.initialData.spaces)) {
      // Inicializar la caché de espacios con los datos del fetcher
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
    // Fallback si no hay datos iniciales
    await loadCategories();
  }
});

const getCreatedByName = (createdById) => {
  if (createdById === "System") {
    return "Sistema";
  }

  if (users.value[createdById]) {
    return users.value[createdById];
  }

  loadUserName(createdById);
  return createdById;
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

const modal = useModal();
const toast = useToast();

const handleCategoryStatusToggle = async (category) => {
  const isDeactivating = !category.deleted;
  const modalText = isDeactivating
    ? t("pages.dash.categories.modals.deactivate.text", { name: category.name })
    : t("pages.dash.categories.modals.reactivate.text", { name: category.name });

  modal.confirm(
    modalText,
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
                await loadCategories();
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

import { h, defineComponent } from "vue";
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
