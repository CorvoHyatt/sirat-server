import { Router} from 'express';
import { agenciasController } from '../controllers/agenciasController';

class AgenciasRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.post('/create', agenciasController.create);
        this.router.get('/list', agenciasController.list  );
        this.router.put('/update/:id', agenciasController.update);
        this.router.delete('/delete/:id', agenciasController.delete);
    }

}

const agenciasRoutes = new AgenciasRoutes();
export default agenciasRoutes.router; 
