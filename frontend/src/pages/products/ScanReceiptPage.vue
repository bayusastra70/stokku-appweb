<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/components/layout/MainLayout.vue'
import OCRScanner from '@/components/shared/OCRScanner.vue'
import { productApi, categoryApi, supplierApi, toCamel } from '@/services/api'
import type { Category, Supplier } from '@/types'

const router = useRouter()

// Data lists
const categories = ref<Category[]>([])
const suppliers = ref<Supplier[]>([])

// State
const scannedItems = ref<any[]>([])
const isProcessing = ref(false)
const isSaving = ref(false)
const showSuccess = ref(false)
const errorMsg = ref('')

// Fetch options
async function fetchOptions() {
  try {
    const [catRes, supRes] = await Promise.all([
      categoryApi.getSimple(),
      supplierApi.getSimple(),
    ])
    categories.value = (Array.isArray(catRes) ? catRes : []).map((c: any) => toCamel<Category>(c))
    suppliers.value = (Array.isArray(supRes) ? supRes : []).map((s: any) => toCamel<Supplier>(s))
  } catch (err) {
    console.error('Failed to load options:', err)
  }
}

onMounted(() => {
  fetchOptions()
})

// Handle Scan Results
function onScanComplete(data: any) {
  // Ensure data.products is an array
  const items = data.products 
    ? (Array.isArray(data.products) ? data.products : [data.products])
    : (Array.isArray(data) ? data : [data])

  // Map to our form structure
  const newItems = items.map((item: any) => {
    // Try matching category
    let categoryId = ''
    if (item.category && categories.value.length > 0) {
      const search = item.category.toLowerCase()
      const cat = categories.value.find(c => 
        c.name.toLowerCase().includes(search) || 
        search.includes(c.name.toLowerCase())
      )
      if (cat) categoryId = cat.id
    }

    // Try matching supplier
    let supplierId = ''
    if (item.supplier && suppliers.value.length > 0) {
      const search = item.supplier.toLowerCase()
      const sup = suppliers.value.find(s => 
        s.name.toLowerCase().includes(search) || 
        search.includes(s.name.toLowerCase())
      )
      if (sup) supplierId = sup.id
    }

    return {
      name: item.product_name || '',
      sku: '', // User must fill specific SKU or auto-generate? Let's leave empty
      price: parseInt(String(item.price).replace(/\D/g, '')) || 0,
      stock: Number(item.quantity) || 0,
      minStock: 5,
      categoryId,
      supplierId,
      description: item.expiry_date ? `Kadaluarsa: ${item.expiry_date}` : '',
      isValid: true // simplified validation state
    }
  })

  scannedItems.value = [...scannedItems.value, ...newItems]
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

function removeItem(index: number) {
  scannedItems.value.splice(index, 1)
}

// format rupiah
function formatRupiahInput(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

function onPriceInput(item: any, event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '')
  item.price = parseInt(raw) || 0
}

// Save All
async function saveAll() {
  if (scannedItems.value.length === 0) return

  // Validate
  const invalid = scannedItems.value.find(
    item => !item.name || !item.sku || !item.categoryId || !item.supplierId || item.price <= 0
  )
  if (invalid) {
    errorMsg.value = 'Mohon lengkapi semua data (Nama, SKU, Kategori, Supplier, Harga) untuk setiap item.'
    return
  }

  try {
    isSaving.value = true
    errorMsg.value = ''
    
    // Save sequentially to avoid race conditions or overwhelming server
    for (const item of scannedItems.value) {
      const payload: any = {
        name: item.name,
        sku: item.sku,
        price: item.price,
        stock: item.stock,
        min_stock: item.minStock,
        category_id: item.categoryId,
        supplier_id: item.supplierId,
        description: item.description,
      }
      // Note: Image is not supported in bulk scan for now
      await productApi.create(payload)
    }

    showSuccess.value = true
    scannedItems.value = [] // Clear list
    setTimeout(() => {
      router.push('/products')
    }, 1500)
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal menyimpan beberapa produk.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <MainLayout>
    <div class="max-w-5xl mx-auto space-y-6">
      
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Scan Struk Belanja</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Import banyak produk sekaligus dari foto struk</p>
        </div>
      </div>

      <!-- Scanner -->
      <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-6">
        <div class="flex items-center gap-2 mb-4">
          <svg class="text-indigo-500" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
          <h3 class="text-sm font-semibold text-slate-800 dark:text-white">AI Scanner</h3>
        </div>
        <OCRScanner @scan-complete="onScanComplete" />
      </div>

      <!-- Scanned Items List -->
      <div v-if="scannedItems.length > 0" class="space-y-4 animate-in fade-in slide-in-from-bottom-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">Hasil Scan ({{ scannedItems.length }} Item)</h3>
          <button @click="scannedItems = []" class="text-sm text-red-500 hover:text-red-600 font-medium">Reset Semua</button>
        </div>

        <!-- Error Message -->
         <div v-if="errorMsg" class="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-5 py-4">
          <svg class="text-red-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span class="text-sm font-medium text-red-700 dark:text-red-400">{{ errorMsg }}</span>
        </div>

        <!-- Table Form -->
        <div class="space-y-3">
          <div v-for="(item, idx) in scannedItems" :key="idx" 
            class="p-4 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] space-y-4 relative"
          >
            <button @click="removeItem(idx)" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-8">
              <!-- Name -->
              <div class="col-span-1 lg:col-span-2">
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nama Produk</label>
                <input v-model="item.name" type="text" placeholder="Nama Produk" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white" />
              </div>
              
              <!-- SKU -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">SKU</label>
                <input v-model="item.sku" type="text" placeholder="Kode SKU" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white font-mono" />
              </div>

              <!-- Price -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Harga</label>
                <input :value="formatRupiahInput(item.price)" @input="(e) => onPriceInput(item, e)" type="text" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white text-right" />
              </div>

               <!-- Stock -->
               <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Stok</label>
                <input v-model.number="item.stock" type="number" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white" />
              </div>

               <!-- Category -->
               <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Kategori</label>
                <select v-model="item.categoryId" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white cursor-pointer appearance-none">
                  <option value="" disabled>Pilih Kategori</option>
                  <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>

               <!-- Supplier -->
               <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Supplier</label>
                <select v-model="item.supplierId" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white cursor-pointer appearance-none">
                  <option value="" disabled>Pilih Supplier</option>
                  <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
                </select>
              </div>

              <!-- Min Stock -->
               <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Min Stok</label>
                <input v-model.number="item.minStock" type="number" class="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.1] rounded-lg text-sm outline-none focus:border-indigo-500 transition-all dark:text-white" />
              </div>
            </div>
            
            <!-- Description -->
            <div>
               <input v-model="item.description" type="text" placeholder="Deskripsi tambahan..." class="w-full px-3 py-2 bg-transparent border-0 border-b border-slate-200 dark:border-white/[0.1] text-xs text-slate-500 dark:text-white/50 focus:border-indigo-500 focus:ring-0 transition-all" />
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="sticky bottom-6 z-10 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-200 dark:border-white/[0.06] shadow-xl flex justify-between items-center">
          <div class="text-sm text-slate-500 dark:text-white/50">
            Pastikan semua data (SKU, Harga, dll) sudah benar sebelum disimpan.
          </div>
          <button @click="saveAll" :disabled="isSaving" class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm rounded-xl hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer">
            <svg v-if="isSaving" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
            {{ isSaving ? 'Menyimpan Semua...' : '✓ Simpan Semua Produk' }}
          </button>
        </div>
      </div>

       <!-- Success -->
        <div v-else-if="showSuccess" class="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-300">
          <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Import Berhasil!</h3>
          <p class="text-slate-500 dark:text-white/50 text-center max-w-md">Semua produk berhasil ditambahkan ke inventaris. Mengalihkan ke daftar produk...</p>
        </div>

    </div>
  </MainLayout>
</template>

<style scoped>
select option {
  background: #1e1b3a;
  color: white;
}
</style>
