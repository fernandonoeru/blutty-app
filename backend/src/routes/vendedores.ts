import { Router } from 'express';
import {
  getVendedores,
  createVendedor,
  deleteVendedor,
  getVendedorStats
} from '../controllers/vendedores.controller';

const router = Router();

router.get('/', getVendedores);
router.post('/', createVendedor);
router.delete('/:id', deleteVendedor);
router.get('/:id/stats', getVendedorStats);

export default router;