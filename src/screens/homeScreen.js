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
} from 'react-native';
import { ErrorMessage } from "../components/errorMessage"
import { LineChart } from '../components/lineChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const HomeScreen = ({ navigation: { replace } }) => {
    const [websocket, websocketState] = useState(undefined);
    const [websocketConnection, websocketConnectionState] = useState(2);
    const [errorMessage, errorMessageState] = useState(undefined);
    const [connection, connectionState] = useState(undefined);
    const [chartDataAtt, chartDataAttState] = useState({});

    const chartData = {};
    var mounted = true;

    const createBluetoothConnection = () => {

    };
    const connect = () => {
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

                websocketState(ws);
                websocketConnectionState(1);
                errorMessageState(undefined);
                break;

            case 1:
                createBluetoothConnection();
                break;

            default:
                break;
        }
    };
    const disconnect = () => {
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
                createBluetoothConnection();
                break;

            default:
                break;
        }
    };

    useEffect(async () => {
        try {
            connectionState(JSON.parse(await AsyncStorage.getItem("connection")));
        }
        catch {
            replace("ChoseConnection");
        }

        return (() => {
            mounted = false;
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
            {connection && connection.connectionType == 0 && <Text> IP: {connection.ip}</Text>}
            {connection && connection.connectionType == 1 && <Text> BT name: {connection.name}</Text>}
            {connection && connection.connectionType == 1 && <Text> BT id: {connection.id}</Text>}
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