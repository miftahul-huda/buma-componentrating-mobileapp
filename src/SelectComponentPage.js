import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View, Right, Label, Input } from 'native-base';

import { Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Table, Row, Rows, TableWrapper, Cell } from 'react-native-table-component';
import { call } from 'react-native-reanimated';
import SharedPage from './SharedPage';
import HttpClient from './util/HttpClient';
import Config from './config.json';
import MOLogic from './actions/MOLogic';
import MO from './model/MO';

import { Dimensions } from 'react-native';
import {
    BackHandler
} from 'react-native';
import ModelComponentLogic from './actions/ModelComponentLogic';
import GlobalSession from './GlobalSession';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14 }
  });

export default class SelectComponentPage extends SharedPage 
{
    constructor(props)
    {
        const { width, height } = Dimensions.get('window');
        super(props);
        this.state = {
            ...this.state,
            mo: {},
            components: [],
            tableHead: [''],
            tableRows: [],
            widthArr: [95/100 * width],
            isNewMO: false,
            componentCounter: 0,
            maxComponent: 0,
            processedComponents: []
        }

        this.backHandler = null;
    }

    loadComponents(callback)
    {

        if(GlobalSession.isNoMONumber)
        {
            ModelComponentLogic.getAllComponentByModel().then(function(items){
                var components = [];
                items.forEach(function(item){
                    let color = '#DBDAFA';
                    if(item.manual == 1)
                        color = '#FB8B8B';

                    components.push({ id: item.id, name: item.component, color: color, manual: item.manual  })
                })

                if(callback != null)
                    callback(components)
            }).catch(e=> alert(e));
        }
        else
        {
            ModelComponentLogic.getAllComponentByModelAndPsType().then(function(items){
                var components = [];
                items.forEach(function(item){
                    let color = '#DBDAFA';
                    if(item.manual == 1)
                        color = '#FB8B8B';

                    components.push({ id: item.id, name: item.component, color: color, manual: item.manual   })
                })

                if(callback != null)
                    callback(components)
            });
        }

    }


    next() {
        
    }

    onBackToSelectComponent(res)
    {
        //this.state.processedComponents.push(res.mo.component);

        this.init();
    }

    createMO(compname, manual)
    {
        console.log("this.state.mo")
        console.log(this.state.mo)
 
        this.state.mo.component = compname;
        var done = (this.state.components.length - 1  == this.state.processedComponents.length) ? true : false;
        Actions.createMOPage({ done: done, component: compname, manual: manual, onBackToSelectComponent: this.onBackToSelectComponent.bind(this)});
    }

    cameraButton(name,color, manual)
    {
        var disabled = ( this.state.processedComponents.includes(name) ) ? true : false;
        color = (disabled) ? '#9AFAA4' : color;


        return <><Button disabled={disabled} style = {{alignSelf: 'center', 
        width: '50%', height: 60, justifyContent: 'center', backgroundColor: color}}
            onPress= {() => { this.createMO(name, manual); }}>
            <Text style={{ marginTop: '6%',  color: '#666666', width: '100%', textAlign: 'left' }}>{name}</Text>
            {(disabled) ? <Right><Image style={{ marginTop: 10, marginRight: 10 }} source={ require('./images/checkmark-selected.png')} ></Image></Right> : <></>}
        </Button><View style={{height: 20}}></View></>
    }

    componentToRows(me, data)
    {
        me.state.tableRows = [];
        data.map((item, idx) => {
            console.log(item.name)
            me.state.tableRows.push([ me.cameraButton(item.name, item.color, item.manual) ])
        });

        me.setState({
            ...me.state,
            tableRows : me.state.tableRows
        })
    }

    loadProcessedComponentsFromLocal(me, callback)
    {
        ModelComponentLogic.getAllProcessedComponent().then(function(processedComponents){

            if(callback != null)
                callback(processedComponents)
        });

    }

    init()
    {
        var me = this;

        MOLogic.getLocalMO().then(function(mo){
            me.loadComponents(function(components){
                console.log("Components")
                console.log(components);

                me.loadProcessedComponentsFromLocal(me, function (processedComponents){
                    me.state.maxComponent = components.length;
                    console.log("ProcessedComponents")
                    console.log(processedComponents)

                    let procComps=[];
                    processedComponents.forEach(function(procComp){
                        if(procComps.includes(procComp.component) == false)
                            procComps.push(procComp.component);
                    });

                    me.setState({
                        ...me.state,
                        components: components,
                        mo: mo,
                        processedComponents : procComps,
                        isNewMO: GlobalSession.isNoMONumber
                    });
                    me.componentToRows(me, components);         
                })
            })     
        })
    }


    handleBackButton()
    {
        //Actions.pop();
        Actions.reset("moSafetyAssessmentPage", { mo: this.state.mo, isNewMo: this.state.isNewMo, allChecked: true} );

        return true;
    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));
        this.init();
    }


    render(){
        return(
        <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content>
            <List>

                <ListItem>
                   <Image source={require('./images/component.png')}></Image>
                   <Text style={{ paddingLeft: 12 }}>Select Component</Text>
                </ListItem>

                <ListItem>
                    <Table style={{width: '100%'}} borderStyle={{borderWidth: 0, borderColor: '#c8e1ff'}}>
                        <Rows heightArr={[60,60,60,60,60,60]} data={this.state.tableRows} widthArr={this.state.widthArr} textStyle={styles.text}/>
                    </Table>

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
