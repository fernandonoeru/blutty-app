import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const getPresentaciones = () => api.get('/presentaciones');
export const createPresentacion = (data: { nombre: string; descripcion: string }) =>
  api.post('/presentaciones', data);
export const deletePresentacion = (id: number) => api.delete(`/presentaciones/${id}`);

export const getMovimientos = (presentacionId: number) =>
  api.get(`/movimientos/${presentacionId}`);
export const createMovimiento = (data: any) => api.post('/movimientos', data);
export const deleteMovimiento = (id: number) => api.delete(`/movimientos/${id}`);

export default api;