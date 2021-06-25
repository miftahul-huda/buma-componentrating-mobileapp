import React, { Component } from 'react';
import { Image, ActivityIndicator, PermissionsAndroid, TouchableOpacity, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  CardItem, Left, View, Item, Input, Form, Label, Right } from 'native-base';
import { Actions } from 'react-native-router-flux';
import { LogBox } from 'react-native';

import { Dimensions } from 'react-native'

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

import UploadedFile from './model/UploadedFile';
import MO from './model/MO';
import UploadedMO from './model/UploadedMO';
import FilePackageItem from './model/FilePackageItem';

import * as RNFS from 'react-native-fs';

const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

const Op = Sequelize.Op;
const Model = Sequelize.Model;

const sequelize = new Sequelize({
  dialectModule: SQLite,
  database: "component-rating.sqlite",
  storage: "component-rating.sqlite",
  dialectOptions: {
    version: "1.0",
    description: "Component Rating"
    //size: 2 * 1024 * 1024
  }
});

export default class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: 'user-imagerecog-sit@buma365.onmicrosoft.com',
      password: 'rotikeju98',
      showIndicator: false,
      isPassword: true
    }
  }

  async componentDidMount() {
    LogBox.ignoreLogs(['Require cycle:']);
    let granted = await this.askPermission();

  }

  backup()
  {
    var me  = this;
    RNFS.mkdir(FILE_STORAGE_PATH + "/retail-intelligence").then(function(){
      RNFS.copyFile("/data/data/com.bumacomponentrating/files/SQLite/component-rating.sqlite", FILE_STORAGE_PATH + "/component-rating/component-rating.sqlite" ).then(() => {
        
        //lert("Backup  success")

        
      }).catch(err => {
          console.log(err);
      })
    })
  }

  openMenu(me)
  {
    UploadedMO.initialize(sequelize, false);

    UploadedFile.initialize(sequelize, false);

    MO.initialize(sequelize, false);

   
    sequelize.sync({
        force: true
    }).then(function (res){
      me.backup();
      Actions.mainPage();
    }).catch(function(err){
      let ss = JSON.stringify(err);
      alert("Error.sequelize :  "  + ss);    
    });

    
    
  }

  login() {
    
    let url = Config.API_HOST_AUTHENTICATION + "/user/login";
    let user = { email: this.state.email, password: this.state.password};
    var me = this;

    me.setState({ 
      showIndicator: true
    })
    HttpClient.post(url, user, function(res){
      if(res.success)
      {
        GlobalSession.currentUser = res.payload;
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

  async askPermission()
  {
    try {
      const granted = await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        ],
        {
          title: "Component Rating Permission",
          message:
            "Component Rating App needs access to your storage and camera" +
            "so you can take and save pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      return granted;
    } catch (err) {
      console.log(err);
      let ss = JSON.stringify(err);
      alert("Error askPermission : " + ss);
    }

    return  null;
  }

  showHidePassword()
  {
    this.setState({
      isPassword: !this.state.isPassword
    })
  }

  render(){
    const { width, height } = Dimensions.get('window');

    return(
      <Container>
        <Content>
          <ImageBackground style={{width: '100%', height: null}} source={require('./images/login-background.jpg')}>

          <View  style={{ flex:1, flexDirection: 'column', width:'100%', justifyContent: 'center',alignItems: "center"  }}>
            <Image  source={require('./images/buma-logo.png')} resizeMode="contain"
            style={{ width: '50%', marginTop: '30%' }}></Image>
            <Text style={{ marginTop: '0%', color: '#07A84C', fontWeight: 'bold' }}>Image Recognition</Text>
          </View>

          { (this.state.showIndicator) ? 
          <ActivityIndicator size="large" color="#000"></ActivityIndicator> : <></>
          }
          <Form style={{ marginTop: '10%', width: '100%', alignItems: "center", justifyContent: 'center'}}>
            <View style={{ flex:1, flexDirection:'column', width:'80%' }}>
              <Label style={{color: '#333333', fontWeight: 'bold', paddingBottom: 10}}>Username</Label>
              <Input style={{ backgroundColor: '#ffffff',color:'#666666', width: '100%', borderWidth: 0, borderRadius: 10, borderColor: '#cccccc', padding: 1}} value={this.state.email} onChangeText={value => { console.log(value); this.setState({ email: value } ) }}/>
            </View>
            <View style={{height: 10}}></View>
            <View style={{ flex:1, flexDirection:'column', width:'80%' }}>
              <Label style={{color: '#333333', fontWeight: 'bold', paddingBottom: 10}}>Password</Label>
              <View style={{ flex:1, flexDirection: 'row' }}>
                <Input style={{ backgroundColor: '#ffffff', color:'#666666',width: '100%', borderWidth: 0, borderRadius: 10, borderColor: '#cccccc', padding: 1}} 
                secureTextEntry={this.state.isPassword}  value={this.state.password} onChangeText={(value)=> this.setState({ password: value } )}/>
                <TouchableOpacity onPress={this.showHidePassword.bind(this)} style={{position:'absolute', left: '90%', top: '29%'}}>
                  {(this.state.isPassword)?
                  <Image source={require('./images/eyes.png')} ></Image>
                  :
                  <Image source={require('./images/eyes-closed.png')} ></Image>}
                </TouchableOpacity>
              </View>
            
            </View>

          </Form>
          

          <Button style = {{alignSelf: 'center', margin: 30, 
          width: '50%', backgroundColor: '#0EA74A'}}
            onPress= {() => { this.login(); }}>
            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Login</Text>
          </Button>

          <View style={{height: (40/100 * height)}}>

          </View>

          </ImageBackground>
         </Content>
      </Container>
    );
  }
}
