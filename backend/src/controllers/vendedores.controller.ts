import { Request, Response } from 'express';
import pool from '../db/connection';

export const getVendedores = async (req: Request, res: Response) => {
  try {
    // No se usa SELECT * para no traer el PDF completo en cada listado
    const [rows] = await pool.query(
      `SELECT id, nombre, activo, created_at, ubicacion,
              documento_nombre,
              (documento_pdf IS NOT NULL) AS tiene_documento
       FROM vendedores
       WHERE activo = 1
       ORDER BY nombre ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener vendedores' });
  }
};

export const createVendedor = async (req: Request, res: Response) => {
  try {
    const { nombre } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO vendedores (nombre) VALUES (?)',
      [nombre]
    );
    res.json({ id: result.insertId, nombre });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear vendedor' });
  }
};

export const deleteVendedor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [movs]: any = await pool.query(
      'SELECT COUNT(*) as total FROM movimientos WHERE vendedor_id = ? AND (debe - COALESCE(haber, 0)) != 0',
      [id]
    );

    if (movs[0].total > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: el vendedor tiene diferencia pendiente.' });
    }

    await pool.query('UPDATE vendedores SET activo = 0 WHERE id = ?', [id]);
    res.json({ message: 'Vendedor eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar vendedor' });
  }
};

export const updateVendedorUbicacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ubicacion } = req.body;
    await pool.query('UPDATE vendedores SET ubicacion = ? WHERE id = ?', [ubicacion || null, id]);
    res.json({ id: Number(id), ubicacion: ubicacion || null });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar ubicación' });
  }
};

export const getVendedorStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END), 0) as entradas,
        COALESCE(SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END), 0) as salidas
       FROM movimientos WHERE vendedor_id = ?`,
      [id]
    );
    const entradas = Number(rows[0].entradas);
    const salidas = Number(rows[0].salidas);
    const diferencia = entradas - salidas;
    res.json({ entradas, salidas, diferencia });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stats' });
  }
};

export const uploadVendedorDocumento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    // Verifica que el contenido realmente sea un PDF y no solo la extensión
    if (req.file.buffer.subarray(0, 4).toString('latin1') !== '%PDF') {
      return res.status(400).json({ error: 'El archivo no es un PDF válido.' });
    }

    // multer entrega el nombre en latin1; se convierte para conservar acentos
    const nombre = Buffer.from(req.file.originalname, 'latin1').toString('utf8').slice(0, 255);

    const [result]: any = await pool.query(
      'UPDATE vendedores SET documento_pdf = ?, documento_nombre = ? WHERE id = ? AND activo = 1',
      [req.file.buffer, nombre, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vendedor no encontrado.' });
    }

    res.json({ id: Number(id), documento_nombre: nombre, tiene_documento: 1 });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el documento' });
  }
};

export const getVendedorDocumento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      'SELECT documento_pdf, documento_nombre FROM vendedores WHERE id = ?',
      [id]
    );

    if (!rows.length || !rows[0].documento_pdf) {
      return res.status(404).json({ error: 'Este vendedor no tiene documento.' });
    }

    const nombre = rows[0].documento_nombre || 'documento.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(nombre)}`);
    res.send(rows[0].documento_pdf);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el documento' });
  }
};

export const deleteVendedorDocumento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(
      'UPDATE vendedores SET documento_pdf = NULL, documento_nombre = NULL WHERE id = ?',
      [id]
    );
    res.json({ id: Number(id), tiene_documento: 0 });
  } catch (error) {
    res.status(500).json({ error: 'Error al quitar el documento' });
  }
};