import { Request, Response } from "express";

import pool from "../database";

class TrasladosOtrosController {

  public async create(req: Request, res: Response): Promise<void> {
    try {
      let trasladoOtro = req.body[0];
      let mejoras = req.body[1];
      console.log(trasladoOtro);
  
      const resp = await pool.query("INSERT INTO trasladosotros set ?", [trasladoOtro]);
  
  
      for (let index = 0; index < mejoras.length; index++) {
        mejoras[index].idTrasladoOtro = resp.insertId;
        const resp2 = await pool.query("INSERT INTO trasladosOtrosUpgrade set ?", mejoras[index]);
      }
  
      res.json(resp);
    } catch (error) {  
      console.log(error);
    }
 

  }


  public async listOne(req: Request, res: Response): Promise<void> {
    const { idTrasladoOtro } = req.params;
    const resp = await pool.query(
      `SELECT * FROM trasladosotros WHERE idTrasladoOtro= ${idTrasladoOtro}`,
    );

    res.json(resp[0]);
  }

  public async getMejoras(req: Request, res: Response): Promise<void> {
    const { idTrasladoOtro } = req.params;
    try {
      const resp = await pool.query(
        `SELECT * FROM trasladosOtrosUpgrade WHERE idTrasladoOtro= ${idTrasladoOtro}`,
        
      ); 
      res.json(resp);

    } catch (error) {
      console.log(error);
    }
  }
 
}

export const trasladosOtrosController = new TrasladosOtrosController();
  