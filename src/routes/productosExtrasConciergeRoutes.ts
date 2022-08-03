import { Router } from 'express';
import { productosExtrasConciergeController } from '../controllers/productosExtrasConciergeController';

class ProductosExtrasConciergeRoutes{

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config():void{
        this.router.get('/getProductosExtrasConcierge/:idCotizacion', productosExtrasConciergeController.getProductosExtrasConcierge);
        this.router.get('/getProductoExtraConcierge/:idProducto/:tipo', productosExtrasConciergeController.getProductoExtraConcierge);
        this.router.get('/getTotalExtrasConcierge/:idCotizacion', productosExtrasConciergeController.getTotalExtrasConcierge);
    }
}
const productosExtrasConciergeRoutes= new ProductosExtrasConciergeRoutes();
export default productosExtrasConciergeRoutes.router;
