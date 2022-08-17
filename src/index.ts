import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';


import agenciasRoutes from "./routes/agenciasRoutes";
import cotizacionesRoutes from "./routes/cotizacionesRoutes";
import usuariosRoutes from './routes/usuariosRoutes';
import destinosRoutes from './routes/destinosRoutes';
import paisesRoutes from './routes/paisesRoutes';
import ciudadRoutes from './routes/ciudadRoutes';
import trasladosRoutes from './routes/trasladosRoutes';
import trasladosCostosRoutes from './routes/trasladosCostosRoutes';
import trasladosAdquiridosRoutes from './routes/trasladosAdquiridosRoutes';
import canastaRoutes from './routes/canastaRoutes';
import canastaExtraRoutes from './routes/canastaExtraRoutes';
import divisasRoutes from './routes/divisasRoutes';
import trasladosOtrosRoutes from './routes/trasladosOtrosRoutes';
import disposicionesRoutes from './routes/disposicionesRoutes';
import disposicionesCostosRoutes from './routes/disposicionesCostosRoutes';
import disposicionesAdquiridasRoutes from './routes/DisposicionesAdquiridasRoutes'; 
import productosRoutes from './routes/productosRoutes';
import subcategoriasRoutes from './routes/subcategoriasRoutes';
import hotelesRoutes from './routes/hotelesRoutes';
import vuelosRoutes from './routes/vuelosRoutes';
import vuelosEscalasRoutes from './routes/vuelosEscalasRoutes';
import trenesRoutes from './routes/trenesRoutes';
import hotelesTarifasRoutes from './routes/hotelesTarifasRoutes';
import extrasRoutes from './routes/extrasRoutes';
import lugaresRoutes from './routes/lugaresRoutes';
import vehiculosRoutes from './routes/vehiculosRoutes';
import productosAdquiridosRoutes from './routes/productosAdquiridosRoutes';
import productosOpcionesAdquiridosRoutes from './routes/productosOpcionesAdquiridosRoutes';
import productosTransporteAdquiridoRoutes from './routes/productosTransporteAdquiridoRoutes';
import incrementosRoutes from './routes/incrementosRoutes';
import agentesRoutes from './routes/agentesRoutes';
import comisionesAgentesRoutes from './routes/ComisionesAgentesRoutes';
import continentesRoutes from './routes/continentesRoutes';
import authRoutes from './routes/authRoutes';
import versionesRoutes from './routes/versionesRoutes';
import notificacionesRoutes from './routes/notificacionesRoutes';
import areasRoutes from './routes/areasRoutes';
import cotizacioninformacionPasajerosRoutes from './routes/cotizacioninformacionPasajerosRoutes';
import jerarquiasRoutes from './routes/jerarquiasRoutes';
import productosPreciosTotalesRoutes from './routes/productosPreciosTotalesRoutes';
import pagosRoutes from './routes/pagosRoutes';
import reembolsosRoutes from './routes/reembolsosRoutes';
import comisionesPagadasRoutes from './routes/comisionesPagadasRoutes';
import productosVentaRoutes from './routes/productosVentaRoutes';
import ordenCompraRoutes from './routes/ordenCompraRoutes';
import productosExtrasConciergeRoutes from './routes/productosExtrasConciergeRoutes';
import archivosFacturasRoutes from './routes/archivosFacturasRoutes';
import choferesRoutes from './routes/choferesRoutes';
import rentaVehiculos from './routes/rentaVehiculosRoutes';
import pagosParcialesRoutes from './routes/pagosParcialesRoutes';


const bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');


class Server {

