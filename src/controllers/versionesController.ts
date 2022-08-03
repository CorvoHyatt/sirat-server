import { Request, Response } from 'express';
import pool from '../database';

class VersionesController {

    public async create(req: Request, res: Response): Promise<void> {
        try {
            const resp = await pool.query("INSERT INTO versiones set ?", [req.body]);
            res.json(resp);
        } catch (error) {
            console.log("Error al insertar", req.body);
            console.log(error);
        }
       
    }

    public async getLastVersion(req: Request, res: Response): Promise<void> {
        const { idCotizacion } = req.params;
        const resp = await pool.query(`SELECT MAX(versionCotizacion) FROM versiones WHERE idCotizacion=${idCotizacion}`);
        res.json(resp[0][`MAX(versionCotizacion)`]);
    }

}

export const versionesController = new VersionesController();