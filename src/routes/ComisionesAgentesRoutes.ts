import { Router } from 'express';
import { comisionesAgentesController } from '../controllers/comisionesAgentesController';

class ComisionesAgentesRoutes {
    public router: Router = Router();
    constructor() {
        this.config();
    }
    config(): void {

        this.router.get('/listByIdAgenteTipoActividad/:idAgente/:tipoActividad', comisionesAgentesController.listByIdAgenteTipoActividad); 

    }
}
const comisionesAgentesRoutes = new ComisionesAgentesRoutes();
export default comisionesAgentesRoutes.router; 
