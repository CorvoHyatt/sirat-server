import { Request, Response } from "express";

import pool from "../database";

class ContinentesController {

  public async list(req: Request, res: Response): Promise<void> {
    const respuesta = await pool.query(
      "SELECT * FROM continentes"
    );
    res.json(respuesta);
  }

  public async listDisposiciones(req: Request, res: Response): Promise<void> {
    const respuesta = await pool.query(
      "SELECT DISTINCT CC.* FROM disposiciones D INNER JOIN ciudad C ON D.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id INNER JOIN continentes CC ON P.idContinente = CC.idContinente"
    );
    res.json(respuesta);
  }

  public async listTraslados(req: Request, res: Response): Promise<void> {
    const respuesta = await pool.query(
      "SELECT DISTINCT CC.* FROM traslados T INNER JOIN ciudad C ON T.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id INNER JOIN continentes CC ON P.idContinente = CC.idContinente"
    );
    res.json(respuesta);
  }

  public async listProductos(req: Request, res: Response): Promise<void> {
    const { categoria } = req.params;

    const respuesta = await pool.query(
      `SELECT DISTINCT CC.* FROM productos PP INNER JOIN ciudad C ON PP.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id INNER JOIN continentes CC ON P.idContinente = CC.idContinente WHERE PP.categoria = ${categoria}`
    );
    res.json(respuesta);
  }
 
}

export const continentesController = new ContinentesController();
