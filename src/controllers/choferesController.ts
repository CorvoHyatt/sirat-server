import { Request, Response } from "express";

import pool from "../database";

class ChoferesController 
{
  constructor()
  {
    
  }
  getMonth(date:any) 
  { 
      var month = date.getMonth() + 1; 
      return month < 10 ? '0' + month : '' + month; 
  }
  getDia(dia:number) 
  {
    
    return dia < 10 ? '0' + dia : '' + dia; 
  }
  public async esAceptado(req: Request, res: Response): Promise<void> {
    const { idTrasladoAdquiridoInfo} = req.params;
    let consulta=`SELECT * from aceptadosChofer WHERE idTrasladoAdquiridoInfo='${idTrasladoAdquiridoInfo}'`;
    const respuesta = await pool.query(consulta);
    res.json(respuesta);
  }

  public async listTrasladosChofer15(req: Request, res: Response): Promise<void> {
    const { correo} = req.params;
    var hoy = new Date(); 
    var quinceDias= new Date(); 
    
    quinceDias.setDate(quinceDias.getDate()+15);
    var fecha=hoy.getFullYear()+'-'+( (hoy.getMonth()+1)<10 ? '0'+ (hoy.getMonth()+1):''+(hoy.getMonth()+1))+'-'+(hoy.getDate() < 10 ? '0' + hoy.getDate() : '' + hoy.getDate());              
    var fechaQuince=quinceDias.getFullYear()+'-'+((quinceDias.getMonth()+1)<10 ? '0'+ (quinceDias.getMonth()+1):''+(quinceDias.getMonth()+1))+'-'+(quinceDias.getDate() < 10 ? '0' + quinceDias.getDate() : '' + quinceDias.getDate()); 

    let consulta=`
     SELECT  CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.* FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN choferes C ON C.correo='${correo}'
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion
            WHERE TAI.idCiudad=C.idCiudad AND TAI.estado=1  AND fechaDesde>'${fecha}' AND fechaDesde<'${fechaQuince}' AND CIP.principal=1 
            ORDER BY fechaDesde
            `;
      
      const respuesta = await pool.query(consulta);

    res.json(respuesta);
  }
  public async listTrasladosAll15(req: Request, res: Response): Promise<void> 
  {
    const { ini,fin} = req.params;

//    var hoy = new Date(); 
//    var quinceDias= new Date(); 
//    quinceDias.setDate(quinceDias.getDate()+15);
//    var fecha=hoy.getFullYear()+'-'+( (hoy.getMonth()+1)<10 ? '0'+ (hoy.getMonth()+1):''+(hoy.getMonth()+1))+'-'+(hoy.getDate() < 10 ? '0' + hoy.getDate() : '' + hoy.getDate());              
//    var fechaQuince=quinceDias.getFullYear()+'-'+((quinceDias.getMonth()+1)<10 ? '0'+ (quinceDias.getMonth()+1):''+(quinceDias.getMonth()+1))+'-'+(quinceDias.getDate() < 10 ? '0' + quinceDias.getDate() : '' + quinceDias.getDate()); 

    let consulta=`
     SELECT (SELECT count(*) FROM rechazadosChofer WHERE idTrasladoAdquiridoInfo=TAI.idTrasladoAdquirido) as rechazado ,(SELECT count(*) FROM aceptadosChofer WHERE idTrasladoAdquiridoInfo=TAI.idTrasladoAdquirido) as aceptado ,CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.* FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion
            WHERE  TAI.estado=0  AND fechaDesde>='${ini}' AND fechaDesde<='${fin}' AND CIP.principal=1 
                       
            ORDER BY fechaDesde, SUBSTRING(horarioDesde,7,8) ASC
            `;
      
      const respuesta = await pool.query(consulta);

    res.json(respuesta);
  }
  public async listTrasladosChofer15MenosAddDel(req: Request, res: Response): Promise<void> {
    const { correo} = req.params;
    var hoy = new Date(); 
    var quinceDias= new Date(); 
    quinceDias.setDate(quinceDias.getDate()+15);
    var fecha=hoy.getFullYear()+'-'+( (hoy.getMonth()+1)<10 ? '0'+ (hoy.getMonth()+1):''+(hoy.getMonth()+1))+'-'+(hoy.getDate() < 10 ? '0' + hoy.getDate() : '' + hoy.getDate());              
    var fechaQuince=quinceDias.getFullYear()+'-'+((quinceDias.getMonth()+1)<10 ? '0'+ (quinceDias.getMonth()+1):''+(quinceDias.getMonth()+1))+'-'+(quinceDias.getDate() < 10 ? '0' + quinceDias.getDate() : '' + quinceDias.getDate()); 

    let consulta=`
     SELECT CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.* FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN choferes C ON C.correo='${correo}'
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion
            WHERE TAI.idCiudad=C.idCiudad AND TAI.estado=0  AND fechaDesde>='${fecha}' AND fechaDesde<='${fechaQuince}' AND CIP.principal=1 
            AND idTrasladoAdquiridoInfo not in
            (
            
                        SELECT idTrasladoAdquiridoInfo FROM aceptadosChofer WHERE C.idChofer=1 UNION SELECT idTrasladoAdquiridoInfo FROM rechazadosChofer WHERE C.idChofer=1
            )            
            ORDER BY fechaDesde, SUBSTRING(horarioDesde,7,8) ASC
            `;
      
      const respuesta = await pool.query(consulta);

    res.json(respuesta);
  }
  public async listTrasladosChofer15Aceptados(req: Request, res: Response): Promise<void> {
    const { correo} = req.params;
    var hoy = new Date(); 
    var quinceDias= new Date(); 
    quinceDias.setDate(quinceDias.getDate()+15);
    var fecha=hoy.getFullYear()+'-'+( (hoy.getMonth()+1)<10 ? '0'+ (hoy.getMonth()+1):''+(hoy.getMonth()+1))+'-'+(hoy.getDate() < 10 ? '0' + hoy.getDate() : '' + hoy.getDate());              
    var fechaQuince=quinceDias.getFullYear()+'-'+((quinceDias.getMonth()+1)<10 ? '0'+ (quinceDias.getMonth()+1):''+(quinceDias.getMonth()+1))+'-'+(quinceDias.getDate() < 10 ? '0' + quinceDias.getDate() : '' + quinceDias.getDate()); 

    let consulta=`
     SELECT CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.* FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN choferes C ON C.correo='${correo}'
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion
            INNER JOIN aceptadosChofer AC ON AC.idTrasladoAdquiridoInfo=TAI.idTrasladoAdquiridoInfo
            WHERE TAI.idCiudad=C.idCiudad AND TAI.estado=0  AND fechaDesde>='${fecha}' AND fechaDesde<='${fechaQuince}' AND CIP.principal=1           
            ORDER BY fechaDesde, SUBSTRING(horarioDesde,7,8) ASC
            `;
      
      const respuesta = await pool.query(consulta);

    res.json(respuesta);
  }    
  public async listTrasladosChofer15Rechazados(req: Request, res: Response): Promise<void> {
    const { correo} = req.params;
    var hoy = new Date(); 
    var quinceDias= new Date(); 
    quinceDias.setDate(quinceDias.getDate()+15);
    var fecha=hoy.getFullYear()+'-'+( (hoy.getMonth()+1)<10 ? '0'+ (hoy.getMonth()+1):''+(hoy.getMonth()+1))+'-'+(hoy.getDate() < 10 ? '0' + hoy.getDate() : '' + hoy.getDate());              
    var fechaQuince=quinceDias.getFullYear()+'-'+((quinceDias.getMonth()+1)<10 ? '0'+ (quinceDias.getMonth()+1):''+(quinceDias.getMonth()+1))+'-'+(quinceDias.getDate() < 10 ? '0' + quinceDias.getDate() : '' + quinceDias.getDate()); 

    let consulta=`
     SELECT CIP.nombre as nombrePasajero, COT.viajeroTel,TAI.* FROM trasladosadquiridosinfo TAI 
            INNER JOIN cotizacioninformacionpasajeros CIP ON TAI.idCotizacion= CIP.idCotizacion
            INNER JOIN choferes C ON C.correo='${correo}'
            INNER JOIN cotizaciones COT ON COT.idCotizacion = CIP.idCotizacion
            INNER JOIN rechazadosChofer RC ON RC.idTrasladoAdquiridoInfo=TAI.idTrasladoAdquiridoInfo
            WHERE TAI.idCiudad=C.idCiudad AND TAI.estado=0  AND fechaDesde>='${fecha}' AND fechaDesde<='${fechaQuince}' AND CIP.principal=1           
            ORDER BY fechaDesde, SUBSTRING(horarioDesde,7,8) ASC
            `;
     
      const respuesta = await pool.query(consulta);

    res.json(respuesta);
  } 
  public async listOne(req: Request, res: Response): Promise<void> {
    const { correo} = req.params;
    let consulta=`SELECT * from choferes WHERE correo='${correo}'`;
    const respuesta = await pool.query(consulta);
    res.json(respuesta[0]);
  }
  public async addChoferTraslado(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO aceptadosChofer set ?", [req.body]);
    res.json(resp);
  }
  public async deleteChoferTraslado(req: Request, res: Response): Promise<void> {
    const resp = await pool.query("INSERT INTO rechazadosChofer set ?", [req.body]);
    res.json(resp);
  }
}

export const choferesController = new ChoferesController();
