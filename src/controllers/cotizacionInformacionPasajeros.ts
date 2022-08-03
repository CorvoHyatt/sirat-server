import { Request, Response } from 'express';
import pool from "../database";

class CotizacionInformacionPasajeorsController {
    public async create(req: Request, res: Response): Promise<any> {
        const resp = await pool.query(`INSERT INTO cotizacioninformacionpasajeros SET ?`, [req.body]);
        res.json(resp);
    }

    public async get(req: Request, res: Response): Promise<any> {

        try {
            const { idCotizacion } = req.params;
            const resp = await pool.query(`SELECT * FROM cotizacioninformacionpasajeros WHERE idCotizacion= ${idCotizacion} ORDER BY pasaporte`);
            res.json(resp);
        } catch (error) {
            console.log(error);
        } 
        
    }

    public async update(req: Request, res: Response): Promise<any> {
        try{
            const { id } = req.params;
            const resp = await pool.query('UPDATE cotizacioninformacionpasajeros SET ? WHERE idCotizacionInformacionPasajero = ?', [req.body, id]);
            res.json(resp);

        }catch(error){
            console.log(error);
        }
       
    }
}
export const cotizacionInformacionPasajerosController = new CotizacionInformacionPasajeorsController();