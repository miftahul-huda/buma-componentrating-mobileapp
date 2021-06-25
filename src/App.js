import React, { Component } from 'react';
import { Router, Scene } from 'react-native-router-flux';
import LoginPage from './LoginPage';
import CameraPage from './CameraPage';
import InitPage from './InitPage';
import ViewImagePage from  './ViewImagePage';
import PreviewImagePage from './PreviewImagePage';
import MainPage from './MainPage';
import MOSafetyAssessmentPage from './MOSafetyAssessmentPage';
import SelectComponentPage from './SelectComponentPage';
import CreateMOPage from './CreateMOPage';
import MyTaskHistoryPage from './MyTaskHistoryPage';
import ProfilePage from './ProfilePage';
import HelpPage from './HelpPage';
import MSALLoginPage from './MSALLoginPage';
import LogoutPage from './LogoutPage';
import PreviewPage from './PreviewPage';
import ViewMOPage from './ViewMOPage'


import { openDatabase } from 'react-native-sqlite-storage';
import ImageCropperPage from './ImageCropperPage';

export default class App extends Component {
  render() {
    return (
      <Router hideNavBar="true">
        <Scene key="root">
          <Scene key="loginPage" component={LoginPage} title="Login" initial={false} hideNavBar={true} />
          <Scene key="mainPage" component={MainPage} title="Main" initial={false} hideNavBar={true} />
          <Scene key="moSafetyAssessmentPage" component={MOSafetyAssessmentPage} title="Assessment" hideNavBar={true} />
          <Scene key="selectComponentPage" component={SelectComponentPage} title="Select Component" hideNavBar={true} />
          <Scene key="cameraPage" component={CameraPage} title="Select Component" hideNavBar={true} />
          <Scene key="imageCropperPage" component={ImageCropperPage} title="Select Component" hideNavBar={true} />
          <Scene key="createMOPage" component={CreateMOPage} title="Select Component" hideNavBar={true} />
          <Scene key="myTaskHistoryPage" component={MyTaskHistoryPage} title="Task History" hideNavBar={true} />
          <Scene key="profilePage" component={ProfilePage} title="Profile" hideNavBar={true} />
          <Scene key="helpPage" component={HelpPage} title="Profile" hideNavBar={true} />
          <Scene key="MSALLoginPage" type="reset" component={MSALLoginPage} title="Profile" initial={false} hideNavBar={true} />
          <Scene key="logoutPage" type="reset" component={LogoutPage} title="Profile" initial={false} hideNavBar={true} />
          <Scene key="previewPage" type="reset" component={PreviewPage} title="Profile" initial={true} hideNavBar={true} />
          <Scene key="viewMOPage" component={ViewMOPage} title="Main" initial={false} hideNavBar={true} />
        </Scene>
      </Router>
    )
  }
}
