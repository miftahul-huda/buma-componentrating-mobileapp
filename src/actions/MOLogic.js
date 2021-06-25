import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import MO from '../model/MO';
import ModelComponentLogic from './ModelComponentLogic';
var dateFormat = require('dateformat');
import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

const Op = Sequelize.Op;
const Model = Sequelize.Model;
import GlobalSession from '../GlobalSession';


export default class MOLogic
{

    static uploadImage(mo, callback, callbackError)
    {
        var url = Config.API_HOST_UPLOAD + "/upload/gcs/buma-pdm-image-recognition/buma-pdm-storage/uploaded_mo_images";
        console.log(url);
        
        let targetFilename = mo.filename;
        targetFilename = targetFilename.split('/');
        targetFilename = targetFilename[targetFilename.length - 1];
        let ss = targetFilename.split(".");

        let ext = ss[ss.length - 1];
        targetFilename = targetFilename.replace("." + ext, "");

        targetFilename = targetFilename + "-" + mo.rating + "." + ext;

        HttpClient.upload(url, mo.filename, targetFilename, function(response){
            console.log("uploaded ");
            console.log(response);
            if(callback != null)
                callback(response.payload);
        }, function(error)
        {
            if(callbackError != null)
                callbackError(error)
        });
    }

    static saveMOLocallyCall(me, mo, callback, callbackError)
    {
        me.saveMOLocally(mo, function(response){
                        
            if(callback != null)
                callback(mo);

        }, function(error){

            if(callbackError != null)
                callbackError(error);
            
        })
    }

    static submitMO(mo, callback, callbackError, isUpdateRemoteMo = false)
    {
        var me = this;
        
        mo.process_date = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        mo.sync_date = dateFormat(new Date(), "yyyy-mm-dd h:MM:ss");
        mo.is_sync = 1;
        var moID  = mo.id;
        mo.id = null;

        me.uploadImage(mo, function(filepath)
        {
            mo.filename = filepath;

            me.createUploadedMORemotely(mo, function(response){

                if(isUpdateRemoteMo)
                {
                    me.updateMORemotely(moID, function(response){

                        me.saveMOLocallyCall(me, mo, callback, callbackError)

                    }, function(error){
                        me.saveMOLocallyCall(me, mo, callback, callbackError)
                        if(callbackError != null)
                            callbackError(error);
                        
                    })
                }
                else{
                    me.saveMOLocallyCall(me, mo, callback, callbackError)
                }
            }, function(error){
                me.saveMOLocallyCall(me, mo, callback, callbackError)
                if(callbackError != null)
                    callbackError(error);
            })
        }, function(error){
            me.saveMOLocallyCall(me, mo, callback, callbackError)
            if(callbackError != null)
                callbackError(error);
        });
    }

    static updateMORemotely(moID, callback, callbackError)
    {
        let url  = Config.API_HOST + "/mo/update/" + moID + "/1";
        console.log(url);
        
        HttpClient.get(url, function(response) {
            if(callback != null)
                callback(response);
        },
        function(error)
        {
            if(callbackError != null)
                callbackError(error);
        }
        );        
    }

    static createUploadedMORemotely(mo, callback, callbackError)
    {
        var url = Config.API_HOST + "/uploadedmo/create";
        HttpClient.post(url, mo, function(response)
        {
            if(callback != null)
                callback(response);
        },
        function(error)
        {
            if(callbackError != null)
                callbackError(error);
        });        
    }

    static saveMOLocally(mo, callback, callbackError)
    {
        MO.create(mo).then(function (){
            if(callback != null)
                callback(mo);
        }).catch(error => {
            console.log(error);
            if(callbackError != null)
                callbackError(error);
        })
    }

    //===================

    /***
     * Create new mo in local
     */

    static async createNewLocalMO(mo)
     {
         try {
             var newMO = await MO.create(mo);
             return newMO;
         } catch (error) {
             throw error;
         }
     }

