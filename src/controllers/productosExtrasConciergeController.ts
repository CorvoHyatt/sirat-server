import { Request, Response } from "express";

import pool from "../database";

class ProductosExtrasConciergeController {

    public async getProductoExtraConcierge(req: Request, res: Response): Promise<void> {
        const { idProducto, tipo } = req.params;
        let productoExtra: any;
        switch(parseInt(tipo)){
            case 1:
                const traslado = await pool.query(`
                    SELECT 1 AS tipo, ta.idTrasladoAdquiridoConcierge, ta.tarifa, ta.descripcion, ta.comision, ta.comisionAgente, ta.politicasExtra
                    FROM trasladosadquiridosconcierge ta
                    WHERE ta.idTrasladoAdquiridoConcierge = ${idProducto}
                `);
                productoExtra = traslado[0];
                break;
            case 2:
                const disposicion = await pool.query(`
                    SELECT 2 AS tipo, da.idDisposicionAdquiridaConcierge, da.tarifa, da.descripcion, da.comision, da.comisionAgente, da.politicasExtra
                    FROM disposicionesadquiridasconcierge da 
                    WHERE da.idDisposicionAdquiridaConcierge = ${idProducto}
                `);
                productoExtra = disposicion[0];
                break;
            case 3:
                const trasladoOtro = await pool.query(`
                    SELECT 3 AS tipo, t.idTrasladoOtroConcierge, t.idCiudad, t.comision, t.comisionAgente, t.tarifa, t.politicasExtra
                    FROM trasladosotrosconcierge t
                    WHERE t.idTrasladoOtroConcierge = ${idProducto}
                `);
                productoExtra = trasladoOtro[0];
                break;
            case 4:
                const hotel = await pool.query(`
                    SELECT 4 AS tipo, ha.idHotelAdquiridoConcierge, ha.comision, ha.comisionAgente, ha.tarifaTotal AS tarifa, ha.descripcion, ha.idDestino, ha.cityTax, ha.desayuno, ha.otros, ha.checkIn, ha.checkOut, ha.idDestino, ha.politicasExtra
                    FROM hotelesadquiridosconcierge ha
                    WHERE ha.idHotelAdquiridoConcierge = ${idProducto}
                `);
                productoExtra = hotel[0];
              break;
            case 5:
                var vuelo: any[] = [];
                vuelo = await pool.query(`
                    SELECT 5 AS tipo, v.idVueloConcierge, v.comision, v.comisionAgente, v.tarifa, v.descripcion, v.politicasExtra
                    FROM vuelosconcierge v 
                    WHERE v.idVueloConcierge = ${idProducto}
                `);
                productoExtra = vuelo[0];
                break;
            case 6:
                const tren = await pool.query(`
                    SELECT 6 AS tipo, t.idTrenConcierge, t.comision, t.comisionAgente, t.tarifa, t.descripcion, t.politicasExtra
                    FROM trenesconcierge t 
                    WHERE t.idTrenConcierge = ${idProducto}
                `);
                productoExtra = tren[0];
              break;
            case 7:
                const producto = await pool.query(`
                    SELECT pa.idProductoAdquiridoConcierge, pa.comision, pa.comisionAgente, pa.tarifa, p.titulo, p.idCiudad, p.categoria, pa.politicasExtra
                    FROM productosadquiridosconcierge pa
                    INNER JOIN productos p ON pa.idProducto = p.idProducto
                    WHERE pa.idProductoAdquiridoConcierge = ${idProducto}
                `);
                productoExtra = producto[0];
                // if(producto[0] !== undefined && Object.keys(producto[0]).length > 0){
                //     switch(producto[0].categoria){
                //         case 1:
                //         producto[0].tipo = 71;
                //         productoExtra = producto[0];
                //         break;
                //         case 2:
                //         producto[0].tipo = 72;
                //         productoExtra = producto[0];
                //         break;
                //         case 3:
                //         producto[0].tipo = 73;
                //         productoExtra = producto[0];
                //         break;
                //         case 4:
                //         producto[0].tipo = 74;
                //         productoExtra = producto[0];
                //         break; 
                //     }
                // }
                break;
            case 8:
                const extra = await pool.query(`
                    SELECT 8 AS tipo, e.*
                    FROM extrasconcierge e 
                    WHERE e.idExtrasConcierge = ${idProducto}
                `);
                productoExtra = extra[0];
                break;
        }
        res.status(200).send({
            productoExtra
        });
    }

