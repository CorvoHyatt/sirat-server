import { Router} from 'express';
import { jerarquiasController } from '../controllers/jerarquiasController'

class JerarquiasRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void{
        this.router.post('/create', jerarquiasController.create);
        this.router.post('/create_list', jerarquiasController.create_list);
        this.router.get('/list_agrupado', jerarquiasController.list_agrupado);
        this.router.get('/count/:idAreaPrincipal', jerarquiasController.count);
        this.router.get('/list_areasDisponibles', jerarquiasController.list_areasDisponibles);
        this.router.get('/list_areasSubordinadas/:idAreaPrincipal', jerarquiasController.list_areasSubordinadas);

        this.router.put('/update/:idAreaPrincipal', jerarquiasController.update);
        this.router.delete('/delete/:idAreaPrincipal', jerarquiasController.delete);

    }
}
const jerarquiasRoutes = new JerarquiasRoutes();
export default jerarquiasRoutes.router;