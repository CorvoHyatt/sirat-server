import { Request, Response } from "express";

import pool from "../database";

class TrasladosCostosController {
  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO traslado_costos set ?", [
      req.body,
    ]);
    res.json(resp);
  }

  public async listByIdTrasladoIdVehiculo(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idTraslado, idVehiculo } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM traslado_costos WHERE idTraslado = ${idTraslado} AND idVehiculo = ${idVehiculo}`
    );
    res.json(respuesta);
  }

  public async listByIdCiudadMuelle(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idCiudad } = req.params;
    console.log(
      `SELECT TC.*, V.* FROM traslados T INNER JOIN traslado_costos TC ON T.idTraslado= TC.idTraslado INNER JOIN vehiculo V ON TC.idVehiculo=V.idVehiculo WHERE idCiudad=${idCiudad} AND muelle=1`
    );
    const respuesta = await pool.query(
      `SELECT TC.*, V.*,D.valor ValorDivisa FROM traslados T INNER JOIN traslado_costos TC ON T.idTraslado= TC.idTraslado INNER JOIN vehiculo V ON TC.idVehiculo=V.idVehiculo INNER JOIN divisas D ON TC.idDivisa=D.idDivisa WHERE idCiudad=${idCiudad} AND muelle=1 ORDER BY TC.costo ASC     `
    );
    res.json(respuesta);
  }

  public async listByIdTraslado(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idTraslado } = req.params;
    
    const respuesta = await pool.query(
      `SELECT TC.*, V.nombre vehiculo, D.divisa FROM traslado_costos TC INNER JOIN vehiculo V ON TC.idVehiculo= V.idVehiculo INNER JOIN divisas D ON TC.idDivisa = D.idDivisa WHERE TC.idTraslado = ${idTraslado}`
    );
    res.json(respuesta);
  }

  public async listOne(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idTrasladoCosto } = req.params;
    console.log(
      `SELECT * FROM traslado_costos WHERE idTrasladoCosto= ${idTrasladoCosto} `    );
    const respuesta = await pool.query(
      `SELECT * FROM traslado_costos WHERE idTrasladoCosto= ${idTrasladoCosto} `
    );
    res.json(respuesta[0]);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { body } = req;
    delete body.divisa;
    delete body.vehiculo;
    const resp = await pool.query(
      "UPDATE traslado_costos SET ?  WHERE idTrasladoCosto = ?",
      [body, id]
    );
    res.json(resp);
  }

  public async updateDivisa(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log("id", id, req.body);
    const { body } = req;
    const resp = await pool.query(
      "UPDATE traslado_costos SET idDivisa = ?  WHERE idTraslado = ?",
      [body.idDivisa, id]
    );
    res.json(resp);
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const resp = await pool.query(
      "DELETE FROM traslado_costos WHERE idTrasladoCosto = ?",
      [id]
    );
    res.json(resp);
  }
}

export const trasladosCostosController = new TrasladosCostosController();