    public async getProductosExtrasConcierge(req: Request, res: Response): Promise<void> {
        const { idCotizacion } = req.params;
        const productosExtras = await pool.query(`
            SELECT *
            FROM productosextrasconcierge
            WHERE idCotizacion = ?
        `, [idCotizacion]);

        for(let data of productosExtras){
            switch(data.tipo){
                case 1:
                    const traslado = await pool.query(`
                    SELECT 1 AS tipo, ta.idTrasladoAdquiridoConcierge, ta.tarifa, ta.descripcion, ta.comision, ta.comisionAgente, ta.politicasExtra
                    FROM trasladosadquiridosconcierge ta
                    WHERE ta.idTrasladoAdquiridoConcierge = ${data.idActividad}`);
                    data.traslado = traslado[0];
                    break;
                case 2:
                    const disposicion = await pool.query(`
                        SELECT 2 AS tipo, da.idDisposicionAdquiridaConcierge, da.tarifa, da.descripcion, da.comision, da.comisionAgente, da.politicasExtra
                        FROM disposicionesadquiridasconcierge da 
                        WHERE da.idDisposicionAdquiridaConcierge = ${data.idActividad}
                    `);
                    data.disposicion = disposicion[0];
                    break;
                case 3:
                    const trasladoOtro = await pool.query(`
                    SELECT 3 AS tipo, t.idTrasladoOtroConcierge, t.idCiudad, t.comision, t.comisionAgente, t.tarifa, t.politicasExtra
                    FROM trasladosotrosconcierge t
                    WHERE t.idTrasladoOtroConcierge = ${data.idActividad}`);
                    data.trasladoOtro = trasladoOtro[0];
                    break;
                case 4:
                    const hotel = await pool.query(`
                        SELECT 4 AS tipo, ha.idHotelAdquiridoConcierge, ha.comision, ha.comisionAgente, ha.tarifaTotal AS tarifa, ha.descripcion, ha.idDestino, ha.cityTax, ha.desayuno, ha.otros, ha.checkIn, ha.checkOut, ha.idDestino, ha.politicasExtra
                        FROM hotelesadquiridosconcierge ha
                        WHERE ha.idHotelAdquiridoConcierge = ${data.idActividad}
                    `);
                    data.hotel = hotel[0];
                  break;
                case 5:
                    var vuelo: any[] = [];
                    vuelo = await pool.query(`
                    SELECT 5 AS tipo, v.idVueloConcierge, v.comision, v.comisionAgente, v.tarifa, v.descripcion, v.politicasExtra
                    FROM vuelosconcierge v 
                    WHERE v.idVueloConcierge = ${data.idActividad}`);
                    data.vuelo = vuelo[0];
                    break;
                case 6:
                    const tren = await pool.query(`
                        SELECT 6 AS tipo, t.idTrenConcierge, t.comision, t.comisionAgente, t.tarifa, t.descripcion, t.politicasExtra
                        FROM trenesconcierge t 
                        WHERE t.idTrenConcierge = ${data.idActividad}
                    `);
                    data.tren = tren[0];
                  break;
                case 7:
                    const producto = await pool.query(`
                        SELECT pa.idProductoAdquiridoConcierge, pa.comision, pa.comisionAgente, pa.tarifa, p.titulo, p.idCiudad, p.categoria, pa.politicasExtra
                        FROM productosadquiridosconcierge pa
                        INNER JOIN productos p ON pa.idProducto = p.idProducto
                        WHERE pa.idProductoAdquiridoConcierge = ${data.idActividad}
                    `);
                    data.producto = producto[0];
                    // if(producto[0] !== undefined && Object.keys(producto[0]).length > 0){
                    //     switch(producto[0].categoria){
                    //         case 1:
                    //         producto[0].tipo = 71;
                    //         data.tourPie = producto[0];
                    //         break;
                    //         case 2:
                    //         producto[0].tipo = 72;
                    //         data.tourTransporte = producto[0];
                    //         break;
                    //         case 3:
                    //         producto[0].tipo = 73;
                    //         data.tourGrupo = producto[0];
                    //         break;
                    //         case 4:
                    //         producto[0].tipo = 74;
                    //         data.actividad = producto[0];
                    //         break; 
                    //     }
                    // }
                    break;
                case 8:
                    const extra = await pool.query(`
                        SELECT 8 AS tipo, e.*
                        FROM extrasconcierge e 
                        WHERE e.idExtrasConcierge = ${data.idActividad}
                    `);
                    data.extra = extra[0];
                    break;
            }
        }
        res.status(200).send({
            productosExtras
        });
    }


