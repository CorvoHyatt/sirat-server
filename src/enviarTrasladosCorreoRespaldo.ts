import { Response } from "express";
import pool from "./database";
const http = require('http');
const request = require('request');
const fetch = require('node-fetch');
const email = require("emailjs/email");
import express, {Application} from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { cotizacionesController } from "./controllers/cotizacionesController";

var serverCorreo = email.server.connect(
    { 
        user: "desarrollo@5rives.com", 
        password:"desarrollo2021", 
        host: "smtp.gmail.com", 
        ssl: true, 
});
var message: any ={};
var idChoferActual:any;

class enviarTrasladosCorreos
{ 
    desde:any; 
    hacia:any;
    suplementariaDesde:any;
    suplementariaHacia:any;
    notas:any;
    token: any="";//= jwt.sign(formulario.correo, process.env.TOKEN_SECRET || 'tokentest');
    getMonth(date:any) 
    { 
        var month = date.getMonth() + 1; 
        return month < 10 ? '0' + month : '' + month; 
    } 
    getDia(dia:any) 
    { 
        return dia < 10 ? '0' + dia : '' + dia; 
    } 
    constructor() 
    { 
        dotenv.config();
        this.formarCorreo();
    } 
    querySoloCiudades = () =>
    { 
        return new Promise((resolve, reject)=>
        {   var hoy = new Date(); 
            var quinceDias= new Date(); 
            quinceDias.setDate(quinceDias.getDate()+15);
            var fecha=hoy.getFullYear()+'-'+this.getDia(hoy.getMonth()+1)+'-'+this.getDia(hoy.getDate());             
            var fechaQuince=quinceDias.getFullYear()+'-'+this.getDia(quinceDias.getMonth()+1)+'-'+this.getDia(quinceDias.getDate()); 
            let consulta='SELECT DISTINCT idCiudad FROM trasladosadquiridosinfo WHERE fechaDesde>"'+fecha+'" AND fechaDesde<"'+fechaQuince+'"'; 
            pool.query(consulta, (error:any, results:any)=> 
            { 
                if(error)
                { 
                    return reject(error); 
                } 
                
                
                return resolve(results); 
            }); 
        }); 
    }; 
    queryTraslados = (idCiudad:number) =>
    { 
        return new Promise((resolve, reject)=> 
        { 
            var hoy = new Date(); 
            var quinceDias= new Date(); 
            quinceDias.setDate(quinceDias.getDate()+15);
            var fecha=hoy.getFullYear()+'-'+this.getDia(hoy.getMonth()+1)+'-'+this.getDia(hoy.getDate());             
            var fechaQuince=quinceDias.getFullYear()+'-'+this.getDia(quinceDias.getMonth()+1)+'-'+this.getDia(quinceDias.getDate()); 
            let consulta1='SELECT tipoDesde FROM trasladosadquiridosinfo WHERE idCiudad='+idCiudad+' AND estado=0 AND length(fechaEnvio)=0 AND fechaDesde>"'+fecha+'" AND fechaDesde<"'+fechaQuince+'"'; 
           
            let consulta=`
            SELECT CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.* FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion
            WHERE idCiudad=1645124817665996 AND TAI.estado=0 AND length(fechaEnvio)=0 AND fechaDesde>'${fecha}' AND fechaDesde<'${fechaQuince}' AND CIP.principal=1            `;
                       
            
           
//            
            pool.query(consulta, (error:any, results:any)=> 
            { 
                if(error)
                { 
                    return reject(error); 
                } 
                return resolve(results); 
            }); 
        }); 
    }; 
    queryChoferes = (idCiudad:number) =>
    { 
        return new Promise((resolve, reject)=> 
        { 
            let consulta='SELECT * FROM choferes WHERE idCiudad='+idCiudad; 
            
            pool.query(consulta, (error:any, results:any)=> 
            {
                if(error)
                { 
                    return reject(error); 
                } 
                

                return resolve(results); 
            }); 
        }); 
    };
    queryActualizarTrasladosAdquiridosInfo= (ids: any) =>
    { 
        
        
        return new Promise((resolve, reject)=> 
        { 
            let consulta='UPDATE trasladosadquiridosinfo SET estado=1 , fechaEnvio=CURDATE() WHERE idTrasladoAdquiridoInfo IN ('+ids+')'; 
            
            pool.query(consulta, (error:any, results:any)=> 
            {
                if(error)
                { 
                    return reject(error); 
                } 
                

                return resolve(results); 
            }); 
        }); 
        
    };
    DarInfoDesde(datos:any)
    {
        if(datos.tipoDesde==2) 
            return datos.nombreDesde+": "+datos.direccionDesde;
        if(datos.tipoDesde==3) 
            return datos.direccionDesde ;
    }
    DarInfoHacia(datos:any)
    {
        if(datos.tipoHacia==2) 
            return datos.nombreHacia+": "+datos.direccionHacia;
        if(datos.tipoHacia==3) 
            return datos.direccionHacia ;
    }
    DarInfoSuplementariaDesde(datos:any)
    {
        if(datos.tipoDesde==1)
        {
            return datos.nombreDesde+" <br> Vuelo:"+datos.numeroServicioDesde;
        } 
        if(datos.tipoDesde==2)
        {
            return this.DarInfoDesde(datos);
        } 
        if(datos.tipoDesde==5)
        {
            return datos.nombreDesde+" <br> Muelle:"+datos.numeroServicioDesde;
        } 
        else
        {
            return "";
  
        }    
    }
    DarInfoSuplementariaHacia(datos:any)
    {
        if(datos.tipoHacia==2)
        {
            return this.DarInfoHacia(datos);
        } 
        if(datos.tipoHacia==5)
        {
            return datos.nombreHacia+" <br> Muelle:"+datos.numeroServicioHacia;
        } 
        else
        {
            return "";
  
        }    
    }
    DarInfoNotas(datos:any)
    {
      //  if(datos.tipoDesde==1)
        {
            return datos.notas;
        } 

    }
    async formarCorreo () 
    { 
        try 
        { 
            const result1 = await this.querySoloCiudades() as any; 
            for (var resSoloCiudad of result1) 
            { 
                
                const resultChoferes = await this.queryChoferes(resSoloCiudad.idCiudad) as any; 
                for (var resChofer of resultChoferes) 
                { 
                    this.token = jwt.sign(resChofer.correo, process.env.TOKEN_SECRET || 'siratproject');
                    
                    
                    const resultTraslados = await this.queryTraslados(resSoloCiudad.idCiudad) as any; 
                    var traslados = [];
                    var idTrasladoAdquiridoInfo =[];
                    for (var resTraslados of resultTraslados) 
                    { 
                        traslados.push(resTraslados.idTrasladoAdquirido) 
                        idTrasladoAdquiridoInfo.push(resTraslados.idTrasladoAdquiridoInfo); 

                    } 
                        /* se modifica la tabla de trasladosadquiridosinfo */
                        const resultActualizarTrasladosAdquiridosInfo = await this.queryActualizarTrasladosAdquiridosInfo(idTrasladoAdquiridoInfo) as any; 
                        /* se debe modificar la tabla enviadosChofer */

                   // 
                    var iterador=1; 
                    if(traslados.length>0) 
                    { 
                        var tabla=`
                        <br>
                        <br>
                        <table style="border: 2px solid black; border-collapse: collapse;">
                        <thead> 
                        <tr style="border: 1px solid black; background-color: #000000;color:#ffffff;"> 
                            <th>#</th> 
                            <th>Fecha</th> 
                            <th>Hora</th> 
                            <th>Desde</th> 
                            <th>Información suplementaria</th> 
                            <th>Hacia</th> 
                            <th>Información suplementaria</th> 
                            <th>Notas</th> 
                        </tr> </thead>
                        `; 
                        for (let elemento of resultTraslados) 
                        { 
                            this.suplementariaDesde="";
                            this.suplementariaHacia="";
                            this.notas="";
                            
                            if(elemento.tipoDesde==1) //Aeropuerto
                            {
                                this.desde='Aeropuerto'; 
                                this.suplementariaDesde=this.DarInfoSuplementariaDesde(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoDesde==2) //Hotel
                            {
                                this.desde='Hotel'; 
                                this.suplementariaDesde=this.DarInfoSuplementariaDesde(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoDesde==3) //Dir específica
                            {
                                this.desde='Dirección específica: '+this.DarInfoDesde(elemento); 
                                this.suplementariaDesde=this.DarInfoSuplementariaDesde(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoDesde==4) // Estación de tren
                            {
                                this.desde='Estación de tren'; 
                                this.suplementariaDesde=this.DarInfoSuplementariaDesde(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoDesde==5) // Muelle
                            {
                                this.desde='Muelle'; 
                                this.suplementariaDesde=this.DarInfoSuplementariaDesde(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                                
                            if(elemento.tipoHacia==1) //Aeropuerto
                            {
                                this.hacia='Aeropuerto'; 
                                this.suplementariaHacia=this.DarInfoSuplementariaHacia(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoHacia==2) //Hotel
                            {
                                this.hacia='Hotel';
                                this.suplementariaHacia=this.DarInfoSuplementariaHacia(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoHacia==3) // Dir específica
                            {
                                this.hacia='Dirección específica: '+this.DarInfoHacia(elemento); 
                                this.suplementariaHacia=this.DarInfoSuplementariaHacia(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoHacia==4) // Estación de tren
                            {
                                this.hacia='Estación de tren'; 
                                this.suplementariaHacia=this.DarInfoSuplementariaHacia(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            else if(elemento.tipoHacia==5) 
                            {
                                this.hacia='Muelle';
                                this.suplementariaHacia=this.DarInfoSuplementariaHacia(elemento); 
                                this.notas=this.DarInfoNotas(elemento); 
                            }
                            if(iterador%2==0)
                                tabla+=`<tr style=" background-color: #ffffff;">`; 
                            else
                            tabla+=`<tr style=" background-color: #f9fafb;">`; 
                            tabla+=`<td>`+iterador+`</td> 
                            <td>`+elemento.fechaDesde+` / `+elemento.nombrePasajero+` / `+elemento.viajeroTel+` </td> 
                            <td>`+elemento.horarioDesde+`</td> 
                            <td>`+this.desde+`</td> 
                            <td>`+this.suplementariaDesde+`</td> 
                            <td>`+this.hacia+`</td> 
                            <td>`+this.suplementariaHacia+`</td> 
                            <td>`+this.notas+`</td> 

                            </tr>`;
                            iterador++;
                        } 
                        tabla+="</table>";
                        tabla+="<br><br><br>Dar clic en la siguiente liga para aceptar o rechazar los nuevos traslados";
                        tabla+=`
                        <a href="http://localhost:4200/#/home/choferValidar/${this.token}" style="font-family: verdana, arial, sans-serif;font-size: 10pt;font-weight: bold;padding: 4px;background-color: #0000ff;color: #ffffff;text-decoration: none;border-top: 1px solid #cccccc;border-bottom: 2px solid #666666;border-left: 1px solid #cccccc;border-right: 2px solid #666666;" >RECIBIDO</a>

                        `;

                        message = 
                        { 
                        from: "Contacto SIRAT <contacto@sirat.com>", 
                        to: "Erik Ramos < erikue@hotmail.com >", 
                        bcc: "", 
                        subject: "Probando tablas", 
                        attachment: [ { 
                            data: `
                            Hola ` + resChofer.nombre + `
                            hoy se gregaron estos nuevos traslados a nuestra lista:
                            ` + tabla, alternative: true 
                                } ] 
                            }; 
                        } 
                    } 
                    serverCorreo.send(message, function(err:any, message:any) { console.log(err); }); 
                    //
                } 
            } catch(error) 
            { 
                console.log(error) 
            } 
            pool.end(); 
        }

}const server = new enviarTrasladosCorreos();
