import {Request,Response} from 'express';
import pool from '../database';
class TrasladosController {

    //CREATE
    public async create(req: Request, res: Response): Promise<void> {
        let traslado = req.body[0];
        delete traslado.id;
        let costos = req.body[1];
        let idDivisa = req.body[2];
        let resp = await pool.query('INSERT INTO traslados set ?', [traslado]);
        let idTraslado = resp.insertId;

        for (let index = 0; index < costos.length; index++) {
            costos[index].idTraslado = idTraslado;
            costos[index].idDivisa = idDivisa;
            await pool.query(`INSERT INTO traslado_costos SET ?`, [costos[index]]);
        }
        
        res.json(idTraslado);
    }

    public async create_fromList(req: Request, res: Response): Promise<void> {
        for (let ii = 0; ii < req.body.length; ii++) {
            let traslado = req.body[ii][0];
            let costos = req.body[ii][1];
            let incrementos = req.body[ii][2]; 
            try {
            

            let resp = await pool.query('INSERT INTO traslados set ?', [traslado]);
            let idTraslado = resp.insertId;
    
            for (let index = 0; index < costos.length; index++) {
                costos[index].idTraslado = idTraslado;
                await pool.query(`INSERT INTO traslado_costos SET ?`, [costos[index]]);
            }
            
            for (let index3 = 0; index3 < incrementos.length; index3++) {
                let dataIncremento = incrementos[index3];
                dataIncremento[0].idActividad = idTraslado;

                const resp3 = await pool.query("INSERT INTO incrementos set ?", dataIncremento[0]);
                let idIncremento = resp3.insertId;
          
                for (let index4 = 0; index4 < dataIncremento[1].length; index4++) {
                    let detalleIncremento = dataIncremento[1][index4];
                    detalleIncremento.idIncremento = idIncremento;
                    if (dataIncremento[0].tipo == 1) {
                        //Incremento de horas
                        const resp4 = await pool.query("INSERT INTO incrementos_horas set ?", detalleIncremento);
                      } else {
                        //Incremento de fechas
                        const resp4 = await pool.query("INSERT INTO incrementos_fechas set ?", detalleIncremento);
                      }
                    
                }
                
            }
            } catch (error) {
                
        
                
                
                
        

        console.log(error);
        res.status(500).send({ error: error });
            }

            
        }
        
        res.json("Finalizado");
    }

     public async createIncrement(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO incrementos set ?", [req.body]);
        res.json(resp);
    }

    public async createIncrementByHour(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO incrementos_horas set ?", [req.body]);
        res.json(resp);
    }

    public async createIncrementByDate(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO incrementos_fechas set ?", [req.body]);
        res.json(resp);
    }

    public async listOne(req: Request, res: Response): Promise<void> {
        let { idTraslado } = req.params;    
        const resp = await pool.query("SELECT * FROM traslados WHERE idTraslado =?", [idTraslado]);
        res.json(resp[0]);
    }


    public async listDesdeOriginalDistinc(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("SELECT DISTINCT desdeOriginal FROM traslados ORDER BY `traslados`.`desdeOriginal` ASC");
        res.json(resp);
        
    } 

    public async listHaciaOriginalDistinc(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("SELECT DISTINCT haciaOriginal FROM traslados ORDER BY `traslados`.`haciaOriginal` ASC");
        res.json(resp);
    }


    //Retorna un listado de traslados
    public async listTransfers(req: Request, res: Response): Promise<any> {
        const trasladosByIncrementoHoras = await pool.query(`
            SELECT t.*, c.nombre AS ciudad, c.idPais, l1.nombre AS desde, l2.nombre AS hacia, i.*, ih.horaInicial AS inicial, ih.horaFinal AS final
            FROM traslados t
            INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
            INNER JOIN lugares l1 ON t.idDesde = l1.idLugar
            INNER JOIN lugares l2 ON t.idHacia = l2.idLugar
            INNER JOIN incrementos i ON t.idTraslado = i.idActividad
            INNER JOIN incrementos_horas ih ON i.idIncremento = ih.idIncremento
            WHERE i.tipoActividad = 2
        `);
        const trasladosByIncrementoFechas = await pool.query(`
            SELECT t.*, c.nombre AS ciudad, c.idPais, l1.nombre AS desde, l2.nombre AS hacia, i.*, ife.fechaInicial AS inicial, ife.fechaFinal AS final
            FROM traslados t
            INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
            INNER JOIN lugares l1 ON t.idDesde = l1.idLugar
            INNER JOIN lugares l2 ON t.idHacia = l2.idLugar
            INNER JOIN incrementos i ON t.idTraslado = i.idActividad
            INNER JOIN incrementos_fechas ife ON i.idIncremento = ife.idIncremento
            WHERE i.tipoActividad = 2
        `);

        let traslados = trasladosByIncrementoHoras.concat(trasladosByIncrementoFechas);

        res.json(traslados);
    }
    //Retorna un listado de costos por traslado
    public async listCostsByTransfer(req: Request, res: Response): Promise<any> {
        const { id } = req.params;
        const costos = await pool.query(`
            SELECT tc.*, v.nombre AS vehiculo, d.divisa
            FROM traslado_costos tc
            INNER JOIN divisas d ON tc.idDivisa = d.idDivisa
            INNER JOIN vehiculo v ON tc.idVehiculo = v.idVehiculo
            INNER JOIN incrementos i ON tc.idTraslado = i.idActividad
            WHERE tc.idTraslado = ? AND i.tipoActividad = 2
        `, [id]);

        res.json(costos);
    }

