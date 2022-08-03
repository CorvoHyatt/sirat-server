import { Router} from 'express';
import { productosVentaController } from '../controllers/productosVentaController';

class ProductosVentaRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.get('/getProductosVenta/:idCotizacion/:versionCotizacion/:filtro', productosVentaController.getProductosVenta);
        this.router.put('/actualizarEstadoProducto/:idProducto/:tabla/:primaryKey/:estado', productosVentaController.actualizarEstadoProducto);
        this.router.put('/actualizarEliminacionProducto/:idProducto/:tabla/:primaryKey/:eliminado', productosVentaController.actualizarEliminacionProducto);
    }

}

const productosVentaRoutes = new ProductosVentaRoutes();
export default productosVentaRoutes.router; 
