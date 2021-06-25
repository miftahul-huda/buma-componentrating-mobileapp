import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import UploadedMO from '../model/UploadedMO';
var dateFormat = require('dateformat');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

const Op = Sequelize.Op;
const Model = Sequelize.Model;
import GlobalSession from '../GlobalSession';


export default class UploadedMOLogic
{
    static async  getAllLocalUploadedMOByMONumber()
    {
        try {
            let mos = await UploadedMO.findAll({
                where:
                {
                    mo_number: GlobalSession.currentMONumber
                }
            })
            return mos;
        }
        catch (e)
        {
            throw e;
        }
    }

    static async  getAllLocalUploadedMO(search="")
    {
        try {

            let where = {};
            if(search.trim().length > 0)
            {
                where = {
                    where: {
                        [Op.or] : {
                            unit_code : {[Op.like] : '%' + search.trim() + '%'},
                            component : {[Op.like] : '%' + search.trim() + '%'}
                        }
                    },
                    order: [
                        ['id', 'desc']
                    ]
                }
            }

            let mos = await UploadedMO.findAll(where);
            return mos;
        }
        catch (e)
        {
            console.log(e);
            return e;
        }
    }

    static async  getAllUnsyncLocalUploadedMO()
    {
        try {
            let mos = await UploadedMO.findAll({
                where: {
                    is_sync: 0
                }
            })
            return mos;
        }
        catch (e)
        {
            throw e;
        }
    }

    static async  createLocalUploadedMO(mo)
    {
        try {
            let mos = await UploadedMO.create(mo);
            return mos;
        }
        catch (e)
        {
            throw e;
        }       
    }

    static async  updateSyncLocalUploadedMO(id)
    {
        try {
            let mos = await UploadedMO.update({ is_sync:1 }, {
                where: {
                    id: id
                }
            });
            return mos;
        }
        catch (e)
        {
            throw e;
        }       
    }

}