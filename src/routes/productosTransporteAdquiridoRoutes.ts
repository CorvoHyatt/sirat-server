import { Router } from 'express';
import { productosTransporteAdquiridoController } from '../controllers/productosTransporteAdquiridoController';

class ProductosTransporteAdquiridoRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.post('/create/:id', productosTransporteAdquiridoController.create);
        this.router.post('/create_list/:id', productosTransporteAdquiridoController.create_list);
        this.router.get('/listByIdProductoAdquirido/:idProductoAdquirido', productosTransporteAdquiridoController.listByIdProductoAdquirido);

     }
}
const productosTransporteAdquiridoRoutes= new ProductosTransporteAdquiridoRoutes();
export default productosTransporteAdquiridoRoutes.router;
