<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { supplierApi, toCamel } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { Supplier } from '@/types'

const authStore = useAuthStore()

// State
const suppliers = ref<Supplier[]>([])
const isLoading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const formData = ref({ name: '', phone: '', email: '', address: '' })
const showDeleteConfirm = ref<string | null>(null)
const successMsg = ref('')
const errorMsg = ref('')
const isSaving = ref(false)

// Fetch suppliers
async function fetchSuppliers() {
  try {
    isLoading.value = true
    const res = await supplierApi.getAll({ page: 1, limit: 100 })
    const items = res.data || res
    suppliers.value = (Array.isArray(items) ? items : []).map((s: any) => toCamel<Supplier>(s))
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data supplier'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchSuppliers)

function openAdd() {
  editingId.value = null
  formData.value = { name: '', phone: '', email: '', address: '' }
  showForm.value = true
  errorMsg.value = ''
}

function openEdit(sup: Supplier) {
  editingId.value = sup.id
  formData.value = { name: sup.name, phone: sup.phone, email: sup.email || '', address: sup.address || '' }
  showForm.value = true
  errorMsg.value = ''
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

async function handleSave() {
  try {
    isSaving.value = true
    errorMsg.value = ''
    if (editingId.value) {
      await supplierApi.update(editingId.value, formData.value)
      successMsg.value = 'Supplier berhasil diperbarui'
    } else {
      await supplierApi.create(formData.value)
      successMsg.value = 'Supplier berhasil ditambahkan'
    }
    closeForm()
    await fetchSuppliers()
    setTimeout(() => { successMsg.value = '' }, 2500)
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal menyimpan supplier'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await supplierApi.delete(id)
    showDeleteConfirm.value = null
    successMsg.value = 'Supplier berhasil dihapus'
    await fetchSuppliers()
    setTimeout(() => { successMsg.value = '' }, 2500)
  } catch (err: any) {
    showDeleteConfirm.value = null
    errorMsg.value = err.message || 'Gagal menghapus supplier'
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
}
</script>

<template>
  <MainLayout>
    <div class="max-w-4xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Data Supplier</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Kelola informasi supplier/pemasok barang</p>
        </div>
        <button v-if="authStore.hasRole(['admin', 'manager'])" @click="openAdd"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Tambah Supplier
        </button>
      </div>

      <!-- Success Message -->
      <div v-if="successMsg" class="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl px-5 py-4">
        <svg class="text-emerald-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
        <span class="text-sm font-medium text-emerald-700 dark:text-emerald-400">{{ successMsg }}</span>
      </div>

      <!-- Error Message -->
      <div v-if="errorMsg" class="flex items-center gap-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-5 py-4">
        <svg class="text-red-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <span class="text-sm font-medium text-red-700 dark:text-red-400">{{ errorMsg }}</span>
      </div>

      <!-- Add/Edit Form -->
      <div v-if="showForm" class="rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-500/5 p-5">
        <h3 class="text-sm font-semibold text-slate-800 dark:text-white mb-4">
          {{ editingId ? 'Edit Supplier' : 'Tambah Supplier Baru' }}
        </h3>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nama Supplier *</label>
              <input v-model="formData.name" type="text" required placeholder="Contoh: PT Maju Jaya"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">No. Telepon *</label>
              <input v-model="formData.phone" type="tel" required placeholder="Contoh: 021-12345678"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Email</label>
              <input v-model="formData.email" type="email" placeholder="email@supplier.com"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Alamat</label>
              <input v-model="formData.address" type="text" placeholder="Alamat supplier"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" @click="closeForm" class="px-4 py-2 text-sm text-slate-500 dark:text-white/40 hover:text-slate-700 cursor-pointer">Batal</button>
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

      <!-- Supplier Table -->
      <div v-else class="rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100 dark:border-white/[0.06]">
                <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Supplier</th>
                <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Telepon</th>
                <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Email</th>
                <th class="px-5 py-3.5 text-left text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Alamat</th>
                <th v-if="authStore.hasRole(['admin', 'manager'])" class="px-5 py-3.5 text-center text-[11px] uppercase tracking-wider font-semibold text-slate-400 dark:text-white/30">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sup in suppliers" :key="sup.id"
                class="border-b border-slate-50 dark:border-white/[0.03] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                <td class="px-5 py-3.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center shrink-0">
                      <svg class="text-sky-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <span class="text-sm font-medium text-slate-700 dark:text-white/90">{{ sup.name }}</span>
                  </div>
                </td>
                <td class="px-5 py-3.5">
                  <span class="text-sm text-slate-600 dark:text-white/60">{{ sup.phone }}</span>
                </td>
                <td class="px-5 py-3.5">
                  <span class="text-sm text-slate-500 dark:text-white/50">{{ sup.email || '-' }}</span>
                </td>
                <td class="px-5 py-3.5">
                  <span class="text-sm text-slate-400 dark:text-white/40 truncate max-w-[200px] block">{{ sup.address || '-' }}</span>
                </td>
                <td v-if="authStore.hasRole(['admin', 'manager'])" class="px-5 py-3.5">
                  <div class="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEdit(sup)" class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all cursor-pointer" title="Edit">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button @click="showDeleteConfirm = sup.id" class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer" title="Hapus">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>

                  <!-- Delete Confirm Modal -->
                  <Teleport to="body">
                    <div v-if="showDeleteConfirm === sup.id" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <div class="bg-white dark:bg-[#1a1833] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                        <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Hapus Supplier?</h3>
                        <p class="text-sm text-slate-500 dark:text-white/40 mb-5">Supplier <strong>{{ sup.name }}</strong> akan dihapus permanen.</p>
                        <div class="flex justify-end gap-2">
                          <button @click="showDeleteConfirm = null" class="px-4 py-2 text-sm text-slate-500 cursor-pointer">Batal</button>
                          <button @click="handleDelete(sup.id)" class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 cursor-pointer">Ya, Hapus</button>
                        </div>
                      </div>
                    </div>
                  </Teleport>
                </td>
              </tr>
              <tr v-if="suppliers.length === 0">
                <td :colspan="authStore.hasRole(['admin', 'manager']) ? 5 : 4" class="px-5 py-16 text-center">
                  <div class="text-4xl mb-3">🚚</div>
                  <p class="text-sm text-slate-500 dark:text-white/40">Belum ada data supplier</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </MainLayout>
</template>