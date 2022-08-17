import { Response } from "express";
const email = require("emailjs/email");
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

class enviarPDFOrdenCompra{


    public server: any;
    public datos: any;
    public res: Response; 
    public token:any;
    public LIGA:any;

    constructor(data: any, res: Response){
        dotenv.config();
        this.LIGA=process.env.LIGA;

        this.datos = data; 
        this.res = res;
        this.token  = jwt.sign(this.datos.cotizacion, process.env.TOKEN_SECRET || 'siratproject');  
        
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
            to: `${this.datos.correo}`,
            bcc: `${this.datos.otrosCorreos}`,
            subject: `${this.datos.asunto}`,
            attachment:
                [
                    {
                        data: `
                            Estimado(a) agente <strong>${this.datos.agente}</strong>, el presente correo es para enviarte la orden de compra de la cotización de <strong>${this.datos.nombreCliente}</strong>
                            <br>
                            <br>
                            <strong>Notas:</strong>
                            <br>
                            <br>
                            ${this.datos.notas}
                            <br>
                            <br>
                            Favor de confirmar de recibido dando clic a la siguiente liga: 
                            <a href="${this.LIGA}#/home/registrarOrden/${this.token}" style="font-family: verdana, arial, sans-serif;font-size: 10pt;font-weight: bold;padding: 4px;background-color: #0000ff;color: #ffffff;text-decoration: none;border-top: 1px solid #cccccc;border-bottom: 2px solid #666666;border-left: 1px solid #cccccc;border-right: 2px solid #666666;" >RECIBIDO</a>
                            <br><br>
                            Favor de rechazar la cotización si lo desea dando clic a la siguiente liga: 
                            <a  href="${this.LIGA}#/home/rechazarOrden/${this.token}" style="font-family: verdana, arial, sans-serif;font-size: 10pt;font-weight: bold;padding: 4px;background-color: #cb3234;color: #ffffff;text-decoration: none;border-top: 1px solid #cccccc;border-bottom: 2px solid #666666;border-left: 1px solid #cccccc;border-right: 2px solid #666666;" >RECHAZAR</a>
 
                                                  
                            `
                        , alternative: true
                    },
                    {name: `${this.datos.cotizacion}.pdf`, path: `${__dirname}/img/pdfOrdenCompra/${this.datos.cotizacion}.pdf`}

                ]
        }
        return message;
    }

    send(){
        
        this.server.send(this.message(), (err: any, message: any) => {
            console.log(err);
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

export default enviarPDFOrdenCompra;

