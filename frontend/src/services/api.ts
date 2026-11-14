import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'blutty_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: API_URL,
});

// Agrega el token solo a las peticiones que van a nuestra API
const agregarToken = (config: any) => {
  const token = getToken();
  if (!token) return config;

  const url: string = config.url ?? '';
  const destino = /^https?:\/\//.test(url) ? url : (config.baseURL ?? '') + url;

  if (destino.startsWith(API_URL)) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Si el servidor responde 401, la sesión terminó: se limpia y se avisa a la app
const manejarSesionExpirada = (error: any) => {
  const esLogin = String(error.config?.url ?? '').includes('/auth/login');
  if (error.response?.status === 401 && !esLogin) {
    clearToken();
    window.dispatchEvent(new Event('sesion-expirada'));
  }
  return Promise.reject(error);
};

api.interceptors.request.use(agregarToken);
api.interceptors.response.use((r) => r, manejarSesionExpirada);

// Algunas vistas llaman a axios directamente; se cubren igual
axios.interceptors.request.use(agregarToken);
axios.interceptors.response.use((r) => r, manejarSesionExpirada);

export const login = (usuario: string, password: string) =>
  api.post('/auth/login', { usuario, password });

export const getPresentaciones = () => api.get('/presentaciones');
export const createPresentacion = (data: { nombre: string; descripcion: string }) =>
  api.post('/presentaciones', data);
export const deletePresentacion = (id: number) => api.delete(`/presentaciones/${id}`);

export const getMovimientos = (presentacionId: number) =>
  api.get(`/movimientos/${presentacionId}`);
export const createMovimiento = (data: any) => api.post('/movimientos', data);
export const updateMovimiento = (id: number, data: { cantidad: number; precio_unitario: number; vendedor_id?: number | null; vendedor_nombre?: string | null }) =>
  api.put(`/movimientos/${id}`, data);
export const deleteMovimiento = (id: number) => api.delete(`/movimientos/${id}`);

export const getResumen = (presentacionId: number, tipo: string, fecha: string) =>
  api.get(`/movimientos/${presentacionId}/resumen?tipo=${tipo}&fecha=${fecha}`);

export const getVendedores = () => api.get('/vendedores');
export const createVendedor = (data: { nombre: string }) => api.post('/vendedores', data);
export const deleteVendedor = (id: number) => api.delete(`/vendedores/${id}`);
export const updateVendedorUbicacion = (id: number, ubicacion: string) =>
  api.patch(`/vendedores/${id}/ubicacion`, { ubicacion });

export default api;