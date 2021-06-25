import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View, Right } from 'native-base';

import { Image, StyleSheet, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Table, Row, Rows } from 'react-native-table-component';
import { call } from 'react-native-reanimated';
import SharedPage from './SharedPage';
import MO from './model/MO';
var dateFormat = require('dateformat');

import Config from './config.json';
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14, alignSelf: 'center' }
  });

export default class LogoutPage extends Component 
{
    constructor(props)
    {
        super(props);
        this.state = {
            message: 'You have logged out of the application. Thank you!'
        }
    }

    login()
    {
        Actions.MSALLoginPage();
    }


    render(){

        return(
        <Container>
            <Content padder>

                <View style={{flex: 1, height: '100%', alignItems: 'center', marginTop: '60%'}}>
                    <Image source={require('./images/checkmark-selected.png')}></Image>
                    <View style={{height: 20}}></View>
                    <Text style={{fontWeight: 'bold'}}>{this.state.message}</Text>
                    <Button style = {{alignSelf: 'center', margin: 30, 
                        width: '50%', backgroundColor: '#0EA74A'}}
                            onPress= {() => { this.login(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Login Again</Text>
                        </Button>

                </View>
           
            </Content>
        </Container>
        );
    }
}
