import { Request, Response } from "express";

import pool from "../database";

class AreasController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO areas set ?", [req.body]);
        res.json(resp);
    }

    public async list(req: Request, res: Response): Promise<void> {
        const {id} =  req.params;
        const respuesta = await pool.query(
          `SELECT * FROM areas`
        );
        res.json(respuesta);
    }
    
    public async eliminar(req: Request, res: Response): Promise<void> {
        const { idArea } = req.params;
        const resp = await pool.query(`DELETE FROM areas WHERE idArea = ${idArea}`);
        res.json(resp);
    }
    
    public async actualizar(req: Request, res: Response): Promise<void> {
        const { idArea } = req.params;
        const resp = await pool.query("UPDATE areas set ? WHERE idArea = ?", [req.body, idArea]);
        res.json(resp);
    }
 
}

export const areasController = new AreasController();
