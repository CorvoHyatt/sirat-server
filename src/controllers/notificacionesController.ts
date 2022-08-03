import { Request, Response } from 'express';
import pool from '../database';
import Pusher from 'pusher';
import moment from 'moment';

class NotificacionesController {

    public async create(req: Request, res: Response): Promise<void> {
            
        const { idArea } = req.params;
        let notificacion = req.body;
        notificacion.data = JSON.stringify(notificacion.data);
       
        var pusher: any = new Pusher({
            appId: "1217136",
            key: "f7e8a37d1ad14888fa5d",
            secret: "de0c01d76c3776a1de05",
            cluster: "us2"
        });

        let caducidad = notificacion.caducidad;
        let hoy = moment();
        switch (hoy.weekday()) {
            case 5:
                caducidad += 2;
                break;
            case 6:
                caducidad += 1;
                break;  
            case 7:
                caducidad += 1;
                break;  
        }

        if (notificacion.receptor == -1) {
            const receptores = await pool.query(`SELECT idUsuario FROM usuarios WHERE idArea= ${idArea}`);
            for (let index = 0; index < receptores.length; index++) {
                notificacion.receptor = receptores[index].idUsuario;
                notificacion.caducidad = moment().add(caducidad, 'd').toDate();
                const nuevaNotificacion = await pool.query(`INSERT INTO notificaciones set ?`, notificacion);
                notificacion.idNotificacion = nuevaNotificacion.insertId;
                pusher.trigger(`channel-notification-${receptores[index].idUsuario}`, `new-notification-${receptores[index].idUsuario}`, {
                    notificacion
                });
                notificacion.idNotificacion = 0;
            }
            
            res.json("Notificación enviada");
        } else {
            notificacion.caducidad = moment().add(caducidad, 'd').toDate();
            const nuevaNotificacion = await pool.query(`INSERT INTO notificaciones set ?`, notificacion);
            notificacion.idNotificacion = nuevaNotificacion.insertId;
            pusher.trigger(`channel-notification-${notificacion.receptor}`, `new-notification-${notificacion.receptor}`, {
                notificacion
            });
            res.json("Notificación enviada");
        }
    }


    public async count_sinFinalizar(req: Request, res: Response): Promise<any> {
        const { idUsuario } = req.params;
        const respuesta = await pool.query(`SELECT COUNT(idNotificacion) as c FROM notificaciones WHERE receptor=${idUsuario} AND estatus=0`);
       // console.log(`count sin finalizar`,respuesta);
        res.json(respuesta[0].c);
    }

    public async count_byReceptorTipoEstatus(req: Request, res: Response): Promise<any> {
        const { idUsuario, tipo, estatus } = req.params;

        const respuesta = await pool.query(`SELECT COUNT(*) as c FROM notificaciones WHERE tipo=${tipo} AND receptor=${idUsuario} AND estatus=${estatus}`);
        res.json(respuesta[0].c);
    }

    public async count_sinFinalizarTPLPNotas(req: Request, res: Response): Promise<any> {
        const { idUsuario } = req.params;
        let datos:any={};
        const respuesta1 = await pool.query(`SELECT COUNT(*) as c FROM notificaciones WHERE tipo=1 AND receptor=${idUsuario} AND estatus=0`);
        const respuesta2 = await pool.query(`SELECT COUNT(*) as c FROM notificaciones WHERE tipo=2 AND receptor=${idUsuario} AND estatus=0`);
        const respuesta3 = await pool.query(`SELECT COUNT(*) as c FROM notificaciones WHERE tipo=3 AND receptor=${idUsuario} AND estatus=0`);

        datos.tareasPendientes = respuesta1[0].c;
        datos.llamadasPendientes = respuesta2[0].c;
        datos.notas = respuesta3[0].c;

       res.json(datos);
    }

