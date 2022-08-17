import { Request, Response } from "express";

import pool from "../database";

class ComisionesAgentesController {

  public async listByIdAgenteTipoActividad(req: Request, res: Response): Promise<void> {
    const { idAgente, tipoActividad } = req.params;
    const respuesta = await pool.query(`SELECT comision FROM comisionesagentes WHERE idAgente = ${idAgente} and tipoActividad=${tipoActividad} `);
      if (respuesta[0] == undefined) {
          
        res.json(0);

      } else {
        
        res.json(respuesta[0].comision);

      }
  }
}


export const comisionesAgentesController = new ComisionesAgentesController();
