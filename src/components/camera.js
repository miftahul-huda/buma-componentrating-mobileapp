import React, {PureComponent} from 'react';
import {RNCamera} from 'react-native-camera';
import {TouchableOpacity, Alert, StyleSheet, ActivityIndicator, View, ImageBackground} from 'react-native';
import { Image } from 'react-native';
import { Text, Button } from 'native-base';
import { Dimensions } from 'react-native';
import ImageEditor from "@react-native-community/image-editor";
import { Actions } from 'react-native-router-flux';
import { BackHandler } from 'react-native';



export default class Camera extends PureComponent {  
    
    constructor(props) {
        super(props);
        this.state = {
            takingPic: false,
            opacity: 0.5,
            text: 'bbb',
            doneTakingPicture: false,
            file: null,
            flashMode: 1,
            croppedFilename: null
        };
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick.bind(this));
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick.bind(this));
    }

    takePicture = async () => {
        if (this.camera && !this.state.takingPic) {
    
          let options = {
            quality: 0.15,
            fixOrientation: true,
            forceUpOrientation: true,
          };
    
          this.setState({takingPic: false});
    
          try {
             const data = await this.camera.takePictureAsync(options);
             console.log(data);
             this.setState({takingPic : true, file: data})

             let uri = data.uri;
             var me = this;

             me.setState({
                croppedFilename: uri
             })

             /*this.cropImage(uri, function(url){
                 me.setState({
                    croppedFilename: url
                 })
             })*/
             //if(this.props.onDoneTakePicture != null)
             //   this.props.onDoneTakePicture(data);
             
          } catch (err) {
                console.log(err);
                Alert.alert('Error', 'Failed to take picture: ' + (err.message || err));
                return;
          } finally {
            //this.setState({takingPic: false});
          }
        }
    }

    onPress()
    {
        //this.setState({ opacity: 1 })
        this.takePicture();
    }

    cancel()
    {
        Actions.pop();
        if(this.props.onCancelTakePicture != null)
            this.props.onCancelTakePicture({uri: null}); 
    }

    handleBackButtonClick() {

        if(this.state.takingPic == false)
        {
            this.cancel();
        }
        else
        {
            this.recapture();
        }
        return true;
    }

    save() {
        
        if(this.props.onDoneTakePicture != null)
            this.props.onDoneTakePicture({uri: this.state.croppedFilename});        
    }

    recapture()
    {
        this.setState({takingPic: false});       
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

    render() {
        const { width, height } = Dimensions.get('window');

        return (

            (this.state.takingPic == false) ?
                
            <RNCamera 
            ref={ref => {
                this.camera = ref;
            }}
            captureAudio={false}
            style={{flex: 1}}
            type={RNCamera.Constants.Type.back}
            flashMode={(this.state.flashMode) ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off} 
            autoFocus={RNCamera.Constants.AutoFocus.on}
            androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
            }}>

                <View style={{ opacity: 0.8, backgroundColor: '#000000', position: 'absolute', top: '0%', left: '0%', width: '100%' }}>

                    <View style={{ flex:1, paddingTop: 15, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{width: '45%'}}></View>
                        <TouchableOpacity onPress={()=> this.setState({ flashMode: !this.state.flashMode }) }>
                            {(this.state.flashMode) ? 
                            <Image source={require('../images/flash_white.png')}></Image>
                            :
                            <Image source={require('../images/flash_off_white.png')}></Image>}
                        </TouchableOpacity>
                        <View style={{width: '35%'}}></View>

                        <TouchableOpacity  onPress={this.cancel.bind(this)} style={{ marginLeft: '0%'}}>
                            <Image source={require('../images/cancel_white_camera.png')}></Image>
                        </TouchableOpacity>

                    </View>
                    <View style={{height: '5%'}}></View>

                    <View style={{ marginLeft: '2%' }}>
                        <Text style={{color: '#fff', fontSize: 20}}>Image Capture Instruction</Text>
                        <Text style={{color: '#fff', fontSize: 14}}>1. Pastikan foto tegak lurus dari atas</Text>
                        <Text style={{color: '#fff', fontSize: 14}}>2. Pastikan objek masuk ke dalam frame</Text>
                        <Text style={{color: '#fff', fontSize: 14}}>3. Pastikan pencahayaan memadai</Text>
                        <Text style={{color: '#fff', fontSize: 14}}>4. Pastikan objek terlihat jelas</Text>
                        <Text style={{color: '#fff', fontSize: 14}}>5. Klik frame untuk mefokuskan objek</Text>
                    </View>

                    <View style={{height: 30}}></View>

                </View>

                <View style={{ position: 'absolute', left: 5/100 * width, top: 30/100 * height, borderWidth: 6, borderColor: '#ffffff', width: width * 90/100, height: width * 90/100 }}>

                </View>


                <View style={{ flex:1, backgroundColor: '#000000', position: 'absolute', top: '85%', width:'100%', height: '20%', opacity: this.state.opacity }} >

                <TouchableOpacity onPress={this.onPress.bind(this)}>

                    <View  style={{ flexDirection: 'column', width:'100%', justifyContent: 'center',alignItems: "center"  }}>
                        <Image resizeMode="contain" style={{ width: '20%' }}  source={require('../images/camarabutton.png')}></Image>
                    </View>
                </TouchableOpacity>
                </View>
            </RNCamera>
            :
            <View style={{ width:'100%', height:'100%'}} >

                <View style={{ width: '100%', height: '100%' }}>
                    <Image style={{ width: '100%', height:'100%'}} source={{uri: this.state.croppedFilename}}></Image>
                </View>


                <View style={{ position: 'absolute', top: '90%', width:'100%', flex: 1, flexDirection:'row', alignItems: "center", justifyContent: 'center'}} >
                    <Button style = {{alignSelf: 'center',
                    width: '40%', backgroundColor: '#ff0000', }}
                    onPress= {() => { this.recapture(); }}>
                    <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Recapture</Text>
                    </Button>
                    <View style={{width: '5%'}}></View>
                    <Button style = {{alignSelf: 'center',
                    width: '40%', backgroundColor: '#119911'}}
                    onPress= {() => { this.save(); }}>
                    <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Save</Text>
                    </Button>
                </View>
 
            </View>
            
        );
        
    }
}