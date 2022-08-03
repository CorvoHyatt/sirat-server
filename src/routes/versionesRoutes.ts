import { Router } from 'express';
import { versionesController } from '../controllers/versionesController';

class VersionesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create/', versionesController.create);
        this.router.get('/getLastVersion/:idCotizacion', versionesController.getLastVersion);

    }
}

const versionesRoutes = new VersionesRoutes();
export default versionesRoutes.router; 