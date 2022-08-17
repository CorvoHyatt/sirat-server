import { Request, Response } from "express";

import pool from "../database";

class ProductosAdquiridosController {
  public async create(req: Request, res: Response): Promise<void> {
    let productoAdquirido = req.body[0].productoAdquirido;
    let opcionesAdquiridas = req.body[0].productoOpcionesAdquirido;
    let productoTransporte = req.body[0].productoTransporte;
    let mejoras = req.body[0].mejoras;
    let mejorasTransportes = req.body[0].mejorasTransportes;

    const respPA = await pool.query("INSERT INTO productosadquiridos set ?", [productoAdquirido]);
    if (opcionesAdquiridas != undefined) {
      for (let index = 0; index < opcionesAdquiridas.length; index++) {
        await pool.query(
          `INSERT INTO productosopcionesadquiridos (idProductoAdquirido,idProductoOpcion) VALUES (${respPA.insertId}, ${opcionesAdquiridas[index].idProductoOpcion})`
        );
      }
    }
    if (productoTransporte != undefined) {
      
      const resp = await pool.query(`INSERT INTO productostransporteadquirido (idProductoAdquirido,idProductoTransporte) VALUES (${respPA.insertId}, ${productoTransporte.idProductoTransporte	})`);
    }
    
    if (mejoras != undefined) {
      for (let index = 0; index < mejoras.length; index++) {
        mejoras[index].idProductoAdquirido = respPA.insertId;
        const respM = await pool.query("INSERT INTO productosOpcionesAdquiridasUpgrade set ?", [mejoras[index]]);

      }
    }

    if (mejorasTransportes != undefined) {
      for (let index = 0; index < mejorasTransportes.length; index++) {
        mejorasTransportes[index].idProductoAdquirido = respPA.insertId;
        const respM = await pool.query("INSERT INTO productosTransportesUpgrade set ?", [mejorasTransportes[index]]);

      }
    }

    res.json(respPA);
  }

  public async listOne(req: Request, res: Response): Promise<void> {
    const { idProductoAdquirido } = req.params;
    // 
    // 
    // 
    const resp = await pool.query(
      `SELECT * FROM productosadquiridos WHERE idProductoAdquirido= ${idProductoAdquirido}`,
    );
    res.json(resp[0]);
  }


  public async update(req: Request, res: Response): Promise<void> {

    try {
      const { idProductoAdquirido } = req.params;
      let productoAdquirido = req.body[0].productoAdquirido;
      let opcionesAdquiridas = req.body[0].productoOpcionesAdquirido;
      let productoTransporte = req.body[0].productoTransporte;
      let mejoras = req.body[0].mejoras;
      let mejorasTransportes = req.body[0].mejorasTransportes;
      
      let total = productoAdquirido.total;
      let idCotizacion = productoAdquirido.idCotizacion;
      let precioPorPersona = productoAdquirido.precioPorPersona;

      delete  productoAdquirido.total;
      delete productoAdquirido.idCotizacion;
      delete productoAdquirido.precioPorPersona;

      
      const resp1 = await pool.query('UPDATE productosadquiridos SET ? WHERE idProductoAdquirido = ?', [productoAdquirido, idProductoAdquirido]);
      const resp2 = await pool.query('DELETE FROM productosopcionesadquiridos WHERE idProductoAdquirido = ?', [idProductoAdquirido]);
 

      if (opcionesAdquiridas != undefined) {
        for (let index = 0; index < opcionesAdquiridas.length; index++) {
          await pool.query(
            `INSERT INTO productosopcionesadquiridos (idProductoAdquirido,idProductoOpcion) VALUES (${idProductoAdquirido}, ${opcionesAdquiridas[index].idProductoOpcion})`
          );
        }
      }

      const resp3 = await pool.query('DELETE FROM productostransporteadquirido WHERE idProductoAdquirido = ?', [idProductoAdquirido]);
      
      if (productoTransporte != undefined) {
        
        const resp = await pool.query(`INSERT INTO productostransporteadquirido (idProductoAdquirido,idProductoTransporte) VALUES (${idProductoAdquirido}, ${productoTransporte.idProductoTransporte	})`);
      }
       

      const resp4 = await pool.query('DELETE FROM productosOpcionesAdquiridasUpgrade WHERE idProductoAdquirido = ?', [idProductoAdquirido]);

      if (mejoras != undefined) {
        for (let index = 0; index < mejoras.length; index++) {
          mejoras[index].idProductoAdquirido = idProductoAdquirido;
          const respM = await pool.query("INSERT INTO productosOpcionesAdquiridasUpgrade set ?", [mejoras[index]]);
  
        }
      }

      const resp5 = await pool.query('DELETE FROM productosTransportesUpgrade WHERE idProductoAdquirido = ?', [idProductoAdquirido]);

  
      if (mejorasTransportes != undefined) {
        for (let index = 0; index < mejorasTransportes.length; index++) {
          mejorasTransportes[index].idProductoAdquirido = idProductoAdquirido;
          const respM = await pool.query("INSERT INTO productosTransportesUpgrade set ?", [mejorasTransportes[index]]);
  
        }
      }
  
      const respU = await pool.query(`UPDATE productospreciostotales SET total = ${total}, precioPorPersona =  ${precioPorPersona} WHERE tipoProducto = 7 AND idCotizacion =${idCotizacion} AND idProducto= ${idProductoAdquirido}`);

      res.json(respU);
    } catch (error) {
      console.log(error);
    }


   
  }


