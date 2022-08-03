import { Router } from 'express';
import { hotelesTarifasController } from '../controllers/hotelesTarifasController';

class HotelesTarifasRoutes
{
    public router: Router=Router();
    constructor()
    {
        this.config();
    }
    config() : void
    {
        this.router.get('/list', hotelesTarifasController.list);
        this.router.get('/listOne/:id', hotelesTarifasController.listOne);
        this.router.get('/pagination/:inicio/:total', hotelesTarifasController.pagination);
        this.router.post('/create', hotelesTarifasController.create);
        this.router.put('/update/:id', hotelesTarifasController.update);
        this.router.delete('/delete/:id', hotelesTarifasController.delete);
     }
}
const hotelesTarifasRoutes= new HotelesTarifasRoutes();
export default hotelesTarifasRoutes.router;
