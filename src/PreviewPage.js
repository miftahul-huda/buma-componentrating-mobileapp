import React, { Component } from 'react';
import { Image, ActivityIndicator, PermissionsAndroid, TouchableOpacity, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  CardItem, Left, View, Item, Input, Form, Label, Right } from 'native-base';
import { Actions } from 'react-native-router-flux';

import { Dimensions } from 'react-native'

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import * as SQLite from "expo-sqlite";
import Sequelize from "rn-sequelize";

import UploadedFile from './model/UploadedFile';
import MO from './model/MO';
import FilePackageItem from './model/FilePackageItem';
import { LogBox } from 'react-native';


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

export default class PreviewPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: 'user-imagerecog-sit@buma365.onmicrosoft.com',
      password: 'RotiKeju98*',
      showIndicator: false,
      isPassword: true
    }
  }

  async componentDidMount() {
    LogBox.ignoreLogs(['Require cycle:']);
    let granted = await this.askPermission();
    setTimeout(()=>{
      Actions.reset("MSALLoginPage");
    }, 2000 )

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

          <View style={{height: 70/100 * height}}></View>

          

          </ImageBackground>
         </Content>
      </Container>
    );
  }
}
