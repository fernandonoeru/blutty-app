import { Router } from 'express';
import {
  getMovimientos,
  createMovimiento,
  deleteMovimiento
} from '../controllers/movimientos.controller';

const router = Router();

router.get('/:presentacionId', getMovimientos);
router.post('/', createMovimiento);
router.delete('/:id', deleteMovimiento);

export default router;