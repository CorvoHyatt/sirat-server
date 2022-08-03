import { Request, Response } from "express";
import pool from "../database";
import fs from 'fs';
import path from 'path';

class RentaVehiculosController {

  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO rentavehiculos set ?", [req.body]);
    res.json(resp);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { idRentaVehiculo } = req.params;
    const resp = await pool.query("UPDATE rentavehiculos SET ? WHERE idRentaVehiculo = ?", [req.body, idRentaVehiculo]);
    res.json(resp);
  }

  //MEJORAS

  public async createUpgrade(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO rentavehiculosupgrade set ?", [req.body]);
    res.json(resp);
  }

  public async getUpgrade(req: Request, res: Response): Promise<void> {
    const { idRentaVehiculo } = req.params;
    const resp = await pool.query("SELECT * FROM rentavehiculosupgrade WHERE idRentaVehiculo = ?", [idRentaVehiculo]);
    res.json(resp[0]);
  }

  public async updateUpgrade(req: Request, res: Response): Promise<void> {
    const { idRentaVehiculoUpgrade } = req.params;
    const resp = await pool.query("UPDATE rentavehiculosupgrade SET ? WHERE idRentaVehiculoUpgrade = ?", [req.body, idRentaVehiculoUpgrade]);
    res.json(resp);
  }

  public async deleteUpgrade(req: Request, res: Response): Promise<void> {
    const { idRentaVehiculoUpgrade, nombre } = req.params;
    try{
      await pool.query("DELETE FROM rentavehiculosupgrade WHERE idRentaVehiculoUpgrade = ?", [idRentaVehiculoUpgrade]);
      fs.unlink(`${path.join(__dirname, '../img/imagenesRentaVehiculos')}/${nombre}`, async(err) => {
        if(err){
            console.log(err);
            return res.status(404).send(err);
        }else{
          return res.status(200).send({message: 'Imagen eliminada'});
        }
      });
    }catch(err){
      console.log(err);
      res.status(500).send({message: 'Error al eliminar la imagen'});
    }
  }


  public async insertInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      let precioComprado = req.body.precioComprado;
      let costoNeto = req.body.costoNeto; 

      delete req.body.precioComprado;
      delete req.body.costoNeto;

      const resp = await pool.query("INSERT INTO rentaVehiculoInfo set ?", [req.body]);
      const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idRentaVehiculo}, ${req.body.idCotizacion}, 12, ${precioComprado},${costoNeto}, 0, 0)`);
 
      res.json(resp);
    }catch (error) {
      console.log(error); 
    } 
  } 

  public async updateInfoExtra(req: Request, res: Response): Promise<any> {
    try {
      const { idRentaVehiculoInfo } = req.params;
      delete req.body.precioComprado;
      delete req.body.costoNeto;

      const resp = await pool.query(`UPDATE rentaVehiculoInfo SET ? WHERE idRentaVehiculoInfo = ${idRentaVehiculoInfo}`, [req.body]);
      res.json(resp);
    }catch (error) {
      console.log(error); 
    }
  }

}

export const rentaVehiculosController = new RentaVehiculosController();
