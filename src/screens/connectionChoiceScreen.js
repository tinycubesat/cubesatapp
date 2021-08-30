import React from "react";
// import {  } from "react-native";
import {
    View,
    Text,
    Button,
    TouchableOpacity,
} from "../components/styledComponents";

const ConnectionChoiceScreen = ({ navigation: { replace } }) => {
    return (<View style={{ flex: 1, }}>
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