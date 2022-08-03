import { Router } from 'express';
import { notificacionesController } from '../controllers/notificacionesController';

class NotificacionesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        // this.router.post('/create/', hotelesController.create);
        this.router.post('/create/:idArea', notificacionesController.create);
        this.router.get('/count_sinFinalizar/:idUsuario', notificacionesController.count_sinFinalizar);
        this.router.get('/count_byReceptorTipoEstatus/:idUsuario/:tipo/:estatus', notificacionesController.count_byReceptorTipoEstatus);
        this.router.get('/count_sinFinalizarTPLPNotas/:idUsuario', notificacionesController.count_sinFinalizarTPLPNotas);
        this.router.get('/list_AreasSinFinalizar/:idUsuario/:estatus/:tipo', notificacionesController.list_AreasSinFinalizar);
        this.router.get('/listAll_ByIdUsuarioEstatusTipoArea/:idUsuario/:estatus/:tipo/:idArea', notificacionesController.listAll_ByIdUsuarioEstatusTipoArea);
        this.router.get('/listAll_ByIdAreaIdUsuario/:idArea/:idUsuario', notificacionesController.listAll_ByIdAreaIdUsuario);
        this.router.get('/listAllFinanzas', notificacionesController.listAllFinanzas);
        this.router.get('/listOne/:idNotificacion', notificacionesController.listOne);
        this.router.put('/update/:idNotificacion', notificacionesController.update);

    }
}

const notificacionesRoutes = new NotificacionesRoutes();
export default notificacionesRoutes.router; 