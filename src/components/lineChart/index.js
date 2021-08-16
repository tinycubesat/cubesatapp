import React from "react";
import { Container, ChartContainer, Text, } from "./styles";
import { Path } from 'react-native-svg'
import { LineChart as Chart, Grid, YAxis, } from 'react-native-svg-charts'

export const LineChart = ({ style, containerChartStyle, dataType, data,formatLabel }) => {
    return (<Container style={style}>
        {dataType&&<Text>{dataType}</Text>}

        <ChartContainer style={containerChartStyle}>
            <YAxis
                data={data}
                svg={{
                    fill: 'grey',
                    fontSize: 10,
                }}
                numberOfTicks={10}
                formatLabel={formatLabel}
            />
            <Chart
                style={{ flex: 1, marginLeft: 16 }}
                data={data}
                svg={{ stroke: 'rgb(134, 65, 244)' }} 
            >
                <Grid />
            </Chart>
        </ChartContainer>
    </Container>);
};