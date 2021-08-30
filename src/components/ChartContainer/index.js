import React from "react";
import { View, ScrollView } from "react-native";
import { LineChart } from "../lineChart";
import {Text} from "../styledComponents";
import theme from "../../core/theme";

export default ({ chartsDataRef, connectionState, containerStyle }) => {
    return (<View style={[{ borderColor: theme.border, borderWidth: 3, borderRadius: 5, flex: 7, alignSelf: 'center', marginTop: 10, width: "95%" }, containerStyle]}>
        <ScrollView style={{ flex: 1 }}>
            {connectionState === 0 ? chartsDataRef.current.length !== 0 ? chartsDataRef.current.map((obj, index) =>
                <LineChart
                    key={index}
                    dataType={obj.sensorName}
                    data={obj.data}
                    formatLabel={(value) => String(obj.formatLabel).replace("%VALUE%", value)}
                />
            ) : <View style={{ alignText: 'center', flex: 1 }}>
                <Text style={{ fontSize: 25, fontWeight: 'bold', }}>Aguarde! Esperando dados para mostrar aqui</Text>
            </View> : <View style={{ alignText: 'center', flex: 1 }}>
                <Text style={{ fontSize: 25, fontWeight: 'bold', }}>Não conectado</Text>
            </View>}
        </ScrollView>
    </View>);
};