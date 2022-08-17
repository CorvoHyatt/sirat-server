//const nodemailer = require('nodemailer');
var email = require("emailjs/email");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var smtpTransport = require('nodemailer-smtp-transport');

module.exports = (formulario: any) => {

    const token = jwt.sign(formulario.correo, process.env.TOKEN_SECRET || 'tokentest');
    
    
    

    var server = email.server.connect({
     
        user:	"desarrollo@5rives.com",
        password:"desarrollo2021", 
        host:	"smtp.gmail.com", 
        ssl: true,
        
        //ssl: { sslmode: 'require', rejectUnauthorized: false, }


        // user: "alfredo.reyes1896@gmail.com",
        // password: "Babilonia1",
        // host: "smtp.gmail.com",
        // port: 465,
        // ssl: true





    });

    /*

                    https://thelocalchauffeur.com/registrar/`+token+`
     */

    var message: any ={};

    
        message = {
            //      text:	"i hope this works", 
            from: "Contacto SIRAT <contacto@sirat.com>",
            to: "" + formulario.nombre + " <" + formulario.correo + ">",
            bcc: "",
            subject: "Registro de " + formulario.nombre,
            attachment: [
                { data: `
          
                    ¡¡Te damos la más cordial bienvenida!!
                    <br>
                    <br>
                    Entra a la siguiente liga para validar que eres el dueño de esta cuenta
                    <br>
                    <br>
                    
                    http://localhost:4200/#/confirmar/` + token + `
                    <br>
                    <br>
                    <br>
                    AVISO: Este correo electrónico es confidencial y para uso exclusivo de la (s) persona (s) a quien (es) se dirige. Si el lector de esta transmisión electrónica no es el destinatario, se le notifica que cualquier distribución o copia de la misma está estrictamente prohibida. Si ha recibido este correo por error, le suplicamos notificar inmediatamente a la persona que lo envió y borrarlo definitivamente de su sistema. 
                    <br>
                    <br>
                    NOTICE: This electronic mail transmission is confidential, may be privileged and should be read or retained only by the intended recipient. If the reader of this transmission is not the intended recipient, you are hereby notified that any distribution or copying  is strictly prohibited. If you have received this transmission in error, please immediately notify the sender and delete it from your system.
                     
                    `, alternative: true }
            ]

        };
    
    
    

    server.send(message, function(err:any, message:any) { console.log(err); });
}