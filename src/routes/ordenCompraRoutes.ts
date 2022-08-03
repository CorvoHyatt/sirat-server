import { Router} from 'express';
import { ordenCompraController } from '../controllers/ordenCompraController';

class OrdenCompraRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.post('/create', ordenCompraController.create  );
        this.router.put('/update', ordenCompraController.update);
        this.router.post('/create', ordenCompraController.create);
        this.router.get('/listOne/:idCotizacion', ordenCompraController.listOne);

    } 

}

const ordenCompraRoutes = new OrdenCompraRoutes();
export default ordenCompraRoutes.router; 
