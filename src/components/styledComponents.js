import React from 'react';
import styled from 'styled-components/native';
import { Button as B } from "react-native";
import theme from '../core/theme';

export const View = styled.View`
  background-color: ${theme.background};
`;

export const Text = styled.Text`
  color: ${theme.text};
`;

export const Button = ({ onPress, title, style }) => <B color={theme.card} style={style} onPress={onPress} title={title} />;

export const TouchableOpacity = styled.TouchableOpacity`
  background-color: ${theme.card};
`;
