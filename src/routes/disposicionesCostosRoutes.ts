import { Router } from 'express';
import { disposicionesCostosController } from '../controllers/disposicionesCostosController';

class DisposicionesCostosRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.get('/listByIdDisposicionIdVehiculo/:idDisposicion/:idVehiculo',disposicionesCostosController.listByIdDisposicionIdVehiculo);
        this.router.get('/listByIdDisposicion/:idDisposicion', disposicionesCostosController.listByIdDisposicion);
        this.router.get('/listOne/:idDisposicionCosto', disposicionesCostosController.listOne);
        this.router.post('/create_list/:id', disposicionesCostosController.create_list);
        this.router.put('/actualizar/:idDisposicion', disposicionesCostosController.actualizar);

     }
}
const disposicionesCostosRoutes= new DisposicionesCostosRoutes();
export default disposicionesCostosRoutes.router;
