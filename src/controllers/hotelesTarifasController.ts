import { Request, Response } from 'express';
import pool from '../database';


class HotelesTarifasController {

    public async list(req: Request, res: Response): Promise<void> {
        const respuesta = await pool.query('SELECT ht.*, c.nombre FROM hotelestarifa ht INNER JOIN ciudad c  ON ht.idCiudad = c.idCiudad ORDER BY nombre');
        res.json(respuesta);
    }

    public async listOne(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query('SELECT ht.*, c.nombre FROM hotelestarifa ht INNER JOIN ciudad c  ON ht.idCiudad = c.idCiudad WHERE ht.idHotelTarifa = ? ORDER BY nombre', [id]);
        res.json(respuesta);
    }

    public async pagination(req: Request, res: Response): Promise<void> {
        const { inicio, total } = req.params;
        const resp = await pool.query('SELECT ht.*, c.nombre, (SELECT COUNT(*) FROM hotelestarifa) AS total FROM hotelestarifa ht INNER JOIN ciudad c  ON ht.idCiudad = c.idCiudad ORDER BY nombre LIMIT ?, ?', [parseInt(inicio), parseInt(total)]);
        res.json(resp);
    }

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO hotelestarifa set ?", [req.body]);
        res.json(resp);
    }

    public async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query('UPDATE hotelestarifa SET ?  WHERE idHotelTarifa = ?', [req.body, id]);
        res.json(resp);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query('DELETE FROM hotelestarifa  WHERE idHotelTarifa = ?', [id]);
        res.json(resp);
    }

 
}

export const hotelesTarifasController = new HotelesTarifasController();