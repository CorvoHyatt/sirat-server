import { Router} from 'express';
import { comisionesPagadasController } from '../controllers/comisionesPagadasController';

class ComisionesPagadasRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', comisionesPagadasController.create);
        this.router.get('/listPorCotizacion/:idCotizacion', comisionesPagadasController.listPorCotizacion);
        this.router.put('/update/:idComision/:tipo', comisionesPagadasController.update);
    }

}

const comisionesPagadasRoutes = new ComisionesPagadasRoutes();
export default comisionesPagadasRoutes.router; 
