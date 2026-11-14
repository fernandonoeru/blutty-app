<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <form @submit.prevent="entrar"
      class="bg-white border border-purple-200 rounded-xl p-6 w-full max-w-xs flex flex-col gap-4">
      <div class="flex flex-col items-center gap-2">
        <img src="https://bluttyte.netlify.app/img/logoBlueTea.jpeg"
          alt="Logo Blutty"
          class="w-16 h-16 rounded-full border-2 border-purple-100 object-cover" />
        <p class="text-sm font-medium text-gray-800 tracking-widest">BLUTTY</p>
        <p class="text-xs text-gray-400">Inicia sesión para continuar</p>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Usuario</label>
        <input v-model="usuario" type="text" autocomplete="username"
          class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-xs text-gray-500">Contraseña</label>
        <input v-model="password" type="password" autocomplete="current-password"
          class="border border-purple-200 bg-purple-50 rounded-lg px-2 py-1.5 text-sm" />
      </div>

      <p v-if="error" class="text-xs text-red-500 text-center">{{ error }}</p>

      <button type="submit" :disabled="cargando || !usuario || !password"
        class="bg-purple-700 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50">
        {{ cargando ? 'Entrando...' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { login, setToken } from '../services/api';

const emit = defineEmits<{ (e: 'entro'): void }>();

const usuario = ref('');
const password = ref('');
const error = ref('');
const cargando = ref(false);

const entrar = async () => {
  error.value = '';
  cargando.value = true;
  try {
    const { data } = await login(usuario.value.trim(), password.value);
    setToken(data.token);
    password.value = '';
    emit('entro');
  } catch (e: any) {
    if (e.response?.data?.error) {
      error.value = e.response.data.error;
    } else {
      error.value = 'No se pudo conectar con el servidor.';
    }
  } finally {
    cargando.value = false;
  }
};
</script>