    public async getTotalExtrasConcierge(req: Request, res: Response): Promise<void> {
        const { idCotizacion } = req.params;
        let total: number = 0;
        const productosExtras = await pool.query(`
            SELECT *
            FROM productosextrasconcierge
            WHERE idCotizacion = ?
        `, [idCotizacion]);

        for(let data of productosExtras){
            switch(data.tipo){
                case 1:
                    const traslado = await pool.query(`
                        SELECT tarifa, comision, comisionAgente
                        FROM trasladosadquiridosconcierge 
                        WHERE idTrasladoAdquiridoConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += traslado.length > 0 ? calcularComision(traslado[0].comision, traslado[0].comisionAgente, traslado[0].tarifa) : 0;
                    break;
                case 2:
                    const disposicion = await pool.query(`
                        SELECT tarifa, comision, comisionAgente
                        FROM disposicionesadquiridasconcierge
                        WHERE idDisposicionAdquiridaConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += disposicion.length > 0 ? calcularComision(disposicion[0].comision, disposicion[0].comisionAgente, disposicion[0].tarifa) : 0;
                    break;
                case 3:
                    const trasladoOtro = await pool.query(`
                        SELECT comision, comisionAgente, tarifa
                        FROM trasladosotrosconcierge
                        WHERE idTrasladoOtroConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += trasladoOtro.length > 0 ? calcularComision(trasladoOtro[0].comision, trasladoOtro[0].comisionAgente, trasladoOtro[0].tarifa) : 0;
                    break;
                case 4:
                    const hotel = await pool.query(`
                        SELECT comision, comisionAgente, tarifaTotal AS tarifa, cityTax, desayuno, otros, checkIn, checkOut
                        FROM hotelesadquiridosconcierge
                        WHERE idHotelAdquiridoConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    if(hotel.length > 0){
                        //TODO calcular días de hospedaje
                        let base: number = calcularComision(hotel[0].comision, hotel[0].comisionAgente, hotel[0].tarifa);
                        total += (base + hotel[0].cityTax + hotel[0].desayuno + hotel[0].otros);
                    }
                  break;
                case 5:
                    const vuelo = await pool.query(`
                        SELECT comision, comisionAgente, tarifa
                        FROM vuelosconcierge
                        WHERE idVueloConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += vuelo.length > 0 ? calcularComision(vuelo[0].comision, vuelo[0].comisionAgente, vuelo[0].tarifa) : 0;
                    break;
                case 6:
                    const tren = await pool.query(`
                        SELECTcomision, comisionAgente, tarifa
                        FROM trenesconcierge
                        WHERE idTrenConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += tren.length > 0 ? calcularComision(tren[0].comision, tren[0].comisionAgente, tren[0].tarifa) : 0;
                  break;
                case 7:
                    const producto = await pool.query(`
                        SELECT comision, comisionAgente, tarifa
                        FROM productosadquiridosconcierge
                        WHERE idProductoAdquiridoConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += producto.length > 0 ? calcularComision(producto[0].comision, producto[0].comisionAgente, producto[0].tarifa) : 0;
                    break;
                case 8:
                    const extra = await pool.query(`
                        SELECT comision, comisionAgente, tarifa
                        FROM extrasconcierge
                        WHERE idExtrasConcierge = ${data.idActividad} AND politicasExtra = 'Viajero'
                    `);
                    total += extra.length > 0 ? calcularComision(extra[0].comision, extra[0].comisionAgente, extra[0].tarifa) : 0;
                    break;
            }
        }
        res.status(200).send({
            total
        });
    }
}

const calcularComision = (com: number, comAgente: number, tarifa: number) => {
    let comisionRives = (com / 100);
    let comisionAgente = comAgente / 100;
    const total = tarifa * (1 + comisionRives) * (1 + (comisionAgente / (1 - comisionAgente)));
    return total;
}

export const productosExtrasConciergeController = new ProductosExtrasConciergeController();
