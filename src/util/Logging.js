import HttpClient from 'HttpClient';
GlobalSession = require( '../GlobalSession');
import Config from '../config.json';

export default class Logging
{
    static log(oLog){
        let message = "";
        if(typeof oLog === 'string' || oLog instanceof String)
            message = oLog;
        else
            message = JSON.stringify(oLog);
            
        let user = GlobalSession.currentUser;
        let log  = { logDescription: message, username: user.email  }

        let url = Config.API_URL  + "/log/create";
        httpClient.post(url, log, function(){

        }, function(error){

        });
    }
}