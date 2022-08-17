import { Request, Response } from 'express';
import pool from '../database';

class HotelesController {

    public async create(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO hotelesadquiridos set ?", [req.body]);
        res.json(resp);
    }

    public async agregarHabitacion(req: Request, res: Response): Promise<void> {
        const resp = await pool.query("INSERT INTO hoteleshabitaciones set ?", [req.body]);
        res.json(resp);
    }

    public async agregarEmpresa(req: Request, res: Response): Promise<void> 
    {
        let consulta="SELECT * FROM aceptadosHotel WHERE idHotelesAdquiridosInfo="+req.body.idHotelesAdquiridosInfo;
        const respConsulta = await pool.query(consulta);
        
        if(respConsulta.length==0)
        {
            const resp = await pool.query("INSERT INTO aceptadosHotel set ?", [req.body]);
            res.json(resp);
        }
        else
        {
            const resp = await pool.query("UPDATE aceptadosHotel set empresa=? WHERE idHotelesAdquiridosInfo=?", [req.body.empresa,req.body.idHotelesAdquiridosInfo]);
            res.json(resp);
        }

    }


    public async upgradeHabitacion(req: Request, res: Response): Promise<any> {
        const resp = await pool.query("INSERT INTO hotelesadquiridosupgrade set ?", [req.body]);
        res.json(resp);
    }

    public async upgradeHotel(req: Request, res: Response): Promise<any> {
        const resp = await pool.query("INSERT INTO hotelesadquiridosupgrademanual set ?", [req.body]);
        res.json(resp);
    }

    public async getCategorias(req: Request, res: Response): Promise<any> {
        const categorias = await pool.query("SELECT * FROM hotelescategorias ORDER BY idCategoria");
        res.json(categorias);
    }

    public async getUpgrades(req: Request, res: Response): Promise<any> {
        const { tipoHotel, idHotel, idCotizacion } = req.params;
        let hotelUpgrade: any = [];
        let hotelHabitacionesUpgrade: any = [];
        switch (parseInt(tipoHotel)) {
            case 0:
                hotelHabitacionesUpgrade = await pool.query(`
                    SELECT 1 AS conMejoras, hu.*, hh.cantidadHabitaciones, hh.noPersonas
                    FROM hoteleshabitaciones hh
                    INNER JOIN hotelesadquiridosupgrade hu ON hh.idHotelHabitacion = hu.idHabitacion
                    WHERE hu.idHotelAdquirido = ? AND idCotizacion = ?
                `, [idHotel, idCotizacion]);
            break;
            case 1:
                hotelUpgrade = await pool.query("SELECT true AS adding, hm.* FROM hotelesadquiridosupgrademanual hm WHERE hm.idHotelAdquirido = ? AND hm.idCotizacion = ?", [idHotel, idCotizacion]);
                hotelHabitacionesUpgrade = await pool.query(`
                    SELECT hu.*, hh.cantidadHabitaciones, hh.noPersonas
                    FROM hoteleshabitaciones hh
                    INNER JOIN hotelesadquiridosupgrade hu ON hh.idHotelHabitacion = hu.idHabitacion
                    WHERE hu.idHotelAdquirido = ? AND idCotizacion = ?
                `, [idHotel, idCotizacion]);
            break;
        }
        res.json({
            hotelUpgrade,
            hotelHabitacionesUpgrade
        });
    }

    public async updateHotel(req: Request, res: Response): Promise<any> {
        const { idHotelAdquirido } = req.params;
        try{
            await pool.query('UPDATE hotelesadquiridos SET ? WHERE idHotelAdquirido = ?', [req.body, idHotelAdquirido]);
            res.json({
                status: 'success',
                msg: 'Hotel actualizado correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al actualizar hotel'
            });
        }
    }

    public async updateHabitacion(req: Request, res: Response): Promise<any> {
        const { idHotelHabitacion } = req.params;
        try{
            await pool.query('UPDATE hoteleshabitaciones SET ? WHERE idHotelHabitacion = ?', [req.body, idHotelHabitacion]);
            res.json({
                status: 'success',
                msg: 'Habitación actualizada correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al actualizar habitación'
            });
        }
    }

    public async updateHabitacionUpgrade(req: Request, res: Response): Promise<any> {
        const { idHabitacion } = req.params;
        try{
            await pool.query(`UPDATE hotelesadquiridosupgrade SET ? WHERE idHabitacion = ?`, [req.body, idHabitacion]);
            res.json({
                status: 'success',
                msg: 'Habitación actualizada correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al actualizar habitación'
            });
        }
    }

