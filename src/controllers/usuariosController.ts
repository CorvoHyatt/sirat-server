import { Request, Response } from "express";

import pool from "../database";

class UsuariosController {

    public async list(req: Request, res: Response): Promise<void> {
        const respuesta = await pool.query(
          "SELECT * FROM usuarios"
        );
        res.json(respuesta);
    }

    public async list_porConfirmar(req: Request, res: Response): Promise<void> {
      const respuesta = await pool.query(
        "SELECT U.*, A.nombre nombreArea FROM usuariosporregistrar U INNER JOIN areas A ON U.idArea= A.idArea WHERE U.estatus = 1"
      );
      res.json(respuesta);
    }
  
    public async list_vista(req: Request, res: Response): Promise<void> {
      const respuesta = await pool.query(
        "SELECT U.*, A.nombre nombreArea FROM usuarios U INNER JOIN areas A ON U.idArea= A.idArea"
      );
      res.json(respuesta);
    }
    
    public async list_one(req: Request, res: Response): Promise<void> {
        const {id} =  req.params;
        const respuesta = await pool.query(`SELECT * FROM usuarios WHERE idUsuario = ${id} `);
        res.json( respuesta[0] );
    }
  
   
  
    
    public async list_oneByCorreo(req: Request, res: Response): Promise<void> {
      const {correo} =  req.params;
      const respuesta = await pool.query(`SELECT * FROM usuarios WHERE correo = '${correo}' `);
      res.json( respuesta[0] );
    }

    public async getUsuariosToTransfer(req: Request, res: Response): Promise<void> {
      const { idUsuario } =  req.params;
      const resp = await pool.query(`SELECT idUsuario, nombre FROM usuarios WHERE idUsuario != ${idUsuario} AND idArea != 2`);
      res.json(resp);
    }

    public async list_byIdArea(req: Request, res: Response): Promise<void> {
      const { idArea } = req.params;
      const respuesta = await pool.query(`SELECT * FROM usuarios WHERE idArea = ${idArea} `);
      res.json( respuesta );
    }
  
  public async update_estatusPorRegistrar(req: Request, res: Response): Promise<void> {
    try {
       console.log(req.body);
        const { estatus } = req.params;
        const respuesta = await pool.query(`UPDATE usuariosporregistrar SET estatus = ${estatus} WHERE correo = "${req.body.correo}";`);
        res.json( respuesta );
      } catch (error) {
        console.log(error);
      }
      
  }
  
  public async confirmarUsuario(req: Request, res: Response): Promise<void> {
    const {correo} =  req.params;
    const user = await pool.query(`SELECT * FROM usuariosporregistrar WHERE correo = "${correo}" `);
    delete user[0].estatus;
    const resp2 = await pool.query("INSERT INTO usuarios set ?", [user[0]]);
    const resp3 = await pool.query( "DELETE FROM usuariosporregistrar WHERE correo = ?", [correo]);
    console.log(user);
    res.json( user[0] );
}

 
}

export const usuariosController = new UsuariosController();
