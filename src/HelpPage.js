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
GlobalSession = require( './GlobalSession');

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
    head: { height: 40, backgroundColor: '#f1f8ff' },
    text: { margin: 4, fontSize: 14, alignSelf: 'center' }
  });

export default class HelpPage extends SharedPage 
{
    constructor(props)
    {
        super(props);
        this.state = {
            showIndicator : false,
            menuType: 1,
            tableHead: [ 'A', 'B', 'C', 'X'],
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
        }
    }


    componentDidMount() {
        var me = this;

    }

 

    render(){


        return(
        <Container>
            <Header style={{backgroundColor: '#ffffff'}}>
                {this.getPageHeader()}
            </Header>
            <Content padder>
                <Text>FC</Text>
                <View>
                    <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                        <Row data={this.state.tableHead} style={styles.head} textStyle={styles.text} />
                    {
                        this.state.tableRows1.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={[styles.row, index%2 && {backgroundColor: '#F7F6E7'}]}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRows2.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#CCCCCC'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRows3.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#FFFFFF'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRows2.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#CCCCCC', justifyContent: 'center', alignItems: 'center'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRows5.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#FFFFFF'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRows2.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#CCCCCC', justifyContent: 'center', alignItems: 'center'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRows7.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#FFFFFF'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    </Table>
                </View>

                <View style={{height: 50}}></View>
                <Text>MP</Text>
                <View>

                    <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                        <Row data={this.state.tableHeadMp} style={styles.head} textStyle={styles.text} />
                    {
                        this.state.tableRowsMp1.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={[styles.row, index%2 && {backgroundColor: '#F7F6E7'}]}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRowsMp2.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#CCCCCC'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRowsMp3.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#FFFFFF'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRowsMp2.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#CCCCCC', justifyContent: 'center', alignItems: 'center'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRowsMp5.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#FFFFFF'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRowsMp2.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#CCCCCC', justifyContent: 'center', alignItems: 'center'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    {
                        this.state.tableRowsMp7.map((rowData, index) => (
                            <Row
                            key={index}
                            data={rowData}
                            style={{backgroundColor: '#FFFFFF'}}
                            textStyle={styles.text}
                            />
                        ))
                    }
                    </Table>
                </View>
 
                {
                    this.getMenu()
                }

                <View style={{ height: 10}}>

                </View>
            </Content>
        </Container>
        );
    }
}
