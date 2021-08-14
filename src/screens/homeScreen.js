import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Button,
    TextInput,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import { Bar } from '../components/bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
    const [websocket, websocketState] = useState(undefined);
    const [websocketConnection, websocketConnectionState] = useState(2);
    const [url, urlState] = useState(undefined);
    const [errorMessage, errorMessageState] = useState(undefined);

    const createWs = async () => {
        if (!url) return errorMessageState("insira algum link!");
        if (/\ /.test(url)) return errorMessageState("url invalido!");

        const ws = new WebSocket(url.startsWith("ws://") ? url : `ws://${url}`);

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

        await AsyncStorage.setItem("url", url);
        websocketState(ws);
        websocketConnectionState(1);
        return errorMessageState(undefined);
    };

    useEffect(async () => {
        try {
            const lastUrl = await AsyncStorage.getItem("url");
            return urlState(lastUrl);
        }
        catch { return errorMessageState("Digite o ip antes de continuar!"); }
    }, []);
    return (<View>
        <View>
            <Text> Estado: {websocketConnection == 0 ? "conectado" : (websocketConnection == 1 ? "conectando" : "desconectado")}</Text>
        </View>
        <Bar />
        <View>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>IP</Text>
            <TextInput
                onChangeText={text => urlState(text)}
            />
            <Button
                title="Salvar"
                onPress={createWs}
            />
        </View>

        {errorMessage && <Text style={{ color: "#ff0000" }}>AVISO: {errorMessage}</Text>}
    </View>);
};

export default HomeScreen;