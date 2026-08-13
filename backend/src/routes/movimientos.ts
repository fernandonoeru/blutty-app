import { Router } from 'express';
import {
  getMovimientos,
  createMovimiento,
  updateMovimiento,
  deleteMovimiento,
  getResumen
} from '../controllers/movimientos.controller';

const router = Router();

router.get('/:presentacionId', getMovimientos);
router.post('/', createMovimiento);
router.put('/:id', updateMovimiento);
router.delete('/:id', deleteMovimiento);
router.get('/:presentacionId/resumen', getResumen);

export default router;