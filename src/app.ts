import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import bodyParser from 'body-parser';
import https from 'https';
import fs from 'fs';
import dotenv from 'dotenv';

import pool from "./database";

import NuevaCotizacion from './emails/nuevaCotizacion';
import AvisosCotizacion from './emails/avisosCotizacion';
import EnviarPDF from './enviarPDF';
import EnviarPDFOrdenCompra from './enviarPDFOrdenCompra';
const correoConfirmacion = require('./correoConfirmacion');
const correoAcceso = require('./correoAcceso');


class Server 
{
    public app: Application;
    constructor() 
    {        
        dotenv.config();
        this.app = express();
        this.config();
        this.routes();
    } 
    config(): void 
    {

        this.app.use(express.urlencoded({
            limit: '50mb',
            parameterLimit: 100000,
            extended: false
        }));
        //para hacer solicitudes en formato JSON 
        this.app.use(express.json({
            limit: '50mb'
        }));

        this.app.set('port', process.env.PORT || 49354);
        //para debugear en la consola de la terminal las peticiones al servidor. 
        this.app.use(morgan('dev'));
        this.app.use(cors());
        this.app.use(express.static(__dirname + "/img"));

        //Para evitar que otro origen pueda acceder a los datos
        // this.app.use(function (req, res, next) {
        //     if (req.headers.origin == undefined || req.headers.origin != "https://5rives.com") {
        //         res.sendStatus(403);
        //     }
        //     next();
        // });

        //para enviar informaci��n desde un formulario HTML
        this.app.use(express.urlencoded({ extended: false }));
    }

