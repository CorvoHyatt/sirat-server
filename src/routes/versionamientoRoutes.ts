import { Router } from 'express';
import { versionamientoController } from '../controllers/versionamientoControllet';

class VersionamientoRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.get('/obtenerVersion/:idCotizacion/:version', versionamientoController.obtenerVersion);
    }
}

const versionamientoRoutes = new VersionamientoRoutes();
export default versionamientoRoutes.router; 