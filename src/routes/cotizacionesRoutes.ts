import { Router} from 'express';
import { cotizacionesController } from '../controllers/cotizacionesController';

class CotizacionesRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.get('/dameAsesor/:idUsuario', cotizacionesController.dameAsesor);
        this.router.put('/updateEstadoAEnviado/:idCotizacion/:estado', cotizacionesController.updateEstadoAEnviado);
        this.router.get('/listImagenesCiudadesPortada/:id', cotizacionesController.listImagenesCiudadesPortada);
        this.router.get('/listImagenesCiudadesEvento/:id', cotizacionesController.listImagenesCiudadesEvento);
        this.router.get('/listImagenesCiudadesDaybyday/:id', cotizacionesController.listImagenesCiudadesDaybyday);

        this.router.delete('/delete/:idCotizacion', cotizacionesController.delete); 
        this.router.put('/updateAuxiliar/:id', cotizacionesController.updateAuxiliar);
        this.router.post('/createAuxiliar/', cotizacionesController.createAuxiliar);
        this.router.post('/itinerario/create/', cotizacionesController.createItinerario);
        this.router.get('/existeItinerarioAuxiliar/:id', cotizacionesController.existeItinerarioAuxiliar);
        this.router.get('/existeAuxiliar/:id', cotizacionesController.existeAuxiliar);
        this.router.get('/list_oneResumen/:id', cotizacionesController.list_oneResumen);
        this.router.get('/list_oneCompleta/:id', cotizacionesController.list_oneCompleta);

        this.router.get('/list_paises/:id', cotizacionesController.list_paises);
        this.router.get('/list_ciudades/:id', cotizacionesController.list_ciudades);
        this.router.get('/list_continentes/:id', cotizacionesController.list_continentes);

        
        this.router.post('/create', cotizacionesController.create);
        this.router.post('/createNewVersionCotizacion', cotizacionesController.createNewVersionCotizacion);
        this.router.post('/createNota', cotizacionesController.createNota);
        this.router.post('/createVersion', cotizacionesController.createVersion);
        this.router.post('/addTimeline', cotizacionesController.addTimeline);
        this.router.put('/update/:id', cotizacionesController.update);
        this.router.put('/updateCreatedAt/:idCotizacion', cotizacionesController.updateCreatedAt);
        this.router.get('/list_one/:id', cotizacionesController.list_one);
        this.router.get('/listOneOC/:id', cotizacionesController.listOneOC);
        this.router.get('/listByUserWithFilter/:id/:filter', cotizacionesController.listByUserWithFilter);
        this.router.get('/listByFilter/:filter', cotizacionesController.listByFilter);
        this.router.get('/getComisionAgenteByCotizacion/:idCotizacion/:type', cotizacionesController.getComisionAgenteByCotizacion);
        this.router.get('/getVersionesByCotizacion/:idCotizacion', cotizacionesController.getVersionesByCotizacion);
        this.router.get('/search/:search', cotizacionesController.search);
        this.router.get('/getNotasByCotizacion/:idCotizacion', cotizacionesController.getNotasByCotizacion);
        this.router.get('/getNotificationsByUser/:idUsuario', cotizacionesController.getNotificationsByUser);
        this.router.get('/changeOwner/:idUsuario/:idCotizacion', cotizacionesController.changeOwner);
        this.router.get('/getArchivosCotizacion/:idCotizacion', cotizacionesController.getArchivosCotizacion);

    }

} 

const cotizacionesRoutes = new CotizacionesRoutes();
export default cotizacionesRoutes.router; 
