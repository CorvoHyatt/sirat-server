import { Router} from 'express';
import { lugaresController } from '../controllers/lugaresController'

class LugaresRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', lugaresController.create);
        this.router.get('/list', lugaresController.list);
        this.router.get('/listByName/:name', lugaresController.listByName);
    }
}
const lugaresRoutes = new LugaresRoutes();
export default lugaresRoutes.router;