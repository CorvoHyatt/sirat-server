import { Router} from 'express';
import { authController } from '../controllers/authController';

class AuthRoutes {

    public router: Router = Router();

    constructor(){
        this.config();
    }

    config(): void 
    {
        this.router.post('/signup', authController.signup);
        this.router.post('/signupPorRegistrar',authController.signupPorRegistrar);
        this.router.post('/signin',authController.signin);
        this.router.post('/decodificarMail',authController.decodificarMail);

    } 

}

const authRoutes = new AuthRoutes();
export default authRoutes.router; 
