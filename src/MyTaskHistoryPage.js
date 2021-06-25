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
import MainPage from './MainPage';
import MO from './model/MO';
import { TextInput } from 'react-native-gesture-handler';
var dateFormat = require('dateformat');

import Config from './config.json';
import HttpClient from './util/HttpClient';
GlobalSession = require( './GlobalSession');

import {
    BackHandler
} from 'react-native';


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14, alignSelf: 'center' }
  });

export default class MyTaskHistory extends MainPage 
{
    constructor(props)
    {
        super(props);
        this.state = {
            ...this.state
        }
    }

    handleBackButton()
    {
        Actions.reset("mainPage");
    }


    componentDidMount() {
        var me = this;
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        me.setState({
            showIndicator: true
        })

        this.state.menuType = this.props.menuType;

        if(this.state.menuType == 1)
        {
            this.loadMOData(this, function(data) {
                let moData = me.moDataToTableData(data);
                me.setState({
                    ...me.state,
                    tableMOData: moData,
                    showIndicator: false
                });
            })
        }
        else
        {
            me.loadHistoryData(this, function(historyData){
                let historyMoData = me.historyDataToTableData(historyData);
                me.setState({
                    ...me.state,
                    tableHistoryData: historyMoData,
                    showIndicator: false
                });
            })
        }
    }


    render(){
        var color1 = '#ffffff';
        var color2 = '#ffffff';
        if(this.state.menuType == 1)
            color1 = '#eeeeee';
        if(this.state.menuType == 2)
            color2 = '#eeeeee';

        return(
        <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content>
            <List>
                <ListItem>
                    <View style={{width: '100%'}}>
                        <View style={{ flex: 1,  width: '100%', }}>
                            <Text>Search</Text>
                            <TextInput value={this.state.searchText} onChangeText={(text)=> { this.state.searchText = text; this.searchTextChange(text); }} style={{ padding: 12,borderWidth: 1, borderColor: '#cccccc', borderRadius: 20}}></TextInput>
                            <View style={{height: 10}}>
                            </View>
                        </View>

                    { (this.state.showIndicator) ?
                        <ActivityIndicator color="#00ff00" size='large'></ActivityIndicator>
                        :

                        (this.state.menuType == 1)?
                        <Table style={{width: '100%'}} borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Row data={this.state.tableMOHead} widthArr={this.state.widthArr} style={styles.head} textStyle={styles.text}/>
                            <Rows style={{ height: 40}} data={this.state.tableMOData} widthArr={this.state.widthArr} textStyle={styles.text}/>
                        </Table>
                        :
                        <Table style={{width: '100%'}} borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                            <Row data={this.state.tableHistoryHead} widthArr={this.state.widthHistoryArr} style={styles.head} textStyle={styles.text}/>
                            <Rows style={{ height: 40}} data={this.state.tableHistoryData} widthArr={this.state.widthHistoryArr} textStyle={styles.text}/>
                        </Table>
                    }

                    </View>

                </ListItem>
            </List>
            {
                this.getMenu()
            }
            <View style={{ height: 1000}}>

            </View>            
            </Content>
        </Container>
        );
    }
}
