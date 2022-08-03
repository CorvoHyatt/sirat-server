import { Router} from 'express';
import { pagosParcialesController } from '../controllers/pagosParcialesController';

class pagosParcialesRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', pagosParcialesController.create);

        this.router.get('/historialPorProducto/:idProductoCosto', pagosParcialesController.historialPorProducto);
        this.router.get('/listPagoParcial/:idPagoParcial', pagosParcialesController.listPagoParcial);
    }
}
const pagosRoutesRoutes = new pagosParcialesRoutes();
export default pagosRoutesRoutes.router;