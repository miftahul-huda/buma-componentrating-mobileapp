import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import MO from '../model/MO';
import ModelComponentLogic from './ModelComponentLogic';
import ModelComponentRemoteLogic from './ModelComponentRemoteLogic';
import MORemoteLogic from './MORemoteLogic';
import MOLogic from './MOLogic';
var dateFormat = require('dateformat');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

const Op = Sequelize.Op;
const Model = Sequelize.Model;
import GlobalSession from '../GlobalSession';
import UploadedMOLogic from './UploadedMOLogic';
import UploadedMORemoteLogic from './UploadedMORemoteLogic';


export default class SyncLogic
{
    static async syncMO()
    {
        if(GlobalSession.syncMO == false)
        {
            GlobalSession.syncMO = true;
            console.log("syncMO")
            var promise = new Promise((resolve, reject) => {
                MORemoteLogic.getTotalNotClosedMOByLocation(async function(response){

                    var totalRemote = response;
                    var totalLocal = await MOLogic.getTotalNotClosedMOByLocation();

                    console.log("syncMO:")
                    console.log("totalRemote : " + totalRemote + ", totalLocal:" + totalLocal);


                    if(totalLocal < totalRemote)
                    {
                        let localmos = await MOLogic.getAllLocalMONoFilter();

                        MORemoteLogic.getAllNotClosedMOByLocation(function(response){
                            var mos = response;
                        
                            if(mos != null)
                            {
                                mos.forEach(async function(item){
                                    delete item.id;
                                    if(SyncLogic.is_in_local_mo(item.mo_number, localmos) == false)
                                        await MOLogic.createNewLocalMO(item);
                                });
                            }

                            GlobalSession.syncMO = false;
                            resolve(true);
                        })
                    }
                    else 
                    {
                        GlobalSession.syncMO = false;
                        resolve(true);
                    }
                })
            });

            return promise;
        }
    }

    static is_in_local_mo(mo_number, localmos)
    {
        for(var i = 0; i < localmos.length; i++)
        {
            var item = localmos[i];
            if(item.mo_number == mo_number)
                return true;
        }
        return false;
    }

    static async SyncModelComponent()
    {
        console.log("SyncModelComponent")
        var promise = new Promise((resolve, reject) => {
            ModelComponentRemoteLogic.getTotalComponent(async function(response){
                var totalRemote = response;
                var totalLocal = await ModelComponentLogic.getTotalAllComponent();
                console.log(totalRemote);
                console.log(totalLocal);
                if(totalLocal != totalRemote)
                {
                    ModelComponentRemoteLogic.getAllComponent(function(response){
                        var components = response;
                        
                        components.forEach(async function(item){
                            delete item.id;
                            await ModelComponentLogic.create(item);
                        });

                        resolve(true);
                    })
                }
                else 
                    resolve(true);

                
            })
        });

        return promise;
    }

    static async syncUploadedMO()
    {
        console.log("syncUploadedMO")
        var uploadedMos = await UploadedMOLogic.getAllUnsyncLocalUploadedMO();
        uploadedMos.forEach(function(mo){
            UploadedMORemoteLogic.saveUploadedMO(mo, async function (){
                await UploadedMOLogic.updateSyncLocalUploadedMO(mo.id);
            })
        });
        return true;
    }

    static async syncClosedMO()
    {
        console.log("syncClosedMO")
        var mos = await MOLogic.getAllLocalClosedMO();
        if(mos != null)
        {
            mos.forEach(function(mo){
                if(mo.is_closed == 1)
                {
                    MORemoteLogic.updateMOClosed(mo.mo_number);
                }
            });
        }
    }

}