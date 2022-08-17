import pool from "./database";
import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import Pusher from 'pusher';

class Reminders {
    public app: Application;
    public pusher: any = new Pusher({
        appId: "1217136",
        key: "f7e8a37d1ad14888fa5d",
        secret: "de0c01d76c3776a1de05",
        cluster: "us2"
    });
    constructor() {
        this.app = express();
        this.config();
    } 

    config(): void {
        this.app.set('port', process.env.PORT || 5500);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.urlencoded({ extended: false }));
    }

    async revisarNotificacionesPorFecha(){
        const notificaciones = await pool.query(`
        SELECT n.*, u.nombre, a.nombre AS area
        FROM notificaciones n 
        INNER JOIN usuarios u ON n.emisor = u.idUsuario
        INNER JOIN areas a ON u.idArea = a.idArea
        WHERE n.caducidad >= NOW() AND n.receptor = 1`);
        notificaciones.map((notificacion: any) => {
            let data = JSON.parse(notificacion.data);
            var notification: any;
            switch(notificacion.tipo){
                case 1: // Tarea pendiente
                    notification = {
                        asunto: notificacion.asunto,
                        text: data.tarea,
                        prioridad: notificacion.prioridad,
                        limite: notificacion.caducidad,
                        emisor: notificacion.nombre,
                        area: notificacion.area,
                        type: notificacion.tipo
                    };
                    break;
                case 2: // Llamada pendiente
                    notification = {
                        asunto: notificacion.asunto,
                        motivo: data.motivo,
                        nombre: data.nombre,
                        tel: data.numero,
                        prioridad: notificacion.prioridad,
                        limite: notificacion.caducidad,
                        emisor: notificacion.nombre,
                        area: notificacion.area,
                        type: notificacion.tipo
                    };
                    break;
                case 3: // Notas
                    notification = {
                        asunto: notificacion.asunto,
                        nota: data,
                        prioridad: notificacion.prioridad,
                        limite: notificacion.caducidad,
                        emisor: notificacion.nombre,
                        area: notificacion.area,
                        type: notificacion.tipo
                    };
                    break;
            }
            this.pusher.trigger(`channel-reminder-notifications-${notificacion.receptor}`, `new-reminder-notifications-${notificacion.receptor}`, {
                notification
            });
        });
    }

    start() {
        
        this.revisarNotificacionesPorFecha();
    }
}

const reminders = new Reminders();
reminders.start();
