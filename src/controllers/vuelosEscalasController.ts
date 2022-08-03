import { Request, Response } from 'express';
import pool from '../database';

class VuelosEscalasController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO vueloescalas set ?", [req.body]);
        res.json(resp);
    }
}

export const vuelosEscalasController = new VuelosEscalasController();