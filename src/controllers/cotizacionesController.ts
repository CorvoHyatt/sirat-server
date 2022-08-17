import { Request, Response } from "express";
import pool from "../database";
import Pusher from 'pusher';
import moment from 'moment';

class CotizacionesController {

  public async dameAsesor(req: Request, res: Response): Promise<void> 
  {
          const {idUsuario} =  req.params;
          const respuesta = await pool.query(`SELECT nombre FROM usuarios WHERE idUsuario = ${idUsuario} `);
          res.json( respuesta[0]);
  }

  public async updateEstadoAEnviado(req: Request, res: Response): Promise<void> {
    const { idCotizacion,estado } = req.params;   
    
    const resp = await pool.query(`UPDATE cotizaciones SET estado=${estado} WHERE idCotizacion=${idCotizacion}`);
    const { affectedRows } = resp;
    res.json({ affectedRows: affectedRows });
  }


  public async listImagenesCiudadesPortada(req: Request, res: Response): Promise<void> 
  {
    const {id} =  req.params;
    let consulta=`SELECT CONCAT(C.idCiudad, '_', CI.num) AS id, C.idCiudad,C.nombre,CI.num FROM ciudadImagenes CI 
    INNER JOIN ciudad C ON CI.idCiudad=C.idCiudad
    WHERE CI.idCiudad IN (SELECT DISTINCT CD.idCiudad FROM cotizaciones_destinos CD WHERE idCotizacion=${id}) AND tipo=1`;
    
    const respuesta = await pool.query(consulta);
    res.json( respuesta);
  }    
  public async listImagenesCiudadesDaybyday(req: Request, res: Response): Promise<void> 
  {
    const {id} =  req.params;
    let consulta=`SELECT CONCAT(C.idCiudad, '_', CI.num) AS id, C.idCiudad,C.nombre,CI.num FROM ciudadImagenes CI 
    INNER JOIN ciudad C ON CI.idCiudad=C.idCiudad
    WHERE CI.idCiudad IN (SELECT DISTINCT CD.idCiudad FROM cotizaciones_destinos CD WHERE idCotizacion=${id}) AND tipo=3`;
    
    const respuesta = await pool.query(consulta);
    res.json( respuesta);
  }    
  public async listImagenesCiudadesEvento(req: Request, res: Response): Promise<void> 
  {
    const {id} =  req.params;
    let consulta=`SELECT CONCAT(C.idCiudad, '_', CI.num) AS id, C.idCiudad,C.nombre,CI.num FROM ciudadImagenes CI 
    INNER JOIN ciudad C ON CI.idCiudad=C.idCiudad
    WHERE CI.idCiudad IN (SELECT DISTINCT CD.idCiudad FROM cotizaciones_destinos CD WHERE idCotizacion=${id}) AND tipo=2`;
    
    const respuesta = await pool.query(consulta);
    res.json( respuesta);
  }    
  public async delete(req: Request, res: Response): Promise<void> 
  {
          const { idCotizacion } = req.params;
          const respuesta = await pool.query("DELETE FROM itinerarioAuxiliar WHERE idCotizacion = ?",idCotizacion);
          res.json(respuesta);
  }
  public async updateAuxiliar(req: Request, res: Response): Promise<void> 
  {
    const { id } = req.params;
    const resp = await pool.query("UPDATE cotizacionAuxiliar SET ? WHERE idCotizacion = ?",[req.body, id]);
    const { affectedRows } = resp;
    res.json({ affectedRows: affectedRows });
  }
  public async createAuxiliar(req: Request, res: Response): Promise<void> 
  {
    const resp = await pool.query('INSERT INTO cotizacionAuxiliar set ?', [req.body]);
    res.json(resp);
  }
  public async createItinerario(req: Request, res: Response): Promise<void> 
  {
          var sql = "INSERT INTO itinerarioAuxiliar (idCotizacion,id,tipo,fecha,lugar,texto,hojaNuevaItinerario,visible,orden,descripcion,hojaNueva) VALUES ?";
          
          
          const resp = await pool.query(sql, [req.body]);
          res.json(resp);
  }        
  public async existeItinerarioAuxiliar(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
          const respuesta = await pool.query(`SELECT * FROM itinerarioAuxiliar WHERE idCotizacion = ${id} `);
          res.json( respuesta);
  }
  public async existeAuxiliar(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
          let existeConsulta=`SELECT * FROM cotizacionAuxiliar WHERE idCotizacion = ${id} `;
          const respuesta = await pool.query(existeConsulta);
          res.json( respuesta[0] );
  }
  public async list_oneCompleta(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
        let resumen=`SELECT * 
        FROM cotizaciones C 
        WHERE idCotizacion = ${id} `;
          const respuesta = await pool.query(resumen);
          res.json( respuesta[0] );
          //SELECT C.*, A.*,AGS.* FROM cotizaciones C INNER JOIN agentes A ON C.idAgente=A.idAgente INNER JOIN agencias AGS ON A.idAgencia= AGS.idAgencia WHERE idCotizacion = 949

  }
  public async list_oneResumen(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
        let resumen=`SELECT C.*, A.idAgente as idAgente,A.correo as correoAgente, A.nombre as nombreAgente, A.apellidos as apellidosAgente,AGS.idAgencia as idAgencia, AGS.nombre as nombreAgencia,C.divisa 
        FROM cotizaciones C 
        INNER JOIN agentes A ON C.idAgente=A.idAgente 
        INNER JOIN agencias AGS ON A.idAgencia= AGS.idAgencia 
        WHERE idCotizacion = ${id} `;
        
          const respuesta = await pool.query(resumen);
          res.json( respuesta[0] );
          //SELECT C.*, A.*,AGS.* FROM cotizaciones C INNER JOIN agentes A ON C.idAgente=A.idAgente INNER JOIN agencias AGS ON A.idAgencia= AGS.idAgencia WHERE idCotizacion = 949

  }
  public async list_ciudades(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
          //const respuesta = await pool.query(`SELECT * FROM cotizaciones WHERE idCotizacion = ${id} `);
          const respuesta = await pool.query(`SELECT DISTINCT nombre, C.idCiudad as id FROM cotizaciones_destinos CD INNER JOIN ciudad C ON CD.idCiudad=C.idCiudad WHERE idCotizacion= ${id} `);

          res.json( respuesta);
  }        

