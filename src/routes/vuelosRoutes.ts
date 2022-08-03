import { Router } from 'express';
import { vuelosController } from '../controllers/vuelosController';

class VuelosRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create/', vuelosController.create);
        this.router.post('/completarInfo/', vuelosController.insertInfoExtra);
        this.router.post('/agregarEmpresa/', vuelosController.agregarEmpresa);

        this.router.post('/upgrade/', vuelosController.upgrade);
        this.router.get('/getVuelosUpgrade/:idVuelo', vuelosController.getVuelosUpgrade);
        this.router.put('/update/:idVuelo', vuelosController.update);
        this.router.put('/updateInfoExtra/:idVueloInfo', vuelosController.updateInfoExtra);
        this.router.post('/completarInfo/', vuelosController.insertInfoExtra);


    }
}

const vuelosRoutes = new VuelosRoutes();
export default vuelosRoutes.router; 