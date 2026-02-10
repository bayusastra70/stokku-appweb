<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative font-sans">
    <div class="fixed inset-0 bg-gradient-to-br from-[#0f0c29] via-[#1a1040] to-[#24243e]"></div>
    <div class="relative z-10 text-center px-6 animate-card-appear">
      <div class="inline-flex p-5 rounded-full bg-red-500/10 text-red-400 mb-6">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
        </svg>
      </div>
      <h1 class="text-7xl font-extrabold text-white/10">403</h1>
      <h2 class="text-2xl font-bold text-white mt-2 mb-3">Akses Ditolak</h2>
      <p class="text-sm text-white/40 leading-relaxed max-w-[360px] mx-auto mb-8">
        Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
        Hubungi administrator jika Anda merasa ini adalah kesalahan.
      </p>
      <button @click="router.push('/dashboard')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold text-sm rounded-xl hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-500/30 cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Kembali ke Dashboard
      </button>
    </div>
  </div>
</template>

<style scoped>
.animate-card-appear {
  animation: appear 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes appear {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>