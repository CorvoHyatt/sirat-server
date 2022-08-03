import { Request, Response } from 'express';
import pool from '../database';
import axios from 'axios';
import scrapeIt from "scrape-it";


class DivisasController
{

     
    public async list (req : Request,res : Response) : Promise<void>
    { 
        const divisas = await pool.query('SELECT * FROM divisas');
        res.json(divisas);
    }

    public async listByName(req: Request, res: Response): Promise<void> {
        const { name } = req.params;
        const ciudad = await pool.query(`SELECT * FROM divisas WHERE TRIM(LOWER(divisa)) LIKE TRIM(LOWER('${name}'))`);
        if(ciudad[0]){
            res.json(ciudad[0]);
        }else{
            res.json(-1);
        }
    }

    public async getOne (req : Request,res : Response): Promise<any>
    {   
        const {id} = req.params;     
        const divisas = await pool.query('SELECT * FROM divisas WHERE idDivisa=?',[id]);
        if(divisas.length>0)
        {
            return res.json(divisas[0]);
        }
        res.status(404).json({text:"la divisa no existe"});
    } 


    public async divisaBase_getOne (req : Request,res : Response): Promise<any>
    {   
        const {id} = req.params;     
        const divisas = await pool.query('SELECT * FROM divisasbase WHERE idDivisaBase=?',[id]);
        if(divisas.length>0)
        {
            return res.json(divisas[0]);
        }
        res.status(404).json({text:"la divisa no existe"});
    } 

