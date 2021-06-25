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
import { TouchableNativeFeedback } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';

var dateFormat = require('dateformat');

import {
    BackHandler
} from 'react-native';
import GlobalSession from './GlobalSession';
import MOLogic from './actions/MOLogic';
import ModelComponentLogic from './actions/ModelComponentLogic';
import ModelComponent from './model/ModelComponent';

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14, alignSelf: 'center' }
  });

export default class MainPage extends SharedPage 
{
    constructor(props)
    {
        const { width, height } = Dimensions.get('window');
        super(props);
        this.state = {
            ...this.state,
            mo: {},
            safetyAssessment: [

                { question: 'Apakah alat pelindung diri dipakai?', answer: 0},
                { question: 'Apakah LOTO/PADLOCK terpasang?', answer: 0},
                { question: 'Apakah unit parkir di area rata & aman?', answer: 0},
                { question: 'Apakah operator sudah turun dari kabin?', answer: 0},
                { question: 'Apakah JSA ada & sudah disosialisasikan?', answer: 0}
            ],

            tableHead: [
                'Pertanyaan', 'Ya', 'Tidak'
            ],
            tableRows: [],
            widthArr: [50/100 * width, 20/100 * width, 20/100 * width],
            isNewMO: false,
            components: []
        }
        this.backHandler = null;
    }


    loadMOData(callback)
    {
        let mo = this.props.mo;

        if(callback != null)
            callback(mo);
    }

    pushYes(question, answer)
    {
        for(var i =  0; i< this.state.safetyAssessment.length; i++)
        {
            if(this.state.safetyAssessment[i].question == question)
            {
                this.state.safetyAssessment[i].answer = answer;
                console.log(this.state.safetyAssessment[i].question);
                break;
            }
        }

        this.state.tableRows = [];
        this.loadSafetyAssessment();
    }

