<template>
  <div class="p-6">
    <div class="mb-4">
      <h1 class="text-lg font-medium text-gray-800">Resúmenes</h1>
      <p class="text-xs text-gray-400">{{ fechaHoy }}</p>
    </div>

    <div class="flex gap-2 mb-4">
      <button v-for="t in tipos" :key="t.value"
        @click="tipoActivo = t.value; cargarResumen()"
        :class="tipoActivo === t.value ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-500 border-gray-200'"
        class="border rounded-full px-4 py-1.5 text-xs cursor-pointer">
        {{ t.label }}
      </button>
    </div>

    <div class="bg-white border border-purple-200 rounded-xl p-4 mb-4 flex items-center gap-4">
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Seleccionar fecha</label>
        <input type="date" v-model="fechaSeleccionada" @change="cargarResumen"
          class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
      </div>
      <div v-if="fechaInicio && fechaFin" class="text-xs text-gray-400 mt-4">
        Mostrando del <span class="text-purple-600 font-medium">{{ fechaInicio }}</span> al <span class="text-purple-600 font-medium">{{ fechaFin }}</span>
      </div>
    </div>

    <div class="flex gap-2 mb-4 flex-wrap">
      <button v-for="p in presentaciones" :key="p.id"
        @click="seleccionarPresentacion(p)"
        :class="presentacionActiva?.id === p.id ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-gray-500 border-gray-200'"
        class="border rounded-full px-4 py-1.5 text-xs cursor-pointer">
        {{ p.nombre }}
      </button>
    </div>

    <div class="grid grid-cols-4 gap-3 mb-4">
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Existencia final</p>
        <p class="text-xl font-medium text-gray-800">{{ existenciaFinal }} unid.</p>
      </div>
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Valor inventario</p>
        <p class="text-xl font-medium text-gray-800">${{ saldoFinal }}</p>
      </div>
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Total entradas</p>
        <p class="text-xl font-medium text-gray-800">${{ totalDebe }}</p>
      </div>
      <div class="bg-white border border-purple-200 rounded-xl p-3">
        <p class="text-xs text-purple-500 mb-1">Total salidas</p>
        <p class="text-xl font-medium text-gray-800">${{ totalHaber }}</p>
      </div>
    </div>

    <TablaMovimientos :movimientos="movimientos" @eliminar="() => {}" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import TablaMovimientos from '../components/TablaMovimientos.vue';
import { getPresentaciones, getResumen } from '../services/api';

const presentaciones = ref<any[]>([]);
const presentacionActiva = ref<any>(null);
const movimientos = ref<any[]>([]);
const fechaInicio = ref('');
const fechaFin = ref('');
const tipoActivo = ref('diario');
const fechaSeleccionada = ref(new Date().toISOString().slice(0, 10));
const fechaHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const tipos = [
  { label: 'Diario', value: 'diario' },
  { label: 'Semanal', value: 'semanal' },
  { label: 'Mensual', value: 'mensual' },
];

const existenciaFinal = computed(() =>
  movimientos.value.length ? movimientos.value[movimientos.value.length - 1].existencia : 0
);
const saldoFinal = computed(() =>
  movimientos.value.length ? Number(movimientos.value[movimientos.value.length - 1].saldo).toFixed(2) : '0.00'
);
const totalDebe = computed(() =>
  movimientos.value.reduce((a, m) => a + (Number(m.debe) || 0), 0).toFixed(2)
);
const totalHaber = computed(() =>
  movimientos.value.reduce((a, m) => a + (Number(m.haber) || 0), 0).toFixed(2)
);

const cargarResumen = async () => {
  if (!presentacionActiva.value) return;
  const { data } = await getResumen(presentacionActiva.value.id, tipoActivo.value, fechaSeleccionada.value);
  movimientos.value = data.rows;
  fechaInicio.value = data.fechaInicio;
  fechaFin.value = data.fechaFin;
};

const seleccionarPresentacion = async (p: any) => {
  presentacionActiva.value = p;
  await cargarResumen();
};

const cargarPresentaciones = async () => {
  const { data } = await getPresentaciones();
  presentaciones.value = data;
  if (data.length) seleccionarPresentacion(data[0]);
};

onMounted(cargarPresentaciones);
</script>