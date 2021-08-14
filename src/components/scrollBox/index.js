import React from "react";
import { Container, ItemContainer, Item, Text } from "./styles";

export const ScrollBox = ({ items, noItemText, containerStyle, itemStyle }) => {
    var id = 0;

    return (<Container style={{ containerStyle }}>
        <ItemContainer>
            {items ? items.map(i => <Item key={(id++).toString()} style={itemStyle}>{i}</Item>) : <Text>{noItemText ? noItemText : "No Items"}</Text>}
        </ItemContainer>
    </Container>);
};