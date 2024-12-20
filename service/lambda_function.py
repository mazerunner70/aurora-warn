# lambda_function.py
import json
import time
from datetime import datetime, timedelta
import boto3
from graphene import ObjectType, String, Schema, Int, List, Field, Float

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('aurora-warn-uk')

class AuroraEntry(ObjectType):
    epochtime = Int()
    status_id = String()
    value = String()

class Query(ObjectType):
    hello = String(name=String(default_value="stranger"))
    aurora_entries = List(AuroraEntry, days=Int(required=True))

    def resolve_hello(self, info, name):
        return f"Hello, {name}!"

    def resolve_aurora_entries(self, info, days):
        # Calculate the timestamp for 'days' ago
        current_time = int(time.time())
        start_time = current_time - (days * 24 * 60 * 60)
        print("querying for:")
        print(start_time)
        # Query DynamoDB
        response = table.scan(
            FilterExpression='epochtime >= :start_time',
            ExpressionAttributeValues={':start_time': start_time}
        )

        # Process and return the results
        print("Response:")
        print(response)
        entries = []
        for item in response['Items']:
            print(item)
            entries.append(AuroraEntry(
                epochtime=item['epochtime'],
                status_id=item.get('status_id', ''),
                value=item.get('value', '')
            ))

        return entries

# Create the schema
schema = Schema(query=Query)

def lambda_handler(event, context):
    # Debug logging
    print("Event received:", json.dumps(event, indent=2))
    print("Headers:", event.get('headers', {}))
    print("Authorization header:", event.get('headers', {}).get('Authorization', 'No Auth header'))
    
    # Parse the GraphQL query from the event
    print("Event:")
    print(event)
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
    print("Executing GraphQL query:", query)
    # Execute the query
    result = schema.execute(query, variable_values=variables)
    
    # Check for errors
    if result.errors:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
                'Access-Control-Expose-Headers': '*',
                'Access-Control-Max-Age': '3600',
                'Access-Control-Allow-Credentials': 'true'
            },
            'body': json.dumps({'errors': [str(error) for error in result.errors]})
        }
    
    # Return the result with CORS headers
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Access-Control-Expose-Headers': '*',
            'Access-Control-Max-Age': '3600',
            'Access-Control-Allow-Credentials': 'true'
        },
        'body': json.dumps({'data': result.data})
    }
