import { Router } from 'express';
import { trenesController } from '../controllers/trenesController';

class TrenesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create/', trenesController.create);
        this.router.post('/completarInfo/', trenesController.insertInfoExtra);

        this.router.post('/agregarEmpresa/', trenesController.agregarEmpresa);



        this.router.post('/upgrade/', trenesController.upgrade);
        this.router.put('/actualizarHorario/:id', trenesController.actualizarHorario);
        this.router.get('/getTrenesUpgrade/:idTren', trenesController.getTrenesUpgrade);
        this.router.put('/update/:idTren', trenesController.update);
        this.router.put('/updateInfoExtra/:idTrenInfo', trenesController.updateInfoExtra);
        this.router.post('/completarInfo/', trenesController.insertInfoExtra);

    }
}

const trenesRoutes = new TrenesRoutes();
export default trenesRoutes.router; 