import { Router } from 'express';
import { extrasController } from '../controllers/extrasController';

class ExtrasRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create/', extrasController.create);
        this.router.put('/update/:idExtras', extrasController.update);
        this.router.post('/agregarEmpresa/', extrasController.agregarEmpresa);

        this.router.put('/updateInfoExtra/:idExtrasInfo', extrasController.updateInfoExtra);
        this.router.post('/completarInfo/', extrasController.insertInfoExtra);
    }
}

const extrasRoutes = new ExtrasRoutes();
export default extrasRoutes.router; 