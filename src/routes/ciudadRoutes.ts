import { Router } from 'express';
import { ciudadController } from '../controllers/ciudadController';

class CiudadRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {

        this.router.post('/create/', ciudadController.create);
        this.router.get('/list/', ciudadController.list);
        this.router.get('/list_one/:id', ciudadController.list_one);
        this.router.get('/listByName/:name', ciudadController.listByName);
        this.router.get('/listByNameCityNameCountry/:nameCity/:nameCountry', ciudadController.listByNameCityNameCountry);
        this.router.get('/list_one_with_country/:id', ciudadController.listOneWithCountry);
        this.router.get('/listOneWithContinent/:id', ciudadController.listOneWithContinent);
        this.router.get('/list_porPais/:id', ciudadController.list_porPais);
        this.router.get('/list_porPaisDisposiciones/:id', ciudadController.list_porPaisDisposiciones);
        this.router.get('/list_porPaisTraslados/:id', ciudadController.list_porPaisTraslados);
        this.router.get('/list_porPaisProductos/:id/:categoria', ciudadController.list_porPaisProductos);
        this.router.get('/listImagenesExistentes/:idCiudad/:tipo', ciudadController.listImagenesExistentes);

        this.router.get('/list2/', ciudadController.list_2);
        this.router.put('/update/:id', ciudadController.update);
        this.router.delete('/delete/:id', ciudadController.delete);
 

    }
}
const ciudadRoutes = new CiudadRoutes();
export default ciudadRoutes.router; 
