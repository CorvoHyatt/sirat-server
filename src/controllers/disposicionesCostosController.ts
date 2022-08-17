import { Request, Response } from "express";

import pool from "../database";

class DisposicionesCostosController {
  public async listByIdDisposicionIdVehiculo(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idDisposicion, idVehiculo } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM disposicionescostos WHERE idDisposicion = ${idDisposicion} AND idVehiculo = ${idVehiculo}`
    );
    res.json(respuesta);
  }

  public async listByIdDisposicion(req: Request, res: Response): Promise<void> {
    const { idDisposicion } = req.params;

    const respuesta = await pool.query(
      `SELECT V.nombre vehiculo, DC.* FROM disposicionescostos DC INNER JOIN vehiculo V ON DC.idVehiculo=V.idVehiculo WHERE idDisposicion=${idDisposicion} ORDER BY DC.costo ASC`
    );
    res.json(respuesta);
  } 

  public async create_list(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    for (let index = 0; index < req.body.length; index++) {
      
      await pool.query(
        `INSERT INTO disposicionescostos (idDisposicion, idVehiculo, horasMinimo, costo, horaExtra) VALUES (${id}, ${req.body[index].idVehiculo}, ${req.body[index].horasMinimo} , ${req.body[index].costo}, ${req.body[index].horaExtra})`
      );
    }
    res.json({ msg: "creando productos opciones adquiridos" });
  }

  public async actualizar(req: Request, res: Response): Promise<void> {
    
    const { idDisposicion } = req.params;
    const resp = await pool.query(
      `DELETE FROM disposicionescostos WHERE idDisposicion = ${idDisposicion}`
    );
    for (let index = 0; index < req.body.length; index++) {
      
      await pool.query(
        `INSERT INTO disposicionescostos (idDisposicionCosto, idDisposicion, idVehiculo, horasMinimo, costo, horaExtra) VALUES (${req.body[index].idDisposicionCosto}, ${req.body[index].idDisposicion}, ${req.body[index].idVehiculo}, ${req.body[index].horasMinimo}, ${req.body[index].costo}, ${req.body[index].horaExtra})`
      );
    }
    res.json({ msg: "Actualizando disposiciones costos" });
  }

  public async listOne(
    req: Request,
    res: Response
  ): Promise<void> {

    try {
      const { idDisposicionCosto } = req.params;
      
      const respuesta = await pool.query(
        `SELECT * FROM disposicionescostos WHERE idDisposicionCosto= ${idDisposicionCosto} `
      );
      res.json(respuesta[0]);
    } catch (error) {
      console.log(error);
    }
 
  }

 
  
}

export const disposicionesCostosController = new DisposicionesCostosController();
