import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  getVendedores,
  createVendedor,
  deleteVendedor,
  getVendedorStats,
  updateVendedorUbicacion,
  uploadVendedorDocumento,
  getVendedorDocumento,
  deleteVendedorDocumento
} from '../controllers/vendedores.controller';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('SOLO_PDF'));
    }
  }
});

const recibirDocumento = (req: Request, res: Response, next: NextFunction) => {
  upload.single('documento')(req, res, (err: any) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El PDF no puede pesar más de 5 MB.' });
    }
    if (err.message === 'SOLO_PDF') {
      return res.status(400).json({ error: 'Solo se permiten archivos PDF.' });
    }
    return res.status(500).json({ error: 'Error al recibir el archivo' });
  });
};

router.get('/', getVendedores);
router.post('/', createVendedor);
router.delete('/:id', deleteVendedor);
router.get('/:id/stats', getVendedorStats);
router.patch('/:id/ubicacion', updateVendedorUbicacion);
router.post('/:id/documento', recibirDocumento, uploadVendedorDocumento);
router.get('/:id/documento', getVendedorDocumento);
router.delete('/:id/documento', deleteVendedorDocumento);

export default router;