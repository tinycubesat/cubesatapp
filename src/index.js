import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/homeScreen';
import ConfigScreen from './screens/configScreen';
import WifiSearchScreen from './screens/wifiSearchScreen';
import BluetoothSearchScreen from './screens/bluetoothSearchScreen';
import ConnectionChoiceScreen from './screens/connectionChoiceScreen';

const Stack = createNativeStackNavigator();

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Config"
                    component={ConfigScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="WifiSearch"
                    component={WifiSearchScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="BluetoothSearch"
                    component={BluetoothSearchScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ChoseConnection"
                    component={ConnectionChoiceScreen}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;