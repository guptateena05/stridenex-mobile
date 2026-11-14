/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setBackgroundMessageHandler } from './src/services/pushNotification.service';

// Register Firebase Cloud Messaging background handler
setBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
