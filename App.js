import React, { Component } from 'react';
import { AppRegistry } from 'react-native';
import App from './src/App.js';
import SyncLogic from './src/actions/SyncLogic';
import GlobalSession from './src/GlobalSession'

export default class RnrfExample extends Component {
  render() {
    return (
      <App />
    );
  }
}

setInterval(function() {
  console.log("Run background task: Sync MO from remoted");
  if(GlobalSession.currentUser != null)
  {
    try{
      SyncLogic.syncMO();
    }
    catch(e)
    {
      console.log("syncMO Error ")
      console.log(e)
    }

    try{
      SyncLogic.syncUploadedMO();
    }
    catch(e)
    {
      console.log("syncUploadedMO Error ")
      console.log(e)
    }
    
    try {
      SyncLogic.syncClosedMO();
    } catch (error) {
      console.log("syncClosedMO Error ")
      console.log(e)
    }
    
    
  }
  
}, 30000)

AppRegistry.registerComponent('RnrfExample', () => RnrfExample);
