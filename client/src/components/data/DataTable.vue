<script setup>
import { ChevronUp, ChevronDown } from "lucide-vue-next";
import { resolveIcon } from "../icons.js";

defineProps({
  columns: { type: Array, required: true }, // { key, label, icon, sortable, render }
  rows: { type: Array, required: true },
  sortColumn: { type: String, default: null },
  sortDirection: { type: String, default: "asc" },
  onRowClick: { type: Function, default: null },
  rowKey: { type: String, default: "id" },
});
const emit = defineEmits(["sort"]);

const headerIcon = (name) => {
  if (!name) return null;
  return resolveIcon(name);
};
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead>
        <tr class="border-b-[1.5px] border-background-300">
          <th
            v-for="(col, i) in columns"
            :key="col.key"
            scope="col"
            class="px-3 py-3 text-left font-bold uppercase tracking-wider text-text-label whitespace-nowrap"
            :class="i === 0 ? 'sticky left-0 bg-background-100' : ''">
            <button
              v-if="col.sortable"
              type="button"
              @click="emit('sort', col.key)"
              class="flex items-center gap-1 hover:text-primary-600">
              <component :is="headerIcon(col.icon)" v-if="col.icon" class="w-4 h-4" />
              {{ col.label }}
              <ChevronUp v-if="sortColumn === col.key && sortDirection === 'asc'" class="w-4 h-4" />
              <ChevronDown v-else-if="sortColumn === col.key" class="w-4 h-4" />
            </button>
            <span v-else class="flex items-center gap-1">
              <component :is="headerIcon(col.icon)" v-if="col.icon" class="w-4 h-4" />
              {{ col.label }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in rows"
          :key="row[rowKey]"
          class="border-b border-background-200 transition-colors duration-150 hover:bg-primary-50"
          :class="[onRowClick ? 'cursor-pointer hover:border-l-[3px] hover:border-l-primary-300' : '']"
          @click="onRowClick && onRowClick(row)">
          <td
            v-for="(col, i) in columns"
            :key="col.key"
            class="px-3 py-3 text-text-800"
            :class="i === 0 ? 'sticky left-0 bg-inherit' : ''">
            <slot :name="`cell-${col.key}`" :row="row">
              {{ col.render ? col.render(row) : row[col.key] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
