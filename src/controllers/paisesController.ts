import { Request, Response } from 'express';
import pool from '../database';


class PaisesController {

    public async list(req: Request, res: Response): Promise<void> {
        const respuesta = await pool.query('SELECT * FROM pais ORDER BY nombre ');
        res.json(respuesta);
    }


    public async listDisposiciones(req: Request, res: Response): Promise<void> {
        const { idContinente } = req.params;
        let respuesta;
        if (Number.parseInt(idContinente) == -1) {
            respuesta = await pool.query('SELECT DISTINCT P.* FROM disposiciones D INNER JOIN ciudad C ON D.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id');
        } else {
            
            respuesta = await pool.query(`SELECT DISTINCT P.* FROM disposiciones D INNER JOIN ciudad C ON D.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id WHERE P.idContinente=${idContinente} ORDER BY nombre`);
        }
        res.json(respuesta);
    }

    public async listTraslados(req: Request, res: Response): Promise<void> {
        const { idContinente } = req.params;
        let respuesta;
        if (Number.parseInt(idContinente) == -1) {
            respuesta = await pool.query('SELECT DISTINCT P.* FROM traslados T INNER JOIN ciudad C ON T.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id');
        } else {
            
            respuesta = await pool.query(`SELECT DISTINCT P.* FROM traslados T INNER JOIN ciudad C ON T.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id WHERE P.idContinente=${idContinente} ORDER BY nombre`);
        }
        res.json(respuesta);
    }


    public async listProductos(req: Request, res: Response): Promise<void> {
        const { idContinente, categoria } = req.params;
        let respuesta;
        if (Number.parseInt(idContinente) == -1) {
            respuesta = await pool.query(`SELECT DISTINCT P.* FROM productos PP INNER JOIN ciudad C ON PP.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id WHERE PP.categoria = ${categoria}`);
        } else {
            respuesta = await pool.query(`SELECT DISTINCT P.* FROM productos PP INNER JOIN ciudad C ON PP.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id WHERE P.idContinente=${idContinente} AND PP.categoria = ${categoria} ORDER BY nombre`);
        }
        res.json(respuesta);
    }


    public async listByIdContinente(req: Request, res: Response): Promise<void> {
        const { idContinente } = req.params;
        let respuesta;
        if (Number.parseInt(idContinente) == -1) {
            respuesta = await pool.query('SELECT * FROM pais ORDER BY nombre ');
        } else {
            
            respuesta = await pool.query(`SELECT * FROM pais WHERE idContinente=${idContinente} ORDER BY nombre`);
        }
        res.json(respuesta);
    }

    public async listOne(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query('SELECT * FROM pais WHERE id = ? ', [id]);
        res.json(respuesta);
    }

    public async listByName(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const pais = await pool.query(`SELECT * FROM pais WHERE TRIM(LOWER(nombre)) LIKE TRIM(LOWER('${name}'))`);
        if(pais[0]){
            res.json(pais[0]);
        }else{
            res.json(-1);
        }
    }

    public async pagination(req: Request, res: Response): Promise<void> {
        const { inicio, total } = req.params;
        const respuesta = await pool.query('SELECT *, (SELECT COUNT(*) FROM pais) AS total FROM pais ORDER BY nombre LIMIT ?, ?', [parseInt(inicio), parseInt(total)]);
        res.json(respuesta);
    }
    
    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO pais set ?", [req.body]);
        res.json(resp);
    }
    
    public async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query('UPDATE pais SET ?  WHERE id = ?', [req.body, id]);
        res.json(resp);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query('DELETE FROM pais  WHERE id = ?', [id]);
        res.json(resp);
    }

 
}

export const paisesController = new PaisesController();
 