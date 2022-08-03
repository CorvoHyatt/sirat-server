import { Router} from 'express';
import { rentaVehiculosController } from '../controllers/rentaVehiculosController';

class RentaVehiculosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', rentaVehiculosController.create);
        this.router.put('/update/:idRentaVehiculo', rentaVehiculosController.update);

        //MEJORAS
        this.router.post('/createUpgrade', rentaVehiculosController.createUpgrade);
        this.router.get('/getUpgrade/:idRentaVehiculo', rentaVehiculosController.getUpgrade);
        this.router.put('/updateUpgrade/:idRentaVehiculoUpgrade', rentaVehiculosController.updateUpgrade);
        this.router.delete('/deleteUpgrade/:idRentaVehiculoUpgrade/:nombre', rentaVehiculosController.deleteUpgrade);
        this.router.put('/updateInfoExtra/:idRentaVehiculoInfo', rentaVehiculosController.updateInfoExtra);
        this.router.post('/completarInfo/', rentaVehiculosController.insertInfoExtra);
       
    }

}

const rentaVehiculosRoutes = new RentaVehiculosRoutes();
export default rentaVehiculosRoutes.router; 
