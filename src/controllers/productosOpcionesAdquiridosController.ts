import { Request, Response } from "express";

import pool from "../database";

class ProductosOpcionesAdquiridosController {
  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query(
      "INSERT INTO productosopcionesadquiridos set ?",
      [req.body]
    );
    res.json(resp);
  }

  public async create_list(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    for (let index = 0; index < req.body.length; index++) {
      await pool.query(
        `INSERT INTO productosopcionesadquiridos (idProductoAdquirido,idProductoOpcion) VALUES (${id}, ${req.body[index].idProductoOpcion})`
      );
    }
    res.json({ msg: "creando productos opciones adquiridos" });
  }

  public async listByIdProductoAdquirido(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProductoAdquirido } = req.params;

    const respuesta = await pool.query(
      `SELECT PO.* FROM productosopcionesadquiridos POA INNER JOIN productosopciones PO ON POA.idProductoOpcion=PO.idProductoOpcion WHERE idProductoAdquirido=${idProductoAdquirido}`
    );

    res.json(respuesta);
  }
}

export const productosOpcionesAdquiridosController = new ProductosOpcionesAdquiridosController();
