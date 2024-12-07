import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface GraphProps {
    data: { epochtime: number; value: number; statusId: string }[];
}

const Graph: React.FC<GraphProps> = ({ data }) => {
    const colourMap: { [key: string]: string } = {
        'red': '#FF0000',
        'green': '#00FF00',
        'yellow': '#FFFF00',
        'amber': '#FFA500',
    }

    const formattedData = data.map(record => ({
        date: new Date(record.epochtime * 1000).toLocaleString(),
        value: record.value,
        color: colourMap[record.statusId] || '#000000',
    }));

    const minValue = Math.min(...formattedData.map(item => item.value));
    const maxValue = Math.max(...formattedData.map(item => item.value));
    const midpoint = Math.round((minValue + maxValue) / 2);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={70}
                />
                <YAxis 
                    domain={[minValue - 10, maxValue + 10]}
                    ticks={[minValue, midpoint, maxValue]}
                />
                <Tooltip />
                <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#82ca9d"
                    dot={(props) => {
                        const { payload } = props;
                        return (
                            <circle 
                                cx={props.cx} 
                                cy={props.cy} 
                                r={5} 
                                fill={payload.color}
                            />
                        );
                    }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default Graph;
