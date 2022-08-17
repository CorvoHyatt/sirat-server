import { Request, Response } from "express";

import pool from "../database";

class ProductosTransporteAdquiridoController {
  public async create(req: Request, res: Response): Promise<void> {
      const { id } = req.params;
      const resp = await pool.query(`INSERT INTO productostransporteadquirido (idProductoAdquirido,idProductoTransporte) VALUES (${id}, ${req.body.idProductoTransporte	})`);
      res.json(resp);
  }


  public async create_list(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    for (let index = 0; index < req.body.length; index++) {
      
      await pool.query(
        `INSERT INTO productostransporteadquirido (idProductoAdquirido,idProductoTransporte) VALUES (${id}, ${req.body[index].idProductoTransporte	})`
      );
    }
    res.json({ msg: "creando productos transporte adquiridos" });
  }

  public async listByIdProductoAdquirido(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProductoAdquirido } = req.params;

    const respuesta = await pool.query(
      `SELECT PO.*, V.lujo FROM productostransporteadquirido POA INNER JOIN productostransporte PO ON POA.idProductoTransporte=PO.idProductoTransporte INNER JOIN vehiculo V ON PO.idVehiculo = V.idVehiculo WHERE idProductoAdquirido=${idProductoAdquirido}`
    );

    res.json(respuesta);
  }


}

export const productosTransporteAdquiridoController = new ProductosTransporteAdquiridoController();
