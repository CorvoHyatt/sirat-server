import { Router } from 'express';
import { productosOpcionesAdquiridosController } from '../controllers/productosOpcionesAdquiridosController';

class ProductosOpcionesAdquiridosRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.post('/create', productosOpcionesAdquiridosController.create);
        this.router.post('/create_list/:id', productosOpcionesAdquiridosController.create_list);
        this.router.get('/listByIdProductoAdquirido/:idProductoAdquirido', productosOpcionesAdquiridosController.listByIdProductoAdquirido);

     }
}
const productosOpcionesAdquiridosRoutes= new ProductosOpcionesAdquiridosRoutes();
export default productosOpcionesAdquiridosRoutes.router;
