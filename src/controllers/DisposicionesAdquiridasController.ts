import { Request, Response } from "express";

import pool from "../database";

class DisposicionesAdquiridasController {

    public async create(req: Request, res: Response): Promise<void> {

     try {
      let disposicionAdquirida = req.body[0];
      let mejoras = req.body[1];
  
      const resp = await pool.query("INSERT INTO disposicionesadquiridas set ?", [
        disposicionAdquirida
      ]);
  
       if (mejoras != null) {
        for (let index = 0; index < mejoras.length; index++) {
          mejoras[index].idDisposicionAdquirida = resp.insertId;
          const resp2 = await pool.query("INSERT INTO disposicionesAdquiridasUpgrade set ?", mejoras[index]);
        }
       }
      
  
        res.json(resp);
    
     } catch (error) {
       console.log(error);
     }
       
    }
  
    public async listOne(req: Request, res: Response): Promise<void> {
      const { idDisposicionAdquirida } = req.params;
      
      const resp = await pool.query(
        `SELECT * FROM disposicionesadquiridas WHERE idDisposicionadquirida= ${idDisposicionAdquirida}`,
        
      );
  
      res.json(resp[0]);
    }
 
  
    public async getMejoras(req: Request, res: Response): Promise<void> {
      const { idDisposicionAdquirida } = req.params;
      try {
        const resp = await pool.query(
          `SELECT * FROM disposicionesAdquiridasUpgrade WHERE idDisposicionAdquirida= ${idDisposicionAdquirida}`,
        ); 
        res.json(resp);
  
      } catch (error) {
        console.log(error);
      }
    }

  

  
    public async update(req: Request, res: Response): Promise<void> {
      try {
        const { idDisposicionAdquirida } = req.params;
       
        let disposicionAdquirida = req.body[0];
        let mejoras = req.body[1];

        let total = disposicionAdquirida.total;
        let idCotizacion = disposicionAdquirida.idCotizacion;
        delete  disposicionAdquirida.total;
        delete disposicionAdquirida.idCotizacion;
        
        
        
  
      const resp = await pool.query('UPDATE disposicionesadquiridas SET ? WHERE idDisposicionAdquirida = ?', [disposicionAdquirida, idDisposicionAdquirida]);
      const respD = await pool.query('DELETE FROM disposicionesAdquiridasUpgrade WHERE idDisposicionAdquirida = ?', [idDisposicionAdquirida]);
    
      if (mejoras != null) {
        for (let index = 0; index < mejoras.length; index++) {
          mejoras[index].idDisposicionAdquirida = idDisposicionAdquirida;
          const resp2 = await pool.query("INSERT INTO disposicionesAdquiridasUpgrade set ?", mejoras[index]);
        }
      }
        
      const respU = await pool.query(`UPDATE productospreciostotales SET total = ${total} WHERE tipoProducto = 2 AND idCotizacion =${idCotizacion} AND idProducto= ${idDisposicionAdquirida}`, [idDisposicionAdquirida]);
  
  
      const { affectedRows } = resp;
      res.json({ affectedRows: affectedRows });
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

      const resp = await pool.query("INSERT INTO disposicionesAdquiridasInfo set ?", [req.body]);
      const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idDisposicionAdquirida}, ${req.body.idCotizacion}, 2, ${precioComprado},${costoNeto}, 0, 0)`);

      res.json(resp);
    }catch (error) {
      console.log(error); 
    }
  }
 
   
  public async updateInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      const { idDispAdqInfo } = req.params;
      delete req.body.precioComprado;
      delete req.body.costoNeto; 

      const resp = await pool.query(`UPDATE disposicionesAdquiridasInfo SET ? WHERE idDispAdqInfo = ${idDispAdqInfo}`, [req.body]);
      res.json(resp);
    }catch (error) {
      console.log(error); 
    }
  }

}

export const disposicionesAdquiridasController = new DisposicionesAdquiridasController();
  