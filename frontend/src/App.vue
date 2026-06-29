<template>
  <div class="flex min-h-screen">
    <aside class="w-44 bg-[#26215C] flex flex-col flex-shrink-0">
      <div class="bg-[#3C3489] flex flex-col items-center gap-2 p-4 border-b border-white/10">
        <img src="https://bluttyte.netlify.app/img/logoBlueTea.jpeg"
          alt="Logo Blutty"
          class="w-16 h-16 rounded-full border-2 border-white/20 object-cover" />
        <p class="text-white font-medium tracking-widest text-sm">BLUTTY</p>
        <p class="text-purple-300 text-xs">Gestión de almacén</p>
      </div>
      <nav class="flex flex-col gap-1 p-3 flex-1">
        <p class="text-purple-400 text-xs uppercase tracking-widest mt-2 mb-1 px-2">Principal</p>
        <button @click="vista = 'peps'"
          :class="vista === 'peps' ? 'bg-purple-700/30 text-white' : 'text-purple-300'"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left">
          📋 Tarjeta PEPS
        </button>
        <button @click="vista = 'resumenes'"
          :class="vista === 'resumenes' ? 'bg-purple-700/30 text-white' : 'text-purple-300'"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left">
          📊 Resúmenes
        </button>
        <button @click="vista = 'vendedores'"
          :class="vista === 'vendedores' ? 'bg-purple-700/30 text-white' : 'text-purple-300'"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left">
          👥 Vendedores
        </button>
      </nav>
    </aside>
    <main class="flex-1 bg-gray-50">
      <TarjetaPEPS v-if="vista === 'peps'" />
      <Resumenes v-if="vista === 'resumenes'" />
      <Vendedores v-if="vista === 'vendedores'" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TarjetaPEPS from './views/TarjetaPEPS.vue';
import Resumenes from './views/Resumenes.vue';
import Vendedores from './views/Vendedores.vue';

const vista = ref('peps');
</script>