    yes(question,answer)
    {
        if(answer ==  0)
            return <View style={{ opacity: 0.3, justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                    <TouchableOpacity onPress={() => this.pushYes( question, !answer)}>
                        <Image source={require('./images/checkmark-not-selected.png')}></Image>
                    </TouchableOpacity>
                </View>;
        else
            return <View style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                    <Image source={require('./images/checkmark-selected.png')}></Image>
                </View>;
    }

    no(question, answer)
    {
        if(answer ==  0)
            return <View style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                    <Image source={require('./images/uncheck-selected.png')}></Image>
            </View>;
        else
            return <View style={{ opacity: 0.3, justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '100%' }}>
                    <TouchableOpacity onPress={() => this.pushYes( question, !answer)}>
                        <Image source={require('./images/uncheck-not-selected.png')}></Image>
                    </TouchableOpacity>
                </View>;
    }

    loadSafetyAssessment()
    {
        var me = this;
        
        me.state.safetyAssessment.map((item, idx) => {
            if(me.props.allChecked != null && me.props.allChecked)
                item.answer = 1;
            me.state.tableRows.push([
                item.question, me.yes(item.question, item.answer), me.no(item.question, item.answer)
            ]);

            me.setState({
                ...me.state,
                tableRows: me.state.tableRows
            })
        });
    }

    checkComponent(model)
    {
        for(var i = 0; i < this.state.components.length; i++)
        {
            var item = this.state.components[i];
            if(item.model.replace(/\s/g, '').toLowerCase().indexOf(model.replace(/\s/g, '').toLowerCase()) > -1)
                return true;
        }

        return false;
    }

    next() {
        var me = this;
        console.log(this.state.mo)
        if(this.state.mo.hour_meter == null || this.state.mo.hour_meter.trim().length == 0)
            alert("Please enter hour meter information")
        else if(isNaN(this.state.mo.hour_meter))
            alert("Hour meter should be number")
        else if(this.state.mo.model == null)
            alert("Please enter model")
        else if(this.state.mo.unit_code == null)
            alert("Please enter unit code")           
        else if(me.checkComponent(this.state.mo.model) == false)
        {
            alert("Model doesn't exist. Please make sure the component model is in the database.")
        }
        else
        {
            if(this.backHandler != null)
                this.backHandler.remove();
            var me = this;
            MOLogic.updateLocalMO(this.state.mo).then(function(){
                //console.log(me.state.mo);
                Actions.selectComponentPage({ mo: me.state.mo, isNewMO: me.state.isNewMO });
            })

        }
    }

    cancel() {

        if(this.backHandler != null)
            this.backHandler.remove();
        Actions.reset("mainPage");
    }

    handleBackButton()
    {
        this.cancel();
        return true;
    }


    componentDidMount() {

        var me = this;
        this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackButton.bind(this));

        ModelComponent.findAll().then(function(components){
            me.state.components = components;
            MOLogic.getLocalMO().then(function (mo) {
                me.state.isNewMO = GlobalSession.isNoMONumber;
                mo.date = dateFormat(new Date(), 'dd/mm/yyyy');
                me.loadSafetyAssessment();
                me.setState({ 
                    ...me.state,
                    mo : mo
                })
            }).catch(function (){
                me.state.isNewMO = GlobalSession.isNoMONumber;
                var mo = {}
                mo.date = dateFormat(new Date(), 'dd/mm/yyyy');
                me.loadSafetyAssessment();
                me.setState({ 
                    ...me.state,
                    mo : mo
                })
            });
        })


    }

    isOkNext()
    {
        var ok = true;
        this.state.safetyAssessment.forEach((item)=>{
            if(item.answer == false)
            {
                ok =false;
                return ok;
            }
        });

        return ok;
    }


    render(){

        console.log(this.state.mo);

        let editable = (this.state.isNewMO) ? true : false;

        return(
        <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content>
            <List>

                <ListItem>
                   <Image source={require('./images/unit.png')}></Image>
                   <Text style={{ paddingLeft: 12 }}>Unit Data</Text>
                </ListItem>

                <ListItem>
                    <View>
                        <View style={{ flex:1, flexDirection: 'row' }}>
                            
                            <View style={{  width: '50%', paddingRight: 4}}>
                                <Label>Model</Label>
                                <TextInput editable={editable} style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} value={this.state.mo.model}  autoCapitalize="characters" onChangeText={(text)=> this.setState({ mo: { ...this.state.mo, model: text } }) }></TextInput>
                            </View>

                            <View style={{  width: '50%'}}>
                                <Label>Unit Code</Label>
                                <TextInput editable={editable} style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} value={this.state.mo.unit_code}  autoCapitalize="characters" onChangeText={(text)=> this.setState({ mo: { ...this.state.mo, unit_code: text } }) }></TextInput>
                            </View>
                        </View>
                        <View style={{ flex:1, flexDirection: 'row' }}>
                            
                            <View style={{  width: '50%', paddingRight: 4}}>
                                <Label>Date</Label>
                                <TextInput  editable={false} style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} value={this.state.mo.date} autoCapitalize="characters" onChangeText={(text)=> this.setState({ mo: { ...this.state.mo, date: text.toUpperCase() } }) }></TextInput>
                            </View>
                            <View style={{  width: '50%'}}>
                                <Label>Hour meter</Label>
                                <TextInput keyboardType='numeric' style={{ height: 40, fontSize: 17, padding: 8, borderWidth:1, borderColor: '#ccc',  width: '100%' }} value={this.state.mo.hour_meter} onChangeText={(text)=> { this.setState({  mo: { ...this.state.mo, hour_meter: text }}); }}></TextInput>
                            </View>

                        </View>
                    </View>
                </ListItem>

                <ListItem>
                   <Image source={require('./images/safety.png')}></Image>
                   <Text style={{ paddingLeft: 12 }}>Safety Assessment</Text>
                </ListItem>

                <ListItem>
                    <Table style={{width: '90%'}} borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
                        <Row data={this.state.tableHead} widthArr={this.state.widthArr} style={styles.head} textStyle={styles.text}/>
                        <Rows heightArr={[40,40,40,40,40, 40]} data={this.state.tableRows} widthArr={this.state.widthArr} textStyle={styles.text}/>
                    </Table>

                </ListItem>

                <ListItem>
                    <View style={{ flex:1, flexDirection: 'row' }}>
                    <Button style = {{alignSelf: 'center', 
                        width: '48%', backgroundColor: '#2CABDE'}}
                            onPress= {() => { this.cancel(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Cancel</Text>
                        </Button>
                        <View style={{width: '1%'}}></View>

                        { (this.isOkNext()) ?
                        <Button style = {{alignSelf: 'center', 
                        width: '48%', backgroundColor: '#2CABDE'}}
                            onPress= {() => { this.next(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Next</Text>
                        </Button>
                        :
                        <Button disabled style = {{alignSelf: 'center', 
                        width: '48%', backgroundColor: '#ccc'}}
                            onPress= {() => { this.next(); }}>
                            <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Next</Text>
                        </Button>}

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
