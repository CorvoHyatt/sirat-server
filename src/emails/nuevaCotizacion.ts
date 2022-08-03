import { Response } from "express";
const email = require("emailjs/email");
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class NuevaCotizacion{
    public server: any;
    public data: any;
    public res: Response; 
    constructor(data: any, res: Response){
        this.data = data;
        this.res = res;
        this.suscribeToEmail();
    }
    suscribeToEmail(){
        this.server = email.server.connect({
            user: "desarrollo@5rives.com",
            password: "desarrollo2021",
            host: "smtp.gmail.com",
            port: 587,
            tls: true,
        });
    }

    message(){
        const message = {
            from: `Contactos cinq rives <webmaster@5rives.com>`,
            to: `${this.data.user} <${this.data.email}>`,
            bcc: ``,
            subject: `${this.data.subject}`,
            attachment:
                [
                    {
                        data: `
                            Estimado(a) <strong>Pedro Antonio</strong>
                            <br>
                            <br>
                            Esperamos que se encuentre muy bien,  enviamos este correo para conocer su opinión sobre su cotización “Num cotización”,
                             esperamos que le haya gustado nuestra propuesta, quedamos a su disposición para cualquier cambio. 
                            <br>
                            <br>
                            <strong>Link  de cotización:</strong> https://docs.google.com/document/d/${this.data.documentId}
                            <br>
                            <br>
                            <br>
                            AVISO: Este correo electrónico es confidencial y para uso exclusivo de la (s) persona (s) a quien (es) se dirige. Si el lector de esta transmisión electrónica no es el destinatario, se le notifica que cualquier distribución o copia de la misma está estrictamente prohibida. Si ha recibido este correo por error, le suplicamos notificar inmediatamente a la persona que lo envió y borrarlo definitivamente de su sistema.
                            <br>
                            <br>
                            NOTICE: This electronic mail transmission is confidential, may be privileged and should be read or retained only by the intended recipient. If the reader of this transmission is not the intended recipient, you are hereby notified that any distribution or copying herof is strictly prohibited. If you have received this transmission in error, please inmediatly notify the sender and delete it from your system.
            
                            `
                        , alternative: true
                    }
                ]
        }
        return message;
    }

    send(){
        this.server.send(this.message(), (err: any, message: any) => {
            if(err){
                return this.res.status(404).send({
                    message: `Error al enviar el correo ${err}`
                });
            }

            return this.res.status(200).send({
                message: `Correo enviado correctamente`
            });
        });
    }
}

export default NuevaCotizacion;

