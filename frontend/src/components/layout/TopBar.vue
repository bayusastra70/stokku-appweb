<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

const pageTitle = computed(() => {
  return (route.meta.title as string) || 'Dashboard'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// Close menu on click outside
function closeMenu() {
  showUserMenu.value = false
}
</script>

<script lang="ts">
import { computed } from 'vue'
export default {}
</script>

<template>
  <header class="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#13102b]/80 backdrop-blur-xl sticky top-0 z-40">
    <!-- Left: Page Title -->
    <div>
      <h1 class="text-lg font-semibold text-slate-800 dark:text-white">{{ pageTitle }}</h1>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-3">
      <!-- Search (simplified) -->
      <!-- <div class="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-white/[0.06] rounded-lg w-[220px]">
        <svg class="text-slate-400 dark:text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Cari..." class="bg-transparent text-sm text-slate-700 dark:text-white/70 placeholder:text-slate-400 dark:placeholder:text-white/25 outline-none w-full" />
      </div> -->

      <!-- Notification Bell -->
      <!-- <button class="relative p-2 rounded-lg text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button> -->

      <!-- User Menu -->
      <div class="relative" v-if="authStore.user">
        <button @click="showUserMenu = !showUserMenu"
          class="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-medium text-slate-700 dark:text-white/90">{{ authStore.user.name }}</p>
            <p class="text-[11px] text-slate-400 dark:text-white/40 capitalize">{{ authStore.user.role }}</p>
          </div>
          <div class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
            {{ authStore.user.name.charAt(0) }}
          </div>
        </button>

        <!-- Dropdown -->
        <Transition name="dropdown">
          <div v-if="showUserMenu" class="absolute right-0 top-full mt-2 w-56 py-2 bg-white dark:bg-[#1e1b3a] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50"
            @mouseleave="closeMenu">
            <div class="px-4 py-2 border-b border-slate-100 dark:border-white/[0.06] mb-1">
              <p class="text-sm font-medium text-slate-700 dark:text-white">{{ authStore.user.name }}</p>
              <p class="text-xs text-slate-400 dark:text-white/40">{{ authStore.user.email }}</p>
            </div>
            <!-- <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Profil Saya
            </button>
            <button class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Pengaturan
            </button> -->
            <div class="h-px bg-slate-100 dark:bg-white/[0.06] my-1"></div>
            <button @click="handleLogout"
              class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
              Keluar
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 0.2s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
</style>