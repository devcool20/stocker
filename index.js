import { AppRegistry } from 'react-native';
import App from './App'; // Adjust the path if App.js is in the src folder
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
