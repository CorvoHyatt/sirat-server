import { Request, Response } from "express";
import pool from "../database";

class ProductosVentaController {

    public async getProductosVenta(req: Request, res: Response): Promise<void> {
      const { idCotizacion, versionCotizacion, filtro } = req.params;
      const cotizacionDestinos = await pool.query(`
        SELECT cd.*, c.nombre AS ciudad, p.id AS idPais, p.nombre AS pais
        FROM cotizaciones_destinos cd
        INNER JOIN ciudad c ON cd.idCiudad = c.idCiudad
        INNER JOIN pais p ON c.idPais = p.id
        where cd.idCotizacion = ${idCotizacion} AND cd.versionCotizacion <= ${versionCotizacion}
        ORDER BY c.nombre
      `);
      const cotizacion = await pool.query(`
        SELECT c.*, d.idDivisaBase, d.divisa, a.idAgencia
        FROM cotizaciones c
        INNER JOIN divisasbase d ON c.divisa = d.idDivisaBase
        INNER JOIN agentes a ON c.idAgente = a.idAgente
        WHERE c.idCotizacion = ? AND c.version = ?`
      , [idCotizacion, versionCotizacion]);

      cotizacionDestinos.forEach((destino: any) => destino.productos = []);

      let versionProducts = await pool.query(`
        SELECT v.* FROM versiones v
        INNER JOIN cotizaciones co ON v.idCotizacion = co.idCotizacion
        WHERE v.idCotizacion = ? AND v.versionCotizacion = ? AND v.accion = 1`
      , [idCotizacion, versionCotizacion]);

      for(let data of versionProducts){
        switch(data.tipo){
          case 1:
            const traslado = await pool.query(`
              SELECT 1 AS tipo, ta.idTrasladoAdquirido, ta.tarifa, ta.descripcion, ta.comision, ta.comisionAgente, t.idCiudad, ta.opcional
              FROM trasladosadquiridos ta
              INNER JOIN traslados t ON ta.idTraslado = t.idTraslado
              INNER JOIN versiones V ON V.idActividad = ta.idTrasladoAdquirido
              WHERE V.idActividad = ${data.idActividad} AND ta.opcional = ${filtro} AND V.tipo = 1 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(traslado.length > 0){
              const costosT = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 1 AND idCotizacion = ${idCotizacion}
              `);
              traslado[0].idProductoCosto = costosT.length > 0 ? costosT[0].idProductoCosto : 0;
              traslado[0].precioComprado = costosT.length > 0 ? costosT[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoT = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 1 AND idCotizacion = ${idCotizacion} AND idReembolso != 0 AND eliminado = 0
                `);
                traslado[0].cantidadMXN = reembolsoT.length > 0 ? reembolsoT[0].cantidadMXN : -1;
                traslado[0].cantidadDivisa = reembolsoT.length > 0 ? reembolsoT[0].cantidadDivisa : -1;
                traslado[0].com5R = reembolsoT.length > 0 ? reembolsoT[0].com5R : 0;
                traslado[0].comAR = reembolsoT.length > 0 ? reembolsoT[0].comAR : 0;
                traslado[0].porcentaje = reembolsoT.length > 0 ? reembolsoT[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoT.length > 0 ? reembolsoT[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoT.length > 0 ? reembolsoT[0].completado : 0;
              }
            }
            data.traslado = traslado[0];
          break;
          case 2:
            const disposicion = await pool.query(`
              SELECT 2 AS tipo, da.idDisposicionAdquirida, da.tarifa, da.descripcion, da.comision, da.comisionAgente, d.idCiudad
              FROM disposicionesadquiridas da 
              INNER JOIN disposiciones d ON da.idDisposicion = d.idDisposicion 
              INNER JOIN versiones V ON V.idActividad = da.idDisposicionAdquirida 
              WHERE V.idActividad = ${data.idActividad} AND da.opcional = ${filtro} AND V.tipo = 2 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(disposicion.length > 0){
              const costosD = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 2 AND idCotizacion = ${idCotizacion}
              `);
              disposicion[0].idProductoCosto = costosD.length > 0 ? costosD[0].idProductoCosto : 0;
              disposicion[0].precioComprado = costosD.length > 0 ? costosD[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoD = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 2 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                disposicion[0].cantidadMXN = reembolsoD.length > 0 ? reembolsoD[0].cantidadMXN : -1;
                disposicion[0].cantidadDivisa = reembolsoD.length > 0 ? reembolsoD[0].cantidadDivisa : -1;
                disposicion[0].com5R = reembolsoD.length > 0 ? reembolsoD[0].com5R : 0;
                disposicion[0].comAR = reembolsoD.length > 0 ? reembolsoD[0].comAR : 0;
                traslado[0].porcentaje = reembolsoD.length > 0 ? reembolsoD[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoD.length > 0 ? reembolsoD[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoD.length > 0 ? reembolsoD[0].completado : 0;
              }
            }
            data.disposicion = disposicion[0];
          break;
          case 3:
            const trasladoOtro = await pool.query(`
              SELECT 3 AS tipo, t.idTrasladoOtro, t.idCiudad, t.comision, t.comisionAgente, t.tarifa
              FROM trasladosotros t
              INNER JOIN versiones V ON V.idActividad = t.idTrasladoOtro
              WHERE V.idActividad = ${data.idActividad} AND t.opcional = ${filtro} AND V.tipo = 3 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(trasladoOtro.length > 0){
              const costosTO = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 3 AND idCotizacion = ${idCotizacion}
              `);
              trasladoOtro[0].idProductoCosto = costosTO.length > 0 ? costosTO[0].idProductoCosto : 0;
              trasladoOtro[0].precioComprado = costosTO.length > 0 ? costosTO[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoTO = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 3 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                trasladoOtro[0].cantidadMXN = reembolsoTO.length > 0 ? reembolsoTO[0].cantidadMXN : -1;
                trasladoOtro[0].cantidadDivisa = reembolsoTO.length > 0 ? reembolsoTO[0].cantidadDivisa : -1;
                trasladoOtro[0].com5R = reembolsoTO.length > 0 ? reembolsoTO[0].com5R : 0;
                trasladoOtro[0].comAR = reembolsoTO.length > 0 ? reembolsoTO[0].comAR : 0;
                traslado[0].porcentaje = reembolsoTO.length > 0 ? reembolsoTO[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoTO.length > 0 ? reembolsoTO[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoTO.length > 0 ? reembolsoTO[0].completado : 0;
              }
            }
            data.trasladoOtro = trasladoOtro[0];
          break;
          case 4:
            const hotel = await pool.query(`
              SELECT 4 AS tipo, ha.idHotelAdquirido, ha.comision, ha.comisionAgente, ha.tarifaTotal AS tarifa, ha.descripcion, ha.idDestino, ha.cityTax, ha.desayuno, ha.otros, ha.checkIn, ha.checkOut, ha.idDestino
              FROM hotelesadquiridos ha
              INNER JOIN versiones V ON V.idActividad = ha.idHotelAdquirido
              WHERE V.idActividad = ${data.idActividad} AND ha.opcional = ${filtro} AND V.tipo = 4 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(hotel.length > 0){
              const costosH = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 4 AND idCotizacion = ${idCotizacion}
              `);
              hotel[0].idProductoCosto = costosH.length > 0 ? costosH[0].idProductoCosto : 0;
              hotel[0].precioComprado = costosH.length > 0 ? costosH[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoH = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 4 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                hotel[0].cantidadMXN = reembolsoH.length > 0 ? reembolsoH[0].cantidadMXN : -1;
                hotel[0].cantidadDivisa = reembolsoH.length > 0 ? reembolsoH[0].cantidadDivisa : -1;
                hotel[0].com5R = reembolsoH.length > 0 ? reembolsoH[0].com5R : 0;
                hotel[0].comAR = reembolsoH.length > 0 ? reembolsoH[0].comAR : 0;
                traslado[0].porcentaje = reembolsoH.length > 0 ? reembolsoH[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoH.length > 0 ? reembolsoH[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoH.length > 0 ? reembolsoH[0].completado : 0;
              }
            }
            data.hotel = hotel[0];
          break;
          case 5:
            const vuelo = await pool.query(`
              SELECT 5 AS tipo, vv.idVuelo, vv.comision, vv.comisionAgente, vv.tarifa, vv.descripcion, vv.idDestino
              FROM vuelos vv  
              INNER JOIN versiones V ON V.idActividad = vv.idVuelo 
              WHERE V.idActividad = ${data.idActividad} AND vv.opcional = ${filtro} AND V.tipo = 5 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(vuelo.length > 0){
              const costosV = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 5 AND idCotizacion = ${idCotizacion}
              `);
              vuelo[0].idProductoCosto = costosV.length > 0 ? costosV[0].idProductoCosto : 0;
              vuelo[0].precioComprado = costosV.length > 0 ? costosV[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoV = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 5 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                vuelo[0].cantidadMXN = reembolsoV.length > 0 ? reembolsoV[0].cantidadMXN : -1;
                vuelo[0].cantidadDivisa = reembolsoV.length > 0 ? reembolsoV[0].cantidadDivisa : -1;
                vuelo[0].com5R = reembolsoV.length > 0 ? reembolsoV[0].com5R : 0;
                vuelo[0].comAR = reembolsoV.length > 0 ? reembolsoV[0].comAR : 0;
                traslado[0].porcentaje = reembolsoV.length > 0 ? reembolsoV[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoV.length > 0 ? reembolsoV[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoV.length > 0 ? reembolsoV[0].completado : 0;
              }
            }
            data.vuelo = vuelo[0];
          break;
          case 6:
            const tren = await pool.query(`
              SELECT 6 AS tipo, T.idTren, T.comision, T.comisionAgente, T.tarifa, T.descripcion, T.idDestino
              FROM trenes T 
              INNER JOIN versiones V ON V.idActividad=T.idTren 
              WHERE V.idActividad = ${data.idActividad} AND T.opcional = ${filtro} AND V.tipo = 6 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(tren.length > 0){
              const costosTren = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 6 AND idCotizacion = ${idCotizacion}
              `);
              tren[0].idProductoCosto = costosTren.length > 0 ? costosTren[0].idProductoCosto : 0;
              tren[0].precioComprado = costosTren.length > 0 ? costosTren[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoTren = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 6 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                tren[0].cantidadMXN = reembolsoTren.length > 0 ? reembolsoTren[0].cantidadMXN : -1;
                tren[0].cantidadDivisa = reembolsoTren.length > 0 ? reembolsoTren[0].cantidadDivisa : -1;
                tren[0].com5R = reembolsoTren.length > 0 ? reembolsoTren[0].com5R : 0;
                tren[0].comAR = reembolsoTren.length > 0 ? reembolsoTren[0].comAR : 0;
                traslado[0].porcentaje = reembolsoTren.length > 0 ? reembolsoTren[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoTren.length > 0 ? reembolsoTren[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoTren.length > 0 ? reembolsoTren[0].completado : 0;
              }
            }
            data.tren = tren[0];
          break;
          case 7:
            const producto = await pool.query(`
              SELECT pa.idProductoAdquirido, pa.comision, pa.comisionAgente, pa.tarifa, p.titulo, p.idCiudad, p.categoria
              FROM productosadquiridos pa
              INNER JOIN productos p ON pa.idProducto = p.idProducto
              INNER JOIN versiones V ON V.idActividad = pa.idProductoAdquirido 
              WHERE V.idActividad = ${data.idActividad} AND pa.opcional = ${filtro} AND V.tipo = 7 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(producto.length > 0){
              const costosP = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 7 AND idCotizacion = ${idCotizacion}
              `);
              producto[0].idProductoCosto = costosP.length > 0 ? costosP[0].idProductoCosto : 0;
              producto[0].precioComprado = costosP.length > 0 ? costosP[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoP = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 7 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                producto[0].cantidadMXN = reembolsoP.length > 0 ? reembolsoP[0].cantidadMXN : -1;
                producto[0].cantidadDivisa = reembolsoP.length > 0 ? reembolsoP[0].cantidadDivisa : -1;
                producto[0].com5R = reembolsoP.length > 0 ? reembolsoP[0].com5R : 0;
                producto[0].comAR = reembolsoP.length > 0 ? reembolsoP[0].comAR : 0;
                traslado[0].porcentaje = reembolsoP.length > 0 ? reembolsoP[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoP.length > 0 ? reembolsoP[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoP.length > 0 ? reembolsoP[0].completado : 0;
              }
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
              SELECT 8 AS tipo, e.idExtras, e.comision, e.comisionAgente, e.tarifa, e.idDestino, e.extras
              FROM extras e 
              INNER JOIN versiones V ON V.idActividad = e.idExtras 
              WHERE V.idActividad = ${data.idActividad} AND e.opcional = ${filtro} AND V.tipo = 8 AND V.idCotizacion = ${idCotizacion} AND V.versionCotizacion = ${versionCotizacion} AND V.accion = 1
            `);
            if(extra.length > 0){
              const costosE = await pool.query(`
                SELECT idProductoCosto, precioComprado
                FROM productoscostos
                WHERE idProductoAdquirido = ${data.idActividad} AND tipo = 8 AND idCotizacion = ${idCotizacion}
              `);
              extra[0].idProductoCosto = costosE.length > 0 ? costosE[0].idProductoCosto : 0;
              extra[0].precioComprado = costosE.length > 0 ? costosE[0].precioComprado : 0;
              if(parseInt(filtro) === 2){
                const reembolsoE = await pool.query(`
                  SELECT *
                  FROM finanzas_reembolsos
                  WHERE idProducto = ${data.idActividad} AND tipo = 8 AND idCotizacion = ${idCotizacion} AND idReembolso != 0
                `);
                extra[0].cantidadMXN = reembolsoE.length > 0 ? reembolsoE[0].cantidadMXN : -1;
                extra[0].cantidadDivisa = reembolsoE.length > 0 ? reembolsoE[0].cantidadDivisa : -1;
                extra[0].com5R = reembolsoE.length > 0 ? reembolsoE[0].com5R : 0;
                extra[0].comAR = reembolsoE.length > 0 ? reembolsoE[0].comAR : 0;
                traslado[0].porcentaje = reembolsoE.length > 0 ? reembolsoE[0].porcentaje : 0;
                traslado[0].cantidadNeta = reembolsoE.length > 0 ? reembolsoE[0].cantidadNeta : 0;
                traslado[0].pagoCompletado = reembolsoE.length > 0 ? reembolsoE[0].completado : 0;
              }
            }
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

    public async actualizarEstadoProducto(req: Request, res: Response): Promise<any> {
      const { idProducto, tabla, primaryKey, estado } = req.params;
      const query = await pool.query(`UPDATE ${tabla} SET opcional = ${estado} WHERE ${primaryKey} = ${idProducto}`);
      res.status(200).send(query);
    }

    public async actualizarEliminacionProducto(req: Request, res: Response): Promise<any> {
      const { idProducto, tabla, primaryKey, eliminado } = req.params;
      const query = await pool.query(`UPDATE ${tabla} SET eliminado = ${eliminado} WHERE ${primaryKey} = ${idProducto}`);
      res.status(200).send(query);
    }
}

export const productosVentaController = new ProductosVentaController();
