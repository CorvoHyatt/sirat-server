import { Request, Response } from "express";

import pool from "../database";
import { comisionesAgentesController } from "./comisionesAgentesController";

class AgentesController {

  public async actualizarUrgente(req: Request, res: Response): Promise<void> {
    const { idTrasladoAdquiridoInfo } = req.params;
    let update=`UPDATE trasladosadquiridosinfo SET urgente=1 WHERE idTrasladoAdquiridoInfo =${idTrasladoAdquiridoInfo}`;
    const resp = await pool.query(update);    
    res.json(resp);
  }
  public async actualizarFactura(req: Request, res: Response): Promise<void> {
    const { idFacturaActual,extFact } = req.params;   
    let datos=req.body[0];
    for(let data of datos)
    { 

      if(data.tipo==3||data.tipo==1)
      {      
        let update=`UPDATE trasladosadquiridosinfo SET factura=1 , nombreFactura='${idFacturaActual}.${extFact}' WHERE idTrasladoAdquiridoInfo=${data.productoInfo}`;    
        
        
        const resp = await pool.query(update);    
      }
      else if(data.tipo==4)//hoteles
      {
        let update=`UPDATE hotelesAdquiridosInfo SET factura=1 , nombreFactura='${idFacturaActual}.${extFact}' WHERE idHotelesAdquiridosInfo=${data.productoInfo}`;    
        
        
        const resp = await pool.query(update);    
      }
      else if(data.tipo==5)//vuelos
      {
        let update=`UPDATE vuelosInfo SET factura=1 , nombreFactura='${idFacturaActual}.${extFact}' WHERE idVueloInfo=${data.productoInfo}`;    
        
        
        const resp = await pool.query(update);    
      }
      else if(data.tipo==6)//Trenes
      {
        let update=`UPDATE trenesinfo SET factura=1 , nombreFactura='${idFacturaActual}.${extFact}' WHERE idTrenInfo=${data.productoInfo}`;    
        
        
        const resp = await pool.query(update);    
      }
      else if(data.tipo==8)//Extra
      {
        let update=`UPDATE extrasInfo SET factura=1 , nombreFactura='${idFacturaActual}.${extFact}' WHERE idExtrasInfo=${data.productoInfo}`;    
        
        
        const resp = await pool.query(update);    
      }

    }
    res.json(1);

    
  }

  public async create(req: Request, res: Response): Promise<void> {
    let agente = req.body[0];
    let comsiones = req.body[1];
    const resp = await pool.query('INSERT INTO agentes set ?', [agente]);
    let idAgente = resp.insertId;

    for (let index = 0; index < comsiones.length; index++) {
      delete comsiones[index].nombre;
      comsiones[index].idAgente = idAgente;
      const resp2 = await pool.query('INSERT INTO comisionesagentes set ?', [comsiones[index]]);
    }

    res.json(resp);

    
}

  
  
  public async listByIdAgencia(req: Request, res: Response): Promise<void> {
    const { idAgencia } = req.params;
    const respuesta = await pool.query(`SELECT * FROM agentes WHERE idAgencia = ${idAgencia} ORDER BY nombre ASC `);
    res.json(respuesta);
  }
  public async listAgentes(req: Request, res: Response): Promise<void> {
    const respuesta = await pool.query(`SELECT * FROM usuarios WHERE idArea=1 ORDER BY nombre ASC `);
    res.json(respuesta);
  }

