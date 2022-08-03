import { Request, Response } from "express";

import pool from "../database";

class ArchivosFacturasController {

    public async listNombreArchivosFactura(req: Request, res: Response): Promise<void> {
        const { idReintegro, tipoReintegro } = req.params;
        const respuesta = await pool.query(`SELECT * FROM finanzas_archivosfacturas WHERE idArchivoPago != 0 AND idReintegro = ${idReintegro} AND tipoReintegro = ${tipoReintegro}`);
        res.json(respuesta);
    }
 
}

export const archivosFacturasController = new ArchivosFacturasController();
