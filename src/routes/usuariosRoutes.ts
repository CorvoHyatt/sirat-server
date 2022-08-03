import { Router} from 'express';
import { usuariosController } from '../controllers/usuariosController';

class UsuariosRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.get('/list', usuariosController.list  );
        this.router.get('/list_one/:id', usuariosController.list_one  );
        this.router.get('/list_oneByCorreo/:correo', usuariosController.list_oneByCorreo);
        this.router.get('/getUsuariosToTransfer/:idUsuario', usuariosController.getUsuariosToTransfer );
        this.router.get('/list_byIdArea/:idArea', usuariosController.list_byIdArea);
        this.router.get('/list_porConfirmar/', usuariosController.list_porConfirmar);
        this.router.get('/list_vista/', usuariosController.list_vista);
        this.router.get('/confirmarUsuario/:correo', usuariosController.confirmarUsuario);

        this.router.put('/update_estatusPorRegistrar/:estatus', usuariosController.update_estatusPorRegistrar);


    }

} 

const usuariosRoutes = new UsuariosRoutes();
export default usuariosRoutes.router; 
