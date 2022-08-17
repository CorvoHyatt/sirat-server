import { Request, Response } from 'express';
import pool from '../database';

class TrenesController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO trenes set ?", [req.body]);
        res.json(resp);
    }
    public async agregarEmpresa(req: Request, res: Response): Promise<void> 
    {
        let consulta="SELECT * FROM aceptadosTren WHERE idTrenInfo="+req.body.idTrenInfo;
        const respConsulta = await pool.query(consulta);
        
        if(respConsulta.length==0)
        {
            const resp = await pool.query("INSERT INTO aceptadosTren set ?", [req.body]);
            res.json(resp);
        }
        else
        {
            const resp = await pool.query("UPDATE aceptadosTren set empresa=? WHERE idTrenInfo=?", [req.body.empresa,req.body.idTrenInfo]);
            res.json(resp);
        }

    }
    public async upgrade(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO trenesupgrade set ?", [req.body]);
        res.json(resp);
    }

    public async actualizarHorario(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const resp = await pool.query(`UPDATE trenes SET horario = ? WHERE idTren = ${id}`, [req.body.horario]);
        res.json(resp);
    }


    public async getTrenesUpgrade(req: Request, res: Response): Promise<void> {
        try {
            const { idTren } = req.params;
            const resp = await pool.query("SELECT * FROM trenesupgrade WHERE idTren = ?", [idTren]);
            res.json(resp);  
        } catch (error) {
            console.log(error);
        }
    }


    public async update(req: Request, res: Response): Promise<void> {
        try {
            let tren = req.body[0];
            let upgrades = req.body[1];

            let idCotizacion = tren.idCotizacion;
            let total = tren.total;
            let precioPorPersona = tren.precioPorPersona;

            delete tren.idCotizacion;
            delete tren.total;
            delete tren.precioPorPersona;


            const { idTren } = req.params;
            
            const resp1 = await pool.query('UPDATE trenes SET ?  WHERE idTren = ?', [tren, idTren]);
            const resp2 = await pool.query('DELETE FROM trenesupgrade WHERE idTren = ?', [idTren]);
            
            if (upgrades != null) {
                for (let index = 0; index < upgrades.length; index++) {
                    const resp = await pool.query("INSERT INTO trenesupgrade set ?", [upgrades[index]]);
    
                }
            }

            const respU = await pool.query(`UPDATE productospreciostotales SET total = ${total}, precioPorPersona =  ${precioPorPersona} WHERE tipoProducto = 6 AND idCotizacion =${idCotizacion} AND idProducto= ${tren.idTren}`);

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

          const resp = await pool.query("INSERT INTO trenesinfo set ?", [req.body]);
          const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idTren}, ${req.body.idCotizacion}, 6, ${precioComprado},${costoNeto}, 0, 0)`);
    
          res.json(resp);
        }catch (error) {
          console.log(error); 
        }
      }
     
       
      public async updateInfoExtra(req: Request, res: Response): Promise<any> {
        try {
          const { idTrenInfo } = req.params;
            delete req.body.precioComprado;
            delete req.body.costoNeto;

          const resp = await pool.query(`UPDATE trenesinfo SET ? WHERE idTrenInfo = ${idTrenInfo}`, [req.body]);
          res.json(resp);
        }catch (error) {
          console.log(error); 
        }
      }
}

export const trenesController = new TrenesController();