import { Request, Response } from 'express';
import pool from '../database';

class VersionamientoController {

    public async obtenerVersion(req: Request, res: Response): Promise<void> {
        const { idCotizacion, version } = req.params;
        const resp = await pool.query("SELECT * FROM canasta WHERE idCotizacion=? ORDER BY revision AND tipo AND idActividad ASC", [idCotizacion]);
        console.log(resp);
        let canasta:any=[];
        let c = 1;

     

        for (let index = 0; index < resp.length; index++) {
            c = 0;
            for (let index2 = 0; index2 < Number(version); index2++) {
                c++;
            }
            console.log(c);
        }
        res.json(resp);
    }
}

export const versionamientoController = new VersionamientoController();