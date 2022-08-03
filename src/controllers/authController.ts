import {Request,Response} from 'express'
import  pool  from '../database';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

class AuthController 
{
    constructor()
    {
        dotenv.config();
    }

    // public async cambiarContrasena(req: Request, res: Response ): Promise<void>
    // {
    //     console.log("***cambiarContrasena");
    //     console.log(req.body);
    //     const  decodificado  =  jwt.verify( req.body.correo , process.env.TOKEN_SECRET || 'tokentest' ) ; 
    //     console.log(decodificado);
    //     const salt = await bcrypt.genSalt(10);
    //     const password =await bcrypt.hash(req.body.password,salt);   
    //     console.log(password);

        
    //     const user1 = await pool.query('UPDATE agencia set password = ? WHERE correo = ?', [password,decodificado]);
    //     console.log(user1);
    //     if(user1.length==0) 
    //     {
    //         res.json( {res:"0"});
    //     }
    //     else
    //     {
    //          res.json( {res:"exito"} );
    //     } 
    // }


    // public async validarPassword(password:string, newPassword:string): Promise<boolean>
    // {
    //     return await bcrypt.compare(password,newPassword);
    // }
    // public async verificarCorreo(req: Request, res: Response ): Promise<void>
    // {
    //     console.log("***verificarCorreo");
    //     console.log(req.body);
        
    //     const user1 = await pool.query('SELECT * FROM agencia WHERE correo = ?', [req.body.correo]);
    //     console.log(user1.correo);
    //     if(user1.length==0) 
    //     {
    //         res.json( {res:"0"});
    //     }
    //     else
    //     {
    //         const token : string = jwt.sign(req.body.correo, process.env.TOKEN_SECRET || 'tokentest');      

