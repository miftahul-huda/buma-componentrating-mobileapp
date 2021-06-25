import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import ModelComponent from '../model/ModelComponent';
import MO from '../model/MO';
import MOLogic from './MOLogic';
import UploadedMOLogic from './UploadedMOLogic';
var dateFormat = require('dateformat');

import GlobalSession from '../GlobalSession';

export default class MORemoteLogic
{



    /***
     * Get all mo from server
     */
    static getAllNotClosedMOByLocation(callback, callbackError)
    {
        var url = Config.API_HOST + "/mo/findnotclosedbylocation/" + encodeURIComponent(GlobalSession.currentLocation);
        console.log(url);
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

    /***
     * Get total of mo from server
     */
    static getTotalNotClosedMOByLocation(callback, callbackError)
    {
        var url = Config.API_HOST + "/mo/totalnotclosedbylocation/" + encodeURIComponent(GlobalSession.currentLocation);
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

    /***
     * Update remote MO status to closed
     */
    static updateMOClosed(monumber, callback)
    {
        var url = Config.API_HOST + "/mo/close/" + monumber;
        console.log(url);
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

}