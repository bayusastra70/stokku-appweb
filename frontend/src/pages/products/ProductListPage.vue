<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { productApi, categoryApi, toCamel } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Product, Category } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// State
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const errorMsg = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const perPage = 8

// Fetch categories for filter
async function fetchCategories() {
  try {
    const res = await categoryApi.getSimple()
    categories.value = (Array.isArray(res) ? res : []).map((c: any) => toCamel<Category>(c))
  } catch (err) {
    console.error('Failed to load categories:', err)
  }
}

// Fetch products from API
async function fetchProducts() {
  try {
    isLoading.value = true
    errorMsg.value = ''
    const res = await productApi.getAll({
      page: currentPage.value,
      limit: perPage,
      search: searchQuery.value || undefined,
      category_id: selectedCategory.value || undefined,
    })
    const items = res.data || res
    products.value = (Array.isArray(items) ? items : []).map((p: any) => toCamel<Product>(p))
    totalPages.value = res.pagination?.totalPages || Math.ceil((res.pagination?.total || products.value.length) / perPage)
    totalItems.value = res.pagination?.total || products.value.length
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data produk'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})

// Reset page when filters change
function onSearch() {
  currentPage.value = 1
  fetchProducts()
}

function onCategoryChange() {
  currentPage.value = 1
  fetchProducts()
}

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = ''
  currentPage.value = 1
  fetchProducts()
}

function goToPage(page: number) {
  currentPage.value = page
  fetchProducts()
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

function stockStatus(stock: number, minStock: number) {
  if (stock <= 0) return { label: 'Habis', class: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' }
  if (stock <= minStock) return { label: 'Hampir Habis', class: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' }
  return { label: 'Tersedia', class: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' }
}

// Debounced search
let searchTimer: ReturnType<typeof setTimeout>
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    onSearch()
  }, 400)
}
</script>

<template>
  <MainLayout>
    <div class="space-y-5">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Daftar Produk</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Kelola semua produk inventaris toko</p>
        </div>
        <button
          v-if="authStore.hasRole(['admin', 'manager'])"
          @click="router.push('/products/add')"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm rounded-xl hover:opacity-90 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Produk
        </button>
      </div>
      <!-- Filters Bar -->
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search -->
        <div class="relative flex-1">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            type="text"
            placeholder="Cari nama produk atau SKU..."
            class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-400 dark:placeholder:text-white/25 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all"
          />
        </div>
        <!-- Category Filter -->
        <div class="relative">
          <select
            v-model="selectedCategory"
            @change="onCategoryChange"
            class="appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer min-w-[180px]"
          >
            <option value="">Semua Kategori</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
        <!-- Clear Filters -->
        <button
          v-if="searchQuery || selectedCategory"
          @click="clearFilters"
          class="px-4 py-2.5 text-sm text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer"
        >
          ✕ Reset
        </button>
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
        <div class="flex items-center justify-between">
          <p class="text-xs text-slate-400 dark:text-white/30">
            Menampilkan {{ products.length }} dari {{ totalItems }} produk
          </p>
        </div>
        <!-- Product Table -->
        <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 dark:border-white/[0.06]">
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Produk</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">SKU</th>
                  <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Kategori</th>
                  <th class="px-5 py-3.5 text-right text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Harga</th>
                  <th class="px-5 py-3.5 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Stok</th>
                  <th class="px-5 py-3.5 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Status</th>
                  <th class="px-5 py-3.5 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="product in products"
                  :key="product.id"
                  class="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <!-- Product Name -->
                  <td class="px-5 py-3.5">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center text-slate-400 dark:text-white/20 shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                      <div class="min-w-0">
                        <p class="text-sm font-medium text-slate-700 dark:text-white/90 truncate max-w-[200px]">{{ product.name }}</p>
                        <p class="text-[11px] text-slate-400 dark:text-white/30">{{ product.supplierName }}</p>
                      </div>
                    </div>
                  </td>
                  <!-- SKU -->
                  <td class="px-5 py-3.5">
                    <span class="text-sm font-mono text-slate-500 dark:text-white/50">{{ product.sku }}</span>
                  </td>
                  <!-- Category -->
                  <td class="px-5 py-3.5">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-white/60">
                      {{ product.categoryName }}
                    </span>
                  </td>
                  <!-- Price -->
                  <td class="px-5 py-3.5 text-right">
                    <span class="text-sm font-medium text-slate-700 dark:text-white/80">{{ formatRupiah(product.price) }}</span>
                  </td>
                  <!-- Stock -->
                  <td class="px-5 py-3.5 text-center">
                    <span class="text-sm font-semibold" :class="product.stock <= product.minStock ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-white/80'">
                      {{ product.stock }}
                    </span>
                  </td>
                  <!-- Status -->
                  <td class="px-5 py-3.5 text-center">
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold" :class="stockStatus(product.stock, product.minStock).class">
                      {{ stockStatus(product.stock, product.minStock).label }}
                    </span>
                  </td>
                  <!-- Actions -->
                  <td class="px-5 py-3.5">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="router.push(`/products/${product.id}`)"
                        class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all cursor-pointer"
                        title="Detail"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button
                        v-if="authStore.hasRole(['admin', 'manager'])"
                        @click="router.push(`/products/${product.id}/edit`)"
                        class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all cursor-pointer"
                        title="Edit"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        v-if="authStore.hasRole(['admin'])"
                        class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Hapus"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- Empty State -->
                <tr v-if="products.length === 0">
                  <td colspan="7" class="px-5 py-16 text-center">
                    <div class="text-4xl mb-3">🔍</div>
                    <p class="text-sm font-medium text-slate-500 dark:text-white/50">Produk tidak ditemukan</p>
                    <p class="text-xs text-slate-400 dark:text-white/30 mt-1">Coba ubah kata kunci atau filter</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between">
          <p class="text-xs text-slate-400 dark:text-white/30">
            Halaman {{ currentPage }} dari {{ totalPages }}
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(Math.max(1, currentPage - 1))"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <template v-for="page in totalPages" :key="page">
              <button
                @click="goToPage(page)"
                class="w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer"
                :class="page === currentPage
                  ? 'bg-indigo-500 text-white shadow-sm shadow-indigo-500/25'
                  : 'text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.04]'"
              >
                {{ page }}
              </button>
            </template>
            <button
              @click="goToPage(Math.min(totalPages, currentPage + 1))"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
/* Fix select dark mode */
select option {
  background: #1e1b3a;
  color: white;
}
</style>