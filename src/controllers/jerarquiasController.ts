import { Request, Response } from "express";
import pool from "../database";

class JerarquiasController {
  public async create(req: Request, res: Response): Promise<void> {
    for (let index = 0; index < req.body.length; index++) {
      const resp = await pool.query("INSERT INTO jerarquias set ?", [req.body]);
    }
    res.json({ msg: "creando productos opciones adquiridos" });
  }

  public async create_list(req: Request, res: Response): Promise<void> {
    for (let index = 0; index < req.body.length; index++) {
      const resp = await pool.query("INSERT INTO jerarquias set ?", [
        req.body[index],
      ]);
    }
    res.json({ msg: "jerarquias creasas" });
  }

  public async list_agrupado(req: Request, res: Response): Promise<void> {
    let areasPrincipales = await pool.query(
      `SELECT DISTINCT (J.idAreaPrincipal), A.nombre FROM jerarquias J INNER JOIN areas A ON J.idAreaPrincipal = A.idArea`
    );
    areasPrincipales = JSON.parse(JSON.stringify(areasPrincipales));
    for (let index = 0; index < areasPrincipales.length; index++) {
      areasPrincipales[index].subordinados = await pool.query(
        `SELECT J.idAreaSubordinada, A.nombre FROM jerarquias J INNER JOIN areas A ON J.idAreaSubordinada = A.idArea WHERE J.idAreaPrincipal=${areasPrincipales[index].idAreaPrincipal}`
      );
      
    }
    res.json(areasPrincipales);
  }

  public async list_areasDisponibles(
    req: Request,
    res: Response
  ): Promise<void> {
    const respuesta = await pool.query(
      `SELECT * FROM areas WHERE idArea NOT IN (SELECT idAreaPrincipal FROM jerarquias)`
    );
    res.json(respuesta);
  }

  public async list_areasSubordinadas(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idAreaPrincipal } = req.params;
    const respuesta = await pool.query(
      `SELECT A.* FROM jerarquias J INNER JOIN areas A ON J.idAreaSubordinada= A.idArea WHERE J.idAreaPrincipal=${idAreaPrincipal}`
    );
    res.json(respuesta);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { idAreaPrincipal } = req.params;
    const respuesta = await pool.query(
      `DELETE FROM jerarquias WHERE idAreaPrincipal=${idAreaPrincipal}`
    );
    for (let index = 0; index < req.body.subordinados.length; index++) {
      let j: any = {};
      j.idAreaPrincipal = idAreaPrincipal;
      j.idAreaSubordinada = req.body.subordinados[index].idAreaSubordinada;
      const resp = await pool.query("INSERT INTO jerarquias set ?", [j]);
    }

    res.json(`Actualizado`);

  }

  public async delete(req: Request, res: Response): Promise<void> {
    const { idAreaPrincipal } = req.params;
    const respuesta = await pool.query(
      `DELETE FROM jerarquias WHERE idAreaPrincipal=${idAreaPrincipal}`
    );
   
    res.json(`Eliminado`);
  }
  public async count(req: Request, res: Response): Promise<void> {
    const { idAreaPrincipal } = req.params;
    let count = await pool.query(`SELECT COUNT(idAreaSubordinada) FROM jerarquias WHERE idAreaPrincipal=${idAreaPrincipal}`);
    res.json(count[0]["COUNT(idAreaSubordinada)"]);
  }
}
export const jerarquiasController = new JerarquiasController();
