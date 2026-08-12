<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-lg font-medium text-gray-800">Vendedores</h1>
        <p class="text-xs text-gray-400">Gestión de vendedores</p>
      </div>
      <button @click="mostrarForm = !mostrarForm"
        class="bg-purple-700 text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2">
        + Agregar vendedor
      </button>
    </div>

    <div v-if="mostrarForm" class="bg-white border border-purple-200 rounded-xl p-4 mb-4">
      <h3 class="text-sm font-medium text-purple-600 mb-3">Nuevo vendedor</h3>
      <div class="flex gap-3 items-end">
        <div class="flex flex-col gap-1 flex-1">
          <label class="text-xs text-gray-500">Nombre</label>
          <input v-model="nuevoNombre" placeholder="Nombre del vendedor"
            class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <button @click="agregar" class="bg-purple-700 text-white rounded-lg px-4 py-1.5 text-sm">
          Guardar
        </button>
        <button @click="mostrarForm = false" class="border border-gray-200 text-gray-400 rounded-lg px-4 py-1.5 text-sm">
          Cancelar
        </button>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div v-for="v in vendedores" :key="v.id"
        class="relative bg-white border border-purple-200 rounded-xl p-4 flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-medium text-gray-800 text-sm">{{ v.nombre }}</span>
          <div class="flex items-center gap-1">
            <button @click="toggleUbicacion(v)"
              :class="v.ubicacion ? 'text-purple-600' : 'text-gray-300'"
              class="hover:bg-purple-50 rounded p-1">
              <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
              </svg>
            </button>
            <button @click="confirmarEliminar(v)" class="text-red-400 hover:bg-red-50 rounded p-1 text-sm">🗑</button>
          </div>
        </div>

        <div v-if="editandoUbicacionId === v.id"
          class="absolute right-3 top-11 z-10 bg-white border border-purple-200 rounded-lg shadow-lg p-3 w-64 flex flex-col gap-2">
          <label class="text-xs text-gray-500">Link de Google Maps</label>
          <input v-model="ubicacionTemp" placeholder="https://maps.google.com/..."
            class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-xs" />
          <div class="flex gap-2 justify-end">
            <a v-if="v.ubicacion" :href="v.ubicacion" target="_blank" rel="noopener"
              class="text-xs text-purple-500 mr-auto self-center hover:underline">Abrir ↗</a>
            <button @click="editandoUbicacionId = null" class="border border-gray-200 text-gray-400 rounded-lg px-3 py-1 text-xs">Cancelar</button>
            <button @click="guardarUbicacion(v)" class="bg-purple-700 text-white rounded-lg px-3 py-1 text-xs">Guardar</button>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="bg-white border border-purple-100 rounded-lg p-2">
            <p class="text-xs bold text-green-400">Entradas</p>
            <p class="font-medium text-green-700">{{ v.entradas }}</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-lg p-2">
            <p class="text-xs bold text-red-400">Salidas</p>
            <p class="font-medium text-red-700">{{ v.salidas }}</p>
          </div>
          <div class="bg-white border border-gray-100 rounded-lg p-2">
            <p class="text-xs bold text-gray-400">Diferencia</p>
            <p :class="Number(v.diferencia) === 0 ? 'text-green-600' : 'text-red-500'" class="font-medium">{{ v.diferencia }}</p>
          </div>
        </div>
        <div v-if="Number(v.diferencia) === 0" class="text-xs text-green-500 text-center">✓ Al día</div>
        <div v-else class="text-xs text-red-400 text-center">⚠ Pendiente</div>
      </div>
    </div>

    <div v-if="vendedores.length === 0" class="text-center text-gray-400 text-sm py-12">
      No hay vendedores registrados aún.
    </div>

    <div v-if="confirmando" class="fixed inset-0 bg-purple-900/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl border border-purple-200 p-6 w-64 text-center flex flex-col gap-3">
        <p class="text-2xl">⚠️</p>
        <p class="text-sm font-medium text-gray-800">¿Eliminar a {{ vendedorAEliminar?.nombre }}?</p>
        <p class="text-xs text-gray-400">Solo se puede eliminar si la diferencia es 0.</p>
        <div class="flex gap-2 justify-center">
          <button @click="confirmando = false" class="border border-gray-200 text-gray-400 rounded-lg px-4 py-1.5 text-sm">Cancelar</button>
          <button @click="eliminar" class="bg-red-600 text-white rounded-lg px-4 py-1.5 text-sm">Sí, eliminar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import { getVendedores, createVendedor, deleteVendedor, updateVendedorUbicacion } from '../services/api';
import axios from 'axios';

const vendedores = ref<any[]>([]);
const mostrarForm = ref(false);
const nuevoNombre = ref('');
const confirmando = ref(false);
const vendedorAEliminar = ref<any>(null);
const editandoUbicacionId = ref<number | null>(null);
const ubicacionTemp = ref('');

const cargar = async () => {
  const { data } = await getVendedores();
  vendedores.value = await Promise.all(data.map(async (v: any) => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/vendedores/${v.id}/stats`);
    return { ...v, ...res.data };
  }));
};

const agregar = async () => {
  if (!nuevoNombre.value) return;
  await createVendedor({ nombre: nuevoNombre.value });
  nuevoNombre.value = '';
  mostrarForm.value = false;
  await cargar();
};

const toggleUbicacion = (v: any) => {
  if (editandoUbicacionId.value === v.id) {
    editandoUbicacionId.value = null;
    return;
  }
  ubicacionTemp.value = v.ubicacion || '';
  editandoUbicacionId.value = v.id;
};

const guardarUbicacion = async (v: any) => {
  await updateVendedorUbicacion(v.id, ubicacionTemp.value.trim());
  v.ubicacion = ubicacionTemp.value.trim();
  editandoUbicacionId.value = null;
};

const confirmarEliminar = (v: any) => {
  vendedorAEliminar.value = v;
  confirmando.value = true;
};

const eliminar = async () => {
  try {
    await deleteVendedor(vendedorAEliminar.value.id);
    confirmando.value = false;
    await cargar();
  } catch (e: any) {
    alert(e.response?.data?.error || 'No se puede eliminar');
    confirmando.value = false;
  }
};

onMounted(cargar);
onActivated(cargar);
</script>