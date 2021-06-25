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

export default class PreviewImagePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imgWidth: 0,
            imgHeight: 0,
            filename: this.props.filename,
            showIndicator: false,
            finish: null,
        }
    }

    close()
    {
        Actions.pop();
    }

    setImageDimension(view)
    {
        var me  = this;
        const windowWidth = Dimensions.get('window').width;

        Image.getSize('file://' + me.props.filename, (w, h) => {

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
                  <Title style={{ marginTop: '3%' }}>View file</Title>
                  </View>
                </Body>
              </Header>
  
              <Content style={{ flex:1, backgroundColor: '#000000' }} >
              
                <View style={{ flex:1, marginTop: '30%', backgroundColor: '#000', height:'100%', justifyContent: 'center',
                        alignItems: 'center', flexDirection: 'column' }} onLayout={(event) => {
                        var viewRes = event.nativeEvent.layout;
                        this.setImageDimension(viewRes);
                    }} >
                    <Image style={{ flex:1, width: this.state.imgWidth * 50/100, height: this.state.imgHeight * 50/100 }} resizeMode='contain' source={{ uri: 'file://' + this.state.filename}} ></Image>  
                    
                </View>
                
                

              </Content>
              <Footer style={{backgroundColor: '#E51B24'}}>
                    <TouchableOpacity onPress={this.close.bind(this)} style={{marginTop: '-1%', padding: '3%'}}>
                        <Image source={require('./images/ok_white.png')} />
                    </TouchableOpacity> 
              </Footer>
            </Container>
          );
    }

}