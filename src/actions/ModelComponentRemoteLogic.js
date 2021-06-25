import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import ModelComponent from '../model/ModelComponent';
import MO from '../model/MO';
import MOLogic from './MOLogic';
import UploadedMOLogic from './UploadedMOLogic';
var dateFormat = require('dateformat');


import GlobalSession from '../GlobalSession';

export default class ModelComponentRemoteLogic
{
    /***
     * Get all components from server
     */
    static getAllComponent(callback, callbackError)
    {
        var url = Config.API_HOST + "/modelcomponent";
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

    /***
     * Get total of components for current MO number
     */
    static getTotalComponent(callback, callbackError)
    {
        var url = Config.API_HOST + "/modelcomponent/total";
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

}