// Taken from: https://github.com/Savinvadim1312/WhatsappClone/blob/main/components/Themed.tsx
import * as React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';

import colors from '../constants/colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(props, colorName) {
    const theme = useColorScheme();
    const colorFromProps = props[theme];

    if (colorFromProps) {
        return colorFromProps;
    } else {
        return colors[theme][colorName];
    }
}

export function Text(props) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

    return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props) {
    const { style, lightColor, darkColor, ...otherProps } = props;
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

    return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}