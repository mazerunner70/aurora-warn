# lambda_function.py
import json
import time
from datetime import datetime, timedelta
import boto3
from graphene import ObjectType, String, Schema, Int, List, Field

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('aurora-warn-uk')

class AuroraEntry(ObjectType):
    epochtime = Int()
    status_id = String()
    value = Int()

class Query(ObjectType):
    hello = String(name=String(default_value="stranger"))
    aurora_entries = List(AuroraEntry, days=Int(required=True))

    def resolve_hello(self, info, name):
        return f"Hello, {name}!"

    def resolve_aurora_entries(self, info, days):
        # Calculate the timestamp for 'days' ago
        current_time = int(time.time())
        start_time = current_time - (days * 24 * 60 * 60)

        # Query DynamoDB
        response = table.scan(
            FilterExpression='epochtime >= :start_time',
            ExpressionAttributeValues={':start_time': start_time}
        )

        # Process and return the results
        entries = []
        for item in response['Items']:
            print(item)
            entries.append(AuroraEntry(
                epochtime=item['epochtime'],
                status_id=item.get('status_id', ''),
                value=int(item.get('value', 0))
            ))

        return entries

# Create the schema
schema = Schema(query=Query)

def lambda_handler(event, context):
    # Parse the GraphQL query from the event
    if 'body' in event:
        # For API Gateway or Lambda Function URL with POST method
        body = json.loads(event['body'])
        query = body.get('query', '')
        variables = body.get('variables', {})
    elif 'queryStringParameters' in event:
        # For API Gateway or Lambda Function URL with GET method
        query = event['queryStringParameters'].get('query', '')
        variables = json.loads(event['queryStringParameters'].get('variables', '{}'))
    else:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No GraphQL query found in the request'})
        }
    
    # Execute the query
    result = schema.execute(query, variable_values=variables)
    
    # Check for errors
    if result.errors:
        return {
            'statusCode': 400,
            'body': json.dumps({'errors': [str(error) for error in result.errors]})
        }
    
    # Return the result as a JSON response
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'data': result.data})
    }
