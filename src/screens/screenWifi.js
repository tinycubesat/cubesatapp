import React, { useState, useEffect, useRef } from 'react';
import { TextInput, } from 'react-native';
import {
    View,
    Text,
    Button,
    TouchableOpacity,
} from "../components/styledComponents";
import ErrorMessage from "../components/ErrorMessage"
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme from '../core/theme';
import ChartContainer from '../components/ChartContainer';

import { openDatabase, databaseMethods } from '../services/database';

const HomeScreen = ({ navigation: { replace } }) => {
    const [websocket, websocketState] = useState(undefined);
    const [websocketConnection, websocketConnectionState] = useState(1);
    const [errorMessage, errorMessageState] = useState(undefined);
    const [connection, connectionState] = useState(undefined);
    const [_, forceComponentUpdate] = useState(undefined);

    const commandInput = useRef(undefined);
    const chartData = useRef([]);
    const intervalUpdate = useRef(undefined);
    const database = useRef(undefined);
    const mounted = useRef(false);

    const setState = (state, data) => {
        if (mounted.current) return state(data);
        return;
    };

    const onWsOpen = () => {
        setState(websocketConnectionState, 0);
        intervalUpdate.current = setInterval(() => forceComponentUpdate(Math.random()), 10000);
    };

    const onWsMessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (typeof data !== "object") throw "";
            if (!(data && data.sensorName && data.formatLabel && data.data)) throw '';

            for (var i = 0; i < chartData.current.length; i++) {
                if (chartData.current[i].sensorName === data.sensorName) {
                    if (database.current) databaseMethods.insertData(
                        database.current,
                        "Sensors",
                        [
                            "SensorName",
                            "SensorValue",
                            "Timestamp",
                        ],
                        [
                            `'${chartData.current[i].sensorName}'`,
                            data.data,
                            Date.now(),
                        ]
                    );
                    return chartData.current[i].data.push(data.data);
                }
            }

            return chartData.current.push({ sensorName: data.sensorName, data: [data.data], formatLabel: data.formatLabel });
        } catch {
            return;
        }
    };

    const wsOnError = (event) => {
        clearInterval(intervalUpdate.current);

        setState(errorMessageState, "Erro ao tentar se conectar!");
        setState(websocketState, undefined);
        setState(websocketConnectionState, 2);
    };

    const wsOnClose = (event) => {
        clearInterval(intervalUpdate.current);

        setState(websocketState, undefined);
        setState(websocketConnectionState, 2);
    };

    const handleCommandInput = (input) => commandInput.current = input;

    const sendWsCommand = () => {
        if (!commandInput.current) return errorMessageState("digite algo para enviar!");
        if (websocketConnection !== 0) return errorMessageState("Você precisa estar conectado antes!");

        return websocket.send(commandInput.current);
    };

    const connect = async () => {
        if (!(connection))
            return replace("ChooseConnection");

        const ws = new WebSocket(`ws://${connection.ip}`);

        ws.onopen = onWsOpen;

        ws.onmessage = onWsMessage;

        ws.onerror = wsOnError;

        ws.onclose = wsOnClose;

        setState(websocketState, ws);
        setState(websocketConnectionState, 1);
        setState(errorMessageState, undefined);

    };
    const disconnect = async () => {
        if (!(connection))
            return replace("ChooseConnection");
        if (websocketConnection !== 0)
            return;

        websocket.close();
    };

    useEffect(async () => {
        try {
            database.current = await openDatabase();

            // await database.current.executeSql("DROP TABLE Sensors", []);

            await databaseMethods.createTableIfNotExists(
                database.current,
                "Sensors",
                databaseMethods.mergeColumns(
                    databaseMethods.createColumn("SensorName", "varchar(255)"),
                    databaseMethods.createColumn("SensorValue", "DOUBLE"),
                    databaseMethods.createColumn("Timestamp", "INT"),
                ),
            );

            // console.log("search: ", JSON.stringify(await databaseMethods.searchValue(database.current, "Sensors")))
        }
        catch {
            errorMessageState("Erro ao tentar abrir o banco de dados!");
        }

        try {
            mounted.current = true;

            const connection = JSON.parse(await AsyncStorage.getItem("connection"));
            connectionState(connection);

            if (connection.connectionType === 1) {
                replace("HomeBluetooth");
            }
        }
        catch {
            replace("ChooseConnection");
        }

        websocketConnectionState(2);
        return (() => {
            clearInterval(intervalUpdate.current);

            mounted.current = false;
            bleManagerEmitter.removeAllListeners();
            disconnect();
        });
    }, []);

    const Info = () => {
        return (<View style={{
            flex: 1,
            flexDirection: 'row',
            borderColor: theme.border,
            borderWidth: 2,
            borderRadius: 5,
            marginTop: 5,
            width: "95%",
            alignSelf: 'center',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 10,
            paddingLeft: 10,
            marginBottom: 5,
        }}>
            {connection && connection.connectionType === 0 && <Text> IP: {connection.ip}</Text>}
            <Text> Estado: {websocketConnection === 0 ? "conectado" : (websocketConnection === 1 ? "conectando" : "desconectado")}</Text>
        </View>);
    };

    const SendBox = () => {
        return (
            websocketConnection === 0 ? <View style={{ flex: 2, flexDirection: 'column', }}>
                <TextInput
                    placeholder="Comando"
                    value={commandInput.current}
                    onChangeText={handleCommandInput}
                />
                <Button
                    title="Enviar Comando"
                    onPress={sendWsCommand}
                />
            </View> : null
        );
    };

    const Buttons = () => {
        return (<View style={{ flex: 2 }}>
            <Button
                style={{ flex: 1, }}
                title={websocketConnection !== 0 || websocketConnection === 1 ? "conectar" : "desconectar"}
                onPress={websocketConnection === 0 ? disconnect : connect}
                disabled={websocketConnection === 1}
            />
            {chartData.current.length > 0 && <Button
                style={{ flex: 1, }}
                title="Limpar Graficos"
                onPress={() => { chartData.current = []; forceComponentUpdate(undefined); }}
            />}
            <Button
                style={{ flex: 1, }}
                title="mudar tipo de conexão"
                onPress={() => replace("ChooseConnection")}
                disabled={(websocketConnection === 0 || websocketConnection === 1) && !connection}
            />
        </View>);
    };

    return (<View style={{ flex: 1, flexDirection: 'column', backgroundColor: theme.background }}>
        <ChartContainer
            chartsDataRef={chartData}
            connectionState={websocketConnection}
        />

        <Info />

        <SendBox />

        <Buttons />

        {errorMessage && <ErrorMessage message={`AVISO: ${errorMessage}`} onClose={() => errorMessageState(undefined)} />}
    </View >);
};

export default HomeScreen;