import { Router} from 'express';
import { destinosController } from '../controllers/destinosController';

class DestinosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.post('/create', destinosController.create);
        this.router.post('/create_version', destinosController.create_version);
        this.router.get('/list_porCotizacion/:id', destinosController.list_porCotizacion);
        this.router.get('/list_one/:id', destinosController.list_one  );
        this.router.get('/list_one_with_cotizacion/:id', destinosController.listOneWithCotizacion);

    }

}

const destinosRoutes = new DestinosRoutes();
export default destinosRoutes.router; 
