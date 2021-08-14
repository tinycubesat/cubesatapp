import React, { useState } from "react";
import {
    View,
    TextInput,
    Button,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Text,
    NetInfo,
    Platform,
    Alert,
    ToastAndroid,
} from "react-native";



const defaultPort = 81;
const numericRegex = /[^0-9]/g;

const WifiSearchScreen = () => {
    const [devices, deviceState] = useState([]);
    const [port, portState] = useState(defaultPort);

    var id = 0;

    const changePort = (newPort) => {
        if (newPort == "") return portState(undefined);

        const port = newPort.replace(numericRegex, "");

        if (port > 65535 || port < 1)
            return portState(defaultPort);
        return portState(parseInt(newPort.replace(regex, "")));
    };
    const search = () => {
        if (!port) return;


    };
    const device = (ip) => {
        return (<TouchableOpacity key={id++}>
            <Text>{ip}</Text>
        </TouchableOpacity>);
    };
    return (<View>
        <SafeAreaView style={{ width: 300, height: "100%",}}>
            {devices.length > 0 ? <ScrollView style={{ width: 300, height: 300 }}>
                {devices.map((i) => device(i))}
            </ScrollView> : <View style={{
                width: 300,
                height: 300,
                backgroundColor: "#666666",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
            }}>
                <Text  >Nenhum Dispositivo Detectado!</Text>
            </View>}
        </SafeAreaView>

        <View>
            <Text>Porta: </Text>
            <TextInput placeholder="Porta" keyboardType='numeric' onChangeText={changePort} value={port ? String(port) : undefined} />
            <Button
                title="Procurar"
                onPress={() => ToastAndroid.showWithGravityAndOffset("Em manutenção!", ToastAndroid.SHORT, ToastAndroid.BOTTOM, 0, 80)}
                disabled={false}
            />
        </View>
    </View>);
};

export default WifiSearchScreen;