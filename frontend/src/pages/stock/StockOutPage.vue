<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import { productApi, stockApi, toCamel } from '@/services/api'
import type { Product } from '@/types'

const router = useRouter()

const products = ref<Product[]>([])
const isLoadingData = ref(true)

const form = ref({
  productId: '',
  quantity: 1,
  reason: 'sale',
  notes: '',
})

const isSaving = ref(false)
const showSuccess = ref(false)
const errorMsg = ref('')

const reasons = [
  { value: 'sale', label: 'Penjualan' },
  { value: 'damaged', label: 'Barang Rusak / Expired' },
  { value: 'adjustment', label: 'Penyesuaian Stok' },
]

const selectedProduct = ref<Product | null>(null)

onMounted(async () => {
  try {
    const res = await productApi.getAll({ limit: 500 })
    const items = res.data || res
    products.value = (Array.isArray(items) ? items : []).map((p: any) => toCamel<Product>(p))
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    isLoadingData.value = false
  }
})

function onProductChange() {
  selectedProduct.value = products.value.find(p => p.id === form.value.productId) || null
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

async function handleSubmit() {
  // Validate stock availability
  if (selectedProduct.value && form.value.quantity > selectedProduct.value.stock) {
    errorMsg.value = `Stok tidak mencukupi. Stok tersedia: ${selectedProduct.value.stock}`
    return
  }

  try {
    isSaving.value = true
    errorMsg.value = ''

    await stockApi.record({
      productId: form.value.productId,
      type: 'out',
      quantity: form.value.quantity,
      reason: form.value.reason,
      notes: form.value.notes || undefined,
    })

    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
      form.value = { productId: '', quantity: 1, reason: 'sale', notes: '' }
      selectedProduct.value = null
      // Refresh product list
      productApi.getAll({ limit: 500 }).then(res => {
        const items = res.data || res
        products.value = (Array.isArray(items) ? items : []).map((p: any) => toCamel<Product>(p))
      })
    }, 2000)
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal mencatat stok keluar'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Barang Keluar</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Catat pengeluaran barang dari inventaris</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoadingData" class="flex items-center justify-center py-16">
        <svg class="animate-spin text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <span class="ml-3 text-sm text-slate-500 dark:text-white/40">Memuat data...</span>
      </div>

      <template v-else>
        <!-- Success -->
        <div v-if="showSuccess" class="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-5 py-4">
          <svg class="text-emerald-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">Stok keluar berhasil dicatat!</span>
        </div>
        <!-- Error -->
        <div v-if="errorMsg" class="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-5 py-4">
          <svg class="text-red-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span class="text-sm font-medium text-red-700 dark:text-red-400">{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-6">
            <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg class="text-rose-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
              Data Barang Keluar
            </h3>
            <div class="space-y-5">
              <!-- Product -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Pilih Produk *</label>
                <div class="relative">
                  <select v-model="form.productId" @change="onProductChange" required
                    class="appearance-none w-full px-4 pr-10 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer">
                    <option value="" disabled>-- Pilih produk --</option>
                    <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} (Stok: {{ p.stock }})</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
              <!-- Product Info -->
              <div v-if="selectedProduct" class="bg-slate-50 dark:bg-white/[0.03] rounded-lg p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-lg bg-slate-200 dark:bg-white/[0.06] flex items-center justify-center">
                  <svg class="text-slate-400 dark:text-white/20" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                </div>
                <div class="flex-1">
                  <p class="text-sm font-medium text-slate-700 dark:text-white/80">{{ selectedProduct.name }}</p>
                  <p class="text-xs text-slate-400 dark:text-white/30">{{ selectedProduct.sku }} • {{ formatRupiah(selectedProduct.price) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[11px] text-slate-400 dark:text-white/30">Stok tersedia</p>
                  <p class="text-lg font-bold" :class="selectedProduct.stock <= selectedProduct.minStock ? 'text-amber-500' : 'text-slate-800 dark:text-white'">
                    {{ selectedProduct.stock }}
                  </p>
                </div>
              </div>
              <!-- Quantity -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Jumlah Keluar *</label>
                  <input v-model.number="form.quantity" type="number" min="1" :max="selectedProduct?.stock || 99999" required
                    class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
                  <p v-if="selectedProduct" class="mt-1 text-[11px] text-slate-400 dark:text-white/25">Maks: {{ selectedProduct.stock }} unit</p>
                </div>
                <div></div>
              </div>
              <!-- Reason -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Alasan *</label>
                <div class="relative">
                  <select v-model="form.reason" required
                    class="appearance-none w-full px-4 pr-10 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer">
                    <option v-for="r in reasons" :key="r.value" :value="r.value">{{ r.label }}</option>
                  </select>
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
              <!-- Notes -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Catatan</label>
                <textarea v-model="form.notes" rows="3" placeholder="Catatan tambahan (opsional)"
                  class="w-full px-4 py-3 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"></textarea>
              </div>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex items-center justify-end gap-3">
            <button type="button" @click="router.back()"
              class="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-white/50 border border-slate-200 dark:border-white/[0.08] rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
              Batal
            </button>
            <button type="submit" :disabled="isSaving"
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/25 cursor-pointer">
              <svg v-if="isSaving" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              {{ isSaving ? 'Menyimpan...' : '✓ Catat Barang Keluar' }}
            </button>
          </div>
        </form>
      </template>
    </div>
  </MainLayout>
</template>

<style scoped>
select option {
  background: #1e1b3a;
  color: white;
}
</style>