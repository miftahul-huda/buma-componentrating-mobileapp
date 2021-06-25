import HttpClient from '../util/HttpClient';
import Config from '../config.json';
import ModelComponent from '../model/ModelComponent';
import MO from '../model/MO';
import MOLogic from './MOLogic';
import UploadedMOLogic from './UploadedMOLogic';
var dateFormat = require('dateformat');

import GlobalSession from '../GlobalSession';

export default class UploadedMORemoteLogic
{

        /***
     * Upload image mo
     */

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

    /***
     * Get all uploadedmo from server
     */
    static getAllUploadedMO(callback, callbackError)
    {
        var url = Config.API_HOST + "/uploadedmo";
        HttpClient.get(url, function(response){
            if(callback != null)
                callback(response.payload);
        })
    }

    /***
     * Save uploadedmo to server
     */
    static saveUploadedMO(mo, callback, callbackError)
    {

        UploadedMORemoteLogic.uploadImage(mo, function(uri){
            mo.filename = uri;
            console.log(mo.filename);
            var url = Config.API_HOST + "/uploadedmo/create";
            var json = JSON.stringify(mo);
            mo = JSON.parse(json)
            delete mo.id;
            HttpClient.post(url, mo, function(response){
                if(callback != null)
                    callback(response.payload);
            })
        })


    }

}