<template>
  <div class="bg-white border border-purple-200 rounded-xl p-4">
    <div v-if="movimientos.length === 0" class="text-center text-gray-400 text-sm py-6">
      No hay movimientos registrados aún.
    </div>
    <table v-else class="w-full text-xs">
      <thead>
        <tr class="bg-purple-50">
          <th class="text-left text-gray-500 font-normal px-2 py-2">Fecha</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Tipo</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Entrada</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Salida</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Exist.</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Precio</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Debe</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Haber</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Saldo</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Registrado</th>
          <th class="text-center text-gray-500 font-normal px-2 py-2">Vendedor</th>
          <th class="px-2 py-2"></th>
        </tr>
      </thead>
      <tbody>
        <template v-for="m in movimientos" :key="m.id">
          <tr v-if="editandoId !== m.id"
            :class="m.tipo === 'entrada' ? 'bg-purple-50' : 'bg-teal-50'"
            class="border-b border-gray-100">
            <td class="px-2 py-2 text-left">{{ formatFecha(m.fecha) }}</td>
            <td class="px-2 py-2 text-center">
              <span v-if="m.tipo === 'entrada'" class="bg-purple-200 text-purple-900 rounded-full px-2 py-0.5">Entrada</span>
              <span v-else class="bg-teal-200 text-teal-900 rounded-full px-2 py-0.5">Salida</span>
            </td>
            <td class="px-2 py-2 text-center">{{ m.tipo === 'entrada' ? m.cantidad : '—' }}</td>
            <td class="px-2 py-2 text-center">{{ m.tipo === 'salida' ? m.cantidad : '—' }}</td>
            <td class="px-2 py-2 text-center">{{ m.existencia }}</td>
            <td class="px-2 py-2 text-center">${{ m.precio_unitario }}</td>
            <td class="px-2 py-2 text-center">{{ m.debe ? '$' + m.debe : '—' }}</td>
            <td class="px-2 py-2 text-center">{{ m.haber ? '$' + m.haber : '—' }}</td>
            <td class="px-2 py-2 text-center">${{ m.saldo }}</td>
            <td class="px-2 py-2 text-center text-gray-400 text-xs">{{ formatHora(m.created_at) }}</td>
            <td class="px-2 py-2 text-center text-gray-600 text-xs">{{ m.vendedor_nombre || '—' }}</td>
            <td class="px-2 py-2 text-center whitespace-nowrap">
              <button @click="iniciarEdicion(m)" class="text-purple-400 hover:bg-purple-100 rounded p-1">
                ✏️
              </button>
              <button @click="$emit('eliminar', m.id)" class="text-red-400 hover:bg-red-50 rounded p-1">
                🗑
              </button>
            </td>
          </tr>
          <tr v-else class="bg-yellow-50 border-b border-gray-100">
            <td class="px-2 py-2 text-left">{{ formatFecha(m.fecha) }}</td>
            <td class="px-2 py-2 text-center">
              <span v-if="m.tipo === 'entrada'" class="bg-purple-200 text-purple-900 rounded-full px-2 py-0.5">Entrada</span>
              <span v-else class="bg-teal-200 text-teal-900 rounded-full px-2 py-0.5">Salida</span>
            </td>
            <td colspan="2" class="px-2 py-2 text-center">
              <input v-model.number="edicion.cantidad" type="number" class="border border-purple-200 rounded px-2 py-1 w-20 text-center" />
            </td>
            <td class="px-2 py-2 text-center text-gray-400">—</td>
            <td class="px-2 py-2 text-center">
              <input v-model.number="edicion.precio_unitario" type="number" class="border border-purple-200 rounded px-2 py-1 w-20 text-center" />
            </td>
            <td class="px-2 py-2 text-center text-gray-400">—</td>
            <td class="px-2 py-2 text-center text-gray-400">—</td>
            <td class="px-2 py-2 text-center text-gray-400">—</td>
            <td class="px-2 py-2 text-center text-gray-400 text-xs">{{ formatHora(m.created_at) }}</td>
            <td class="px-2 py-2 text-center">
              <select v-model="edicion.vendedor_id" class="border border-purple-200 rounded px-1 py-1 text-xs">
                <option value="">Sin vendedor</option>
                <option v-for="v in vendedores" :key="v.id" :value="v.id">{{ v.nombre }}</option>
              </select>
            </td>
            <td class="px-2 py-2 text-center whitespace-nowrap">
              <button @click="guardarEdicion(m.id)" class="text-green-600 hover:bg-green-50 rounded p-1">✓</button>
              <button @click="cancelarEdicion" class="text-gray-400 hover:bg-gray-100 rounded p-1">✕</button>
            </td>
          </tr>
        </template>
        <tr class="bg-purple-200 font-medium">
          <td colspan="2" class="px-2 py-2 text-purple-900 text-xs">Resumen</td>
          <td class="px-2 py-2 text-center">{{ totalEntradas }}</td>
          <td class="px-2 py-2 text-center">{{ totalSalidas }}</td>
          <td class="px-2 py-2 text-center">{{ existenciaFinal }}</td>
          <td class="px-2 py-2 text-center">—</td>
          <td class="px-2 py-2 text-center">${{ totalDebe }}</td>
          <td class="px-2 py-2 text-center">${{ totalHaber }}</td>
          <td class="px-2 py-2 text-center">${{ saldoFinal }}</td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { updateMovimiento, getVendedores } from '../services/api';

