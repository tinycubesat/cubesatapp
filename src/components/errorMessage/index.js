import React from "react";
import { Container, Text } from "./styles";

export const ErrorMessage = ({ text, style, textStyle }) => {
    return (<Container style={style}>
        <Text style={textStyle}>{text}</Text>
    </Container>);
};