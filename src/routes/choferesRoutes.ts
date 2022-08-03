import { Router} from 'express';
import { choferesController } from '../controllers/choferesController';

class ChoferesRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.get('/listTrasladosChofer15/:correo', choferesController.listTrasladosChofer15  );
        this.router.get('/listTrasladosChofer15MenosAddDel/:correo', choferesController.listTrasladosChofer15MenosAddDel  );

        this.router.get('/listTrasladosAll15/:ini/:fin', choferesController.listTrasladosAll15  );

        this.router.get('/esAceptado/:idTrasladoAdquiridoInfo', choferesController.esAceptado  );

        this.router.get('/listTrasladosChofer15Aceptados/:correo', choferesController.listTrasladosChofer15Aceptados  );
        this.router.get('/listTrasladosChofer15Rechazados/:correo', choferesController.listTrasladosChofer15Rechazados  );
        this.router.get('/listOne/:correo', choferesController.listOne  );
        this.router.post('/addChoferTraslado', choferesController.addChoferTraslado);
        this.router.post('/deleteChoferTraslado', choferesController.deleteChoferTraslado);

    }

}

const choferesRoutes = new ChoferesRoutes();
export default choferesRoutes.router; 
