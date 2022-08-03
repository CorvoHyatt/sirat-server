import { Router} from 'express';
import { agentesController } from '../controllers/agentesController';

class AgentesRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.post('/actualizarFactura/:idFacturaActual/:extFact',agentesController.actualizarFactura  );
        this.router.get('/actualizarUrgente/:idTrasladoAdquiridoInfo',agentesController.actualizarUrgente  );

        this.router.post('/create', agentesController.create  );
        this.router.get('/listByIdAgencia/:idAgencia', agentesController.listByIdAgencia  );
        this.router.get('/listAgentes', agentesController.listAgentes  );
       
       
        this.router.get('/listTimelineByCotizacion/:idCotizacion', agentesController.listTimelineByCotizacion  );

        this.router.get('/listCotizacionesByAgente/:idUsuario', agentesController.listCotizacionesByAgente  );
        this.router.get('/listCotizacionesAprobadas', agentesController.listCotizacionesAprobadas  );
        this.router.get('/listCotizacionesAprobadasProductos/:cotizaciones/:ini/:fin', agentesController.listCotizacionesAprobadasProductos  );

        this.router.get('/listCotizacionAprobadasProductosSinFactura/:idCotizacion/:ini/:fin', agentesController.listCotizacionAprobadasProductosSinFactura  );
        this.router.get('/listCotizacionAprobadasProductos/:idCotizacion', agentesController.listCotizacionAprobadasProductos  );



        this.router.get('/listByIdAgenciaWithAgencia/:idAgencia', agentesController.listByIdAgenciaWithAgencia  );
        this.router.get('/listComisionesByIdAgente/:idAgente', agentesController.listComisionesByIdAgente  );
        this.router.put('/update/:idAgente', agentesController.update  );
        this.router.delete('/delete/:idAgente', agentesController.delete  );

    } 

}

const agentesRoutes = new AgentesRoutes();
export default agentesRoutes.router; 