  public async list_paises(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
          //const respuesta = await pool.query(`SELECT * FROM cotizaciones WHERE idCotizacion = ${id} `);
          const respuesta = await pool.query(`SELECT DISTINCT P.nombre FROM cotizaciones_destinos CD INNER JOIN ciudad C ON CD.idCiudad=C.idCiudad INNER JOIN pais P ON C.idpais=P.id WHERE idCotizacion= ${id} `);

          res.json( respuesta);
  }        
  public async list_continentes(req: Request, res: Response): Promise<void> 
  {
          const {id} =  req.params;
          //const respuesta = await pool.query(`SELECT * FROM cotizaciones WHERE idCotizacion = ${id} `);
          const respuesta = await pool.query(`SELECT DISTINCT CS.nombre FROM cotizaciones_destinos CD INNER JOIN ciudad C ON CD.idCiudad=C.idCiudad INNER JOIN pais P ON C.idpais=P.id INNER JOIN continentes CS ON P.idContinente=CS.idContinente WHERE idCotizacion= ${id} `);

          res.json( respuesta);
  } 


  
  public async create(req: Request, res: Response): Promise<void> {

    const resp = await pool.query("INSERT INTO cotizaciones set ?", [req.body]);
    res.json(resp);
  }

  public async createNewVersionCotizacion(req: Request, res: Response): Promise<void> {
    delete req.body.idDivisaBase;
    delete req.body.idAgencia;
    const actualCotizacion = await pool.query('SELECT * FROM cotizaciones WHERE idCotizacion = ?', [req.body.idCotizacion]);
    await pool.query('INSERT INTO cotizacioneshistory SET ?', [actualCotizacion[0]]);
    delete req.body.createdAt;
    await pool.query('UPDATE cotizaciones SET ? WHERE idCotizacion = ?', [req.body, req.body.idCotizacion]);
    const cotizacion = await pool.query('SELECT * FROM cotizaciones WHERE idCotizacion = ?', [req.body.idCotizacion]);
    res.json(cotizacion[0]);
  }

