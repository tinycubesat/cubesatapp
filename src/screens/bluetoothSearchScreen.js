// Base: https://github.com/innoveit/react-native-ble-manager/blob/master/example/App.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
    useState,
    useEffect,
} from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    StatusBar,
    NativeModules,
    NativeEventEmitter,
    Button,
    Platform,
    PermissionsAndroid,
    FlatList,
    BackHandler,
    TouchableHighlight as Touchable,
} from 'react-native';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BluetoothSearchScreen = ({ navigation: { replace } }) => {
    const [peripherals, peripheralsState] = useState([]);
    const [searching, searchingState] = useState(false);

    const Peripheral = (peripheral, id) => {
        return (<Touchable
            key={id}
            style={{ alignItems: 'center', alignContent: 'center', }}
            onPress={() => peripheralHandle(peripheral)}>
            <View style={{
                borderWidth: 2,
                padding: 3,
                borderWidth: 0,
                borderBottomWidth: 3,
                width: '95%',
                overflow: 'hidden',
                alignItems: 'center',
                alignContent: 'center',
            }}>
                <Text>{peripheral.name}</Text>
                <Text>{peripheral.id}</Text>
            </View>
        </Touchable>);
    };
    const peripheralHandle = async (peripheral) => {
        if (peripheral && peripheral.id && peripheral.name) {
            try {
                await AsyncStorage.setItem("connection", JSON.stringify({ connectionType: 1, id: peripheral.id, name: peripheral.name }));
                replace("Home");
            }
            catch {
                BackHandler.exitApp();
            }
        }
    };
    const scanBluetooth = () => {
        if (!searching) {
            peripheralsState([]);

            if (Platform.OS === "android") {
                BleManager.enableBluetooth()
                    .then(() => {
                        BleManager.scan([], 10, true).then((results) => {
                            searchingState(true);
                        }).catch(() => BackHandler.exitApp());
                    })
                    .catch(() => {
                        BackHandler.exitApp();
                    });
            } else {
                BleManager.scan([], 10, true).then((results) => {
                    searchingState(true);
                }).catch(() => BackHandler.exitApp());
            }
        }
    };
    const handleDiscoverPeripheral = (peripheral) => {
        if (!peripheral.name) {
            peripheral.name = 'NO NAME';
        }

        if (!peripherals.includes(peripheral)) {
            peripheralsState([...peripherals, peripheral]);
        }
    };
    const handleStopScan = (peripheral) => {
        searchingState(false);
    };
    const handleDisconnectedPeripheral = (peripheral) => { };
    const handleUpdateValueForCharacteristic = (peripheral) => { };

    useEffect(() => {
        BleManager.start({ showAlert: false });

        bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
        bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);
        bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
        bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                .then((result) => {
                    if (!result) {
                        PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                            .then((result) => { if (!result) { BackHandler.exitApp(); } });
                    }
                });
        }

        return (() => {
            bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
            bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan);
            bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral);
            bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);
        })
    }, []);

    return (<View>
        <View>
            <SafeAreaView style={{ borderColor: '#000', width: 300, height: 300, borderWidth: 5, borderRadius: 15, }}>
                {searching ? <View>
                    <Text>procurando...</Text>
                </View> : peripherals.length > 0 ? < ScrollView >
                    {peripherals.map((p, index) => Peripheral(p, index))}
                </ScrollView> : <View>
                    <Text>Nenhum Dispositivo Encontrado</Text>
                </View>}
            </SafeAreaView>

            <View>
                <Button
                    title={searching ? "parar" : "iniciar"}
                    onPress={scanBluetooth}
                />
            </View>
        </View>
    </View >);
};

export default BluetoothSearchScreen;