  public async listTimelineByCotizacion(req: Request, res: Response): Promise<void> {
    const { idCotizacion } = req.params;
    let consulta=`SELECT * FROM timeline WHERE idCotizacion = ${idCotizacion} ORDER BY fecha ASC `
    const respuesta = await pool.query(consulta);    
    res.json(respuesta);
  }
  public async listCotizacionesAprobadas(req: Request, res: Response): Promise<void> {
    let consulta=`SELECT idCotizacion FROM cotizaciones 
    WHERE estado = 8 ORDER BY idCotizacion ASC `
    const respuesta = await pool.query(consulta);    
    res.json(respuesta);
  }
  public async listCotizacionAprobadasProductos(req: Request, res: Response): Promise<void> {
    const { idCotizacion} = req.params;

    let consulta=`
     SELECT  CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.*, PC.idProductoCosto FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idTrasladoAdquirido AND PC.idCotizacion=COT.idCotizacion
            WHERE  TAI.estado=0 AND CIP.principal=1 
            ORDER BY fechaDesde
            `;
      const respuesta = await pool.query(consulta);

    res.json(respuesta);
  }  
  public async listCotizacionAprobadasProductosSinFactura(req: Request, res: Response): Promise<void> {
    const { idCotizacion,ini,fin} = req.params;

    let consultaTraslado=`
     SELECT TAI.idCotizacion,TAI.idTrasladoAdquirido as id,TAI.idTrasladoAdquiridoInfo as idInfo, TAI.fechaDesde as fecha, TAI.tipo, TAI.tipoDesde, TAI.tipoHacia, CIP.nombre as nombrePasajero, COT.viajeroTel 
     FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idTrasladoAdquirido AND PC.idCotizacion=COT.idCotizacion
            WHERE  TAI.estado=0 AND fechaDesde>='${ini}' AND fechaDesde<='${fin}' AND CIP.principal=1 AND TAI.factura=0 AND PC.completado=1
            ORDER BY fechaDesde
            `;
            let consultaHoteles=`
      SELECT TAI.idCotizacion,HA.descripcion,TAI.idHotelAdquirido as id, TAI.idHotelesAdquiridosInfo as idInfo,TAI.checkin as fecha,4 as tipo,CIP.nombre as nombrePasajero, COT.viajeroTel 
            FROM hotelesAdquiridosInfo TAI 
            INNER JOIN hotelesadquiridos HA ON TAI.idHotelAdquirido=HA.idHotelAdquirido    
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idHotelAdquirido AND PC.idCotizacion=COT.idCotizacion
            WHERE  TAI.estado=0 AND TAI.checkin>='${ini}' AND TAI.checkin<='${fin}' AND CIP.principal=1 AND TAI.factura=0 AND PC.completado=1
            ORDER BY TAI.checkin            
            `;
            let consultaExtras=`
            SELECT TAI.idCotizacion, descripcion,idExtrasInfo as idInfo,fecha, idExtra as id,8 as tipo,CIP.nombre as nombrePasajero, COT.viajeroTel 
            FROM extrasInfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idExtra AND PC.idCotizacion=COT.idCotizacion
            WHERE  TAI.estado=0 AND fecha>='${ini}' AND fecha<='${fin}' AND CIP.principal=1 AND TAI.factura=0 AND PC.completado=1
            ORDER BY fecha            
            `;
            let consultaTrenes=`
            SELECT TAI.idCotizacion, idTrenInfo as idInfo,fecha,idTren as id,6 as tipo,CIP.nombre as nombrePasajero, COT.viajeroTel 
            FROM trenesinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idTren AND PC.idCotizacion=COT.idCotizacion
            WHERE  TAI.estado=0 AND fecha>='${ini}' AND fecha<='${fin}' AND CIP.principal=1 AND TAI.factura=0 AND PC.completado=1
            ORDER BY fecha            
            `;
            let consultaVuelos=`
            SELECT TAI.idCotizacion,idVueloInfo as idInfo,fecha ,idVuelo as id,5 as tipo,CIP.nombre as nombrePasajero, COT.viajeroTel 
            FROM vuelosInfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idVuelo AND PC.idCotizacion=COT.idCotizacion
            WHERE  TAI.estado=0 AND fecha>='${ini}' AND fecha<='${fin}' AND CIP.principal=1 AND TAI.factura=0 AND PC.completado=1
            ORDER BY fecha            
            `;
            let consultaProductos=`
            SELECT P.resumen as descripcion,TAI.idCotizacion,idProductosAdquiridosInfo as idInfo,fecha ,TAI.idProductoAdquirido as id,7 as tipo,CIP.nombre as nombrePasajero, COT.viajeroTel 
            FROM productosAdquiridosInfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion=${idCotizacion}
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idProductoAdquirido AND PC.idCotizacion=COT.idCotizacion
            INNER JOIN productos P ON P.idProducto=TAI.idProductoAdquirido  

            WHERE  TAI.estado=0 AND fecha>='${ini}' AND fecha<='${fin}' AND CIP.principal=1 AND TAI.factura=0 AND PC.completado=1
            ORDER BY fecha            
            `;
            const respuestaExtras = await pool.query(consultaExtras);
            const respuestaTraslados = await pool.query(consultaTraslado);
            const respuestaHoteles = await pool.query(consultaHoteles);            
            const respuestaTrenes = await pool.query(consultaTrenes);            
            const respuestaVuelos = await pool.query(consultaVuelos);            
            const respuestaProductos = await pool.query(consultaProductos);            
            let respuestatotal = respuestaTraslados.concat(respuestaExtras);
            respuestatotal = respuestatotal.concat(respuestaHoteles);
            respuestatotal = respuestatotal.concat(respuestaTrenes);
            respuestatotal = respuestatotal.concat(respuestaVuelos);
            respuestatotal = respuestatotal.concat(respuestaProductos);
            consultaTrenes
   
            res.json(respuestatotal);
  }  
  public async listCotizacionesAprobadasProductos(req: Request, res: Response): Promise<void> 
  {
    const { cotizaciones,ini,fin} = req.params;
    var divisiones = cotizaciones.split(",",1000);
    let consultaTralados=`
    SELECT TAI.fechaDesde as fecha,PC.completado as pagado,
    (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo, 
    PC.precioComprado,
    PC.costoCotizado,
    PC.tipo as tipoProducto, 
    DIVB.divisa,'TBD' as empresa, 
    C.nombre as nombreCiudad,
    AGS.idAgencia,AGS.nombre as nombreAgencia,
    TA.pasajeros,
    COT.viajeroTel,
    CONCAT(CIP.nombre, ' ', CIP.apellidos) as nombrePasajero,
    COT.viajeroTel,
    PC.idProductoCosto,
    TAI.*
    
    FROM trasladosadquiridosinfo TAI 
    INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion 
    INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
    INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
    INNER JOIN ciudad C ON C.idCiudad=TAI.idCiudad
    INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
    INNER JOIN trasladosadquiridos TA ON TA.idTrasladoAdquirido=TAI.idTrasladoAdquirido
    INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
    INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idTrasladoAdquirido AND PC.idCotizacion=COT.idCotizacion AND (PC.tipo=1)
    WHERE  TAI.estado=0 AND fechaDesde>='${ini}' AND fechaDesde<='${fin}'  AND CIP.principal=1 
    ORDER BY fechaDesde
            `;
    let consultaOtrosTraslados=`
    SELECT  TAI.fechaDesde as fecha, PC.completado as pagado,(SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,PC.precioComprado,PC.costoCotizado,PC.tipo as tipoProducto, DIVB.divisa,'TBD' as empresa, C.nombre as nombreCiudad,AGS.idAgencia,AGS.nombre as nombreAgencia,  TA.pasajeros ,COT.viajeroTel, CONCAT(CIP.nombre, ' ', CIP.apellidos) as nombrePasajero, COT.viajeroTel,TAI.*, PC.idProductoCosto FROM trasladosadquiridosinfo TAI 
    INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion 
    INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
    INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
    INNER JOIN ciudad C ON C.idCiudad=TAI.idCiudad
    INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
    INNER JOIN trasladosotros TA ON TA.idTrasladoOtro=TAI.idTrasladoAdquirido
    INNER JOIN divisas DIVB ON DIVB.idDivisa=TA.idDivisa
    INNER JOIN productoscostos PC ON PC.idProductoAdquirido = TAI.idTrasladoAdquirido AND PC.idCotizacion=COT.idCotizacion AND (PC.tipo=3)
    WHERE  TAI.estado=0 AND fechaDesde>='${ini}' AND fechaDesde<='${fin}'   AND CIP.principal=1 
    ORDER BY fechaDesde
    `;
    let consultaHoteles=`
    SELECT DISTINCT PC.completado as pagado, HAI.checkIn as fecha, (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,PC.precioComprado,PC.costoCotizado,PC.tipo as tipoProducto,DIVB.divisa,'TBD' as empresa, C.nombre as nombreCiudad,AGS.idAgencia,AGS.nombre as nombreAgencia,HA.nombre as descripcion, HA.direccion,HA.noPersonas as pasajeros ,HA.notas, COT.viajeroTel, CONCAT(CIP.nombre, ' ', CIP.apellidos) as nombrePasajero, COT.viajeroTel, PC.idProductoCosto,HAI.checkIn as fechaDesde, HAI.* 
    from hotelesAdquiridosInfo HAI    
    INNER JOIN cotizacioninformacionpasajeros CIP ON CIP.idCotizacion= HAI.idCotizacion     
    INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
    INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
    INNER JOIN ciudad C ON C.idCiudad=HAI.idCiudad
    INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
    INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
    INNER JOIN hotelesadquiridos HA ON HAI.idHotelAdquirido=HA.idHotelAdquirido    
    INNER JOIN hoteleshabitaciones HH ON HH.idHotelAdquirido=HA.idHotelAdquirido    
    INNER JOIN productoscostos PC ON PC.idProductoAdquirido = HAI.idHotelAdquirido AND PC.idCotizacion=COT.idCotizacion AND PC.tipo=4
    WHERE HAI.estado=0 AND HA.checkIn >='${ini}' AND HA.checkOut<='${fin}'  AND CIP.principal=1 
    `;
    let consultaTrenes=`
    SELECT PC.completado as pagado, (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,PC.precioComprado,PC.costoCotizado,PC.tipo as tipoProducto,DIVB.divisa,'TBD' as empresa, C.nombre as nombreCiudad,AGS.idAgencia,AGS.nombre as nombreAgencia, (HA.noViajerosMayores+HA.noViajerosMenores) as pasajeros ,COT.viajeroTel, CONCAT(CIP.nombre, ' ', CIP.apellidos) as nombrePasajero, COT.viajeroTel, PC.idProductoCosto,HA.clase,HA.notas, C2.nombre as destino,HAI.fecha as fechaDesde, HAI.* 
    from trenesinfo HAI    
    INNER JOIN cotizacioninformacionpasajeros CIP ON CIP.idCotizacion= HAI.idCotizacion     
    INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
    INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
    INNER JOIN ciudad C ON C.idCiudad=HAI.idOrigen
    INNER JOIN ciudad C2 ON C2.idCiudad=HAI.idDestino
    INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
    INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
    INNER JOIN trenes HA ON HAI.idTren=HA.idTren
    INNER JOIN productoscostos PC ON PC.idProductoAdquirido = HAI.idTren AND PC.idCotizacion=COT.idCotizacion AND PC.tipo=6
    WHERE HAI.estado=0 AND HA.fecha >='${ini}' AND HA.fecha<='${fin}' AND CIP.principal=1 
    `;
    let consultaVuelos=`
    SELECT PC.completado as pagado, (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,PC.precioComprado,PC.costoCotizado,PC.tipo as tipoProducto,DIVB.divisa,'TBD' as empresa, C.nombre as nombreCiudad,AGS.idAgencia,AGS.nombre as nombreAgencia, HA.noViajeros as pasajeros ,COT.viajeroTel, CONCAT(CIP.nombre, ' ', CIP.apellidos) as nombrePasajero, COT.viajeroTel, PC.idProductoCosto, C2.nombre as destino, HA.notas,HA.clase,HA.maletaPeso,HAI.fecha as fechaDesde, HAI.* 
    from vuelosInfo HAI  
    INNER JOIN cotizacioninformacionpasajeros CIP ON CIP.idCotizacion= HAI.idCotizacion     
    INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
    INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
    INNER JOIN ciudad C ON C.idCiudad=HAI.idOrigen
    INNER JOIN ciudad C2 ON C2.idCiudad=HAI.idDestino
    INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
    INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
    INNER JOIN vuelos HA ON HAI.idVuelo=HA.idVuelo
    INNER JOIN productoscostos PC ON PC.idProductoAdquirido = HAI.idVuelo AND PC.idCotizacion=COT.idCotizacion AND PC.tipo=5
    WHERE HAI.estado=0 AND HA.fecha >='${ini}' AND HA.fecha<='${fin}' AND CIP.principal=1 
    `;
    let consultaExtras=`
    SELECT PC.completado as pagado, (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,PC.precioComprado,PC.costoCotizado,PC.tipo as tipoProducto,DIVB.divisa,'TBD' as empresa, C.nombre as nombreCiudad,AGS.idAgencia,AGS.nombre as nombreAgencia, (COT.numM+COT.num18+COT.num12) as pasajeros ,COT.viajeroTel, CONCAT(CIP.nombre, ' ', CIP.apellidos) as nombrePasajero, COT.viajeroTel, PC.idProductoCosto,HA.notas,date_format(HA.fecha, "%Y-%m-%d") as fechaDesde,
    HAI.* 
    from extrasInfo HAI         
    INNER JOIN cotizacioninformacionpasajeros CIP ON CIP.idCotizacion= HAI.idCotizacion     
    INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
    INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
    INNER JOIN ciudad C ON C.idCiudad=HAI.idCiudad
    INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
    INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
    INNER JOIN extras HA ON HAI.idExtra=HA.idExtras    
    INNER JOIN productoscostos PC ON PC.idProductoAdquirido = HAI.idExtra AND PC.idCotizacion=COT.idCotizacion AND PC.tipo=8
    WHERE HAI.estado=0 AND HA.fecha >='${ini}' AND HA.fecha<='${fin}' AND CIP.principal=1 
        `;
    let consultaProductos=`
        SELECT P.resumen as descripcion, PC.completado as pagado, (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,
        PC.precioComprado,
        PC.costoCotizado,
        PC.tipo as tipoProducto,
        DIVB.divisa,'TBD' as empresa, 
        C.nombre as nombreCiudad,AGS.idAgencia,
        AGS.nombre as nombreAgencia, 
        (COT.numM+COT.num18+COT.num12) as pasajeros ,
        COT.viajeroTel, CONCAT(CIP.nombre, ' ', 
        CIP.apellidos) as nombrePasajero, 
        COT.viajeroTel, 
        PC.idProductoCosto,HA.notas,
        date_format(HAI.fecha, "%Y-%m-%d") as fechaDesde,
        HAI.* 
        from productosAdquiridosInfo HAI         
        INNER JOIN cotizacioninformacionpasajeros CIP ON CIP.idCotizacion= HAI.idCotizacion     
        INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
        INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
        INNER JOIN ciudad C ON C.idCiudad=HAI.idCiudad
        INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
        INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
        INNER JOIN productosadquiridos HA ON HAI.idProductoAdquirido=HA.idProductoAdquirido   
        INNER JOIN productos P ON P.idProducto=HA.idProductoAdquirido  
        INNER JOIN productoscostos PC ON PC.idProductoAdquirido = HAI.idProductoAdquirido AND PC.idCotizacion=COT.idCotizacion AND PC.tipo=7
        WHERE HAI.estado=0 AND HA.fecha >='${ini}' AND HA.fecha<='${fin}' AND CIP.principal=1 
            `;
    let consultaEntradas=`
        SELECT P.resumen as descripcion, PC.completado as pagado, (SELECT proximoPago FROM productosCostosParciales WHERE idProductoCosto=PC.idProductoCosto ORDER BY proximoPago LIMIT 1) as fechaUltimo,
        PC.precioComprado,
            PC.costoCotizado,
            PC.tipo as tipoProducto,
            DIVB.divisa,'TBD' as empresa, 
            C.nombre as nombreCiudad,AGS.idAgencia,
            AGS.nombre as nombreAgencia, 
            (COT.numM+COT.num18+COT.num12) as pasajeros ,
            COT.viajeroTel, CONCAT(CIP.nombre, ' ', 
            CIP.apellidos) as nombrePasajero, 
            COT.viajeroTel, 
            PC.idProductoCosto,HA.notas,
            date_format(HAI.fecha, "%Y-%m-%d") as fechaDesde,
            HAI.* 
            from productosAdquiridosInfo HAI         
            INNER JOIN cotizacioninformacionpasajeros CIP ON CIP.idCotizacion= HAI.idCotizacion     
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion AND COT.idCotizacion in (${divisiones})
            INNER JOIN  agentes AG ON AG.idAgente=COT.idAgente
            INNER JOIN ciudad C ON C.idCiudad=HAI.idCiudad
            INNER JOIN agencias AGS ON AGS.idAgencia=AG.idAgencia
            INNER JOIN divisasbase DIVB ON DIVB.idDivisaBase=COT.divisa
            INNER JOIN productosadquiridos HA ON HAI.idProductoAdquirido=HA.idProductoAdquirido   
            INNER JOIN productos P ON P.idProducto=HA.idProductoAdquirido  
            INNER JOIN productoscostos PC ON PC.idProductoAdquirido = HAI.idProductoAdquirido AND PC.idCotizacion=COT.idCotizacion AND PC.tipo=7
            WHERE HAI.estado=0 AND HA.fecha >='${ini}' AND HA.fecha<='${fin}' AND CIP.principal=1 
                `;
    
    const respuestaTraslados = await pool.query(consultaTralados);    
    
               
    const respuestaOtrosTraslados = await pool.query(consultaOtrosTraslados);
    const respuestaHoteles = await pool.query(consultaHoteles);                   
    const respuestaTrenes = await pool.query(consultaTrenes);                      
    const respuestaVuelos = await pool.query(consultaVuelos);                      
    const respuestaExtras = await pool.query(consultaExtras);                      
    const respuestaProductos = await pool.query(consultaProductos);                      
    let respuestatotal = respuestaTraslados.concat(respuestaOtrosTraslados);
    respuestatotal = respuestatotal.concat(respuestaHoteles);
    respuestatotal = respuestatotal.concat(respuestaTrenes);
    respuestatotal = respuestatotal.concat(respuestaVuelos);
    respuestatotal = respuestatotal.concat(respuestaExtras);
    respuestatotal = respuestatotal.concat(respuestaProductos);
    for(let data of respuestatotal)
    { 
      if(data.tipoProducto==1||data.tipoProducto==3)
      {
        data.id=data.idTrasladoAdquirido;
        let consultaAceptadosChoferes='SELECT empresa,AC.* FROM aceptadosChofer AC INNER JOIN choferes CH ON AC.idChofer=CH.idChofer WHERE AC.idTrasladoAdquiridoInfo='+data.idTrasladoAdquiridoInfo;
        const respuestaAcaptadosChoferes = await pool.query(consultaAceptadosChoferes);
        if(respuestaAcaptadosChoferes.length>0)
        {
          data.estado=2;
          data.empresa=respuestaAcaptadosChoferes[0].empresa;
        }
        else
        {
          let consultaRechazadosChoferes='SELECT empresa,AC.* FROM rechazadosChofer AC INNER JOIN choferes CH ON AC.idChofer=CH.idChofer WHERE AC.idTrasladoAdquiridoInfo='+data.idTrasladoAdquiridoInfo;
          const respuestaRechazadosChoferes = await pool.query(consultaRechazadosChoferes);
          if(respuestaRechazadosChoferes.length>0)
          {
            data.estado=3;
            data.empresa="TBD";
          }
        }
      }
      if(data.tipoProducto==4)
      {
        let consultaPasajeros="SELECT SUM(noPersonas) as pasajeros FROM hoteleshabitaciones WHERE idHotelAdquirido="+data.idHotelAdquirido;            
        let consultaHabitaciones="SELECT * FROM hoteleshabitaciones WHERE idHotelAdquirido="+data.idHotelAdquirido;            
        const respuestaPasajeros = await pool.query(consultaPasajeros);
        const respuestaHabitaciones = await pool.query(consultaHabitaciones);
        data.id=data.idHotelAdquirido;
        data.pasajeros=respuestaPasajeros[0].pasajeros;
        let texto="";
        for (let index = 0; index < respuestaHabitaciones.length; index++) 
        {
          texto+=' '+respuestaHabitaciones[index].cantidadHabitaciones+' habitacion(es) '+respuestaHabitaciones[index].tipoHabitacion+', categoria '+respuestaHabitaciones[index].tipoCategoria+' con cama '+respuestaHabitaciones[index].tipoCama;
        }
        data.descripcion+= ': '+texto;
        let consultaAceptadosEmpresa='SELECT empresa FROM aceptadosHotel WHERE idHotelesAdquiridosInfo='+data.idHotelesAdquiridosInfo;
        const respuestaAceptadosEmpresa = await pool.query(consultaAceptadosEmpresa);
        if(respuestaAceptadosEmpresa.length>0)
        {
          data.empresa=respuestaAceptadosEmpresa[0].empresa;
        }
      }
      if(data.tipoProducto==6)
      {        
        data.id=data.idTren;
        data.descripcion="A "+data.destino+" a las "+data.hora+" en clase "+data.clase;
        let consultaAceptadosEmpresa='SELECT empresa FROM aceptadosTren WHERE idTrenInfo='+data.idTrenInfo;
        const respuestaAceptadosEmpresa = await pool.query(consultaAceptadosEmpresa);
        if(respuestaAceptadosEmpresa.length>0)
        {
          data.empresa=respuestaAceptadosEmpresa[0].empresa;
        }
      }
      if(data.tipoProducto==5)
      {        
        data.id=data.idVuelo;
        data.descripcion="A "+data.destino+" a las "+data.horaSalida+" en clase "+data.clase+ " con peso máximo de maletas de: "+data.maletaPeso+" Kg.";
        let consultaAceptadosEmpresa='SELECT empresa FROM aceptadosVuelos WHERE idVueloInfo='+data.idVueloInfo;
        let consultaEscalas="SELECT * FROM vueloescalas WHERE idVuelo="+data.idVuelo;
        const respuestaEscala = await pool.query(consultaEscalas);
        const respuestaAceptadosEmpresa = await pool.query(consultaAceptadosEmpresa);
        if(respuestaAceptadosEmpresa.length>0)
        {
          data.empresa=respuestaAceptadosEmpresa[0].empresa;
        }
        if(respuestaEscala.length>0)
        {
          data.descripcion+=" con escala en "+respuestaEscala[0].lugar+" con "+respuestaEscala[0].tiempo+"de escala";
        }

      }
      if(data.tipoProducto==7)
      {
        data.id=data.idProductoAdquirido;
        let consultaAceptadosEmpresa='SELECT empresa FROM aceptadosProductos WHERE idProductoAdquiridoInfo='+data.idProductosAdquiridosInfo;
        let consultaOpcionalesAdquiridos='SELECT * FROM productosopcionesadquiridos WHERE idProductoAdquirido='+data.idProductoAdquirido;
        
        
        
        const respuestaAceptadosEmpresa = await pool.query(consultaAceptadosEmpresa);
        if(respuestaAceptadosEmpresa.length>0)
        {
          data.empresa=respuestaAceptadosEmpresa[0].empresa;
        }
      }      
      if(data.tipoProducto==8)
      {
        data.id=data.idExtra;
        data.idTrasladoAdquirido=data.idExtra;
        let consultaAceptadosEmpresa='SELECT empresa FROM aceptadosExtras WHERE idExtrasInfo='+data.idExtrasInfo;
        const respuestaAceptadosEmpresa = await pool.query(consultaAceptadosEmpresa);
        if(respuestaAceptadosEmpresa.length>0)
        {
          data.empresa=respuestaAceptadosEmpresa[0].empresa;
        }
      }      
    }
    res.json(respuestatotal);
  }
  public async listCotizacionesByAgente(req: Request, res: Response): Promise<void> {
    const { idUsuario } = req.params;
    let consulta=`SELECT * FROM usuarios U
    INNER JOIN cotizaciones CT ON CT.idUsuario=U.idUsuario
    WHERE U.idUsuario = ${idUsuario} ORDER BY idCotizacion ASC `
    const respuesta = await pool.query(consulta);    
    res.json(respuesta);
  }
  public async listByIdAgenciaWithAgencia(req: Request, res: Response): Promise<void> {
    
    const { idAgencia } = req.params;
    let respuesta;

    if (idAgencia == `-1`) {
      respuesta = await pool.query(`SELECT AA.nombre agencia, A.* FROM agentes A INNER JOIN agencias AA ON A.idAgencia=AA.idAgencia ORDER BY idAgente ASC`);
    } else {
      respuesta = await pool.query(`SELECT AA.nombre agencia, A.* FROM agentes A INNER JOIN agencias AA ON A.idAgencia=AA.idAgencia WHERE A.idAgencia = ${idAgencia} ORDER BY A.idAgente ASC`);
    }
    res.json(respuesta);
  }


