import React from 'react';
import Camera from './components/camera';
import {Alert, SafeAreaView, Dimensions, Image} from 'react-native';
import { Actions } from 'react-native-router-flux';
import Exif from 'react-native-exif'
import * as RNFS from 'react-native-fs';
import Constants from "expo-constants";
import { StyleSheet, Text, View, PermissionsAndroid, Button, ActivityIndicator } from "react-native";
import UploadedFile from './model/UploadedFile';
import ImageCompressor from '@nomi9995/react-native-image-compressor';
import ImageEditor from "@react-native-community/image-editor";
import { BackHandler } from 'react-native';

import GetLocation from 'react-native-get-location';
GlobalSession = require( './GlobalSession');

const PIC_STORAGE_PATH = RNFS.DownloadDirectoryPath + '/component-rating/pics/';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center"
  },
  horizontal: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10
  }});

export default class CameraPage extends React.Component {

    constructor(props) {
      super(props);
      this.state = {
        loading : false,
        done: false
      }
    }

    // Make sure you import ImageEditor from react-native!
    cropImage(uri, callback){

      uri = uri.replace("//", "/");
      uri = "file://" + uri;
      console.log(uri);
      //const { width, height } = Dimensions.get('window');
      Image.getSize(uri, (width, height) => {
        
        let x = width * 5/100;
        let y = height * 30/100;
        console.log(width);
        console.log(height);
              // Construct a crop data object. 
        let cropData = {
          offset:{x:x * 15, y:y * 4}, 
          size:{width:1900, height:1900},
          //displaySize:{width:width, height:height}, 
          //resizeMode:'contain', 
        }

 
          ImageEditor.cropImage(uri, cropData).then(url => {
            console.log("Cropped image uri", url);
            if(callback != null)
              callback(url);
          }).catch(error => console.log(error))

      });
    }

    componentWillUnmount()
    {
    }

    componentDidMount()
    {
      this.state.done = this.props.done;
    }

    makeid(length) {
      var result           = '';
      var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for ( var i = 0; i < length; i++ ) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }

    getCurrentDate(){
      var date = new Date();
      var dateString = date.getFullYear() + "-" + (date.getMonth()  + 1) + "-" + date.getDate();
      dateString += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
      return dateString;
    }

    assembleUploadFileObject(me, msg, filename)
    {
        let uploadedFile = {};
        uploadedFile.pixel_width = msg.ImageWidth;
        uploadedFile.pixel_height  = msg.ImageHeight;

        uploadedFile.exposure_time = msg.exif.ExposureTime;
        uploadedFile.iso_speed_rating = msg.exif.ISOSpeedRatings;
        uploadedFile.white_balance = msg.exif.WhiteBalance;
        uploadedFile.orientation  = msg.exif.Orientation;
        uploadedFile.make = msg.exif.Make;
        uploadedFile.model = msg.exif.Model;
        uploadedFile.flash = msg.exif.Flash;
        uploadedFile.fnumber = msg.exif.FNumber;

        uploadedFile.filename = filename;
        uploadedFile.isuploaded = 0;
        uploadedFile.picture_taken_date = me.getCurrentDate();

        uploadedFile.picture_taken_by = GlobalSession.currentUser.firstname + " " + GlobalSession.currentUser.lastname;

        if(GlobalSession.currentStore != null)
          uploadedFile.store_name = GlobalSession.currentStore.store_name;

        return uploadedFile;
    }