    /***
     * Get all local MO with is_closed = 0 and location = current user location
     */
    static async  getAllLocalMO(search="")
    {
        
        try {
            let where = {where: {
                [Op.and]:
                {
                    location: GlobalSession.currentLocation,
                    is_closed: 0
                }
            }}

            if(search.trim().length > 0)
            {

                where = { where: {
                    [Op.and]:
                    {
                        location: GlobalSession.currentLocation,
                        is_closed: 0,
                        [Op.or]:
                        {
                            mo_number: {
                                [Op.like]: '%' + search + '%'
                            }
                            ,
                            unit_code: {
                                [Op.like]: '%' + search + '%'
                            }
                            ,
                            ps_type: {
                                [Op.like]: '%' + search + '%'
                            }
    
                        }
                    }
                   
                }}

            }

            let mos = await MO.findAll(where);

            console.log("Result length")
            console.log(mos.length);

            return mos;
        }
        catch (e)
        {
            console.log(e)
            throw e;
        }

        return true;
    }

    /***
     * Get all local MO with is_closed = 1 and location = current user location
     */
    static async  getAllLocalClosedMO()
    {
        try {
            let mos = await MO.findAll({
                where: {
                    [Op.and]:
                    {
                        location: GlobalSession.currentLocation,
                        is_closed: 1
                    }
                }
            });

            return mos;
        }
        catch (e)
        {
            console.log(e)
            throw e;
        }

        return true;
    }

    /***
     * Get local MO by current mo number
     */
    static async  getLocalMO()
    {
        try {
            let mos = await MO.findAll({
                where: {
                    mo_number: GlobalSession.currentMONumber
                }
            })

            let mo = null;
            if(mos.length > 0)
                mo = mos[0];
            var json = JSON.stringify(mo);
            mo = JSON.parse(json);
            return mo;
        } catch (error) {
            throw error;
        }
    }


    /***
     * update local mo with current mo number
     */
    static async  updateLocalMO(mo)
    {
        try {
            delete mo.id;
            await MO.update(mo, {
                where: {
                    mo_number: GlobalSession.currentMONumber
                }
            })

            return true;
        }
        catch (e)
        {
            throw e;
        }       
    }

    /***
     * set current local MO is_closed = 1
     */
    static async closeLocalMO()
    {
        try {
            await MO.update({ is_closed: 1 }, {
                where: {
                    mo_number: GlobalSession.currentMONumber
                }
            })

            return true;
        }
        catch (e)
        {
            throw e;
        }       
    }

    /***
     * delete all local MO with is_closed = 1
     */
    static async deleteClosedLocalMO()
    {
        try {
            await MO.destroy( {
                where: {
                    is_closed: 1
                }
            })

            return true;
        }
        catch (e)
        {
            throw e;
        }       
    }

    static async getTotalUnprocessedComponent()
    {
        let totalComponent = await ModelComponentLogic.getTotalComponentByModelAndPsType();
        let totalProcessedComponent = await ModelComponentLogic.getTotalProcessedComponent();
        return totalComponent - totalProcessedComponent;        
    }

    static async shouldLocalMOClosed()
    {
        try {
            let totalComponent = await ModelComponentLogic.getTotalComponentByModelAndPsType();
            let totalProcessedComponent = await ModelComponentLogic.getTotalProcessedComponent();
            console.log("totalProcessedComponent vs totalComponent")
            console.log(totalProcessedComponent + " - " + totalComponent);
            //alert(totalComponent + "-" + totalProcessedComponent)
            if(totalProcessedComponent == totalComponent)
                return true;
            else
                return false;
        } catch (e) {
            throw e;
        }
    }

    static async getTotalAllMO()
    {
        try {
            var total = await MO.count();

            return total;
        } catch (error) {
            throw error;
        }
    }

    static async getTotalNotClosedMOByLocation()
    {
        try {
            var total = await MO.count({
                where: {
                    [Op.and] :
                    {
                        is_closed: 0,
                        location: GlobalSession.currentLocation
                    }
                }
            });

            return total;
        } catch (error) {
            throw error;
        }
    }

    /***
     * Get all local MO with is_closed = 1 and location = current user location
     */
    static async  getAllLocalMONoFilter()
    {
        try {
            let mos = await MO.findAll();

            return mos;
        }
        catch (e)
        {
            console.log(e)
            throw e;
        }

        return true;
    }
}