  public async createNota(req: Request, res: Response): Promise<void> {
    var pusher: any = new Pusher({
      appId: "1217136",
      key: "f7e8a37d1ad14888fa5d",
      secret: "de0c01d76c3776a1de05",
      cluster: "us2"
    });
    let notificacion: any = {
      idNotificacion: 0,
      emisor: req.body.idUsuario,
      receptor: ``,
      asunto: req.body.asunto,
      data: {"tarea":req.body.nota},
      tipo: 1,
      prioridad: req.body.prioridad,
      caducidad: req.body.caducidad,
      estatus: 0
    }
    notificacion.data = JSON.stringify(notificacion.data);
    delete req.body.prioridad;
    delete req.body.caducidad;
    const resp = await pool.query("INSERT INTO notascotizaciones set ?", [req.body]);
    const nota = await pool.query(`
    SELECT nc.*, u.nombre AS usuario, c.ref, c.idUsuario AS id
    FROM notascotizaciones nc
    INNER JOIN usuarios u ON nc.idUsuario = u.idUsuario
    INNER JOIN cotizaciones c ON nc.idCotizacion = c.idCotizacion
    WHERE idNota = ?`, [resp.insertId]);
    
    // if(nota){
    //   pusher.trigger(`channel-notification-${nota[0].id}`, `new-notification-${nota[0].id}`, {
    //     nota: nota[0]
    //   });
  
    // }

    notificacion.receptor = nota[0].id;
    notificacion.caducidad = moment().add(notificacion.caducidad, 'd').toDate();
    const nuevaNotificacion = await pool.query(`INSERT INTO notificaciones set ?`, notificacion);
    notificacion.idNotificacion = nuevaNotificacion.insertIdl;
    pusher.trigger(`channel-notification-${notificacion.receptor}`, `new-notification-${notificacion.receptor}`, {
          notificacion
    });

    res.json(nota);
  }

  public async createVersion(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO versionescotizaciones set ?", [req.body]);
    res.json(resp);
  }

  public async list_one(req: Request, res: Response): Promise<void> {
    const {id} =  req.params;
    const respuesta = await pool.query(`
    SELECT c.*, ags.nombre AS agencia
    FROM cotizaciones c
    INNER JOIN agentes ag ON ag.idAgente = c.idAgente
    INNER JOIN agencias ags ON ags.idAgencia = ag.idAgencia
    WHERE idCotizacion = ${id}
    `);
    res.json( respuesta[0] );
  }

  public async listOneOC(req: Request, res: Response): Promise<void> {
    const { id } =  req.params;
    const respuesta = await pool.query(`
    SELECT c.*, (c.numM + c.num18 + c.num12) AS personas, CONCAT(a.nombre, ' ', a.apellidos) AS agente, ag.*, oc.totalOC, db.divisa AS nombreDivisa
    FROM cotizaciones c
    INNER JOIN ordencompra oc ON c.idCotizacion = oc.idCotizacion
    INNER JOIN divisasbase db ON c.divisa = db.idDivisaBase
    INNER JOIN agentes a ON c.idAgente = a.idAgente
    INNER JOIN agencias ag ON a.idAgencia = ag.idAgencia
    WHERE idCotizacion = ${id}
    `);
    res.json( respuesta[0] );
  }

