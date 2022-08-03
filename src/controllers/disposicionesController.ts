import {Request,Response} from 'express';
import pool from '../database';


class DisposicionesController
{

     
    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO disposiciones set ?", [req.body]);
        res.json(resp);
    }
    
    public async createDataComplete(req: Request, res: Response): Promise<void> {
        try {
            for (let index = 0; index < req.body.length; index++) {
                let idDisposicion;
                let disposicion = req.body[index][0];
                let costos = req.body[index][1];
                let incrementos = req.body[index][2];
                  
                const resp1 = await pool.query("INSERT INTO disposiciones set ?", disposicion);
                idDisposicion = resp1.insertId;
    
                for (let index2 = 0; index2 < costos.length; index2++) {
                    costos[index2].idDisposicion = idDisposicion;
                    const resp2 = await pool.query("INSERT INTO disposicionescostos set ?", costos[index2]);
                }
     
                for (let index3 = 0; index3 < incrementos.length; index3++) {
                    let dataIncremento = incrementos[index3];
                    dataIncremento[0].idActividad = idDisposicion;

                    const resp3 = await pool.query("INSERT INTO incrementos set ?", dataIncremento[0]);
                    let idIncremento = resp3.insertId;
    
                    for (let index4 = 0; index4 < dataIncremento[1].length; index4++) {
                        let detalleIncremento = dataIncremento[1][index4];
                        detalleIncremento.idIncremento = idIncremento;
                        console.log("incremento id de disposiciones", idIncremento);
                        if (dataIncremento[0].tipo == 1) {
                            //Incremento de horas
                            const resp4 = await pool.query("INSERT INTO incrementos_horas set ?", detalleIncremento);
                            console.log("INSERT INTO incrementos_horas set ?", detalleIncremento);
                        } else {
                            //Incremento de fechas
                            const resp4 = await pool.query("INSERT INTO incrementos_fechas set ?", detalleIncremento);
                            console.log("INSERT INTO incrementos_fechas set ?", detalleIncremento);
                        }
                        
                    }
                    
                }
                
            }
            res.json("Finalizado"); 
        } catch (error) {
            console.log(error);
        }
    }

    public async list (req : Request,res : Response) : Promise<void>
    {
        const { idCiudad } = req.params;     
        const divisas = await pool.query(`SELECT D.*, L.nombre FROM disposiciones D INNER JOIN lugares L ON D.idLugar=L.idLugar WHERE D.idCiudad = ${idCiudad}`);
        res.json(divisas);
    }

    public async listOne(req: Request, res: Response): Promise<void> {
        let { idDisposicion } = req.params;    
        console.log(`SELECT D.*, L.nombre FROM disposiciones D INNER JOIN lugares L ON D.idLugar=L.idLugar WHERE D.idDisposicion = ${idDisposicion}`);
        const resp = await pool.query(`SELECT D.*, L.nombre FROM disposiciones D INNER JOIN lugares L ON D.idLugar=L.idLugar WHERE D.idDisposicion = ${idDisposicion}`);
        res.json(resp[0]);
    }



    public async listByPais_vista (req : Request,res : Response) : Promise<void>
    {
        const { idPais, idCiudad } = req.params;     
        let respuesta;
        if (Number.parseInt(idCiudad) == -1) {
            respuesta=await pool.query(`SELECT P.nombre pais,C.nombre ciudad,L.nombre lugar,DI.divisa, D.* FROM disposiciones D INNER JOIN ciudad C ON D.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais =P.id INNER JOIN lugares L ON D.idLugar= L.idLugar INNER JOIN divisas DI ON D.idDivisa= DI.idDivisa WHERE C.idpais=${idPais} ORDER BY ciudad DESC`);
        } else {
            respuesta=await pool.query(`SELECT P.nombre pais,C.nombre ciudad,L.nombre lugar,DI.divisa, D.* FROM disposiciones D INNER JOIN ciudad C ON D.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais =P.id INNER JOIN lugares L ON D.idLugar= L.idLugar INNER JOIN divisas DI ON D.idDivisa= DI.idDivisa WHERE D.idCiudad=${idCiudad} ORDER BY ciudad DESC`);
        }
        
        res.json(respuesta);
    }
    
    public async listVehiculosByIdDisposicion (req : Request,res : Response) : Promise<void>
    {
        const { idDisposicion } = req.params;     
        const divisas = await pool.query(`SELECT V.* FROM disposicionescostos DC INNER JOIN vehiculo V ON DC.idVehiculo=V.idVehiculo WHERE DC.idDisposicion=${idDisposicion} `);
        res.json(divisas);
    }


    public async incrementoByDisposicionFecha (req : Request,res : Response) : Promise<void>
    { 
        let {id,fecha} = req.params;  
        console.log(id,fecha);
        const traslados = await pool.query(`SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechas FI ON I.idIncremento=FI.idIncremento WHERE idActividad=${id} AND tipoActividad=3 and tipo=2 AND '${fecha}' BETWEEN FI.fechaInicial AND FI.fechaFinal `);
        res.json(traslados);
    }


    public async incrementoByDisposicionFechaVariable (req : Request,res : Response) : Promise<void>
    { 
        let {id,fecha} = req.params;    
        const traslados = await pool.query(`SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechasvariables FI ON I.idIncremento=FI.idIncremento WHERE idActividad=${id} AND tipoActividad=3 and tipo=4 AND '${fecha}' BETWEEN FI.fechaInicial AND FI.fechaFinal `,[id,fecha]);
        res.json(traslados);
    }


    public async incrementoByDisposicionHora (req : Request,res : Response) : Promise<void>
    { 
        let {id,hora} = req.params;  
        const traslados = await pool.query('SELECT porcentaje FROM incrementos I INNER JOIN incrementos_horas HI ON I.idIncremento=HI.idIncremento WHERE idActividad=? AND tipoActividad=3 and tipo=1 AND ? BETWEEN HI.horaInicial AND HI.horaFinal ',[id,hora]);
        res.json(traslados);
    }


    public async actualizar(req: Request, res: Response): Promise<void> {
        const { idDisposicion } = req.params;
        const resp = await pool.query('UPDATE disposiciones SET ?  WHERE idDisposicion = ?', [req.body,idDisposicion]);
        res.json(resp);
    }
    
    public async delete(req: Request, res: Response): Promise<void> {
        const {  idDisposicion } = req.params;
        const resp = await pool.query('DELETE FROM disposiciones WHERE idDisposicion = ?', [idDisposicion]);
        const resp1 = await pool.query(`DELETE FROM incrementos WHERE idActividad = ${idDisposicion} AND tipoActividad=3`);
        res.json(resp);
    }
}
export const disposicionesController = new DisposicionesController();
