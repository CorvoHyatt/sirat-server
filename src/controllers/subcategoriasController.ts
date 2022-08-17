import { Request, Response } from "express";

import pool from "../database";

class SubcategoriasController {


  public async list(req: Request, res: Response): Promise<void> {
      const respuesta = await pool.query(
       `
      SELECT * FROM subcategorias
       `
      );
      res.json(respuesta);
  }
  

  public async listByCategoria(req: Request, res: Response): Promise<void> {
      const { idCategoria } = req.params;
        const respuesta = await pool.query(
         `
         SELECT DISTINCT S.* FROM productos P INNER JOIN productossubcategoria PS ON P.idProducto= PS.idProducto INNER JOIN subcategorias S ON S.idSubcategoria = PS.subcategoria WHERE P.categoria=${idCategoria}
         `
        );
        res.json(respuesta);
  }


  public async listByCategoriaCiudad(req: Request, res: Response): Promise<void> {
    const { categoria, idCiudad } = req.params;
      const respuesta = await pool.query(
       `
       SELECT DISTINCT S.* FROM productos P INNER JOIN productossubcategoria PS ON P.idProducto = PS.idProducto INNER JOIN subcategorias S ON PS.subcategoria = S.idSubcategoria WHERE P.categoria = ${categoria} AND P.idCiudad = ${idCiudad}
       `
      );
      res.json(respuesta);
}

  

   
 
}

export const subcategoriasController = new SubcategoriasController();
 