    createNewFileInfo(filename){

      let uploadedFile = {};
      let promise  = new Promise((resolve, reject) => {
        Exif.getExif(PIC_STORAGE_PATH + "/temp3.jpg" )
        .then(msg => 
          {
            GetLocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 15000,
            })
            .then(location => {
                console.log(location);
                console.log("Exit");
                console.log(msg);

                uploadedFile  = this.assembleUploadFileObject(this, msg, filename);

                uploadedFile.lon = location.longitude;
                uploadedFile.lat = location.latitude;
                uploadedFile.alt = location.altitude;

                resolve(uploadedFile);
            })
            .catch(error => {
                const { code, message } = error;
                console.log( message);
                uploadedFile  = this.assembleUploadFileObject(this, msg, filename);
                resolve(uploadedFile);
            })

          }
          
        )
        .catch(msg => {
          reject(msg);
          let ss = JSON.stringify(msg);
          alert("Error createNewFileInfo " + ss);
        })
  
      });

      return promise;

  }

    async onSaveImage(res)
    {
      var me = this;

      let croppedFilename = res.uri.replace("file://", "");
      croppedFilename = croppedFilename.replace("file:", "");

      console.log('croppedFilename');
      console.log(croppedFilename);

      me.setState({ loading: true });

      let dt = new Date();
      let dtfolder = dt.getFullYear() + "" + dt.getMonth() + "" + dt.getDate();
      let filename = dt.getHours() +  "" + dt.getMinutes() + "" + dt.getSeconds() + "-" + me.makeid(4) + ".jpg";
      if(me.props.filename != null)
        filename = me.props.filename;

      let folder = PIC_STORAGE_PATH + '/' + dtfolder;
      RNFS.mkdir(folder).then(function(){
        let savedFile = folder + "/" + filename;
        RNFS.copyFile(croppedFilename, savedFile ).then(function(){

          me.createNewFileInfo(savedFile).then(function(file){
            UploadedFile.create(file).then(function(){
              //Alert.alert("File saved");
              Actions.pop();
              //Actions.pop();

              if(me.props.onAfterTakePicture != null)
                me.props.onAfterTakePicture(file);
            })
          })



        }).catch(function(err){
          console.log(err)
        })


      })
      
    }

    onCancelTakePicture()
    {
      Actions.pop();
    }

    async onDoneTakePicture(data){
      //
      var me = this;
      let json = JSON.stringify(data)
      //Actions.pictureEdit(data);
      me.setState({ loading: true  })
      let granted = await this.askPermission();
      if(granted["android.permission.WRITE_EXTERNAL_STORAGE"] == PermissionsAndroid.RESULTS.GRANTED)
      {
        RNFS.mkdir(PIC_STORAGE_PATH).then(function (){
          let filename = PIC_STORAGE_PATH + "/temp3.jpg";
          RNFS.copyFile(data.uri, filename).then(function (){

            var res = { uri: data.uri }
            console.log(res);
            
            //me.onSaveImage(res);
            
           
            me.setState({ loading: false  })
            Actions.imageCropperPage( {  filename: 'file://' + filename, onSaveImage: me.onSaveImage.bind(me) });

            //me.cropImage(filename, function(url){
            //  Actions.imageCropperPage( {  filename: url, onSaveImage: me.onSaveImage.bind(me) });
            //});
          }).catch(function (err){
            console.log("Copy file failed")
            console.log(err);
          })
        })

      }
      else 
        Alert.alert("Cannot write to folder " + PIC_STORAGE_PATH)
    }

    async askPermission()
    {
      try {
        const granted = await PermissionsAndroid.requestMultiple(
          [
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          ],
          {
            title: "Retail Intelligence Permission",
            message:
              "Retail Intelligence App needs access to your storage " +
              "so you can save pictures.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        console.log(granted)
        return granted;
      } catch (err) {
        console.warn(err);
      }

      return  null;
    }

    render() {
      var isloadingDisplay = 'none';
      var iscameradisplay = 'flex';
      if(this.state.loading)
      {
        isloadingDisplay = 'flex';
        iscameradisplay = 'none';
      }


      return (<><View  style={{ display: iscameradisplay, flex: 1 }}><Camera onDoneTakePicture={this.onDoneTakePicture.bind(this)} onCancelTakePicture={this.onCancelTakePicture.bind(this)}></Camera></View><View style={{ display: isloadingDisplay, flex:1, width: '100%', height: '100%', backgroundColor: '#000', justifyContent: 'center' }}><ActivityIndicator color="#fff" size="large" /></View></>);
    }
}