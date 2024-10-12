import React, { useEffect, useState, useMemo } from 'react';
import Graph from './Graph';
import HelloWilliam from './HelloWilliam'; // Import the HelloWilliam component
import { getAuroraRecords } from './dynamodb'; // Import the function

const App: React.FC = () => {
    const [records, setRecords] = useState<{ epochtime: number; value: number; status_id: string }[]>([]);
    const ONE_MONTH_IN_MS = 30 * 24 * 60 * 60; // One month in seconds
    const endTime = Date.now() / 1000; // Current time in seconds
    const startTime = endTime - ONE_MONTH_IN_MS; // Start time for one month ago

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAuroraRecords(startTime, endTime);
                // Log the number of rows retrieved
                console.log(`Retrieved ${data.length} rows from DynamoDB.`);
                
                // Log the most recent 10 rows
                const recentRows = data.slice(-10); // Get the last 10 items
                console.log('Most recent 10 rows:', recentRows);
                
                // Map the data to the required format and sort by epochtime
                const formattedData = data.map(item => ({
                    epochtime: item.epochtime * 1000, // Convert to milliseconds
                    value: item.value,
                    status_id: item.status_id,
                })).sort((a, b) => a.epochtime - b.epochtime); // Sort by epochtime

                console.log('Formatted data:', formattedData.slice(-10)); // Log the last 10 formatted records
                setRecords(formattedData);
            } catch (error) {
                console.error('Error fetching records:', error);
            }
        };

        fetchData();
    }, []); // Run only once when the component mounts

    // Memoize the processed data for performance
    const memoizedRecords = useMemo(() => records, [records]);

    return (
        <div>
            <h1>Random Data Graph</h1>
            <HelloWilliam /> {/* Render the HelloWilliam component */}
            {memoizedRecords.length > 0 ? <Graph data={memoizedRecords} /> : <p>Loading...</p>}
        </div>
    );
};

export default App;
