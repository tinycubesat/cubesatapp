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
import AsyncStorage from '@react-native-async-storage/async-storage';
import BleManager from 'react-native-ble-manager';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const HomeScreen = ({ navigation: { replace } }) => {
    const [websocket, websocketState] = useState(undefined);
    const [websocketConnection, websocketConnectionState] = useState(2);
    const [errorMessage, errorMessageState] = useState(undefined);
    const [connection, connectionState] = useState(undefined);

    const createWs = async () => {
        if (!(connection))
            return replace("ChoseConnection");
        if (connection.connectionType !== 0)
            return replace("ChoseConnection");

        const ws = new WebSocket(`ws://${connection.ip}`);

        ws.onopen = () => {
            websocketConnectionState(0);
        };

        ws.onmessage = (e) => {
            console.log(e.data);
        };

        ws.onerror = (e) => {
            errorMessageState("Erro ao tentar se conectar!");
            websocketState(undefined);
            websocketConnectionState(2);
        };

        ws.onclose = (e) => {
            websocketState(undefined);
            websocketConnectionState(2);
        };

        websocketState(ws);
        websocketConnectionState(1);
        errorMessageState(undefined);
    };
    const connect = () => {
        if (!(connection))
            return replace("ChoseConnection");
        if (!(connection.connectionType))
            return replace("ChoseConnection");

        switch (connection.connectionType) {
            case 0:
                createWs();
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
    }, []);

    return (<View>
        <View>
            {connection && connection.connectionType == 0 && <Text> IP: {connection.ip}</Text>}
            {connection && connection.connectionType == 1 && <Text> BT name: {connection.name}</Text>}
            {connection && connection.connectionType == 1 && <Text> BT id: {connection.id}</Text>}
            <Text> Estado: {websocketConnection == 0 ? "conectado" : (websocketConnection == 1 ? "conectando" : "desconectado")}</Text>
        </View>

        <View>
            <Button
                title="conectar"
                onPress={createWs}
                disabled={(websocketConnection === 0 || websocketConnection === 1) && !connection}
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