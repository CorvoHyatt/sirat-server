import { Router } from 'express';
import { paisesController } from '../controllers/paisesController';

class PaisesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.get('/list/', paisesController.list);
        this.router.get('/listDisposiciones/:idContinente', paisesController.listDisposiciones);
        this.router.get('/listTraslados/:idContinente', paisesController.listTraslados);
        this.router.get('/listProductos/:idContinente/:categoria', paisesController.listProductos);

        this.router.get('/listByIdContinente/:idContinente', paisesController.listByIdContinente);
        this.router.get('/list_one/:id', paisesController.listOne);
        this.router.get('/listByName/:name', paisesController.listByName);
        this.router.get('/pagination/:inicio/:total', paisesController.pagination);
        this.router.post('/create', paisesController.create);
        this.router.put('/update/:id', paisesController.update);
        this.router.delete('/delete/:id', paisesController.delete);
    }
}
const paisesRoutes = new PaisesRoutes();
export default paisesRoutes.router; 