    public async actualizarValorDivisas (req : Request,res : Response): Promise<any>{  

        var urlPrecioEuro1: string = 'https://www.indicadoresmexico.com/cambio-divisas/cambio-euro-peso-mexicano/';
        var urlPrecioEuro2: string = 'https://www.eleconomista.es/cruce/EURMXN';
        var urlPrecioEuro3: string = 'https://api.cambio.today/v1/quotes/EUR/MXN/json?quantity=1&key=9770|G3Gra9Ei2QXFM2zpaqNGJAHULBFe3Ft8';
        var urlPrecioDolar: string = 'https://api.cambio.today/v1/quotes/USD/MXN/json?quantity=1&key=9770|G3Gra9Ei2QXFM2zpaqNGJAHULBFe3Ft8';
        var urlDivisas: string = 'http://api.exchangeratesapi.io/v1/latest?access_key=495516cd149232bf6ad2e17c7ae7d8ad';
        var precioEuro1: any = 0;
        var precioEuro2: any = 0;
        var precioEuro3: any = 0;
        var precioDolar: any = 0;
        var divisas: any[] = [];
        var valorEuroToMxn: any = 0;

        //CONSULTAR DIVISAS DB
        const divisasActuales = await pool.query('SELECT * FROM divisas');

        //OBTENER VALOR DEL EURO1 MEDIANTE Web scraping DEL SITIO: www.indicadoresmexico.com
        //Tiene una variante de ±3 centavo respecto a google finance
        precioEuro1 = await scrapeIt(urlPrecioEuro1, {
            obj: {
                listItem: 'div#valor_caja',
                data: {
                    value: 'span#valor_destino',
                }
            }
        });
        precioEuro1 = precioEuro1.data.obj[0].value;

        //OBTENER VALOR DEL EURO2 MEDIANTE Web scraping DEL SITIO: www.eleconomista.es
        //Tiene una variante de ±3 centavos respecto a google finance
        precioEuro2 = await scrapeIt(urlPrecioEuro2, {
            obj: {
                listItem: 'div.no-gutters.cot-headerBackground',
                data: {
                    value: 'span.last-value',
                }
            }
        });
        precioEuro2 = precioEuro2.data.obj[0].value.replace(',', '.').replace('/', '').replace('€', '');

        //OBTENER VALOR DEL EURO3 MEDIANTE API: api.cambio.today
        //Tiene una variante de +15/20 centavos respecto a google finance
        await axios.get(urlPrecioEuro3).then((res: any) => { precioEuro3 = res.data.result.value }).catch((err:any) => { console.log(err) });

        //OBTENER VALOR DEL DOLAR MEDIANTE API: api.cambio.today
        //Tiene una variante de +10 centavos respecto a google finance
        await axios.get(urlPrecioDolar).then((res: any) => { precioDolar = res.data.result.value }).catch((err:any) => { console.log(err) });
        // console.log('precioDolar', precioDolar);

        //CONSULTAR VALOR DE DIVISAS ACTUALES CON BASE EN EL VALOR DEL EURO DEL API: api.exchangeratesapi.io
        //250 consultas/mes en plan gratuito
        await axios.get(urlDivisas).then((res: any) => {
            if(precioEuro1 !== 0){
                valorEuroToMxn = precioEuro1;
            }else if(precioEuro2 !== 0){
                valorEuroToMxn = precioEuro2;
            }else if(precioEuro3 !== 0){
                valorEuroToMxn = precioEuro3;
            }else{
                console.log('ERROR: No se encontró valor de divisa para el EURO');
            }
            //CONVERTIR BASE DE DIVISAS DE EUR A MXN
            let d: any = res.data.rates;
            d = Object.entries(d);
            d.map((divisa: any) => {
                if(divisa[0] !== 'MXN'){
                    divisa[1] = (divisa[1] / valorEuroToMxn);
                    let obj = {
                        divisa: divisa[0],
                        valor: divisa[1]
                    }
                    divisas.push(obj);
                }
            });
        }).catch((err:any) => { console.log(err) });

        // divisasActuales.map((d: any) => {
        //     let p = divisas.find((o) => d.divisa == o.divisa);
        //     if(p === undefined && d.divisa != 'MXN'){
        //         console.log('d', d);
        //     }
        // });

        //Nombres de divisas
        //https://picodotdev.github.io/blog-bitix/2015/06/servicio-para-obtener-ratios-de-conversion-entre-divisas/

        //ACTUALIZAR VALORES BASE DE DIVISAS EN DB (USD, EUR)
        // console.log('Me salte');
        const divisasActualesBase = await pool.query("SELECT * FROM divisasbase WHERE divisa != 'MXN'");
        divisasActualesBase.map(async(DAB: any) => {
            let nuevaDivisaBase: any = {
                idDivisaBase: DAB.idDivisaBase,
                divisa: '',
                valor: 0
            }
            switch(DAB.divisa){
                case 'USD':
                    nuevaDivisaBase.divisa = 'USD';
                    nuevaDivisaBase.valor = precioDolar;
                    break;
                case 'EUR':
                    nuevaDivisaBase.divisa = 'EUR';
                    nuevaDivisaBase.valor = valorEuroToMxn;
                    break;
                default:
                    break;
            }
            await pool.query("UPDATE divisasbase SET ? WHERE idDivisaBase = ?", [nuevaDivisaBase, DAB.idDivisaBase]);
        });

        //ACTUALIZAR VALORES DE DIVISAS EN DB
        divisas.map(async(d: any) => {
            let divisa = divisasActuales.find((divisaActual: any) => d.divisa == divisaActual.divisa);
            if(divisa !== undefined){
                if(divisa.valor !== d.valor){
                    divisa.valor = d.valor;
                    await pool.query("UPDATE divisas SET ? WHERE idDivisa = ?", [divisa, divisa.idDivisa]);
                }
            }else{
                let nuevaDivisa = {
                    idDivisa: 0,
                    divisa: d.divisa,
                    valor: d.valor,
                    descripcion: ''
                }
                await pool.query("INSERT INTO divisas SET ?", [nuevaDivisa]);
            }
        });

        res.status(200).json({text:"Actualizando valor de divisas"});

        //BTC - Bitcoin
        //BYN - Belarusian Ruble
        //BYR - Belarusian Ruble
        //CRC - Costa Rican Colon
        //CUC - Cuban Peso
        //GGP - Libra de Guernsey
        //IMP - Manx Pound
        //LTL - Lithuanian Litas
        //LVL - Latvian Lats
        //NIO - Nicaraguan Cordoba
        //SBD (SBDR) - Solomon Islands Dollar
        //STD - Saint Tomean Dobra
        //SVC - Salvadoran Colon
        //VEF - Venezuelan Bolivar
        //ZMK - Zambian kwacha

    } 


}
export const divisasController = new DivisasController();