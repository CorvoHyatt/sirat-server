import { Request, Response } from "express";

import pool from "../database";

class PagosController {

  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO finanzas_pagos set ?", [req.body]);
    let ref = `V${req.body.idCotizacion}-P${resp.insertId}`;
    await pool.query("UPDATE finanzas_pagos SET refPago = ? WHERE idPago = ?", [ref, resp.insertId]);
    const pago = await pool.query(`
      SELECT fp.*, db.*
      FROM finanzas_pagos fp
      INNER JOIN divisasbase db ON fp.idDivisaBase = db.idDivisaBase
      WHERE fp.idPago = ?
    `, [resp.insertId]);
    res.json(pago[0]);
  }

  public async listPorCotizacion(req: Request, res: Response): Promise<void> {
    const { idCotizacion } = req.params;
    const respuesta = await pool.query(`
      SELECT fp.*, db.*
      FROM finanzas_pagos fp
      INNER JOIN divisasbase db ON fp.idDivisaBase = db.idDivisaBase
      WHERE fp.idCotizacion = ${idCotizacion} 
      ORDER BY fp.idPago DESC
    `);
    res.json(respuesta);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { idPago, tipo } = req.params;
    let resp: any;
    switch(tipo){
      case 'pago':
        resp = await pool.query(`UPDATE finanzas_pagos SET pagoVerificado = 1 WHERE idPago = ?`, [idPago]);
        break;
      case 'factura':
        resp = await pool.query(`UPDATE finanzas_pagos SET facturaE = 1 WHERE idPago = ?`, [idPago]);
        break;
    }
    res.json(resp);
  }

}

export const pagosController = new PagosController();
