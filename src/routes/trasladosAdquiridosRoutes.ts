import { Router } from 'express';
import { trasladosAdquiridosController } from '../controllers/trasladosAdquiridosController';

class TrasladosAdquiridosRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {

        this.router.post('/create/', trasladosAdquiridosController.create);
        this.router.get('/listOne/:idTrasladoAdquirido', trasladosAdquiridosController.listOne);
        this.router.get('/getMejoras/:idTrasladoAdquirido', trasladosAdquiridosController.getMejoras);
        this.router.put('/update/:idTrasladoAdquirido', trasladosAdquiridosController.update);
        this.router.put('/updateInfoExtra/:idTrasladoAdquiridoInfo', trasladosAdquiridosController.updateInfoExtra);
        this.router.post('/completarInfo/', trasladosAdquiridosController.insertInfoExtra);

    }
}
const trasladosAdquiridosRoutes = new TrasladosAdquiridosRoutes();
export default trasladosAdquiridosRoutes.router; 
