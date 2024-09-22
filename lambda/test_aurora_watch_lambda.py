import json
import unittest
from unittest.mock import patch
from moto import mock_dynamodb2
import boto3
from aurora_watch_lambda import lambda_handler  # Ensure this import is correct

class TestAuroraWatchLambda(unittest.TestCase):

    @mock_dynamodb2
    def setUp(self):
        # Set up a mock DynamoDB table
        self.dynamodb = boto3.resource('dynamodb', region_name='us-west-2')
        self.table_name = 'aurora-warn-uk'
        self.create_dynamodb_table()

    def create_dynamodb_table(self):
        self.dynamodb.create_table(
            TableName=self.table_name,
            KeySchema=[
                {
                    'AttributeName': 'status_id',
                    'KeyType': 'HASH'  # Partition key
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'status_id',
                    'AttributeType': 'S'  # String type
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )

    @patch('aurora_watch_lambda.urllib.request.urlopen')
    def test_lambda_handler(self, mock_urlopen):
        # Mock the API response
        mock_urlopen.return_value.__enter__.return_value.read.return_value = b"""
        <root>
            <updated>
                <datetime>2023-10-01T12:00:00+00:00</datetime>
            </updated>
            <lower_threshold status_id="1">10</lower_threshold>
            <activity status_id="1">
                <datetime>2023-10-01T12:00:00+00:00</datetime>
                <value>15.5</value>
            </activity>
        </root>
        """

        # Call the lambda_handler function
        response = lambda_handler(None, None)

        # Check the response
        self.assertEqual(response['statusCode'], 200)
        body = json.loads(response['body'])
        self.assertIn('datetime', body)
        self.assertIn('lower_thresholds', body)
        self.assertIn('activities', body)

        # Verify that the activity was written to DynamoDB
        table = self.dynamodb.Table(self.table_name)
        response = table.scan()
        items = response['Items']
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['status_id'], '1')
        self.assertEqual(items[0]['value'], 15.5)

if __name__ == '__main__':
    unittest.main()