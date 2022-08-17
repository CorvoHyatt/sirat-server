import { Request, Response } from "express";
import pool from "../database";
//import { createNoSubstitutionTemplateLiteral } from "typescript";

class CanastaExtraController {
  public async getListTodosExtras(req: Request, res: Response): Promise<void> 
  {

  }

  public async getListTrasladosExtras(req: Request, res: Response): Promise<void> //tipo 1
  {
    const { idCotizacion} = req.params;
    const { idVersion} = req.params;
    let consultaTraslado=`SELECT 1 as tipo,C.nombre as lugar, V.nombre, L1.nombre as desde, L2.nombre as hacia , TAU.diferencia,TA.idTrasladoAdquirido as id,TAU.fecha
    FROM trasladoAdquiridoUpgrade TAU
    INNER JOIN vehiculo V ON V.idVehiculo=TAU.idVehiculo
    INNER JOIN trasladosadquiridos TA ON TA.idTrasladoAdquirido = TAU.idTrasladoAdquirido
    INNER JOIN traslados T ON T.idTraslado = TA.idTraslado
    INNER JOIN ciudad C ON T.idCiudad = C.idCiudad
    INNER JOIN lugares L1 ON L1.idLugar=T.idDesde
    INNER JOIN lugares L2 ON L2.idLugar=T.idHacia
    WHERE TAU.idCotizacion = ${idCotizacion}
    AND TAU.versionCotizacion=${idVersion}`;
    const cotizacionTraslado = await pool.query(consultaTraslado);
    res.json(cotizacionTraslado);
  }
  public async getListDisposicionesExtras(req: Request, res: Response): Promise<void> // tipo 2
  {
    const { idCotizacion} = req.params;
    const { idVersion} = req.params;
    let consultaDisposiciones=`SELECT C.nombre as lugar,DAU.diferencia,DAU.fecha,V.nombre as nombreVehiculo,L.nombre AS nombreLugar,2 as tipo,DA.idDisposicionAdquirida as id,DAU.fecha
    FROM disposicionesAdquiridasUpgrade DAU 
    INNER JOIN disposicionesadquiridas DA ON DA.idDisposicionAdquirida=DAU.idDisposicionAdquirida
    INNER JOIN disposiciones D ON DA.idDisposicion = D.idDisposicion 
    INNER JOIN ciudad C ON D.idCiudad = C.idCiudad 
    INNER JOIN lugares L ON D.idLugar = L.idLugar 
    INNER JOIN vehiculo V ON V.idVehiculo=DAU.idVehiculo
    WHERE DAU.idCotizacion = ${idCotizacion}
    AND DAU.versionCotizacion=${idVersion}`;
    
    const cotizacionDisposiciones = await pool.query(consultaDisposiciones);
    
    res.json(cotizacionDisposiciones);
  }
  public async getListOtroTrasladosExtras(req: Request, res: Response): Promise<void> // tipo 3
  {
    const { idCotizacion} = req.params;
    const { idVersion} = req.params;

    let consultaTraslado="";
    let consultaVerificar=`
    SELECT  desde,hacia 
    FROM trasladosOtrosUpgrade TOU
    INNER JOIN trasladosotros TOO ON TOO.idTrasladoOtro = TOU.idTrasladoOtro
    INNER JOIN versiones VEOT ON VEOT.idActividad=TOO.idTrasladoOtro  AND VEOT.idCotizacion=TOU.idCotizacion
    WHERE  TOU.idCotizacion = ${idCotizacion}
    AND VEOT.versionCotizacion=${idVersion}
    AND TOU.versionCotizacion=${idVersion}`;

    const lugares = await pool.query(consultaVerificar);
    if(lugares.length==0)
    {
      res.json(lugares);
    }
    else
    {
      const regex = /^[0-9]*$/;
      let trasladoOtro: any;
      if(regex.test(lugares[0].desde) && !regex.test(lugares[0].hacia))
      { 
        consultaTraslado=`SELECT 3 as tipo,C.nombre as lugar, V.nombre as nombreVehiculo,TOU.diferencia,l.nombre AS desde,TOO.hacia,TOO.idTrasladoOtro AS id,TOU.fecha
      FROM trasladosOtrosUpgrade TOU
      INNER JOIN vehiculo V ON V.idVehiculo=TOU.idVehiculo
      INNER JOIN trasladosotros TOO ON TOO.idTrasladoOtro = TOU.idTrasladoOtro
      INNER JOIN ciudad C ON TOO.idCiudad = C.idCiudad            
      INNER JOIN lugares l ON TOO.desde = l.idLugar
      INNER JOIN versiones VEOT ON VEOT.idActividad=TOO.idTrasladoOtro  AND VEOT.idCotizacion=TOU.idCotizacion
      WHERE idCotizacion = ${idCotizacion}
      AND VEOT.versionCotizacion=${idVersion}
      AND TOU.versionCotizacion=${idVersion}`;

      }
      else if(!regex.test(lugares[0].desde) && regex.test(lugares[0].hacia))
      {
        consultaTraslado=`SELECT 3 as tipo,C.nombre as lugar, V.nombre as nombreVehiculo,TOU.diferencia,l.nombre AS hacia,TOO.hacia,TOO.idTrasladoOtro AS id,TOU.fecha
      FROM trasladosOtrosUpgrade TOU
      INNER JOIN vehiculo V ON V.idVehiculo=TOU.idVehiculo
      INNER JOIN trasladosotros TOO ON TOO.idTrasladoOtro = TOU.idTrasladoOtro
      INNER JOIN ciudad C ON TOO.idCiudad = C.idCiudad            
      INNER JOIN lugares l ON TOO.hacia = l.idLugar
      INNER JOIN versiones VEOT ON VEOT.idActividad=TOO.idTrasladoOtro  AND VEOT.idCotizacion=TOU.idCotizacion
      WHERE idCotizacion = ${idCotizacion}
      AND VEOT.versionCotizacion=${idVersion}
      AND TOU.versionCotizacion=${idVersion}`;

      }
      else
      {
        consultaTraslado=`SELECT 3 as tipo,C.nombre as lugar, V.nombre as nombreVehiculo,TOU.diferencia,TOO.desde,TOO.hacia,TOO.idTrasladoOtro AS id,TOU.fecha
        FROM trasladosOtrosUpgrade TOU
        INNER JOIN vehiculo V ON V.idVehiculo=TOU.idVehiculo
        INNER JOIN trasladosotros TOO ON TOO.idTrasladoOtro = TOU.idTrasladoOtro
        INNER JOIN ciudad C ON TOO.idCiudad = C.idCiudad
        INNER JOIN versiones VEOT ON VEOT.idActividad=TOO.idTrasladoOtro  AND VEOT.idCotizacion=TOU.idCotizacion
        WHERE idCotizacion = ${idCotizacion}
        AND VEOT.versionCotizacion=${idVersion}
        AND TOU.versionCotizacion=${idVersion}`;

      }
  
       
      const cotizacionTraslado = await pool.query(consultaTraslado);
      res.json(cotizacionTraslado);
    }
  }
  public async getListHotelesExtras(req: Request, res: Response): Promise<void> // tipo 4
  {
    const { idCotizacion,idVersion} = req.params;
    var cotizacionHotelManual =[];
    var cotizacionHotelPre =[];
    let consultaTipoHotelManual=`SELECT HAUM.idHotelAdquirido
    FROM hotelesadquiridosupgrademanual HAUM 
    INNER JOIN hotelesadquiridos HA ON HA.idHotelAdquirido=HAUM.idHotelAdquirido
    INNER JOIN versiones VEH ON VEH.idActividad=HA.idHotelAdquirido  AND VEH.idCotizacion=HAUM.idCotizacion
    WHERE HAUM.idCotizacion = ${idCotizacion}
    AND VEH.versionCotizacion=${idVersion}
    AND HAUM.versionCotizacion=${idVersion}`;
    
    const hay = await pool.query(consultaTipoHotelManual);
    
    // Hoteles manuales
    if(hay.length!=0)
    {
      let consultaHotelManual=`SELECT SUM(HAU.diferencia) as diferencia, GROUP_CONCAT(HAU.tipoHabitacion SEPARATOR '@') as habitacion,DATE_FORMAT(HA.checkin, '%Y-%m-%d') as fecha,DATE_FORMAT(HA.checkout, '%Y-%m-%d') as fechaSalida,4 as tipo, HAUM.nombre, C.nombre as lugar,HAUM.estrellas ,HAUM.categoria as categoriaNombre,HA.direccion,HA.telefono,HA.desayuno,HAUM.hotel1,HAUM.hotel2,HA.idHotelAdquirido as id, HAUM.nombre as nuevoNombre
      FROM hotelesadquiridosupgrademanual HAUM 
      INNER JOIN hotelesadquiridosupgrade HAU ON HAU.idHotelAdquirido=HAUM.idHotelAdquirido
      INNER JOIN hotelesadquiridos HA ON HA.idHotelAdquirido=HAUM.idHotelAdquirido
      INNER JOIN cotizaciones_destinos CD ON CD.idDestino = HA.idDestino
      INNER JOIN ciudad C ON C.idCiudad = CD.idCiudad    
      INNER JOIN versiones VEH2 ON VEH2.idActividad=HA.idHotelAdquirido  AND VEH2.idCotizacion=HAUM.idCotizacion
      WHERE HAUM.idCotizacion = ${idCotizacion}
      AND VEH2.versionCotizacion=${idVersion}
      AND HAUM.versionCotizacion=${idVersion}
      GROUP BY HA.idHotelAdquirido
      `;
      
      cotizacionHotelManual = await pool.query(consultaHotelManual);
      
    }
    let consultaTipoHotelPrecargado=`SELECT DISTINCT HAU.idHotelAdquirido 
    FROM hotelesadquiridosupgrade HAU WHERE HAU.idCotizacion=${idCotizacion}
    AND HAU.idHotelAdquirido NOT IN
    (SELECT HAUM.idHotelAdquirido FROM hotelesadquiridosupgrademanual HAUM WHERE HAUM.idCotizacion=${idCotizacion})`;
    
    const hayPrecargado = await pool.query(consultaTipoHotelPrecargado);
    
    if(hayPrecargado.length!=0)
    {
      var ret = [];
      for (var i of hayPrecargado) 
        ret.push(i.idHotelAdquirido);
      
      let consultaHotelPre=`SELECT SUM(HAU.diferencia) as diferencia, GROUP_CONCAT(HAU.tipoHabitacion SEPARATOR '@') as habitacion,DATE_FORMAT(HA.checkin, '%Y-%m-%d') as fecha,DATE_FORMAT(HA.checkout, '%Y-%m-%d') as fechaSalida,4 as tipo, HA.nombre, HA.estrellas,C.nombre as lugar,HA.categoria as categoriaNombre,HA.direccion,HA.telefono,HA.desayuno,HAU.hotel1,HAU.hotel2,HA.idHotelAdquirido as id
      FROM hotelesadquiridosupgrade HAU 
      INNER JOIN hotelesadquiridos HA ON HA.idHotelAdquirido = HAU.idHotelAdquirido
      INNER JOIN cotizaciones_destinos CD ON CD.idDestino = HA.idDestino
      INNER JOIN ciudad C ON C.idCiudad = CD.idCiudad
      INNER JOIN versiones VEH3 ON VEH3.idActividad=HA.idHotelAdquirido  AND VEH3.idCotizacion=HAU.idCotizacion
      WHERE HAU.idHotelAdquirido in(${ret}) 
      AND VEH3.versionCotizacion=${idVersion}
      AND HAU.versionCotizacion=${idVersion}
      GROUP BY HA.idHotelAdquirido`;
      
      cotizacionHotelPre = await pool.query(consultaHotelPre);
      

    }
    const cotizacionHotel=cotizacionHotelManual.concat(cotizacionHotelPre);
    
    
    
    
    

    


    res.json(cotizacionHotel);
  }  
  public async getListVuelosExtras(req: Request, res: Response): Promise<void> //tipo 5
  {
    const { idCotizacion,idVersion} = req.params;
    let consultaVuelos=`SELECT V.idVuelo as id,VU.diferencia,VU.fecha,5 as tipo,C.nombre as lugar,VU.clase,C1.nombre as desde,C2.nombre as hacia
    FROM vuelosupgrade VU 
    INNER JOIN vuelos V ON V.idVuelo=VU.idVuelo 
    INNER JOIN cotizaciones_destinos CD ON CD.idDestino = V.idDestino
    INNER JOIN ciudad C ON C.idCiudad = CD.idCiudad
    INNER JOIN ciudad C1 ON C1.idCiudad=V.origen
    INNER JOIN ciudad C2 ON C2.idCiudad=V.destino
    WHERE VU.idCotizacion = ${idCotizacion}
    AND VU.versionCotizacion=${idVersion}`;

    const cotizacionVuelos = await pool.query(consultaVuelos);
    res.json(cotizacionVuelos);
  }

