import { Request, Response } from "express";

import pool from "../database";

class ComisionesPagadasController {

  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO finanzas_comisionespagadas set ?", [req.body]);
    let ref = `V${req.body.idCotizacion}-C${resp.insertId}`;
    await pool.query("UPDATE finanzas_comisionespagadas SET refComision = ? WHERE idComision = ?", [ref, resp.insertId]);
    const reembolso = await pool.query(`
      SELECT fc.*, db.*
      FROM finanzas_comisionespagadas fc
      INNER JOIN divisasbase db ON fc.idDivisaBase = db.idDivisaBase
      WHERE fc.idComision = ?
    `, [resp.insertId]);
    res.json(reembolso[0]);
  }

  public async listPorCotizacion(req: Request, res: Response): Promise<void> {
    const { idCotizacion } = req.params;
    const respuesta = await pool.query(`
      SELECT fc.*, db.* 
      FROM finanzas_comisionespagadas fc
      INNER JOIN divisasbase db ON fc.idDivisaBase = db.idDivisaBase
      WHERE fc.idCotizacion = ${idCotizacion}
      ORDER BY fc.idComision DESC`);
    res.json(respuesta);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { idComision, tipo } = req.params;
    let resp: any;
    switch(tipo){
      case 'pago':
        resp = await pool.query(`UPDATE finanzas_comisionespagadas SET verificada = 1 WHERE idComision = ?`, [idComision]);
        break;
      case 'factura':
        resp = await pool.query(`UPDATE finanzas_comisionespagadas SET facturaE = 1 WHERE idComision = ?`, [idComision]);
        break;
    }
    res.json(resp);
  }
}

export const comisionesPagadasController = new ComisionesPagadasController();