  public async listByUserWithFilter(req: Request, res: Response): Promise<void> {
    const { id, filter } =  req.params;
    let condiciones: string = '';
    if(parseInt(filter) !== 10){
      condiciones = `WHERE c.idUsuario = ${id} AND c.estado = ${filter}`;
    }else{
      condiciones = '';
    }
    const resp = await pool.query(`
      SELECT c.*, (c.numM + c.num18 + c.num12) AS personas, CONCAT(a.nombre, ' ', a.apellidos) AS agente, ag.*, u.nombre AS responsable
      FROM cotizaciones c
      INNER JOIN usuarios u ON c.idUsuario = u.idUsuario
      INNER JOIN agentes a ON c.idAgente = a.idAgente
      INNER JOIN agencias ag ON a.idAgencia = ag.idAgencia
      ${condiciones}
      ORDER BY c.idCotizacion DESC
    `);
    res.json(resp);
  }

  public async listByFilter(req: Request, res: Response): Promise<void> {
    const { filter } =  req.params;
    let condiciones: string = '';
    if(+filter === 0){
      condiciones = `WHERE c.estado = 6 OR c.estado = 8`;
    }else{
      condiciones = `WHERE c.estado = ${filter}`;
    }

    const cotizaciones = await pool.query(`
      SELECT c.*, (c.numM + c.num18 + c.num12) AS personas, CONCAT(a.nombre, ' ', a.apellidos) AS agente, ag.*, oc.totalOC, db.divisa AS nombreDivisa, u.nombre AS responsable,
      (SELECT IFNULL(SUM(fp.cantidadMXN), 0) FROM finanzas_pagos fp WHERE c.idCotizacion = fp.idCotizacion AND fp.pagoVerificado = 1) AS totalVerificado
      FROM cotizaciones c
      INNER JOIN usuarios u ON c.idUsuario = u.idUsuario
      INNER JOIN ordencompra oc ON c.idCotizacion = oc.idCotizacion
      INNER JOIN divisasbase db ON c.divisa = db.idDivisaBase
      INNER JOIN agentes a ON c.idAgente = a.idAgente
      INNER JOIN agencias ag ON a.idAgencia = ag.idAgencia
      ${condiciones}
      ORDER BY c.idCotizacion DESC
    `);

    for(let cotizacion of cotizaciones){
      cotizacion.porcentajeVerificado = round((cotizacion.totalVerificado * 100) / cotizacion.totalOC);
      const pagos: any[] = await pool.query(`SELECT * FROM finanzas_pagos WHERE idCotizacion = ?`, [cotizacion.idCotizacion]);
      const comisionesPagadas: any[] = await pool.query(`SELECT * FROM finanzas_comisionespagadas WHERE idCotizacion = ?`, [cotizacion.idCotizacion]);
      
      cotizacion.pagos = pagos;
      cotizacion.comisionesPagadas = comisionesPagadas;
    }
    res.json(cotizaciones);
  }

  public async getComisionAgenteByCotizacion(req: Request, res: Response): Promise<void> {
    const { idCotizacion, type } =  req.params;
    const resp = await pool.query(`
      SELECT ca.*
      FROM cotizaciones c
      INNER JOIN agentes a ON c.idAgente = a.idAgente 
      INNER JOIN comisionesagentes ca ON a.idAgente = ca.idAgente 
      WHERE c.idCotizacion = ? AND ca.tipoActividad = ?
    `, [idCotizacion, type]);
    res.json(resp);
  }

  public async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    
    const resp = await pool.query(
      "UPDATE cotizaciones SET ?  WHERE idCotizacion = ?", 
      [req.body, id]
    );
    const { affectedRows } = resp;

