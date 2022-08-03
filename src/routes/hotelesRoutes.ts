import { Router } from 'express';
import { hotelesController } from '../controllers/hotelesController';

class HotelesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {
        this.router.post('/create/', hotelesController.create);
        this.router.post('/agregarHabitacion/', hotelesController.agregarHabitacion);
        this.router.post('/completarInfo/', hotelesController.insertInfoExtra);


        this.router.post('/agregarEmpresa/', hotelesController.agregarEmpresa);

        this.router.get('/categorias/', hotelesController.getCategorias);
        this.router.get('/upgrades/:tipoHotel/:idHotel/:idCotizacion', hotelesController.getUpgrades);

        this.router.put('/updateHotel/:idHotelAdquirido', hotelesController.updateHotel);
        this.router.put('/updateHabitacion/:idHotelHabitacion', hotelesController.updateHabitacion);
        this.router.put('/updateHotelUpgrade/:idHotelAdquiridoUM', hotelesController.updateHotelUpgrade);
        this.router.put('/updateHabitacionUpgrade/:idHabitacion', hotelesController.updateHabitacionUpgrade);
        this.router.put('/updateHotelHabitacionesUpgrade/:idHotelAdquiridoUM', hotelesController.updateHotelHabitacionesUpgrade);
        this.router.put('/updateHotelUpgrade/:idHotelAdquiridoUpgrade', hotelesController.updateHotelUpgrade);

        this.router.post('/upgradeHabitacion/', hotelesController.upgradeHabitacion);
        this.router.post('/upgradeHotel/', hotelesController.upgradeHotel);

        this.router.delete('/deleteHabitacion/:idHotelHabitacion', hotelesController.deleteHabitacion);
        this.router.delete('/deleteUpgradesManual/:idHotelAdquirido', hotelesController.deleteUpgradesManual);
        this.router.delete('/deleteUpgradeHabitacion/:idHabitacion', hotelesController.deleteUpgradeHabitacion);
        
        this.router.put('/updateInfoExtra/:idHotelesAdquiridosInfo', hotelesController.updateInfoExtra);
        this.router.post('/completarInfo/', hotelesController.insertInfoExtra);
    }
}
 
const hotelesRoutes = new HotelesRoutes();
export default hotelesRoutes.router; 