const props = defineProps<{ movimientos: any[] }>();
const emit = defineEmits(['eliminar', 'actualizado']);

const vendedores = ref<any[]>([]);
const editandoId = ref<number | null>(null);
const edicion = reactive({
  cantidad: null as number | null,
  precio_unitario: null as number | null,
  vendedor_id: '' as number | string,
});

const iniciarEdicion = (m: any) => {
  editandoId.value = m.id;
  edicion.cantidad = m.cantidad;
  edicion.precio_unitario = Number(m.precio_unitario);
  edicion.vendedor_id = m.vendedor_id || '';
};

const cancelarEdicion = () => {
  editandoId.value = null;
};

const guardarEdicion = async (id: number) => {
  if (!edicion.cantidad || !edicion.precio_unitario) {
    alert('Cantidad y precio son obligatorios.');
    return;
  }
  const vendedor = vendedores.value.find(v => v.id === Number(edicion.vendedor_id));
  await updateMovimiento(id, {
    cantidad: edicion.cantidad,
    precio_unitario: edicion.precio_unitario,
    vendedor_id: edicion.vendedor_id ? Number(edicion.vendedor_id) : null,
    vendedor_nombre: vendedor?.nombre || null,
  });
  editandoId.value = null;
  emit('actualizado');
};

const formatFecha = (fecha: string) => fecha?.slice(0, 10);

const formatHora = (fecha: string) => {
  if (!fecha) return '—';
  return new Date(fecha).toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const totalEntradas = computed(() =>
  props.movimientos.filter(m => m.tipo === 'entrada').reduce((a, m) => a + m.cantidad, 0)
);
const totalSalidas = computed(() =>
  props.movimientos.filter(m => m.tipo === 'salida').reduce((a, m) => a + m.cantidad, 0)
);
const existenciaFinal = computed(() =>
  props.movimientos.length ? props.movimientos[props.movimientos.length - 1].existencia : 0
);
const totalDebe = computed(() =>
  props.movimientos.reduce((a, m) => a + (Number(m.debe) || 0), 0).toFixed(2)
);
const totalHaber = computed(() =>
  props.movimientos.reduce((a, m) => a + (Number(m.haber) || 0), 0).toFixed(2)
);
const saldoFinal = computed(() =>
  props.movimientos.length ? Number(props.movimientos[props.movimientos.length - 1].saldo).toFixed(2) : '0.00'
);

onMounted(async () => {
  const { data } = await getVendedores();
  vendedores.value = data;
});
</script>