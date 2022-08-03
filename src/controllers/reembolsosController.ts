import { Request, Response } from "express";
import Pusher from 'pusher';
import pool from "../database";

class ReembolsosController {

  public async create(req: Request, res: Response): Promise<void> {

    const resp = await pool.query("INSERT INTO finanzas_reembolsos set ?", [req.body]);
    let ref = `V${req.body.idCotizacion}-R${resp.insertId}`;
    await pool.query("UPDATE finanzas_reembolsos SET refReembolso = ? WHERE idReembolso = ?", [ref, resp.insertId]);
    const reembolso = await pool.query("SELECT * FROM finanzas_reembolsos WHERE idReembolso = ?", [resp.insertId]);

    const pusher: any = new Pusher({
      appId: "1217136",
      key: "f7e8a37d1ad14888fa5d",
      secret: "de0c01d76c3776a1de05",
      cluster: "us2"
    });
    pusher.trigger(`reembolsos-${req.body.idCotizacion}`, `nuevo-reembolso-${req.body.idCotizacion}`, {
      reembolso: reembolso[0]
    });

    res.json(reembolso[0]);
  }

  public async listPorCotizacion(req: Request, res: Response): Promise<void> {
    const { idCotizacion } = req.params;
    const respuesta = await pool.query(`SELECT * FROM finanzas_reembolsos WHERE idCotizacion = ${idCotizacion} AND eliminado = 0 ORDER BY idReembolso DESC`);
    res.json(respuesta);
  }

  public async getTotalReembolsoFinal(req: Request, res: Response): Promise<void> {
    const { idCotizacion } = req.params;
    
    const query = await pool.query(`SELECT IFNULL(SUM(fr.cantidadDivisa), 0) as total FROM finanzas_reembolsos fr WHERE fr.idCotizacion = ${idCotizacion} AND fr.reembolsoFinal = 1`);
    res.json(query[0].total);
  }

  public async getTotalReembolsos(req: Request, res: Response): Promise<void> {
    const { idCotizacion } = req.params;
    const query = await pool.query(`SELECT SUM(cantidadMXN) as total FROM finanzas_reembolsos WHERE idCotizacion = ${idCotizacion} AND eliminado = 0`);
    query[0].total ? res.json({total: query[0].total}) : res.json({ total: 0 });
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { idReembolso } = req.params;
    const resp = await pool.query(`UPDATE finanzas_reembolsos SET facturaE = 1 WHERE idReembolso = ?`, [idReembolso]);
    res.json(resp);
  }

}

export const reembolsosController = new ReembolsosController();
