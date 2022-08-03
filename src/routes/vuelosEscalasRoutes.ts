import { Router } from 'express';
import { vuelosEscalasController } from '../controllers/vuelosEscalasController';

class VuelosEscalasController {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create/', vuelosEscalasController.create);
    }
}

const vuelosEscalasRoutes = new VuelosEscalasController();
export default vuelosEscalasRoutes.router; 