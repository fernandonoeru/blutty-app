import { Router } from 'express';
import {
  getPresentaciones,
  createPresentacion,
  deletePresentacion
} from '../controllers/presentaciones.controller';

const router = Router();

router.get('/', getPresentaciones);
router.post('/', createPresentacion);
router.delete('/:id', deletePresentacion);

export default router;