import { Router } from 'express';
import { canastaController } from '../controllers/canastaController';

class CanastaRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create', canastaController.create);
        this.router.get('/listOneCotizacionByUser/:idUser/:idCotizacion', canastaController.listOneCotizacionByUser);
        this.router.get('/listOneCotizacionByUserByVersion/:idUser/:idCotizacion/:versionCotizacion', canastaController.listOneCotizacionByUserByVersion);
        this.router.get('/listOneCotizacionByUserByVersionResumen/:idUser/:idCotizacion/:version/:versionCotizacion', canastaController.listOneCotizacionByUserByVersionResumen);        
        this.router.get('/listIdActividadesByIdCotizacionByTipo/:idCotizacion/:tipo', canastaController.listIdActividadesByIdCotizacionByTipo);
        this.router.put('/updateStatus/:idCotizacion', canastaController.updateStatus);
        this.router.delete('/deleteProduct/:idProduct/:idCotizacion/:type', canastaController.deleteProduct);
        this.router.delete('/cancelarCotizacion/:idCotizacion/:idsToDelete7', canastaController.cancelarCotizacion);
    }
}
const canastaRoutes = new CanastaRoutes();
export default canastaRoutes.router; 