    res.json({ affectedRows: affectedRows });
  }

  public async search(req: Request, res: Response): Promise<any> {
    const { search } = req.params;
    const resp = await pool.query(`
      SELECT c.*, CONCAT(a.nombre, ' ', a.apellidos) AS agente, ag.*, (c.numM + c.num18 + c.num12) AS personas, u.nombre AS responsable
      FROM cotizaciones c
      INNER JOIN usuarios u ON c.idUsuario = u.idUsuario
      INNER JOIN agentes a ON c.idAgente = a.idAgente
      INNER JOIN agencias ag ON a.idAgencia = ag.idAgencia
      WHERE ref LIKE "%${search}%" OR c.titulo LIKE "%${search}%" OR CONCAT(c.viajeroNombre, ' ', c.viajeroApellido) LIKE "%${search}%" OR u.nombre LIKE "%${search}%"
      ORDER BY idCotizacion DESC
    `);
    res.json(resp);
  }

  public async getVersionesByCotizacion(req: Request, res: Response): Promise<any> {
    const { idCotizacion } = req.params;
    const vc = await pool.query(`
    SELECT v.*, u.nombre AS usuario, c.notas AS detalle
    FROM versiones v
    INNER JOIN usuarios u ON u.idUsuario = v.idUsuario
    INNER JOIN cotizaciones c ON v.idCotizacion = c.idCotizacion
    WHERE v.idCotizacion = ? AND v.versionCotizacion = c.version
    GROUP BY v.versionCotizacion
    ORDER BY v.versionCotizacion DESC`
    , [idCotizacion]);
    const vch = await pool.query(`
    SELECT v.*, u.nombre AS usuario, ch.notas AS detalle
    FROM versiones v
    INNER JOIN usuarios u ON u.idUsuario = v.idUsuario
    INNER JOIN cotizacioneshistory ch ON v.idCotizacion = ch.idCotizacion
    WHERE v.idCotizacion = ? AND v.versionCotizacion = ch.version
    GROUP BY v.versionCotizacion
    ORDER BY v.versionCotizacion DESC`
    , [idCotizacion]);
    let versiones = vc.concat(vch);
    // versiones.sort(function(a: any, b: any) {
    //   return b.versionCotizacion - a.versionCotizacion;
    // });
    res.json(versiones);
  }

  public async getNotasByCotizacion(req: Request, res: Response): Promise<any> {
    const { idCotizacion } = req.params;
    const resp = await pool.query(`
    SELECT nc.*, u.nombre AS usuario
    FROM notascotizaciones nc
    INNER JOIN usuarios u ON nc.idUsuario = u.idUsuario
    WHERE nc.idCotizacion = ? 
    ORDER BY idNota DESC`
    , [idCotizacion]);
    res.json(resp);
  }

  public async getNotificationsByUser(req: Request, res: Response): Promise<any> {
    const { idUsuario } = req.params;
    const resp = await pool.query(`
    SELECT nc.*, u.nombre AS usuario, c.ref
    FROM notascotizaciones nc
    INNER JOIN usuarios u ON nc.idUsuario = u.idUsuario
    INNER JOIN cotizaciones c ON nc.idCotizacion = c.idCotizacion
    WHERE c.idUsuario = ?
    ORDER BY nc.createdAt DESC`
    , [idUsuario]);
    res.json(resp);
  }

  public async changeOwner(req: Request, res: Response): Promise<any> {
    const { idUsuario, idCotizacion } = req.params;
    const resp = await pool.query(`UPDATE cotizaciones SET idUsuario = ? WHERE idCotizacion = ?`, [idUsuario, idCotizacion]);
    res.json(resp);
  }

  public async updateCreatedAt(req: Request, res: Response): Promise<any> {
    const { idCotizacion } = req.params;
    const fecha = await pool.query(`SELECT createdAt FROM cotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
    let fechaFormato: any = moment(fecha[0].createdAt).add(31, 'days').format("YYYY-MM-DD hh:mm:ss");
    const resp = await pool.query(`UPDATE cotizaciones SET createdAt = ? WHERE idCotizacion = ?`, [fechaFormato, idCotizacion]);
    res.json(resp);
  }

  public async getArchivosCotizacion(req: Request, res: Response): Promise<any> {
    const { idCotizacion } = req.params;
    const resp = await pool.query(`SELECT * FROM archivoscotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
    res.json(resp);
  }

  public async addTimeline(req: Request, res: Response): Promise<void> {
    try {
      const resp = await pool.query("INSERT INTO timeline set ?", [req.body]);
      res.json(resp);
    } catch (error) {
      console.log(error); 
    } 
    
  }
}

const round = (num: number) => {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return Math.round(m) / 100 * Math.sign(num);
}

export const cotizacionesController = new CotizacionesController();
