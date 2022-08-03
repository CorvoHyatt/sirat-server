import { Router} from 'express';
import { areasController } from '../controllers/areasController';

class AreasRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.post('/create', areasController.create);
        this.router.get('/list', areasController.list);
        this.router.put('/actualizar/:idArea', areasController.actualizar);
        this.router.delete('/eliminar/:idArea', areasController.eliminar);
        
    }

}

const areasRoutes = new AreasRoutes();
export default areasRoutes.router; 
