<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from './Sidebar.vue'
import TopBar from './TopBar.vue'

const sidebarCollapsed = ref(false)
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-[#0d0b1e]">
    <Sidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <!-- Main Content -->
    <div class="transition-all duration-300 ease-in-out"
      :class="sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'">
      <TopBar />
      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>