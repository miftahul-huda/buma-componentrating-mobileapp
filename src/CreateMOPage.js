import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem, Left, Right,
  Item, CardItem, Icon, Button, Label } from 'native-base';

import {  Image, View, ScrollView, TouchableOpacity, Alert,ActivityIndicator, BackHandler,TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import * as RNFS from 'react-native-fs';
import MO from './model/MO';

import SharedPage from './SharedPage';
import MOLogic from './actions/MOLogic';
import UploadedMOLogic from './actions/UploadedMOLogic';

import { Dropdown } from 'react-native-material-dropdown';
import { LogBox } from 'react-native';
import AutomlVisionTflite from 'react-native-automl-vision-tflite';

import Config from './config.json'
import HttpClient from './util/HttpClient'
import GlobalSession from './GlobalSession';

var dateFormat = require('dateformat');



export default class CreateMOPage extends SharedPage {
    constructor(props)
    {
        super(props);
        this.state = {
            ...this.state,
            mo: {},
            ratings: [
                { label: '', value: null },
                { label: 'A', value: 'A' },
                { label: 'B', value: 'B' },
                { label: 'C', value: 'C' },
                { label: 'X', value: 'X' }
            ],
            showIndicator: false,
            isNewMO: false,
            componentCounter: 0,
            maxComponent: 4,
            showControls : false,
            showNotification: false,
            compname: '',
            done: false
        }
    }


    mlPredict(modelPath, labelPath, filePath, callback)
    {
        var me = this;
        //let tflite = new Tflite();
        AutomlVisionTflite.loadModel(modelPath, labelPath,
          (err, res) => {
            if(err)
            {
                console.log("Load Model Error:")
                console.log(err);
            }
              
            else
            {
                AutomlVisionTflite.runModelOnImage(res, filePath, 3, 0.1,
                  (err, res) => {
                    if(err)
                    {
                        console.log("Run model error :")
                        console.log(err);
                    }
                    else
                    {
                        console.log(res);
                        if(callback != null)
                            callback(me, res);
                    }
                  });
            }
        });
    }

    setRating(me, values)
    {
        
        console.log(values)
        let maxConfidence = 0;
        let selectedRating = '';

        values.forEach(function (item){
            if(item.confidence > maxConfidence)
            {
                maxConfidence = item.confidence;
                selectedRating = item.label;
            }
        });

        //if(selectedRating.toLowerCase().indexOf("B"))
            //selectedRating = "B";

        selectedRating = selectedRating.replace("_DRY", "");
        selectedRating = selectedRating.replace("_coarse", "");
        selectedRating = selectedRating.replace("_ring", "");

        let json = JSON.stringify(values);
        me.state.mo.rating_ir_values = json;


        if(me.state.manual == 0)
        {
            me.setState({
                mo: {
                    ...me.state.mo,
                    rating_ir: selectedRating
                }
            })
        }


    }

    onAfterTakingPicture(file)
    {
        this.state.mo.filename = file.filename;

        if(this.state.mo.component.toLowerCase().indexOf("fc") > -1)
        {
            this.mlPredict("ml-fc-model.tflite", "ml-fc-label.txt", "file://" + file.filename.replace("//", "/"), this.setRating);
        }
        else
        {
            this.mlPredict("ml-mp-model.tflite", "ml-mp-label.txt",  "file://" + file.filename.replace("//", "/"), this.setRating);
        }

        this.setState({
            showControls: true
        })
    }

    openCamera(me)
    {

        let dt = dateFormat(new Date(), 'yyyymmdd-hhMMss')
        let filename = GlobalSession.currentLocation + "-" + this.state.mo.unit_code  + "-" + this.state.mo.component + "-" + GlobalSession.currentUser.email  + "-" + dt +  ".jpg";

        Actions.cameraPage({ onAfterTakePicture: this.onAfterTakingPicture.bind(this), filename: filename });
    }

    componentWillUnmount()
    {
        //Actions.reset("selectComponentPage", { mo: this.state.mo, isNewMO: this.state.isNewMO  })
    }


    componentDidMount() {
        var me = this;
        LogBox.ignoreLogs(['Animated: `useNativeDriver`', 'componentWillUpdate', 'componentWillReceiveProps']);
        MOLogic.getLocalMO().then(function (mo){
            mo.component = me.props.component;
            me.setState({
                mo: mo,
                showControls: false,
                isNewMO:  GlobalSession.isNoMONumber,
                done: me.props.done,
                manual: me.props.manual,
            })
    
            me.openCamera(me)
        })

    }

    submit()
    {
        var me = this;
        if(this.state.mo.hour_meter == null || this.state.mo.hour_meter.trim().length == 0)
            alert("Please enter hour meter information")
        else if(isNaN(this.state.mo.hour_meter))
            alert("Hour meter should be number")   
        else if(this.state.mo.rating == null || (me.state.rating != null && me.state.rating.length == 0))
            alert("Please select rating")   
        else
        {
            me.setState({
                showNotification: false,
                showIndicator: true
            })

            var mo = JSON.stringify(me.state.mo);
            mo = JSON.parse(mo);
            mo.is_sync = 0;
            mo.processed_by = GlobalSession.currentUser.email;
            if(mo.location == null || (mo.location != null && mo.location.trim().length == 0))
               mo.location = GlobalSession.currentLocation;
            delete mo.id;

            UploadedMOLogic.createLocalUploadedMO(mo).then(function (newUploadedMo){
                console.log(newUploadedMo);

                MOLogic.shouldLocalMOClosed().then(function (value){

                    if(value)
                    {
                        MOLogic.closeLocalMO().then(function (){

                            me.setState({
                                showNotification: true,
                                showIndicator: false
                            }) 
                        })
                    }
                    else
                    {
                        MOLogic.getTotalUnprocessedComponent().then(function (value){
                            mo.component_processed = value;
                            mo.rating = "";
                            mo.rating_ir = "";
                            MOLogic.updateLocalMO(mo).then(function (){
    
                                me.setState({
                                    showNotification: true,
                                    showIndicator: false
                                }) 
                            }).catch(function (err){
    
                                me.setState({
                                    showNotification: true,
                                    showIndicator: false
                                })
                            })
                        })


                    }
                })
            
            })
        }


    }
    backToSelectComponent()
    {
        if(this.props.onBackToSelectComponent != null)
            this.props.onBackToSelectComponent({mo: this.state.mo});
        
        Actions.pop();
    }

    ok()
    {
        Actions.reset("mainPage");
    }

    render(){
        let editable = (this.state.isNewMO) ? false : false;
        let display = (this.state.isNewMO) ? 'none' : 'flex';
        var opacity = 1;
        if(this.state.showNotification)
            opacity = 0.4;

        if(this.state.showControls)
        {
        return(
        <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content>
            
            <List style={{ opacity: opacity}}>

                <ListItem>
                   <Image source={require('./images/summary.png')}></Image>
                   <Text style={{ paddingLeft: 12 }}>Summary</Text>
                </ListItem>

                <ListItem style={{ flex:1, flexDirection: 'column' }}>
                    {
                    (this.state.showIndicator)  ?
                    <ActivityIndicator size="large" color="#00cc00"></ActivityIndicator>
                    :
                    <>
                    { (GlobalSession.isNoMONumber == false)? 
                    <View style={{  flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '20%'}}>
                            <Label>MO Number</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput editable={editable} style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, mo_number: text } })} 
                            value={this.state.mo.mo_number}></TextInput>
                        </View>
                    </View>
                    :null}
                    
                    <View style={{ flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '50%'}}>
                            <Label>Model</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput editable={editable}  style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, model: text } })} 
                            value={this.state.mo.model}></TextInput>
                        </View>
                    </View>

                    <View style={{ flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '50%'}}>
                            <Label>Unit Code</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput editable={editable}  style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, unit_code: text } })} 
                            value={this.state.mo.unit_code}></TextInput>
                        </View>
                    </View>

                    <View style={{ flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '50%'}}>
                            <Label>Hour Meter</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput editable={editable} keyboard="numeric" style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, hour_meter: text } })} 
                            value={this.state.mo.hour_meter}></TextInput>
                        </View>
                    </View>

                    <View style={{ flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '50%'}}>
                            <Label>Date</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput  editable={false}  style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, date: text } })} 
                            value={this.state.mo.date}></TextInput>
                        </View>
                    </View>
                    
                    { (GlobalSession.isNoMONumber == false)? 
                    <View style={{ flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '50%'}}>
                            <Label>PS Type</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput  editable={editable} style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, ps_type: text } })} 
                            value={this.state.mo.ps_type}></TextInput>
                        </View>
                    </View>
                    :
                    null}

                    <View style={{ flex:1, flexDirection: 'row', padding: 5 }}>
                        <Left style={{  width: '50%'}}>
                            <Label>Component</Label>
                        </Left>

                        <View style={{  width: '50%'}}>
                            <TextInput  editable={editable}  style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} 
                            onChangeText={(text) => this.setState({ mo: { ...this.state.mo, component: text } })} 
                            value={this.state.mo.component}></TextInput>
                        </View>
                    </View>

                    <View style={{ width: '100%', padding: 5 }}>

                        <Label>Mechanic Rating</Label>
                        <Dropdown style={{ width: '100%', fontSize: 17}} 
                            data={this.state.ratings} 
                            onChangeText={(value)=> { this.state.mo.rating = value; }}
                            value={this.state.mo.rating}
                        />

                    </View>

                    <View style={{ width: '100%', padding: 5, display:'none'}}>

                        <Label>Rating IR</Label>
                        <Dropdown style={{ width: '100%', fontSize: 17}}
                            data={this.state.ratings} 
                            onChangeText={(value)=> { this.state.mo.rating_ir = value; }}
                            value={this.state.mo.rating_ir}
                        />

                    </View>
                    </>
                    }
                </ListItem>

                {(this.state.showNotification == false) ?
                <ListItem>
                    <View style={{ flex:1, flexDirection: 'row', justifyContent: 'center' }}>
                        <Button style = {{alignSelf: 'center', 
                        width: '90%', backgroundColor: '#2CABDE'}}
                            onPress= {() => { this.submit(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Submit</Text>
                        </Button>
                    </View>
                </ListItem> : null}
            </List>
            {(this.state.showNotification) ?
            <View style={{ position: 'absolute', top: '10%', width: '100%', height: '20%', backgroundColor: '#9AFAA4', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={require('./images/check.png')}></Image>
                <View style={{ height: 10}}></View>
                <Label style={{ fontWeight: 'bold' }}>RESULT SUBMITTED!</Label>
                <View style={{ height: 20}}></View>
                {(this.state.isNewMO == false && this.state.done == false) ?
                <><Button style = {{alignSelf: 'center', 
                        width: '90%', backgroundColor: '#00aa00', borderRadius: 30}}
                            onPress= {() => { this.backToSelectComponent(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Back to Select Component</Text>
                </Button>
                <View style={{ height: 10}}></View></>
                : 
                <Button style = {{alignSelf: 'center', 
                        width: '90%', backgroundColor: '#00aa00', borderRadius: 30}}
                            onPress= {() => { this.ok(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Ok</Text>
                </Button>}
            </View>: null}

            {
                this.getMenu()
            }
            <View style={{ height: 1000}}>

            </View>        
            </Content>
        </Container>
        );
        }
        else 
            return null;
    }
}