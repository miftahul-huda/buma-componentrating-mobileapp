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
import UploadedMO from './model/UploadedMO';

const FILE_STORAGE_PATH = RNFS.DownloadDirectoryPath;

export default class ViewMOPage extends SharedPage {
    constructor(props){
        super(props);
        this.state = {
          ...this.state,
          mo : {}
        },
        this.backHandler = null;
    }

    handleBackButton()
    {
        Actions.reset("mainPage");
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        UploadedMO.findAll({
            where:
            {
                id : this.props.id
            }
        }).then((mos) => {

            var mo = {};
            if(mos.length > 0)
                mo = mos[0];
            console.log("ViewMOPage.componentDidMount()")
            console.log(mo);
            this.setState({
                mo: mo
            })
        })

    }

    componentWillUnmount() {
        //backHandler.remove();
        try {
            this.backHandler.remove();
        }
        catch(e)
        {

        }
    }



    back() { 
        Actions.reset("mainPage");Actions.pop();
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
                    {( this.state.mo.mo_number != null && this.state.mo.mo_number.indexOf("MO") == -1) ?
                    <>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>MO</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.mo_number}
                        </Text>
                        <View style={{height: 18}}></View>
                    </>
                        :
                        null}
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Model</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.model}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Unit Code</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.unit_code}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Component</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.component}
                        </Text>
                        <View style={{height: 18}}></View>
                        {(this.state.mo.mo_number != null && this.state.mo.mo_number.indexOf("MO") == -1) ?
                        <>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>PS Type</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.ps_type}
                        </Text>
                        <View style={{height: 18}}></View>
                        </>
                        :
                        null}
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Hour Meter</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.hour_meter}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Location</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.location}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Date</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.date}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Rating</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.rating}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>IR Rating</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.rating_ir}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>Processed by</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.processed_by}
                        </Text>
                        <View style={{height: 18}}></View>
                        <Text style={{ fontWeight: 'bold', paddingBottom: 4 }}>File</Text>
                        <Text style={{ fontWeight: 'normal' }}>
                            {this.state.mo.filename}
                        </Text>
                </View>



                <View style={{paddingTop: 15}}>
                <Button style = {{alignSelf: 'center', 
                        width: '48%', backgroundColor: '#18AA4C'}}
                            onPress= {() => { this.handleBackButton(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Ok</Text>
                        
                </Button>

                </View>

                {
                this.getMenu()
                }
                <View style={{ height: 100}}>

                </View>
            </Content>
            </Container>
        )

    }
}