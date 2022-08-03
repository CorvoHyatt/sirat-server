import { Router } from 'express';
import {disposicionesController} from '../controllers/disposicionesController';
class DisposicionesRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.post('/create', disposicionesController.create);
        this.router.post('/createDataComplete', disposicionesController.createDataComplete);

        this.router.get('/list/:idCiudad', disposicionesController.list);
        this.router.get('/listVehiculosByIdDisposicion/:idDisposicion',disposicionesController.listVehiculosByIdDisposicion);
        this.router.get('/incrementoByDisposicionFecha/:id/:fecha', disposicionesController.incrementoByDisposicionFecha  );
        this.router.get('/incrementoByDisposicionFechaVariable/:id/:fecha', disposicionesController.incrementoByDisposicionFechaVariable  );
        this.router.get('/incrementoByDisposicionHora/:id/:hora', disposicionesController.incrementoByDisposicionHora  );
        this.router.get('/listByPais_vista/:idPais/:idCiudad', disposicionesController.listByPais_vista);
        this.router.get('/listOne/:idDisposicion', disposicionesController.listOne);

        this.router.put('/actualizar/:idDisposicion', disposicionesController.actualizar);
        
        this.router.delete('/delete/:idDisposicion', disposicionesController.delete);

     }
}
const disposicionesRoutes= new DisposicionesRoutes();
export default disposicionesRoutes.router;