    //          res.json( {res:token} );
             
        
    //     } 
    // }

//     public async mailPorProbar(req: Request, res: Response ): Promise<void>
//     {
//         console.log("***mailPorProbar");
//         const  decodificado  =  jwt.verify( req.body.correo , process.env.TOKEN_SECRET || 'tokentest' ) ; 
//         console.log("+++");
//         console.log(decodificado);
//         console.log("+++");
//         const user1 = await pool.query('SELECT * FROM agenciaPorRegistrar WHERE correo = ?', [decodificado]);
//         if(user1.length==0) 
//         {
//             res.json( {res:"0"});
//         }
//         else
//         {
//             const user = await pool.query('DELETE  FROM agenciaPorRegistrar WHERE correo = ?', [decodificado]);
//             console.log("user1[0]");
//             console.log(user1[0]);
//             delete req.body.id;
//             req.body.nombre=user1[0].nombre; 
//             req.body.apellido=user1[0].apellido; 
//             req.body.agencia=user1[0].agencia; 
//             req.body.correo=decodificado; 
//             req.body.password=user1[0].password; 
//             req.body.movil=user1[0].movil; 
//             req.body.newsletter=user1[0].newsletter; 
//             console.log("req.body");
//             console.log(user1.nombre);
//             console.log(user1[0].nombre);
//             console.log(req.body);
//                //Guardando un nuevo usuario
//              const salt = await bcrypt.genSalt(10);
//             // req.body.password=await bcrypt.hash(req.body.password,salt);   
//              const resp =  await pool.query('INSERT INTO agencia set ?', [req.body]);
//              //Creando Token
//              const token : string = jwt.sign(resp.insertId, process.env.TOKEN_SECRET || 'tokentest');      
//              console.log("datos validados");
//              console.log(req.body.correo);
//              console.log(decodificado);
//              console.log(token);
//              res.json( {decodificado,token} );
             
        
//         }
        
        
// /*       console.log(req.body);
//        delete req.body.id;
//        console.log(req.body); 
//           //Guardando un nuevo usuario
//         const salt = await bcrypt.genSalt(10);
//         req.body.password=await bcrypt.hash(req.body.password,salt);   
//         const resp =  await pool.query('INSERT INTO agenciaPorRegistrar set ?', [req.body]);
//         //Creando Token
//         const token : string = jwt.sign(resp.insertId, process.env.TOKEN_SECRET || 'tokentest');      
//         res.json( {token} );
//         */
        
//     }
    public async signup(req: Request, res: Response ): Promise<void>{
         //Guardando un nuevo usuario
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt); 
       try {
           const resp = await pool.query('INSERT INTO usuarios set ?', [req.body]);
           const token : string = jwt.sign(resp.insertId, process.env.TOKEN_SECRET || 'siratproject');      
           res.json( {token} );
       } catch (error) {
           console.log(error); 
       }
        // //Creando Token
      
    }

    //Para logear un usuario
    public async signupPorRegistrar(req: Request, res: Response): Promise<any>{
        
        try {
            const user1 = await pool.query('SELECT * FROM usuariosporregistrar WHERE correo = ?', [req.body.correo]);
            console.log(user1);
            if (user1.length > 0) return res.json(1); //1 esta ya en usuarios por registrar
            const user2 = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [req.body.correo]);
            if (user2.length > 0) return res.json(2); //2 esta ya esta registrado
            delete req.body.id;
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password,salt);   
            const resp =  await pool.query('INSERT INTO usuariosporregistrar set ?', [req.body]);
            //Creando Token
            const token : string = jwt.sign(resp.insertId, process.env.TOKEN_SECRET || 'siratproject');      
            res.json( {token} );
        } catch (error) {
            console.log(error);
        }
       
     }

    public  async signin (req: Request,res: Response): Promise<any>{
        const correo =  req.body.correo;
        const user = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if(user.length == 0) return res.json('Falso');
        const passwordCorrecto = await bcrypt.compare(req.body.password, user[0].password);
        if(!passwordCorrecto) return res.json('Falso');
        const token: string = jwt.sign(user[0].idUsuario, process.env.TOKEN_SECRET || 'siratproject');
        const privilegios = user[0].idArea;
         res.status(200).json({ token, correo, privilegios });
    }


    public async decodificarMail(req: Request, res: Response ): Promise<void>
    {

        console.log("***decodificarMail",process.env.TOKEN_SECRET);
        console.log(req.body.user);        
        const decodificado = jwt.verify(req.body.user, process.env.TOKEN_SECRET || 'siratproject');
        console.log(decodificado);
        res.json(decodificado);
    } 

    // Para decirle los datos al usuario de su perfilzo8yI3D8C0Yv0VOoM1NHHlt9AIL4eF8yNR7GCRX__DM
    // public async profile (req: Request,res: Response):Promise<any>
    // {
    //     console.log('id profile');
    //     console.log(req.body.id);
    //     const user = await pool.query('SELECT id,nombre,correo,rol FROM usuariosAdministracion WHERE id = ?', [req.body.id]);
    //     if(user.length==0) return res.status(404).json('Ususario no encontrado');
    //     res.send(user[0]);
    // }

    // public async decodificarMail(req: Request, res: Response ): Promise<void>
    // {

    //     console.log("***decodificarMail");
    //     console.log(req.body.user);        
    //     const  decodificado  =  jwt.verify( req.body.user , process.env.TOKEN_SECRET || 'tokentest' ) ; 
    //     res.json( {correo:decodificado});
    //}
    
    // public async mailPorProbar(req: Request, res: Response ): Promise<void>
    // {
    //     console.log("***mailPorProbar");
    //     const  decodificado  =  req.body.correo; 
    //     console.log(req.body);
    //     console.log(decodificado);
    //     const user1 = await pool.query('SELECT * FROM agenciaPorRegistrar WHERE correo = ?', [decodificado]);
    //     if(user1.length==0) 
    //     {
    //         res.json( {res:"0"});
    //     }
    //     else
    //     {
    //         const user = await pool.query('DELETE  FROM agenciaPorRegistrar WHERE correo = ?', [decodificado]);
    //         console.log("user1[0]");
    //         console.log(user1[0]);
    //         delete req.body.id;
    //         req.body.nombre=user1[0].nombre; 
    //         req.body.apellido=user1[0].apellido; 
    //         req.body.agencia=user1[0].agencia; 
    //         req.body.correo=decodificado; 
    //         req.body.password=user1[0].password; 
    //         req.body.movil=user1[0].movil; 
    //         req.body.newsletter=user1[0].newsletter; 
    //         console.log("req.body");
    //         console.log(user1.nombre);
    //         console.log(user1[0].nombre);
    //         console.log(req.body);
    //            //Guardando un nuevo usuario
    //          const salt = await bcrypt.genSalt(10);
    //         // req.body.password=await bcrypt.hash(req.body.password,salt);   
    //          const resp =  await pool.query('INSERT INTO agencia set ?', [req.body]);
    //          //Creando Token
    //          const token : string = jwt.sign(resp.insertId, process.env.TOKEN_SECRET || 'tokentest');      
    //          console.log("datos validados");
    //          console.log(req.body.correo);
    //          console.log(decodificado);
    //          console.log(token);
    //          const logo =req.body.agencia;
    //          res.json( {decodificado,token,logo } );
              
        
    //     }
    // }
        
}

export const authController = new AuthController();
