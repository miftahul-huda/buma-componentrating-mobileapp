import React, { Component } from 'react';
import { WebView } from 'react-native-webview';
import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import UploadedFile from './model/UploadedFile';
import MO from './model/MO';
import UploadedMO from './model/UploadedMO';
import ModelComponent from './model/ModelComponent';
import FilePackageItem from './model/FilePackageItem';

import { Actions } from 'react-native-router-flux';
import * as RNFS from 'react-native-fs';

import SyncLogic from './actions/SyncLogic';

const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

const Op = Sequelize.Op;
const Model = Sequelize.Model;

const sequelize = new Sequelize({
  dialectModule: SQLite,
  database: "component-rating-v2.sqlite",
  storage: "component-rating-v2.sqlite",
  dialectOptions: {
    version: "1.0",
    description: "Component Rating"
    //size: 2 * 1024 * 1024
  }
});

export default class MSALLoginPage extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            mode: null,
            showIndicator: false,
        }
    }

    componentDidMount() {
        if(this.props.mode != null)
            this.state.mode = this.props.mode;
        else 
            this.state.mode = "login"
        
        this.setState({
            mode : this.state.mode
        })
    }

    backup()
    {
      var me  = this;
      RNFS.mkdir(FILE_STORAGE_PATH + "/retail-intelligence").then(function(){
        RNFS.copyFile("/data/data/com.bumacomponentrating/files/SQLite/component-rating.sqlite", FILE_STORAGE_PATH + "/component-rating/component-rating3.sqlite" ).then(() => {
          
          //alert("Backup  success")
          
        }).catch(err => {
            console.log(err);
        })
      })
    }

    openMenu(me)
    {

      UploadedFile.initialize(sequelize, false);
  
      let init = false;

      MO.initialize(sequelize, init);

      UploadedMO.initialize(sequelize, init);

      ModelComponent.initialize(sequelize, false);
     
      sequelize.sync({
          //force: false
      }).then(function (res){

          me.backup();
          SyncLogic.SyncModelComponent().then(function(){
            Actions.mainPage();
          });
      })
      
    }

    login(data)
    {
        var me = this;
        let url = Config.API_HOST_AUTHENTICATION + "/user/loginbyemail";
        let user = { email: data.account.username };
        var me = this;
        me.setState({ 
          showIndicator: true
        })
        HttpClient.post(url, user, function(res){
          if(res.success)
          {
            GlobalSession.currentUser = res.payload;
            GlobalSession.currentUser.firstname = data.account.name;
            GlobalSession.currentUser.lastname = "";
            GlobalSession.currentLocation = GlobalSession.currentUser.organization.orgname;

            me.setState({ 
              showIndicator: false
            })
            me.openMenu(me);
          }
          else {
            let ss = JSON.stringify(res);
            alert("Error login.res.success = false, " + ss);
          }
          
        }, function(err){
          me.setState({ 
            showIndicator: false
          })
          let ss = JSON.stringify(err);
          alert("Error login.post : " + ss);
        });       
    }


    render() {

        if(this.state.mode === "login")
        {
            return (
                <WebView
                javaScriptEnabled={true}
                onMessage={(event) => { this.login(JSON.parse(event.nativeEvent.data))}}
                source={{
                    uri: Config.MSAL_AUTHENTICATION
                }}
                style={{ marginTop: 20 }}
                />
            );
        }
        else if(this.state.mode === "logout"){
            var logout_redirect = "?post_logout_redirect_uri=" + encodeURIComponent("https://msal-authentication-dot-buma-pdm-image-recognition.et.r.appspot.com/logout");
            var url = Config.MSAL_LOGOUT + logout_redirect;
            console.log(url);
            return (
                <WebView
                javaScriptEnabled={true}
                onMessage={(event) => {console.log('Received: ', event.nativeEvent.data); Actions.logoutPage() }}
                source={{
                    uri: url
                }}
                style={{ marginTop: 20 }}
                />
            );            
        }
        else
            return null;
    }
}