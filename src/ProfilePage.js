import React, { Component } from 'react';
import { Dimensions, ImageBackground } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';


import { Image, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import FilePackageItem from './model/FilePackageItem';
import DropDownPicker from 'react-native-dropdown-picker';
import SharedPage from './SharedPage';

import Config from './config.json';
import HttpClient from './util/HttpClient';

import * as RNFS from 'react-native-fs';
import GlobalSession from './GlobalSession';

import {
    BackHandler
} from 'react-native';

const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class ProfilePage extends SharedPage {
    constructor(props){
        super(props);
        this.state = {
          ...this.state,
            fullName: '',
            email: '',
            country: '',
            city: ''
        },
        backHandler = null;
    }

    handleBackButton()
    {
        Actions.reset("mainPage");
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        let user = GlobalSession.currentUser;
        console.log(user);
        this.setState({
            fullName: user.firstname + " " + user.lastname,
            email: user.email,
            location: GlobalSession.currentLocation
        })
    }

    componentWillUnmount() {
        try {
            this.backHandler.remove();
        }
        catch(e)
        {

        }
    }



    back() {
        Actions.reset("mainPage");
    }

    render() 
    {
        return(
            <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content padder>
            
                <View style={{ flex: 1, height: '100%', padding: '5%' }}>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Nama lengkap</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.fullName}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Email</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.email}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Location</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.location}
                        </Text>

                </View>



                <View style={{height: 150}}></View>

                {
                this.getMenu()
                }
                <View style={{ height: 1000}}>

                </View>
            </Content>
            </Container>
        )

    }
}