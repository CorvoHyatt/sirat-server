import { Request, Response } from "express";

import pool from "../database";

class TrasladosAdquiridosController {
  
  public async create(req: Request, res: Response): Promise<void> {
    console.log(req.body);
    let trasladoAdquirido = req.body[0];
    let mejoras = req.body[1];

    const resp = await pool.query("INSERT INTO trasladosadquiridos set ?", [
      trasladoAdquirido
    ]);

    if (mejoras != null) {
      for (let index = 0; index < mejoras.length; index++) {
        mejoras[index].idTrasladoAdquirido = resp.insertId;
        const resp2 = await pool.query("INSERT INTO trasladoAdquiridoUpgrade set ?", mejoras[index]);
      }
    }
    

    res.json(resp);
  }

  public async listOne(req: Request, res: Response): Promise<void> {
    const { idTrasladoAdquirido } = req.params;
    console.log(`******`);
    console.log(idTrasladoAdquirido);
    console.log( `SELECT * FROM trasladosadquiridos WHERE idTrasladoAdquirido= ${idTrasladoAdquirido}`);
    const resp = await pool.query(
      `SELECT * FROM trasladosadquiridos WHERE idTrasladoAdquirido= ${idTrasladoAdquirido}`,
      
    );

    res.json(resp[0]);
  }

  public async insertInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      let precioComprado = req.body.precioComprado;
      let costoNeto = req.body.costoNeto; 

      delete req.body.precioComprado;
      delete req.body.costoNeto;


      const resp = await pool.query("INSERT INTO trasladosadquiridosinfo set ?", [req.body]);
      console.log("--------------",resp);

      if (req.body.tipo == 1) {
        const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idTrasladoAdquirido}, ${req.body.idCotizacion}, 1, ${precioComprado}, ${costoNeto}, 0, 0)`);
      } else {
        const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idTrasladoAdquirido}, ${req.body.idCotizacion}, 3, ${precioComprado}, ${costoNeto}, 0, 0)`);
      }
 
      res.json(resp);
    }catch (error) {
      console.log(error); 
    } 
  } 

  public async updateInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      const { idTrasladoAdquiridoInfo } = req.params;
      delete req.body.precioComprado;
      delete req.body.costoNeto;

      const resp = await pool.query(`UPDATE trasladosadquiridosinfo SET ? WHERE idTrasladoAdquiridoInfo = ${idTrasladoAdquiridoInfo}`, [req.body]);
      
      res.json(resp);
    }catch (error) {
      console.log(error); 
    }
  }
  
  public async getMejoras(req: Request, res: Response): Promise<void> {
    const { idTrasladoAdquirido } = req.params;
    try {
      const resp = await pool.query(
        `SELECT * FROM trasladoAdquiridoUpgrade WHERE idTrasladoAdquirido= ${idTrasladoAdquirido}`,
        
      ); 
      res.json(resp);

    } catch (error) {
      console.log(error);
    }
  }

  public async update(req: Request, res: Response): Promise<void> {
    try {
      const { idTrasladoAdquirido } = req.params;
     
    let trasladoAdquirido = req.body[0];
      let mejoras = req.body[1];
      let total = trasladoAdquirido.total;
      let idCotizacion = trasladoAdquirido.idCotizacion;
      delete  trasladoAdquirido.total;
      delete trasladoAdquirido.idCotizacion;
      
      console.log("total", total);
      console.log("idCotizacion", idCotizacion);

    const resp = await pool.query('UPDATE trasladosadquiridos SET ? WHERE idTrasladoAdquirido = ?', [trasladoAdquirido, idTrasladoAdquirido]);
    const respD = await pool.query('DELETE FROM trasladoAdquiridoUpgrade WHERE idTrasladoAdquirido = ?', [idTrasladoAdquirido]);

    if (mejoras != null) {
      for (let index = 0; index < mejoras.length; index++) {
        mejoras[index].idTrasladoAdquirido = idTrasladoAdquirido;
        const resp2 = await pool.query("INSERT INTO trasladoAdquiridoUpgrade set ?", mejoras[index]);
      }
    }
      
    const respU = await pool.query(`UPDATE productospreciostotales SET total = ${total} WHERE tipoProducto = 1 AND idCotizacion =${idCotizacion} AND idProducto= ${idTrasladoAdquirido}`, [idTrasladoAdquirido]);


    const { affectedRows } = resp;
    res.json({ affectedRows: affectedRows });
    } catch (error) {
      console.log(error);
    }

 }




}

export const trasladosAdquiridosController = new TrasladosAdquiridosController();
