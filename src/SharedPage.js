import React, { Component } from 'react';
import { Container, Content, Text, Card, Header, Body, Button, Title, 
  List,
  ListItem,
  Left,
  Item, CardItem, Icon, View, Right } from 'native-base';

import { ActivityIndicator, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Table, Row, Rows } from 'react-native-table-component';
import { call } from 'react-native-reanimated';
import MO from './model/MO';
import MOLogic from './actions/MOLogic';
import { Dimensions } from 'react-native'
import SyncLogic from './actions/SyncLogic'

var dateFormat = require('dateformat');

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14, alignSelf: 'center' }
  });

export default class SharedPage extends Component {

    constructor(props)
    {
        super(props);
        this.state = {
            showMenu: false,
            showHelp: false,
            showIndicatorMenu: false,
            tableHelpHead: [ 'A', 'B', 'C', 'X'],
            tableRows1: [
                ['Permukaan filter jelas (Clear) terlihat', 
                'Permukaan filter jelas (Clear) terlihat', 
                'Sebagian besar permukaan Filter jelas (Clear) terlihat',
                'Mayoritas permjukaan filter di setiap bagian terdapat partikel']
            ],
            tableRows2: [
                ['dan atau']
            ],
            tableRows3: [
                ['Hampir tidak ada partikel yang terdapat pada permukaan filter', 
                'Terdapat akumulasi partikel dengan jumlah sedikit - sedang yang tersebar pada banyak bagian di permukaan fitur', 
                'Akumulasi partikel cukup banyak tersebar di permukaan filter',
                'Akumulasi partikel sangat kasar dan tebal serta menutupi mayoritas permukaan filter']
            ],
            tableRows5: [
                ['', 
                'Akumulasi partikel dalam bentuk partikel kecil dan halus', 
                'Akumulasi partikel terlihat kasar',
                'Terdapat banyak bongkahan material berukuran besar']
            ],

            tableRows7: [
                ['', 
                '', 
                'Terdapat partikel berukuran besar dengan jumlah sedikit',
                'Akumulasi partikel berwarna abu-abu metalik dan terlihat berkaca-kaca']
            ],

            tableHeadMp: [ 'A', 'B_Coarce', 'B_Ring', 'C', 'X'],
            tableRowsMp1: [
                ['Permukaan Plug Jelas (clear) terlihat', 
                'Sebagian besar permukaan Plug terlihat jelas', 
                'Sebagian besar permukaan Plug terlihat jelas',
                'Mayoritas permukaan plug tidak terlihat',
                'Permukaan Plug tidak dapat terlihat']
            ],
            tableRowsMp2: [
                ['dan atau']
            ],
            tableRowsMp3: [
                ['Terdapat sangat sedikit akumulasi partikel pada bagian pinggir dari permukaan Plug', 
                'Terdapat akumulasi partikel dengan jumlah sedikit - sedang yang tersebar pada banyak bagian di permukaan Plug', 
                'Terdapat akumulasi partikel dengan jumlah sedikit - sedang pada bagian pinggir dari permukaan Plug',
                'akumulasi partikel cukup tebal dan menutupi mayoritas permukaan plug',
                'akumulasi partikel sangat kasar dan tebal, serta menutupi mayoritas permukaan plug']
            ],
            tableRowsMp5: [
                ['', 
                'Akumulasi partikel terlihat kasar', 
                'Akumulasi partikel tidak menutupi  lebih dari 1/3 permukaan Plug',
                'akumulasi partikel terlihat kasar',
                'Terdapat banyak bongkahan material berukuran besar']
            ],

            tableRowsMp7: [
                ['', 
                'Terdapat potongan / bongkah material berukuran sangat kecil dalam jumlah yang sedikit', 
                'Terdapat potongan / bongkah material berukuran sangat kecil dalam jumlah yang sedikit',
                'Terdapat bongkahan material dengan ukuran kecil - sedang dalam jumlah yang banyak',
                'Akumulasi partikel berwarna abu-abu metalik dan terlihat berkaca-kaca']
            ],

            tableRowsMp9: [
                ['', 
                '', 
                '',
                'akumulasi partikel berwarna abu-abu metalik terang',
                '']
            ],
        };
    }

    getPageHeader()
    {
        const { width, height } = Dimensions.get('window');
        return (<Body >
            <View style={{ display: 'flex', flexDirection: 'row', paddingTop: '3%' }}>
                <View style={{width: '90%',display: 'flex', flexDirection: 'row',}}>
                    <Image style={{ padding: '1%' }} source={require('./images/small-logo.png')}></Image>
                    <View style={{ width: '10%' }}></View>
                    <Text style={{ fontWeight: 'bold', padding: '1%' }}>{GlobalSession.currentUser.firstname} {GlobalSession.currentUser.lastname}</Text>
                </View>
                <View style={{width: '10%'}}>
                    <Right>
                        <TouchableOpacity onPress={() => {  this.setState({ showMenu: !this.state.showMenu }) } }>
                            <Image source={require('./images/hamburger-menu.png')}></Image>
                        </TouchableOpacity>
                    </Right>
                </View>
            </View>
        </Body>);
    }   

