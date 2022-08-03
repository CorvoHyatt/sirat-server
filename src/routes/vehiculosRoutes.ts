import { Router} from 'express';
import { vechiculosController } from './../controllers/vehiculosController';

class VehiculosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', vechiculosController.create);
        this.router.get('/list', vechiculosController.list);
        this.router.get('/listByName/:name', vechiculosController.listByName);
        this.router.put('/update/:id', vechiculosController.update);
        this.router.delete('/delete/:id', vechiculosController.delete);

    }
}
const vehiculosRoutes = new VehiculosRoutes();
export default vehiculosRoutes.router;