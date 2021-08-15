import React from "react";
import { Container, Text } from "./styles";

export const ErrorMessage = ({ message, style, textStyle }) => {
    return (<Container style={style}>
        <Text style={textStyle}>{message}</Text>
    </Container>);
};