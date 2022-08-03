import { Router } from 'express';
import {trasladosController} from '../controllers/trasladosController';
class TrasladosRoutes
{
   public router: Router=Router();
   constructor()
   {
       this.config();
   }
   config() : void{
       
       this.router.post('/create', trasladosController.create);
       this.router.post('/create_fromList', trasladosController.create_fromList);

        this.router.post('/createIncrement', trasladosController.createIncrement);
        this.router.post('/createIncrementByHour', trasladosController.createIncrementByHour);
        this.router.post('/createIncrementByDate', trasladosController.createIncrementByDate);
 
        this.router.get('/listDesdeOriginalDistinc', trasladosController.listDesdeOriginalDistinc);
        this.router.get('/listHaciaOriginalDistinc', trasladosController.listHaciaOriginalDistinc);
        this.router.get('/listTransfers', trasladosController.listTransfers);
        this.router.get('/listCostsByTransfer/:id', trasladosController.listCostsByTransfer);
        this.router.get('/listOne/:idTraslado', trasladosController.listOne);

        this.router.get('/:id', trasladosController.listbyCiudad);
        this.router.get('/minimo/:id/:personas', trasladosController.listMinByTraslado  );
        this.router.get('/listbyIdTraslado/:id', trasladosController.listbyIdTraslado  );
        this.router.get('/listbyCiudadFullDatos/:id', trasladosController.listbyCiudadFullDatos  );
        this.router.get('/listVehiculosByTraslado/:id/:personas', trasladosController.listVehiculosByTraslado  );
        this.router.get('/listbyIdVehiculos/:id', trasladosController.listbyIdVehiculos  );

        this.router.get('/listTrasladoByCiudadidDesde/:id', trasladosController.listTrasladoByCiudadidDesde  );
        this.router.get('/listTrasladoByCiudadidHacia/:id/:desde', trasladosController.listTrasladoByCiudadidHacia  );
        this.router.get('/getTrasladoByDesdeHacia/:idCiudad/:desde/:hacia', trasladosController.getTrasladoByDesdeHacia  );

        this.router.get('/listTrasladoByCiudadidDesdeCiudad/:id', trasladosController.listTrasladoByCiudadidDesdeCiudad  );
        this.router.get('/listTrasladoByCiudadidHaciaCiudad/:id/:desde', trasladosController.listTrasladoByCiudadidHaciaCiudad  );

        this.router.get('/incrementoByTrasladoFecha/:id/:fecha', trasladosController.incrementoByTrasladoFecha  );
        this.router.get('/incrementoByTrasladoFechaVariable/:id/:fecha', trasladosController.incrementoByTrasladoFechaVariable  );
        this.router.get('/incrementoByTrasladoHora/:id/:hora', trasladosController.incrementoByTrasladoHora  );
        this.router.get('/listByPais_vista/:idPais/:idCiudad', trasladosController.listByPais_vista);


        this.router.put('/update/:id', trasladosController.update);
        this.router.put('/updateIncremento/:id', trasladosController.updateIncremento);
        this.router.delete('/delete/:idTraslado', trasladosController.delete);


       /* 
       this.router.get('/:id/:personas', trasladosController.list  );
       this.router.post('/',trasladosController.create);
       this.router.put('/:id',trasladosController.update);
       this.router.delete('/:id',trasladosController.delete);       
       */
   }
}
const trasladosRoutes= new TrasladosRoutes();
export default trasladosRoutes.router;
