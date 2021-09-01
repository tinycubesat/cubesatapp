import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, View } from '../components/styledComponents';
import Logo from '../components/logo';
import theme from '../core/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const defaultRoute = "ChooseConnection";

export default ({ navigation: { replace } }) => {
    const [loading, setLoading] = useState(true);
    const [route, setRoute] = useState(defaultRoute);

    const interval = useRef(undefined);

    useEffect(async () => {
        try {
            const connection = JSON.parse(await AsyncStorage.getItem("connection"));

            interval.current = setInterval(() => {
                setRoute(connection.connectionType === 0 ? "Wifi" : "Bluetooth");
                setLoading(false);
            }, 2500);
        }
        catch {
            setRoute(defaultRoute);
            setLoading(false);
        };

        return () => {
            clearInterval(interval.current);
        };
    }, []);

    return (<View style={styles.container}>
        <Logo />
        {!loading && <Text style={{ fontSize: 25, fontWeight: 'bold', alignSelf: 'center', }}>Seja bem vindo!</Text>}

        {loading ? <View style={styles.center}>
            <Text style={styles.text}>Carregando...</Text>
            <ActivityIndicator size="large" color={theme.primary} />
        </View> : <View style={styles.center}>
            <TouchableOpacity style={styles.button} onPress={() => replace(route)} >
                <Text style={styles.text}> entrar </Text>
            </TouchableOpacity>
        </View>}
    </View>);
};

const styles = StyleSheet.create({
    container: { flex: 1, flexDirection: 'column' },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignSelf: 'center',
        width: "100%",
    },
    button: {
        width: "40%",
        height: "20%",
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: theme.card,
        borderRadius: 15,
    },
    text: {
        fontSize: 20,
        alignSelf: 'center',
    }
});