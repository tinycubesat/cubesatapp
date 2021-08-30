import React, { useState, useEffect, useRef } from 'react';
import {
    NativeModules,
    NativeEventEmitter,
    ToastAndroid,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import {
    View,
    Text,
    Button,
    TouchableOpacity,
} from "../components/styledComponents";
import ErrorMessage from "../components/ErrorMessage"
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';
import ChartContainer from '../components/ChartContainer';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BT_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const BT_CHARACTERISTIC_UUID_RX = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const BT_SENSOR_DATA_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

const HomeScreen = ({ navigation: { replace } }) => {
    const [bluetoothConnection, bluetoothConnectionState] = useState(undefined);
    const [connectionType, connectionTypeState] = useState(1);
    const [errorMessage, errorMessageState] = useState(undefined);

    const chartData = useRef([]);
    const mounted = useRef(false);

    const connect = async () => {
        if (!(connection))
            return replace("ChoseConnection");
        if (connection.connectionType === undefined)
            return replace("ChoseConnection");

        connectionTypeState(1);
        if (Platform.OS === "android") {
            try { await BleManager.enableBluetooth(); }
            catch { BackHandler.exitApp(); }
        }

        await BleManager.connect(connection.id);
        if (!await BleManager.retrieveServices(connection.id))
            return;

        try {
            await BleManager.startNotification(
                connection.id,
                BT_SERVICE_UUID,
                BT_SENSOR_DATA_UUID,
            );
        } catch (err) {
            errorMessageState(err);
        }

        if (mounted.current) {
            connectionTypeState(0);
            getRSSI();
        }
    };

    const disconnect = async () => {
        if (!(connection))
            return replace("ChoseConnection");
        if (connection.connectionType === undefined)
            return replace("ChoseConnection");

        switch (connection.connectionType) {
            case 0:
                if (connectionType !== 0) return;
                bluetoothConnection.close();
                break;

            case 1:
                ToastAndroid.showWithGravity("Essa função está em construção!", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                if (connectionType !== 0) return;

                await BleManager.disconnect(connection.id);
                if (mounted.current) {
                    bluetoothConnectionState(undefined);
                    connectionTypeState(2);
                }
                break;

            default:
                break;
        }
    };

    const getRSSI = async () => {
        try {
            const rssi = await BleManager.readRSSI(connection.id);
            const c = connection;
            c.rssi = rssi;
            c.distance = 10 ** ((-69 - (rssi)) / (10 * 2));
            if (mounted.current) connectionState(c);

            setTimeout(getRSSI, 1000);
        }
        catch {
            if (mounted.current)
                errorMessageState("Erro ao tentar conseguir RSSI!");
        }
    };

    const handleUpdateValueForCharacteristic = (peripheral) => {
        if (!peripheral) return;

        switch (peripheral.characteristic.toUpperCase()) {
            case BT_SENSOR_DATA_UUID:
                const data = String.fromCharCode.apply(null, new Uint8Array(peripheral.value));

                if (!chartData.temperature) chartData.temperature = [];
                chartData.temperature.push(Number(data));

                if (mounted.current)
                    chartDataAttState(chartData);
                break;

            default:
                break;
        }
    };

    useEffect(async () => {
        try {
            mounted.current = true;

            const connection = JSON.parse(await AsyncStorage.getItem("connection"));
            connectionState(connection);

            if (connection.connectionType === 1) {
                await BleManager.start({ showAlert: false });
                bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic);

                if (Platform.OS === 'android' && Platform.Version >= 23) {
                    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                        if (!result) PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                            if (!result) BackHandler.exitApp();
                        });
                    });
                }
            }
        }
        catch { return replace("ChoseConnection"); }

        connectionTypeState(2);
        return (() => {
            mounted.current = false;
            bleManagerEmitter.removeAllListeners();
            disconnect();
        });
    }, []);

    return (<View style={{ flex: 1, }}>
        <ChartContainer
            chartsDataRef={chartData}
            connectionState={connectionType}
        />

        <View>
            {connection && connection.connectionType === 1 && <Text> Nome: {connection.name}</Text>}
            {connection && connection.connectionType === 1 && <Text> Id: {connection.id}</Text>}
            {connection && connection.distance && <Text> Distancia: {connection.distance >= 1.0 ?
                `${(connection.distance).toFixed(2)}M` :
                `${Math.floor(connection.distance * 100)}CM`
            }</Text>}
            {connection && connection.rssi && <Text> RSSI: {connection.rssi}</Text>}
            <Text> Estado: {connectionType == 0 ? "conectado" : (connectionType == 1 ? "conectando" : "desconectado")}</Text>
        </View>

        <View>
            <Button
                title={connectionType !== 0 || connectionType === 1 ? "conectar" : "desconectar"}
                onPress={connectionType === 0 ? disconnect : connect}
                disabled={connectionType === 1}
            />
            <Button
                title="mudar tipo de conexão"
                onPress={() => replace("ChoseConnection")}
                disabled={(connectionType === 0 || connectionType === 1) && !connection}
            />
        </View>

        {errorMessage && <ErrorMessage message={`AVISO: ${errorMessage}`} />}
    </View >);
};

export default HomeScreen;