import { Router } from 'express';
import { canastaExtraController } from '../controllers/canastaExtraController';

class CanastaExtraRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.get('/getListOtroTrasladosExtras/:idCotizacion/:idVersion', canastaExtraController.getListOtroTrasladosExtras);     
        this.router.get('/getListTrasladosExtras/:idCotizacion/:idVersion', canastaExtraController.getListTrasladosExtras);     
        this.router.get('/getListHotelesExtras/:idCotizacion/:idVersion', canastaExtraController.getListHotelesExtras);        
        //this.router.get('/getListHotelesManualesExtras/:idCotizacion', canastaExtraController.getListHotelesManualesExtras);        
        this.router.get('/getListTodosExtras/:idCotizacion/:idVersion', canastaExtraController.getListTodosExtras);  
        this.router.get('/getListDisposicionesExtras/:idCotizacion/:idVersion', canastaExtraController.getListDisposicionesExtras);
        this.router.get('/getListProductosExtras/:idCotizacion/:idVersion', canastaExtraController.getListProductosExtras);
        this.router.get('/getListProductosTrasporteExtras/:idCotizacion/:idVersion', canastaExtraController.getListProductosTrasporteExtras);
        this.router.get('/getListTrenesExtras/:idCotizacion/:idVersion', canastaExtraController.getListTrenesExtras);
        this.router.get('/getListVuelosExtras/:idCotizacion/:idVersion', canastaExtraController.getListVuelosExtras);
    }
}
const canastaExtraRoutes = new CanastaExtraRoutes();
export default canastaExtraRoutes.router; 
