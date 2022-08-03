import { Request, Response } from "express";
import pool from "../database";

class IncrementosController {
  public async create_list(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    for (let index = 0; index < req.body.length; index++) {
      const res1 = await pool.query(
        `INSERT INTO incrementos (idActividad,tipoActividad, tipo, nombre,porcentaje) VALUES (${id}, ${req.body[index][0].tipoActividad}, ${req.body[index][0].tipo}, '${req.body[index][0].nombre}', ${req.body[index][0].porcentaje})`
      );
      let idIncremento = res1.insertId;
      // console.log(idIncremento);
      for (let index2 = 0; index2 < req.body[index][1].length; index2++) {
        if (req.body[index][0].tipo == 1) {
          //Incremento de horas
          await pool.query(
            `INSERT INTO incrementos_horas (idIncremento, horaInicial, horaFinal) VALUES (${idIncremento}, '${req.body[index][1][index2].horaInicial}', '${req.body[index][1][index2].horaFinal}')`
          );
        } else {
          //Incremento de fechas
          await pool.query(
            `INSERT INTO incrementos_fechas (idIncremento, fechaInicial, fechaFinal) VALUES (${idIncremento}, '${req.body[index][1][index2].fechaInicial}', '${req.body[index][1][index2].fechaFinal}')`
          );
        }
      }
    }
    res.json({ msg: "creando incrementos" });
  }

  public async listFechas_ByIdActividadTipoActividad(
    req: Request,
    res: Response
  ): Promise<void> {

    try {
      const { idActividad, tipoActividad } = req.params;

      const resp = await pool.query(
        `SELECT i.*, SUBSTRING_INDEX(GROUP_CONCAT(ifechas.fechaInicial), ', ', 10) AS fechaInicial, SUBSTRING_INDEX(GROUP_CONCAT(ifechas.fechaFinal), ', ', 10) AS fechaFinal FROM incrementos i INNER JOIN incrementos_fechas ifechas ON ifechas.idIncremento = i.idIncremento WHERE i.idActividad=${idActividad} AND i.tipoActividad=${tipoActividad} GROUP BY i.idIncremento`
      );

      console.log( `SELECT i.*, SUBSTRING_INDEX(GROUP_CONCAT(ifechas.fechaInicial), ', ', 10) AS fechaInicial, SUBSTRING_INDEX(GROUP_CONCAT(ifechas.fechaFinal), ', ', 10) AS fechaFinal FROM incrementos i INNER JOIN incrementos_fechas ifechas ON ifechas.idIncremento = i.idIncremento WHERE i.idActividad=${idActividad} AND i.tipoActividad=${tipoActividad} GROUP BY i.idIncremento`);
      let incrementos: any[][] = [];
      resp.forEach((r: any) => {
        let incremento = {
          idIncremento: r.idIncremento,
          idActividad: r.idActividad, 
          tipoActividad: r.tipoActividad,
          tipo: r.tipo,
          nombre: r.nombre,
          porcentaje: r.porcentaje,
        };
        let fechasIniciales = r.fechaInicial.split(",");
        let fechasFinales = r.fechaFinal.split(",");
        let incrementosFechas: any = [];
  
        for (let index = 0; index < fechasIniciales.length; index++) {
          let iFecha = {
            idIncremento: r.idIncremento,
            fechaInicial: fechasIniciales[index],
            fechaFinal: fechasFinales[index],
          };
          incrementosFechas.push(iFecha);
        }
  
        incrementos.push([incremento, incrementosFechas]);
      });
  
      res.json(incrementos);
    } catch (error) {
      console.log(error);
    }
   
  }

