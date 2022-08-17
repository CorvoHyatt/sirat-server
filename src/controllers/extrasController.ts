import { Request, Response } from 'express';
import pool from '../database';
//import { collapseTextChangeRangesAcrossMultipleVersions } from 'typescript';

class ExtrasController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO extras set ?", [req.body]);
        res.json(resp);
    }

    public async update(req: Request, res: Response): Promise<void> {
        try {
            let extra = req.body[0];
          
            let idCotizacion = extra.idCotizacion;
            let total = extra.total;
            let precioPorPersona = extra.precioPorPersona;

            delete extra.idCotizacion;
            delete extra.total;
            delete extra.precioPorPersona;
 

            const { idExtras } = req.params;
            const resp1 = await pool.query('UPDATE extras SET ?  WHERE idExtras = ?', [ extra,idExtras]);
         

            const respU = await pool.query(`UPDATE productospreciostotales SET total = ${total}, precioPorPersona =  ${precioPorPersona} WHERE tipoProducto = 8 AND idCotizacion =${idCotizacion} AND idProducto= ${extra.idExtras}`);

            res.json(resp1);  
        } catch (error) {
            console.log(error);
        }
    }
    public async agregarEmpresa(req: Request, res: Response): Promise<void> 
    {
      
        let consulta="SELECT * FROM aceptadosExtras WHERE idExtrasInfo="+req.body.idExtrasInfo;
        const respConsulta = await pool.query(consulta);
        
        if(respConsulta.length==0)
        {
            const resp = await pool.query("INSERT INTO aceptadosExtras set ?", [req.body]);
            res.json(resp);
        }
        else
        {
            const resp = await pool.query("UPDATE aceptadosExtras set empresa=? WHERE idExtrasInfo=?", [req.body.empresa,req.body.idExtrasInfo]);
            res.json(resp);
        }

    }

    public async insertInfoExtra(req: Request, res: Response): Promise<any> {
        try {
          let precioComprado = req.body.precioComprado;
          let costoNeto = req.body.costoNeto; 


          delete req.body.precioComprado;
          delete req.body.costoNeto;

          const resp = await pool.query("INSERT INTO extrasInfo set ?", [req.body]);
          const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idExtra}, ${req.body.idCotizacion}, 8, ${precioComprado},${costoNeto}, 0, 0)`);
          res.json(resp);
        }catch (error) {
          console.log(error); 
        } 
      } 
    
      public async updateInfoExtra(req: Request, res: Response): Promise<any> {
        try {
          const { idExtrasInfo } = req.params;
          delete req.body.precioComprado;
          delete req.body.costoNeto;

          const resp = await pool.query(`UPDATE extrasInfo SET ? WHERE idExtrasInfo = ${idExtrasInfo}`, [req.body]);
          res.json(resp);
        }catch (error) {
          console.log(error); 
        }
      } 
}

export const extrasController = new ExtrasController();