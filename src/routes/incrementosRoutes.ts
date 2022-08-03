import { Router} from 'express';
import { incrementosController } from '../controllers/incrementosController'

class IncrementosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create_list/:id',incrementosController.create_list);
        this.router.get('/listFechas_ByIdActividadTipoActividad/:idActividad/:tipoActividad',incrementosController.listFechas_ByIdActividadTipoActividad);
        this.router.get('/listHoras_ByIdActividadTipoActividad/:idActividad/:tipoActividad',incrementosController.listHoras_ByIdActividadTipoActividad);
        this.router.put('/actualizar_list/:id/:tipoActividad',incrementosController.actualizar_list);

    }
}
const incrementosRoutes = new IncrementosRoutes();
export default incrementosRoutes.router; 