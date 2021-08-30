import styled from "styled-components/native";
import theme from "../../core/theme";

export const MessageContainer = styled.View`
    position: absolute;
    border: 2px solid black;
    border-radius: 15px;
    margin: 0;
    flex-direction: row;
    align-items: center;
    bottom: 70px;
    z-index: 1;
    background-color: ${theme.background};
    opacity: .7;
    align-self: center;
`;

export const Text = styled.Text`
    padding: 5px;
    color: #ff0000;
`;

export const CloseButton = styled.TouchableOpacity`
    padding: 5px;
    align-self: flex-end;
`;