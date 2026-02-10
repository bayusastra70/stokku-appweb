<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps<{ collapsed: boolean }>()
const emit = defineEmits<{ (e: 'toggle'): void }>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface NavItem { label: string; icon: string; to: string; roles?: string[] }
interface NavGroup { title: string; items: NavItem[] }

const menuGroups = computed<NavGroup[]>(() => {
  const all: NavGroup[] = [
    {
      title: 'Menu Utama',
      items: [
        { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
        { label: 'Produk', icon: 'products', to: '/products' },
      ],
    },
    {
      title: 'Stok',
      items: [
        { label: 'Barang Masuk', icon: 'stock-in', to: '/stock/in', roles: ['admin', 'manager'] },
        { label: 'Barang Keluar', icon: 'stock-out', to: '/stock/out', roles: ['admin', 'manager'] },
        { label: 'Riwayat Stok', icon: 'stock-logs', to: '/stock/logs' },
      ],
    },
    {
      title: 'Master Data',
      items: [
        { label: 'Kategori', icon: 'category', to: '/categories' },
        { label: 'Supplier', icon: 'supplier', to: '/suppliers' },
      ],
    },
    {
      title: 'Administrasi',
      items: [
        { label: 'Pengguna', icon: 'users', to: '/users', roles: ['admin'] },
        { label: 'Laporan', icon: 'reports', to: '/reports', roles: ['admin', 'manager'] },
      ],
    },
  ]
  return all
    .map(g => ({
      ...g,
      items: g.items.filter(i => !i.roles || (authStore.user && i.roles.includes(authStore.user.role))),
    }))
    .filter(g => g.items.length > 0)
})

function isActive(path: string) {
  return path === '/dashboard' ? route.path === '/dashboard' : route.path.startsWith(path)
}
</script>

<template>
  <aside
    class="fixed top-0 left-0 h-screen z-50 flex flex-col border-r border-white/[0.06] transition-all duration-300 ease-in-out"
    :class="collapsed ? 'w-[72px]' : 'w-[260px]'"
    style="background: linear-gradient(180deg, #13102b 0%, #0d0b1e 100%)"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 h-16 shrink-0 cursor-pointer" @click="emit('toggle')">
      <div class="shrink-0">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="10" fill="url(#sg)"/>
          <path d="M12 28V16L20 12L28 16V28L20 24L12 28Z" stroke="white" stroke-width="2" stroke-linejoin="round" fill="none"/>
          <path d="M20 12V24" stroke="white" stroke-width="2"/>
          <path d="M12 16L20 20L28 16" stroke="white" stroke-width="2"/>
          <defs><linearGradient id="sg" x1="0" y1="0" x2="40" y2="40"><stop stop-color="#6366f1"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>
        </svg>
      </div>
      <span v-if="!collapsed" class="text-lg font-bold text-white tracking-tight transition-opacity duration-200">Stokku</span>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-5 scrollbar-thin">
      <div v-for="group in menuGroups" :key="group.title">
        <p v-if="!collapsed" class="text-[10px] uppercase tracking-[1.5px] text-white/25 font-semibold mb-2 px-2">{{ group.title }}</p>
        <div v-else class="h-px bg-white/[0.06] mx-2 mb-2"></div>

        <div class="space-y-0.5">
          <button
            v-for="item in group.items"
            :key="item.to"
            @click="router.push(item.to)"
            :title="collapsed ? item.label : ''"
            class="w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer"
            :class="[
              collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5',
              isActive(item.to)
                ? 'bg-indigo-500/15 text-indigo-400'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
            ]"
          >
            <!-- ICONS -->
            <span class="shrink-0 w-5 h-5">
              <svg v-if="item.icon==='dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
              <svg v-else-if="item.icon==='products'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/></svg>
              <svg v-else-if="item.icon==='stock-in'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12M5 12l7 7 7-7"/><line x1="3" y1="21" x2="21" y2="21"/></svg>
              <svg v-else-if="item.icon==='stock-out'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V7M5 12l7-7 7 7"/><line x1="3" y1="3" x2="21" y2="3"/></svg>
              <svg v-else-if="item.icon==='stock-logs'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <svg v-else-if="item.icon==='category'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M17 14v8M13 18h8"/></svg>
              <svg v-else-if="item.icon==='supplier'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <svg v-else-if="item.icon==='users'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
              <svg v-else-if="item.icon==='reports'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>
            </span>
            <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Collapse Toggle -->
    <div class="p-3 border-t border-white/[0.06]">
      <button @click="emit('toggle')"
        class="w-full flex items-center justify-center py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          class="transition-transform duration-300" :class="collapsed ? 'rotate-180' : ''">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
    </div>
  </aside>
</template>