    // Devuelve el costo mínimo de un traslado determinado con capacidad de n personas
    public async listMinByTraslado (req : Request,res : Response) : Promise<void>
    { 
        let {id,personas} = req.params;    
//        const traslados = await pool.query('SELECT  T.idTraslado, MIN(costo*D.valor*(1+T.comision/100)) AS costoMinimo , L1.idLugar as idDesde, L1.nombre as nombreDesde, L2.idLugar as idHacia, L2.nombre as nombreHacia, T.cancelaciones, T.muelle, T.comision  FROM vehiculo V INNER JOIN costoTraslado CT ON V.idVehiculo=CT.idVehiculo INNER JOIN traslados T ON CT.idTraslado=T.idTraslado INNER JOIN lugares L1 ON T.idDesde=L1.idLugar INNER JOIN lugares L2 ON T.idHacia=L2.idLugar INNER JOIN divisas D ON CT.idDivisa=D.idDivisa  WHERE CT.idTraslado=? AND V.idVehiculo IN (SELECT idVehiculo FROM costoTraslado WHERE idTraslado=?) and V.pasajerosMax >=?',[id,id,personas]);        
        const traslados = await pool.query('SELECT  T.idTraslado, MIN(costo*D.valor) AS costoMinimo , L1.idLugar as idDesde, L1.nombre as nombreDesde, L2.idLugar as idHacia, L2.nombre as nombreHacia, T.cancelaciones, T.muelle, T.comision  FROM vehiculo V INNER JOIN costoTraslado CT ON V.idVehiculo=CT.idVehiculo INNER JOIN traslados T ON CT.idTraslado=T.idTraslado INNER JOIN lugares L1 ON T.idDesde=L1.idLugar INNER JOIN lugares L2 ON T.idHacia=L2.idLugar INNER JOIN divisas D ON CT.idDivisa=D.idDivisa  WHERE CT.idTraslado=? AND V.idVehiculo IN (SELECT idVehiculo FROM costoTraslado WHERE idTraslado=?) and V.pasajerosMax >=?',[id,id,personas]);        
        let cadena = 'SELECT  T.idTraslado, MIN(costo*D.valor) AS costoMinimo , L1.idLugar as idDesde, L1.nombre as nombreDesde, L2.idLugar as idHacia, L2.nombre as nombreHacia, T.cancelaciones, T.muelle, T.comision  FROM vehiculo V INNER JOIN costoTraslado CT ON V.idVehiculo=CT.idVehiculo INNER JOIN traslados T ON CT.idTraslado=T.idTraslado INNER JOIN lugares L1 ON T.idDesde=L1.idLugar INNER JOIN lugares L2 ON T.idHacia=L2.idLugar INNER JOIN divisas D ON CT.idDivisa=D.idDivisa  WHERE CT.idTraslado='+id+' AND V.idVehiculo IN (SELECT idVehiculo FROM costoTraslado WHERE idTraslado='+id+') and V.pasajerosMax >='+personas;
        res.json(traslados);
    }
    //Devuelve todos los costos de un traslado mínimo con capacidad de n personas
    public async listVehiculosByTraslado (req : Request,res : Response) : Promise<void>
    { 
        let {id,personas} = req.params;    
//        const traslados = await pool.query('SELECT  T.idTraslado, V.idVehiculo, CT.idDivisa, costo*(1+T.comision/100) AS costoMinimo , V.nombre, V.pasajerosMax, V.maletasMax, T.comision  FROM vehiculo V INNER JOIN costoTraslado CT ON V.idVehiculo=CT.idVehiculo INNER JOIN traslados T ON CT.idTraslado=T.idTraslado   WHERE CT.idTraslado=? AND V.idVehiculo IN (SELECT idVehiculo FROM costoTraslado WHERE idTraslado=?) and V.pasajerosMax >=?',[id,id,personas]);
        const traslados = await pool.query('SELECT  T.idTraslado, V.idVehiculo, CT.idDivisa, costo AS costoMinimo , V.nombre, V.pasajerosMax, V.maletasMax, T.comision  FROM vehiculo V INNER JOIN costoTraslado CT ON V.idVehiculo=CT.idVehiculo INNER JOIN traslados T ON CT.idTraslado=T.idTraslado   WHERE CT.idTraslado=? AND V.idVehiculo IN (SELECT idVehiculo FROM costoTraslado WHERE idTraslado=?) and V.pasajerosMax >=?',[id,id,personas]);
        res.json(traslados);
    }
    public async listbyIdVehiculos (req : Request,res : Response) : Promise<void>
    { 
        let { id } = req.params;    
        const traslados = await pool.query('SELECT V.* FROM traslado_costos CT INNER JOIN vehiculo V ON CT.idVehiculo=V.idVehiculo WHERE CT.idTraslado=?',[id]);
        res.json(traslados);
    }
    public async listbyCiudadFullDatos (req : Request,res : Response) : Promise<void>
    { 
        let {id} = req.params;    
        const traslados = await pool.query('SELECT  T.idTraslado, L1.nombre as nombreDesde, L2.nombre as nombreHacia FROM traslados T  INNER JOIN lugares L1 ON T.idDesde=L1.idLugar INNER JOIN lugares L2 ON T.idHacia=L2.idLugar WHERE  T.idTraslado=?',[id]);
        res.json(traslados[0]);
    }
    public async listbyCiudad (req : Request,res : Response) : Promise<void>
    { 
        let {id} = req.params;    
        const traslados = await pool.query('SELECT  * FROM traslados WHERE idCiudad=?',[id]);
        res.json(traslados);
    }
    public async listbyIdTraslado (req : Request,res : Response) : Promise<void>
    { 
        let {id} = req.params;    
        const traslados = await pool.query('SELECT * FROM traslado_costos CT INNER JOIN vehiculo V ON CT.idVehiculo=V.idVehiculo WHERE CT.idTraslado=?',[id]);
        res.json(traslados);
    }

