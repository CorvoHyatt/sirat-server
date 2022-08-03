import { Request, Response } from 'express';
import pool from "../database";

class ProductosPreciosTotalesController {
    public async create(req: Request, res: Response): Promise<any> {
        const resp = await pool.query("INSERT INTO productospreciostotales set ?", [req.body]);
        res.json(resp);
    }
}
export const productosPreciosTotalesController = new ProductosPreciosTotalesController();