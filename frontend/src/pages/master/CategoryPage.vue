<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { categoryApi, toCamel } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Category } from '@/types'

const authStore = useAuthStore()

// State
const categories = ref<Category[]>([])
const isLoading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const formData = ref({ name: '', description: '' })
const showDeleteConfirm = ref<string | null>(null)
const successMsg = ref('')
const errorMsg = ref('')
const isSaving = ref(false)

// Fetch categories
async function fetchCategories() {
  try {
    isLoading.value = true
    const res = await categoryApi.getAll({ page: 1, limit: 100 })
    const items = res.data || res
    categories.value = (Array.isArray(items) ? items : []).map((c: any) => toCamel<Category>(c))
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data kategori'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchCategories)

function openAdd() {
  editingId.value = null
  formData.value = { name: '', description: '' }
  showForm.value = true
  errorMsg.value = ''
}

function openEdit(cat: Category) {
  editingId.value = cat.id
  formData.value = { name: cat.name, description: cat.description || '' }
  showForm.value = true
  errorMsg.value = ''
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  formData.value = { name: '', description: '' }
}

async function handleSave() {
  try {
    isSaving.value = true
    errorMsg.value = ''
    if (editingId.value) {
      await categoryApi.update(editingId.value, formData.value)
      successMsg.value = 'Kategori berhasil diperbarui'
    } else {
      await categoryApi.create(formData.value)
      successMsg.value = 'Kategori berhasil ditambahkan'
    }
    closeForm()
    await fetchCategories()
    setTimeout(() => { successMsg.value = '' }, 2500)
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal menyimpan kategori'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await categoryApi.delete(id)
    showDeleteConfirm.value = null
    successMsg.value = 'Kategori berhasil dihapus'
    await fetchCategories()
    setTimeout(() => { successMsg.value = '' }, 2500)
  } catch (err: any) {
    showDeleteConfirm.value = null
    errorMsg.value = err.message || 'Gagal menghapus kategori'
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <MainLayout>
    <div class="max-w-3xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Kategori Produk</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Kelola kategori untuk pengelompokan produk</p>
        </div>
        <button v-if="authStore.hasRole(['admin', 'manager'])" @click="openAdd"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Kategori
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMsg" class="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-5 py-4 transition-all">
        <svg class="text-emerald-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">{{ successMsg }}</span>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-5 py-4">
        <svg class="text-red-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <span class="text-sm font-medium text-red-700 dark:text-red-400">{{ errorMsg }}</span>
      </div>

      <!-- Add/Edit Form (Inline) -->
      <div v-if="showForm" class="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 p-5">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4">
          {{ editingId ? 'Edit Kategori' : 'Tambah Kategori Baru' }}
        </h3>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nama Kategori *</label>
            <input v-model="formData.name" type="text" required placeholder="Contoh: Elektronik"
              class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Deskripsi</label>
            <textarea v-model="formData.description" rows="2" placeholder="Deskripsi kategori (opsional)"
              class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all resize-none"></textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="closeForm" class="px-4 py-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/60 cursor-pointer">Batal</button>
            <button type="submit" :disabled="isSaving" class="px-5 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors cursor-pointer disabled:opacity-50">
              <span v-if="isSaving">Menyimpan...</span>
              <span v-else>{{ editingId ? 'Simpan' : 'Tambah' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="flex items-center justify-center py-16">
        <svg class="animate-spin text-indigo-500" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>
        <span class="ml-3 text-sm text-slate-500 dark:text-white/40">Memuat data...</span>
      </div>

      <!-- Category List -->
      <div v-else class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] overflow-hidden">
        <div class="divide-y divide-slate-100 dark:divide-white/[0.04]">
          <div v-for="cat in categories" :key="cat.id"
            class="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center shrink-0">
                <svg class="text-indigo-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-slate-700 dark:text-white/90">{{ cat.name }}</p>
                <p class="text-xs text-slate-400 dark:text-white/30 truncate">{{ cat.description || 'Tidak ada deskripsi' }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span v-if="cat.createdAt" class="text-xs text-slate-300 dark:text-white/15 hidden sm:block">{{ formatDate(cat.createdAt) }}</span>

              <div v-if="authStore.hasRole(['admin', 'manager'])" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEdit(cat)" class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all cursor-pointer" title="Edit">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button @click="showDeleteConfirm = cat.id" class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer" title="Hapus">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>

            <!-- Delete Confirmation -->
            <Teleport to="body">
              <div v-if="showDeleteConfirm === cat.id" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div class="bg-white dark:bg-[#1a1833] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Hapus Kategori?</h3>
                  <p class="text-sm text-slate-500 dark:text-white/40 mb-5">Kategori <strong>{{ cat.name }}</strong> akan dihapus. Tindakan ini tidak bisa dibatalkan.</p>
                  <div class="flex justify-end gap-2">
                    <button @click="showDeleteConfirm = null" class="px-4 py-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-700 cursor-pointer">Batal</button>
                    <button @click="handleDelete(cat.id)" class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors cursor-pointer">Ya, Hapus</button>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>

          <!-- Empty -->
          <div v-if="categories.length === 0" class="px-5 py-16 text-center">
            <div class="text-4xl mb-3">🏷️</div>
            <p class="text-sm text-slate-500 dark:text-white/40">Belum ada kategori</p>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>