import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import EnviarPDF from './enviarPDF';
const https = require('https');
const fs = require('fs');


class Server 
{
    public app: Application;
    constructor() 
    {
        this.app = express();
        this.config();
        this.routes();
    } 
    config(): void 
    {

        this.app.use(express.urlencoded({
            limit: '50mb',
            parameterLimit: 100000,
            extended: false
        }));
        //para hacer solicitudes en formato JSON 
        this.app.use(express.json({
            limit: '50mb'
        }));

        this.app.set('port', process.env.PORT || 49355);
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.static(__dirname + "/img"));
        this.app.use(express.urlencoded({ extended: false }));
    }

    routes(): void 
    {
        this.app.post('/enviarPDF', (req, res) => { 
            
            const enviarPDF = new EnviarPDF(req.body, res);
            enviarPDF.send();
        });
    }
     
    start() {
        this.app.listen(this.app.get('port'), () => {
            
        });
    }

/*

    start() { 
        https.createServer({
            key: fs.readFileSync("llave.pem"),
            cert: fs.readFileSync("certificado.pem")
            //requestCert: true,  
            //rejectUnauthorized: true
            // ,ca: [ fs.readFileSync('certificado.pem')]


        }, this.app).listen(this.app.get('port'), () => {
            
        })

    }
*/

}
const server = new Server();
server.start();
