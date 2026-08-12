import { Router } from 'express';
import {
  getVendedores,
  createVendedor,
  deleteVendedor,
  getVendedorStats,
  updateVendedorUbicacion,
  debugColumnas
} from '../controllers/vendedores.controller';

const router = Router();

router.get('/', getVendedores);
router.post('/', createVendedor);
router.delete('/:id', deleteVendedor);
router.get('/:id/stats', getVendedorStats);
router.patch('/:id/ubicacion', updateVendedorUbicacion);
router.get('/debug/columnas', debugColumnas);

export default router;