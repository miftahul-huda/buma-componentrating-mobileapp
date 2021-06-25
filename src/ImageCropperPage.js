import React from 'react';
import { StatusBar, StyleSheet, View, Image, Alert} from 'react-native';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
    CardItem, Left, Item, Input, Form, Label } from 'native-base';
import {CropView} from 'react-native-image-crop-tools';
import {Dimensions } from "react-native";
import { Actions } from 'react-native-router-flux';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      height: '100%'
    },
    cropView: {
      flex: 1,
      backgroundColor: '#000',
      height: '90%'
    },
});
  

export default class ImageCropperPage extends React.Component {
  state = {
    image: null,
    crop: { x: 0, y: 0 },
    zoom: 1,
    aspect: 4 / 3,
  }

  constructor(props) {
    super(props);
    this.state.image  = props.filename;
    this.cropViewRef = React.createRef();
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

  cancel()
  {
    Actions.pop();
  }


  renderImageCrop()
  {
      console.log(this.state.image);
      
      return (<View style={styles.container}>
        <CropView
        sourceUrl={this.state.image}
        style={styles.cropView}
        ref={this.cropViewRef}
        crop= {{ x: 0, y: 0 }}
        zoom={4}
        keepAspectRatio
        aspectRatio={{width: 1, height: 1}}
        onImageCrop={(res) => 
          {
            res.originalFile = this.state.image.replace("file://", "");
            console.log(res);
            Actions.pop();
            this.props.onSaveImage(res);
          }
        }
        >   
            
        </CropView>

        <View style={{ position: 'absolute', top: '90%', width: '100%', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>   
          <Button style = {{alignSelf: 'center', margin: 0, 
              width: '40%', backgroundColor: '#ff0000'}}
                  onPress= {() => {
                      this.cancel();
                      
                  }}>
                  <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Cancel</Text>
          </Button>
          <Button style = {{alignSelf: 'center', margin: 0, 
              width: '40%', backgroundColor: '#119911'}}
                  onPress= {() => {
                      this.cropViewRef.current.saveImage(true, 100);
                      
                  }}>
                  <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Save</Text>
          </Button>
        </View>

      </View>);
  }

  renderImageView()
  {
      console.log(this.state.image)
      const screenWidth = Math.round(Dimensions.get('window').width);
      const screenHeight = Math.round(Dimensions.get('window').height);
      //return ''
      return (<View style={{backgroundColor:'#000'}}>
                <Image style={{width: screenWidth, height: screenHeight}} resizeMode={'stretch'} source={{ uri:  this.state.image }}></Image>
                <Button title="Edit"></Button>
            </View>)
  }
 
  render() {
    
    if(this.state.image !== null)
    {
        return this.renderImageCrop();
    }
    else 
        return <Text></Text>
  }
}