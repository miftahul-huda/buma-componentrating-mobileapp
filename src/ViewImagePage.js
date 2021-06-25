import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { Container, Content, Text, Card, Header, Footer, Body, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, Button } from 'native-base';

import { Image, View, ScrollView, TouchableOpacity, Alert,ActivityIndicator, BackHandler } from 'react-native';
import { Actions } from 'react-native-router-flux';
import UploadedFile from './model/UploadedFile';
import * as RNFS from 'react-native-fs';

import Config from './config.json'
import HttpClient from './util/HttpClient'
GlobalSession = require( './GlobalSession');

export default class ViewImagePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgWidth: 0,
            imgHeight: 0,
            file: this.props.file,
            showIndicator: false,
            finish: null,
        }
    }

    componentDidMount(){

    }

    reload()
    {

    }

    onSaveCropImage(res)
    {
        this.props.onSaveCropImage(res);
    }

    crop()
    {
        var me = this;
        Actions.imageCropperPage( { file: this.props.file,  filename: 'file://' + this.props.file.filename, onSaveImage: me.onSaveCropImage.bind(this) });
    }

    finish()
    {

    }


    addInfo(value){
        if(value)
            Actions.imageInfoPage({ mode: "edit", file: this.state.file, onUpload: this.upload.bind(this)  });
        else
            Actions.imageInfoPage({ mode: "view", file: this.state.file, onUpload: null })

    }


    getCurrentDate(){
        var date = new Date();
        var dateString = date.getFullYear() + "-" + (date.getMonth()  + 1) + "-" + date.getDate();
        dateString += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
        return dateString;
    }

    uploadImageInfo(uploaded_filename, item, callback, callbackError){

        var url = Config.API_HOST + "/uploadfile/create";
        this.state.file.upload_date = this.getCurrentDate();
        this.state.file.uploaded_by_email = GlobalSession.currentUser.email;
        this.state.file.uploaded_by_fullname = GlobalSession.currentUser.firstname + " " + GlobalSession.currentUser.lastname;
        this.state.file.uploaded_filename = uploaded_filename;

        var me = this;

        HttpClient.post(url, this.state.file, function (res){

            if(res.success){
                
                console.log("upload package items")
                me.uploadPackageItems(item.packageItems,0, res.payload.id, function(){
                    if(callback != null)
                        callback(res);
                });

            }
            else
            {
                if(callbackError != null)
                    callbackError(res);

                
            }
        });
    }

    uploadPackageItems(items, idx, parentid, callback)
    {
        var me = this;
        if(idx < items.length)
            items[idx].upload_file_id = parentid;
        me.uploadPackageItem(items[idx], function(res){
            if(idx < items.length)
                me.uploadPackageItems(items, idx + 1, parentid, callback);
            else
                if(callback != null)
                    callback();
        });
    }

    uploadPackageItem(item, callback)
    {
        var url = Config.API_HOST + "/filepackageitem/create"; 
        console.log("uploading package item");
        console.log(url);
        console.log(item);

        HttpClient.post(url, item, function (res){
            if(res.success)
            {
                if(callback != null)
                    callback(res);
            }
            else
            {
                Alert.alert("Upload package item failed : " + res.message );
                if(callback != null)
                    callback(res);
            }
        });
    }

    updateUploadedFileLocally()
    {
        var me = this;
        
        me.state.file.isuploaded = 1;

        let dt = new Date();
        dt = dt.getFullYear()  + "-"  + dt.getMonth() + "-" + dt.getDate() + "-" + dt.getHours() + "-" + dt.getMinutes() + "-" + dt.getSeconds();
        dt = dt.replace(/-/gi, "");

        dt = Number(dt);
 
        UploadedFile.update({ isuploaded : 1, uploaded_id: dt }, {
            where: {
                id: me.state.file.id
            }
        }).then(function(res){

            Actions.pop();
            Actions.pop(); 
            Actions.uploadPage();
        }).catch(function(err){
            console.log("error")
            console.log(err);
            let ss = JSON.stringify(err);
            alert("Error updateUploadedFileLocally : " + ss);
        });
    }

    upload(item){

        var url = Config.API_HOST_UPLOAD + "/upload/uploaded_files";
        var me = this;
        me.state.finish = item.finish;
        me.setState({
            showIndicator: true
        })
        HttpClient.upload(url, this.state.file.filename, function(res){
            console.log("done upload image");

            if(res.success){
                console.log("upload image info")
                me.uploadImageInfo(res.payload, item, function (res){
                    console.log("update image info locally")
                    me.updateUploadedFileLocally();
                    me.setState({
                        showIndicator: false
                    })
                    Alert.alert("Upload image succeed");
                    Actions.pop();
                    Actions.pop();
                    Actions.uploadPage();

                }, function(res)
                {
                    Alert.alert("Upload image failed");
                    if(me.state.finish != null)
                        me.state.finish();
                    me.setState({
                        showIndicator: false
                    })
                });
            }
            else {
                this.setState({
                    showIndicator: true
                });
                Alert.alert("Upload image file failed. " + err.message);
            }
        });
    }

    back()
    {
        Actions.pop();
    }

    undo(){

    }

    setImageDimension(view)
    {
        var me  = this;
        const windowWidth = Dimensions.get('window').width;

        Image.getSize('file://' + me.props.file.filename, (w, h) => {

            let ratio = w/h;
            let vw = view.width * 2;


            let vh = vw / ratio;

            me.setState({ ...this.state,
                imgWidth : vw,
                imgHeight : vh
            })
        } );
    }

    render() {

        return(
            <Container>
              <Header style={{backgroundColor: '#E51B24'}}>
                <Body>
                  <View  style={{flex: 1, flexDirection: 'row'}}>
                  <TouchableOpacity onPress={()=> this.back()} style={{marginTop: '0%', padding: '4%'}} >
                      <Image style={{ width: 20, height: 20}} source={require('./images/back.png')}></Image>
                  </TouchableOpacity>
                  <Title style={{ marginTop: '3%' }}>Edit file</Title>
                  </View>
                </Body>
              </Header>
  
              <Content style={{ flex:1, backgroundColor: '#000000' }} >
              
                <View style={{ flex:1, marginTop: '30%', backgroundColor: '#000', height:'100%', justifyContent: 'center',
                        alignItems: 'center', flexDirection: 'column' }} onLayout={(event) => {
                        var viewRes = event.nativeEvent.layout;
                        this.setImageDimension(viewRes);
                    }} >

                    { (this.state.showIndicator) ? 
                    <ActivityIndicator color="#fff" size="large" /> : <></>
                    }
                    <Image style={{ flex:1, width: this.state.imgWidth * 50/100, height: this.state.imgHeight * 50/100 }} resizeMode='contain' source={{ uri: 'file://' + this.state.file.filename}} ></Image>  
                    
                </View>
                
                

              </Content>
              <Footer style={{backgroundColor: '#E51B24'}}>
                  { (this.props.editMode) ?
                  <>
                  <TouchableOpacity onPress={this.crop.bind(this)} style={{marginTop: '-1%', padding: '3%'}} >
                      <Image source={require('./images/crop_white.png')} />
                  </TouchableOpacity>
                  <View style={{width: '15%'}}  />
                  <TouchableOpacity onPress={this.addInfo.bind(this, true)} style={{marginTop: '-1%', padding: '3%'}}>
                      <Image source={require('./images/upload_white.png')} />
                  </TouchableOpacity>
                  </>
                  : <TouchableOpacity onPress={this.addInfo.bind(this, false)} style={{marginTop: '-1%', padding: '3%'}}>
                        <Image source={require('./images/info_white.png')} />
                    </TouchableOpacity> }
                      
              </Footer>
            </Container>
          );
    }
}