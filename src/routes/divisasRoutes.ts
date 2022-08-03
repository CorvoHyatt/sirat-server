import { Router } from 'express';
import {divisasController} from '../controllers/divisasController';
class DivisasRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.get('/list',divisasController.list);
        this.router.get('/listByName/:name',divisasController.listByName);
        this.router.get('/list/:id', divisasController.getOne);
        this.router.get('/divisaBase_getOne/:id',divisasController.divisaBase_getOne);
        this.router.get('/actualizarValorDivisas',divisasController.actualizarValorDivisas);

     }
}
const divisasRoutes= new DivisasRoutes();
export default divisasRoutes.router;
