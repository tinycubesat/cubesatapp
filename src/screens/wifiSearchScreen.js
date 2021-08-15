import React, { useState, useEffect, } from "react";
import {
    View,
    Text,
    TextInput,
    Button,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    NetInfo,
    Platform,
    Alert,
    ToastAndroid,
    StyleSheet,
    DeviceEventEmitter,
} from "react-native";
import FindLocalDevices from 'react-native-find-local-devices';
import AsyncStorage from '@react-native-async-storage/async-storage';


const defaultPort = 81;
const numericRegex = /[^0-9]/g;

const WifiSearchScreen = () => {
    const [devices, devicesState] = useState([]);
    const [device, deviceState] = useState(undefined);
    const [searchButton, searchButtonState] = useState(false);
    const [searching, searchingState] = useState(false);
    const [port, portState] = useState(defaultPort);

    var id = 0;

    const changePort = (newPort) => {
        if (newPort == "") return portState(undefined);

        const port = newPort.replace(numericRegex, "");

        if (port > 65535 || port < 1)
            return portState(defaultPort);
        return portState(parseInt(port));
    };
    const search = () => {
        if (!port) return;

        devicesState([]);
        searchingState(true);
        searchButtonState(true);

        DeviceEventEmitter.addListener('NEW_DEVICE_FOUND', (device) => {
            devicesState([...devices, `${device.ipAddress}:${device.port}`])
        });

        DeviceEventEmitter.addListener('CHECK', (device) => {
            deviceState(`${device.ipAddress}:${device.port}`);
        });

        DeviceEventEmitter.addListener('RESULTS', () => {
            ToastAndroid.showWithGravityAndOffset("Busca Completa!", ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, 80);
            searchingState(false);
            deviceState(undefined);
            searchButtonState(false);
        });

        // DeviceEventEmitter.addListener('NO_DEVICES', () => {});

        // DeviceEventEmitter.addListener('NO_PORTS', () => {  });

        // DeviceEventEmitter.addListener('CONNECTION_ERROR', (error) => { console.log(error.message); });

        // FindLocalDevices.cancelDiscovering();

        setTimeout(() => FindLocalDevices.getLocalDevices({
            ports: [port],
            timeout: 40
        }), 100);
    };
    const deviceList = (ip) => {
        return (<TouchableOpacity key={id++} style={{ margin: 0, marginLeft: 5, }} onPress={() => deviceOnPress(ip)}>
            <Text style={{ fontSize: 25, }}>{ip}</Text>
        </TouchableOpacity>);
    };
    const deviceOnPress = async (ip) => {
        if (!ip)
            return ToastAndroid.showWithGravityAndOffset("ERRO", ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, 80);

        await AsyncStorage.setItem("connection", { connectionType: 0, ip });
    };

    return (<View style={styles.container}>
        <SafeAreaView style={{ ...styles.devicesContainer, }}>
            {searching ? <View style={styles.noDevices}>
                <Text>Procurando dispositivos...</Text>
                <Text>{device}</Text>
            </View> : devices.length > 0 ? <ScrollView style={{ width: 300, height: 300 }}>
                {devices.map((i) => deviceList(i))}
            </ScrollView> : <View style={styles.noDevices}>
                <Text>Nenhum Dispositivo Detectado!</Text>
            </View>}
        </SafeAreaView>

        <View>
            <Text>Porta: </Text>
            <TextInput
                placeholder="Porta"
                keyboardType='numeric'
                onChangeText={changePort}
                value={port ? String(port) : undefined}
            />
            <Button
                title={searchButton ? "Procurando" : "Procurar"}
                onPress={search}
                disabled={searchButton}
            />
        </View>
    </View>);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "column"
    },
    devicesContainer: {
        width: 300,
        height: 300,
        borderColor: "#000000",
        borderWidth: 5,
        borderRadius: 15,
        overflow: "hidden",
        margin: 5,
    },
    noDevices: {
        width: 300,
        height: 300,
        justifyContent: "center",
        alignItems: "center",
        alignContent: "center",
    },
});

export default WifiSearchScreen;