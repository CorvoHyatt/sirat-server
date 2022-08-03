import { Request, Response } from 'express';
import pool from '../database';

class PagosParcialesController {

    public async create(req: Request, res: Response): Promise<void> {
        console.log("create pagosParcialesController",req.body);
        if(req.body.terminado=='true')
        req.body.terminado=1
        else
        req.body.terminado=0
        console.log("despues ",req.body);
        const resp = await pool.query("INSERT INTO productosCostosParciales set ?", [req.body]);
        await pool.query("UPDATE productoscostos SET precioComprado = precioComprado + ? WHERE idProductoCosto = ?", [req.body.pagoParcial, req.body.idProductoCosto]);
        if(req.body.terminado==1)
        {
            await pool.query("UPDATE productoscostos SET completado = 1 WHERE idProductoCosto = ?", [req.body.idProductoCosto]);
        }
        const pago = await pool.query(`
          SELECT fp.*, db.*
          FROM finanzas_pagos fp
          INNER JOIN divisasbase db ON fp.idDivisaBase = db.idDivisaBase
          WHERE fp.idPago = ?
        `, [resp.insertId]);
    
        res.json(resp.insertId);
    }

    public async historialPorProducto(req: Request, res: Response): Promise<any> {
        const { idProductoCosto } = req.params;
        let consulta=`
            SELECT pcp.*, d.divisa, (SELECT SUM(pagoParcial) FROM productosCostosParciales WHERE idProductoCosto=${idProductoCosto}) as suma
            FROM productosCostosParciales pcp
            INNER JOIN divisas d ON pcp.idDivisa = d.idDivisa
            WHERE pcp.idProductoCosto = ${idProductoCosto}
        `;
        console.log(consulta);
        const historialPagos = await pool.query(consulta);
        for(let i = 0; i < historialPagos.length; i++){
            const factura = await pool.query(`SELECT * FROM facturasParciales`);
            if(factura.length > 0) historialPagos[i].factura = factura[0];
        }
        res.json({
            historialPagos
        });
    }
    
    public async listPagoParcial(req: Request, res: Response): Promise<any> {
        const { idPagoParcial } = req.params;
        const pagoParcial = await pool.query(`SELECT * FROM productoscostosparciales WHERE idProductosCostosParciales = ${idPagoParcial}`);
        res.json({
            pago: pagoParcial[0] ? pagoParcial[0] : []
        });
    }
}
export const pagosParcialesController = new PagosParcialesController();