  public async getOpcionesAdquiridas(req: Request, res: Response): Promise<void> {
    const { idProductoAdquirido } = req.params;
    try {
      
      const resp = await pool.query(
        `SELECT PO.* FROM productosopcionesadquiridos POA INNER JOIN productosopciones PO ON POA.idProductoOpcion = PO.idProductoOpcion WHERE idProductoAdquirido = ${idProductoAdquirido}`,
      );
      res.json(resp);
    } catch (error) {
      console.log(error);
    } 
  }


  public async getTransporteAdquirido(req: Request, res: Response): Promise<void> {
    const { idProductoAdquirido } = req.params;
    try {
      const resp = await pool.query(
        `SELECT PT.*, V.nombre, V.lujo FROM productostransporteadquirido PTA INNER JOIN productostransporte PT ON PTA.idProductoTransporte = PT.idProductoTransporte INNER JOIN vehiculo V ON PT.idVehiculo = V.idVehiculo  WHERE idProductoAdquirido= ${idProductoAdquirido}`,
      );
      res.json(resp);
    } catch (error) {
      console.log(error);
    }
  } 
  
  public async getMejorasOpciones(req: Request, res: Response): Promise<void> {
    const { idProductoAdquirido } = req.params;
    try {
      const resp = await pool.query(
        `SELECT * FROM productosOpcionesAdquiridasUpgrade WHERE idProductoAdquirido= ${idProductoAdquirido}`,
      );
      res.json(resp);
    } catch (error) {
      console.log(error);
    }
  }

  public async getMejorasTransporte(req: Request, res: Response): Promise<void> {
    const { idProductoAdquirido } = req.params;
    try {
      const resp = await pool.query(
        `SELECT * FROM productosTransportesUpgrade WHERE idProductoAdquirido= ${idProductoAdquirido}`,
      );
      res.json(resp);
    } catch (error) {
      console.log(error);
    }
  }

  public async insertInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      let precioComprado = req.body.precioComprado;
      let costoNeto = req.body.costoNeto; 

      delete req.body.precioComprado;
      delete req.body.titulo;
      delete req.body.costoNeto;


      const resp = await pool.query("INSERT INTO productosAdquiridosInfo set ?", [req.body]);
      const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idProductoAdquirido}, ${req.body.idCotizacion}, 7, ${precioComprado}, ${costoNeto}, 0, 0)`);

      res.json(resp);
    }catch (error) {
      console.log(error); 
    }
  } 

  public async updateInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      const { idProductosAdquiridosInfo } = req.params;
      delete req.body.precioComprado;
      delete req.body.titulo;
      delete req.body.costoNeto;

      const resp = await pool.query(`UPDATE productosAdquiridosInfo SET ? WHERE idProductosAdquiridosInfo = ${idProductosAdquiridosInfo}`, [req.body]);
      res.json(resp);
    }catch (error) {
      console.log(error); 
    }
  }
  
}

export const productosAdquiridosController = new ProductosAdquiridosController();
