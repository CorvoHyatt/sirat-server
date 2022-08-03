import { Request, Response } from 'express';
import pool from '../database';

class LugaresController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO lugares set ?", [req.body]);
        res.json(resp);
      }


    public async list(req: Request, res: Response): Promise<any> {
        const respuesta = await pool.query('SELECT * FROM lugares ORDER BY nombre');
        res.json(respuesta);
    }

    public async listByName(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        console.log('name', name);
        const lugar = await pool.query(`SELECT * FROM lugares WHERE levenshtein(TRIM(LOWER('${name}')), TRIM(LOWER(nombre))) BETWEEN 0 AND 3`);
        if(lugar[0]){
            res.json(lugar[0]);
        }else{
            res.json(-1);
        }
    }
}
export const lugaresController = new LugaresController();