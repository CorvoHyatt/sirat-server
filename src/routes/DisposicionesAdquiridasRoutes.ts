import { Router } from 'express';
import { disposicionesAdquiridasController } from '../controllers/DisposicionesAdquiridasController';

class DisposicionesAdquiridasRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {

        this.router.post('/create/', disposicionesAdquiridasController.create);
        this.router.get('/listOne/:idDisposicionAdquirida', disposicionesAdquiridasController.listOne);
        this.router.get('/getMejoras/:idDisposicionAdquirida', disposicionesAdquiridasController.getMejoras);
        this.router.put('/update/:idDisposicionAdquirida', disposicionesAdquiridasController.update);
        this.router.post('/completarInfo/', disposicionesAdquiridasController.insertInfoExtra);
        this.router.put('/updateInfoExtra/:idDispAdqInfo', disposicionesAdquiridasController.updateInfoExtra);
    }
} 
const disposicionesAdquiridasRoutes = new DisposicionesAdquiridasRoutes();
export default disposicionesAdquiridasRoutes.router; 
 