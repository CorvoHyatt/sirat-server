import { Router } from 'express';
import { productosController } from '../controllers/productosController';

class ProductosRoutesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {

        this.router.post('/createTPAP/', productosController.createTPAP); //Crear un tour privado a pie
        this.router.post('/createTPAP_fromList/', productosController.createTPAP_fromList); 
        this.router.post('/agregarEmpresa/', productosController.agregarEmpresa);

        this.router.post('/createTPET/', productosController.createTPET); //Crear un tour privado en transporte
        this.router.post('/createTPET_fromList/', productosController.createTPET_fromList); 

        this.router.post('/createTEG/', productosController.createTEG); //Crear un tour en grupo
        this.router.post('/createTEG_fromList/', productosController.createTEG_fromList); 

        this.router.post('/createActividad/', productosController.createActividad); 
        this.router.post('/createActividad_fromList/', productosController.createActividad_fromList);

        this.router.get('/listProductoByIdProducto/:idProducto', productosController.listProductoByIdProducto);
        this.router.get('/listByCiudadCategoriaSubcategoria/:idCiudad/:categoria/:subCategoria', productosController.listByCiudadCategoriaSubcategoria);
        this.router.get('/listProductoByIdProducto_vista/:idProducto', productosController.listProductoByIdProducto_vista);
        this.router.get('/listProductoInfoByIdProducto/:idProducto', productosController.listProductoInfoByIdProducto);
        this.router.get('/listProductoInfoByIdProducto_vista/:idProducto', productosController.listProductoInfoByIdProducto_vista);
        this.router.get('/listDiasCerradosByIdProducto/:idProducto', productosController.listDiasCerradosByIdProducto);
        this.router.get('/listHorariosProducto/:idProducto', productosController.listHorariosProducto);
        this.router.get('/listEntradasByIdProducto/:idProducto', productosController.listEntradasByIdProducto);
        this.router.get('/listOpcionesByIdProducto/:idProducto', productosController.listOpcionesByIdProducto);
        this.router.get('/listTarifasIdProducto/:idProducto', productosController.listTarifasIdProducto);
        this.router.get('/listTransportesIdProducto_vista/:idProducto', productosController.listTransportesIdProducto_vista); //Contiene todos los camposde productosTransportes ademas de solo nombre del vehiculo
        this.router.get('/listImagenesExistentes/:idProducto', productosController.listImagenesExistentes); //Contiene todos los camposde productosTransportes ademas de solo nombre del vehiculo


       this.router.get('/incrementoByFecha/:id/:fecha', productosController.incrementoByTrasladoFecha  );
       this.router.get('/incrementoByFechaVariable/:id/:fecha', productosController.incrementoByTrasladoFechaVariable  );
       this.router.get('/incrementoByHora/:id/:hora', productosController.incrementoByTrasladoHora  );
       this.router.get('/listProductosRelacionados/:titulo/:categoria', productosController.listProductosRelacionados  );
       this.router.get('/listTransporteByProducto/:idProducto/:tipo', productosController.listTransporteByProducto  );
       this.router.get('/listByPais_vista/:idPais/:idCiudad/:categoria', productosController.listByPais_vista);
       this.router.get('/list_subcategoriasByIdProducto/:idProducto', productosController.list_subcategoriasByIdProducto);

        this.router.put('/actualizarTPAP/', productosController.actualizarTPAP); //Actualiza un tour privado a pie
        this.router.put('/actualizarTPET/', productosController.actualizarTPET); //Actualiza un tour privado en transporte
        this.router.put('/actualizarTEG/', productosController.actualizarTEG); //Actualiza un tour privado en grupo
        this.router.put('/actualizarActividad/', productosController.actualizarActividad); //Actualiza un tour privado en grupo

       this.router.delete('/delete/:idProducto', productosController.delete); //Crear un tour privado a pie

    }
}
const productosRoutesRoutes = new ProductosRoutesRoutes();
export default productosRoutesRoutes.router; 
