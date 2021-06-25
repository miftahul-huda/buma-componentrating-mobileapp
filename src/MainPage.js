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
import UploadedMO from './model/UploadedMO';
import MOLogic from './actions/MOLogic';
import UploadedMOLogic from './actions/UploadedMOLogic';
import SyncLogic from './actions/SyncLogic';

import { LogBox } from 'react-native';

import { Dimensions } from 'react-native';
var dateFormat = require('dateformat');

import Config from './config.json';
import HttpClient from './util/HttpClient';
import GlobalSession from './GlobalSession';

import {
    BackHandler
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';


const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14, alignSelf: 'center' },
    textWeird: { margin: 4, fontSize: 14, alignSelf: 'center', color: '#ff0000' }
  });

export default class MainPage extends SharedPage 
{
    constructor(props)
    {
        const { width, height } = Dimensions.get('window');
        super(props);
        this.state = {...this.state,
            tableMOHead: [ 'MO #', 'Unit Code', 'PS-Type', 'Location'],
            tableMOData: [],
            tableMODataOriginal: [],
            widthArr: [30/100 * width, 30/100*width, 15/100*width, 15/100*width],
            tableHistoryHead: [ 'Unit Code', 'Comp.', 'Date', 'Rate.IR', 'Rate', 'Sync'],
            tableHistoryData: [],
            widthHistoryArr: [25/100*width, 20/100*width, 15/100*width, 10/100*width, 10/100*width, 10/100*width],
            showIndicator : false,
            menuType: 1,
            searchText: ''
        },
        this.backHandler = null;
    }

    handleBackButton() {
        //BackHandler.exitApp();
        return true;
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

    captureOtherImage()
    {
        var me = this;
        var monumber = this.makeid(5);
        let mo = {};
        mo.mo_number = "MO-" + monumber;
        mo.date = dateFormat(new Date(), "yyyymmdd");
        MOLogic.createNewLocalMO(mo).then(function(newMo){
            GlobalSession.currentMONumber = newMo.mo_number;
            newMo.is_closed = 1;
            me.openMOSafetyAssessmentPage(newMo, true);
        })


        
    }

    openMOSafetyAssessmentPage(mo, isNewMo)
    {
        if (this.backHandler)
            this.backHandler.remove();

        GlobalSession.currentMONumber = mo.mo_number;
        GlobalSession.isNoMONumber = isNewMo;

        Actions.moSafetyAssessmentPage({ mo: mo, isNewMO: isNewMo });
    }

    MOButton(value, mo) {

        let ss = "(" + mo.component_processed + ")";
        if(mo.component_processed == 0 || mo.component_processed == null)
        {
            ss = ""
            return (<TouchableOpacity onPress={() => this.openMOSafetyAssessmentPage(mo, false)}>
                <Text style={styles.text}>{value} </Text>
            </TouchableOpacity>);
        }
        else {

            return (<TouchableOpacity onPress={() => this.openMOSafetyAssessmentPage(mo, false)}>
                <Text style={styles.textWeird}>{value} </Text>
            </TouchableOpacity>);

        }
    }

    openViewMO(id)
    {
        Actions.viewMOPage({ id: id });
    }

    historyLink(value, mo_number, id)
    {
        return (<TouchableOpacity onPress={()=> this.openViewMO(id) } style={{ width: '100%', alignContent: 'center', alignItems: 'center' }}>
            <Text>{value}</Text>    
        </TouchableOpacity>)
    }

    historyButton(value) {

        return (<TouchableOpacity style={{ width: '100%', alignContent: 'center', alignItems: 'center' }}>
            {(value == true) ?
            <Image style={{ padding: 10 }} source={require('./images/check-small.png')}></Image>
            :
            <Image style={{ padding: 10 }} source={require('./images/cancel-small.png')}></Image>
            }
        </TouchableOpacity>);
    }

    loadMOData(me, callback)
    {
        MOLogic.getAllLocalMO(me.state.searchText).then(function(mos){
            if(callback != null)
                callback(mos);
        }).catch(err => { console.log(err); })
    }



    loadHistoryData(me, callback)
    {
        UploadedMOLogic.getAllLocalUploadedMO(me.state.searchText).then(function(mos){
            console.log("loadHistoryData")
            mos.reverse();
            console.log(mos);
            if(callback != null)
                callback(mos);
        });
    }

    historyDataToTableData(mos)
    {
        let newMos = [];
        for(var i=0; i<mos.length; i++)
        {

            let newMo = [ this.historyLink(mos[i].unit_code, mos[i].mo_number,  mos[i].id), mos[i].component, mos[i].date, mos[i].rating_ir, mos[i].rating, this.historyButton(mos[i].is_sync) ];
            newMos.push(newMo);
        }
        return newMos;
    }

    moDataToTableData(mos)
    {
        let newMos = [];
        for(var i=0; i<mos.length; i++)
        {
            
            let newMo = [ this.MOButton( mos[i].mo_number, mos[i] ), mos[i].unit_code, mos[i].ps_type, mos[i].location ];
            newMos.push(newMo);
        }
        return newMos;
    }

    componentWillUnmount()
    {
        if (this.backHandler)
            this.backHandler.remove();
    }

    componentDidMount() {
        LogBox.ignoreLogs(['Warning: a promise', 'perform a React state update']);
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));


