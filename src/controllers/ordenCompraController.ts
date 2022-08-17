import { Request, Response } from "express";

import pool from "../database";

class OrdenCompraController { 

  public async create(req: Request, res: Response): Promise<void> {
    let orden = req.body[0];     

    
      const resp = await pool.query('INSERT INTO ordencompra set ?', [orden]);
//    let idAgente = resp.insertId;
    res.json(`Agente agregado`);
}

public async update(req: Request, res: Response): Promise<void> {
  let orden = req.body[0];    
  let estado = req.body[1];
 
  let consulta=`UPDATE ordencompra SET estado =  ${orden.estado}  WHERE idCotizacion = ${orden.idCotizacion}`;
  
  const resp = await pool.query(consulta);
  const { affectedRows } = resp;

  res.json({ affectedRows: affectedRows });
}
public async listOne(req: Request, res: Response): Promise<void> {
  const { idCotizacion } = req.params;
  const respuesta = await pool.query(`SELECT * FROM ordencompra WHERE idCotizacion = ${idCotizacion}`);
  res.json(respuesta);
}

  

}

export const ordenCompraController = new OrdenCompraController();