  public async getListTrenesExtras(req: Request, res: Response): Promise<void> // tipo 6
  {
    const { idCotizacion,idVersion} = req.params;
    let consultaTrenes=`SELECT T.idTren as id,TU.diferencia,TU.fecha,6 as tipo, TU.clase, C.nombre as lugar,C1.nombre as desde,C2.nombre as hacia
    FROM trenesupgrade TU 
    INNER JOIN trenes T ON T.idTren=TU.idTren
    INNER JOIN cotizaciones_destinos CD ON CD.idDestino = T.idDestino
    INNER JOIN ciudad C ON C.idCiudad = CD.idCiudad
    INNER JOIN ciudad C1 ON C1.idCiudad=T.origen
    INNER JOIN ciudad C2 ON C2.idCiudad=T.destino
    WHERE TU.idCotizacion = ${idCotizacion}
    AND TU.versionCotizacion=${idVersion}`;

    const cotizacionTrenes = await pool.query(consultaTrenes);
    res.json(cotizacionTrenes);
  }
  public async getListProductosExtras(req: Request, res: Response): Promise<void> // tipo 7
  {
    const { idCotizacion,idVersion} = req.params;
    let consultaProductos=`SELECT PAU.diferencia,PAU.fecha,7 as tipo,P.titulo,PO.nombre as nombreEntrada,PA.idProductoAdquirido as id
    FROM productosOpcionesAdquiridasUpgrade PAU 
    INNER JOIN productosadquiridos PA ON PA.idProductoAdquirido=PAU.idProductoAdquirido
    INNER JOIN productos P ON P.idProducto=PA.idProducto
    INNER JOIN productosopciones PO ON PO.idProductoOpcion=PAU.idProductoOpcion
    WHERE PAU.idCotizacion = ${idCotizacion}
    AND PAU.versionCotizacion=${idVersion}`;

    const cotizacionProductos = await pool.query(consultaProductos);
    res.json(cotizacionProductos);
  }
  public async getListProductosTrasporteExtras(req: Request, res: Response): Promise<void> // tipo 7a
  {
    const { idCotizacion,idVersion} = req.params;
    let consultaProductos=`SELECT PTU.diferencia,PTU.fecha,9 as tipo,P.titulo,V.nombre as nombreVehiculo,PA.idProductoAdquirido as id
    FROM productosTransportesUpgrade PTU 
    INNER JOIN productosadquiridos PA ON PA.idProductoAdquirido=PTU.idProductoAdquirido
    INNER JOIN productos P ON P.idProducto=PA.idProducto
    INNER JOIN vehiculo V ON V.idVehiculo=PTU.idVehiculo
    WHERE PTU.idCotizacion = ${idCotizacion}
    AND PTU.versionCotizacion=${idVersion}`;

    const cotizacionProductos = await pool.query(consultaProductos);
    res.json(cotizacionProductos);
  }
  /*
  public async getListHotelesManualesExtras(req: Request, res: Response): Promise<void> // tipo 4
  {
    const { idCotizacion} = req.params;
    let consultaHotelManual=`SELECT HAU.diferencia,DATE_FORMAT(HA.checkin, '%Y-%m-%d') as fecha,DATE_FORMAT(HA.checkout, '%Y-%m-%d') as fechaSalida,10 as tipo, HAU.nombre, C.nombre as lugar,HAU.estrellas ,HAU.categoria as categoriaNombre,HA.direccion,HA.telefono,HA.desayuno,HAU.hotel1,HAU.hotel2,HA.idHotelAdquirido as id, HAU.nombre as nuevoNombre
    FROM hotelesadquiridosupgrademanual HAU 
    INNER JOIN hotelesadquiridos HA ON HA.idHotelAdquirido=HAU.idHotelAdquirido
    INNER JOIN cotizaciones_destinos CD ON CD.idDestino = HA.idDestino
    INNER JOIN ciudad C ON C.idCiudad = CD.idCiudad
    WHERE HAU.idCotizacion = ${idCotizacion}`;
    const cotizacionHotelManual = await pool.query(consultaHotelManual);
    res.json(cotizacionHotelManual);
  }  
*/

}

export const canastaExtraController = new CanastaExtraController();
