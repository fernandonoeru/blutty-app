import { Request, Response } from 'express';
import pool from '../db/connection';

export const getVendedores = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM vendedores WHERE activo = 1 ORDER BY nombre ASC');
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

export const debugColumnas = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SHOW COLUMNS FROM vendedores');
    const [dbInfo]: any = await pool.query('SELECT DATABASE() as db, @@hostname as host, CONNECTION_ID() as conn_id');
    res.json({ columnas: rows, info: dbInfo[0] });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || String(error) });
  }
};

export const updateVendedorUbicacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { ubicacion } = req.body;
    await pool.query('UPDATE vendedores SET ubicacion = ? WHERE id = ?', [ubicacion || null, id]);
    res.json({ id: Number(id), ubicacion: ubicacion || null });
  } catch (error: any) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({ error: 'Error al actualizar ubicación', detalle: error?.message || String(error) });
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