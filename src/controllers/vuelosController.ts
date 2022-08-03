import { Request, Response } from 'express';
import pool from '../database';

class VuelosController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO vuelos set ?", [req.body]);
        res.json(resp);
    }
    public async agregarEmpresa(req: Request, res: Response): Promise<void> 
    {
        let consulta="SELECT * FROM aceptadosVuelos WHERE idVueloInfo="+req.body.idVueloInfo;
        const respConsulta = await pool.query(consulta);
        console.log(respConsulta);
        if(respConsulta.length==0)
        {
            const resp = await pool.query("INSERT INTO aceptadosVuelos set ?", [req.body]);
            res.json(resp);
        }
        else
        {
            const resp = await pool.query("UPDATE aceptadosVuelos set empresa=? WHERE idVueloInfo=?", [req.body.empresa,req.body.idVueloInfo]);
            res.json(resp);
        }

    }
    public async upgrade(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO vuelosupgrade set ?", [req.body]);
        res.json(resp);
    }


    public async getVuelosUpgrade(req: Request, res: Response): Promise<void> {
        try {
            const { idVuelo } = req.params;
            const resp = await pool.query("SELECT * FROM vuelosupgrade WHERE idVuelo = ?", [idVuelo]);
            res.json(resp);  
        } catch (error) {
            console.log(error);
        }
    }


    public async update(req: Request, res: Response): Promise<void> {
        try {
            let vuelo = req.body[0];
            let upgrades = req.body[1][0];

            let idCotizacion = vuelo.idCotizacion;
            let total = vuelo.total;
            let precioPorPersona = vuelo.precioPorPersona;

            delete vuelo.idCotizacion;
            delete vuelo.total; 
            delete vuelo.precioPorPersona;


            const { idVuelo } = req.params;
            console.log(upgrades);
            const resp1 = await pool.query('UPDATE vuelos SET ?  WHERE idVuelo = ?', [vuelo, idVuelo]);
            const resp2 = await pool.query('DELETE FROM vuelosupgrade WHERE idVuelo = ?', [idVuelo]);
            if (upgrades != null) {
                const resp = await pool.query("INSERT INTO vuelosupgrade set ?", [upgrades]);
            }

            const respU = await pool.query(`UPDATE productospreciostotales SET total = ${total}, precioPorPersona =  ${precioPorPersona} WHERE tipoProducto = 5 AND idCotizacion =${idCotizacion} AND idProducto= ${vuelo.idVuelo}`);


            res.json(resp1);  
        } catch (error) {
            console.log(error);
        }
    }


    public async insertInfoExtra(req: Request, res: Response): Promise<any> {
        try {
            let precioComprado = req.body.precioComprado;
            let costoNeto = req.body.costoNeto; 

            delete req.body.precioComprado;
            delete req.body.costoNeto;

          const resp = await pool.query("INSERT INTO vuelosInfo set ?", [req.body]);
          const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idVuelo}, ${req.body.idCotizacion}, 5, ${precioComprado}, ${costoNeto}, 0, 0)`);
    
          res.json(resp);
        }catch (error) {
          console.log(error); 
        }
      }
     
       
      public async updateInfoExtra(req: Request, res: Response): Promise<any> {
        try {
          const { idVueloInfo } = req.params;
            delete req.body.precioComprado;
            delete req.body.costoNeto;

          const resp = await pool.query(`UPDATE vuelosInfo SET ? WHERE idVueloInfo = ${idVueloInfo}`, [req.body]);
          res.json(resp);
        }catch (error) {
          console.log(error); 
        }
      }
} 

export const vuelosController = new VuelosController();