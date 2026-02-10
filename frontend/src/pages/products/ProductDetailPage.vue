<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { productApi, stockApi, toCamel } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Product, StockLog } from '@/types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const product = ref<Product | null>(null)
const productLogs = ref<StockLog[]>([])
const isLoading = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  try {
    isLoading.value = true
    const id = route.params.id as string

    // Fetch product detail
    const pRes = await productApi.getById(id)
    const raw = pRes.data || pRes
    product.value = toCamel<Product>(raw)

    // Fetch stock logs for this product
    try {
      const logsRes = await stockApi.getLogs({ product_id: id, limit: 50 })
      const logItems = logsRes.data || logsRes
      productLogs.value = (Array.isArray(logItems) ? logItems : []).map((l: any) => toCamel<StockLog>(l))
    } catch {
      // Stock logs may not exist, that's ok
      productLogs.value = []
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data produk'
  } finally {
    isLoading.value = false
  }
})

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function reasonLabel(reason: string): string {
  const map: Record<string, string> = { purchase: 'Pembelian', sale: 'Penjualan', damaged: 'Rusak', return: 'Retur', adjustment: 'Penyesuaian' }
  return map[reason] || reason
}

function stockBadge(stock: number, minStock: number) {
  if (stock <= 0) return { label: 'Habis', class: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' }
  if (stock <= minStock) return { label: 'Hampir Habis', class: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' }
  return { label: 'Tersedia', class: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' }
}
</script>

<template>
  <MainLayout>
    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center h-[60vh]">
      <svg class="animate-spin text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
      <span class="ml-3 text-sm text-slate-500 dark:text-white/40">Memuat data...</span>
    </div>

    <!-- Error -->
    <div v-else-if="errorMsg" class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <div class="text-5xl mb-4">😕</div>
        <h2 class="text-xl font-bold text-slate-700 dark:text-white mb-2">{{ errorMsg }}</h2>
        <button @click="router.push('/products')" class="mt-4 px-4 py-2 bg-indigo-500 text-white text-sm rounded-xl cursor-pointer hover:bg-indigo-600 transition-colors">
          Kembali ke Daftar Produk
        </button>
      </div>
    </div>

    <div v-else-if="product" class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()"
            class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div>
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Detail Produk</h2>
            <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">{{ product.sku }}</p>
          </div>
        </div>
        <button v-if="authStore.hasRole(['admin', 'manager'])" @click="router.push(`/products/${product.id}/edit`)"
          class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm font-medium text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
      </div>
      <!-- Product Info Card -->
      <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] overflow-hidden">
        <div class="flex flex-col md:flex-row">
          <!-- Image -->
          <div class="md:w-64 h-48 md:h-auto bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center shrink-0">
            <svg class="text-slate-300 dark:text-white/10" width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          </div>
          <!-- Details -->
          <div class="flex-1 p-6">
            <div class="flex items-start justify-between mb-4">
              <div>
                <h3 class="text-lg font-bold text-slate-800 dark:text-white">{{ product.name }}</h3>
                <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">{{ product.categoryName }} • {{ product.supplierName }}</p>
              </div>
              <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold" :class="stockBadge(product.stock, product.minStock).class">
                {{ stockBadge(product.stock, product.minStock).label }}
              </span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="bg-slate-50 dark:bg-white/[0.03] rounded-lg p-3">
                <p class="text-[11px] text-slate-400 dark:text-white/30 mb-0.5">Harga</p>
                <p class="text-sm font-bold text-slate-800 dark:text-white">{{ formatRupiah(product.price) }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-white/[0.03] rounded-lg p-3">
                <p class="text-[11px] text-slate-400 dark:text-white/30 mb-0.5">Stok Saat Ini</p>
                <p class="text-sm font-bold" :class="product.stock <= product.minStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'">{{ product.stock }} unit</p>
              </div>
              <div class="bg-slate-50 dark:bg-white/[0.03] rounded-lg p-3">
                <p class="text-[11px] text-slate-400 dark:text-white/30 mb-0.5">Min. Stok</p>
                <p class="text-sm font-bold text-slate-800 dark:text-white">{{ product.minStock }} unit</p>
              </div>
              <div class="bg-slate-50 dark:bg-white/[0.03] rounded-lg p-3">
                <p class="text-[11px] text-slate-400 dark:text-white/30 mb-0.5">Nilai Stok</p>
                <p class="text-sm font-bold text-slate-800 dark:text-white">{{ formatRupiah(product.price * product.stock) }}</p>
              </div>
            </div>
            <div v-if="product.description">
              <p class="text-[11px] font-medium text-slate-400 dark:text-white/30 uppercase tracking-wider mb-1">Deskripsi</p>
              <p class="text-sm text-slate-600 dark:text-white/60 leading-relaxed">{{ product.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Stock History -->
      <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
        <h3 class="text-base font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Histori Pergerakan Stok
        </h3>
        <div v-if="productLogs.length > 0" class="space-y-1">
          <div v-for="log in productLogs" :key="log.id"
            class="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
            <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              :class="log.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'">
              <svg v-if="log.type === 'in'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-700 dark:text-white/80">{{ reasonLabel(log.reason) }}</p>
              <p class="text-[11px] text-slate-400 dark:text-white/30">{{ log.userName }} • {{ log.notes }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold" :class="log.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'">
                {{ log.type === 'in' ? '+' : '-' }}{{ log.quantity }}
              </p>
              <p class="text-[11px] text-slate-400 dark:text-white/30">{{ formatDate(log.createdAt) }}</p>
            </div>
          </div>
        </div>
        <div v-else class="py-12 text-center">
          <div class="text-4xl mb-3">📭</div>
          <p class="text-sm text-slate-500 dark:text-white/40">Belum ada histori pergerakan stok</p>
        </div>
      </div>
    </div>
    <!-- Not Found -->
    <div v-else class="flex items-center justify-center h-[60vh]">
      <div class="text-center">
        <div class="text-5xl mb-4">😕</div>
        <h2 class="text-xl font-bold text-slate-700 dark:text-white mb-2">Produk Tidak Ditemukan</h2>
        <button @click="router.push('/products')" class="mt-4 px-4 py-2 bg-indigo-500 text-white text-sm rounded-xl cursor-pointer hover:bg-indigo-600 transition-colors">
          Kembali ke Daftar Produk
        </button>
      </div>
    </div>
  </MainLayout>
</template>