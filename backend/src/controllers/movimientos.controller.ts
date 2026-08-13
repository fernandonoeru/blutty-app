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
    const { presentacion_id, fecha, tipo, cantidad, precio_unitario, vendedor_id, vendedor_nombre } = req.body;

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
       (presentacion_id, fecha, tipo, cantidad, precio_unitario, existencia, debe, haber, saldo, vendedor_id, vendedor_nombre) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [presentacion_id, fecha, tipo, cantidad, precio_unitario, existencia, debe, haber, saldo, vendedor_id || null, vendedor_nombre || null]
    );

    res.json({ id: result.insertId, existencia, debe, haber, saldo });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear movimiento' });
  }
};

export const updateMovimiento = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { cantidad, precio_unitario, vendedor_id, vendedor_nombre } = req.body;

    const [existing]: any = await connection.query(
      'SELECT presentacion_id FROM movimientos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const presentacionId = existing[0].presentacion_id;

    await connection.beginTransaction();

    await connection.query(
      'UPDATE movimientos SET cantidad = ?, precio_unitario = ?, vendedor_id = ?, vendedor_nombre = ? WHERE id = ?',
      [cantidad, precio_unitario, vendedor_id || null, vendedor_nombre || null, id]
    );

    const [movimientos]: any = await connection.query(
      'SELECT * FROM movimientos WHERE presentacion_id = ? ORDER BY fecha ASC, id ASC',
      [presentacionId]
    );

    let existenciaAcum = 0;
    let saldoAcum = 0;

    for (const mov of movimientos) {
      let debe = null;
      let haber = null;

      if (mov.tipo === 'entrada') {
        debe = mov.cantidad * mov.precio_unitario;
        existenciaAcum += Number(mov.cantidad);
        saldoAcum += debe;
      } else {
        haber = mov.cantidad * mov.precio_unitario;
        existenciaAcum -= Number(mov.cantidad);
        saldoAcum -= haber;
      }

      await connection.query(
        'UPDATE movimientos SET existencia = ?, debe = ?, haber = ?, saldo = ? WHERE id = ?',
        [existenciaAcum, debe, haber, saldoAcum, mov.id]
      );
    }

    await connection.commit();
    res.json({ message: 'Movimiento actualizado' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Error al actualizar movimiento' });
  } finally {
    connection.release();
  }
};

export const deleteMovimiento = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    const [existing]: any = await connection.query(
      'SELECT presentacion_id FROM movimientos WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const presentacionId = existing[0].presentacion_id;

    await connection.beginTransaction();

    await connection.query('DELETE FROM movimientos WHERE id = ?', [id]);

    const [movimientos]: any = await connection.query(
      'SELECT * FROM movimientos WHERE presentacion_id = ? ORDER BY fecha ASC, id ASC',
      [presentacionId]
    );

    let existenciaAcum = 0;
    let saldoAcum = 0;

    for (const mov of movimientos) {
      let debe = null;
      let haber = null;

      if (mov.tipo === 'entrada') {
        debe = mov.cantidad * mov.precio_unitario;
        existenciaAcum += Number(mov.cantidad);
        saldoAcum += debe;
      } else {
        haber = mov.cantidad * mov.precio_unitario;
        existenciaAcum -= Number(mov.cantidad);
        saldoAcum -= haber;
      }

      await connection.query(
        'UPDATE movimientos SET existencia = ?, debe = ?, haber = ?, saldo = ? WHERE id = ?',
        [existenciaAcum, debe, haber, saldoAcum, mov.id]
      );
    }

    await connection.commit();
    res.json({ message: 'Movimiento eliminado' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Error al eliminar movimiento' });
  } finally {
    connection.release();
  }
};

export const getResumen = async (req: Request, res: Response) => {
  try {
    const { presentacionId } = req.params;
    const { tipo, fecha } = req.query;

    let fechaInicio: string;
    let fechaFin: string;
    const base = new Date(fecha as string || new Date());

    if (tipo === 'diario') {
      fechaInicio = base.toISOString().slice(0, 10);
      fechaFin = fechaInicio;
    } else if (tipo === 'semanal') {
      const dia = base.getDay();
      const domingo = new Date(base);
      domingo.setDate(base.getDate() - dia);
      const sabado = new Date(domingo);
      sabado.setDate(domingo.getDate() + 6);
      fechaInicio = domingo.toISOString().slice(0, 10);
      fechaFin = sabado.toISOString().slice(0, 10);
    } else {
      fechaInicio = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-01`;
      const ultimoDia = new Date(base.getFullYear(), base.getMonth() + 1, 0);
      fechaFin = ultimoDia.toISOString().slice(0, 10);
    }

    const [rows] = await pool.query(
      'SELECT * FROM movimientos WHERE presentacion_id = ? AND fecha BETWEEN ? AND ? ORDER BY fecha ASC, id ASC',
      [presentacionId, fechaInicio, fechaFin]
    );
    res.json({ rows, fechaInicio, fechaFin });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
};