<template>
  <div class="bg-white border border-purple-200 rounded-xl p-4 mb-4">
    <h3 class="text-sm font-medium text-purple-600 mb-3 flex items-center gap-2">
      ✏️ Registrar movimiento
    </h3>
    <div class="grid grid-cols-4 gap-3">
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Fecha</label>
        <input type="date" v-model="form.fecha" class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Tipo</label>
        <select v-model="form.tipo" class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm">
          <option value="entrada">Entrada</option>
          <option value="salida">Salida</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Cantidad</label>
        <input type="number" v-model="form.cantidad" placeholder="0" class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Precio unitario</label>
        <input type="number" v-model="form.precio_unitario" placeholder="$0.00" class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
      </div>
    </div>
    <div class="flex justify-end mt-3">
      <button @click="registrar" class="bg-purple-700 text-white rounded-lg px-4 py-1.5 text-sm flex items-center gap-2">
        ✓ Registrar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { createMovimiento, getMovimientos } from '../services/api';

const props = defineProps<{ presentacionId: number }>();
const emit = defineEmits(['movimientoCreado']);

const today = new Date().toISOString().split('T')[0];

const form = reactive({
  fecha: today,
  tipo: 'entrada',
  cantidad: null as number | null,
  precio_unitario: null as number | null,
});

const registrar = async () => {
  if (!form.cantidad || !form.precio_unitario) {
    alert('Por favor completa todos los campos.');
    return;
  }

  if (form.tipo === 'salida') {
    const { data } = await getMovimientos(props.presentacionId);
    const existenciaActual = data.length ? data[data.length - 1].existencia : 0;
    if (form.cantidad > existenciaActual) {
      alert(`No puedes registrar una salida mayor a la existencia actual (${existenciaActual} unidades).`);
      return;
    }
  }

  await createMovimiento({
    presentacion_id: props.presentacionId,
    fecha: form.fecha,
    tipo: form.tipo,
    cantidad: form.cantidad,
    precio_unitario: form.precio_unitario,
  });
  form.cantidad = null;
  form.precio_unitario = null;
  emit('movimientoCreado');
};
</script>