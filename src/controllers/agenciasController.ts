import { Request, Response } from "express";

import pool from "../database";

class AgenciasController {
  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO agencias set ?", [req.body]);
    res.json(resp);
  }

  public async list(req: Request, res: Response): Promise<void> {
    const respuesta = await pool.query("SELECT * FROM agencias");
    res.json(respuesta);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const resp = await pool.query(
      "UPDATE agencias SET ? WHERE idAgencia = ?",
      [req.body, id]
    );
    const { affectedRows } = resp;
    res.json({ affectedRows: affectedRows });
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    console.log(id);
    const respuesta = await pool.query(
      "DELETE FROM agencias WHERE idAgencia = ?",
      id
    );
    console.log(respuesta);
    res.json(respuesta);
  }
}

export const agenciasController = new AgenciasController();
