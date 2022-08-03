import { Request, Response } from 'express';
import pool from '../database';


class CiudadController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query('INSERT INTO ciudad set ?', [req.body]);
        res.json(resp);
    }

    public async list(req: Request, res: Response): Promise<void> {
        const respuesta = await pool.query('SELECT * FROM ciudad ORDER BY idCiudad DESC');
        res.json(respuesta);
    }

    public async list_one(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT * FROM ciudad WHERE idCiudad=${id}`);
        res.json(respuesta[0]);
    }

    public async listByName(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const ciudad = await pool.query(`SELECT * FROM ciudad WHERE TRIM(LOWER(nombre)) LIKE TRIM(LOWER('${name}'))`);
        if(ciudad[0]){
            res.json(ciudad[0]);
        }else{
            res.json(-1);
        }
    }

    public async listByNameCityNameCountry(req: Request, res: Response): Promise<void> {
        const { nameCity, nameCountry } = req.params;
        
        const ciudad = await pool.query(`SELECT * FROM ciudad C INNER JOIN pais P ON C.idpais = P.id WHERE levenshtein(TRIM(LOWER(C.nombre)), TRIM(LOWER('${nameCity}'))) BETWEEN 0 AND 2 AND levenshtein(TRIM(LOWER(P.nombre)), TRIM(LOWER('${nameCountry}'))) BETWEEN 0 AND 1
        `);
      
        
        if(ciudad[0]){
            res.json(ciudad[0].idCiudad);
        }else{
            res.json(-1);  
        }
    }  

    public async listOneWithCountry(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT c.nombre, p.* FROM ciudad c INNER JOIN pais p ON c.idPais = p.id WHERE idCiudad = ?`, [id]);
        res.json(respuesta);
    }

    public async listOneWithContinent(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT P.idContinente, C.* FROM ciudad C INNER JOIN pais P ON C.idpais = P.id WHERE idCiudad=${id}`);
        res.json(respuesta[0]);
    }

    public async list_porPais(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        console.log(`SELECT * FROM ciudad  where idPais=${id} ORDER BY nombre`);
        const respuesta = await pool.query(`SELECT * FROM ciudad  where idPais=${id} ORDER BY nombre`);
        res.json(respuesta);
    }

    public async list_porPaisDisposiciones(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT DISTINCT C.* FROM disposiciones D INNER JOIN ciudad C ON D.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id
        where P.id=${id} ORDER BY nombre`);
        res.json(respuesta);
    }
    
    public async list_porPaisTraslados(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query(`SELECT DISTINCT C.* FROM traslados T INNER JOIN ciudad C ON T.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id
        where P.id=${id} ORDER BY nombre`);
        res.json(respuesta);
    }


    public async list_porPaisProductos(req: Request, res: Response): Promise<void> {
        const { id, categoria } = req.params;
        const respuesta = await pool.query(`SELECT DISTINCT C.* FROM productos PP INNER JOIN ciudad C ON PP.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais = P.id
        where P.id=${id} AND PP.categoria = ${categoria} ORDER BY nombre`);
        res.json(respuesta);
    }
    

    public async list_2(req: Request, res: Response): Promise<void> {
        const respuesta = await pool.query('SELECT pais.nombre pais, ciudad.* FROM ciudad, pais WHERE ciudad.idPais = pais.id ORDER BY pais.nombre, ciudad.nombre ASC');
        res.json(respuesta);
    }

    public async update(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query('UPDATE ciudad SET ? WHERE idCiudad = ?', [req.body, id]);
        const { affectedRows } = resp;
        res.json({ affectedRows: affectedRows });

    }

    public async delete(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const respuesta = await pool.query('DELETE FROM ciudad WHERE idCiudad = ?', id);
        res.json(respuesta);
    }


    public async listImagenesExistentes(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
        const { idCiudad,tipo } = req.params;

        const respuesta = await pool.query(
          `SELECT * FROM ciudadImagenes WHERE idCiudad=${idCiudad} AND tipo = ${tipo}`
        );

        res.json(respuesta);
        } catch (error) {
            console.log(error);
        }
        
    }
    
}

export const ciudadController = new CiudadController();
