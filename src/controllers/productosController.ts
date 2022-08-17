import { Request, Response } from "express";
//import { isTryStatement } from "typescript";

import pool from "../database";

class ProductosController {

  public async agregarEmpresa(req: Request, res: Response): Promise<void> 
  {
      let consulta="SELECT * FROM aceptadosProductos WHERE idProductoAdquiridoInfo="+req.body.idProductoAdquiridoInfo;
      const respConsulta = await pool.query(consulta);
      
      if(respConsulta.length==0)
      {
          const resp = await pool.query("INSERT INTO aceptadosProductos set ?", [req.body]);
          res.json(resp);
      }
      else
      {
          const resp = await pool.query("UPDATE aceptadosProductos set empresa=? WHERE idProductoAdquiridoInfo=?", [req.body.empresa,req.body.idProductoAdquiridoInfo]);
          res.json(resp);
      }

  }
  public async createTPAP(req: Request, res: Response): Promise<void> {
    try {
      let producto = req.body[0];
    let productoInfo = req.body[1];
    let tarifasPersonas = req.body[2];
    let entradas = req.body[3];
    let opciones = req.body[4];
    let horarios = req.body[5];
    let diasCerrados = req.body[6];
    let subcategorias = req.body[7];


    const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
    let idProducto=resp1.insertId;
    productoInfo.idProducto = idProducto

    const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);

    for (let index = 0; index < tarifasPersonas.length; index++) {
      await pool.query(`INSERT INTO productostarifas (idProducto, numPersonas, tarifa) VALUES (${idProducto},${tarifasPersonas[index].numPersonas},${tarifasPersonas[index].tarifa})`);
    }

    for (let index = 0; index < entradas.length; index++) {
      await pool.query(`INSERT INTO productosentradas (idProducto,nombre,minimoMenor,maximoMenor,tarifaMenor,tarifaAdulto) VALUES (${idProducto},'${entradas[index].nombre}',${entradas[index].minimoMenor},${entradas[index].maximoMenor},${entradas[index].tarifaMenor},${entradas[index].tarifaAdulto}) `);
    }

    for (let index = 0; index < opciones.length; index++) {
      await pool.query(`INSERT INTO productosopciones (idProducto,nombre,tarifaAdulto,tarifaMenor,minimoMenor,maximoMenor,horasExtras,horaExtraChofer,total) VALUES ( ${idProducto}, '${opciones[index].nombre}',${opciones[index].tarifaAdulto},${opciones[index].tarifaMenor}, ${opciones[index].minimoMenor},${opciones[index].maximoMenor}, ${opciones[index].horasExtras},0,0) `);
    }

    for (let index = 0; index < horarios.length; index++) {
      await pool.query(`INSERT INTO productoshorarios (idProducto,hora,crucero) VALUES (${idProducto}, '${horarios[index].hora}', 0)`);      
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      await pool.query(`INSERT INTO productosdiascerrados (idProducto,fecha) VALUES (${idProducto}, '${diasCerrados[index].fecha}') `);      
    }

    for (let index = 0; index < subcategorias.length; index++) {
      await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
    }

    res.json(idProducto);

    } catch (error) {
      console.log(error);
    }
  }


  public async createTPAP_fromList(req: Request, res: Response): Promise<void> {
    try {
      for (let ii = 0; ii < req.body.length; ii++) {
        let producto = req.body[ii][0];
        let productoInfo = req.body[ii][1];
        let tarifasPersonas = req.body[ii][2];
        let entradas = req.body[ii][3];
        let opciones = req.body[ii][4];
        let horarios = req.body[ii][5];
        let diasCerrados = req.body[ii][6];
         let subcategorias = req.body[ii][7];
         let incrementos = req.body[ii][8];
    
         try {
           const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
        let idProducto=resp1.insertId;
        productoInfo.idProducto = idProducto
    
        const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
   
         
        for (let index = 0; index < tarifasPersonas.length; index++) {
          await pool.query(`INSERT INTO productostarifas (idProducto, numPersonas, tarifa) VALUES (${idProducto},${tarifasPersonas[index].numPersonas},${tarifasPersonas[index].tarifa})`);
        }
    
        for (let index = 0; index < entradas.length; index++) {
          await pool.query(`INSERT INTO productosentradas (idProducto,nombre,minimoMenor,maximoMenor,tarifaMenor,tarifaAdulto) VALUES (${idProducto},'${entradas[index].nombre}',${entradas[index].minimoMenor},${entradas[index].maximoMenor},${entradas[index].tarifaMenor},${entradas[index].tarifaAdulto}) `);
        }
    
        for (let index = 0; index < opciones.length; index++) {
          await pool.query(`INSERT INTO productosopciones (idProducto,nombre,tarifaAdulto,tarifaMenor,minimoMenor,maximoMenor,horasExtras,horaExtraChofer,total) VALUES ( ${idProducto}, '${opciones[index].nombre}',${opciones[index].tarifaAdulto},${opciones[index].tarifaMenor}, ${opciones[index].minimoMenor},${opciones[index].maximoMenor}, ${opciones[index].horasExtras},0,0) `);
        }
    
        for (let index = 0; index < horarios.length; index++) {
          await pool.query(`INSERT INTO productoshorarios (idProducto,hora,crucero) VALUES (${idProducto}, '${horarios[index].hora}', 0)`);      
        }
    
        for (let index = 0; index < diasCerrados.length; index++) {
          await pool.query(`INSERT INTO productosdiascerrados (idProducto,fecha) VALUES (${idProducto}, '${diasCerrados[index].fecha}') `);      
        }
    
        for (let index = 0; index < subcategorias.length; index++) {
          await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
        }

           
           
        for (let index3 = 0; index3 < incrementos.length; index3++) {
          let dataIncremento = incrementos[index3];
          dataIncremento[0].idActividad = idProducto;
         const resp3 = await pool.query("INSERT INTO incrementos set ?", dataIncremento[0]);
         let idIncremento = resp3.insertId;
   
         for (let index4 = 0; index4 < dataIncremento[1].length; index4++) {
             let detalleIncremento = dataIncremento[1][index4];
             detalleIncremento.idIncremento = idIncremento;
             if (dataIncremento[0].tipo == 1) {
                 //Incremento de horas
                 const resp4 = await pool.query("INSERT INTO incrementos_horas set ?", detalleIncremento);
               } else {
                 //Incremento de fechas
                 const resp4 = await pool.query("INSERT INTO incrementos_fechas set ?", detalleIncremento);
               }
             
             }
         
           }
         } catch (error) {
           
           
           
           
           
           
           
           
           
           
           
   
           console.log(error);
           res.status(500).send({ error: error });
   
         }
        
         
    
       }
        res.json("Finalizado");
    } catch (error) {
      console.log(error);
    }
 
   }

  public async createTPET(req: Request, res: Response): Promise<void> {
    try {
      let producto = req.body[0];
    let productoInfo = req.body[1];
    let tarifasPersonas = req.body[2];
    let entradas = req.body[3];
    let opciones = req.body[4];
    let horarios = req.body[5];
    let diasCerrados = req.body[6];
    let transportes = req.body[7];
    let subcategorias = req.body[8];

    const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
    let idProducto=resp1.insertId;
    productoInfo.idProducto = idProducto

    const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
    ////

    for (let index = 0; index < tarifasPersonas.length; index++) {
      await pool.query(`INSERT INTO productostarifas (idProducto, numPersonas, tarifa) VALUES (${idProducto},${tarifasPersonas[index].numPersonas},${tarifasPersonas[index].tarifa})`);
    }

    for (let index = 0; index < entradas.length; index++) {
      await pool.query(`INSERT INTO productosentradas (idProducto,nombre,minimoMenor,maximoMenor,tarifaMenor,tarifaAdulto) VALUES (${idProducto},'${entradas[index].nombre}',${entradas[index].minimoMenor},${entradas[index].maximoMenor},${entradas[index].tarifaMenor},${entradas[index].tarifaAdulto}) `);
    }

    for (let index = 0; index < opciones.length; index++) {
      await pool.query(`INSERT INTO productosopciones (idProducto,nombre,tarifaAdulto,tarifaMenor,minimoMenor,maximoMenor,horasExtras,horaExtraChofer,total) VALUES ( ${idProducto}, '${opciones[index].nombre}',${opciones[index].tarifaAdulto},${opciones[index].tarifaMenor}, ${opciones[index].minimoMenor},${opciones[index].maximoMenor}, ${opciones[index].horasExtras},0,0) `);
    }

    for (let index = 0; index < horarios.length; index++) {
      await pool.query(`INSERT INTO productoshorarios (idProducto,hora,crucero) VALUES (${idProducto}, '${horarios[index].hora}', 0)`);      
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      await pool.query(`INSERT INTO productosdiascerrados (idProducto,fecha) VALUES (${idProducto}, '${diasCerrados[index].fecha}') `);      
    }

    for (let index = 0; index < transportes.length; index++) {
      await pool.query(`INSERT INTO productostransporte (idProducto,idVehiculo,tarifa,noPersonas,horasExtras) VALUES (${idProducto}, ${transportes[index].idVehiculo}, ${transportes[index].tarifa},${transportes[index].noPersonas}, ${transportes[index].horasExtras}) `);      
    }

    for (let index = 0; index < subcategorias.length; index++) {
      await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
    }

    res.json(idProducto);
    } catch (error) {
      console.log(error);
    }

  }


  public async createTPET_fromList(req: Request, res: Response): Promise<void> {

    
    for (let ii = 0; ii < req.body.length; ii++) {
       let producto = req.body[ii][0];
       
       
       
    let productoInfo = req.body[ii][1];
    let tarifasPersonas = req.body[ii][2];
    let entradas = req.body[ii][3];
    let opciones = req.body[ii][4];
    let horarios = req.body[ii][5];
    let diasCerrados = req.body[ii][6];
    let transportes = req.body[ii][7];
    let subcategorias = req.body[ii][8];
    let incrementos = req.body[ii][9];
      

      try {
        const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
        let idProducto=resp1.insertId;
        productoInfo.idProducto = idProducto
    
        const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
        ////
    
        for (let index = 0; index < tarifasPersonas.length; index++) {
          await pool.query(`INSERT INTO productostarifas (idProducto, numPersonas, tarifa) VALUES (${idProducto},${tarifasPersonas[index].numPersonas},${tarifasPersonas[index].tarifa})`);
        }
    
        for (let index = 0; index < entradas.length; index++) {
          await pool.query(`INSERT INTO productosentradas (idProducto,nombre,minimoMenor,maximoMenor,tarifaMenor,tarifaAdulto) VALUES (${idProducto},'${entradas[index].nombre}',${entradas[index].minimoMenor},${entradas[index].maximoMenor},${entradas[index].tarifaMenor},${entradas[index].tarifaAdulto}) `);
        }
    
        for (let index = 0; index < opciones.length; index++) {
          await pool.query(`INSERT INTO productosopciones (idProducto,nombre,tarifaAdulto,tarifaMenor,minimoMenor,maximoMenor,horasExtras,horaExtraChofer,total) VALUES ( ${idProducto}, '${opciones[index].nombre}',${opciones[index].tarifaAdulto},${opciones[index].tarifaMenor}, ${opciones[index].minimoMenor},${opciones[index].maximoMenor}, ${opciones[index].horasExtras},0,0) `);
        }
    
        for (let index = 0; index < horarios.length; index++) {
          await pool.query(`INSERT INTO productoshorarios (idProducto,hora,crucero) VALUES (${idProducto}, '${horarios[index].hora}', 0)`);      
        }
    
        for (let index = 0; index < diasCerrados.length; index++) {
          await pool.query(`INSERT INTO productosdiascerrados (idProducto,fecha) VALUES (${idProducto}, '${diasCerrados[index].fecha}') `);      
        }
    
          //
        for (let index = 0; index < transportes.length; index++) {
          await pool.query(`INSERT INTO productostransporte (idProducto,idVehiculo,tarifa,noPersonas,horasExtras) VALUES (${idProducto}, ${transportes[index].idVehiculo}, ${transportes[index].tarifa},${transportes[index].noPersonas}, ${transportes[index].horasExtras}) `);      
        }
    
        for (let index = 0; index < subcategorias.length; index++) {
          await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
        }
    
            for (let index3 = 0; index3 < incrementos.length; index3++) {
              let dataIncremento = incrementos[index3];
              dataIncremento[0].idActividad = idProducto;
    
              const resp3 = await pool.query("INSERT INTO incrementos set ?", dataIncremento[0]);
              let idIncremento = resp3.insertId;
        
              for (let index4 = 0; index4 < dataIncremento[1].length; index4++) {
                  let detalleIncremento = dataIncremento[1][index4];
                  detalleIncremento.idIncremento = idIncremento;
                  if (dataIncremento[0].tipo == 1) {
                      //Incremento de horas
                      const resp4 = await pool.query("INSERT INTO incrementos_horas set ?", detalleIncremento);
                    } else {
                      //Incremento de fechas
                      const resp4 = await pool.query("INSERT INTO incrementos_fechas set ?", detalleIncremento);
                    }
                  
              }
              
          }
      } catch (error) {
        
        
        
        
        
        
        
        
        
        
        
        

        console.log(error);
        res.status(500).send({ error: error });
      }

   
    }
   

    res.json("Finalizado");

  }



  public async createTEG(req: Request, res: Response): Promise<void> {
   try {
    let producto = req.body[0];
    let productoInfo = req.body[1];
    let opciones = req.body[2];
    let horarios = req.body[3];
    let diasCerrados = req.body[4]; 
    let transportes = req.body[5];
    let subcategorias = req.body[6];


    const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
    let idProducto=resp1.insertId;
    productoInfo.idProducto = idProducto

    const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
    //
    for (let index = 0; index < opciones.length; index++) {
      opciones[index].idProducto = idProducto;
      await pool.query("INSERT INTO productosopciones set ?", [ opciones[index]]);
    }

    for (let index = 0; index < horarios.length; index++) {
      horarios[index].idProducto = idProducto;
      await pool.query("INSERT INTO productoshorarios set ?", [ horarios[index]]);
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      diasCerrados[index].idProducto = idProducto;
      await pool.query("INSERT INTO productosdiascerrados set ?", [ diasCerrados[index]]);
    }

    for (let index = 0; index < transportes.length; index++) {
      transportes[index].idProducto = idProducto;
      await pool.query("INSERT INTO productostransporte set ?", [ transportes[index]]);
    }

    for (let index = 0; index < subcategorias.length; index++) {
      await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
    }

    res.json(idProducto);
   } catch (error) {
     console.log(error);
   }

  }



  public async createTEG_fromList(req: Request, res: Response): Promise<void> {
    for (let ii = 0; ii < req.body.length; ii++) {
      let producto = req.body[ii][0];
    let productoInfo = req.body[ii][1];
    let opciones = req.body[ii][2];
    let horarios = req.body[ii][3];
    let diasCerrados = req.body[ii][4]; 
    let transportes = req.body[ii][5];
    let subcategorias = req.body[ii][6];
      let incrementos = req.body[ii][7];
      
    try {
      const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
      let idProducto=resp1.insertId;
      productoInfo.idProducto = idProducto
  
      const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
      //
      for (let index = 0; index < opciones.length; index++) {
        opciones[index].idProducto = idProducto;
        await pool.query("INSERT INTO productosopciones set ?", [ opciones[index]]);
      }
  
      for (let index = 0; index < horarios.length; index++) {
        horarios[index].idProducto = idProducto;
        await pool.query("INSERT INTO productoshorarios set ?", [ horarios[index]]);
      }
  
      for (let index = 0; index < diasCerrados.length; index++) {
        diasCerrados[index].idProducto = idProducto;
        await pool.query("INSERT INTO productosdiascerrados set ?", [ diasCerrados[index]]);
      }
  
      for (let index = 0; index < transportes.length; index++) {
        transportes[index].idProducto = idProducto;
        await pool.query("INSERT INTO productostransporte set ?", [ transportes[index]]);
      }
  
      for (let index = 0; index < subcategorias.length; index++) {
        await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
      }
  
      for (let index3 = 0; index3 < incrementos.length; index3++) {
        let dataIncremento = incrementos[index3];
        dataIncremento[0].idActividad = idProducto;
        const resp3 = await pool.query("INSERT INTO incrementos set ?", dataIncremento[0]);
        let idIncremento = resp3.insertId;
  
        for (let index4 = 0; index4 < dataIncremento[1].length; index4++) {
          let detalleIncremento = dataIncremento[1][index4];
          detalleIncremento.idIncremento = idIncremento;
          if (dataIncremento[0].tipo == 1) {
            //Incremento de horas
            const resp4 = await pool.query("INSERT INTO incrementos_horas set ?", detalleIncremento);
          } else {
            //Incremento de fechas
            const resp4 = await pool.query("INSERT INTO incrementos_fechas set ?", detalleIncremento);
          }
            
        }
      }
    } catch (error) {
      
        
        
        
        
        
        
        
        
        

      
      res.status(500).send({ error: error });
    }
      //

   
      
  
    
    }
  
    res.json("Finalizado");

  }

  public async createActividad(req: Request, res: Response): Promise<void> {
    let producto = req.body[0];
    let productoInfo = req.body[1];
    let opciones = req.body[2];
    let horarios = req.body[3];
    let diasCerrados = req.body[4]; 
    let transportes = req.body[5];
    let subcategorias = req.body[6];

    //

    const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
    let idProducto=resp1.insertId;
    productoInfo.idProducto = idProducto

    const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
    //
    for (let index = 0; index < opciones.length; index++) {
      opciones[index].idProducto = idProducto;
      await pool.query("INSERT INTO productosopciones set ?", [ opciones[index]]);
    }

    for (let index = 0; index < horarios.length; index++) {
      horarios[index].idProducto = idProducto;
      await pool.query("INSERT INTO productoshorarios set ?", [ horarios[index]]);
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      diasCerrados[index].idProducto = idProducto;
      await pool.query("INSERT INTO productosdiascerrados set ?", [ diasCerrados[index]]);
    }

    for (let index = 0; index < transportes.length; index++) {
      transportes[index].idProducto = idProducto;
      await pool.query("INSERT INTO productostransporte set ?", [ transportes[index]]);
    }
 
    for (let index = 0; index < subcategorias.length; index++) {
      await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
    }

    res.json(idProducto);

  }


  public async createActividad_fromList(req: Request, res: Response): Promise<void> {
    for (let ii = 0; ii < req.body.length; ii++) { 
      let producto = req.body[ii][0];
      let productoInfo = req.body[ii][1];
      let opciones = req.body[ii][2];
      let horarios = req.body[ii][3];
      let diasCerrados = req.body[ii][4]; 
      let transportes = req.body[ii][5];
      let subcategorias = req.body[ii][6];
  
      try {
        const resp1 = await pool.query("INSERT INTO productos set ?", [producto]);
      let idProducto=resp1.insertId;
      productoInfo.idProducto = idProducto
  
      const resp2 = await pool.query("INSERT INTO productosinfo set ?", [productoInfo]);
      for (let index = 0; index < opciones.length; index++) {
        opciones[index].idProducto = idProducto;
        //

        await pool.query("INSERT INTO productosopciones set ?", [ opciones[index]]);
      }
  
      for (let index = 0; index < horarios.length; index++) {
        horarios[index].idProducto = idProducto;
        await pool.query("INSERT INTO productoshorarios set ?", [ horarios[index]]);
      }
  
      for (let index = 0; index < diasCerrados.length; index++) {
        diasCerrados[index].idProducto = idProducto;
        await pool.query("INSERT INTO productosdiascerrados set ?", [ diasCerrados[index]]);
      }
  
      for (let index = 0; index < transportes.length; index++) {
        transportes[index].idProducto = idProducto;
        await pool.query("INSERT INTO productostransporte set ?", [ transportes[index]]);
      }
  
      for (let index = 0; index < subcategorias.length; index++) {
        await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${idProducto}, ${subcategorias[index].idSubcategoria})`);
      }
  
      } catch (error) {
        
        
        
        
        
        
        
        
        

        
        res.status(500).send({ error: error });
      }
  
      

    }
    
    res.json("Finalizado");

  }

  
  

  public async listByCiudadCategoriaSubcategoria(req: Request, res: Response): Promise<void> {
    const { idCiudad, categoria, subCategoria } = req.params;
    //
    //
    //   `SELECT P.* FROM productos P INNER JOIN productossubcategoria PS ON P.idProducto = PS.idProducto WHERE P.idCiudad = ${idCiudad} AND P.categoria =${categoria} AND PS.subcategoria=${subCategoria} `
    // );
    const respuesta = await pool.query(
      `SELECT P.* FROM productos P INNER JOIN productossubcategoria PS ON P.idProducto = PS.idProducto WHERE P.idCiudad = ${idCiudad} AND P.categoria =${categoria} AND PS.subcategoria=${subCategoria} `
    );
    //
    res.json(respuesta);
  }

  public async listByPais_vista (req : Request,res : Response) : Promise<void>
  {
      const { idPais, idCiudad,categoria } = req.params;     
      let respuesta;
    if (Number.parseInt(idCiudad) == -1) {
      //
          respuesta=await pool.query(`SELECT C.nombre ciudad, P.* FROM productos P INNER JOIN ciudad C ON P.idCiudad = C.idCiudad WHERE C.idpais=${idPais} AND P.categoria=${categoria} ORDER BY ciudad DESC`);
    } else {
      //
          respuesta=await pool.query(`SELECT C.nombre ciudad, P.* FROM productos P INNER JOIN ciudad C ON P.idCiudad = C.idCiudad WHERE C.idCiudad=${idCiudad} AND P.categoria=${categoria} ORDER BY ciudad DESC`);
      }
      
      res.json(respuesta);
  }

  public async listProductoByIdProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM productos WHERE idProducto=${idProducto}`
    );

    // const respuesta = await pool.query(
    //   `SELECT * FROM productosinfo WHERE idProducto=${idProducto} `
    // );
    res.json(respuesta[0]);
  }

  public async listProductoByIdProducto_vista(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT PP.nombre pais, C.nombre ciudad, P.* FROM productos P INNER JOIN ciudad C ON P.idCiudad=C.idCiudad INNER JOIN pais PP ON C.idpais= PP.id WHERE P.idProducto=${idProducto}`
    );

    // const respuesta = await pool.query(
    //   `SELECT * FROM productosinfo WHERE idProducto=${idProducto} `
    // );
    res.json(respuesta[0]);
  }

  public async listProductoInfoByIdProducto_vista(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    ////
    const respuesta = await pool.query(
      `SELECT D.divisa divisa, PI.* FROM productosinfo PI INNER JOIN divisas D ON PI.idDivisa=D.idDivisa WHERE PI.idProducto=${idProducto}`
    );

    // const respuesta = await pool.query(
    //   `SELECT * FROM productosInfo WHERE idProducto=${idProducto} `
    // );
    res.json(respuesta[0]);
  }

  public async listProductoInfoByIdProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT pi.*, c.nombre AS ciudad
      FROM productosinfo pi
      INNER JOIN productos p ON pi.idProducto = p.idProducto
      INNER JOIN ciudad c ON p.idCiudad = c.idCiudad
      WHERE pi.idProducto=${idProducto} `
    );

    // const respuesta = await pool.query(
    //   `SELECT * FROM productosInfo WHERE idProducto=${idProducto} `
    // );
    res.json(respuesta);
  }

  public async listDiasCerradosByIdProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM productosdiascerrados WHERE idProducto=${idProducto} `
    );
    res.json(respuesta);
  }

  public async listHorariosProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM productoshorarios WHERE idProducto=${idProducto} ORDER BY hora ASC`
    );
    res.json(respuesta);
  }

  public async listEntradasByIdProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM productosentradas WHERE idProducto=${idProducto}`
    );
    res.json(respuesta);
  }

  public async listOpcionesByIdProducto(
    req: Request,
    res: Response
  ): Promise<void> {
   try {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM productosopciones WHERE idProducto=${idProducto}`
    );
    res.json(respuesta);
   } catch (error) {
     
   }
  }

  public async listTarifasIdProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT * FROM productostarifas WHERE idProducto=${idProducto}`
    );
    res.json(respuesta);
  }

  public async listTransportesIdProducto_vista( //Contiene todos los camposde productosTransportes ademas de solo nombre del vehiculo
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;

    const respuesta = await pool.query(
      `SELECT V.nombre vehiculo, PT.* FROM productostransporte PT INNER JOIN vehiculo V ON PT.idVehiculo=V.idVehiculo WHERE PT.idProducto=${idProducto} `
    );
    res.json(respuesta);
  }

  
  public async incrementoByTrasladoFecha(
    req: Request,
    res: Response
  ): Promise<void> {
    let { id, fecha } = req.params;
    //
    //
    // 
    //   `SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechas FI ON I.idIncremento=FI.idIncremento WHERE idActividad=${id} AND tipoActividad=1 and tipo=2 AND '${fecha}' BETWEEN FI.fechaInicial AND FI.fechaFinal `
    // );
    const traslados = await pool.query(
      `SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechas FI ON I.idIncremento=FI.idIncremento WHERE idActividad=${id} AND tipoActividad=1 and tipo=2 AND '${fecha}' BETWEEN FI.fechaInicial AND FI.fechaFinal `
    );
    res.json(traslados);
  }
  public async incrementoByTrasladoFechaVariable(
    req: Request,
    res: Response
  ): Promise<void> {
    let { id, fecha } = req.params;
    const traslados = await pool.query(
      "SELECT porcentaje FROM incrementos I INNER JOIN incrementos_fechasvariables FI ON I.idIncremento=FI.idIncremento WHERE idActividad=? AND tipoActividad=1 and tipo=4 AND ? BETWEEN FI.fechaInicial AND FI.fechaFinal ",
      [id, fecha]
    );
    res.json(traslados);
  }
  public async incrementoByTrasladoHora(
    req: Request,
    res: Response
  ): Promise<void> {
    let { id, hora } = req.params;
    //
    // 
    //   `SELECT porcentaje FROM incrementos I INNER JOIN incrementos_horas HI ON I.idIncremento=HI.idIncremento WHERE idActividad=${id} AND tipoActividad=1 and tipo=1 AND ${hora} BETWEEN HI.horaInicial AND HI.horaFinal`
    // );
    const traslados = await pool.query(
      "SELECT porcentaje FROM incrementos I INNER JOIN incrementos_horas HI ON I.idIncremento=HI.idIncremento WHERE idActividad=? AND tipoActividad=1 and tipo=1 AND ? BETWEEN HI.horaInicial AND HI.horaFinal ",
      [id, hora]
    ); 
    res.json(traslados);
  }

  public async listProductosRelacionados(
    req: Request,
    res: Response
  ): Promise<void> {
    let { titulo, categoria } = req.params;
    //
    // 
    //   `SELECT * FROM productos WHERE titulo="${titulo}" and categoria!=${categoria}`
    // );
    
    
    const productos = await pool.query(
      `SELECT * FROM productos WHERE titulo="${titulo}" and categoria!=${categoria} GROUP BY titulo`
    );
    res.json(productos);
  }

  public async listTransporteByProducto(
    req: Request,
    res: Response
  ): Promise<void> {
    let { idProducto, tipo } = req.params;
    ////
    let productos;
    if (tipo == `-1`) {
    productos = await pool.query(
        `SELECT PT.idProducto, PT.idProductoTransporte,PT.idVehiculo,V.nombre, V.pasajerosMax,V.maletasMax, V.maletasManoMax,PT.noPersonas, PT.tarifa,PT.horasExtras FROM productostransporte PT INNER JOIN vehiculo V ON PT.idVehiculo = V.idVehiculo WHERE PT.idProducto =${idProducto}`
      );
    } else {
    productos = await pool.query(
        `SELECT PT.idProducto, PT.idProductoTransporte,PT.idVehiculo,V.nombre, V.pasajerosMax,V.maletasMax, V.maletasManoMax,PT.noPersonas, PT.tarifa,PT.horasExtras FROM productostransporte PT INNER JOIN vehiculo V ON PT.idVehiculo = V.idVehiculo WHERE PT.idProducto =${idProducto} AND V.lujo=${tipo}`
      );
    }
   
    res.json(productos);
  }

  public async actualizarTPAP(req: Request, res: Response): Promise<void> {
    let producto = req.body[0];
    let productoInfo = req.body[1];
    let tarifasPersonas = req.body[2];
    let entradas = req.body[3];
    let opciones = req.body[4];
    let horarios = req.body[5];
    let diasCerrados = req.body[6];
    let subcategorias = req.body[7];


    delete producto.ciudad;
    delete producto.pais;
    delete productoInfo.divisa;

    try {
      const resp1 = await pool.query('UPDATE productos SET ?  WHERE idProducto = ?', [producto, producto.idProducto]);
    } catch (error) {
      this.imprimirError(`UPDATE productos SET${producto}  WHERE idProducto = ${producto.idProducto}`, error);
      
    }

    try {
      const resp2 = await pool.query('UPDATE productosinfo SET ?  WHERE idProductoInfo = ?', [productoInfo, productoInfo.idProductoInfo]);
    } catch (error) {
      this.imprimirError(`UPDATE productosinfo SET ${productoInfo}  WHERE idProductoInfo = ${productoInfo.idProductoInfo}`, error);
    }
    
    for (let index = 0; index < tarifasPersonas.length; index++) {
      tarifasPersonas[index].idProducto = producto.idProducto;
      try {
        await pool.query('UPDATE productostarifas SET ?  WHERE idProductoTarifa = ?', [tarifasPersonas[index],tarifasPersonas[index].idProductoTarifa]);      
      } catch (error) {
        this.imprimirError(`UPDATE productostarifas SET ${tarifasPersonas[index]}  WHERE idProductoTarifa = ${tarifasPersonas[index].idProductoTarifa}`, error);
      }
    }

    for (let index = 0; index < entradas.length; index++) {
      entradas[index].idProducto = producto.idProducto;
      try {
        await pool.query('UPDATE productosentradas SET ?  WHERE idProductoEntrada = ?', [entradas[index],entradas[index].idProductoEntrada]);     
      } catch (error) {
        this.imprimirError(`UPDATE productosentradas SET ${entradas[index]}  WHERE idProductoEntrada = ${entradas[index].idProductoEntrada}`, error);

      }
    }

    for (let index = 0; index < opciones.length; index++) {
      opciones[index].idProducto = producto.idProducto;
      try {
        await pool.query('UPDATE productosopciones SET ?  WHERE idProductoOpcion = ?', [opciones[index],opciones[index].idProductoOpcion]);     
      } catch (error) {
        this.imprimirError(`UPDATE productosopciones SET ${opciones[index]}  WHERE idProductoOpcion = ${opciones[index].idProductoOpcion}`, error);
      }
    }

    for (let index = 0; index < horarios.length; index++) {
      horarios[index].idProducto = producto.idProducto;
      try {
        await pool.query('UPDATE productoshorarios SET ?  WHERE idProductoHorario = ?', [horarios[index],horarios[index].idProductoHorario]);   

      } catch (error) {
        this.imprimirError(`UPDATE productoshorarios SET ${horarios[index]}  WHERE idProductoHorario = ${horarios[index].idProductoHorario}`,error);
      }
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      diasCerrados[index].idProducto = producto.idProducto;
      try {
        await pool.query('UPDATE productosdiascerrados SET ?  WHERE idProductoDiaCerrado = ?', [diasCerrados[index],diasCerrados[index].idProductoDiaCerrado]);   
      } catch (error) {
        this.imprimirError(`UPDATE productosdiascerrados SET ${diasCerrados[index]}  WHERE idProductoDiaCerrado = ${diasCerrados[index].idProductoDiaCerrado}`, error);
      }
    }


    const delete1 = await pool.query(`DELETE FROM productossubcategoria WHERE idProducto = ${producto.idProducto}`);
    for (let index = 0; index < subcategorias.length; index++) {
      try {
        await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${producto.idProducto}, ${subcategorias[index].idSubcategoria})`);

      } catch (error) {
        this.imprimirError(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${producto.idProducto}, ${subcategorias[index].idSubcategoria})`, error);
      }
    }

    res.json(`actualizado`);
  }
  

  public async actualizarTPET(req: Request, res: Response): Promise<void> {
   
    let producto = req.body[0];
      let productoInfo = req.body[1];
      let tarifasPersonas = req.body[2];
      let entradas = req.body[3];
      let opciones = req.body[4];
      let horarios = req.body[5];
      let diasCerrados = req.body[6];
      let transportes = req.body[7];
    let subcategorias = req.body[8];
    
    try {
     
      
      delete producto.ciudad;
      delete producto.pais;
      delete productoInfo.divisa;
  
      const resp1 = await pool.query('UPDATE productos SET ?  WHERE idProducto = ?', [producto, producto.idProducto]);
      const resp2 = await pool.query('UPDATE productosinfo SET ?  WHERE idProductoInfo = ?', [productoInfo, productoInfo.idProductoInfo]);
    
      for (let index = 0; index < tarifasPersonas.length; index++) {
        tarifasPersonas[index].idProducto = producto.idProducto;
        await pool.query('UPDATE productostarifas SET ?  WHERE idProductoTarifa = ?', [tarifasPersonas[index],tarifasPersonas[index].idProductoTarifa]);      
      }
  
      for (let index = 0; index < entradas.length; index++) {
        entradas[index].idProducto = producto.idProducto;
        await pool.query('UPDATE productosentradas SET ?  WHERE idProductoEntrada = ?', [entradas[index],entradas[index].idProductoEntrada]);     
      }
  
      for (let index = 0; index < opciones.length; index++) {
        opciones[index].idProducto = producto.idProducto;
        await pool.query('UPDATE productosopciones SET ?  WHERE idProductoOpcion = ?', [opciones[index],opciones[index].idProductoOpcion]);     
      }
  
      for (let index = 0; index < horarios.length; index++) {
        horarios[index].idProducto = producto.idProducto;
        await pool.query('UPDATE productoshorarios SET ?  WHERE idProductoHorario = ?', [horarios[index],horarios[index].idProductoHorario]);   
      }
  
      for (let index = 0; index < diasCerrados.length; index++) {
        diasCerrados[index].idProducto = producto.idProducto;
        await pool.query('UPDATE productosdiascerrados SET ?  WHERE idProductoDiaCerrado = ?', [diasCerrados[index],diasCerrados[index].idProductoDiaCerrado]);   
      }
  
  
      for (let index = 0; index < transportes.length; index++) {
        delete transportes[index].vehiculo;
        transportes[index].idProducto = producto.idProducto;
        await pool.query('UPDATE productostransporte SET ?  WHERE idProductoTransporte = ?', [transportes[index],transportes[index].idProductoTransporte]);      
      }
  
  
      const delete1 = await pool.query(`DELETE FROM productossubcategoria WHERE idProducto = ${producto.idProducto}`);
      for (let index = 0; index < subcategorias.length; index++) {
        //
        await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${producto.idProducto}, ${subcategorias[index].idSubcategoria})`);
      }
  
      res.json(`actualizado`);
    } catch (error) {
      
      
      
      
      
      

      
    }
   
  } 
  

  public async actualizarTEG(req: Request, res: Response): Promise<void> {
    let producto = req.body[0];
    let productoInfo = req.body[1];
    let opciones = req.body[2];
    let horarios = req.body[3];
    let diasCerrados = req.body[4];
    let transportes = req.body[5];
    let subcategorias = req.body[6];
    
    delete producto.ciudad;
    delete producto.pais;
    delete productoInfo.divisa;
   

    const resp1 = await pool.query('UPDATE productos SET ?  WHERE idProducto = ?', [producto, producto.idProducto]);
    const resp2 = await pool.query('UPDATE productosinfo SET ?  WHERE idProductoInfo = ?', [productoInfo, productoInfo.idProductoInfo]);
    
    for (let index = 0; index < opciones.length; index++) {
      opciones[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productosopciones SET ?  WHERE idProductoOpcion = ?', [opciones[index],opciones[index].idProductoOpcion]);     
    }

    for (let index = 0; index < horarios.length; index++) {
      horarios[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productoshorarios SET ?  WHERE idProductoHorario = ?', [horarios[index],horarios[index].idProductoHorario]);   
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      diasCerrados[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productosdiascerrados SET ?  WHERE idProductoDiaCerrado = ?', [diasCerrados[index],diasCerrados[index].idProductoDiaCerrado]);   
    }

    for (let index = 0; index < transportes.length; index++) {
      delete transportes[index].vehiculo;
      transportes[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productostransporte SET ?  WHERE idProductoTransporte = ?', [transportes[index],transportes[index].idProductoTransporte]);      
    }

    const delete1 = await pool.query(`DELETE FROM productossubcategoria WHERE idProducto = ${producto.idProducto}`);
    for (let index = 0; index < subcategorias.length; index++) {
      //
      await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${producto.idProducto}, ${subcategorias[index].idSubcategoria})`);
    }


    res.json(`actualizado`);
  }

  public async list_subcategoriasByIdProducto(req: Request, res: Response): Promise<void> {
    const { idProducto } = req.params;
      const respuesta = await pool.query(
       `
       SELECT S.* FROM productossubcategoria PS INNER JOIN subcategorias S ON PS.subcategoria = S.idSubcategoria WHERE PS.idProducto=${idProducto}

       `
      );
      res.json(respuesta);
}

  


  public async actualizarActividad(req: Request, res: Response): Promise<void> {
    let producto = req.body[0];
    let productoInfo = req.body[1];
    let opciones = req.body[2];
    let horarios = req.body[3];
    let diasCerrados = req.body[4];
    let transportes = req.body[5];
    let subcategorias = req.body[6];

    delete producto.ciudad;
    delete producto.pais;
    delete productoInfo.divisa;

    const resp1 = await pool.query('UPDATE productos SET ?  WHERE idProducto = ?', [producto, producto.idProducto]);
    const resp2 = await pool.query('UPDATE productosinfo SET ?  WHERE idProductoInfo = ?', [productoInfo, productoInfo.idProductoInfo]);
    
    for (let index = 0; index < opciones.length; index++) {
      opciones[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productosopciones SET ?  WHERE idProductoOpcion = ?', [opciones[index],opciones[index].idProductoOpcion]);     
    }

    for (let index = 0; index < horarios.length; index++) {
      horarios[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productoshorarios SET ?  WHERE idProductoHorario = ?', [horarios[index],horarios[index].idProductoHorario]);   
    }

    for (let index = 0; index < diasCerrados.length; index++) {
      diasCerrados[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productosdiascerrados SET ?  WHERE idProductoDiaCerrado = ?', [diasCerrados[index],diasCerrados[index].idProductoDiaCerrado]);   
    }

    for (let index = 0; index < transportes.length; index++) {
      delete transportes[index].vehiculo;
      transportes[index].idProducto = producto.idProducto;
      await pool.query('UPDATE productostransporte SET ?  WHERE idProductoTransporte = ?', [transportes[index],transportes[index].idProductoTransporte]);      
    }

    const delete1 = await pool.query(`DELETE FROM productossubcategoria WHERE idProducto = ${producto.idProducto}`);
    for (let index = 0; index < subcategorias.length; index++) {
      //
      await pool.query(`INSERT INTO productossubcategoria (idProducto, subcategoria) VALUES (${producto.idProducto}, ${subcategorias[index].idSubcategoria})`);
    }

    res.json(`actualizado`);
  }
  
  public async delete(req: Request, res: Response): Promise<void> {
    const {  idProducto } = req.params;
    const resp = await pool.query('DELETE FROM productos WHERE idProducto = ?', [idProducto]);
    const resp1 = await pool.query(`DELETE FROM incrementos WHERE idActividad = ${idProducto} AND tipoActividad=1`);
    res.json(resp);
  }

  imprimirError(query: any, error: any) {
    
    
  }

  public async listImagenesExistentes(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idProducto } = req.params;
    
    const respuesta = await pool.query(
      `SELECT * FROM productoImagenes WHERE idProducto=${idProducto} `
    );
    res.json(respuesta);
  }
  
}

export const productosController = new ProductosController();
