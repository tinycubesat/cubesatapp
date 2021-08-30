import React from "react";
import { MessageContainer, Text, CloseButton } from "./styles";
import Icon from "react-native-vector-icons/AntDesign";
import { Platform } from "react-native";

export default ({ message, onClose, style, textStyle, closeButtonSize }) => {
    return (<MessageContainer style={[{ elevation: (Platform.OS === 'android') ? 50 : 0 }, style]}>
        <Text style={textStyle}>{message}</Text>

        {!!onClose && <CloseButton onPress={onClose}>
            <Icon name="closecircleo" size={closeButtonSize ? closeButtonSize : 20} />
        </CloseButton>}
    </MessageContainer>);
};