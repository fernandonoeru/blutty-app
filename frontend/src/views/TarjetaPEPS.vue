<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h1 class="text-lg font-medium text-gray-800">Tarjeta de almacén</h1>
        <p class="text-xs text-gray-400">{{ fechaHoy }}</p>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Existencia actual</p>
        <p class="text-xl font-medium text-gray-800">{{ existenciaActual }} unid.</p>
      </div>
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Valor inventario</p>
        <p class="text-xl font-medium text-gray-800">${{ valorInventario }}</p>
      </div>
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Entradas del mes</p>
        <p class="text-xl font-medium text-gray-800">${{ totalDebe }}</p>
      </div>
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Salidas del mes</p>
        <p class="text-xl font-medium text-gray-800">${{ totalHaber }}</p>
      </div>
    </div>

    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="p in presentaciones" :key="p.id"
        @click="seleccionarPresentacion(p)"
        :class="presentacionActiva?.id === p.id
          ? 'bg-purple-700 text-white border-purple-700'
          : 'bg-white text-gray-500 border-gray-200'"
        class="border rounded-full px-4 py-1.5 text-xs cursor-pointer">
        {{ p.nombre }}
      </button>
      <button @click="mostrarNuevaPresentacion = true"
        class="border border-purple-300 text-purple-500 rounded-full px-4 py-1.5 text-xs">
        + Nueva
      </button>
    </div>

    <div v-if="mostrarNuevaPresentacion" class="bg-white border border-purple-200 rounded-xl p-4 mb-4">
      <h3 class="text-sm font-medium text-purple-600 mb-3">Nueva presentación</h3>
      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">Nombre</label>
          <input v-model="nuevaPresentacion.nombre" placeholder="Ej: Té 500ml"
            class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-500">Descripción</label>
          <input v-model="nuevaPresentacion.descripcion" placeholder="Opcional"
            class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-3">
        <button @click="mostrarNuevaPresentacion = false"
          class="border border-gray-200 text-gray-400 rounded-lg px-4 py-1.5 text-sm">
          Cancelar
        </button>
        <button @click="agregarPresentacion"
          class="bg-purple-700 text-white rounded-lg px-4 py-1.5 text-sm">
          Guardar
        </button>
      </div>
    </div>

    <template v-if="presentacionActiva">
      <FormMovimiento :presentacionId="presentacionActiva.id" @movimientoCreado="cargarMovimientos" />
      <TablaMovimientos :movimientos="movimientos" @eliminar="eliminarMovimiento" />
    </template>

    <div v-else class="text-center text-gray-400 text-sm py-12">
      Selecciona o crea una presentación para comenzar.
    </div>

    <div v-if="confirmandoEliminar" class="fixed inset-0 bg-purple-900/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl border border-purple-200 p-6 w-64 text-center flex flex-col gap-3">
        <p class="text-2xl">⚠️</p>
        <p class="text-sm font-medium text-gray-800">¿Eliminar este registro?</p>
        <p class="text-xs text-gray-400">Esta acción no se puede deshacer.</p>
        <div class="flex gap-2 justify-center">
          <button @click="confirmandoEliminar = false"
            class="border border-gray-200 text-gray-400 rounded-lg px-4 py-1.5 text-sm">
            Cancelar
          </button>
          <button @click="confirmarEliminar"
            class="bg-red-600 text-white rounded-lg px-4 py-1.5 text-sm">
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import FormMovimiento from '../components/FormMovimiento.vue';
import TablaMovimientos from '../components/TablaMovimientos.vue';
import {
  getPresentaciones, createPresentacion,
  getMovimientos, deleteMovimiento
} from '../services/api';

const presentaciones = ref<any[]>([]);
const presentacionActiva = ref<any>(null);
const movimientos = ref<any[]>([]);
const mostrarNuevaPresentacion = ref(false);
const confirmandoEliminar = ref(false);
const idAEliminar = ref<number | null>(null);
const nuevaPresentacion = ref({ nombre: '', descripcion: '' });

const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const existenciaActual = computed(() =>
  movimientos.value.length ? movimientos.value[movimientos.value.length - 1].existencia : 0
);
const valorInventario = computed(() =>
  movimientos.value.length ? Number(movimientos.value[movimientos.value.length - 1].saldo).toFixed(2) : '0.00'
);
const totalDebe = computed(() =>
  movimientos.value.reduce((a, m) => a + (Number(m.debe) || 0), 0).toFixed(2)
);
const totalHaber = computed(() =>
  movimientos.value.reduce((a, m) => a + (Number(m.haber) || 0), 0).toFixed(2)
);

const cargarPresentaciones = async () => {
  const { data } = await getPresentaciones();
  presentaciones.value = data;
  if (data.length && !presentacionActiva.value) {
    seleccionarPresentacion(data[0]);
  }
};

const seleccionarPresentacion = async (p: any) => {
  presentacionActiva.value = p;
  await cargarMovimientos();
};

const cargarMovimientos = async () => {
  if (!presentacionActiva.value) return;
  const { data } = await getMovimientos(presentacionActiva.value.id);
  movimientos.value = data;
};

const agregarPresentacion = async () => {
  if (!nuevaPresentacion.value.nombre) return;
  await createPresentacion(nuevaPresentacion.value);
  nuevaPresentacion.value = { nombre: '', descripcion: '' };
  mostrarNuevaPresentacion.value = false;
  await cargarPresentaciones();
};

const eliminarMovimiento = (id: number) => {
  idAEliminar.value = id;
  confirmandoEliminar.value = true;
};

const confirmarEliminar = async () => {
  if (idAEliminar.value) {
    await deleteMovimiento(idAEliminar.value);
    await cargarMovimientos();
  }
  confirmandoEliminar.value = false;
  idAEliminar.value = null;
};

onMounted(cargarPresentaciones);
</script>