    public async listTrasladoByCiudadidDesde (req : Request,res : Response) : Promise<void>
    { 
        let {id} = req.params;            
        const traslados = await pool.query('SELECT DISTINCT idDesde , L.nombre, T.desdeOriginal FROM traslados T INNER JOIN lugares L on T.idDesde=L.idLugar WHERE  T.otraCiudad=0 AND T.idCiudad=?',[id]);
        
        res.json(traslados);

    }


    public async listByPais_vista (req : Request,res : Response) : Promise<void>
    {
        const { idPais, idCiudad } = req.params;     
        let respuesta;
        if (Number.parseInt(idCiudad) == -1) {
            respuesta=await pool.query(`SELECT P.nombre pais, C.nombre ciudad, L1.nombre desde, L2.nombre hacia, T.* FROM traslados T INNER JOIN ciudad C ON T.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais= P.id INNER JOIN lugares L1 ON T.idDesde = L1.idLugar INNER JOIN lugares L2 ON T.idHacia = L2.idLugar WHERE C.idpais = ${idPais} ORDER BY ciudad DESC`);
        } else {
            respuesta=await pool.query(`SELECT P.nombre pais, C.nombre ciudad, L1.nombre desde, L2.nombre hacia, T.* FROM traslados T INNER JOIN ciudad C ON T.idCiudad = C.idCiudad INNER JOIN pais P ON C.idpais= P.id INNER JOIN lugares L1 ON T.idDesde = L1.idLugar INNER JOIN lugares L2 ON T.idHacia = L2.idLugar WHERE C.idCiudad = ${idCiudad} ORDER BY ciudad DESC`);
        }
        
        res.json(respuesta);
    }


