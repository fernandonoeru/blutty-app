import { Request, Response } from 'express';
import pool from '../db/connection';

export const getMovimientos = async (req: Request, res: Response) => {
  try {
    const { presentacionId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM movimientos WHERE presentacion_id = ? ORDER BY fecha ASC, id ASC',
      [presentacionId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

export const createMovimiento = async (req: Request, res: Response) => {
  try {
    const { presentacion_id, fecha, tipo, cantidad, precio_unitario } = req.body;

    const [ultimos]: any = await pool.query(
      'SELECT saldo, existencia FROM movimientos WHERE presentacion_id = ? ORDER BY fecha DESC, id DESC LIMIT 1',
      [presentacion_id]
    );

    const saldoAnterior = ultimos.length > 0 ? Number(ultimos[0].saldo) : 0;
    const existenciaAnterior = ultimos.length > 0 ? Number(ultimos[0].existencia) : 0;

    let debe = null;
    let haber = null;
    let existencia = 0;
    let saldo = 0;

    if (tipo === 'entrada') {
      debe = cantidad * precio_unitario;
      existencia = existenciaAnterior + cantidad;
      saldo = saldoAnterior + debe;
    } else {
      haber = cantidad * precio_unitario;
      existencia = existenciaAnterior - cantidad;
      saldo = saldoAnterior - haber;
    }

    const [result]: any = await pool.query(
      `INSERT INTO movimientos 
       (presentacion_id, fecha, tipo, cantidad, precio_unitario, existencia, debe, haber, saldo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [presentacion_id, fecha, tipo, cantidad, precio_unitario, existencia, debe, haber, saldo]
    );

    res.json({ id: result.insertId, existencia, debe, haber, saldo });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
};

export const deleteMovimiento = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM movimientos WHERE id = ?', [id]);
    res.json({ message: 'Movimiento eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  }
};