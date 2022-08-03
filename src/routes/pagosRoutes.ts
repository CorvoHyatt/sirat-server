import { Router} from 'express';
import { pagosController } from '../controllers/pagosController';

class PagosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', pagosController.create);
        this.router.get('/listPorCotizacion/:idCotizacion', pagosController.listPorCotizacion);
        this.router.put('/update/:idPago/:tipo', pagosController.update);
    }

}

const pagosRoutes = new PagosRoutes();
export default pagosRoutes.router; 