    public async incrementoByTrasladoFecha (req : Request,res : Response) : Promise<void>
    { 
        let {id,fecha} = req.params;  
        const traslados = await pool.query(`SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechas FI ON I.idIncremento=FI.idIncremento WHERE idActividad=${id} AND tipoActividad=2 and tipo=2 AND '${fecha}'  BETWEEN FI.fechaInicial AND FI.fechaFinal`);
        res.json(traslados);
    }
    public async incrementoByTrasladoFechaVariable (req : Request,res : Response) : Promise<void>
    { 
        let {id,fecha} = req.params;    
        const traslados = await pool.query(`SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechasvariables FI ON I.idIncremento=FI.idIncremento WHERE idActividad=${id} AND tipoActividad=2 and tipo=4 AND '${fecha}' BETWEEN FI.fechaInicial AND FI.fechaFinal `);
        res.json(traslados);
    }
    public async incrementoByTrasladoHora (req : Request,res : Response) : Promise<void>
    { 
        try {
            let {id,hora} = req.params;  
            const traslados = await pool.query('SELECT porcentaje FROM incrementos I INNER JOIN incrementos_horas HI ON I.idIncremento=HI.idIncremento WHERE idActividad=? AND tipoActividad=2 and tipo=1 AND ? BETWEEN HI.horaInicial AND HI.horaFinal ',[id,hora]);
            res.json(traslados);
        } catch (error) {
            
        }
       
    }
    public async listTrasladoByCiudadidDesdeCiudad (req : Request,res : Response) : Promise<void>
    { 
        let {id} = req.params;    
        const traslados = await pool.query('SELECT DISTINCT idDesde , L.nombre FROM traslados T INNER JOIN lugares L on T.idDesde=L.idLugar WHERE  T.otraCiudad=1 AND T.idCiudad=?',[id]);
        res.json(traslados);
    }
    public async listTrasladoByCiudadidHacia (req : Request,res : Response) : Promise<void>
    { 
        let {id,desde} = req.params; 
        
        const traslados = await pool.query('SELECT  idHacia , L.nombre, T.haciaOriginal FROM traslados T INNER JOIN lugares L on T.idHacia=L.idLugar WHERE T.otraCiudad=0 AND T.idCiudad=? AND T.idDesde=?',[id,desde]);
        res.json(traslados);
    }
    public async listTrasladoByCiudadidHaciaCiudad (req : Request,res : Response) : Promise<void>
    { 
        let {id,desde} = req.params;  
        const traslados = await pool.query('SELECT  idHacia , L.nombre FROM traslados T INNER JOIN lugares L on T.idHacia=L.idLugar WHERE T.otraCiudad=1 AND T.idCiudad=? AND T.idDesde=?',[id,desde]);
        res.json(traslados);
    }
    public async getTrasladoByDesdeHacia (req : Request,res : Response) : Promise<void>
    { 
        let {desde,hacia, idCiudad} = req.params;    
        const traslados = await pool.query('SELECT  * FROM traslados WHERE idDesde=? AND idHacia=? and idCiudad=?',[desde,hacia,idCiudad]);
        let cadena = 'SELECT idTraslado FROM traslados WHERE idDesde='+desde+' AND idHacia='+hacia;
        res.json(traslados);
    }

    public async update(req: Request, res: Response): Promise<void> {
         
        let traslado = req.body[0];
        let costos = req.body[1];
        let idDivisa = req.body[2];
        delete traslado.pais;
        delete traslado.ciudad;
        delete traslado.desde;
        delete traslado.hacia;

        const resp1 = await pool.query('UPDATE traslados SET ?  WHERE idTraslado = ?', [traslado, traslado.idTraslado]);
        
        if (costos.length == 0) {
            const resp2 = await pool.query('DELETE FROM traslado_costos WHERE idTraslado= ?',  traslado.idTraslado);
        }

        for (let index = 0; index < costos.length; index++) {
            costos[index].idDivisa = idDivisa;
            delete costos[index].vehiculo;
            delete costos[index].divisa;
            await pool.query(`UPDATE traslado_costos SET ?  WHERE idTrasladoCosto = ?`, [costos[index], costos[index].idTrasladoCosto]);
        }

        res.json("Actualizado");
    }

    public async updateIncremento(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        const { body } = req;
        const resp = await pool.query('UPDATE incrementos SET ?  WHERE idIncremento = ?', [body, id]);
        res.json(resp);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        // const {  idTraslado, idIncremento, tipo } = req.params;
        // switch(parseInt(tipo)){
        //     case 1:
        //         await pool.query('DELETE FROM incrementos_horas WHERE idIncremento = ?', [idIncremento]);
        //         break;
        //     case 2:
        //         await pool.query('DELETE FROM incrementos_fechas WHERE idIncremento = ?', [idIncremento]);
        //         break;
        // }
        // await pool.query('DELETE FROM incrementos WHERE idIncremento = ?', [idIncremento]);
        // await pool.query('DELETE FROM traslado_costos WHERE idTraslado = ?', [idTraslado]);
        // const resp = await pool.query('DELETE FROM traslados WHERE idTraslado = ?', [idTraslado]);
        // res.json(resp);
        const {  idTraslado } = req.params;
        const resp = await pool.query('DELETE FROM traslados WHERE idTraslado = ?', [idTraslado]);
        const resp1 = await pool.query(`DELETE FROM incrementos WHERE idActividad = ${idTraslado} AND tipoActividad=2`);
        res.json(resp);
    }

    
}

export const trasladosController = new TrasladosController();