    public async list_AreasSinFinalizar(req: Request, res: Response): Promise<any> {
        const { idUsuario,estatus,tipo } = req.params;
        const respuesta = await pool.query(`SELECT DISTINCT U.idArea, A.nombre FROM notificaciones N INNER JOIN usuarios U ON N.emisor=U.idUsuario INNER JOIN areas A ON A.idArea=U.idArea WHERE receptor=${idUsuario} AND estatus=${estatus} AND tipo=${tipo} ORDER BY A.nombre ASC`);
        res.json(respuesta);
    }


    public async listAll_ByIdUsuarioEstatusTipoArea(req: Request, res: Response): Promise<any> {
        const { idUsuario,estatus,tipo, idArea } = req.params;
        const respuestas = await pool.query(`SELECT N.*, U.nombre FROM notificaciones N INNER JOIN usuarios U ON N.emisor= U.idUsuario WHERE N.receptor=${idUsuario} AND estatus=${estatus} AND tipo=${tipo} AND U.idArea=${idArea} ORDER BY N.createAt DESC`);
        //console.log(`*****************SELECT N.*, U.nombre FROM notificaciones N INNER JOIN usuarios U ON N.emisor= U.idUsuario WHERE N.receptor=${idUsuario} AND estatus=${estatus} AND tipo=${tipo} AND U.idArea=${idArea} ORDER BY N.createAt DESC*****************`);
        respuestas.forEach((respuesta: any) => {
            respuesta.data = JSON.parse(respuesta.data);
        });
        res.json(respuestas);
    }

    public async listAll_ByIdAreaIdUsuario(req: Request, res: Response): Promise<any> {
        const { idArea, idUsuario } = req.params;
        let notificaciones;
        if (idUsuario == "-1") { //Se eligen todos los usuarios
             notificaciones = await pool.query(`SELECT N.*, U.idUsuario idUsuarioReceptor,U.nombre nombreUsuarioReceptor, U.correo correoReceptor , U2.idUsuario idUsuarioEmisor, U2.nombre nombreUsuarioEmisor, U2.correo correoEmisor FROM notificaciones N INNER JOIN usuarios U ON N.receptor=U.idUsuario INNER JOIN usuarios U2 ON N.emisor=U2.idUsuario WHERE U.idArea=${idArea} ORDER BY createAt ASC`);
        } else {
            notificaciones = await pool.query(`SELECT N.*, U.idUsuario idUsuarioReceptor,U.nombre nombreUsuarioReceptor, U.correo correoReceptor , U2.idUsuario idUsuarioEmisor, U2.nombre nombreUsuarioEmisor, U2.correo correoEmisor FROM notificaciones N INNER JOIN usuarios U ON N.receptor=U.idUsuario INNER JOIN usuarios U2 ON N.emisor=U2.idUsuario WHERE U.idUsuario=${idUsuario} ORDER BY createAt ASC`);
        }
        res.json(notificaciones);
        
    }

    public async update(req: Request, res: Response): Promise<void> {
        const { idNotificacion } = req.params;
        delete req.body.nombre;
        delete req.body.createAt;
        delete req.body.caducidad;
        req.body.data = JSON.stringify(req.body.data);

        const resp = await pool.query('UPDATE notificaciones SET ?  WHERE idNotificacion = ?', [req.body, idNotificacion]);
        res.json(resp);
    }

    public async listOne(req: Request, res: Response): Promise<any> {
        const { idNotificacion } = req.params;

        const notificacion = await pool.query(`
            SELECT n.*, u.nombre
            FROM notificaciones n
            INNER JOIN usuarios u ON n.emisor = u.idUsuario
            WHERE n.idNotificacion = ${idNotificacion}
        `);
    res.json(notificacion[0]); 
    }

    public async listAllFinanzas(req: Request, res: Response): Promise<any> {
        const notificaciones = await pool.query(`
            SELECT n.*, u.nombre
            FROM notificaciones n
            INNER JOIN usuarios u ON n.emisor = u.idUsuario
            WHERE n.receptor = 19 AND n.estatus = 0
            ORDER BY n.createAt DESC
        `);
        res.json(notificaciones);
    }

}

export const notificacionesController = new NotificacionesController();