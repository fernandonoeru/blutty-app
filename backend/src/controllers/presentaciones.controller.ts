import { Request, Response } from 'express';
import pool from '../db/connection';

export const getPresentaciones = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM presentaciones WHERE activo = 1');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener presentaciones' });
  }
};

export const createPresentacion = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body;
    const [result]: any = await pool.query(
      'INSERT INTO presentaciones (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion]
    );
    res.json({ id: result.insertId, nombre, descripcion });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear presentacion' });
  }
};

export const deletePresentacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE presentaciones SET activo = 0 WHERE id = ?', [id]);
    res.json({ message: 'Presentacion eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar presentacion' });
  }
};