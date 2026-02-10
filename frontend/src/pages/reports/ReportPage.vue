<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { productApi, stockApi, categoryApi, toCamel } from '@/services/api'
import type { Product, StockLog, Category } from '@/types'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// State
const products = ref<Product[]>([])
const stockLogs = ref<StockLog[]>([])
const categories = ref<Category[]>([])
const isLoading = ref(true)
const errorMsg = ref('')

// Date range (default: current month)
const now = new Date()
const dateFrom = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`)
const dateTo = ref(now.toISOString().split('T')[0])

// Fetch all data
async function fetchData() {
  try {
    isLoading.value = true
    errorMsg.value = ''

    const [pRes, logRes, catRes] = await Promise.all([
      productApi.getAll({ limit: 1000 }),
      stockApi.getLogs({ limit: 1000, start_date: dateFrom.value, end_date: dateTo.value }),
      categoryApi.getSimple(),
    ])

    const pItems = pRes.data || pRes
    products.value = (Array.isArray(pItems) ? pItems : []).map((p: any) => toCamel<Product>(p))

    const logItems = logRes.data || logRes
    stockLogs.value = (Array.isArray(logItems) ? logItems : []).map((l: any) => toCamel<StockLog>(l))

    categories.value = (Array.isArray(catRes) ? catRes : []).map((c: any) => toCamel<Category>(c))
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data laporan'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchData)

function onDateChange() {
  fetchData()
}

// Stats
const totalProducts = computed(() => products.value.length)
const totalStockValue = computed(() => products.value.reduce((s, p) => s + p.stock * p.price, 0))
const totalIn = computed(() => stockLogs.value.filter(l => l.type === 'in').reduce((s, l) => s + l.quantity, 0))
const totalOut = computed(() => stockLogs.value.filter(l => l.type === 'out').reduce((s, l) => s + l.quantity, 0))
const lowStockItems = computed(() => products.value.filter(p => p.stock <= p.minStock))

// By category
const categoryStats = computed(() => {
  return categories.value.map(cat => {
    const catProducts = products.value.filter(p => p.categoryId === cat.id)
    const totalStock = catProducts.reduce((s, p) => s + p.stock, 0)
    const totalValue = catProducts.reduce((s, p) => s + p.stock * p.price, 0)
    return { name: cat.name, productCount: catProducts.length, totalStock, totalValue }
  }).filter(c => c.productCount > 0)
})

// Top movers
const topMovers = computed(() => {
  const map = new Map<string, { name: string; inQty: number; outQty: number }>()
  stockLogs.value.forEach(log => {
    const existing = map.get(log.productId) || { name: log.productName || 'Unknown', inQty: 0, outQty: 0 }
    if (log.type === 'in') existing.inQty += log.quantity
    else existing.outQty += log.quantity
    map.set(log.productId, existing)
  })
  return Array.from(map.values()).sort((a, b) => (b.inQty + b.outQty) - (a.inQty + a.outQty)).slice(0, 5)
})

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

async function handleExport() {
  if (isLoading.value) return
  
  try {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Stokku App'
    workbook.created = new Date()

    // --- SHEET 1: SUMMARY ---
    const sheetSummary = workbook.addWorksheet('Ringkasan')
    
    // Title
    sheetSummary.mergeCells('A1:D1')
    sheetSummary.getCell('A1').value = 'Laporan Inventaris Stokku'
    sheetSummary.getCell('A1').font = { size: 16, bold: true }
    sheetSummary.getCell('A1').alignment = { horizontal: 'center' }

    // Date Range
    sheetSummary.mergeCells('A2:D2')
    sheetSummary.getCell('A2').value = `Periode: ${dateFrom.value} s/d ${dateTo.value}`
    sheetSummary.getCell('A2').alignment = { horizontal: 'center' }

    // Stats Table
    sheetSummary.addRow([])
    sheetSummary.addRow(['Metric', 'Nilai'])
    sheetSummary.addRow(['Total Produk', totalProducts.value])
    sheetSummary.addRow(['Nilai Inventaris', formatRupiah(totalStockValue.value)])
    sheetSummary.addRow(['Total Masuk', totalIn.value])
    sheetSummary.addRow(['Total Keluar', totalOut.value])

    // Styling Header
    sheetSummary.getRow(4).font = { bold: true }
    sheetSummary.getColumn(1).width = 20
    sheetSummary.getColumn(2).width = 20

    // --- SHEET 2: STOCK MOVEMENT ---
    const sheetLogs = workbook.addWorksheet('Pergerakan Stok')
    sheetLogs.columns = [
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Produk', key: 'product', width: 30 },
      { header: 'Tipe', key: 'type', width: 10 },
      { header: 'Jumlah', key: 'qty', width: 10 },
      { header: 'Keterangan', key: 'desc', width: 30 },
    ]
    
    // Style Header
    sheetLogs.getRow(1).font = { bold: true }
    
    stockLogs.value.forEach(log => {
      sheetLogs.addRow({
        date: new Date(log.createdAt).toLocaleDateString('id-ID'),
        product: log.productName || '-',
        type: log.type === 'in' ? 'Masuk' : 'Keluar',
        qty: log.quantity,
        desc: `${log.reason}${log.notes ? ' - ' + log.notes : ''}`
      })
    })

    // --- SHEET 3: LOW STOCK ---
    if (lowStockItems.value.length > 0) {
      const sheetLow = workbook.addWorksheet('Stok Rendah')
      sheetLow.columns = [
        { header: 'Produk', key: 'name', width: 30 },
        { header: 'SKU', key: 'sku', width: 15 },
        { header: 'Stok Saat Ini', key: 'stock', width: 15 },
        { header: 'Min Stok', key: 'min', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ]
      
      sheetLow.getRow(1).font = { bold: true }

      lowStockItems.value.forEach(p => {
        sheetLow.addRow({
          name: p.name,
          sku: p.sku,
          stock: p.stock,
          min: p.minStock,
          status: p.stock <= 0 ? 'Habis' : 'Hampir Habis'
        })
      })
    }

    // Generate & Download
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const filename = `Laporan-Stokku-${dateFrom.value}-sd-${dateTo.value}.xlsx`
    saveAs(blob, filename)
    
  } catch (err: any) {
    console.error('Export error:', err)
    errorMsg.value = 'Gagal mengekspor laporan: ' + err.message
  }
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Laporan Inventaris</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Ringkasan data inventaris dan pergerakan stok</p>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2">
            <input v-model="dateFrom" @change="onDateChange" type="date" class="bg-transparent text-sm text-slate-700 dark:text-white/80 outline-none" />
            <span class="text-slate-300 dark:text-white/20">—</span>
            <input v-model="dateTo" @change="onDateChange" type="date" class="bg-transparent text-sm text-slate-700 dark:text-white/80 outline-none" />
          </div>
          <button @click="handleExport"
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export
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
        <span class="ml-3 text-sm text-slate-500 dark:text-white/40">Memuat data laporan...</span>
      </div>

      <template v-else>
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center">
                <svg class="text-indigo-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
              </div>
              <span class="text-xs text-slate-400 dark:text-white/30">Total Produk</span>
            </div>
            <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ totalProducts }}</p>
            <p class="text-xs text-slate-400 dark:text-white/25 mt-1">item terdaftar</p>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
                <svg class="text-emerald-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <span class="text-xs text-slate-400 dark:text-white/30">Nilai Inventaris</span>
            </div>
            <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ formatRupiah(totalStockValue) }}</p>
            <p class="text-xs text-slate-400 dark:text-white/25 mt-1">total nilai stok</p>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center">
                <svg class="text-sky-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
              </div>
              <span class="text-xs text-slate-400 dark:text-white/30">Total Masuk</span>
            </div>
            <p class="text-2xl font-bold text-sky-600 dark:text-sky-400">+{{ totalIn }}</p>
            <p class="text-xs text-slate-400 dark:text-white/25 mt-1">unit masuk</p>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
                <svg class="text-rose-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              </div>
              <span class="text-xs text-slate-400 dark:text-white/30">Total Keluar</span>
            </div>
            <p class="text-2xl font-bold text-rose-600 dark:text-rose-400">-{{ totalOut }}</p>
            <p class="text-xs text-slate-400 dark:text-white/25 mt-1">unit keluar</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Category Breakdown -->
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg class="text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              Stok per Kategori
            </h3>
            <div class="space-y-3">
              <div v-for="cat in categoryStats" :key="cat.name" class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-white/[0.03] last:border-0">
                <div>
                  <p class="text-sm font-medium text-slate-700 dark:text-white/80">{{ cat.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-white/30">{{ cat.productCount }} produk • {{ cat.totalStock }} unit</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-semibold text-slate-800 dark:text-white">{{ formatRupiah(cat.totalValue) }}</p>
                </div>
              </div>
              <div v-if="categoryStats.length === 0" class="py-8 text-center">
                <p class="text-sm text-slate-400 dark:text-white/30">Tidak ada data kategori</p>
              </div>
            </div>
          </div>

          <!-- Top Movers -->
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg class="text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              Produk Paling Aktif
            </h3>
            <div class="space-y-3">
              <div v-for="(item, i) in topMovers" :key="i" class="flex items-center justify-between py-2 border-b border-slate-50 dark:border-white/[0.03] last:border-0">
                <div class="flex items-center gap-3">
                  <span class="w-6 h-6 rounded-full bg-slate-100 dark:bg-white/[0.06] text-xs font-bold text-slate-500 dark:text-white/50 flex items-center justify-center">{{ i + 1 }}</span>
                  <p class="text-sm font-medium text-slate-700 dark:text-white/80">{{ item.name }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs font-medium text-emerald-600 dark:text-emerald-400">+{{ item.inQty }}</span>
                  <span class="text-xs font-medium text-rose-600 dark:text-rose-400">-{{ item.outQty }}</span>
                </div>
              </div>
              <div v-if="topMovers.length === 0" class="py-8 text-center">
                <p class="text-sm text-slate-400 dark:text-white/30">Tidak ada pergerakan stok pada periode ini</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Low Stock Alert Table -->
        <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] overflow-hidden">
          <div class="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06]">
            <h3 class="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <svg class="text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Produk Stok Rendah ({{ lowStockItems.length }})
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-slate-100 dark:border-white/[0.06]">
                  <th class="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Produk</th>
                  <th class="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">SKU</th>
                  <th class="px-5 py-3 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Kategori</th>
                  <th class="px-5 py-3 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Stok</th>
                  <th class="px-5 py-3 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Min Stok</th>
                  <th class="px-5 py-3 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in lowStockItems" :key="p.id" class="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <td class="px-5 py-3">
                    <span class="text-sm font-medium text-slate-700 dark:text-white/80">{{ p.name }}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-xs font-mono text-slate-400 dark:text-white/30">{{ p.sku }}</span>
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-sm text-slate-500 dark:text-white/50">{{ p.categoryName }}</span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="text-sm font-bold" :class="p.stock <= 0 ? 'text-red-500' : 'text-amber-500'">{{ p.stock }}</span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="text-sm text-slate-500 dark:text-white/40">{{ p.minStock }}</span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      :class="p.stock <= 0 ? 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'">
                      {{ p.stock <= 0 ? 'Habis' : 'Hampir Habis' }}
                    </span>
                  </td>
                </tr>
                <tr v-if="lowStockItems.length === 0">
                  <td colspan="6" class="px-5 py-12 text-center">
                    <div class="text-3xl mb-2">✅</div>
                    <p class="text-sm text-slate-500 dark:text-white/40">Semua produk memiliki stok aman</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>