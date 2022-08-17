import { Request, Response } from "express";
import pool from "../database";
import fs from 'fs';
import path from 'path';

class CanastaController {

  public async create(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO canasta set ?", [req.body]);
    res.json(resp);
  }
 
  public async listIdActividadesByIdCotizacionByTipo(req: Request, res: Response): Promise<void> {
    const { idCotizacion, tipo } = req.params;
    const respuesta = await pool.query(`SELECT idActividad FROM canasta WHERE idCotizacion=${idCotizacion} AND tipo=${tipo}`);
    res.json(respuesta);
  }
  public async listOneCotizacionByUserByVersionResumen(req: Request, res: Response): Promise<void> 
  {
    const { idUser, idCotizacion, version, versionCotizacion } = req.params;
    
    const cotizacionDestino = await pool.query(`SELECT * FROM cotizaciones_destinos WHERE idCotizacion = ?`, [idCotizacion]);
    let cotizacion: any;
    let isEmptyCotizacion = await pool.query(`SELECT c.*, d.divisa FROM cotizaciones c INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase WHERE c.idCotizacion = ? AND c.version = ?` , [idCotizacion, versionCotizacion]);

    if(isEmptyCotizacion.length !== 0)
    {
      cotizacion = isEmptyCotizacion;    

    }
    else
    {
      cotizacion = await pool.query(`SELECT c.*, d.divisa FROM cotizacioneshistory c INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase WHERE c.idCotizacion = ? AND c.version = ?` , [idCotizacion, versionCotizacion]);
      
    }
    let consulta=`SELECT v.tipo,v.idActividad FROM versiones v  INNER JOIN cotizaciones co ON v.idCotizacion = co.idCotizacion WHERE v.idCotizacion = ${idCotizacion} AND v.versionCotizacion = ${versionCotizacion} AND v.accion = 1`;
    let canastaProducts = await pool.query(consulta);
    
    for(let data of canastaProducts)
    {
      switch(data.tipo){
        case 1: //traslados
          
          let consultaTraslado=`
          SELECT V.tipo, c.idCiudad as idCiudad,c.nombre AS lugar, DATE_FORMAT(ta.fecha, '%Y-%m-%d') as fecha ,   c.nombre AS nombre, l1.nombre AS desde, l2.nombre AS hacia,ta.hora,0 as categoria,ta.descripcion as descripcion, c.presentacion as descripcionCiudad,ta.idTrasladoAdquirido as id,PPT.total as precioTotal,ta.opcional as opcional,ta.pasajeros
          FROM trasladosadquiridos ta
          INNER JOIN traslados t ON ta.idTraslado = t.idTraslado
          INNER JOIN lugares l1 ON t.idDesde = l1.idLugar
          INNER JOIN lugares l2 ON t.idHacia = l2.idLugar
          INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
          INNER JOIN versiones V ON V.idActividad=ta.idTrasladoAdquirido
          INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
          WHERE V.idActividad=${data.idActividad} AND V.tipo=1 AND  V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          const traslado = await pool.query(consultaTraslado);
          
          
          data.datos = traslado[0];
          break;
        case 2://disposiciones
        
          let consultaDisposicion=`
          SELECT V.tipo, c.idCiudad as idCiudad, c.nombre as lugar,DATE_FORMAT(da.fecha, '%Y-%m-%d') as fecha , l.nombre AS nombre, '' as desde, '' as hacia,da.hora,0 as categoria, da.descripcion as descripcion, c.presentacion as descripcionCiudad,da.idDisposicionAdquirida as id,PPT.total as precioTotal,da.opcional as opcional
          FROM disposicionesadquiridas da 
          INNER JOIN disposiciones d ON da.idDisposicion = d.idDisposicion 
          INNER JOIN ciudad c ON d.idCiudad = c.idCiudad 
          INNER JOIN lugares l ON d.idLugar = l.idLugar 
          INNER JOIN disposicionescostos dc ON d.idDisposicion = dc.idDisposicion
          INNER JOIN vehiculo vh ON dc.idVehiculo = vh.idVehiculo
          INNER JOIN versiones V ON V.idActividad=da.idDisposicionAdquirida 
          INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
          WHERE V.idActividad=${data.idActividad} AND V.tipo=2 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          const disposicion = await pool.query(consultaDisposicion);
          data.datos = disposicion[0];
          break;
        case 3://traslados otros
        
          let consultaTrasladoOtros="";
          let consultaVerificar=`
          SELECT  desde,hacia 
          FROM trasladosotros t
          INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          const lugares = await pool.query(consultaVerificar);
          const regex = /^[0-9]*$/;
          let trasladoOtro: any;
          if(regex.test(lugares[0].desde) && !regex.test(lugares[0].hacia))
          {
            //desde número
            consultaTrasladoOtros=`
            SELECT  V.tipo, c.idCiudad as idCiudad,c.nombre as lugar,DATE_FORMAT(t.fecha, '%Y-%m-%d') as fecha , c.nombre AS nombre,l.nombre AS desde, t.hacia,t.hora,0 as categoria,t.descripcion as descripcion,c.presentacion as descripcionCiudad,t.idTrasladoOtro as id,PPT.total as precioTotal,t.opcional as opcional
            FROM trasladosotros t
            INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
            INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
            INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro 
            INNER JOIN lugares l ON t.desde = l.idLugar
            INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
            WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;               
          }else if(!regex.test(lugares[0].desde) && regex.test(lugares[0].hacia))
          {
            //hacia número
            consultaTrasladoOtros=`
            SELECT  V.tipo, c.idCiudad as idCiudad,c.nombre as lugar,DATE_FORMAT(t.fecha, '%Y-%m-%d') as fecha , c.nombre AS nombre,t.desde,l.nombre AS hacia,t.hora,0 as categoria,t.descripcion as descripcion,c.presentacion as descripcionCiudad,t.idTrasladoOtro as id,PPT.total as precioTotal,t.opcional as opcional
            FROM trasladosotros t
            INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
            INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
            INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro 
            INNER JOIN lugares l ON t.hacia = l.idLugar
            INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
            WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND  V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          }else
          {
            // ambos letras
            consultaTrasladoOtros=`
            SELECT  V.tipo, c.idCiudad as idCiudad,c.nombre as lugar,DATE_FORMAT(t.fecha, '%Y-%m-%d') as fecha , c.nombre AS nombre,t.desde, t.hacia,t.hora,0 as categoria,t.descripcion as descripcion,c.presentacion as descripcionCiudad,t.idTrasladoOtro as id,PPT.total as precioTotal,t.opcional as opcional
            FROM trasladosotros t
            INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
            INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
            INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro 
            INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
            WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND  V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          }
          trasladoOtro = await pool.query(consultaTrasladoOtros);
          data.datos = trasladoOtro[0];
          break;
        case 4://hotel
        
          var hotel;          
          let consultaHotel=`SELECT 4 as tipo,c.idCiudad as idCiudad,c.nombre as lugar, DATE_FORMAT(checkin, '%Y-%m-%d') as fecha , ha.nombre,'' as desde,'' as hacia,'22:00' as hora,ha.categoria as categoriaNombre,ha.estrellas as categoria,CONCAT('', ha.nombre) as descripcion, c.presentacion as descripcionCiudad, ha.idHotelAdquirido as id,PPT.total as precioTotal,ha.opcional as opcional,DATE_FORMAT(checkout, '%Y-%m-%d') as fechaSalida,ha.direccion,ha.telefono,ha.desayuno,ha.noPersonas as pasajeros
          FROM hotelesadquiridos  ha
          INNER JOIN cotizaciones_destinos cd ON cd.idDestino = ha.idDestino
          INNER JOIN ciudad c ON c.idCiudad = cd.idCiudad
          INNER JOIN versiones V ON V.idActividad=ha.idHotelAdquirido 
          INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
          WHERE V.idActividad=${data.idActividad} AND V.tipo=4  AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          hotel = await pool.query(consultaHotel);
          data.datos = hotel[0];
          break;
        case 5://vuelo
        
          var vuelo;          
          let consultaVueloInfo=`SELECT idVuelo FROM vuelosInfo  WHERE idVuelo = ${data.idActividad}`;
          const vueloInfo = await pool.query(consultaVueloInfo);
          if(vueloInfo.length !== 0)
          {
            let consultaVuelo=`SELECT V.tipo, c.idCiudad as idCiudad, c.nombre as lugar, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha, VI.aerolinea as nombre, c1.nombre as desde, c2.nombre as hacia, horaSalida as hora,0 as categoria,CONCAT('Vuelo: ',VI.aerolinea) as descripcion, c.presentacion as descripcionCiudad, vv.idVuelo  as id,horaLlegada as horaLlegada,noViajeros as cantidad,PPT.precioPorPersona,PPT.total as precioTotal,vv.opcional as opcional
            FROM vuelos vv 
            INNER JOIN ciudad c1 ON vv.origen = c1.idCiudad
            INNER JOIN ciudad c2 ON vv.destino = c2.idCiudad
            INNER JOIN versiones V ON V.idActividad=vv.idVuelo 
            INNER JOIN cotizaciones_destinos cd ON vv.idDestino = cd.idDestino           
            INNER JOIN ciudad c ON c.idCiudad = cd.idCiudad
            INNER JOIN vuelosInfo VI ON VI.idVuelo=vv.idVuelo 
            INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
            WHERE V.idActividad=${data.idActividad}  AND V.tipo=5 AND  V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;

            vuelo = await pool.query(consultaVuelo);
          }
          else
          {
            let consultaVuelo=`SELECT V.tipo, c.idCiudad as idCiudad, c.nombre as lugar, DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,'' as nombre, c1.nombre as desde, c2.nombre as hacia, horaSalida as hora,0 as categoria,'Vuelo' as descripcion, c1.presentacion as descripcionCiudad, vv.idVuelo  as id,horaLlegada as horaLlegada,noViajeros as cantidad,PPT.precioPorPersona,PPT.total as precioTotal,vv.opcional as opcional
            FROM vuelos vv             
            INNER JOIN cotizaciones_destinos cd ON cd.idDestino = vv.idDestino
            INNER JOIN ciudad c ON c.idCiudad = cd.idCiudad
            INNER JOIN ciudad c1 ON vv.origen = c1.idCiudad
            INNER JOIN ciudad c2 ON vv.destino = c2.idCiudad
            INNER JOIN versiones V ON V.idActividad=vv.idVuelo 
            INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
            WHERE  V.idActividad=${data.idActividad}  AND V.tipo=5 AND  V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;

            vuelo = await pool.query(consultaVuelo);
          }
          data.datos = vuelo[0];
          break;
        case 6://tren
        
          let consultaTren=`SELECT V.tipo, c.idCiudad as idCiudad, c.nombre as lugar,DATE_FORMAT(fecha, '%Y-%m-%d') as fecha, '' as nombre, c1.nombre as desde,c2.nombre as hacia,horario as hora,0 as categoria,T.descripcion as descripcion, c.presentacion as descripcionCiudad, T.idTren  as id,PPT.total as precioTotal,T.opcional as opcional
          FROM trenes T  
          INNER JOIN cotizaciones_destinos cd ON cd.idDestino = T.idDestino
          INNER JOIN ciudad c ON c.idCiudad = cd.idCiudad
          INNER JOIN ciudad c1 ON T.origen = c1.idCiudad
          INNER JOIN ciudad c2 ON T.destino = c2.idCiudad
          INNER JOIN versiones V ON V.idActividad=T.idTren 
          INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
          WHERE V.idActividad=${data.idActividad} AND V.tipo=6 AND  V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
          const tren = await pool.query(consultaTren);
          data.datos = tren[0];
          break;
          
        case 7:
          
          let consultaProducto =`SELECT V.tipo,c.idCiudad as idCiudad, c.nombre as lugar,DATE_FORMAT(pa.fecha, '%Y-%m-%d') as fecha, p.titulo as nombre, c.nombre AS desde,'' as hacia, pa.horario as hora, p.categoria,p.titulo as descripcion, c.presentacion as descripcionCiudad, p.duracion, pi.incluye,pa.idProducto as tipoProducto,pa.opcional as opcional, pa.idProductoAdquirido as id,PPT.precioPorPersona,PPT.total as precioTotal,(SELECT GROUP_CONCAT(PE.nombre SEPARATOR '\n*') AS entradas FROM productosentradas PE WHERE PE.idProducto=p.idProducto) AS entradas, p.resumen,p.descripcion as descripcionDetallada
          FROM productosadquiridos pa
          INNER JOIN productos p ON pa.idProducto = p.idProducto
          INNER JOIN productosinfo pi ON pi.idProducto = p.idProducto
          INNER JOIN ciudad c ON p.idCiudad = c.idCiudad
          INNER JOIN versiones V ON V.idActividad=pa.idProductoAdquirido 
          INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
          WHERE V.idActividad=${data.idActividad} AND V.tipo=7  AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
          
          const producto = await pool.query(consultaProducto);
          data.datos = producto[0];
          break;
        case 8:
          
            let consultaExtra = `SELECT V.tipo,c.idCiudad as idCiudad, c.nombre as lugar,DATE_FORMAT(e.fecha, '%Y-%m-%d') as fecha, e.extras as nombre, c.nombre AS desde,'' as hacia,'' as hora, 0 as categoria,e.extras  as descripcion, c.presentacion as descripcionCiudad, 0 as duracion, 0 as tipoProducto,e.opcional as opcional, e.idextras as id,PPT.total as precioTotal
            FROM extras e 
            INNER JOIN ciudad c ON e.idCiudad = c.idCiudad  
            INNER JOIN versiones V ON V.idActividad=e.idExtras 
            INNER JOIN productospreciostotales PPT ON PPT.idCotizacion=${idCotizacion} AND PPT.idProducto=${data.idActividad} AND PPT.tipoProducto=V.tipo
            WHERE V.idActividad=${data.idActividad} AND V.tipo=8  AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`;
            const extra = await pool.query(consultaExtra);
            data.datos = extra[0];
            break;
      }
    }
    res.status(200).send({
      canasta: canastaProducts,
    //  cotizacion: cotizacion[0],
    //  destino: cotizacionDestino[0]
    });

  }
  public async listOneCotizacionByUser(req: Request, res: Response): Promise<void> {
    const { idUser, idCotizacion } = req.params;
    const cotizacion = await pool.query(`
    SELECT c.*, d.divisa 
    FROM cotizaciones c
    INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase
    WHERE c.idCotizacion = ? AND c.idUsuario = ?`
  , [idCotizacion, idUser]);
  if(cotizacion[0] !== undefined && Object.keys(cotizacion[0]).length > 0){
    const cotizacionDestinos = await pool.query(`
      SELECT cd.*, c.nombre AS ciudad, p.id AS idPais, p.nombre AS pais, ct.nombre AS continente
      FROM cotizaciones_destinos cd
      INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
      INNER JOIN pais p ON c.idPais = p.id
      INNER JOIN continentes ct ON p.idContinente = ct.idContinente
      where idCotizacion = ?
      ORDER BY c.nombre`
    , [idCotizacion]);
    cotizacionDestinos.map((destino: any) => destino.productos = []);
    let versionProducts = await pool.query(`
      SELECT ca.* FROM canasta ca
      INNER JOIN cotizaciones co ON ca.idCotizacion = co.idCotizacion
      WHERE ca.idCotizacion = ? AND ca.estatus = 0`
    , [idCotizacion]);
    for(let data of versionProducts){
      switch(data.tipo){
        case 1:
          const traslado = await pool.query(`
          SELECT 1 AS tipo, ta.idTrasladoAdquirido, ta.idTraslado,ta.idTrasladoCosto, ta.fecha, ta.hora AS horario, ta.tarifa, ta.notas, ta.descripcion, ta.equipaje, ta.comision, ta.comisionAgente, ta.pasajeros, ta.opcional, t.cancelaciones, t.otraCiudad, t.muelle, t.idCiudad, c.nombre AS ciudad, l1.nombre AS desde, l2.nombre AS hacia
          FROM trasladosadquiridos ta
          INNER JOIN traslados t ON ta.idTraslado = t.idTraslado
          INNER JOIN lugares l1 ON t.idDesde = l1.idLugar
          INNER JOIN lugares l2 ON t.idHacia = l2.idLugar
          INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
          WHERE idTrasladoAdquirido = ?`
          , [data.idActividad]);
          data.traslado = traslado[0];
          break;
        case 2:
          const disposicion = await pool.query(`
          SELECT 2 AS tipo, da.idDisposicionAdquirida, da.idDisposicion, da.fecha, da.hora AS horario, da.tarifa, da.horasExtras, da.equipaje, da.pasajeros, da.notas, da.descripcion, da.comision, da.comisionAgente, da.pisckUp AS lugar, da.opcional, d.idCiudad, c.nombre AS ciudad, l.nombre AS titulo, da.idDisposicionCosto	 
          FROM disposicionesadquiridas da
          INNER JOIN disposiciones d ON da.idDisposicion = d.idDisposicion
          INNER JOIN ciudad c ON d.idCiudad = c.idCiudad
          INNER JOIN lugares l ON d.idLugar = l.idLugar
          WHERE da.idDisposicionAdquirida = ?`
          , [data.idActividad]);
          data.disposicion = disposicion[0];
          break;
        case 3:
          const lugares = await pool.query(`SELECT desde, hacia FROM trasladosotros WHERE idTrasladoOtro = ?`, [data.idActividad]);
          const regex = /^[0-9]*$/;
          let trasladoOtro: any;
          if(regex.test(lugares[0].desde) && !regex.test(lugares[0].hacia)){
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, v.nombre AS vehiculo, d.divisa, l.nombre AS desde
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo v ON t.idVehiculo = v.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l ON t.desde = l.idLugar
              WHERE t.idTrasladoOtro = ?`
            , [data.idActividad]);
          }else if(!regex.test(lugares[0].desde) && regex.test(lugares[0].hacia)){
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, v.nombre AS vehiculo, d.divisa, l.nombre AS hacia
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo v ON t.idVehiculo = v.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l ON t.hacia = l.idLugar
              WHERE t.idTrasladoOtro = ?`
            , [data.idActividad]);
          }else{
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, v.nombre AS vehiculo, d.divisa, l1.nombre AS desde, l2.nombre AS hacia
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo v ON t.idVehiculo = v.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l1 ON t.desde = l1.idLugar
              INNER JOIN lugares l2 ON t.hacia = l2.idLugar
              WHERE t.idTrasladoOtro = ?`
            , [data.idActividad]);
          }
          data.trasladoOtro = trasladoOtro[0];
          break;
        case 4:
          const hotel = await pool.query(`
            SELECT 4 AS tipo, ha.*, c.nombre  AS ciudad
            FROM hotelesadquiridos ha
            INNER JOIN cotizaciones_destinos cd ON ha.idDestino = cd.idDestino
            INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
            WHERE ha.idHotelAdquirido = ?
          `, [data.idActividad]);
          if(hotel.length > 0){
            const habitaciones: any = await pool.query(`SELECT * FROM hoteleshabitaciones WHERE idHotelAdquirido = ?`, [data.idActividad]);
            data.hotel = hotel[0];
            data.hotel.habitaciones = habitaciones;
          }
          break;
        case 5:
          var vuelo: any[] = [];
          vuelo = await pool.query(`
          SELECT 5 AS tipo, 1 AS escala, v.*, ve.idVueloEscala, ve.tiempo AS tiempoEscala, ve.lugar AS lugarEscala, ve.fecha AS fechaEscala, c1.nombre AS origenN, c2.nombre AS destinoN
          FROM vuelos v
          INNER JOIN vueloescalas ve ON v.idVuelo = ve.idVuelo 
          INNER JOIN ciudad c1 ON v.origen = c1.idCiudad
          INNER JOIN ciudad c2 ON v.destino = c2.idCiudad
          WHERE v.idVuelo = ?`
          , [data.idActividad]);
          if(vuelo.length !== 0){
            data.vuelo = vuelo[0];
          }else{
            vuelo = await pool.query(`
            SELECT 5 AS tipo, 0 AS escala, v.*, cd.idCiudad, c1.nombre AS origenN, c2.nombre AS destinoN
            FROM vuelos v
            INNER JOIN ciudad c1 ON v.origen = c1.idCiudad
            INNER JOIN ciudad c2 ON v.destino = c2.idCiudad
            INNER JOIN cotizaciones_destinos cd ON v.idDestino = cd.idDestino
            WHERE idVuelo = ?`, [data.idActividad]);
            data.vuelo = vuelo[0];
          }
          break;
        case 6:
          const tren = await pool.query(`
          SELECT 6 AS tipo, t.*, c1.nombre AS origenN, c2.nombre AS destinoN
          FROM trenes t 
          INNER JOIN ciudad c1 ON t.origen = c1.idCiudad
          INNER JOIN ciudad c2 ON t.destino = c2.idCiudad
          WHERE t.idTren = ?`, [data.idActividad]);
          data.tren = tren[0];
          break;
        case 7:
          const producto = await pool.query(`
          SELECT pa.*, p.titulo, p.categoria, p.idCiudad, c.nombre AS ciudad
          FROM productosadquiridos pa
          INNER JOIN productos p ON pa.idProducto = p.idProducto
          INNER JOIN ciudad c ON p.idCiudad = c.idCiudad
          WHERE pa.idProductoAdquirido = ?`
          , [data.idActividad]);
          if(producto[0] !== undefined && Object.keys(producto[0]).length > 0){
            switch(producto[0].categoria){
              case 1:
                producto[0].tipo = 71;
                data.tourPie = producto[0];
                break;
              case 2:
                producto[0].tipo = 72;
                data.tourTransporte = producto[0];
                break;
              case 3:
                producto[0].tipo = 73;
                data.tourGrupo = producto[0];
                break;
              case 4:
                producto[0].tipo = 74;
                data.actividad = producto[0];
                break;
            }
          }
          break;
        case 8:
          const extra = await pool.query(`
            SELECT 8 AS tipo, e.*, c.nombre AS ciudad 
            FROM extras e 
            INNER JOIN ciudad c ON e.idCiudad = c.idCiudad 
            WHERE idExtras = ?`
          , [data.idActividad]);
          data.extra = extra[0];
          break;
        case 12:
          const rentaVehiculo = await pool.query(`
            SELECT 12 AS tipo, rv.*
            FROM rentavehiculos rv
            WHERE idRentaVehiculo = ?`
          , [data.idActividad]);
          data.rentaVehiculo = rentaVehiculo[0];
          break;
      }
    }
    res.status(200).send({
      canasta: versionProducts,
      cotizacion: cotizacion[0],
      destinos: cotizacionDestinos
    });
  }else{
    res.status(404).send({
      canasta: [],
      cotizacion: [],
      destinos: []
    });
  } 
  }


  public async listOneCotizacionByUserByVersion(req: Request, res: Response): Promise<void> {
    const { idUser, idCotizacion, versionCotizacion } = req.params;
    const cotizacionDestinos = await pool.query(`
      SELECT cd.*, c.nombre AS ciudad, p.id AS idPais, p.nombre AS pais, ct.nombre AS continente
      FROM cotizaciones_destinos cd
      INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
      INNER JOIN pais p ON c.idPais = p.id
      INNER JOIN continentes ct ON p.idContinente = ct.idContinente
      where cd.idCotizacion = ${idCotizacion} AND cd.versionCotizacion <= ${versionCotizacion}
      ORDER BY c.nombre
    `);
    cotizacionDestinos.map((destino: any) => destino.productos = []);
    let cotizacion: any;
    let isEmptyCotizacion = await pool.query(`
      SELECT c.*, d.idDivisaBase, d.divisa, a.idAgencia
      FROM cotizaciones c
      INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase
      INNER JOIN agentes a ON c.idAgente = a.idAgente
      WHERE c.idUsuario = ? AND c.idCotizacion = ? AND c.version = ?`
    , [idUser, idCotizacion, versionCotizacion]);
    if(isEmptyCotizacion[0] !== undefined && Object.keys(isEmptyCotizacion[0]).length > 0){
      cotizacion = isEmptyCotizacion;
    }else{
      cotizacion = await pool.query(`
        SELECT c.*, d.idDivisaBase, d.divisa, a.idAgencia
        FROM cotizacioneshistory c
        INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase
        INNER JOIN agentes a ON c.idAgente = a.idAgente
        WHERE c.idUsuario = ? AND c.idCotizacion = ? AND c.version = ?`
      , [idUser, idCotizacion, versionCotizacion]);
    }
    let versionProducts = await pool.query(`
      SELECT v.* FROM versiones v
      INNER JOIN cotizaciones co ON v.idCotizacion = co.idCotizacion
      WHERE v.idCotizacion = ? AND v.versionCotizacion = ? AND v.accion = 1`
      , [idCotizacion, versionCotizacion]);
    
    for(let data of versionProducts){
      switch(data.tipo){
        case 1:

          const traslado = await pool.query(`
          SELECT 1 AS tipo, ta.idTrasladoAdquirido, ta.idTraslado, ta.idTrasladoCosto, ta.fecha, ta.hora AS horario, ta.tarifa, ta.notas, ta.descripcion, ta.equipaje, ta.pasajeros, ta.comision, ta.comisionAgente, ta.opcional, t.cancelaciones, t.otraCiudad, t.muelle, t.idCiudad, c.nombre AS ciudad, l1.nombre AS desde, l2.nombre AS hacia
          FROM trasladosadquiridos ta
          INNER JOIN traslados t ON ta.idTraslado = t.idTraslado
          INNER JOIN lugares l1 ON t.idDesde = l1.idLugar
          INNER JOIN lugares l2 ON t.idHacia = l2.idLugar
          INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
          INNER JOIN versiones V ON V.idActividad=ta.idTrasladoAdquirido
          WHERE V.idActividad=${data.idActividad} AND V.tipo=1 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
          , [data.idActividad, idCotizacion, versionCotizacion]);
          data.traslado = traslado[0];
          const info = await pool.query(`SELECT * FROM trasladosadquiridosinfo WHERE idTrasladoAdquirido =${data.idActividad} AND completado = 1 AND tipo =1 `);
          data.infoExtra = info[0];

          
          break;
        case 2:
          const disposicion = await pool.query(`
          SELECT 2 AS tipo, da.idDisposicionAdquirida, da.idDisposicion, da.fecha, da.hora AS horario, da.tarifa, da.horasExtras, da.equipaje, da.pasajeros, da.notas, da.descripcion, da.pisckUp AS lugar, da.comision, da.comisionAgente, da.opcional, d.idCiudad, vh.pasajerosMax, c.nombre AS ciudad, l.nombre AS titulo, da.idDisposicionCosto	
          FROM disposicionesadquiridas da 
          INNER JOIN disposiciones d ON da.idDisposicion = d.idDisposicion 
          INNER JOIN ciudad c ON d.idCiudad = c.idCiudad 
          INNER JOIN lugares l ON d.idLugar = l.idLugar 
          INNER JOIN disposicionescostos dc ON d.idDisposicion = dc.idDisposicion
          INNER JOIN vehiculo vh ON dc.idVehiculo = vh.idVehiculo
          INNER JOIN versiones V ON V.idActividad=da.idDisposicionAdquirida 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=2 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1
          `);
          data.disposicion = disposicion[0];

          const infoDisp = await pool.query(`SELECT * FROM disposicionesAdquiridasInfo WHERE idDisposicionAdquirida =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoDisp[0];
          
          break; 
        case 3:
          
          const lugares = await pool.query(`SELECT desde, hacia FROM trasladosotros WHERE idtrasladoOtro = ?`, [data.idActividad]);
          const regex = /^[0-9]*$/;
          let trasladoOtro: any;
          if (regex.test(lugares[0].desde) && !regex.test(lugares[0].hacia)) {
            
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, vh.nombre AS vehiculo, d.divisa, l.nombre AS desde, l.idLugar AS idDesde
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l ON t.desde = l.idLugar
              INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
            , [data.idActividad]);
          } else if (!regex.test(lugares[0].desde) && regex.test(lugares[0].hacia)) {
            
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, vh.nombre AS vehiculo, d.divisa, l.nombre AS hacia, l.idLugar AS idHacia
              FROM trasladosotros t 
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l ON t.hacia = l.idLugar
              INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
            , [data.idActividad]);
          } else {
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, vh.nombre AS vehiculo, d.divisa, l1.nombre AS desde, l1.idLugar AS idDesde, l2.nombre AS hacia, l2.idLugar AS idHacia
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l1 ON t.desde = l1.idLugar
              INNER JOIN lugares l2 ON t.hacia = l2.idLugar
              INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
            , [data.idActividad]);
          }

          
          data.trasladoOtro = trasladoOtro[0];
          
          const infoOtro = await pool.query(`SELECT * FROM trasladosadquiridosinfo WHERE idTrasladoAdquirido =${data.idActividad} AND completado = 1 AND tipo =2 `);
          data.infoExtra = infoOtro[0];
          
          
          break;
        case 4:
          const hotel = await pool.query(`
            SELECT 4 AS tipo, ha.*, c.nombre AS ciudad, c.idCiudad
            FROM hotelesadquiridos ha
            INNER JOIN cotizaciones_destinos cd ON ha.idDestino = cd.idDestino
            INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
            INNER JOIN versiones V ON V.idActividad = ha.idHotelAdquirido
            WHERE V.idActividad = ${data.idActividad} AND V.tipo = 4 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
          `);
          const habitaciones: any = await pool.query(`SELECT * FROM hoteleshabitaciones WHERE idHotelAdquirido = ?`, [data.idActividad]);
          data.hotel = hotel[0];
          data.hotel.habitaciones = habitaciones;

          const infoHotel  = await pool.query(`SELECT * FROM hotelesAdquiridosInfo WHERE idHotelAdquirido =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoHotel[0];

          break;
        case 5:
          var vuelo: any[] = [];
          vuelo = await pool.query(`
          SELECT 5 AS tipo, 1 AS escala, vv.*, ve.idVueloEscala, ve.tiempo AS tiempoEscala, ve.lugar AS lugarEscala, ve.fecha AS fechaEscala, cd.idCiudad, c1.nombre AS origenN, c2.nombre AS destinoN
          FROM vuelos vv  
          INNER JOIN vueloescalas ve ON vv.idVuelo = ve.idVuelo   
          INNER JOIN ciudad c1 ON vv.origen = c1.idCiudad 
          INNER JOIN ciudad c2 ON vv.destino = c2.idCiudad
          INNER JOIN versiones V ON V.idActividad=vv.idVuelo 
          INNER JOIN cotizaciones_destinos cd ON vv.idDestino = cd.idDestino  
          WHERE V.idActividad=${data.idActividad} AND V.tipo=5 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`, [data.idActividad]);
          data.vuelo = vuelo[0];
          if(vuelo.length !== 0){
            data.vuelo = vuelo[0];
          }else{
            vuelo = await pool.query(`
            SELECT 5 AS tipo, 0 AS escala, v.*, cd.idCiudad, c1.nombre AS origenN, c2.nombre AS destinoN
            FROM vuelos v
            INNER JOIN ciudad c1 ON v.origen = c1.idCiudad
            INNER JOIN ciudad c2 ON v.destino = c2.idCiudad
            INNER JOIN versiones VV ON VV.idActividad = v.idVuelo 
            INNER JOIN cotizaciones_destinos cd ON v.idDestino = cd.idDestino
            WHERE VV.idActividad=${data.idActividad} AND VV.tipo=5 AND VV.idCotizacion=${idCotizacion} AND VV.versionCotizacion=${versionCotizacion} AND VV.accion=1`, [data.idActividad]);
            data.vuelo = vuelo[0]; 
          }

          const infoVuelo  = await pool.query(`SELECT * FROM vuelosInfo WHERE idVuelo =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoVuelo[0];

          break;
        case 6:
          const tren = await pool.query(`
          SELECT 6 AS tipo, T.*, c1.nombre AS origenN, c2.nombre AS destinoN 
          FROM trenes T 
          INNER JOIN ciudad c1 ON T.origen = c1.idCiudad
          INNER JOIN ciudad c2 ON T.destino = c2.idCiudad
          INNER JOIN versiones V ON V.idActividad=T.idTren 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=6 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`);
          data.tren = tren[0];

          const infoTren  = await pool.query(`SELECT * FROM trenesinfo WHERE idTren =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoTren[0];

          break;
        case 7:
          const producto = await pool.query(`
          SELECT pa.*, p.titulo, p.categoria, p.minimunViajeros, p.maximunViajeros, p.idCiudad, c.nombre AS ciudad
          FROM productosadquiridos pa
          INNER JOIN productos p ON pa.idProducto = p.idProducto
          INNER JOIN ciudad c ON p.idCiudad = c.idCiudad
          INNER JOIN versiones V ON V.idActividad=pa.idProductoAdquirido WHERE V.idActividad=${data.idActividad} AND V.tipo=7 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
          , [data.idActividad]);
          if(producto[0] !== undefined && Object.keys(producto[0]).length > 0){
            switch(producto[0].categoria){
              case 1:
                producto[0].tipo = 71;
                data.tourPie = producto[0];
                
                break;
              case 2:
                producto[0].tipo = 72;
                data.tourTransporte = producto[0];
                break;
              case 3:
                producto[0].tipo = 73;
                data.tourGrupo = producto[0];
                break;
              case 4:
                producto[0].tipo = 74;
                data.actividad = producto[0];
                break; 
            }
          }
 
          const infoProducto  = await pool.query(`SELECT * FROM productosAdquiridosInfo WHERE idProductoAdquirido =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoProducto[0];
          break;
        case 8:
          const extra = await pool.query(`
          SELECT 8 AS tipo, e.*, c.nombre AS ciudad 
          FROM extras e 
          INNER JOIN ciudad c ON e.idCiudad = c.idCiudad  
          INNER JOIN versiones V ON V.idActividad=e.idExtras 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=8 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`, [data.idActividad]);
          data.extra = extra[0];

          const infoExtra  = await pool.query(`SELECT * FROM extrasInfo WHERE idExtra =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoExtra[0];
 
          break;
        case 12:
          const rentaVehiculo = await pool.query(`
            SELECT 12 AS tipo, rv.*, CC.idCiudad, CC.nombre as ciudad
            FROM rentavehiculos rv
            INNER JOIN versiones V ON V.idActividad = rv.idRentaVehiculo
            INNER JOIN cotizaciones_destinos CD ON CD.idDestino =rv.idDestino
            INNER JOIN ciudad CC ON CD.idCiudad = CC.idCiudad 
            WHERE V.idActividad=${data.idActividad} AND V.tipo = 12 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1`, [data.idActividad]);
          data.rentaVehiculo = rentaVehiculo[0];

          const infoRenta  = await pool.query(`SELECT * FROM rentaVehiculoInfo WHERE idRentaVehiculo =${data.idActividad} AND completado = 1`);
          data.infoExtra = infoRenta[0];

          break; 
      }
    }
    res.status(200).send({
      canasta: versionProducts,
      cotizacion: cotizacion[0],
      destinos: cotizacionDestinos
    });
  }

  public async listOneCotizacionByUserByVersionCompletarInfo(req: Request, res: Response): Promise<void> {
    const { idUser, idCotizacion, versionCotizacion } = req.params;
    const cotizacionDestinos = await pool.query(`
      SELECT cd.*, c.nombre AS ciudad, p.id AS idPais, p.nombre AS pais, ct.nombre AS continente
      FROM cotizaciones_destinos cd
      INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
      INNER JOIN pais p ON c.idPais = p.id
      INNER JOIN continentes ct ON p.idContinente = ct.idContinente
      where cd.idCotizacion = ${idCotizacion} AND cd.versionCotizacion <= ${versionCotizacion}
      ORDER BY c.nombre
    `);
    cotizacionDestinos.map((destino: any) => destino.productos = []);
    let cotizacion: any;
    let isEmptyCotizacion = await pool.query(`
      SELECT c.*, d.idDivisaBase, d.divisa, a.idAgencia
      FROM cotizaciones c
      INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase
      INNER JOIN agentes a ON c.idAgente = a.idAgente
      WHERE c.idUsuario = ? AND c.idCotizacion = ? AND c.version = ?`
    , [idUser, idCotizacion, versionCotizacion]);
    if(isEmptyCotizacion[0] !== undefined && Object.keys(isEmptyCotizacion[0]).length > 0){
      cotizacion = isEmptyCotizacion;
    }else{
      cotizacion = await pool.query(`
        SELECT c.*, d.idDivisaBase, d.divisa, a.idAgencia
        FROM cotizacioneshistory c
        INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase
        INNER JOIN agentes a ON c.idAgente = a.idAgente
        WHERE c.idUsuario = ? AND c.idCotizacion = ? AND c.version = ?`
      , [idUser, idCotizacion, versionCotizacion]);
    }
    let versionProducts = await pool.query(`
      SELECT v.* FROM versiones v
      INNER JOIN cotizaciones co ON v.idCotizacion = co.idCotizacion
      WHERE v.idCotizacion = ? AND v.versionCotizacion = ? AND v.accion = 1`
      , [idCotizacion, versionCotizacion]);
    for(let data of versionProducts){
      switch(data.tipo){
        case 1:
        
          const traslado = await pool.query(`
          SELECT 1 AS tipo, ta.idTrasladoAdquirido, ta.idTraslado, ta.idTrasladoCosto, ta.fecha, ta.hora AS horario, ta.tarifa, ta.notas, ta.descripcion, ta.equipaje, ta.pasajeros, ta.comision, ta.comisionAgente, ta.opcional, t.cancelaciones, t.otraCiudad, t.muelle, t.idCiudad, c.nombre AS ciudad, l1.nombre AS desde, l2.nombre AS hacia
          FROM trasladosadquiridos ta
          INNER JOIN traslados t ON ta.idTraslado = t.idTraslado
          INNER JOIN lugares l1 ON t.idDesde = l1.idLugar
          INNER JOIN lugares l2 ON t.idHacia = l2.idLugar
          INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
          INNER JOIN versiones V ON V.idActividad=ta.idTrasladoAdquirido
          WHERE V.idActividad=${data.idActividad} AND V.tipo=1 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
          , [data.idActividad, idCotizacion, versionCotizacion]);
          data.traslado = traslado[0];
          break;
        case 2:
          const disposicion = await pool.query(`
          SELECT 2 AS tipo, da.idDisposicionAdquirida, da.idDisposicion, da.fecha, da.hora AS horario, da.tarifa, da.horasExtras, da.equipaje, da.pasajeros, da.notas, da.descripcion, da.pisckUp AS lugar, da.comision, da.comisionAgente, da.opcional, d.idCiudad, vh.pasajerosMax, c.nombre AS ciudad, l.nombre AS titulo, da.idDisposicionCosto	
          FROM disposicionesadquiridas da 
          INNER JOIN disposiciones d ON da.idDisposicion = d.idDisposicion 
          INNER JOIN ciudad c ON d.idCiudad = c.idCiudad 
          INNER JOIN lugares l ON d.idLugar = l.idLugar 
          INNER JOIN disposicionescostos dc ON d.idDisposicion = dc.idDisposicion
          INNER JOIN vehiculo vh ON dc.idVehiculo = vh.idVehiculo
          INNER JOIN versiones V ON V.idActividad=da.idDisposicionAdquirida 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=2 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1
          `);
          data.disposicion = disposicion[0];
          break;
        case 3:
          
          const lugares = await pool.query(`SELECT desde, hacia FROM trasladosotros WHERE idtrasladoOtro = ?`, [data.idActividad]);
          const regex = /^[0-9]*$/;
          let trasladoOtro: any;
          if (regex.test(lugares[0].desde) && !regex.test(lugares[0].hacia)) {
            
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, vh.nombre AS vehiculo, d.divisa, l.nombre AS desde, l.idLugar AS idDesde
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l ON t.desde = l.idLugar
              INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
            , [data.idActividad]);
          } else if (!regex.test(lugares[0].desde) && regex.test(lugares[0].hacia)) {
            
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, vh.nombre AS vehiculo, d.divisa, l.nombre AS hacia, l.idLugar AS idHacia
              FROM trasladosotros t 
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l ON t.hacia = l.idLugar
              INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
            , [data.idActividad]);
          } else {
            
            trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.*, t.hora AS horario, c.nombre AS ciudad, vh.nombre AS vehiculo, d.divisa, l1.nombre AS desde, l1.idLugar AS idDesde, l2.nombre AS hacia, l2.idLugar AS idHacia
              FROM trasladosotros t
              INNER JOIN ciudad c ON t.idCiudad = c.idCiudad
              INNER JOIN vehiculo vh ON t.idVehiculo = vh.idVehiculo
              INNER JOIN divisas d ON t.idDivisa = d.idDivisa
              INNER JOIN lugares l1 ON t.desde = l1.idLugar
              INNER JOIN lugares l2 ON t.hacia = l2.idLugar
              INNER JOIN versiones V ON V.idActividad=t.idTrasladoOtro WHERE V.idActividad=${data.idActividad} AND V.tipo=3 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
            , [data.idActividad]);
          }
          
          data.trasladoOtro = trasladoOtro[0];
          break;
        case 4:
          const hotel = await pool.query(`
            SELECT 4 AS tipo, ha.*, c.nombre AS ciudad 
            FROM hotelesadquiridos ha
            INNER JOIN cotizaciones_destinos cd ON ha.idDestino = cd.idDestino
            INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
            INNER JOIN versiones V ON V.idActividad = ha.idHotelAdquirido
            WHERE V.idActividad = ${data.idActividad} AND V.tipo = 4 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
          `);
          const habitaciones: any = await pool.query(`SELECT * FROM hoteleshabitaciones WHERE idHotelAdquirido = ?`, [data.idActividad]);
          data.hotel = hotel[0];
          data.hotel.habitaciones = habitaciones;
          break;
        case 5:
          var vuelo: any[] = [];
          vuelo = await pool.query(`
          SELECT 5 AS tipo, 1 AS escala, vv.*, ve.idVueloEscala, ve.tiempo AS tiempoEscala, ve.lugar AS lugarEscala, ve.fecha AS fechaEscala, cd.idCiudad, c1.nombre AS origenN, c2.nombre AS destinoN
          FROM vuelos vv  
          INNER JOIN vueloescalas ve ON vv.idVuelo = ve.idVuelo 
          INNER JOIN ciudad c1 ON vv.origen = c1.idCiudad
          INNER JOIN ciudad c2 ON vv.destino = c2.idCiudad
          INNER JOIN versiones V ON V.idActividad=vv.idVuelo 
          INNER JOIN cotizaciones_destinos cd ON vv.idDestino = cd.idDestino  
          WHERE V.idActividad=${data.idActividad} AND V.tipo=5 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`, [data.idActividad]);
          data.vuelo = vuelo[0];
          if(vuelo.length !== 0){
            data.vuelo = vuelo[0];
          }else{
            vuelo = await pool.query(`
            SELECT 5 AS tipo, 0 AS escala, v.*, cd.idCiudad, c1.nombre AS origenN, c2.nombre AS destinoN
            FROM vuelos v
            INNER JOIN ciudad c1 ON v.origen = c1.idCiudad
            INNER JOIN ciudad c2 ON v.destino = c2.idCiudad
            INNER JOIN versiones VV ON VV.idActividad = v.idVuelo 
            INNER JOIN cotizaciones_destinos cd ON v.idDestino = cd.idDestino
            WHERE VV.idActividad=${data.idActividad} AND VV.tipo=5 AND VV.idCotizacion=${idCotizacion} AND VV.versionCotizacion=${versionCotizacion} AND VV.accion=1`, [data.idActividad]);
            data.vuelo = vuelo[0];
          }
          break;
        case 6:
          const tren = await pool.query(`
          SELECT 6 AS tipo, T.*, c1.nombre AS origenN, c2.nombre AS destinoN 
          FROM trenes T 
          INNER JOIN ciudad c1 ON T.origen = c1.idCiudad
          INNER JOIN ciudad c2 ON T.destino = c2.idCiudad
          INNER JOIN versiones V ON V.idActividad=T.idTren 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=6 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`);
          data.tren = tren[0];
          break;
        case 7:
          const producto = await pool.query(`
          SELECT pa.*, p.titulo, p.categoria, p.minimunViajeros, p.maximunViajeros, p.idCiudad, c.nombre AS ciudad
          FROM productosadquiridos pa
          INNER JOIN productos p ON pa.idProducto = p.idProducto
          INNER JOIN ciudad c ON p.idCiudad = c.idCiudad
          INNER JOIN versiones V ON V.idActividad=pa.idProductoAdquirido WHERE V.idActividad=${data.idActividad} AND V.tipo=7 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`
          , [data.idActividad]);
          if(producto[0] !== undefined && Object.keys(producto[0]).length > 0){
            switch(producto[0].categoria){
              case 1:
                producto[0].tipo = 71;
                data.tourPie = producto[0];
                break;
              case 2:
                producto[0].tipo = 72;
                data.tourTransporte = producto[0];
                break;
              case 3:
                producto[0].tipo = 73;
                data.tourGrupo = producto[0];
                break;
              case 4:
                producto[0].tipo = 74;
                data.actividad = producto[0];
                break; 
            }
          }
          break;
        case 8:
          const extra = await pool.query(`
          SELECT 8 AS tipo, e.*, c.nombre AS ciudad 
          FROM extras e 
          INNER JOIN ciudad c ON e.idCiudad = c.idCiudad  
          INNER JOIN versiones V ON V.idActividad=e.idExtras 
          WHERE V.idActividad=${data.idActividad} AND V.tipo=8 AND V.idCotizacion=${idCotizacion} AND V.versionCotizacion=${versionCotizacion} AND V.accion=1`, [data.idActividad]);
          data.extra = extra[0];
          break; 
      }
    }
    res.status(200).send({
      canasta: versionProducts,
      cotizacion: cotizacion[0],
      destinos: cotizacionDestinos
    });
  } 


  public async updateStatus(req: Request, res: Response): Promise<any> {
    const { idCotizacion } = req.params;
    const { body } = req;
    let canasta = await pool.query(`UPDATE canasta SET estatus = ${body.estatus} WHERE idCanasta > 0 AND idCotizacion = ${idCotizacion}`);
    let coti = await pool.query(`UPDATE cotizaciones SET estado = ${body.estatus} WHERE idCotizacion = ${idCotizacion}`);
    res.status(200).send({
      canasta,
      coti
    });
  }

  public async deleteProduct(req: Request, res: Response): Promise<any> {
    const { idProduct, idCotizacion, type } = req.params;
    let tipoProducto: number = 0;
    switch(type){
      case 'traslado':
        tipoProducto = 1;
        break;
      case 'disposicion':
        tipoProducto = 2;
        break;
      case 'trasladoOtro':
        tipoProducto = 3;
        break;
      case 'hotel':
        tipoProducto = 4;
        break;
      case 'vuelo':
        tipoProducto = 5;
        break;
      case 'tren':
        tipoProducto = 6;
        break;
      case 'tourPie':
      case 'tourTransporte':
      case 'tourGrupo':
      case 'actividad':
        tipoProducto = 7;
        break;
      case 'extra':
        tipoProducto = 8;
        break;
      case 'rentaVehiculo':
        tipoProducto = 12;
        break;
    }
    await removeByType(parseInt(idCotizacion), res, parseInt(idProduct), type, tipoProducto);
    reponse(res);
  }

  public async cancelarCotizacion(req: Request, res: Response): Promise<any> {
    const { idCotizacion, idsToDelete7 } = req.params;
    const products = await pool.query(`SELECT * FROM canasta WHERE idCotizacion = ?`, [idCotizacion]);
    if(products.length !== 0){
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ?`, [idCotizacion]);
      for(let product of products){ 
        switch(product.tipo){
          case 1:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'traslado', product.tipo);
            break;
          case 2:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'disposicion', product.tipo);
            break;
          case 3:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'trasladoOtro', product.tipo);
            break;
          case 4:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'hotel', product.tipo);
            eliminarImagenesHotel(product.idActividad);
            break;
          case 5:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'vuelo', product.tipo);
            break;
          case 6:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'tren', product.tipo);
            break;
          case 7:
            //TODO cambiar lógica para que sea mas clara
            if(idsToDelete7 !== '0'){
              let ids = idsToDelete7.split(',');
              ids.forEach((id: any) => {
                if(product.idActividad === parseInt(id)){
                  removeByType(parseInt(idCotizacion), res, product.idActividad, 'tourPie', product.tipo);
                }else if(product.idActividad === parseInt(id)){
                  removeByType(parseInt(idCotizacion), res, product.idActividad, 'tourTransporte', product.tipo);
                }else if(product.idActividad === parseInt(id)){
                  removeByType(parseInt(idCotizacion), res, product.idActividad, 'tourGrupo', product.tipo);
                }else if(product.idActividad === parseInt(id)){
                  removeByType(parseInt(idCotizacion), res, product.idActividad, 'actividad', product.tipo);
                }
              });
            }
            break;
          case 8:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'extra', product.tipo);
            break;
          case 12:
            await removeByType(parseInt(idCotizacion), res, product.idActividad, 'rentaVehiculo', product.tipo);
            break;
        }
      }
      await pool.query(`DELETE FROM notascotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM versionescotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM cotizacioneshistory WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM cotiz_dest_versiones WHERE idCotizacion = ? AND idDestino != 0`, [idCotizacion]);
      await pool.query(`DELETE FROM cotizaciones_destinos WHERE idCotizacion = ? AND idDestino != 0`, [idCotizacion]);
      await removeFilesCotizacion(parseInt(idCotizacion));
      await pool.query(`DELETE FROM timeline WHERE idCotizacion = ? AND idTimeline != 0`, [idCotizacion]);
      await pool.query(`DELETE FROM cotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
      reponse(res);
    }else{
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM notascotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM versionescotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM cotizacioneshistory WHERE idCotizacion = ?`, [idCotizacion]);
      await pool.query(`DELETE FROM cotiz_dest_versiones WHERE idCotizacion = ? AND idDestino != 0`, [idCotizacion]);
      await pool.query(`DELETE FROM cotizaciones_destinos WHERE idCotizacion = ? AND idDestino != 0`, [idCotizacion]);
      await removeFilesCotizacion(parseInt(idCotizacion));
      await pool.query(`DELETE FROM timeline WHERE idCotizacion = ? AND idTimeline != 0`, [idCotizacion]);
      await pool.query(`DELETE FROM cotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
      reponse(res);
    }
  }
}

const removeByType = (async(idCotizacion: number, res: Response, idProduct: number, type: string, tipoProducto: number) => {
  switch(type){
    case 'tourPie':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productosopcionesadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productostransporteadquirido WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM productosadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      break;
    case 'tourTransporte':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productosopcionesadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productostransporteadquirido WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM productosadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      break;
    case 'tourGrupo':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productosopcionesadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM productosadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      break;
    case 'actividad':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 7`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productosopcionesadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productostransporteadquirido WHERE idProductoAdquirido = ?`, [idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM productosadquiridos WHERE idProductoAdquirido = ?`, [idProduct]);
      break;
    case 'traslado':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 1`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 1`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM trasladosadquiridos WHERE idTrasladoAdquirido = ?`, [idProduct]);
      break;
    case 'disposicion':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 2`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 2`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM disposicionesadquiridas WHERE idDisposicionAdquirida = ?`, [idProduct]);
      break;
    case 'trasladoOtro':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 3`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 3`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM trasladosotros WHERE idTrasladoOtro = ?`, [idProduct]);
      break;
    case 'hotel':
      eliminarImagenesHotel(idProduct);
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 4`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 4`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM hotelesadquiridosupgrade WHERE idCotizacion = ? AND idHotelAdquirido = ? AND idHotelAdquiridoUpgrade != 0`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM hotelesadquiridosupgrademanual WHERE idCotizacion = ? AND idHotelAdquirido = ? AND idHotelAdquiridoUM != 0`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM hoteleshabitaciones WHERE idHotelAdquirido = ? AND idHotelHabitacion != 0`, [idProduct]);
      await pool.query(`DELETE FROM hotelesadquiridos WHERE idHotelAdquirido = ?`, [idProduct]);
      break;
    case 'vuelo':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 5`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 5`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM vueloescalas WHERE idVuelo = ?`, [idProduct]);
      await pool.query(`DELETE FROM vuelosupgrade WHERE idCotizacion = ? AND idVuelo = ? AND idVueloUpgrade != 0`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM vuelos WHERE idVuelo = ?`, [idProduct]);
      break;
    case 'tren':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 6`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 6`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM trenesupgrade WHERE idCotizacion = ? AND idTren = ? AND idTrenUpgrade != 0`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM trenes WHERE idTren = ?`, [idProduct]);
      break;
    case 'extra':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 8`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 8`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM productospreciostotales WHERE idCotizacion = ? AND idProducto = ? AND tipoProducto = ? AND idProductoPrecioTotal != 0`, [idCotizacion, idProduct, tipoProducto]);
      await pool.query(`DELETE FROM extras WHERE idExtras = ?`, [idProduct]);
      break;
    case 'rentaVehiculo':
      await pool.query(`DELETE FROM versiones WHERE idCotizacion = ? AND idActividad = ? AND tipo = 12`, [idCotizacion, idProduct]);
      await pool.query(`DELETE FROM canasta WHERE idCotizacion = ? AND idActividad = ? AND tipo = 12`, [idCotizacion, idProduct]);
      await eliminarImagenRentaVehiculo(idProduct);
      await pool.query(`DELETE FROM rentavehiculosupgrade WHERE idRentaVehiculoUpgrade != 0 AND idRentaVehiculo = ?`, [idProduct]);
      await pool.query(`DELETE FROM rentavehiculos WHERE idRentaVehiculo = ?`, [idProduct]);
      break;
  }
});

const reponse = ((res: Response) => {
  return res.status(200).send({
    status: 200,
    message: 'Eliminación exitosa'
  });
});

const eliminarImagenesHotel = (idHotel: number) => {
  if(fs.existsSync(`${path.join(__dirname, '../img/hotel1')}/${idHotel}.jpg`)){
    fs.unlink(`${path.join(__dirname, '../img/hotel1')}/${idHotel}.jpg`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
  }
  if(fs.existsSync(`${path.join(__dirname, '../img/hotel2')}/${idHotel}.jpg`)){
    fs.unlink(`${path.join(__dirname, '../img/hotel2')}/${idHotel}.jpg`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
  }

  if(fs.existsSync(`${path.join(__dirname, '../img/actualizacionHotel1')}/${idHotel}.jpg`)){
    fs.unlink(`${path.join(__dirname, '../img/actualizacionHotel1')}/${idHotel}.jpg`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
  }
  if(fs.existsSync(`${path.join(__dirname, '../img/actualizacionHotel2')}/${idHotel}.jpg`)){
    fs.unlink(`${path.join(__dirname, '../img/actualizacionHotel2')}/${idHotel}.jpg`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
  }
}

const removeFilesCotizacion = async(idCotizacion: number) => {
  const nameFiles: any = await pool.query(`SELECT nombre FROM archivoscotizaciones WHERE idCotizacion = ?`, [idCotizacion]);
  nameFiles.forEach(async(file: any) => {
    fs.unlink(`${path.join(__dirname, '../img/archivosCotizaciones')}/${file.nombre}`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
    await pool.query(`DELETE FROM archivoscotizaciones WHERE idCotizacion = ? AND idArchivoCotizacion != 0`, [idCotizacion]);
  });
};

const eliminarImagenRentaVehiculo = async(idRentaVehiculo: number) => {
  const dataU: any = await pool.query(`SELECT imagen FROM rentavehiculosupgrade WHERE idRentaVehiculo = ?`, [idRentaVehiculo]);
  if(dataU.length){
    fs.unlink(`${path.join(__dirname, '../img/imagenesRentaVehiculos')}/${dataU[0].imagen}`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
  }

  const data: any = await pool.query(`SELECT imagen FROM rentavehiculos WHERE idRentaVehiculo = ?`, [idRentaVehiculo]);
  if(data.length){
    fs.unlink(`${path.join(__dirname, '../img/imagenesRentaVehiculos')}/${data[0].imagen}`, (err) => {
      err ? console.log(err) : console.log('Archivo eliminado correctamente');
    });
  }
};

export const canastaController = new CanastaController();
