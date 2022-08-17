import { Request, Response } from 'express';
import pool from '../database';

class VehiculosController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO vehiculo set ?", [req.body]);
        res.json(resp);
    }

    public async listByName(req: Request, res: Response): Promise<void> {
        var { name } = req.params;
        if(String(name).trim().toLocaleLowerCase() === 'bus-metro'){
            name = name.replace('-', '/');
        }
        const ciudad = await pool.query(`SELECT * FROM vehiculo WHERE TRIM(LOWER(nombre)) LIKE TRIM(LOWER('${name}'))`);
        if(ciudad[0]){
            res.json(ciudad[0]);
        }else{
            res.json(-1);
        }
    }

    public async list(req: Request, res: Response): Promise<any> {
        const respuesta = await pool.query('SELECT * FROM vehiculo');
        res.json(respuesta);
    }

    public async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query('UPDATE vehiculo SET ? WHERE idVehiculo = ?', [req.body, id]);
        const { affectedRows } = resp;
        res.json({ affectedRows: affectedRows });
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        
        const respuesta = await pool.query('DELETE FROM vehiculo WHERE idVehiculo = ?', id);
        
    }
}
export const vechiculosController = new VehiculosController();