  public async listHoras_ByIdActividadTipoActividad(
    req: Request,
    res: Response
  ): Promise<void> {
    const { idActividad, tipoActividad } = req.params;

    const resp = await pool.query(
      `SELECT i.*, SUBSTRING_INDEX(GROUP_CONCAT(ihoras.horaInicial), ', ', 10) AS horasIniciales, SUBSTRING_INDEX(GROUP_CONCAT(ihoras.horaFinal), ', ', 10) AS horasFinales FROM incrementos i INNER JOIN incrementos_horas ihoras ON ihoras.idIncremento = i.idIncremento WHERE i.idActividad=${idActividad} AND i.tipoActividad=${tipoActividad} GROUP BY i.idIncremento`
    );
    console.log(
      `SELECT i.*, SUBSTRING_INDEX(GROUP_CONCAT(ihoras.horaInicial), ', ', 10) AS horasIniciales, SUBSTRING_INDEX(GROUP_CONCAT(ihoras.horaFinal), ', ', 10) AS horasFinales FROM incrementos i INNER JOIN incrementos_horas ihoras ON ihoras.idIncremento = i.idIncremento WHERE i.idActividad=${idActividad} AND i.tipoActividad=${tipoActividad} GROUP BY i.idIncremento`
    );


    let incrementos: any[][] = [];
    resp.forEach((r: any) => {
      let incremento = {
        idIncremento: r.idIncremento,
        idActividad: r.idActividad,
        tipoActividad: r.tipoActividad,
        tipo: r.tipo,
        nombre: r.nombre,
        porcentaje: r.porcentaje,
      };
      let horasIniciales = r.horasIniciales.split(",");
      let horasFinales = r.horasFinales.split(",");
      let incrementosHoras: any = [];

      for (let index = 0; index < horasIniciales.length; index++) {
        let iHora = {
          idIncremento: r.idIncremento,
          horaInicial: horasIniciales[index],
          horaFinal: horasFinales[index],
        };
        incrementosHoras.push(iHora);
      }

      incrementos.push([incremento, incrementosHoras]);
    });
    res.json(incrementos);
  }
    
    
  public async actualizar_list(req: Request, res: Response): Promise<void> {
      const { id,tipoActividad } = req.params;

      try {
        console.log( `DELETE FROM incrementos WHERE idActividad =${id} AND tipoActividad=${tipoActividad} `);
        const resp=await pool.query(
          `DELETE FROM incrementos WHERE idActividad =${id} AND tipoActividad=${tipoActividad} `
        ); 
      } catch (error) {
        console.log(`DELETE FROM incrementos WHERE idActividad =${id} AND tipoActividad=${tipoActividad}`, error);
      }
 
      for (let index = 0; index < req.body.length; index++) {
          
        try {
          const res1=await pool.query(
            `INSERT INTO incrementos (idIncremento,idActividad,tipoActividad, tipo, nombre,porcentaje) VALUES (${req.body[index][0].idIncremento},${id}, ${req.body[index][0].tipoActividad}, ${req.body[index][0].tipo}, '${req.body[index][0].nombre}', ${req.body[index][0].porcentaje})`
          );
          req.body[index][0].idIncremento = res1.insertId;

        } catch (error) {
          console.log(`INSERT INTO incrementos (idIncremento,idActividad,tipoActividad, tipo, nombre,porcentaje) VALUES (${req.body[index][0].idIncremento},${id}, ${req.body[index][0].tipoActividad}, ${req.body[index][0].tipo}, '${req.body[index][0].nombre}', ${req.body[index][0].porcentaje})`, error);
        }
         
        for (let index2 = 0; index2 < req.body[index][1].length; index2++) {
            
            if (req.body[index][0].tipo == 1) { //Incremento de horas
                try {
                  await pool.query(
                    `INSERT INTO incrementos_horas (idIncremento, horaInicial, horaFinal) VALUES (${req.body[index][0].idIncremento}, '${req.body[index][1][index2].horaInicial}', '${req.body[index][1][index2].horaFinal}')`
                );
                } catch (error) {
                  console.log(`INSERT INTO incrementos_horas (idIncremento, horaInicial, horaFinal) VALUES (${req.body[index][0].idIncremento}, '${req.body[index][1][index2].horaInicial}', '${req.body[index][1][index2].horaFinal}')`, error);
                }
              
            } else {//Incremento de fechas
                try {
                  await pool.query(
                    `INSERT INTO incrementos_fechas (idIncremento, fechaInicial, fechaFinal) VALUES (${req.body[index][0].idIncremento}, '${req.body[index][1][index2].fechaInicial}', '${req.body[index][1][index2].fechaFinal}')`                    ); 
                } catch (error) {
                  console.log(`INSERT INTO incrementos_fechas (idIncremento, fechaInicial, fechaFinal) VALUES (${req.body[index][0].idIncremento}, '${req.body[index][1][index2].fechaInicial}', '${req.body[index][1][index2].fechaFinal}')` , error);
                }
            }
        }

    }
    res.json({ msg: "Actualizando incrementos" });
  }
  
  

}
export const incrementosController = new IncrementosController();
