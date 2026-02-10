<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi, categoryApi, supplierApi, toCamel } from '@/services/api'
import type { Product, Category, Supplier } from '@/types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const pageTitle = computed(() => isEdit.value ? 'Edit Produk' : 'Tambah Produk')

// Data lists
const categories = ref<Category[]>([])
const suppliers = ref<Supplier[]>([])

// Form state
const form = ref({
  name: '',
  sku: '',
  price: 0,
  stock: 0,
  minStock: 5,
  categoryId: '',
  supplierId: '',
  description: '',
  image: null as File | null,
})

const imagePreview = ref<string | null>(null)
const isSaving = ref(false)
const showSuccess = ref(false)
const isLoading = ref(false)
const errorMsg = ref('')

// Fetch categories & suppliers for dropdowns
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

// If editing, load existing product
onMounted(async () => {
  await fetchOptions()
  if (isEdit.value) {
    try {
      isLoading.value = true
      const res = await productApi.getById(route.params.id as string)
      const raw = res.data || res
      const product = toCamel<Product>(raw)
      form.value = {
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        description: product.description || '',
        image: null,
      }
    } catch (err: any) {
      errorMsg.value = err.message || 'Gagal memuat data produk'
    } finally {
      isLoading.value = false
    }
  }
})

// format rupiah for display
function formatRupiahInput(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value)
}

// handle price input
function onPriceInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/\D/g, '')
  form.value.price = parseInt(raw) || 0
}

// handle image upload
function onImageChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    form.value.image = file
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  form.value.image = null
  imagePreview.value = null
}

// submit form
async function handleSubmit() {
  try {
    isSaving.value = true
    errorMsg.value = ''

    let payload: any = {
      name: form.value.name,
      sku: form.value.sku,
      price: form.value.price,
      stock: form.value.stock,
      minStock: form.value.minStock,
      categoryId: form.value.categoryId,
      supplierId: form.value.supplierId,
      description: form.value.description,
    }

    if (form.value.image) {
      const fd = new FormData()
      fd.append('name', form.value.name)
      fd.append('sku', form.value.sku)
      fd.append('price', String(form.value.price))
      fd.append('stock', String(form.value.stock))
      fd.append('min_stock', String(form.value.minStock))
      fd.append('category_id', form.value.categoryId)
      fd.append('supplier_id', form.value.supplierId)
      if (form.value.description) fd.append('description', form.value.description)
      fd.append('image', form.value.image)
      payload = fd
    }

    if (isEdit.value) {
      await productApi.update(route.params.id as string, payload)
    } else {
      await productApi.create(payload)
    }

    showSuccess.value = true
    setTimeout(() => {
      router.push('/products')
    }, 1500)
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal menyimpan produk'
  } finally {
    isSaving.value = false
  }
}

</script>

<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button @click="router.back()" class="p-2 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-white/40 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-all cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">{{ pageTitle }}</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">{{ isEdit ? 'Perbarui informasi produk' : 'Tambahkan produk baru ke inventaris' }}</p>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <svg class="animate-spin text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <span class="ml-3 text-sm text-slate-500 dark:text-white/40">Memuat data...</span>
      </div>

      <template v-else>
        <!-- Success -->
        <div v-if="showSuccess" class="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-5 py-4">
          <svg class="text-emerald-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
          <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">Produk berhasil disimpan!</span>
        </div>

        <!-- Error -->
        <div v-if="errorMsg" class="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-5 py-4">
          <svg class="text-red-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span class="text-sm font-medium text-red-700 dark:text-red-400">{{ errorMsg }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Info -->
          <div class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] p-6">
            <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <svg class="text-indigo-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              Informasi Produk
            </h3>
            <div class="space-y-5">
              <!-- Image Upload -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-2">Foto Produk</label>
                <div class="flex items-center gap-4">
                  <div class="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/[0.1] flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-white/[0.03]">
                    <img v-if="imagePreview" :src="imagePreview" alt="Preview" class="w-full h-full object-cover" />
                    <svg v-else class="text-slate-300 dark:text-white/15" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                  </div>
                  <div class="space-y-2">
                    <label class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-lg text-sm font-medium text-slate-600 dark:text-white/60 hover:bg-slate-50 dark:hover:bg-white/[0.06] transition-all cursor-pointer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                      Upload
                      <input type="file" accept="image/*" @change="onImageChange" class="hidden" />
                    </label>
                    <button v-if="imagePreview" type="button" @click="removeImage" class="block text-xs text-red-500 hover:text-red-600 cursor-pointer">Hapus foto</button>
                    <p class="text-[11px] text-slate-400 dark:text-white/25">PNG, JPG max 2MB</p>
                  </div>
                </div>
              </div>
              <!-- Name & SKU -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nama Produk *</label>
                  <input v-model="form.name" type="text" required placeholder="Contoh: Beras Premium 5kg"
                    class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">SKU *</label>
                  <input v-model="form.sku" type="text" required placeholder="Contoh: BRS-001"
                    class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all font-mono" />
                </div>
              </div>
              <!-- Price & Stock -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Harga (Rp) *</label>
                  <input :value="formatRupiahInput(form.price)" @input="onPriceInput" type="text" required placeholder="0"
                    class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Stok Awal *</label>
                  <input v-model.number="form.stock" type="number" min="0" required
                    class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Minimum Stok</label>
                  <input v-model.number="form.minStock" type="number" min="0"
                    class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
                </div>
              </div>
              <!-- Category & Supplier -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Kategori *</label>
                  <div class="relative">
                    <select v-model="form.categoryId" required
                      class="appearance-none w-full px-4 pr-10 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer">
                      <option value="" disabled>-- Pilih kategori --</option>
                      <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                    </select>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Supplier *</label>
                  <div class="relative">
                    <select v-model="form.supplierId" required
                      class="appearance-none w-full px-4 pr-10 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer">
                      <option value="" disabled>-- Pilih supplier --</option>
                      <option v-for="sup in suppliers" :key="sup.id" :value="sup.id">{{ sup.name }}</option>
                    </select>
                    <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <!-- Description -->
              <div>
                <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Deskripsi</label>
                <textarea v-model="form.description" rows="3" placeholder="Deskripsi produk (opsional)"
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
              class="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer">
              <svg v-if="isSaving" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
              {{ isSaving ? 'Menyimpan...' : (isEdit ? '✓ Simpan Perubahan' : '✓ Tambah Produk') }}
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