    public async updateHotelUpgrade(req: Request, res: Response): Promise<any> {
        const { idHotelAdquiridoUM } = req.params;
        try{
            await pool.query('UPDATE hotelesadquiridosupgrademanual SET ?  WHERE idHotelAdquiridoUM = ?', [req.body, idHotelAdquiridoUM]);
            res.json({
                status: 'success',
                msg: 'Mejoras actualizadas correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al actualizar mejoras'
            });
        }
    }

    public async updateHotelHabitacionesUpgrade(req: Request, res: Response): Promise<any> {
        const { idHotelAdquiridoUM } = req.params;
        try{
            await pool.query('UPDATE hotelesadquiridosupgrademanual SET ?  WHERE idHotelAdquiridoUM = ?', [req.body[0], idHotelAdquiridoUM]);
            for(let mejoraHabitacion of req.body[1]){
                await pool.query('UPDATE hotelesadquiridosupgrade SET ?  WHERE idHotelAdquiridoUpgrade = ?', [mejoraHabitacion, mejoraHabitacion.idHotelAdquiridoUpgrade]);
            }
            res.json({
                status: 'success',
                msg: 'Mejoras actualizadas correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al actualizar mejoras'
            });
        }
    }

    public async deleteUpgradesManual(req: Request, res: Response): Promise<any> {
        const { idHotelAdquirido } = req.params;
        try{
            await pool.query('DELETE FROM hotelesadquiridosupgrade WHERE idHotelAdquirido = ?', [idHotelAdquirido]);
            await pool.query('DELETE FROM hotelesadquiridosupgrademanual WHERE idHotelAdquirido = ?', [idHotelAdquirido]);
            res.json({
                status: 'success',
                msg: 'Mejoras eliminadas correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al eliminar mejoras'
            });
        }
    }

    public async deleteHabitacion(req: Request, res: Response): Promise<any> {
        const { idHotelHabitacion } = req.params;
        try{
            await pool.query('DELETE FROM hotelesadquiridosupgrade WHERE idHabitacion = ?', [idHotelHabitacion]);
            await pool.query('DELETE FROM hotelesHabitaciones WHERE idHotelHabitacion = ?', [idHotelHabitacion]);
            res.json({
                status: 'success',
                msg: 'Habitación eliminada correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al eliminar habitación'
            });
        }
    }

    public async deleteUpgradeHabitacion(req: Request, res: Response): Promise<any> {
        const { idHabitacion } = req.params;
        try{
            await pool.query('DELETE FROM hotelesadquiridosupgrade WHERE idHabitacion = ?', [idHabitacion]);
            res.json({
                status: 'success',
                msg: 'Mejora eliminada correctamente'
            });
        }catch(error){
            console.log(error);
            res.json({
                status: 'error',
                error,
                msg: 'Error al eliminar mejora'
            });
        }
    }


    public async insertInfoExtra(req: Request, res: Response): Promise<any> {
        try {
            let precioComprado = req.body.precioComprado;
            let costoNeto = req.body.costoNeto; 

            delete req.body.precioComprado;
            delete req.body.costoNeto;
            delete req.body.nombre;

            const resp = await pool.query("INSERT INTO hotelesAdquiridosInfo set ?", [req.body]);
            const costoProducto = await pool.query(`INSERT INTO productoscostos (idProductoAdquirido,idCotizacion,tipo,costoCotizado,costoNeto,precioComprado,completado) VALUES (${req.body.idHotelAdquirido}, ${req.body.idCotizacion}, 4, ${precioComprado},${costoNeto}, 0, 0)`);

            res.json(resp); 
        }catch (error) {
          console.log(error); 
        } 
      }
    
      public async updateInfoExtra(req: Request, res: Response): Promise<any> {
        try {
            const { idHotelesAdquiridosInfo } = req.params;
            delete req.body.precioComprado;
            delete req.body.costoNeto;
            delete req.body.nombre;
  

          const resp = await pool.query(`UPDATE hotelesAdquiridosInfo SET ? WHERE idHotelesAdquiridosInfo = ${idHotelesAdquiridosInfo}`, [req.body]);
          res.json(resp);
        }catch (error) {
          console.log(error); 
        }
      }
}

export const hotelesController = new HotelesController();