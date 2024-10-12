import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

interface GraphProps {
    data: { epochtime: number; value: number; status_id: string }[]; // Changed to an array
}

const Graph: React.FC<GraphProps> = ({ data }) => {
    // Convert epochtime to a readable date format for the X-axis
    const colourMap: { [key: string]: string } = { // Added index signature
        'red': '#FF0000',
        'green': '#00FF00',
        'yellow': '#FFFF00',
        'amber': '#FFA500',
    }
    const formattedData = data.map(record => ({
        date: new Date(record.epochtime).toLocaleDateString(),
        value: record.value,
        color: colourMap[record.status_id] || '#000000', // Default to black if status_id not found
    }));



    // Determine the min and max values for the Y-axis
    const minValue = Math.min(...formattedData.map(item => item.value));
    const maxValue = Math.max(...formattedData.map(item => item.value));

    // Calculate the midpoint
    const midpoint = Math.round((minValue + maxValue) / 2); // Use Math.round() to get an integer

    console.log('Midpoint:', midpoint); // Log the midpoint value

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                    domain={[minValue - 10, maxValue + 10]} // Set domain to cover all data with some padding
                    ticks={[minValue, midpoint, maxValue]} // Show min, mid, and max values
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
                                                fill={payload.color} // Set the dot color based on status_id
                                            />
                                        );
                    }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default Graph;
