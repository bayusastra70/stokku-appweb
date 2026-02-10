<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { stockApi, toCamel } from '@/services/api'
import type { StockLog } from '@/types'

// state
const allLogs = ref<StockLog[]>([])
const isLoading = ref(true)
const errorMsg = ref('')
const filterType = ref<'' | 'in' | 'out'>('')
const searchQuery = ref('')
const currentPage = ref(1)
const perPage = 10

// Fetch logs from API
async function fetchLogs() {
  try {
    isLoading.value = true
    errorMsg.value = ''
    const res = await stockApi.getLogs({
      page: 1,
      limit: 500,
      type: filterType.value || undefined,
    })
    const items = res.data || res
    allLogs.value = (Array.isArray(items) ? items : []).map((l: any) => toCamel<StockLog>(l))
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data log stok'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchLogs)

// Filtered logs (client-side search since API may not have full-text search)
const filteredLogs = computed(() => {
  let result = [...allLogs.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l =>
      (l.productName?.toLowerCase().includes(q)) ||
      (l.userName?.toLowerCase().includes(q)) ||
      (l.notes?.toLowerCase().includes(q))
    )
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredLogs.value.length / perPage))
const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredLogs.value.slice(start, start + perPage)
})

function onFilterChange() {
  currentPage.value = 1
  fetchLogs()
}

function goToPage(page: number) {
  currentPage.value = page
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function reasonLabel(reason: string): string {
  const map: Record<string, string> = { purchase: 'Pembelian', sale: 'Penjualan', damaged: 'Rusak', return: 'Retur', adjustment: 'Penyesuaian' }
  return map[reason] || reason
}
</script>

<template>
  <MainLayout>
    <div class="space-y-5">
      <!-- Header -->
      <div>
        <h2 class="text-xl font-bold text-slate-800 dark:text-white">Log Pergerakan Stok</h2>
        <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Riwayat seluruh pergerakan barang masuk & keluar</p>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            @input="currentPage = 1"
            type="text"
            placeholder="Cari produk, user, atau catatan..."
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-400 dark:placeholder:text-white/25 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
        </div>
        <!-- Type filter -->
        <div class="flex gap-2">
          <button @click="filterType = ''; onFilterChange()"
            class="px-4 py-2.5 text-sm font-medium rounded-xl border transition-all cursor-pointer"
            :class="filterType === ''
              ? 'bg-indigo-500 text-white border-indigo-500'
              : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-white/50 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.06]'">
            Semua
          </button>
          <button @click="filterType = 'in'; onFilterChange()"
            class="px-4 py-2.5 text-sm font-medium rounded-xl border transition-all cursor-pointer"
            :class="filterType === 'in'
              ? 'bg-emerald-500 text-white border-emerald-500'
              : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-white/50 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.06]'">
            Masuk
          </button>
          <button @click="filterType = 'out'; onFilterChange()"
            class="px-4 py-2.5 text-sm font-medium rounded-xl border transition-all cursor-pointer"
            :class="filterType === 'out'
              ? 'bg-rose-500 text-white border-rose-500'
              : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-white/50 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.06]'">
            Keluar
          </button>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-5 py-4">
        <svg class="text-red-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <span class="text-sm font-medium text-red-700 dark:text-red-400">{{ errorMsg }}</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <svg class="animate-spin text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <span class="ml-3 text-sm text-slate-500 dark:text-white/40">Memuat data...</span>
      </div>

      <template v-else>
        <!-- Results Count -->
        <p class="text-xs text-slate-400 dark:text-white/30">
          {{ filteredLogs.length }} log ditemukan
        </p>

        <!-- Logs Table -->
        <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 dark:border-white/[0.06]">
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Tipe</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Produk</th>
                  <th class="px-5 py-3.5 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Jumlah</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Alasan</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Catatan</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">User</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Waktu</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="log in paginatedLogs" :key="log.id"
                  class="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <!-- Type Badge -->
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                      :class="log.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'">
                      <svg v-if="log.type === 'in'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
                      <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                      {{ log.type === 'in' ? 'Masuk' : 'Keluar' }}
                    </span>
                  </td>
                  <!-- Product -->
                  <td class="px-5 py-3.5">
                    <span class="text-sm font-medium text-slate-700 dark:text-white/80">{{ log.productName || '-' }}</span>
                  </td>
                  <!-- Quantity -->
                  <td class="px-5 py-3.5 text-center">
                    <span class="text-sm font-bold" :class="log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                      {{ log.type === 'in' ? '+' : '-' }}{{ log.quantity }}
                    </span>
                  </td>
                  <!-- Reason -->
                  <td class="px-5 py-3.5">
                    <span class="text-sm text-slate-600 dark:text-white/60">{{ reasonLabel(log.reason) }}</span>
                  </td>
                  <!-- Notes -->
                  <td class="px-5 py-3.5">
                    <span class="text-sm text-slate-400 dark:text-white/40 truncate max-w-[150px] block">{{ log.notes || '-' }}</span>
                  </td>
                  <!-- User -->
                  <td class="px-5 py-3.5">
                    <span class="text-sm text-slate-500 dark:text-white/50">{{ log.userName || '-' }}</span>
                  </td>
                  <!-- Date -->
                  <td class="px-5 py-3.5">
                    <span class="text-xs text-slate-400 dark:text-white/30 whitespace-nowrap">{{ formatDate(log.createdAt) }}</span>
                  </td>
                </tr>
                <tr v-if="filteredLogs.length === 0">
                  <td colspan="7" class="px-5 py-16 text-center">
                    <div class="text-4xl mb-3">📭</div>
                    <p class="text-sm text-slate-500 dark:text-white/40">Tidak ada log pergerakan stok</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between">
          <p class="text-xs text-slate-400 dark:text-white/30">Halaman {{ currentPage }} dari {{ totalPages }}</p>
          <div class="flex items-center gap-1">
            <button @click="goToPage(Math.max(1, currentPage - 1))" :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <template v-for="page in totalPages" :key="page">
              <button @click="goToPage(page)"
                class="w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer"
                :class="page === currentPage
                  ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.04]'">
                {{ page }}
              </button>
            </template>
            <button @click="goToPage(Math.min(totalPages, currentPage + 1))" :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>