        this.initLoad();
    }

    initLoad()
    {
        
        var me = this;
        let tableMOHead = me.tableHeadProcess(me.state.tableMOHead)

        me.setState({
            showIndicator: true
        })
        SyncLogic.syncMO().then(function (){
            
            me.loadMOData(me, function(data) {

                me.state.tableMODataOriginal = data;
                let moData = me.moDataToTableData(data);
                
                me.setState({
                    ...me.state,
                    tableMOData: moData,
                    tableMOHead: tableMOHead,
                    showIndicator: false
                });
            });
        }).catch(function (error){
            me.setState({
                ...me.state,
                showIndicator: false,
                tableMOHead: tableMOHead,
            });            
        })

    }

    searchTextChange(text)
    {
        if(this.state.menuType == 1)
            this.loadTaskFromMenu();
        else
            this.loadHistoryDataFromMenu();
    }

    loadTaskFromMenu()
    {
        var me = this;
        this.setState({
            menuType: 1,
            showIndicator: true,
        })

        this.loadMOData(me, function(data) {
            let moData = me.moDataToTableData(data);
            me.setState({
                ...me.state,
                tableMOData: moData,
                showIndicator: false
            });
        })
    }


    menuTask()
    {
        this.state.searchText = "";
        this.setState({
            searchText: ""
        })
        this.loadTaskFromMenu();

    }

    loadHistoryDataFromMenu()
    {
        var me = this;
        this.setState({
            menuType: 2,
            showIndicator: true
        });

        me.loadHistoryData(me, function(historyData){
            if(historyData != null)
            {
                let historyMoData = me.historyDataToTableData(historyData);
                me.setState({
                    ...me.state,
                    tableHistoryData: historyMoData,
                    showIndicator: false
                });
            }

        })
    }

    menuHistory()
    {
        this.state.searchText = "";
        this.setState({
            searchText: ""
        });
        this.loadHistoryDataFromMenu();
    }

    sortByKey(me, array, key) {

        array.sort( function( a, b )
        {
          // Sort by the 2nd value in each array
          if ( a[key] == b[key] ) return 0;
          return a[key] < b[key] ? -1 : 1;
        });


        let moData = me.moDataToTableData(array);
            me.setState({
                ...me.state,
                tableMOData: moData,
                showIndicator: false
            });
        
    }    
    

    setSort(me, text, idx)
    {
        return (
            <Text style={styles.text}>{text}</Text>
        );       
    }

    tableHeadProcess()
    {
        var items = [];
        var me =this;
        me.state.tableMOHead.map(function(item, idx){
            var itemHead = me.setSort(me, item, idx);

            items.push(itemHead);
        });
        return items;
    }


    render(){
        var color1 = '#ffffff';
        var color2 = '#ffffff';
        if(this.state.menuType == 1)
            color1 = '#eeeeee';
        if(this.state.menuType == 2)
            color2 = '#eeeeee';

        const { width, height } = Dimensions.get('window');

        return(
        <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content>
            <List>
                <ListItem>
                    <View style={{ backgroundColor: '#fff', marginTop: -10, marginLeft: '-5%', height:230, width:'105%', flex:1, flexDirection: 'column', width:'100%', justifyContent: 'center',alignItems: "center" }} >
                        <Image resizeMode='stretch' style={{ width: '110%', height: '100%' }} source={require('./images/header.png')}></Image>
                    </View>
                </ListItem>

                <ListItem>
                    <Button style = {{alignSelf: 'center', borderRadius: 10,
                    width: '100%', backgroundColor: '#18AA4C'}}
                        onPress= {() => { this.captureOtherImage(); }}>
                        <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>+ Capture Other Image</Text>
                    </Button>
                </ListItem>

                <ListItem>
                    <TouchableOpacity style={{ width: '50%' }} onPress={this.menuTask.bind(this)}>
                        <View style={{ width: '100%', flex: 1, flexDirection:'row', borderRadius: 10, backgroundColor: color1, padding: 12 }}>
                            <Image source={require('./images/task.png')}></Image>
                            <Text style={{ paddingLeft: 12, marginTop: '2%' }}>My Tasks</Text>
                        </View>
                   </TouchableOpacity>
                   <TouchableOpacity style={{ width: '50%' }} onPress={this.menuHistory.bind(this)}>
                        <View style={{ width: '100%', flex: 1, flexDirection:'row', borderRadius: 10, backgroundColor: color2, padding: 12  }}>
                                <Image source={require('./images/history.png')}></Image>
                                <Text style={{ paddingLeft: 12, marginTop: '2%' }}>History</Text>
                        </View>
                   </TouchableOpacity>
                </ListItem>

                <ListItem style={{ alignItems: 'center', justifyContent: 'center' }}>
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
            <View style={{ height: 30/100 * height}}>

            </View>
            </Content>
        </Container>
        );
    }
}
