import AWS from 'aws-sdk';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
console.log(process.env   );
// Configure AWS SDK
AWS.config.update({
    region: process.env.AWS_REGION, // Use the region from environment variables
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, // Use the access key from environment variables
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // Use the secret key from environment variables
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const getAuroraRecords = async (startTime: number, endTime: number) => {
    const params = {
        TableName: 'aurora-warn-uk',
        FilterExpression: '#epochtime BETWEEN :start AND :end',
        ExpressionAttributeNames: {
            '#epochtime': 'epochtime',
            '#val': 'value',  // Map the alias to the actual attribute name
        },
        ExpressionAttributeValues: {
            ':start': startTime,
            ':end': endTime,
        },
        ProjectionExpression: '#epochtime, status_id, #val',  // Use an alias for the reserved word
    };

    try {
        const data = await dynamoDB.scan(params).promise();
        return data.Items || [];
    } catch (error) {
        console.error('Error fetching records from DynamoDB:', error);
        throw new Error('Could not fetch records');
    }
};
