import { Router} from 'express';
import { reembolsosController } from '../controllers/reembolsosController';

class ReembolsosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', reembolsosController.create);
        this.router.get('/listPorCotizacion/:idCotizacion', reembolsosController.listPorCotizacion);
        this.router.get('/getTotalReembolsos/:idCotizacion', reembolsosController.getTotalReembolsos);
        this.router.get('/getTotalReembolsoFinal/:idCotizacion', reembolsosController.getTotalReembolsoFinal);
        this.router.put('/update/:idReembolso/', reembolsosController.update);
    }

}

const reembolsosRoutes = new ReembolsosRoutes();
export default reembolsosRoutes.router; 
