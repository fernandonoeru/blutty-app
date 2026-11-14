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

        <div class="border-t border-purple-100 pt-3 flex items-center gap-3">
          <template v-if="Number(v.tiene_documento) === 1">
            <button @click="verDocumento(v)" :title="v.documento_nombre"
              class="text-xs text-purple-600 hover:underline truncate mr-auto text-left">
              📄 {{ v.documento_nombre }}
            </button>
            <button @click="elegirArchivo(v)" class="text-xs text-gray-400 hover:text-purple-600">Reemplazar</button>
            <button @click="quitarDocumento(v)" class="text-xs text-red-400 hover:underline">Quitar</button>
          </template>
          <button v-else @click="elegirArchivo(v)"
            class="text-xs text-purple-600 border border-purple-200 rounded-lg px-3 py-1 hover:bg-purple-50">
            Subir PDF
          </button>
        </div>
      </div>
    </div>

    <div v-if="vendedores.length === 0" class="text-center text-gray-400 text-sm py-12">
      No hay vendedores registrados aún.
    </div>

    <input ref="inputArchivo" type="file" accept="application/pdf" class="hidden" @change="subirArchivo" />

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

    <div v-if="pdfUrl" class="fixed inset-0 bg-purple-900/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl border border-purple-200 w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
        <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-purple-100">
          <p class="text-sm font-medium text-gray-800 truncate">{{ pdfNombre }}</p>
          <div class="flex items-center gap-2 shrink-0">
            <a :href="pdfUrl" :download="pdfNombre"
              class="bg-purple-700 text-white rounded-lg px-4 py-1.5 text-sm">
              Descargar
            </a>
            <button @click="cerrarVista" class="border border-gray-200 text-gray-400 rounded-lg px-4 py-1.5 text-sm">
              Cerrar
            </button>
          </div>
        </div>
        <iframe :src="pdfUrl" class="flex-1 w-full" title="Vista previa del documento"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated } from 'vue';
import { getVendedores, createVendedor, deleteVendedor, updateVendedorUbicacion } from '../services/api';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MAX_PDF_MB = 5;

const vendedores = ref<any[]>([]);
const mostrarForm = ref(false);
const nuevoNombre = ref('');
const confirmando = ref(false);
const vendedorAEliminar = ref<any>(null);
const editandoUbicacionId = ref<number | null>(null);
const ubicacionTemp = ref('');

const inputArchivo = ref<HTMLInputElement | null>(null);
const vendedorSubiendo = ref<any>(null);
const pdfUrl = ref<string | null>(null);
const pdfNombre = ref('');

const cargar = async () => {
  const { data } = await getVendedores();
  vendedores.value = await Promise.all(data.map(async (v: any) => {
    const res = await axios.get(`${API}/vendedores/${v.id}/stats`);
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

const elegirArchivo = (v: any) => {
  vendedorSubiendo.value = v;
  inputArchivo.value?.click();
};

const subirArchivo = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const archivo = input.files?.[0];
  const v = vendedorSubiendo.value;
  input.value = '';
  if (!archivo || !v) return;

  if (archivo.type !== 'application/pdf') {
    alert('Solo se permiten archivos PDF.');
    return;
  }
  if (archivo.size > MAX_PDF_MB * 1024 * 1024) {
    alert(`El PDF no puede pesar más de ${MAX_PDF_MB} MB.`);
    return;
  }

  try {
    const form = new FormData();
    form.append('documento', archivo);
    const { data } = await axios.post(`${API}/vendedores/${v.id}/documento`, form);
    v.tiene_documento = data.tiene_documento;
    v.documento_nombre = data.documento_nombre;
  } catch (err: any) {
    alert(err.response?.data?.error || 'No se pudo subir el documento');
  }
};

const verDocumento = async (v: any) => {
  try {
    const res = await axios.get(`${API}/vendedores/${v.id}/documento`, { responseType: 'blob' });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    pdfNombre.value = v.documento_nombre || 'documento.pdf';
    pdfUrl.value = URL.createObjectURL(blob);
  } catch (err: any) {
    alert('No se pudo abrir el documento');
  }
};

const cerrarVista = () => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
  pdfUrl.value = null;
  pdfNombre.value = '';
};

const quitarDocumento = async (v: any) => {
  if (!window.confirm(`¿Quitar el documento de ${v.nombre}?`)) return;
  try {
    await axios.delete(`${API}/vendedores/${v.id}/documento`);
    v.tiene_documento = 0;
    v.documento_nombre = null;
  } catch (err: any) {
    alert(err.response?.data?.error || 'No se pudo quitar el documento');
  }
};

onMounted(cargar);
onActivated(cargar);
</script>