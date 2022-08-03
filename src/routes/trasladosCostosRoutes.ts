import { Router} from 'express';
import { trasladosCostosController } from '../controllers/trasladosCostosController';

class TrasladosCostosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.get('/listByIdTrasladoIdVehiculo/:idTraslado/:idVehiculo', trasladosCostosController.listByIdTrasladoIdVehiculo);
        this.router.get('/listByIdCiudadMuelle/:idCiudad', trasladosCostosController.listByIdCiudadMuelle);
        this.router.get('/listOne/:idTrasladoCosto', trasladosCostosController.listOne);
        this.router.get('/listByIdTraslado/:idTraslado', trasladosCostosController.listByIdTraslado);
        this.router.post('/create', trasladosCostosController.create);
        this.router.put('/update/:id', trasladosCostosController.update);
        this.router.put('/updateDivisa/:id', trasladosCostosController.updateDivisa);
        this.router.delete('/delete/:id', trasladosCostosController.delete);

    }

}

const trasladosCostosRoutes = new TrasladosCostosRoutes();
export default trasladosCostosRoutes.router; 
