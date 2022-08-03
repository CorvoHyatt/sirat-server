import { Router} from 'express';
import { archivosFacturasController } from '../controllers/archivosFacturasController';

class ArchivosFacturasRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void {
        this.router.get('/listNombreArchivosFactura/:idReintegro/:tipoReintegro', archivosFacturasController.listNombreArchivosFactura);
    }

}

const archivosFacturasRoutes = new ArchivosFacturasRoutes();
export default archivosFacturasRoutes.router; 
