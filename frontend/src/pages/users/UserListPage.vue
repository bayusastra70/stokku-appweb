<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/components/layout/MainLayout.vue'
import { userApi, toCamel } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const authStore = useAuthStore()

const users = ref<User[]>([])
const isLoading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const formData = ref({ name: '', email: '', role: 'staff' as 'admin' | 'manager' | 'staff', isActive: true, password: '' })
const showDeleteConfirm = ref<string | null>(null)
const successMsg = ref('')
const errorMsg = ref('')
const isSaving = ref(false)

const roleColors: Record<string, string> = {
  admin: 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  manager: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400',
  staff: 'bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Staff',
}

async function fetchUsers() {
  try {
    isLoading.value = true
    const res = await userApi.getAll({ page: 1, limit: 100 })
    const items = res.data || res
    users.value = (Array.isArray(items) ? items : []).map((u: any) => toCamel<User>(u))
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal memuat data user'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchUsers)

function openAdd() {
  editingId.value = null
  formData.value = { name: '', email: '', role: 'staff', isActive: true, password: '' }
  showForm.value = true
  errorMsg.value = ''
}

function openEdit(user: User) {
  editingId.value = user.id
  formData.value = { name: user.name, email: user.email, role: user.role, isActive: user.isActive, password: '' }
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
    const payload: any = { name: formData.value.name, email: formData.value.email, role: formData.value.role, isActive: formData.value.isActive }
    if (formData.value.password) payload.password = formData.value.password

    if (editingId.value) {
      await userApi.update(editingId.value, payload)
      successMsg.value = 'User berhasil diperbarui'
    } else {
      await userApi.create(payload)
      successMsg.value = 'User berhasil ditambahkan'
    }
    closeForm()
    await fetchUsers()
    setTimeout(() => { successMsg.value = '' }, 2500)
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal menyimpan user'
  } finally {
    isSaving.value = false
  }
}

async function handleDelete(id: string) {
  try {
    await userApi.delete(id)
    showDeleteConfirm.value = null
    successMsg.value = 'User berhasil dihapus'
    await fetchUsers()
    setTimeout(() => { successMsg.value = '' }, 2500)
  } catch (err: any) {
    showDeleteConfirm.value = null
    errorMsg.value = err.message || 'Gagal menghapus user'
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
}

async function toggleActive(user: User) {
  try {
    await userApi.toggleActive(user.id)
    await fetchUsers()
  } catch (err: any) {
    errorMsg.value = err.message || 'Gagal mengubah status user'
    setTimeout(() => { errorMsg.value = '' }, 3000)
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>

<template>
  <MainLayout>
    <div class="max-w-4xl mx-auto space-y-5">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xl font-bold text-slate-800 dark:text-white">Manajemen User</h2>
          <p class="text-sm text-slate-400 dark:text-white/40 mt-0.5">Kelola pengguna dan hak akses sistem</p>
        </div>
        <button v-if="authStore.hasRole(['admin'])" @click="openAdd"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-medium text-sm rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/25 cursor-pointer">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          Tambah User
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
          {{ editingId ? 'Edit User' : 'Tambah User Baru' }}
        </h3>
        <form @submit.prevent="handleSave" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Nama Lengkap *</label>
              <input v-model="formData.name" type="text" required placeholder="Contoh: Ahmad Saputra"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Email *</label>
              <input v-model="formData.email" type="email" required placeholder="user@stokku.com"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Password {{ editingId ? '(kosongkan jika tidak diubah)' : '*' }}</label>
              <input v-model="formData.password" type="password" :required="!editingId" placeholder="Min 6 karakter"
                class="w-full px-4 py-2.5 bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 placeholder:text-slate-300 dark:placeholder:text-white/20 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all" />
            </div>
            <div>
              <label class="block text-xs font-medium text-slate-500 dark:text-white/50 mb-1.5">Role *</label>
              <div class="relative">
                <select v-model="formData.role" required
                  class="appearance-none w-full px-4 pr-10 py-2.5 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] rounded-xl text-sm text-slate-700 dark:text-white/80 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 transition-all cursor-pointer">
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </select>
                <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <label class="inline-flex items-center gap-3 cursor-pointer">
              <input v-model="formData.isActive" type="checkbox"
                class="w-5 h-5 rounded border-slate-300 dark:border-white/20 text-indigo-500 focus:ring-indigo-500/20" />
              <span class="text-sm text-slate-600 dark:text-white/60">User Aktif</span>
            </label>
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

      <!-- User Cards -->
      <div v-else class="grid gap-3">
        <div v-for="user in users" :key="user.id"
          class="flex items-center justify-between px-5 py-4 rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03] hover:shadow-sm dark:hover:bg-white/[0.04] transition-all group">
          <div class="flex items-center gap-4">
            <!-- Avatar -->
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              :class="user.isActive ? 'bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/25'">
              {{ getInitials(user.name) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-slate-700 dark:text-white/90">{{ user.name }}</p>
                <span class="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" :class="roleColors[user.role]">
                  {{ roleLabels[user.role] }}
                </span>
              </div>
              <p class="text-xs text-slate-400 dark:text-white/30 mt-0.5">{{ user.email }} • Bergabung {{ formatDate(user.createdAt) }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <!-- Status Toggle -->
            <button v-if="authStore.hasRole(['admin'])" @click="toggleActive(user)"
              class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer"
              :class="user.isActive ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-white/[0.06] text-slate-400 dark:text-white/30'">
              <span class="w-2 h-2 rounded-full" :class="user.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/20'"></span>
              {{ user.isActive ? 'Aktif' : 'Nonaktif' }}
            </button>

            <!-- Actions -->
            <div v-if="authStore.hasRole(['admin'])" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEdit(user)" class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all cursor-pointer" title="Edit">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button @click="showDeleteConfirm = user.id" class="p-1.5 rounded-lg text-slate-400 dark:text-white/30 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all cursor-pointer" title="Hapus">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </button>
            </div>

            <!-- Delete Modal -->
            <Teleport to="body">
              <div v-if="showDeleteConfirm === user.id" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div class="bg-white dark:bg-[#1a1833] rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
                  <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-2">Hapus User?</h3>
                  <p class="text-sm text-slate-500 dark:text-white/40 mb-5">User <strong>{{ user.name }}</strong> akan dihapus dari sistem.</p>
                  <div class="flex justify-end gap-2">
                    <button @click="showDeleteConfirm = null" class="px-4 py-2 text-sm text-slate-500 cursor-pointer">Batal</button>
                    <button @click="handleDelete(user.id)" class="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 cursor-pointer">Ya, Hapus</button>
                  </div>
                </div>
              </div>
            </Teleport>
          </div>
        </div>

        <!-- Empty -->
        <div v-if="users.length === 0 && !isLoading" class="px-5 py-16 text-center rounded-xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-white/[0.03]">
          <div class="text-4xl mb-3">👥</div>
          <p class="text-sm text-slate-500 dark:text-white/40">Belum ada user terdaftar</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
select option { background: #1e1b3a; color: white; }
</style>