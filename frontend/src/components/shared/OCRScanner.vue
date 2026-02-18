<script setup lang="ts">
import { ref } from 'vue';
import { ocrApi } from '@/services/api';

const emit = defineEmits<{
  (e: 'scan-complete', data: any): void;
}>();

const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const dragging = ref(false);

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    await processFile(target.files[0]);
  }
};

const handleDrop = async (event: DragEvent) => {
  dragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    await processFile(event.dataTransfer.files[0]);
  }
};

const processFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    alert('Hanya file gambar yang diperbolehkan');
    return;
  }

  isLoading.value = true;
  try {
    const response = await ocrApi.scan(file);
    if (response.success && response.data) {
      emit('scan-complete', response.data);
    }
  } catch (error: any) {
    console.error("Gagal scan:", error);
    alert(error.message || "Gagal memproses gambar");
  } finally {
    isLoading.value = false;
    if (fileInput.value) fileInput.value.value = '';
  }
};
</script>

<template>
  <div
    class="relative border-2 border-dashed rounded-xl transition-all duration-200 p-6 flex flex-col items-center justify-center text-center cursor-pointer group"
    :class="[
      dragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50',
      isLoading ? 'opacity-70 pointer-events-none' : ''
    ]"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="handleDrop"
    @click="fileInput?.click()"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      accept="image/*"
      capture="environment"
      @change="handleFileUpload"
    />

    <div v-if="isLoading" class="flex flex-col items-center animate-pulse">
      <svg class="w-10 h-10 text-indigo-500 animate-spin mb-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm font-medium text-indigo-600">Sedang menganalisa gambar...</span>
      <span class="text-xs text-gray-400 mt-1">AI sedang membaca struk belanja Anda</span>
    </div>

    <div v-else class="flex flex-col items-center">
      <div class="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-600">
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
          <line x1="16" y1="5" x2="22" y2="5" />
          <line x1="19" y1="2" x2="19" y2="8" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      </div>
      <h3 class="text-sm font-semibold text-gray-900 mb-1">
        Upload atau Foto Struk
      </h3>
      <p class="text-xs text-gray-500 max-w-[200px]">
        Klik atau tarik gambar ke sini untuk ekstrak otomatis data produk
      </p>
    </div>
  </div>
</template>
