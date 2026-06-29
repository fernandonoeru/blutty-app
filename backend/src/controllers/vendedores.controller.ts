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

export const getVendedorStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query(
      `SELECT 
        SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE 0 END) as entradas,
        SUM(CASE WHEN tipo = 'salida' THEN cantidad ELSE 0 END) as salidas,
        SUM(CASE WHEN tipo = 'entrada' THEN cantidad ELSE -cantidad END) as diferencia
       FROM movimientos WHERE vendedor_id = ?`,
      [id]
    );
    res.json({
      entradas: rows[0].entradas || 0,
      salidas: rows[0].salidas || 0,
      diferencia: rows[0].diferencia || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener stats' });
  }
};