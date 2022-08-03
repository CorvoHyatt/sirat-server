import { Router } from 'express';
import { subcategoriasController } from '../controllers/subcategoriasController';

class SubcategoriasRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.get('/list', subcategoriasController.list);
        this.router.get('/listByCategoria/:idCategoria', subcategoriasController.listByCategoria);
        this.router.get('/listByCategoriaCiudad/:categoria/:idCiudad', subcategoriasController.listByCategoriaCiudad);

 
    }
}
const subcategoriasRoutes = new SubcategoriasRoutes();
export default subcategoriasRoutes.router; 
