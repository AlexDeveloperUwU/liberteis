<template>
  <div class="h-full w-full p-6 bg-gray-900 text-white">
    <!-- Título -->
    <h1 class="text-3xl font-bold">Dashboard Overview</h1>
    <p class="text-gray-400">Welcome back, here's what's happening today.</p>

    <!-- Tarjetas de métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-purple-400">
          <User class="w-5 h-5" />
          <p>Total Users</p>
        </div>
        <h2 class="text-2xl font-bold">12,548</h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-green-400">
          <ArrowUpRight class="w-5 h-5" />
          <p>Revenue</p>
        </div>
        <h2 class="text-2xl font-bold">$24,780</h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-purple-400">
          <ShoppingCart class="w-5 h-5" />
          <p>Orders</p>
        </div>
        <h2 class="text-2xl font-bold">1,758</h2>
      </div>

      <div class="bg-gray-800 p-4 shadow rounded-lg flex flex-col">
        <div class="flex items-center gap-2 text-yellow-400">
          <Star class="w-5 h-5" />
          <p>Reviews</p>
        </div>
        <h2 class="text-2xl font-bold">4.8/5</h2>
      </div>
    </div>

    <!-- Gráficos Placeholder -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div class="bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold">Weekly Revenue</h2>
        <div class="h-40 flex items-center justify-center text-gray-500">
          <BarChart class="w-6 h-6" />
          <span class="ml-2">Chart Placeholder</span>
        </div>
      </div>

      <div class="bg-gray-800 p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold">User Activity</h2>
        <div class="h-40 flex items-center justify-center text-gray-500">
          <LineChart class="w-6 h-6" />
          <span class="ml-2">Chart Placeholder</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { User, ArrowUpRight, ShoppingCart, Star, BarChart, LineChart } from 'lucide-vue-next';
</script>

<style scoped>
/* Sombra sutil para las tarjetas */
.shadow {
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
}
</style>
