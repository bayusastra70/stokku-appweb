<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { LoginCredentials } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const form = ref<LoginCredentials>({
  email: '',
  password: '',
  rememberMe: false,
})

const showPassword = ref(false)

const isFormValid = computed(() => {
  return form.value.email.trim() !== '' && form.value.password.trim() !== ''
})

async function handleLogin() {
  if (!isFormValid.value) return
  const success = await authStore.login(form.value)
  if (success) {
    router.push('/dashboard')
  }
}

function quickLogin(role: 'admin' | 'manager' | 'staff') {
  const emails: Record<string, string> = {
    admin: 'admin@stokku.com',
    manager: 'manager@stokku.com',
    staff: 'staff@stokku.com',
  }
  form.value.email = emails[role] || ''
  form.value.password = 'password123'
}
</script>

<template>
  <div class="login-page relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
    <!-- Animated Background -->
    <div class="fixed inset-0 bg-gradient-to-br from-[#0f0c29] via-[#1a1040] to-[#24243e] z-0"></div>

    <!-- Dot Pattern Overlay -->
    <div class="fixed inset-0 z-[1] opacity-[0.03] bg-dot-pattern"></div>

    <!-- Floating Blobs -->
    <div class="fixed inset-0 z-[1] pointer-events-none">
      <div class="absolute -top-[10%] -right-[5%] w-[400px] h-[400px] rounded-full bg-indigo-500 opacity-15 blur-[80px] animate-float-1"></div>
      <div class="absolute -bottom-[10%] -left-[5%] w-[300px] h-[300px] rounded-full bg-violet-500 opacity-15 blur-[80px] animate-float-2"></div>
      <div class="absolute top-[50%] left-[10%] w-[250px] h-[250px] rounded-full bg-cyan-500 opacity-10 blur-[80px] animate-float-3"></div>
      <div class="absolute bottom-[20%] right-[15%] w-[200px] h-[200px] rounded-full bg-pink-500 opacity-10 blur-[80px] animate-float-4"></div>
    </div>

    <!-- Login Card -->
    <div class="relative z-10 w-full max-w-[420px] px-5">
      <div class="glass-card rounded-3xl p-10 animate-card-appear">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex p-1 rounded-[14px] bg-white/10 mb-4">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="10" fill="url(#lg)" />
              <path d="M12 28V16L20 12L28 16V28L20 24L12 28Z" stroke="white" stroke-width="2" stroke-linejoin="round" fill="none"/>
              <path d="M20 12V24" stroke="white" stroke-width="2"/>
              <path d="M12 16L20 20L28 16" stroke="white" stroke-width="2"/>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
                  <stop stop-color="#6366f1" /><stop offset="1" stop-color="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="text-[28px] font-bold text-white tracking-tight">Stokku</h1>
          <p class="text-sm text-white/50 mt-1">Sistem Inventaris Modern</p>
        </div>

        <!-- Error Alert -->
        <div v-if="authStore.error"
          class="flex items-center gap-2.5 bg-red-500/15 border border-red-500/30 rounded-xl px-4 py-3 mb-6 text-red-300 text-[13px] animate-shake">
          <svg class="shrink-0 text-red-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ authStore.error }}</span>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="flex flex-col gap-5">
          <!-- Email -->
          <div class="flex flex-col gap-1.5">
            <label for="email" class="text-[13px] font-medium text-white/70 pl-0.5">Email</label>
            <div class="relative flex items-center group">
              <svg class="absolute left-3.5 text-white/30 group-focus-within:text-indigo-400 transition-colors pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13L2 4"/>
              </svg>
              <input id="email" v-model="form.email" type="email" placeholder="nama@email.com" autocomplete="email"
                class="w-full py-3 px-3.5 pl-11 bg-white/[0.06] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 outline-none focus:bg-white/[0.08] focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
            </div>
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-1.5">
            <label for="password" class="text-[13px] font-medium text-white/70 pl-0.5">Password</label>
            <div class="relative flex items-center group">
              <svg class="absolute left-3.5 text-white/30 group-focus-within:text-indigo-400 transition-colors pointer-events-none" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Masukkan password" autocomplete="current-password"
                class="w-full py-3 px-3.5 pl-11 pr-11 bg-white/[0.06] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/25 outline-none focus:bg-white/[0.08] focus:border-indigo-500 focus:ring-[3px] focus:ring-indigo-500/15 transition-all" />
              <button type="button" @click="showPassword = !showPassword"
                class="absolute right-3 text-white/30 hover:text-white/70 transition-colors p-1">
                <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Remember Me -->
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="form.rememberMe"
              class="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30 focus:ring-offset-0" />
            <span class="text-[13px] text-white/50">Ingat saya</span>
          </label>

          <!-- Submit -->
          <button type="submit" :disabled="!isFormValid || authStore.isLoading"
            class="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-[15px] rounded-xl hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all shadow-lg shadow-indigo-500/30 cursor-pointer">
            <svg v-if="authStore.isLoading" class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            <span>{{ authStore.isLoading ? 'Memproses...' : 'Masuk' }}</span>
          </button>
        </form>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-white/[0.08]"></div>
          <span class="text-[11px] uppercase tracking-widest text-white/30">Demo Quick Login</span>
          <div class="flex-1 h-px bg-white/[0.08]"></div>
        </div>

        <!-- Quick Login -->
        <div class="grid grid-cols-3 gap-2">
          <button @click="quickLogin('admin')"
            class="flex flex-col items-center gap-1 py-2.5 px-2 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/60 text-xs font-medium hover:bg-white/[0.08] hover:border-white/15 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer">
            <span class="text-lg">👑</span> Admin
          </button>
          <button @click="quickLogin('manager')"
            class="flex flex-col items-center gap-1 py-2.5 px-2 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/60 text-xs font-medium hover:bg-white/[0.08] hover:border-white/15 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer">
            <span class="text-lg">📊</span> Manager
          </button>
          <button @click="quickLogin('staff')"
            class="flex flex-col items-center gap-1 py-2.5 px-2 bg-white/[0.04] border border-white/[0.08] rounded-[10px] text-white/60 text-xs font-medium hover:bg-white/[0.08] hover:border-white/15 hover:text-white hover:-translate-y-0.5 transition-all cursor-pointer">
            <span class="text-lg">👤</span> Staff
          </button>
        </div>

        <p class="text-center text-[11px] text-white/20 mt-6">© 2026 Stokku — Inventory Management System</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-dot-pattern {
  background-image:
    radial-gradient(circle at 25px 25px, white 1px, transparent 0),
    radial-gradient(circle at 75px 75px, white 1px, transparent 0);
  background-size: 100px 100px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Animations */
.animate-card-appear {
  animation: cardAppear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes cardAppear {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.animate-float-1 { animation: float 20s ease-in-out infinite; }
.animate-float-2 { animation: float 20s ease-in-out infinite -5s; }
.animate-float-3 { animation: float 20s ease-in-out infinite -10s; }
.animate-float-4 { animation: float 20s ease-in-out infinite -15s; }

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(20px, 10px) scale(1.05); }
}
</style>