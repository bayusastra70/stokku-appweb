<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardApi, toCamel } from '@/services/api'

const authStore = useAuthStore()

const loading = ref(true)
const stats = ref([
  { label: 'Total Produk', value: 0, icon: 'box', color: 'indigo', suffix: 'item' },
  { label: 'Total Stok', value: 0, icon: 'layers', color: 'emerald', suffix: 'unit' },
  { label: 'Stok Rendah', value: 0, icon: 'alert', color: 'amber', suffix: 'produk' },
  { label: 'Supplier', value: 0, icon: 'truck', color: 'sky', suffix: 'aktif' },
])
const lowStockProducts = ref<any[]>([])
const recentActivity = ref<any[]>([])
const chartLabels = ref<string[]>([])
const chartStockIn = ref<number[]>([])
const chartStockOut = ref<number[]>([])
const chartMaxValue = ref(1)

onMounted(async () => {
  try {
    const [statsData, chartData, lowStock, activity] = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getChart(),
      dashboardApi.getLowStock(),
      dashboardApi.getActivity(6),
    ])

    if (stats.value[0]) stats.value[0].value = statsData.totalProducts
    if (stats.value[1]) stats.value[1].value = statsData.totalStock
    if (stats.value[2]) stats.value[2].value = statsData.lowStockCount
    if (stats.value[3]) stats.value[3].value = statsData.totalSuppliers

    chartLabels.value = chartData.labels
    chartStockIn.value = chartData.stockIn
    chartStockOut.value = chartData.stockOut
    chartMaxValue.value = Math.max(...chartData.stockIn, ...chartData.stockOut, 1)

    lowStockProducts.value = lowStock.map((p: any) => toCamel(p))
    recentActivity.value = activity.map((a: any) => toCamel(a))
  } catch (err) {
    console.error('Dashboard load error:', err)
  } finally {
    loading.value = false
  }
})

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins} menit lalu`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} jam lalu`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} hari lalu`
}

function stockBadge(stock: number, minStock: number) {
  if (stock <= 0) return { label: 'Habis', class: 'bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400' }
  if (stock <= minStock) return { label: 'Hampir Habis', class: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400' }
  return { label: 'Tersedia', class: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' }
}
</script>

<template>
  <MainLayout>
    <div class="space-y-6">
      <!-- Welcome Banner -->
      <div class="relative rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 sm:p-8">
        <div class="absolute inset-0 opacity-10">
          <div class="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-white/20 blur-3xl"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/20 blur-3xl"></div>
        </div>
        <div class="relative z-10">
          <h1 class="text-xl sm:text-2xl font-bold text-white mb-1">
            Selamat Datang, {{ authStore.user?.name?.split(' ')[0] || 'User' }}! 👋
          </h1>
          <p class="text-white/60 text-sm">Berikut ringkasan inventaris terbaru Anda.</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="flex flex-col items-center gap-3">
          <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-slate-400 dark:text-white/30">Memuat dashboard...</span>
        </div>
      </div>

      <template v-else>
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(stat, i) in stats" :key="i"
            class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5 hover:shadow-md dark:hover:bg-white/[0.05] transition-all group">
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="{
                  'bg-indigo-100 dark:bg-indigo-500/15': stat.color === 'indigo',
                  'bg-emerald-100 dark:bg-emerald-500/15': stat.color === 'emerald',
                  'bg-amber-100 dark:bg-amber-500/15': stat.color === 'amber',
                  'bg-sky-100 dark:bg-sky-500/15': stat.color === 'sky',
                }">
                <svg v-if="stat.icon === 'box'" class="text-indigo-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                </svg>
                <svg v-if="stat.icon === 'layers'" class="text-emerald-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <svg v-if="stat.icon === 'alert'" class="text-amber-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <svg v-if="stat.icon === 'truck'" class="text-sky-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <svg class="text-slate-300 dark:text-white/10 group-hover:text-indigo-400 transition-colors" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              </svg>
            </div>
            <p class="text-2xl font-bold text-slate-800 dark:text-white">{{ formatRupiah(stat.value) }}</p>
            <p class="text-xs text-slate-400 dark:text-white/25 mt-0.5">{{ stat.suffix }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Chart Section -->
          <div class="lg:col-span-2 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                <svg class="text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Pergerakan Stok (7 Hari)
              </h3>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span class="text-[11px] text-slate-400 dark:text-white/30">Masuk</span>
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span class="text-[11px] text-slate-400 dark:text-white/30">Keluar</span>
                </div>
              </div>
            </div>

            <div class="flex items-end justify-between gap-2 h-[180px] px-2">
              <div v-for="(label, i) in chartLabels" :key="i" class="flex-1 flex flex-col items-center gap-1">
                <div class="w-full flex gap-1 items-end justify-center" style="height: 160px;">
                  <div class="w-[35%] rounded-t-md bg-emerald-500/80 dark:bg-emerald-500/60 transition-all duration-500 hover:bg-emerald-500"
                    :style="{ height: `${((chartStockIn[i] ?? 0) / chartMaxValue) * 100}%`, minHeight: '4px' }"
                    :title="`Masuk: ${chartStockIn[i]}`">
                  </div>
                  <div class="w-[35%] rounded-t-md bg-rose-500/80 dark:bg-rose-500/60 transition-all duration-500 hover:bg-rose-500"
                    :style="{ height: `${((chartStockOut[i] ?? 0) / chartMaxValue) * 100}%`, minHeight: '4px' }"
                    :title="`Keluar: ${chartStockOut[i]}`">
                  </div>
                </div>
                <span class="text-[10px] text-slate-400 dark:text-white/25 mt-1">{{ label }}</span>
              </div>
            </div>
          </div>

          <!-- Low Stock Alerts -->
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
            <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg class="text-amber-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Peringatan Stok Rendah
            </h3>

            <div v-if="lowStockProducts.length > 0" class="space-y-3">
              <div v-for="product in lowStockProducts" :key="product.id"
                class="flex items-center justify-between py-2.5 border-b border-slate-50 dark:border-white/[0.03] last:border-0">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-700 dark:text-white/80 truncate">{{ product.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-white/30 mt-0.5">Min: {{ product.minStock }} unit</p>
                </div>
                <div class="flex items-center gap-2 shrink-0 ml-3">
                  <span class="text-sm font-bold" :class="product.stock <= 0 ? 'text-red-500' : 'text-amber-500'">
                    {{ product.stock }}
                  </span>
                  <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="stockBadge(product.stock, product.minStock).class">
                    {{ stockBadge(product.stock, product.minStock).label }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else class="py-8 text-center">
              <div class="text-3xl mb-2">✅</div>
              <p class="text-sm text-slate-400 dark:text-white/30">Semua stok aman!</p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-5">
          <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <svg class="text-violet-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Aktivitas Terbaru
          </h3>

          <div v-if="recentActivity.length > 0" class="space-y-1">
            <div v-for="log in recentActivity" :key="log.id"
              class="flex items-center gap-4 px-3 py-3 rounded-lg hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="log.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-rose-100 dark:bg-rose-500/15'">
                <svg v-if="log.type === 'in'" class="text-emerald-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
                <svg v-else class="text-rose-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 19V5M5 12l7-7 7 7"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-slate-700 dark:text-white/80">
                  <span class="font-medium">{{ log.userName }}</span>
                  <span class="text-slate-400 dark:text-white/30"> {{ log.type === 'in' ? 'menambah' : 'mengurangi' }} </span>
                  <span class="font-medium">{{ log.quantity }} unit</span>
                  <span class="text-slate-400 dark:text-white/30"> {{ log.productName }}</span>
                </p>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  :class="log.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'">
                  {{ log.type === 'in' ? '+' : '-' }}{{ log.quantity }}
                </span>
                <span class="text-[11px] text-slate-300 dark:text-white/20 w-20 text-right">{{ timeAgo(log.createdAt) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="py-8 text-center">
            <div class="text-3xl mb-2">📋</div>
            <p class="text-sm text-slate-400 dark:text-white/30">Belum ada aktivitas</p>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>