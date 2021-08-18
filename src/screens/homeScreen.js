import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Button,
    TextInput,
    SafeAreaView,
    ScrollView,
    NativeModules,
    NativeEventEmitter,
    TouchableOpacity,
    ToastAndroid,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { ErrorMessage } from "../components/errorMessage"
import { LineChart } from '../components/lineChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const BT_SERVICE_UUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";
const BT_CHARACTERISTIC_UUID_RX = "6E400002-B5A3-F393-E0A9-E50E24DCCA9E";
const BT_SENSOR_DATA_UUID = "6E400003-B5A3-F393-E0A9-E50E24DCCA9E";

var mounted = false;

const HomeScreen = ({ navigation: { replace } }) => {
    const [websocket, websocketState] = useState(undefined);
    const [websocketConnection, websocketConnectionState] = useState(1);
    const [errorMessage, errorMessageState] = useState(undefined);
    const [connection, connectionState] = useState(undefined);
    const [chartDataAtt, chartDataAttState] = useState({});

    const chartData = {};

    const connect = async () => {
        if (!(connection))
            return replace("ChoseConnection");
        if (connection.connectionType === undefined)
            return replace("ChoseConnection");

        switch (connection.connectionType) {
            case 0:
                const ws = new WebSocket(`ws://${connection.ip}`);

                ws.onopen = () => {
                    if (mounted)
                        websocketConnectionState(0);
                };

                ws.onmessage = (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        if (typeof data !== "object") throw "err";

                        const keys = Object.keys(data);
                        for (var i = 0; i < keys.length; i++) {
                            if (typeof data[keys[i]] === "number") {
                                if (!chartData[keys[i]]) chartData[keys[i]] = [];
                                chartData[keys[i]].push(data[keys[i]]);
                            }
                        }

                        if (mounted) {
                            chartDataAttState(chartData);
                        }
                    } catch {
                        return;
                    }
                };

                ws.onerror = (e) => {
                    if (mounted) {
                        errorMessageState("Erro ao tentar se conectar!");
                        websocketState(undefined);
                        websocketConnectionState(2);
                    }
                };

                ws.onclose = (e) => {
                    if (mounted) {
                        websocketState(undefined);
                        websocketConnectionState(2);
                    }
                };

                if (mounted) {
                    websocketState(ws);
                    websocketConnectionState(1);
                    errorMessageState(undefined);
                }
                break;

            case 1:
                try {
                    websocketConnectionState(1);
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

                    if (mounted) {
                        websocketConnectionState(0);
                        getRSSI();
                    }
                }
                catch (err) {
                    if (mounted) {
                        errorMessageState(err);
                        websocketConnectionState(2);
                    }
                }
                break;

            default:
                break;
        }
    };
    const disconnect = async () => {
        if (!(connection))
            return replace("ChoseConnection");
        if (connection.connectionType === undefined)
            return replace("ChoseConnection");

        switch (connection.connectionType) {
            case 0:
                if (websocketConnection !== 0) return;
                websocket.close();
                break;

            case 1:
                ToastAndroid.showWithGravity("Essa função está em construção!", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                if (websocketConnection !== 0) return;

                await BleManager.disconnect(connection.id);
                if (mounted) {
                    websocketState(undefined);
                    websocketConnectionState(2);
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
            if (mounted) connectionState(c);

            setTimeout(getRSSI, 1000);
        }
        catch {
            if (mounted)
                errorMessageState("Erro ao tentar conseguir RSSI!");
        }
    }
    const handleUpdateValueForCharacteristic = (peripheral) => {
        if (!peripheral) return;

        switch (peripheral.characteristic.toUpperCase()) {
            case BT_SENSOR_DATA_UUID:
                const data = String.fromCharCode.apply(null, new Uint8Array(peripheral.value));

                if (!chartData.temperature) chartData.temperature = [];
                chartData.temperature.push(Number(data));

                if (mounted)
                    chartDataAttState(chartData);
                break;

            default:
                break;
        }
    };

    useEffect(async () => {
        try {
            const connection = JSON.parse(await AsyncStorage.getItem("connection"));
            connectionState(connection);
            mounted = true;

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
        catch {
            replace("ChoseConnection");
        }

        websocketConnectionState(2);
        return (() => {
            mounted = false;
            bleManagerEmitter.removeAllListeners();
            disconnect();
        });
    }, []);

    return (<View>
        <View>
            {chartDataAtt.temperature && chartDataAtt.temperature > 1 && <LineChart
                dataType="temperatura"
                data={chartDataAtt.temperature}
                formatLabel={(value) => `${value}ºC`}
            />}
        </View>

        <View>
            {connection && connection.connectionType === 0 && <Text> IP: {connection.ip}</Text>}
            {connection && connection.connectionType === 1 && <Text> Nome: {connection.name}</Text>}
            {connection && connection.connectionType === 1 && <Text> Id: {connection.id}</Text>}
            {connection && connection.distance && <Text> Distancia: {connection.distance >= 1.0 ?
                `${(connection.distance).toFixed(2)}M` :
                `${Math.floor(connection.distance * 100)}CM`
            }</Text>}
            {connection && connection.rssi && <Text> RSSI: {connection.rssi}</Text>}
            <Text> Estado: {websocketConnection == 0 ? "conectado" : (websocketConnection == 1 ? "conectando" : "desconectado")}</Text>
        </View>

        <View>
            <Button
                title={websocketConnection !== 0 || websocketConnection === 1 ? "conectar" : "desconectar"}
                onPress={websocketConnection === 0 ? disconnect : connect}
                disabled={websocketConnection === 1}
            />
            <Button
                title="mudar tipo de conexão"
                onPress={() => replace("ChoseConnection")}
                disabled={(websocketConnection === 0 || websocketConnection === 1) && !connection}
            />
        </View>

        {errorMessage && <ErrorMessage message={`AVISO: ${errorMessage}`} />}
    </View >);
};

export default HomeScreen;