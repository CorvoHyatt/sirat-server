import { Router} from 'express';
import { cotizacionInformacionPasajerosController } from './../controllers/cotizacionInformacionPasajeros';

class CotizacionInformacionPasajerosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.get('/get/:idCotizacion', cotizacionInformacionPasajerosController.get);
        this.router.post('/create', cotizacionInformacionPasajerosController.create);
        this.router.put('/update/:id', cotizacionInformacionPasajerosController.update);

    }
}
const Routes = new CotizacionInformacionPasajerosRoutes();
export default Routes.router; 