    homeMenu()
    {
        Actions.reset("mainPage")
    }

    myTasksMenu()
    {
        Actions.reset("myTaskHistoryPage",{ menuType: 1 } );
    }

    historyMenu()
    {
        Actions.reset("myTaskHistoryPage",{ menuType: 2 } );
    }

    profileMenu()
    {
        Actions.reset('profilePage')
    }

    loadHistoryData(callback)
    {
        MO.findAll().then(function(items){
            if(callback != null)
                callback(items);
        }).catch(err=>{
            console.log(err);
        });
    }

    syncItem(item, callback)
    {
        MOLogic.submitMO(item, callback, null, true );
    }

    syncItems(me, items, idx, callback)
    {
        if(idx < items.length)
        {
            let item = items[idx];
            console.log(item);
            if(item.is_sync == 0)
            {
                me.syncItem(item, function(){
                    me.syncItems(me, items, idx + 1, callback)
                })
            }
            else
            {
                console.log(idx);
                me.syncItems(me, items, idx + 1, callback);
            }
        }
        else
        {

            if(callback != null)
                callback();
        }
    }

    syncMenu()
    {
        var me = this;
        me.setState({ 
            showIndicatorMenu: true,
        })
        SyncLogic.syncUploadedMO().then(function(result){
            me.setState({ 
                showIndicatorMenu: false,
            })
        })
    }

    logoutMenu()
    {
        Actions.reset("loginPage")
        Actions.MSALLoginPage({ mode: "logout" })
    }

    helpMenu()
    {
        Actions.reset("helpPage");

    }

    closeHelp()
    {
        this.setState({ 
            showHelp: false
        })
    }

    getMenu()
    {
        const { width, height } = Dimensions.get('window');
        if(this.state.showMenu)
        {
            return (
                <View style={{borderColor: '#000000', position: 'absolute', 
                top: 5, left: '40%', borderWidth: 0, zIndex: 10000, elevation: 10001,
                    backgroundColor: 'transparent', width: width * 70/100, height: 700, zIndex: 1000}}>
                    {this.getMenuItems()}
                </View>
            )
        }
        else 
            return null;
    }


    getMenuItems()
    {
        const { width, height } = Dimensions.get('window');

            return (<><ImageBackground resizeMode='cover' style={{ width: '100%', height: '100%'}}
                source={require('./images/sidemenu-background.png')} >
                <TouchableOpacity onPress={() => {
                    this.homeMenu();
                }}
                    style={{ flex:1, flexDirection: 'row', marginLeft: '10%', height: 40, width: '100%', marginTop: '60%' }}>
                        <Image source={require('./images/home_white.png')}></Image>
                        <View style={{width: 10}}></View>
                        <Text style={{ color: '#ffffff', fontSize: 20 }}>Home</Text>

                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    this.myTasksMenu();
                }}
                    style={{ flex:1, flexDirection: 'row', marginLeft: '10%' }}>
                    <Image source={require('./images/task_white.png')}></Image>
                    <View style={{width: 10}}></View>
                    <Text style={{ color: '#ffffff', fontSize: 20 }}>My Tasks</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    this.historyMenu();
                }}
                    style={{ flex:1, flexDirection: 'row', marginLeft: '10%' }}>
                    <Image source={require('./images/history_white.png')}></Image>
                    <View style={{width: 10}}></View>
                    <Text style={{ color: '#ffffff', fontSize: 20 }}>History</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    this.profileMenu();
                }}
                    style={{ flex:1, flexDirection: 'row', marginLeft: '10%' }}>
                    <Image source={require('./images/profile_white.png')}></Image>
                    <View style={{width: 10}}></View>
                    <Text style={{ color: '#ffffff', fontSize: 20 }}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    this.helpMenu();
                }}
                    style={{ flex:1, flexDirection: 'row', marginLeft: '10%' }}>
                    <Image source={require('./images/help_white.png')}></Image>
                    <View style={{width: 10}}></View>
                    <Text style={{ color: '#ffffff', fontSize: 20 }}>Help</Text>
                </TouchableOpacity>
                <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                    {(this.state.showIndicatorMenu) ?
                    <ActivityIndicator size='large' color='white'></ActivityIndicator>:
                    <Button style = {{alignSelf: 'center', marginLeft: '-10%', 
                    width: '70%', backgroundColor: '#18AA4C', borderRadius: 20}}
                        onPress= {() => { this.syncMenu(); }}>
                        <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Sync</Text>
                    </Button>}
                    <View style={{height: '10%'}}></View>
                    <Button style = {{alignSelf: 'center', marginLeft: '-10%', 
                    width: '70%', backgroundColor: '#18AA4C', borderRadius: 20}}
                        onPress= {() => { this.logoutMenu(); }}>
                        <Text style={{ color: '#ffffff', width: '100%', textAlign: 'center' }}>Logout</Text>
                    </Button>
                </View>
                <View style={{height: '20%'}}></View>
            </ImageBackground>
            </>
            )
        
        
        
    }
}