    routes(): void {

        this.app.post('/enviarPDF', (req, res) => { 
            console.log("/enviarPDF");
            const enviarPDF = new EnviarPDF(req.body, res);
            enviarPDF.send();
        });
        this.app.post('/enviarPDFOrdenCompra', (req, res) => { 
            console.log("/enviarPDFOrdenCompra");
            const enviarPDFOrdenCompra = new EnviarPDFOrdenCompra(req.body, res);
            enviarPDFOrdenCompra.send();
        });
        
        this.app.post('/emails/nuevaCotizacion', (req, res) => { 
            const nuevaCotizacion = new NuevaCotizacion(req.body, res);
            nuevaCotizacion.send();
        });

        this.app.post('/emails/avisosCotizacion', (req, res) => { 
            const avisosCotizacion = new AvisosCotizacion(req.body, res);
            avisosCotizacion.send();
        });

        this.app.post('/uploadPasaporte', (req, res) => {
            const file = req.body.file;
            const name = req.body.name;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            if(fs.existsSync(`${__dirname}/img/pasaportes`)){
                fs.writeFile(`${__dirname}/img/pasaportes/${name}`, binaryData, "binary", (err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        return res.json({ fileName: name });
                    }
                }); 
            }else{
                fs.mkdirSync(`${__dirname}/img/pasaportes`, {recursive:true});
                fs.writeFile(`${__dirname}/img/pasaportes/${name}`, binaryData, "binary", (err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        return res.json({ fileName: name });
                    }
                }); 
            }
        });

        this.app.post('/uploadImagenesCotizaciones', (req, res) => {
            const file = req.body.file;
            const name = req.body.name;
            const notas = req.body.notas;
            const idCotizacion = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            if(fs.existsSync(`${__dirname}/img/archivosCotizaciones`)){
                fs.writeFile(`${__dirname}/img/archivosCotizaciones/${name}`, binaryData, "binary", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        let obj = {
                            idArchivoCotizacion: 0,
                            idCotizacion: idCotizacion,
                            nombre: name,
                            notas: notas
                        };
                        await pool.query(`INSERT INTO archivoscotizaciones set ?`, [obj]);
                        return res.json({ fileName: name });
                    }
                });
            }else{
                fs.mkdirSync(`${__dirname}/img/archivosCotizaciones`, {recursive:true});
                fs.writeFile(`${__dirname}/img/archivosCotizaciones/${name}`, binaryData, "binary", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        let obj = {
                            idArchivoCotizacion: 0,
                            idCotizacion: idCotizacion,
                            nombre: name
                        };
                        await pool.query(`INSERT INTO archivoscotizaciones set ?`, [obj]);
                        return res.json({ fileName: name });
                    }
                });
            }
        });

        this.app.post('/uploadImagenesRentaVehiculos', (req, res) => {
            const {idRentaVehiculo, file, nombre} = req.body;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            if(fs.existsSync(`${__dirname}/img/imagenesRentaVehiculos`)){
                fs.writeFile(`${__dirname}/img/imagenesRentaVehiculos/${nombre}`, binaryData, "binary", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        await pool.query(`UPDATE rentavehiculos SET imagen = ? WHERE idRentaVehiculo = ?`, [nombre, idRentaVehiculo]);
                        return res.json({ fileName: nombre });
                    } 
                });
            }else{
                fs.mkdirSync(`${__dirname}/img/imagenesRentaVehiculos`, {recursive:true});
                fs.writeFile(`${__dirname}/img/imagenesRentaVehiculos/${nombre}`, binaryData, "binary", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        await pool.query(`UPDATE rentavehiculos SET imagen = ? WHERE idRentaVehiculo = ?`, [nombre, idRentaVehiculo]);
                        return res.json({ fileName: nombre });
                    }
                });
            }
        });

        this.app.post('/uploadImagenesRentaVehiculosUpgrade', (req, res) => {
            const {idRentaVehiculoUpgrade, file, nombre} = req.body;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/imagenesRentaVehiculos/${nombre}`, binaryData, "binary", async(err) => {
                if(err){
                    console.log(err);
                    return res.json({ Error: err });
                }else{
                    await pool.query(`UPDATE rentavehiculosupgrade SET imagen = ? WHERE idRentaVehiculoUpgrade = ?`, [nombre, idRentaVehiculoUpgrade]);
                    return res.json({ fileName: nombre });
                }
            });
        });

        this.app.post('/updateImagenRentaVehiculos', (req, res) => {
            const {file, nombre} = req.body;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            try{
                fs.unlink(`${__dirname}/img/imagenesRentaVehiculos/${nombre}`, async(err) => {
                    if(err){
                        console.log(err);
                    }else{
                        fs.writeFile(`${__dirname}/img/imagenesRentaVehiculos/${nombre}`, binaryData, "binary", async(err: any) => {
                            if(err){
                                console.log(err);
                                return res.json(err);
                            }else{
                                return res.json({ fileName: nombre });
                            }
                        });
                    }
                });
            }catch(error){
                console.log(error);
            }
        });

        this.app.post('/uploadPDFsCotizaciones', (req, res) => {
            const file = req.body.file;
            const name = req.body.name;
            const notas = req.body.notas;
            const idCotizacion = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:.*,/, ""), 'base64');
            if(fs.existsSync(`${__dirname}/img/archivosCotizaciones`)){
                fs.writeFile(`${__dirname}/img/archivosCotizaciones/${name}`, binaryData, "base64", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        let obj = {
                            idArchivoCotizacion: 0,
                            idCotizacion: idCotizacion,
                            nombre: name,
                            notas: notas
                        };
                        await pool.query(`INSERT INTO archivoscotizaciones set ?`, [obj]);
                        return res.json({ fileName: name });
                    }
                });
            }else{
                fs.mkdirSync(`${__dirname}/img/archivosCotizaciones`, {recursive:true});
                fs.writeFile(`${__dirname}/img/archivosCotizaciones/${name}`, binaryData, "base64", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        let obj = {
                            idArchivoCotizacion: 0,
                            idCotizacion: idCotizacion,
                            nombre: name
                        };
                        await pool.query(`INSERT INTO archivoscotizaciones set ?`, [obj]);
                        return res.json({ fileName: name });
                    }
                });
            }
        });

        this.app.post('/uploadArchivosFactura', (req, res) => {
            const file = req.body.file;
            const name = req.body.name;
            const idReintegro = req.body.idReintegro;
            const tipoReintegro = req.body.tipoReintegro;
            let dir: string = `${__dirname}/img/archivosFacturas`;
            const binaryData = Buffer.from(file.replace(/^data:.*,/, ""), 'base64');
            if(fs.existsSync(dir)){
                fs.writeFile(`${dir}/${name}`, binaryData, "base64", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        let obj = {
                            idArchivoPago: 0,
                            idReintegro: idReintegro,
                            tipoReintegro: tipoReintegro,
                            nombre: name,
                        };
                        await pool.query(`INSERT INTO finanzas_archivosfacturas set ?`, [obj]);
                        return res.json({ fileName: name });
                    }
                });
            }else{
                fs.mkdirSync(dir, { recursive:true });
                fs.writeFile(`${dir}/${name}`, binaryData, "base64", async(err) => {
                    if(err){
                        console.log(err);
                        return res.json({ Error: err });
                    }else{
                        let obj = {
                            idArchivoPago: 0,
                            idReintegro: idReintegro,
                            tipoReintegro: tipoReintegro,
                            nombre: name,
                        };
                        await pool.query(`INSERT INTO finanzas_archivosfacturas set ?`, [obj]);
                        return res.json({ fileName: name });
                    }
                });
            }
        });
        this.app.post('/uploadFactura', (req, res) => 
        {
            let extFact = req.body.extFact;    
            let consulta=`INSERT INTO factura (extension) VALUES ('${extFact}')`;    
            console.log(consulta);
            return new Promise((resolve :any, reject : any)=> 
            { 
                pool.query(consulta, (error:any, results:any)=> 
                {
                    if(error)
                    { 
                        return reject(error); 
                    } 
                    console.log(__dirname);
                    const file = req.body.src;
                    const binaryData = Buffer.from(file.replace(/^data:.*,/, ""), 'base64');
                    fs.writeFile(`${__dirname}/img/facturas/${results.insertId}.${extFact}`, binaryData, "base64", (err) => 
                    {
                        console.log(results.insertId);
                        return  res.json(results.insertId); 
                    });
        
                }); 
            });
        });

        this.app.post('/uploadPDF', (req, res) => 
        {
            console.log("/uploadPDF");
            console.log(__dirname);
            const file = req.body.src;
            const name = req.body.idCotizacion+"_"+req.body.versionCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:.*,/, ""), 'base64');
            fs.writeFile(`${__dirname}/img/pdf/${name}.pdf`, binaryData, "base64", (err) => 
            {
                console.log(err);
            });
            res.json({ fileName: name + '.jpg' });
        });
        this.app.post('/uploadPDFOrdenCompra', (req, res) => 
        {
            console.log("/uploadPDFOrdenCompra");
            console.log(__dirname);
            const file = req.body.src;
            const name = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:.*,/, ""), 'base64');
            fs.writeFile(`${__dirname}/img/pdfOrdenCompra/${name}.pdf`, binaryData, "base64", (err) => 
            {
                console.log(err);
            });
            res.json({ fileName: name + '.jpg' });
        });
 

        this.app.post('/uploadImagenPrincipal', (req, res) => {
            const file = req.body.src;
            const name = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/portada/` + name + '.jpg', binaryData, "binary", (err) => 
            {
                console.log(err);
            });
            res.json({ fileName: name + '.jpg' });
        });
        this.app.post('/uploadImagenEvento', (req, res) => {
            const file = req.body.src;
            const name = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/evento/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });
        this.app.post('/uploadImagenDaybyday', (req, res) => {
            const file = req.body.src;
            const name = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/daybyday/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });
        this.app.post('/uploadImagenFin', (req, res) => {
            const file = req.body.src;
            const name = req.body.idCotizacion;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/fin/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });
        this.app.post('/uploadImagenHotel1', (req, res) => {
            const file = req.body.src;
            const name = req.body.idHotel;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/hotel1/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });
        this.app.post('/uploadImagenHotel2', (req, res) => {
            const file = req.body.src;
            const name = req.body.idHotel;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/hotel2/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });
        this.app.post('/uploadActualizacionImagenHotel1', (req, res) => {
            const file = req.body.src;
            const name = req.body.idHotel;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/actualizacionHotel1/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });
        this.app.post('/uploadActualizacionImagenHotel2', (req, res) => {
            const file = req.body.src;
            const name = req.body.idHotel;
            const binaryData = Buffer.from(file.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
            fs.writeFile(`${__dirname}/img/actualizacionHotel2/` + name + '.jpg', binaryData, "binary", (err) => {
                console.log(err);
            })
            res.json({ result: name + '.jpg' });
        });







        this.app.post('/uploadImgCiudad', async (req, res) => {
            try {
                console.log("********************************************* uploadImgCiudad *********************************");
            console.log(req.body);
            const imagenesPortada = req.body.files[0];
            const imagenesM = req.body.files[1];
            const imagenesP = req.body.files[2];
            const imagenesO = req.body.files[3];

            const idCiudad = req.body.idCiudad;
            //const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad}`);

          
            
              let i = 1;
              for (let index = 0; index < imagenesPortada.length; index++) {
                const respG = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                const binaryData = Buffer.from(imagenesPortada[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                    fs.writeFile(`${__dirname}/img/portada/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                    if(err) console.log(err);
                    });
                // if (imagenesPortada[index] != null && imagenesPortada[index] != -1) {
                //     console.log( `Insertando grande ${i} `);
                //     try{
                //         var sourceUrls = __dirname + `/img/portada/${idCiudad}_${i}.jpg`;
                //         fs.unlinkSync(sourceUrls);
                //         console.log("se elimino");
                //     } catch (err) {

                //      }
                //     console.log(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                //     const respG = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                //     console.log(respG);
                //     const binaryData = Buffer.from(imagenesG[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                //     fs.writeFile(`${__dirname}/img/portada/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                //     if(err) console.log(err);
                //     });
                // } else if (imagenesG[index] == null) {
                //     console.log(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND num=${i}`);
                //     const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=1 AND num=${i}`);
                //     try{
                //         var sourceUrls = __dirname + `/img/portada/${idCiudad}_${i}.jpg`;
                //         fs.unlinkSync(sourceUrls);
                //         console.log("se elimino");
                //        }catch(err){}
                // }
                i++;
               
            }

            i=1;
            for (let index = 0; index < 3; index++) {
                if (imagenesM[index] != null && imagenesM[index] != -1) {
                    console.log( `Insertando ediana ${i} `);

                    try{
                        var sourceUrls = __dirname + `/img/evento/${idCiudad}_${i}.jpg`;
                        fs.unlinkSync(sourceUrls);
                        console.log("se elimino");
                       }catch(err){}
                    const resp = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},2, ${i})`);
                    const binaryData = Buffer.from(imagenesM[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                    fs.writeFile(`${__dirname}/img/evento/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                        if (err) console.log(err);
                    });
                } else if(imagenesM[index] == null) {
                    const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=2 AND num=${i}`);
                    try{
                        var sourceUrls = __dirname + `/img/evento/${idCiudad}_${i}.jpg`;
                        fs.unlinkSync(sourceUrls);
                        console.log("se elimino");
                       }catch(err){}
                }
                i++;
            }


            i=1;
            for (let index = 0; index < 3; index++) {
                if (imagenesP[index] != null && imagenesP[index] != -1) {
                    console.log( `Insertando p ${i} `);

                    try{
                        var sourceUrls = __dirname + `/img/daybyday/${idCiudad}_${i}.jpg`;
                        fs.unlinkSync(sourceUrls);
                        console.log("se elimino");
                       }catch(err){}
                    const resp = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},3, ${i})`);
                    const binaryData = Buffer.from(imagenesP[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                    fs.writeFile(`${__dirname}/img/daybyday/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                        if (err) console.log(err);
                    });
                } else if(imagenesP[index] == null) {
                    const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=3 AND num=${i}`);
                    try{
                        var sourceUrls = __dirname + `/img/daybyday/${idCiudad}_${i}.jpg`;
                        fs.unlinkSync(sourceUrls);
                        console.log("se elimino");
                       }catch(err){}
                }
                i++;
            }

            i=1;
              for (let index = 0; index < 3; index++) {
                
                if (imagenesO[index] != null && imagenesO[index] != -1) {
                    console.log( `Insertando o ${i} `);

                    try{
                        var sourceUrls = __dirname + `/img/opciones/${idCiudad}_${i}.jpg`;
                        fs.unlinkSync(sourceUrls);
                        console.log("se elimino");
                       }catch(err){}
                    const resp = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},4, ${i})`);
                    const binaryData = Buffer.from(imagenesO[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                    fs.writeFile(`${__dirname}/img/opciones/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                        if (err) console.log(err);
                    });
                } else if(imagenesO[index] == null) {
                    const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=4 AND num=${i}`);
                    try{
                        var sourceUrls = __dirname + `/img/opciones/${idCiudad}_${i}.jpg`;
                        fs.unlinkSync(sourceUrls);
                        console.log("se elimino");
                       }catch(err){}
                }
                i++;
            }

            res.json(`Finalizado`);  
          } catch (error) {
              console.log(error);
          }
        });
        
        this.app.post('/refreshImgCiudad', async (req, res) => {
            try {
              console.log(req.body);
              const imagenesPortada = req.body.files[0];
              const imagenesM = req.body.files[1];
              const imagenesP = req.body.files[2];
              const imagenesO = req.body.files[3];
  
              const idCiudad = req.body.idCiudad;
                
              //const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad}`);
  
              const existentesPortada = await pool.query(
                `SELECT * FROM ciudadImagenes WHERE idCiudad=${idCiudad} AND tipo = ${1}`
              );
            
                for (let index = 0; index < existentesPortada.length; index++) {
                    let b = false;

                    for (let index2 = 0; index2 < imagenesPortada.length; index2++) {
                        if (`portada/${imagenesPortada[index2].nombre.split("/")[4]}` == `portada/${idCiudad}_${existentesPortada[index].num}.jpg`) {
                            b = true;
                        }
                    }
 
                    if (!b) {
                        try{
                            var sourceUrls = __dirname + `/img/portada/${idCiudad}_${existentesPortada[index].num}.jpg`;
                            fs.unlinkSync(sourceUrls);
                            console.log(` se eliminó: portada/${idCiudad}_${existentesPortada[index].num}.jpg`);
                        }catch(err){}
                    } 
                    
                }

                let newI = 1;
                for (let index = 0; index < existentesPortada.length; index++) {
                    if (fs.existsSync(__dirname + `/img/portada/${idCiudad}_${existentesPortada[index].num}.jpg`)) {
                        fs.renameSync(__dirname + `/img/portada/${idCiudad}_${existentesPortada[index].num}.jpg`, __dirname + `/img/portada/${idCiudad}_${newI}.jpg`);
                        newI++;
                    } 
                }

                let i = 1;
                const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=1`);

                for (let index = 0; index < imagenesPortada.length; index++) {

                    const respG = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                    if (imagenesPortada[index].src != "") {
                        const binaryData = Buffer.from(imagenesPortada[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                         fs.writeFile(`${__dirname}/img/portada/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                            if (err) console.log(err);
                        }); 
                    }
                   
                    i++;
                }
       
               
              
                // console.log(imagenesPortada[0].file);
                // for (let index = 0; index < imagenesPortada.length; index++) {
                //   const respG = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                //   const binaryData = Buffer.from(imagenesPortada[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                //       fs.writeFile(`${__dirname}/img/portada/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                //       if(err) console.log(err);
                //       });
                  // if (imagenesPortada[index] != null && imagenesPortada[index] != -1) {
                  //     console.log( `Insertando grande ${i} `);
                  //     try{
                  //         var sourceUrls = __dirname + `/img/portada/${idCiudad}_${i}.jpg`;
                  //         fs.unlinkSync(sourceUrls);
                  //         console.log("se elimino");
                  //     } catch (err) {
  
                  //      }
                  //     console.log(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                  //     const respG = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},1, ${i});`);
                  //     console.log(respG);
                  //     const binaryData = Buffer.from(imagenesG[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                  //     fs.writeFile(`${__dirname}/img/portada/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                  //     if(err) console.log(err);
                  //     });
                  // } else if (imagenesG[index] == null) {
                  //     console.log(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND num=${i}`);
                  //     const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=1 AND num=${i}`);
                  //     try{
                  //         var sourceUrls = __dirname + `/img/portada/${idCiudad}_${i}.jpg`;
                  //         fs.unlinkSync(sourceUrls);
                  //         console.log("se elimino");
                  //        }catch(err){}
                  // }
            //       i++;
                 
            //   }
  
              i=1;
              for (let index = 0; index < 3; index++) {
                  if (imagenesM[index] != null && imagenesM[index] != -1) {
                      console.log( `Insertando ediana ${i} `);
  
                      try{
                          var sourceUrls = __dirname + `/img/evento/${idCiudad}_${i}.jpg`;
                          fs.unlinkSync(sourceUrls);
                          console.log("se elimino");
                         }catch(err){}
                      const resp = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},2, ${i})`);
                      const binaryData = Buffer.from(imagenesM[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                      fs.writeFile(`${__dirname}/img/evento/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                          if (err) console.log(err);
                      });
                  } else if(imagenesM[index] == null) {
                      const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=2 AND num=${i}`);
                      try{
                          var sourceUrls = __dirname + `/img/evento/${idCiudad}_${i}.jpg`;
                          fs.unlinkSync(sourceUrls);
                          console.log("se elimino");
                         }catch(err){}
                  }
                  i++;
              }
  
  
              i=1;
              for (let index = 0; index < 3; index++) {
                  if (imagenesP[index] != null && imagenesP[index] != -1) {
                      console.log( `Insertando p ${i} `);
  
                      try{
                          var sourceUrls = __dirname + `/img/daybyday/${idCiudad}_${i}.jpg`;
                          fs.unlinkSync(sourceUrls);
                          console.log("se elimino");
                         }catch(err){}
                      const resp = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},3, ${i})`);
                      const binaryData = Buffer.from(imagenesP[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                      fs.writeFile(`${__dirname}/img/daybyday/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                          if (err) console.log(err);
                      });
                  } else if(imagenesP[index] == null) {
                      const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=3 AND num=${i}`);
                      try{
                          var sourceUrls = __dirname + `/img/daybyday/${idCiudad}_${i}.jpg`;
                          fs.unlinkSync(sourceUrls);
                          console.log("se elimino");
                         }catch(err){}
                  }
                  i++;
              }
  
              i=1;
                for (let index = 0; index < 3; index++) {
                  
                  if (imagenesO[index] != null && imagenesO[index] != -1) {
                      console.log( `Insertando o ${i} `);
  
                      try{
                          var sourceUrls = __dirname + `/img/opciones/${idCiudad}_${i}.jpg`;
                          fs.unlinkSync(sourceUrls);
                          console.log("se elimino");
                         }catch(err){}
                      const resp = await pool.query(`INSERT INTO ciudadImagenes (idCiudad, tipo, num) VALUES (${idCiudad},4, ${i})`);
                      const binaryData = Buffer.from(imagenesO[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                      fs.writeFile(`${__dirname}/img/opciones/${idCiudad}_${i}.jpg`, binaryData, "binary", (err) => {
                          if (err) console.log(err);
                      });
                  } else if(imagenesO[index] == null) {
                      const respd = await pool.query(`DELETE FROM ciudadImagenes WHERE idCiudad  =${idCiudad} AND tipo=4 AND num=${i}`);
                      try{
                          var sourceUrls = __dirname + `/img/opciones/${idCiudad}_${i}.jpg`;
                          fs.unlinkSync(sourceUrls);
                          console.log("se elimino");
                         }catch(err){}
                  }
                  i++;
              }
  
              res.json(`Finalizado`);  
            } catch (error) {
                console.log(error);
            }
          });
          

        this.app.post('/uploadImgProducto', async (req, res) => {
           
            let imagenes = req.body.files;
            const idProducto = req.body.idProducto;

            for (let index = 0; index < 3; index++) {
                if (imagenes[index] != null && imagenes[index] != -1) {
                    try{
                        var sourceUrls = __dirname + `/img/producto/${idProducto}_${index+1}.jpg`;
                        fs.unlinkSync(sourceUrls); 
                        console.log("se elimino");
                    } catch (err) { }
                    
                    const resp = await pool.query(`INSERT INTO productoImagenes (idProducto, num) VALUES (${idProducto}, ${index+1})`);
                    const binaryData = Buffer.from(imagenes[index].src.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64').toString('binary');
                    fs.writeFile(`${__dirname}/img/productos/${idProducto}_${index+1}.jpg`, binaryData, "binary", (err) => {
                        if (err) console.log(err);
                    });
                } else if(imagenes[index] == null) {
                    const respd = await pool.query(`DELETE FROM productoImagenes WHERE idProducto  =${idProducto} AND num=${index+1}`);
                    try{
                        var sourceUrls = __dirname + `/img/producto/${idProducto}_${index+1}.jpg`;
                        fs.unlinkSync(sourceUrls); 
                        console.log("se elimino");
                       }catch(err){}
                }
            }

            

            res.json(`Finalizado`);
        });


        this.app.post('/correoConfirmacion', (req, res) => {
            console.log('/correoConfirmacion');
            correoConfirmacion(req.body);
            res.status(200).send();
        });

        this.app.post('/correoAcceso', (req, res) => {
            console.log('/correoAcceso');
            correoAcceso(req.body);
            res.status(200).send();
        });
    } 



    

    start() {
        console.log("Bandera",process.env.BANDERA);
        console.log("Liga",process.env.LIGA);
        if(Number( process.env.BANDERA)==1)
        {
            this.app.listen(this.app.get('port'), () => 
            {
                console.log(`Listening on port ${this.app.get('port')}`);
            });
    
        }
        else
        {
            https.createServer(
                {
                key: fs.readFileSync("llave.pem"),
                cert: fs.readFileSync("certificado.pem")
                            
            }, this.app).listen(this.app.get('port'), () => 
            {
                 console.log('https listening on port ' + this.app.get('port'));
            })            
        }
    }
}

const server = new Server();
server.start();