  public async listComisionesByIdAgente(req: Request, res: Response): Promise<void> {
    const { idAgente } = req.params;
    const comisiones = await pool.query(`SELECT * FROM comisionesagentes WHERE idAgente = ${idAgente} `);
    let respuesta;
    for (let index = 0; index < comisiones.length; index++) {
      let nombre = ``;
      switch (comisiones[index].tipoActividad) {
        case 1:
          nombre = `Traslados`;
          break;
          case 2:
            nombre = `Disposiciones`;
          break;
          case 3:
            nombre = `Tours privados a pie`;
          break;
          case 4:
            nombre = `Tours privados en transporte`;
          break;
          case 5:
            nombre = `Tours de grupo`;
          break;
          case 6:
            nombre = `Actividades`;
          break;
          case 7:
            nombre = `Hoteles`;
          break;
          case 8:
            nombre = `Vuelos`;
          break;
          case 9:
            nombre = `Trenes`;
          break;
          case 10:
            nombre = `Extras`;
            break;
      }
     
      comisiones[index].nombre = nombre;
    }
    res.json(comisiones);
  }


  public async update(req: Request, res: Response): Promise<void> {
    const { idAgente } = req.params;
    let agente = req.body[0];
    let comsiones = req.body[1];
    delete agente.agencia;
    const resp = await pool.query(
      "UPDATE agentes SET ? WHERE idAgente = ?",
      [agente, idAgente]
    );

    
    const resp1 = await pool.query(
      "DELETE FROM comisionesagentes WHERE idAgente = ?",
      idAgente
    );


    for (let index = 0; index < comsiones.length; index++) {
      delete comsiones[index].nombre;
      comsiones[index].idAgente = idAgente;
      const resp = await pool.query('INSERT INTO comisionesagentes set ?', [comsiones[index]]);
    }
    res.json(`Agente actualizado`);

    
  }

  public async delete(req: Request, res: Response): Promise<void> {
    const { idAgente } = req.params;
    const respuesta = await pool.query(
      "DELETE FROM agentes WHERE idAgente = ?",
      idAgente
    );
    res.json(respuesta);
  }


}

export const agentesController = new AgentesController();
