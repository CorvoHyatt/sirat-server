import { Router} from 'express';
import { productosPreciosTotalesController } from './../controllers/productosPreciosTotalesController';

class ProductosPreciosTotalesRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', productosPreciosTotalesController.create);
    }
}
const productosPreciosTotalesRoutes = new ProductosPreciosTotalesRoutes();
export default productosPreciosTotalesRoutes.router;