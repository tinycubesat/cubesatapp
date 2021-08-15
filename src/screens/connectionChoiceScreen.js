import React from "react";
import { View, Button, Text } from "react-native";

const ConnectionChoiceScreen = ({ navigation: { replace } }) => {
    return (<View>
        <Text>escolha o tipo de conexão que você vai usar</Text>
        <Button
            title="Bluetooth"
            onPress={() => replace("BluetoothSearch")}
        />
        <Button
            title="Wifi"
            onPress={() => replace("WifiSearch")}
        />
    </View>);
};

export default ConnectionChoiceScreen;