    public app: Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.app.use(express.static(__dirname + "/img"));


    } 

    config(): void {
          this.app.set('port', process.env.PORT || 49353);
        //para debugear en la consola de la terminal las peticiones al servidor. 
        this.app.use(morgan('dev'));

        this.app.use(cors());
 
        //para hacer solicitudes en formato JSON 
        this.app.use(express.json());

        //Para evitar que otro origen pueda acceder a los datos
        // this.app.use(function (req, res, next) {
        //     if (req.headers.origin == undefined || req.headers.origin != "https://5rives.com") {
        //         res.sendStatus(403);
        //     }
        //     next();
        // });


        //para enviar informaci��n desde un formulario HTML
        this.app.use(express.urlencoded({ extended: false }));



    }

    routes(): void {
        this.app.use("/agencias", agenciasRoutes);
        this.app.use("/cotizaciones", cotizacionesRoutes);
        this.app.use("/usuarios", usuariosRoutes);
        this.app.use("/destinos", destinosRoutes);
        this.app.use("/paises", paisesRoutes);
        this.app.use("/ciudades", ciudadRoutes);
        this.app.use("/traslados", trasladosRoutes);
        this.app.use("/trasladosCostos", trasladosCostosRoutes);
        this.app.use("/trasladosAdquiridos", trasladosAdquiridosRoutes);
        this.app.use("/canasta", canastaRoutes);
        this.app.use("/canastaExtra", canastaExtraRoutes);
        this.app.use("/divisas", divisasRoutes);
        this.app.use("/trasladosOtros", trasladosOtrosRoutes);
        this.app.use("/disposiciones", disposicionesRoutes);
        this.app.use("/disposicionesCostos", disposicionesCostosRoutes);
        this.app.use("/disposicionesAdquiridas", disposicionesAdquiridasRoutes);
        this.app.use("/productos", productosRoutes);
        this.app.use("/subcategorias", subcategoriasRoutes);
        this.app.use("/hoteles", hotelesRoutes);
        this.app.use("/vuelos", vuelosRoutes);
        this.app.use("/vuelosEscalas", vuelosEscalasRoutes);
        this.app.use("/trenes", trenesRoutes);
        this.app.use("/hotelesTarifas", hotelesTarifasRoutes);
        this.app.use("/extras", extrasRoutes);
        this.app.use("/lugares", lugaresRoutes);
        this.app.use("/vehiculos", vehiculosRoutes);
        this.app.use("/productosAdquiridos", productosAdquiridosRoutes);
        this.app.use("/productosOpcionesAdquiridos", productosOpcionesAdquiridosRoutes)
        this.app.use("/productosTransporteAdquirido", productosTransporteAdquiridoRoutes)
        this.app.use("/incrementos", incrementosRoutes)
        this.app.use("/agentes", agentesRoutes)
        this.app.use("/comisionesAgentes", comisionesAgentesRoutes)
        this.app.use("/continentes", continentesRoutes)
        this.app.use("/auth", authRoutes)
        this.app.use("/version", versionesRoutes)
        this.app.use("/notificaciones", notificacionesRoutes)
        this.app.use("/areas", areasRoutes)
        this.app.use("/cotizaciones-informacion-pasajeros", cotizacioninformacionPasajerosRoutes);
        this.app.use("/jerarquias", jerarquiasRoutes);
        this.app.use("/preciosTotales", productosPreciosTotalesRoutes);
        this.app.use("/ordenCompra", ordenCompraRoutes);
        this.app.use("/pagos", pagosRoutes);
        this.app.use("/reembolsos", reembolsosRoutes);
        this.app.use("/comisionesPagadas", comisionesPagadasRoutes);
        this.app.use("/productosVenta", productosVentaRoutes);
        this.app.use("/productosExtrasConcierge", productosExtrasConciergeRoutes);
        this.app.use("/archivosFacturas", archivosFacturasRoutes);
        this.app.use("/choferes", choferesRoutes);
        this.app.use("/rentaVehiculos", rentaVehiculos);
        this.app.use("/pagosParciales", pagosParcialesRoutes);


    }
    
    start() 
    {
        
        
         if(Number( process.env.BANDERA)==1)
         {
            this.app.listen(this.app.get('port'), () => 
            {
                console.log("Server on port " + this.app.get('port'));
            })
        
         }
         else
         {
             https.createServer({
                 key: fs.readFileSync("llave.pem"),
                 cert: fs.readFileSync("certificado.pem")
   
             }, this.app).listen(this.app.get('port'), () => 
             {
                 
             })
         }
    }
}

const server = new Server();
server.start();
