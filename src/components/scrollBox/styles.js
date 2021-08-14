import styled from "styled-components/native"

export const Container = styled.SafeAreaView`
    width: 300px;
    height: 300px;
    border: 3px solid black;
    border-radius: 15px;
`;

export const ItemContainer = styled.ScrollView`
    width: 100%;
    height: 100%;
    padding: 0px;
`;

export const Item = styled.Text`
    color: black;
    margin: 0px;
    margin-left: 5px;
`;

export const Text = styled.Text`
    color: black;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 25px;
    font-weight: bold;
`;