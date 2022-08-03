import { Request, Response } from "express";
import pool from "../database";

class DestinosController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO cotizaciones_destinos set ?", [req.body]);
        const destino = await pool.query(`
            SELECT cd.*, c.nombre AS ciudad, p.nombre AS pais, p.id AS idPais, ct.nombre AS continente
            FROM cotizaciones_destinos cd
            INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
            INNER JOIN pais p ON c.idPais = p.id
            INNER JOIN continentes ct ON p.idContinente = ct.idContinente
            where idDestino = ?
        `, [resp.insertId]);
        res.json(destino[0]);
    }

    public async create_version(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO cotiz_dest_versiones set ?", [req.body]);
        res.json(resp);
    }

    public async list_porCotizacion(req: Request, res: Response): Promise<void> {
        const { id } =  req.params;
        const respuesta = await pool.query(`
            SELECT cd.*, c.nombre AS ciudad, p.nombre AS pais, p.id AS idPais, ct.nombre AS continente
            FROM cotizaciones_destinos cd
            INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
            INNER JOIN pais p ON c.idPais = p.id
            INNER JOIN continentes ct ON p.idContinente = ct.idContinente
            where idCotizacion = ?
        `, [id]);
        res.json(respuesta);
    }
    
    public async list_one(req: Request, res: Response): Promise<void> {
        const {id} =  req.params;
        const respuesta = await pool.query(`SELECT * FROM cotizaciones_destinos WHERE idDestino = ${id} `);
        res.json( respuesta[0] );
    }
    
    public async listOneWithCotizacion(req: Request, res: Response): Promise<void> {
        const { id } =  req.params;
        const respuesta = await pool.query(`SELECT cd.*, c.numM, c.num18, c.num12 FROM cotizaciones_destinos cd INNER JOIN cotizaciones c WHERE idDestino = ${id} `);
        res.json( respuesta[0] );
    }
 
}

export const destinosController = new DestinosController();
