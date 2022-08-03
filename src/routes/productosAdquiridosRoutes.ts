import { Router } from 'express';
import { productosAdquiridosController } from '../controllers/productosAdquiridos';

class ProductosAdquiridosRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.post('/create', productosAdquiridosController.create);
        this.router.get('/listOne/:idProductoAdquirido', productosAdquiridosController.listOne);
        this.router.put('/update/:idProductoAdquirido', productosAdquiridosController.update);
        this.router.get('/getOpcionesAdquiridas/:idProductoAdquirido', productosAdquiridosController.getOpcionesAdquiridas);
        this.router.get('/getTransporteAdquirido/:idProductoAdquirido', productosAdquiridosController.getTransporteAdquirido);
        this.router.get('/getMejorasOpciones/:idProductoAdquirido', productosAdquiridosController.getMejorasOpciones);
        this.router.get('/getMejorasTransporte/:idProductoAdquirido', productosAdquiridosController.getMejorasTransporte);
       
        this.router.put('/updateInfoExtra/:idProductosAdquiridosInfo', productosAdquiridosController.updateInfoExtra);
        this.router.post('/completarInfo/', productosAdquiridosController.insertInfoExtra);
     }
}
const productosAdquiridosRoutes= new ProductosAdquiridosRoutes();
export default productosAdquiridosRoutes.router;
