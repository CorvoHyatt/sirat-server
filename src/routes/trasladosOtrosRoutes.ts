import { Router } from 'express';
import { trasladosOtrosController } from '../controllers/trasladoOtroController';

class TrasladosOtrosRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {

        this.router.post('/create/', trasladosOtrosController.create);
        this.router.get('/listOne/:idTrasladoOtro', trasladosOtrosController.listOne);
        this.router.get('/getMejoras/:idTrasladoOtro', trasladosOtrosController.getMejoras);


    }
}
const trasladosOtrosRoutes = new TrasladosOtrosRoutes();
export default trasladosOtrosRoutes.router; 
