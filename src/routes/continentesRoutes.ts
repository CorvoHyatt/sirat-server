import { Router} from 'express';
import { continentesController } from '../controllers/continentesController';

class ContinentesRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.get('/list', continentesController.list  );
        this.router.get('/listDisposiciones', continentesController.listDisposiciones  );
        this.router.get('/listTraslados', continentesController.listTraslados  );
        this.router.get('/listProductos/:categoria', continentesController.listProductos  );

    }

}

const continentesRoutes = new ContinentesRoutes();
export default continentesRoutes.router; 
